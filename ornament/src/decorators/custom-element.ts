import { customElementMetadataKeys } from '../data';
import { parseCustomElementHtml } from '../utilities';
import { CustomElementError } from '../classes';
import {
  ICustomElementArguments,
  ICustomElementEvenBindingt,
  IObservedProperty
} from '../interfaces';
import {
  invokeCustomElementMixin,
  removeCustomElementMixin
} from 'src/utilities/custom-element-mixin-registry';

export function customElement<T extends HTMLElement>(
  customElementArguments: ICustomElementArguments
) {
  return function customElementDecorator<S extends CustomElementConstructor>(
    customElementClass: S
  ) {
    const template = document.createElement('template');

    if (customElementArguments.tag.trim().length === 0) {
      // TODO
      throw new CustomElementError(
        'customElement constructor error: tag cannot be empty!'
      );
    }

    const templateId = `${customElementArguments.tag}-template`;

    if (customElements.get(customElementArguments.tag)) {
      // TODO
      throw new CustomElementError(
        'customElement constructor error: duplicate custom element tag detected!'
      );
    }

    template.setAttribute('id', templateId);

    template.innerHTML = `${customElementArguments.styles || ''}${
      customElementArguments.html
    }`;

    const customElementHtml = parseCustomElementHtml<T>(
      customElementArguments.html
    );

    const customElementDefintion = class CustomElementDefinition extends customElementClass {
      #attributeChangedCallbackHandlers: Partial<
        Record<
          keyof T & string,
          (oldValue: string | null, newValue: string | null) => void
        >
      > = {};

      readonly #eventBindingListeners = new Map<
        ICustomElementEvenBindingt<T>,
        (event: Event) => void
      >();

      static readonly #mixinBindings = Object.freeze(
        customElementHtml?.mixinBindings ?? []
      );

      static readonly #eventBindings = Object.freeze([
        ...((Reflect.getMetadata(
          customElementMetadataKeys.hostEvents,
          this.constructor.prototype
        ) ?? []) as Readonly<ICustomElementEvenBindingt<T>[]>),
        ...(customElementHtml?.eventBidnings ?? [])
      ]);

      static readonly #observedProperties = Object.freeze<
        IObservedProperty<T>[]
      >(
        (Reflect.getMetadata(
          customElementMetadataKeys.observedProperties,
          this.constructor.prototype
        ) ?? []) as IObservedProperty<T>[]
      );

      static readonly #observedAttributes = Object.freeze(
        this.#observedProperties.map(
          (observedProperty) => observedProperty.attribute
        )
      );

      public static get observedAttributes() {
        return this.#observedAttributes;
      }

      public attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
      ) {
        if (oldValue !== newValue) {
          const observedProperty =
            customElementDefintion.#observedProperties.find(
              (op) => op.attribute === name
            );

          if (observedProperty) {
            this.#attributeChangedCallbackHandlers[observedProperty.property]?.(
              oldValue,
              newValue
            );
          } else {
            const mixin = customElementDefintion.#mixinBindings.find(
              (m) => m.name === name
            );

            if (mixin) {
              const htmlElement = (
                mixin.querySelector
                  ? this.shadowRoot?.querySelector(mixin.querySelector)
                  : this
              ) as HTMLElement;

              if (htmlElement) {
                invokeCustomElementMixin(
                  oldValue,
                  newValue,
                  mixin.name,
                  htmlElement
                );
              }
            }
          }
        }
      }

      public connectedCallback() {
        customElementDefintion.#eventBindings.forEach((eventBinding) => {
          let eventBindingListener =
            this.#eventBindingListeners.get(eventBinding);

          if (!eventBindingListener) {
            const classMethod = this[eventBinding.propertyKey as keyof this];

            if (typeof classMethod === 'function') {
              eventBindingListener = (event: Event) => classMethod(event);
            }
          }

          if (eventBindingListener) {
            if (eventBinding.querySelector) {
              const element = this.shadowRoot?.querySelector(
                eventBinding.querySelector
              );

              if (element) {
                element.addEventListener(
                  eventBinding.type,
                  eventBindingListener,
                  eventBinding.options
                );
              }
            } else {
              this.addEventListener(
                eventBinding.type,
                eventBindingListener,
                eventBinding.options
              );
            }
          }
        });
      }

      public disconnectedCallback() {
        customElementDefintion.#eventBindings.forEach((eventBinding) => {
          const eventBindingListener =
            this.#eventBindingListeners.get(eventBinding);

          if (eventBindingListener) {
            if (eventBinding.querySelector) {
              const element = this.shadowRoot?.querySelector(
                eventBinding.querySelector
              );

              if (element) {
                element.removeEventListener(
                  eventBinding.type,
                  eventBindingListener,
                  eventBinding.options
                );
              }
            } else {
              this.removeEventListener(
                eventBinding.type,
                eventBindingListener,
                eventBinding.options
              );
            }
          }
        });

        customElementDefintion.#mixinBindings.forEach((mixingbinding) => {
          const htmlElement = (
            mixingbinding.querySelector
              ? this.shadowRoot?.querySelector(mixingbinding.querySelector)
              : this
          ) as HTMLElement;

          if (htmlElement) {
            removeCustomElementMixin(mixingbinding.name, htmlElement);
          }
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      constructor(...args: any[]) {
        super(...args);

        const shadowRoot = this.attachShadow({
          mode: 'open'
        });

        shadowRoot.appendChild(template.content.cloneNode(true));
      }
    };

    customElements.define(customElementArguments.tag, customElementDefintion);
    document.body.appendChild(template);

    return customElementDefintion;
  };
}

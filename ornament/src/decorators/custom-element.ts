import { CustomElementError } from '../classes';
import { ICustomElementArguments } from '../interfaces';

export function customElement<T extends string>(
  customElementArguments: ICustomElementArguments<T>
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

    const customElementDefintion = class CustomElementDefinition extends customElementClass {
      #attributeChangedCallbackHandlers: Partial<
        Record<T, (oldValue: string | null, newValue: string | null) => void>
      > = {};

      public static get observedAttributes() {
        return customElementArguments.observedAttributes ?? [];
      }

      public attributeChangedCallback(
        name: T,
        oldValue: string | null,
        newValue: string | null
      ) {
        if (oldValue !== newValue) {
          this.#attributeChangedCallbackHandlers[name]?.(oldValue, newValue);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      constructor(..._: any[]) {
        super(..._);

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

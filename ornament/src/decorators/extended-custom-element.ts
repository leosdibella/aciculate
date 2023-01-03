import { customElementMetadataKeys } from '../data';
import {
  IExtendedCustomElementArguments,
  IObservedProperty
} from '../interfaces';

export function extendedCustomElement<T extends HTMLElement>(
  extendedCustomElementArguments: IExtendedCustomElementArguments
) {
  return function extendedCustomElementDecorator<
    S extends CustomElementConstructor
  >(customElement: S) {
    const extendedCustomElementDefintion = class GalExtendedCustomElementDefintion extends customElement {
      #attributeChangedCallbackHandlers: Partial<
        Record<
          keyof T & string,
          (oldValue: string | null, newValue: string | null) => void
        >
      > = {};

      private static _observedProperties: Readonly<IObservedProperty<T>[]>;
      private static _observedAttributes: Readonly<string[]>;

      public static get observedAttributes() {
        if (!this._observedProperties) {
          this._observedProperties = Object.freeze<IObservedProperty<T>[]>(
            (Reflect.getMetadata(
              customElementMetadataKeys.observedProperties,
              this.constructor.prototype
            ) ?? []) as IObservedProperty<T>[]
          );

          this._observedAttributes = Object.freeze(
            this._observedProperties.map(
              (observedProperty) => observedProperty.attribute
            )
          );
        }

        return this._observedAttributes;
      }

      public attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
      ) {
        if (oldValue !== newValue) {
          const observedProperty =
            extendedCustomElementDefintion._observedProperties.find(
              (op) => op.attribute === name
            );

          if (observedProperty) {
            this.#attributeChangedCallbackHandlers[observedProperty.property]?.(
              oldValue,
              newValue
            );
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(args);
      }
    };

    customElements.define(
      extendedCustomElementArguments.is,
      extendedCustomElementDefintion,
      { extends: extendedCustomElementArguments.extends }
    );

    return extendedCustomElementDefintion;
  };
}

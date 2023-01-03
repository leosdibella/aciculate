import 'reflect-metadata';
import { IObservedProperty } from '../interfaces';
import { customElementMetadataKeys } from '../data';
import { camelCaseToKebabCase } from '@all/utilities';

export function observedAttribute<T extends HTMLElement>(): PropertyDecorator {
  return function observedAttributeDecorator(
    target: T,
    propertyKey: string & keyof T
  ) {
    const observedProperties: Readonly<IObservedProperty<T>[]> =
      Reflect.getMetadata(
        customElementMetadataKeys.observedProperties,
        target
      ) ?? [];

    Reflect.defineMetadata(
      customElementMetadataKeys.observedProperties,
      Object.freeze([
        ...observedProperties,
        {
          attribute: camelCaseToKebabCase(propertyKey),
          property: propertyKey
        }
      ]),
      target
    );
  };
}

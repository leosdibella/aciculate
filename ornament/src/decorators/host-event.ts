import { ICustomElementEvenBindingt } from 'src/interfaces';
import { customElementMetadataKeys } from '../data';

export function hostEvent<T extends HTMLElement>(
  type: keyof HTMLElementEventMap,
  options?: boolean | AddEventListenerOptions
): MethodDecorator {
  return function hostEventDecorator(
    target: T,
    propertyKey: Extract<keyof T, string>,
    descriptor: PropertyDescriptor
  ) {
    const hostEventBindings: Readonly<ICustomElementEvenBindingt<T>[]> =
      Reflect.getMetadata(
        customElementMetadataKeys.hostEvents,
        target.constructor
      ) ?? [];

    Reflect.defineMetadata(
      customElementMetadataKeys.hostEvents,
      Object.freeze([
        ...hostEventBindings,
        {
          type,
          options,
          propertyKey
        }
      ]),
      target.constructor
    );

    return descriptor;
  };
}

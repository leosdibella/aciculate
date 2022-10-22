import { registry } from '../utilities';

export function deferInject(token: symbol): PropertyDecorator {
  return function deferInjectDecorator(
    target: Record<string, unknown>,
    propertyKey: string
  ) {
    let injectedValue: unknown;

    const getInjected = function getInjected() {
      if (!injectedValue) {
        injectedValue = registry.construct(token);
      }

      return injectedValue;
    };

    const setInjected = function setInjected(value: unknown) {
      injectedValue = value;
    };

    Object.defineProperty(target, propertyKey, {
      get: getInjected,
      set: setInjected
    });
  };
}

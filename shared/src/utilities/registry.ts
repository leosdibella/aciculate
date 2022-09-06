import { IRegistry, IRegistryValue } from '../interfaces';

const registryValues: Partial<Record<string, IRegistryValue>> = {};

function inject<U>(key: string): U | undefined;
function inject<U>(key: string, defaultValue: U): U;
function inject<U>(
  key: string,
  defaultValue: () => U,
  isFactoryMethod: true
): U;
function inject<U>(
  key: string,
  defaultValue?: (() => U) | U,
  isFactoryMethod = false
) {
  const registryValue = registryValues[key] as IRegistryValue<U> | undefined;

  if (registryValue !== undefined) {
    return registryValue.isFactoryMethod
      ? (registryValue.value as () => U)()
      : (registryValue.value as U);
  } else if (typeof defaultValue === 'function' && isFactoryMethod) {
    return (defaultValue as () => U)() as U;
  }

  return defaultValue as U | undefined;
}

function provide<U>(key: string, value?: U): void;
function provide<U>(key: string, value: () => U, isFactoryMethod: true): void;
function provide<U>(
  key: string,
  value: U | (() => U),
  isFactoryMethod = false
): void {
  if (value === undefined) {
    registryValues[key] = undefined;
  } else {
    registryValues[key] = {
      isFactoryMethod,
      value
    };
  }
}

function provideMany(provisions: Partial<Record<string, IRegistryValue>>) {
  Object.keys(provisions).forEach((p) => {
    registryValues[p] = provisions[p];
  });
}

export const registry: IRegistry = {
  inject,
  provide,
  provideMany
};

export function getTypedRegistry<
  T extends string,
  S extends Record<T, unknown>
>(): IRegistry<T, S> {
  return {
    inject,
    provide,
    provideMany
  };
}

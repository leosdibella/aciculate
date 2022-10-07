import { ApiError } from '../classes';
import { Constructor } from '../types';
import { IInjection, IRegistry, IRegistryValue } from '../interfaces';
import 'reflect-metadata';
import { injectMetadataKey } from 'src/decorators';

const registryValues: Partial<Record<symbol, IRegistryValue>> = {};

function inject<U>(key: symbol): U | undefined;
function inject<U>(key: symbol, defaultValue: U): U;
function inject<U>(
  key: symbol,
  defaultValue: () => U,
  isFactoryMethod: true
): U;
function inject<U>(
  key: symbol,
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

function provide<U>(key: symbol, value?: U): void;
function provide<U>(key: symbol, value: () => U, isFactoryMethod: true): void;
function provide<U>(
  key: symbol,
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

function provideMany(provisions: Partial<Record<symbol, IRegistryValue>>) {
  Object.getOwnPropertySymbols(provisions).forEach((p) => {
    registryValues[p] = provisions[p];
  });
}

function resolveParameters<U>(
  constructor: Constructor<U>,
  runtimeDependencies: Readonly<Record<symbol, IRegistryValue>>,
  created: symbol[]
) {
  const resolvedParameters: unknown[] = [...Array(constructor.length)];

  const injections: IInjection[] =
    Reflect.getMetadata(injectMetadataKey, constructor) ?? [];

  injections.forEach((i) => {
    const runtimeDependency = runtimeDependencies[i.token];

    if (runtimeDependency !== undefined) {
      const runtimeDependencyValue = runtimeDependency.value;

      if (
        typeof runtimeDependencyValue === 'function' &&
        runtimeDependencyValue.prototype
      ) {
        created.push(i.token);
      } else {
        resolvedParameters[i.parameterIndex] = runtimeDependency.isFactoryMethod
          ? (runtimeDependencyValue as () => unknown)()
          : runtimeDependency;
      }
    } else {
      const dependency = registryValues[i.token];

      if (dependency) {
        
      }
    }
  });

  return resolvedParameters;
}

function _create<U>(
  key: symbol,
  runtimeDependencies: Readonly<Record<symbol, IRegistryValue>> = {},
  created: symbol[] = []
): U {
  const registryValue = registryValues[key] as IRegistryValue<Constructor<U>>;

  if (!registryValue) {
    // TODO
    throw new ApiError([

    ]);
  }

  const constructor = registryValue.value as Constructor<U>;

  if (typeof constructor !== 'function') {
    // TODO
    throw new ApiError([

    ]);
  }

  if (!constructor.prototype) {
    // TODO
    throw new ApiError([

    ]);
  }

  const resolvedParameters = resolveParameters(
    constructor,
    runtimeDependencies,
    created
  );

  // eslint-disable-next-line new-cap
  return new constructor(...resolvedParameters);
}

function create<U>(
  key: symbol,
  runtimeDependencies?: Readonly<Record<symbol, IRegistryValue>>
): U {
  return _create(key, runtimeDependencies, [key]);
}

export const registry: IRegistry = {
  inject,
  provide,
  provideMany,
  create
};

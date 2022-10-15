import { ApiError, DirectedAcyclicGraph } from '../classes';
import { Constructor } from '../types';
import {
  IDependency,
  IInjection,
  IRegistry,
  IRegistryValue
} from '../interfaces';
import { injectMetadataKey } from '../decorators';
import { ApiErrorCode } from '../enums';

const registryValues: Partial<Record<symbol, IRegistryValue>> = {};

function inject<U>(token: symbol): U | undefined;
function inject<U>(token: symbol, defaultValue: U): U;
function inject<U>(
  token: symbol,
  defaultValue: () => U,
  isFactoryMethod: true
): U;
function inject<U>(
  token: symbol,
  defaultValue?: (() => U) | U,
  isFactoryMethod = false
) {
  const registryValue = registryValues[token] as IRegistryValue<U> | undefined;

  if (registryValue !== undefined) {
    return registryValue.isFactoryMethod
      ? (registryValue.value as () => U)()
      : (registryValue.value as U);
  } else if (typeof defaultValue === 'function' && isFactoryMethod) {
    return (defaultValue as () => U)() as U;
  }

  return defaultValue as U | undefined;
}

function provide<U>(token: symbol, value?: U): void;
function provide<U>(token: symbol, value: () => U, isFactoryMethod: true): void;
function provide<U>(
  token: symbol,
  value: U | (() => U),
  isFactoryMethod = false
): void {
  if (value === undefined) {
    registryValues[token] = undefined;
  } else {
    registryValues[token] = {
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

function _resolveRegistryValue<U>(
  token: symbol,
  isOptional: boolean,
  runtimeDependencies: Readonly<Record<symbol, IRegistryValue>>
) {
  const registryValue = (registryValues[token] ??
    runtimeDependencies[token]) as IRegistryValue<U> | undefined;

  if (isOptional) {
    return registryValue;
  }

  if (!registryValue) {
    // TODO
    throw new ApiError([
      {
        errorCode: ApiErrorCode.nonOptionalDependency,
        message: `Value with token: ${token.description} as not marked as optional, but has no defined value, dependency injectioon failed.`
      }
    ]);
  }

  if (registryValue.isFactoryMethod) {
    if (typeof registryValue.value !== 'function') {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.nonFunction,
          message: `Value with token: ${token.description} is not a function, dependency injection failed.`
        }
      ]);
    }
  } else if (registryValue.isConstructor) {
    const constructor = registryValue.value as Constructor<U>;

    if (typeof constructor !== 'function' || !constructor.prototype) {
      throw new ApiError([
        {
          errorCode: ApiErrorCode.nonConstructor,
          message: `Value with token: ${token.description} is not a constructor, dependency injection failed.`
        }
      ]);
    }
  }

  return registryValue;
}

function _resolveInjections<U>(constructor: Constructor<U>): IInjection[] {
  return Reflect.getMetadata(injectMetadataKey, constructor) ?? [];
}

function _generateDependencyGraph(
  token: symbol,
  constructor: Constructor,
  runtimeDependencies: Readonly<Record<symbol, IRegistryValue>>
): DirectedAcyclicGraph<IDependency> {
  const dag = new DirectedAcyclicGraph<IDependency>({
    verify: true,
    vertexToString: (dependecy) => dependecy.constructor.name,
    areEqualVertices: (dependency1: IDependency, dependecy2: IDependency) =>
      dependency1.constructor === dependecy2.constructor
  });

  const dependencies: IDependency[] = [
    {
      token,
      constructor,
      injections: _resolveInjections(constructor)
    }
  ];

  while (dependencies.length) {
    const dependency = dependencies.pop()!;
    const index = dag.addVertex(dependency);

    dependency.injections.forEach((injection) => {
      const registryValue = _resolveRegistryValue(
        injection.token,
        injection.isOptional,
        runtimeDependencies
      );

      if (registryValue?.isConstructor) {
        const nextConstructor = registryValue.value as Constructor;

        const nextDependency: IDependency = {
          token: injection.token,
          constructor: nextConstructor,
          injections: _resolveInjections(nextConstructor)
        };

        const nextIndex = dag.addVertex(nextDependency);

        dag.addEdge(index, nextIndex);
        dependencies.push(nextDependency);
      }
    });
  }

  return dag;
}

function _sortInjections(a: IInjection, b: IInjection) {
  return a.parameterIndex >= b.parameterIndex ? 1 : -1;
}

function construct<U>(
  token: symbol,
  runtimeDependencies: Readonly<Record<symbol, IRegistryValue>> = {}
): U {
  const registryValue = _resolveRegistryValue(
    token,
    false,
    runtimeDependencies
  )! as IRegistryValue<Constructor<U>>;

  if (!registryValue.isConstructor) {
    // TODO
    throw new ApiError([]);
  }

  const dag = _generateDependencyGraph(
    token,
    registryValue.value as Constructor<U>,
    runtimeDependencies
  );

  const topologicallySorted = dag.topologicallySorted;
  const constructed: Record<symbol, unknown> = {};

  while (topologicallySorted.length) {
    const dependency = topologicallySorted.pop()!;

    const parameters: unknown[] = dependency.injections
      .sort(_sortInjections)
      .map((injection) => {
        const nextRegistryValue = _resolveRegistryValue(
          injection.token,
          injection.isOptional,
          runtimeDependencies
        );

        if (!nextRegistryValue) {
          return undefined;
        }

        if (nextRegistryValue.isConstructor) {
          return constructed[injection.token];
        }

        if (nextRegistryValue.isFactoryMethod) {
          return (nextRegistryValue.value as () => unknown)();
        }

        return nextRegistryValue.value;
      });

    constructed[dependency.token] = new dependency.constructor(...parameters);
  }

  return constructed[token] as U;
}

export const registry: IRegistry = {
  inject,
  provide,
  provideMany,
  construct
};

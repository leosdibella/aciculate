import { IRegistryValue } from './registry-value';

export interface IRegistry<
  T extends symbol = symbol,
  S extends Partial<Record<T, unknown>> = Partial<Record<T, unknown>>
> {
  inject<U extends S[T]>(token: T): U | undefined;
  inject<U extends S[T]>(token: T, defaultValue: U): U;
  inject<U extends S[T]>(
    token: T,
    defaultValue: () => U,
    isFactoryMethod: true
  ): U;
  provide<U extends S[T]>(token: T, value: U): void;
  provide<U extends S[T]>(
    token: T,
    value: () => U,
    isFactoryMethod: true
  ): void;
  provideMany<U extends Partial<Record<T, IRegistryValue>>>(
    provisions: U
  ): void;
  construct<U extends S[T]>(
    token: T,
    runtimeDependencies?: Readonly<Record<symbol, IRegistryValue>>
  ): U;
}

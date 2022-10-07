import { IRegistryValue } from './registry-value';

export interface IRegistry<
  T extends symbol = symbol,
  S extends Partial<Record<T, unknown>> = Partial<Record<T, unknown>>
> {
  inject<U extends S[T]>(key: T): U | undefined;
  inject<U extends S[T]>(key: T, defaultValue: U): U;
  inject<U extends S[T]>(
    key: T,
    defaultValue: () => U,
    isFactoryMethod: true
  ): U;
  provide<U extends S[T]>(key: T, value: U): void;
  provide<U extends S[T]>(key: T, value: () => U, isFactoryMethod: true): void;
  provideMany<U extends Partial<Record<T, IRegistryValue>>>(
    provisions: U
  ): void;
  create<U extends S[T]>(
    key: T,
    runtimeDependencies?: Readonly<Record<symbol, IRegistryValue>>
  ): U;
}

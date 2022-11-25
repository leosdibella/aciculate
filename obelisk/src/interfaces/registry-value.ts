export interface IRegistryValue<T = unknown> {
  isFactoryMethod?: boolean;
  isConstructor?: boolean;
  value: (() => T) | T;
}

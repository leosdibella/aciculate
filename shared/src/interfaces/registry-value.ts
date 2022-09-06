export interface IRegistryValue<T = unknown> {
  isFactoryMethod?: boolean;
  value: (() => T) | T;
}

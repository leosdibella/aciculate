export interface ICustomElementEventBinding<T extends HTMLElement> {
  readonly type: keyof HTMLElementEventMap;
  readonly options?: boolean | AddEventListenerOptions;
  readonly propertyKey: keyof T & string;
  readonly querySelector?: string;
}

export interface ICustomElementMixin<T = unknown> {
  readonly name: string;
  action(
    oldValue: string | null,
    newValue: string | null,
    htmlElement: HTMLElement,
    previousReturnValue?: T
  ): T;
}

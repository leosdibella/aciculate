export interface IObservedProperty<T extends HTMLElement> {
  attribute: string;
  property: keyof T;
}

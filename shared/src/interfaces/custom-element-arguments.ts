export interface ICustomElementArguments<T> {
  tag: string;
  html: string;
  observedAttributes?: T[];
  styles?: string;
}

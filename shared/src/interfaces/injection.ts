export interface IInjection {
  readonly token: symbol;
  readonly propertyKey: string | symbol;
  readonly parameterIndex: number;
}

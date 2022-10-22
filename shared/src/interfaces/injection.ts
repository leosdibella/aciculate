export interface IInjection {
  readonly token: symbol;
  readonly parameterIndex: number;
  readonly isOptional: boolean;
}

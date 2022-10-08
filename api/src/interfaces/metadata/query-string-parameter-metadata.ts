export interface IQueryStringParameterMetadata {
  readonly parameterIndex: number;
  readonly name: string;
  valueCoercer?(value: string): unknown;
}

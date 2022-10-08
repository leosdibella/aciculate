export interface IRouteParameterMetadata {
  readonly parameterIndex: number;
  readonly name: string;
  valueCoercer?(value: string): unknown;
}

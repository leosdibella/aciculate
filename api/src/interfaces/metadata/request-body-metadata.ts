export interface IRequestBodyMetadata {
  readonly parameterIndex: number;
  validator?(data: unknown): void;
}

export enum ApiErrorCode {
  databaseInsertError = 'databaseInsertError',
  databaseUpdateError = 'databaseUpdateError',
  databaseLookupError = 'databaseLookupError',
  databaseDeleteError = 'databaseDeleteError',
  unexpectedHttpFailure = 'unexpectedHttpFailure',
  datbaseSchemaConfigurationError = 'datbaseSchemaConfigurationError',
  databseSchemaValidationError = 'databseSchemaValidationError',
  databaseOptimisticConcurencyError = 'databaseOptimisticConcurencyError',
  insufficientPermissionsError = 'insufficientPermissionsError',
  invalidToken = 'invalidToken',
  duplicateRouteDefintion = 'duplicateRouteDefintion',
  circularDependency = 'circularDependency',
  nonConstructor = 'nonConstructor',
  nonFunction = 'nonFunction',
  nonOptionalDependency = 'nonOptionalDependency'
}

import {
  ControllerName,
  ContextName,
  ServiceName,
  DatabaseDependency,
  HttpDependency,
  ApplicationDependency
} from '@enums';

export type DependencyInjectionTokenKey =
  | ControllerName
  | ContextName
  | ServiceName
  | DatabaseDependency
  | HttpDependency
  | ApplicationDependency;

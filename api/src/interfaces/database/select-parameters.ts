import { EntityName } from '@enums';

export interface ISelectParameters<T extends EntityName> {
  entityName: T;
  organizationId?: string;
  skip?: number;
  take?: number;
  orderBy?: Extract<keyof T, string>;
  orderByDescending?: boolean;
}

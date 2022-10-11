import { EntityName } from '@enums';

export interface IForeignKey {
  readonly entityName: EntityName;
  readonly fieldName?: string;
  readonly cascadeOnDelete?: true;
}

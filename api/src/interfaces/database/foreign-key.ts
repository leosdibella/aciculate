import { DbTableName } from '@enums';

export interface IForeignKey {
  readonly tableName: DbTableName;
  readonly columnName?: string;
  readonly cascadeOnDelete?: true;
}

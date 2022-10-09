import { DbTableName } from '@enums';

export interface IForeignKey {
  readonly foreignKeyTable: DbTableName;
  readonly foreignKeyColumn: string;
  readonly cascadeOnDelete?: true;
}

export interface IDbTableBase {
  id?: string;
  createdDate?: Date | string;
  updatedDate?: Date | string;
  deleted?: boolean;
}
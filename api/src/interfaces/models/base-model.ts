export interface IBaseModel {
  readonly id: string;
  readonly createdDate: Date;
  readonly updatedDate: Date;
  readonly deleted: boolean;
  readonly createdBy: string;
  readonly updatedBy: string;
}

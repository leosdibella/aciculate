export interface IBaseModel {
  readonly id: string;
  readonly createdDate: Date | string;
  readonly updatedDate: Date | string;
  readonly deleted: boolean;
  readonly createdBy: string;
  readonly updatedBy: string;
}

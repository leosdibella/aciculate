import { IBaseModel, IDbEntity } from '../interfaces';

export type DbEntity<T extends Partial<IBaseModel>> = IDbEntity<T> & T;

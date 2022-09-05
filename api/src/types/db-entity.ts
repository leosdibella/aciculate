import { IBaseEntity, IDbEntity } from '../interfaces';

export type DbEntity<T extends Partial<IBaseEntity>> = IDbEntity<T> & T;

import { IBaseModel, IEntity } from '@interfaces';

export type Entity<T extends IBaseModel> = IEntity<T> & Readonly<Partial<T>>;

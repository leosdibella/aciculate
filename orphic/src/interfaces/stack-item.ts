import { ReferenceType } from '@all/types';
import { ReferenceTypeName } from '../enums';

export interface IStackItem {
  path: string[];
  pathTypeNames: ReferenceTypeName[];
  reference: ReferenceType;
}

import { ReferenceTypeName } from '../enums';

export interface ITravsersalKey {
  path: string[];
  pathTypeNames: ReferenceTypeName[];
  existingReferencePath?: string[];
}

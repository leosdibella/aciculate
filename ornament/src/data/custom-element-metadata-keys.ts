import { CustomElementMetadataKeyName } from '../enums';

const observedProperties = Symbol('observedProperties');
const hostEvents = Symbol('hostEvents');

export const customElementMetadataKeys = Object.freeze<
  Record<CustomElementMetadataKeyName, symbol>
>({
  observedProperties,
  hostEvents
});

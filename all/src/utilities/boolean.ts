export function attributeToBoolean(attribute: unknown) {
  return (
    attribute !== undefined && attribute !== null && `${attribute}` !== 'false'
  );
}

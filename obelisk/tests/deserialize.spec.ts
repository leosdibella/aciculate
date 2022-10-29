import { obelisk } from '../src/utilities';
import { expect } from 'chai';
import 'mocha';

describe('Deserialize reference values', () => {
  it('should handle arrays', () => {
    const serialized = '[//]';
    const deserialized = obelisk.deserialize(serialized) as unknown[];

    expect(deserialized[0]).to.equal(deserialized);
  });

  it('should handle objects', () => {
    const serialized = '{"a"://}';

    const deserialized = obelisk.deserialize(serialized) as Record<
      string,
      unknown
    >;

    expect(deserialized.a).to.equal(deserialized);
  });
});

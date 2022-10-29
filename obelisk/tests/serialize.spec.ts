/* eslint-disable @typescript-eslint/no-magic-numbers */
import { obelisk } from '../src/utilities';
import { expect } from 'chai';
import 'mocha';

describe('Serialize primitives', () => {
  it('should returns "undefined"', () => {
    const serialized = obelisk.serialize(undefined);

    expect(serialized).to.equal('undefined');
  });

  it('should handle null', () => {
    const serialized = obelisk.serialize(null);

    expect(serialized).to.equal('null');
  });

  it('should handle true', () => {
    const serialized = obelisk.serialize(true);

    expect(serialized).to.equal('true');
  });

  it('should handle false', () => {
    const serialized = obelisk.serialize(false);

    expect(serialized).to.equal('false');
  });

  it('should handle Infinity', () => {
    const serialized = obelisk.serialize(Infinity);

    expect(serialized).to.equal('Infinity');
  });

  it('should handle -Infinity', () => {
    const serialized = obelisk.serialize(-Infinity);

    expect(serialized).to.equal('-Infinity');
  });

  it('should handle NaN', () => {
    const serialized = obelisk.serialize(NaN);

    expect(serialized).to.equal('NaN');
  });

  it('should handle integers', () => {
    const serialized = obelisk.serialize(105);

    expect(serialized).to.equal('105');
  });

  it('should handle floating points', () => {
    const serialized = obelisk.serialize(1e-4);

    expect(serialized).to.equal('0.0001');
  });

  it('should handle big ints', () => {
    const serialized = obelisk.serialize(BigInt(734));

    expect(serialized).to.equal('n734n');
  });

  it('should handles dates', () => {
    const today = new Date();
    const serialized = obelisk.serialize(today);

    expect(serialized).to.equal(`@${JSON.stringify(today)}@`);
  });
});

describe('Serialize reference values', () => {
  it('should handle arrays', () => {
    const circular: unknown[] = [];

    circular.push(circular);

    const serialized = obelisk.serialize(circular);

    expect(serialized).to.equal('[//]');
  });

  it('should handle objects', () => {
    const circular: Record<string, unknown> = {};

    circular.a = circular;

    const serialized = obelisk.serialize(circular);

    expect(serialized).to.equal('{"a"://}');
  });
});

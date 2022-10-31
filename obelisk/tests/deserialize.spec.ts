/* eslint-disable @typescript-eslint/no-magic-numbers */
import { obelisk } from '../src/utilities';
import { expect } from 'chai';
import 'mocha';

describe('Deserialize primitive values', () => {
  it('should handle dates', () => {
    const date = new Date();
    obelisk.serialize(date);

    expect(
      (obelisk.deserialize(obelisk.serialize(date) ?? '') as Date).getTime()
    ).to.equal(date.getTime());
  });

  it('should handle big ints', () => {
    const bigInts = [BigInt(12345), BigInt(-987423)];

    bigInts.forEach((bi) => {
      expect(obelisk.deserialize(obelisk.serialize(bi) ?? '')).to.equal(bi);
    });
  });

  it('should handle null', () => {
    expect(obelisk.deserialize(obelisk.serialize(null) ?? '')).to.equal(null);
  });

  it('should handle undefined', () => {
    expect(obelisk.deserialize(obelisk.serialize(undefined) ?? '')).to.equal(
      undefined
    );
  });

  it('should handle Infinity', () => {
    expect(obelisk.deserialize(obelisk.serialize(Infinity) ?? '')).to.equal(
      Infinity
    );
  });

  it('should handle -Infinity', () => {
    expect(obelisk.deserialize(obelisk.serialize(-Infinity) ?? '')).to.equal(
      -Infinity
    );
  });

  it('should handle NaN', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(obelisk.deserialize(obelisk.serialize(NaN) ?? '')).to.be.NaN;
  });

  it('should handle booleans', () => {
    const booleans = [true, false];

    booleans.forEach((b) => {
      expect(obelisk.deserialize(obelisk.serialize(b) ?? '')).to.equal(b);
    });
  });

  it('should handle integers', () => {
    const integers = [124, -123124, 13, 11100099123];

    integers.forEach((int) => {
      expect(obelisk.deserialize(obelisk.serialize(int) ?? '')).to.equal(int);
    });
  });

  it('should handle floating point numbers', () => {
    const float = 1123.123124;
    const float2 = 93e-42;

    expect(obelisk.deserialize(obelisk.serialize(float) ?? '')).to.equal(float);

    expect(obelisk.deserialize(obelisk.serialize(float2) ?? '')).to.equal(
      float2
    );
  });

  it('should handle strings', () => {
    const strings = [
      '""""""',
      '123ffgsdgggs!!@$!@%#%^$&%&%^*&^(%$#W$@$//////////',
      '{}{}[][[][]2352535'
    ];

    strings.forEach((string) => {
      expect(obelisk.deserialize(obelisk.serialize(string) ?? '')).to.equal(
        string
      );
    });
  });
});

describe('Deserialize reference values', () => {
  it('should handle circular arrays', () => {
    const serialized = '[//]';
    const deserialized = obelisk.deserialize(serialized) as unknown[];

    expect(deserialized[0]).to.equal(deserialized);
  });

  it('should handle circular objects', () => {
    const serialized = '{"a"://}';

    const deserialized = obelisk.deserialize(serialized) as Record<
      string,
      unknown
    >;

    expect(deserialized.a).to.equal(deserialized);
  });

  it('should handle any number of levels of circular referencing', () => {
    const references: Record<string, unknown> = {};
    const firstLevel: unknown[] = [];

    references.a = firstLevel;
    firstLevel.push(references);

    const deserialized = obelisk.deserialize(
      obelisk.serialize(references) ?? ''
    );

    expect(references).to.deep.equal(deserialized);
  });

  it('should handle generic objects', () => {
    const subTest = {
      a: 1,
      b: new Date()
    };

    const anotherTest = [Number('1e-4'), BigInt('75'), undefined];
    const otherTest: Record<string, unknown> = {};
    const loopingTestA: unknown[] = [];
    const loopingTestB: Record<string, unknown> = { u: loopingTestA };
    const lastTest: unknown[] = [];

    loopingTestA.push(loopingTestB);

    otherTest.r = otherTest;
    otherTest.s = otherTest;

    lastTest.push(lastTest);

    const test = {
      c: [subTest],
      d: subTest,
      e: {
        f: undefined,
        g: null,
        h: -Infinity,
        i: Infinity,
        j: NaN,
        k: BigInt(1),
        l: 'string',
        m: true,
        n: false,
        o: [1, 2, subTest, []],
        p: anotherTest,
        q: otherTest,
        t: lastTest,
        v: loopingTestA
      }
    };

    const serialized = obelisk.serialize(test);
    const deserialized = obelisk.deserialize(serialized ?? '');

    expect(test).to.deep.equal(deserialized);
  });
});

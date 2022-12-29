/* eslint-disable @typescript-eslint/no-magic-numbers */
import { deepCopy } from '../src/utilities';
import { expect } from 'chai';
import 'mocha';

describe('Be able to evaluate whether two values are deeply equal', () => {
  it('should handle dates', () => {
    const date1 = new Date();
    const date2 = deepCopy(date1);

    expect(date1).not.equals(date2);
    expect(date1).to.deep.equal(date1);
  });

  it('should handle strings', () => {
    const string1 = 'a string is here';
    const string2 = deepCopy(string1);

    expect(string1).to.deep.equal(string2);
  });

  it('should handle booleans', () => {
    const bool1 = true;
    const bool2 = deepCopy(bool1);

    expect(bool1).to.deep.equal(bool2);
  });

  it('should handle numbers', () => {
    const number1 = 12345.9876;
    const number2 = deepCopy(number1);

    expect(number1).to.deep.equal(number2);
  });

  it('should handle arrays', () => {
    const array1 = [1, 'ok', true, {}];
    const array2 = deepCopy(array1);

    expect(array1).to.deep.equal(array2);
  });

  it('should handle objects', () => {
    const object1 = { a: 1, b: new Date(), c: 'ok', d: true, e: [[], {1: 'abc', cool: false}] };
    const object2 = deepCopy(object1);

    expect(object1).to.deep.equal(object2);
  });
});

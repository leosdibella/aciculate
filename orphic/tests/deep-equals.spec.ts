/* eslint-disable @typescript-eslint/no-magic-numbers */
import { deepEquals } from '../src/utilities';
import { expect } from 'chai';
import 'mocha';

describe('Be able to evaluate whether two values are deeply equal', () => {
  it('should handle dates', () => {
    const date1 = new Date();
    const date2 = new Date(date1.getTime());

    expect(date1).not.equals(date2);
    expect(deepEquals(date1, date2)).to.be.true;
  });

  it('should handle strings', () => {
    const string1 = 'a string is here';
    const string2 = 'a string is here';

    expect(deepEquals(string1, string2)).to.be.true;
  });

  it('should handle booleans', () => {
    const bool1 = true;
    const bool2 = true;

    expect(deepEquals(bool1, bool2)).to.be.true;
  });

  it('should handle numbers', () => {
    const number1 = 12345.9876;
    const number2 = 12345.9876;

    expect(deepEquals(number1, number2)).to.be.true;
  });

  it('should handle arrays', () => {
    const array1 = [1, 'ok', true, {}];
    const array2 = [1, 'ok', true, {}];
    const array3 = [1, true, 'ok', {}];

    expect(deepEquals(array1, array2)).to.be.true;
    expect(deepEquals(array1, array3)).to.be.false;
  });

  it('should handle objects', () => {
    const date = new Date();
    const object1 = { a: 1, b: new Date(date.getTime()), c: 'ok', d: true, e: [] };
    const object2 = { b: new Date(date.getTime()), a: 1, d: true, c: 'ok', e: [] };

    expect(deepEquals(object1, object2)).to.be.true;
  });
});

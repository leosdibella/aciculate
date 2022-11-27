import { ReferencePathPiece, ReferenceType } from '../types';
import { ValueType } from '../enums';

const decimalBase = 10;

export const tokens = Object.freeze({
  null: `${null}`,
  undefined: `${undefined}`,
  boolean: Object.freeze([`${true}`, `${false}`]),
  delimiters: Object.freeze({
    string: '"',
    bigInt: 'n',
    date: '@'
  }),
  characterEscape: '\\',
  number: Object.freeze({
    decimal: '.',
    exponential: 'e',
    signs: Object.freeze(['-', '+']),
    digits: Object.freeze([...Array(decimalBase)].map((_, i) => `${i}`)),
    keywords: Object.freeze([`${Infinity}`, `${-Infinity}`, `${NaN}`])
  }),
  object: Object.freeze({
    open: '{',
    close: '}'
  }),
  array: Object.freeze({
    open: '[',
    close: ']'
  }),
  separators: Object.freeze({
    name: ':',
    value: ',',
    referencePath: '/'
  }),
  whitespace: Object.freeze({
    space: ' ',
    newLine: '\n',
    tab: '\t',
    carriageReturn: '\r'
  })
});

export const whiteSpaceTokens: string[] = Object.values(tokens.whitespace);

export const keywordTokens = Object.freeze([
  tokens.null,
  tokens.undefined,
  ...tokens.boolean,
  ...tokens.number.keywords
]);

export const maxKeywordTokenLength = Math.max(
  ...keywordTokens.map((v) => v.length)
);

export const numericalTokens = Object.freeze([
  tokens.number.decimal,
  tokens.number.exponential,
  ...tokens.number.signs,
  ...tokens.number.digits
]);

export const valueTypePathReferenceWrappers = Object.freeze({
  [ValueType.array]: Object.freeze([tokens.array.open, tokens.array.close]),
  [ValueType.object]: Object.freeze([tokens.object.open, tokens.object.close])
});

export const rootReferencePath = `${tokens.separators.referencePath}${tokens.separators.referencePath}`;

export function isReferenceType(value: unknown) {
  return (
    value &&
    (Array.isArray(value) || typeof value === 'object') &&
    !(value instanceof Date)
  );
}

export function isValidReferencePoint(
  reference: ReferenceType,
  piece: ReferencePathPiece
) {
  return (
    (Array.isArray(reference) && piece.type === ValueType.array) ||
    (!Array.isArray(reference) && piece.type === ValueType.object)
  );
}

// TODO: Replace this with own implementation ???
export function serializeString(value: string) {
  return JSON.stringify(value);
}

export function deserializeString(value: string): string {
  return JSON.parse(value);
}

// TODO: Replace this with own implementation ???
export function serializeDate(value: Date) {
  return JSON.stringify(value);
}

export function getReferencePathPieceType(value: string) {
  const type =
    value[0] === tokens.object.open
      ? ValueType.object
      : value[0] === tokens.array.open
      ? ValueType.array
      : undefined;

  const typeConfirmation =
    value[value.length - 1] === tokens.object.close
      ? ValueType.object
      : value[value.length - 1] === tokens.array.close
      ? ValueType.array
      : undefined;

  return {
    type,
    typeConfirmation
  };
}

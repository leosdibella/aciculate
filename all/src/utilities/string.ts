const lowerCaseAlphaCharCodeStart = 64;
const lowerCaseAlphaCharCodeEnd = 91;
const upperCaseAlphaCharCodeStart = 96;
const upperCaseAlphaCharCodeEnd = 123;

function isAlpha(value?: string) {
  const charCode = (value || '').charCodeAt(0);

  return (
    (charCode > lowerCaseAlphaCharCodeStart &&
      charCode < lowerCaseAlphaCharCodeEnd) ||
    (charCode > upperCaseAlphaCharCodeStart &&
      charCode < upperCaseAlphaCharCodeEnd)
  );
}

export function camelCaseToKebabCase(string: string) {
  if (!string.length) {
    return '';
  }

  let kebabCase = '';
  let char: string;

  for (let i = 0; i < string.length; ++i) {
    char = string[i].toLowerCase();
    kebabCase +=
      (char !== string[i] && isAlpha(string[i - 1]) ? '-' : '') + char;
  }

  return kebabCase;
}

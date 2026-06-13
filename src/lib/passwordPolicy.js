export const passwordRules = [
  ['At least 8 characters', (value) => value.length >= 8],
  ['One uppercase letter', (value) => /[A-Z]/.test(value)],
  ['One lowercase letter', (value) => /[a-z]/.test(value)],
  ['One number', (value) => /\d/.test(value)],
  ['One special character', (value) => /[^A-Za-z0-9]/.test(value)],
];

export function isStrongPassword(value) {
  return passwordRules.every(([, validate]) => validate(value));
}

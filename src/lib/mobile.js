export function normalizeMobile(value) {
  return value == null ? '' : String(value).trim().replace(/[\s()-]/g, '');
}

export function isValidMobile(value) {
  return /^\+?[1-9]\d{6,14}$/.test(normalizeMobile(value));
}

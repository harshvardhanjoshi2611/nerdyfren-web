import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidMobile, normalizeMobile } from '../src/lib/mobile.js';

test('normalizes formatted mobile numbers before API submission', () => {
  assert.equal(normalizeMobile('+91 (98123) 45670'), '+919812345670');
});

test('accepts valid mobile numbers and rejects malformed values', () => {
  assert.equal(isValidMobile('+919812345670'), true);
  assert.equal(isValidMobile('9812345670'), true);
  assert.equal(isValidMobile('+()---1'), false);
  assert.equal(isValidMobile('0000000'), false);
  assert.equal(isValidMobile('+1234567890123456'), false);
});

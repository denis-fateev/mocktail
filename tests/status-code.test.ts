import { describe, expect, it } from 'vitest';
import {
  filterStatusCodeInput,
  getHttpStatusPhrase,
  isValidHttpStatusCode,
  normalizeHttpStatusCode,
  normalizeStatusCodeInput,
} from '../src/shared/rules/status-code';
import { DEFAULT_HTTP_STATUS_CODE } from '../src/shared/rules/defaults';

describe('HTTP status code helpers', () => {
  it('validates integers in the 100–599 range', () => {
    expect(isValidHttpStatusCode(100)).toBe(true);
    expect(isValidHttpStatusCode(599)).toBe(true);
    expect(isValidHttpStatusCode(99)).toBe(false);
    expect(isValidHttpStatusCode(600)).toBe(false);
    expect(isValidHttpStatusCode(200.5)).toBe(false);
  });

  it('normalizes invalid codes to the default', () => {
    expect(normalizeHttpStatusCode(404)).toBe(404);
    expect(normalizeHttpStatusCode(undefined)).toBe(DEFAULT_HTTP_STATUS_CODE);
    expect(normalizeHttpStatusCode(99)).toBe(DEFAULT_HTTP_STATUS_CODE);
  });

  it('filters and normalizes status code input from the UI', () => {
    expect(filterStatusCodeInput('a2b0c4')).toBe('204');
    expect(filterStatusCodeInput('12345')).toBe('123');
    expect(normalizeStatusCodeInput('404')).toBe(404);
    expect(normalizeStatusCodeInput('abc')).toBe(DEFAULT_HTTP_STATUS_CODE);
    expect(normalizeStatusCodeInput('99')).toBe(DEFAULT_HTTP_STATUS_CODE);
  });

  it('returns known phrases and a mock fallback for unknown codes', () => {
    expect(getHttpStatusPhrase(200)).toBe('OK');
    expect(getHttpStatusPhrase(404)).toBe('Not Found');
    expect(getHttpStatusPhrase(418)).toBe("I'm a teapot");
    expect(getHttpStatusPhrase(299)).toBe('Mock Response');
  });
});

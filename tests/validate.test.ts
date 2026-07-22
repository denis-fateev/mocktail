import { describe, expect, it } from 'vitest';
import { collectMockRuleValidationErrors, collectMockRulesValidationErrors } from '../src/shared/rules/validate';
import { createMockRule } from '../src/shared/rules/types';

describe('mock rule validation', () => {
  it('accepts a valid rule', () => {
    const rule = createMockRule('https://api.example.com/users');
    expect(collectMockRuleValidationErrors(rule, 0)).toEqual([]);
  });

  it('rejects invalid methods', () => {
    const errors = collectMockRuleValidationErrors(
      { url: 'https://api.example.com/users', method: 'GETS' },
      0,
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/method/);
    expect(errors[0]).toMatch(/GETS/);
  });

  it('rejects invalid response headers shape', () => {
    const errors = collectMockRuleValidationErrors(
      {
        url: 'https://api.example.com/users',
        responseHeaders: [{ key: 'Content-Type', value: 123 }],
      },
      1,
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Rule 2/);
    expect(errors[0]).toMatch(/value must be a string/);
  });

  it('collects errors for every invalid rule', () => {
    const errors = collectMockRulesValidationErrors([
      { url: 'https://api.example.com/ok' },
      { url: '', method: 'GETS' },
      { url: 'https://api.example.com/bad', responseHeaders: 'nope' },
    ]);

    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(errors.some((error) => error.includes('Rule 2'))).toBe(true);
    expect(errors.some((error) => error.includes('Rule 3'))).toBe(true);
  });

  it('rejects invalid urlMatchType, statusCode, delayMs, and modifyType', () => {
    const errors = collectMockRuleValidationErrors(
      {
        url: 'https://api.example.com/users',
        urlMatchType: 'prefix',
        statusCode: 99,
        delayMs: -1,
        modifyType: 'both',
        enabled: 'yes',
        requestHeaders: [{ key: 1, value: 'x' }],
      },
      0,
    );

    expect(errors.some((error) => error.includes('urlMatchType'))).toBe(true);
    expect(errors.some((error) => error.includes('statusCode'))).toBe(true);
    expect(errors.some((error) => error.includes('delayMs'))).toBe(true);
    expect(errors.some((error) => error.includes('modifyType'))).toBe(true);
    expect(errors.some((error) => error.includes('enabled'))).toBe(true);
    expect(errors.some((error) => error.includes('requestHeaders[0].key'))).toBe(true);
  });

  it('rejects non-object rules and non-array rule lists', () => {
    expect(collectMockRuleValidationErrors('nope', 0)).toEqual(['Rule 1: must be an object.']);
    expect(collectMockRulesValidationErrors({})).toEqual(['Export document must include a "rules" array.']);
  });
});
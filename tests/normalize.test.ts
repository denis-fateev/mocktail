import { describe, expect, it } from 'vitest';
import { normalizeRule, sanitizeRuleForStorage } from '../src/shared/rules/normalize';
import { DEFAULT_HTTP_METHOD } from '../src/shared/rules/types';

describe('rule normalization', () => {
  it('normalizes invalid HTTP methods from persisted data', () => {
    const rule = normalizeRule({
      url: 'https://api.example.com/users',
      method: 'GETS' as never,
    });

    expect(rule.method).toBe(DEFAULT_HTTP_METHOD);
  });

  it('repairs corrupt response headers from persisted data', () => {
    const rule = sanitizeRuleForStorage({
      url: 'https://api.example.com/users',
      responseHeaders: 'invalid',
    });

    expect(rule).not.toBeNull();
    expect(rule?.responseHeaders).toEqual([
      { key: 'Content-Type', value: 'application/json; charset=utf-8' },
    ]);
  });

  it('keeps valid empty response headers', () => {
    const rule = normalizeRule({
      url: 'https://api.example.com/users',
      responseHeaders: [],
    });

    expect(rule.responseHeaders).toEqual([]);
  });

  it('sanitizes non-string urls into editable empty rules', () => {
    const rule = sanitizeRuleForStorage({
      url: 123,
      method: 'GETS',
      responseHeaders: [{ key: 'X-Test', value: '1' }],
    });

    expect(rule).not.toBeNull();
    expect(rule?.url).toBe('');
    expect(rule?.method).toBe(DEFAULT_HTTP_METHOD);
    expect(rule?.responseHeaders).toEqual([{ key: 'X-Test', value: '1' }]);
  });

  it('defaults collapsed to false and preserves stored collapse state', () => {
    expect(normalizeRule({ url: 'https://api.example.com/users' }).collapsed).toBe(false);
    expect(normalizeRule({ url: 'https://api.example.com/users', collapsed: true }).collapsed).toBe(true);
  });
});

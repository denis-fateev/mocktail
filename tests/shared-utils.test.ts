import { describe, expect, it } from 'vitest';
import { formatJsonBody, normalizeResponseBody } from '../src/shared/rules/response-body';
import { matchesTextSearch } from '../src/shared/utils/text-search';

describe('normalizeResponseBody', () => {
  it('keeps provided bodies and turns undefined into an empty string', () => {
    expect(normalizeResponseBody('{"ok":true}')).toBe('{"ok":true}');
    expect(normalizeResponseBody('')).toBe('');
    expect(normalizeResponseBody(undefined)).toBe('');
  });
});

describe('formatJsonBody', () => {
  it('pretty-prints valid JSON and returns null for invalid JSON', () => {
    expect(formatJsonBody('{"a":1}')).toBe('{\n  "a": 1\n}');
    expect(formatJsonBody('not-json')).toBeNull();
  });
});

describe('matchesTextSearch', () => {
  it('matches case-insensitively and treats blank queries as match-all', () => {
    expect(matchesTextSearch('', 'https://API.example.com/users')).toBe(true);
    expect(matchesTextSearch('  ', 'https://API.example.com/users')).toBe(true);
    expect(matchesTextSearch('api.example', 'https://API.example.com/users')).toBe(true);
    expect(matchesTextSearch('users api', 'https://api.example.com/users', 'Users API')).toBe(true);
    expect(matchesTextSearch('orders', 'https://API.example.com/users', 'Users API')).toBe(false);
  });
});

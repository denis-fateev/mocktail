import { describe, expect, it } from 'vitest';
import { formatJsonBody, normalizeResponseBody } from '../src/shared/rules/response-body';
import { matchesUrlSearch } from '../src/shared/utils/url-search';
import { toBase64 } from '../src/shared/utils';

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

describe('matchesUrlSearch', () => {
  it('matches case-insensitively and treats blank queries as match-all', () => {
    expect(matchesUrlSearch('', 'https://API.example.com/users')).toBe(true);
    expect(matchesUrlSearch('  ', 'https://API.example.com/users')).toBe(true);
    expect(matchesUrlSearch('api.example', 'https://API.example.com/users')).toBe(true);
    expect(matchesUrlSearch('orders', 'https://API.example.com/users')).toBe(false);
  });
});

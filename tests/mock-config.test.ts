import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockRule } from '../src/shared/rules/types';

vi.mock('../src/extension/background/rules/mock-rules', () => ({
  getMockRules: vi.fn(),
}));

import { getMockRules } from '../src/extension/background/rules/mock-rules';
import {
  findMatchingMockRule,
  findMatchingMockUrl,
  findMatchingRules,
  matchesMockUrl,
} from '../src/extension/background/rules/mock-config';

const mockedGetMockRules = vi.mocked(getMockRules);

describe('findMatchingRules', () => {
  beforeEach(() => {
    mockedGetMockRules.mockReset();
  });

  it('skips disabled rules and rules with empty URLs', () => {
    mockedGetMockRules.mockReturnValue([
      createMockRule('https://api.example.com/users', { enabled: false, id: 'disabled' }),
      createMockRule('', { id: 'empty' }),
      createMockRule('https://api.example.com/users', { id: 'active' }),
    ]);

    const { responseRule } = findMatchingRules('https://api.example.com/users', 'GET');
    expect(responseRule?.id).toBe('active');
  });

  it('treats ANY method as a wildcard and requires an exact method otherwise', () => {
    mockedGetMockRules.mockReturnValue([
      createMockRule('https://api.example.com/users', { method: 'POST', id: 'post' }),
      createMockRule('https://api.example.com/users', { method: 'ANY', id: 'any' }),
    ]);

    expect(findMatchingRules('https://api.example.com/users', 'GET').responseRule?.id).toBe('any');
    expect(findMatchingRules('https://api.example.com/users', 'post').responseRule?.id).toBe('post');
  });

  it('returns the first matching rule of each modify type', () => {
    mockedGetMockRules.mockReturnValue([
      createMockRule('https://api.example.com/users', { modifyType: 'request', id: 'req-1' }),
      createMockRule('https://api.example.com/users', { modifyType: 'request', id: 'req-2' }),
      createMockRule('https://api.example.com/users', { modifyType: 'response', id: 'res-1' }),
      createMockRule('https://api.example.com/users', { modifyType: 'response', id: 'res-2' }),
    ]);

    const match = findMatchingRules('https://api.example.com/users', 'GET');
    // Response mock wins: request rule is cleared when a response rule also matches.
    expect(match.requestRule).toBeNull();
    expect(match.responseRule?.id).toBe('res-1');
  });

  it('keeps a request rule when no response rule matches', () => {
    mockedGetMockRules.mockReturnValue([
      createMockRule('https://api.example.com/users', { modifyType: 'request', id: 'req' }),
      createMockRule('https://api.example.com/orders', { modifyType: 'response', id: 'res' }),
    ]);

    const match = findMatchingRules('https://api.example.com/users', 'GET');
    expect(match.requestRule?.id).toBe('req');
    expect(match.responseRule).toBeNull();
  });

  it('respects url match types when selecting rules', () => {
    mockedGetMockRules.mockReturnValue([
      createMockRule('/users', { urlMatchType: 'contains', id: 'contains' }),
    ]);

    expect(findMatchingMockRule('https://api.example.com/users/1', 'GET')?.id).toBe('contains');
    expect(findMatchingMockUrl('https://api.example.com/users/1', 'GET')).toBe('/users');
    expect(matchesMockUrl('https://api.example.com/orders', 'GET')).toBe(false);
  });
});

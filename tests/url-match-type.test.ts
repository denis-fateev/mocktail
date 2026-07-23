import { describe, expect, it } from 'vitest';
import { matchesRuleUrl } from '../src/shared/rules/url-match-type';

describe('matchesRuleUrl', () => {
  const url = 'https://api.example.com/users/42';

  it('returns false for an empty rule URL', () => {
    expect(matchesRuleUrl(url, '', 'equals')).toBe(false);
    expect(matchesRuleUrl(url, '', 'contains')).toBe(false);
  });

  it('matches equals only on exact URL', () => {
    expect(matchesRuleUrl(url, url, 'equals')).toBe(true);
    expect(matchesRuleUrl(url, 'https://api.example.com/users', 'equals')).toBe(false);
  });

  it('matches contains on a substring', () => {
    expect(matchesRuleUrl(url, '/users/', 'contains')).toBe(true);
    expect(matchesRuleUrl(url, '/orders/', 'contains')).toBe(false);
  });

  it('matches starts-with and ends-with', () => {
    expect(matchesRuleUrl(url, 'https://api.example.com', 'starts-with')).toBe(true);
    expect(matchesRuleUrl(url, 'https://other.example.com', 'starts-with')).toBe(false);
    expect(matchesRuleUrl(url, '/42', 'ends-with')).toBe(true);
    expect(matchesRuleUrl(url, '/users', 'ends-with')).toBe(false);
  });
});

import type { MockRule } from '@shared/rules/types';
import { matchesRuleUrl } from '@shared/rules/url-match-type';
import { getMockRules } from './mock-rules';

function isMethodMatch(requestMethod: string, ruleMethod: MockRule['method']): boolean {
  if (ruleMethod === 'ANY') return true;
  return requestMethod.toUpperCase() === ruleMethod;
}

function isRuleMatch(requestUrl: string, requestMethod: string, rule: MockRule): boolean {
  if (!rule.enabled || !rule.url) return false;
  return matchesRuleUrl(requestUrl, rule.url, rule.urlMatchType) && isMethodMatch(requestMethod, rule.method);
}

export type MatchingRules = {
  requestRule: MockRule | null;
  responseRule: MockRule | null;
};

export function findMatchingRules(requestUrl: string, requestMethod: string): MatchingRules {
  let requestRule: MockRule | null = null;
  let responseRule: MockRule | null = null;

  for (const rule of getMockRules()) {
    if (!isRuleMatch(requestUrl, requestMethod, rule)) continue;

    if (rule.modifyType === 'request' && !requestRule) {
      requestRule = rule;
    } else if (rule.modifyType === 'response' && !responseRule) {
      responseRule = rule;
    }

    if (requestRule && responseRule) break;
  }

  // Response mock takes priority: when both match, only the response rule applies.
  if (responseRule) {
    requestRule = null;
  }

  return { requestRule, responseRule };
}

export function findMatchingMockRule(requestUrl: string, requestMethod: string): MockRule | null {
  return findMatchingRules(requestUrl, requestMethod).responseRule;
}

export function findMatchingMockUrl(requestUrl: string, requestMethod: string): string | null {
  return findMatchingMockRule(requestUrl, requestMethod)?.url ?? null;
}

export function matchesMockUrl(requestUrl: string, requestMethod: string): boolean {
  return findMatchingMockRule(requestUrl, requestMethod) !== null;
}

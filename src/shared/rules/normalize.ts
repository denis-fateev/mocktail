import { normalizeDelayMs } from './delay-ms';
import { normalizeResponseBody } from './response-body';
import { normalizeResponseHeaders } from './response-headers';
import { normalizeHttpStatusCode } from './status-code';
import { createMockRule, createMockRuleId, normalizeHttpMethod, normalizeModifyType, type MockRule } from './types';
import { normalizeUrlMatchType } from './url-match-type';

export function sanitizeRuleForStorage(rule: unknown): MockRule | null {
  if (typeof rule !== 'object' || rule === null) return null;

  const partial = rule as Partial<MockRule>;
  const url = typeof partial.url === 'string' ? partial.url : '';

  return normalizeRule({ ...partial, url });
}

export function normalizeRule(rule: Partial<MockRule> & Pick<MockRule, 'url'>): MockRule {
  const withDefaults = createMockRule(rule.url, rule);
  const method = typeof rule.method === 'string' ? normalizeHttpMethod(rule.method) : withDefaults.method;

  return {
    ...withDefaults,
    id: typeof rule.id === 'string' && rule.id ? rule.id : createMockRuleId(),
    url: rule.url.trim(),
    urlMatchType: normalizeUrlMatchType(rule.urlMatchType),
    method,
    modifyType: normalizeModifyType(rule.modifyType),
    enabled: typeof rule.enabled === 'boolean' ? rule.enabled : withDefaults.enabled,
    collapsed: typeof rule.collapsed === 'boolean' ? rule.collapsed : withDefaults.collapsed,
    statusCode: normalizeHttpStatusCode(withDefaults.statusCode),
    delayMs: normalizeDelayMs(withDefaults.delayMs),
    responseBody: normalizeResponseBody(typeof withDefaults.responseBody === 'string' ? withDefaults.responseBody : undefined),
    responseHeaders: normalizeResponseHeaders(withDefaults.responseHeaders),
    requestHeaders: normalizeResponseHeaders(withDefaults.requestHeaders ?? []),
  };
}

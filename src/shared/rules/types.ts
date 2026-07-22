import { DEFAULT_DELAY_MS, DEFAULT_HTTP_STATUS_CODE } from './defaults';
import { DEFAULT_RESPONSE_BODY } from './response-body';
import { DEFAULT_RESPONSE_HEADERS, normalizeResponseHeaders, type ResponseHeader } from './response-headers';
import { DEFAULT_URL_MATCH_TYPE, type UrlMatchType } from './url-match-type';

export type { UrlMatchType };

export type { ResponseHeader };

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'ANY';

export const DEFAULT_HTTP_METHOD: HttpMethod = 'ANY';

export const HTTP_METHODS: readonly HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'ANY'];

export function normalizeHttpMethod(method: string): HttpMethod {
  const upper = method.toUpperCase();
  for (const allowed of HTTP_METHODS) {
    if (upper === allowed) return allowed;
  }

  return DEFAULT_HTTP_METHOD;
}

export type ModifyType = 'response' | 'request';

export const MODIFY_TYPES: readonly ModifyType[] = ['response', 'request'];

export const DEFAULT_MODIFY_TYPE: ModifyType = 'response';

export type MockRule = {
  id: string;
  url: string;
  urlMatchType: UrlMatchType;
  method: HttpMethod;
  modifyType: ModifyType;
  enabled: boolean;
  collapsed: boolean;
  statusCode: number;
  delayMs: number;
  responseBody: string;
  responseHeaders: ResponseHeader[];
  requestHeaders: ResponseHeader[];
};

export type MockRuleInput = Partial<MockRule> & Pick<MockRule, 'url'>;

export type MockRuleUpdate = Partial<MockRule>;

export function createMockRuleId(): string {
  return crypto.randomUUID();
}

export function duplicateMockRule(rule: MockRule): MockRule {
  return {
    ...rule,
    id: createMockRuleId(),
    responseHeaders: rule.responseHeaders.map((header) => ({ ...header })),
    requestHeaders: rule.requestHeaders.map((header) => ({ ...header })),
  };
}

export function normalizeModifyType(value: unknown): ModifyType {
  return value === 'request' ? 'request' : DEFAULT_MODIFY_TYPE;
}

export function createMockRule(url = '', overrides: Partial<MockRule> = {}): MockRule {
  return {
    id: createMockRuleId(),
    url,
    urlMatchType: DEFAULT_URL_MATCH_TYPE,
    method: DEFAULT_HTTP_METHOD,
    modifyType: DEFAULT_MODIFY_TYPE,
    enabled: true,
    collapsed: false,
    statusCode: DEFAULT_HTTP_STATUS_CODE,
    delayMs: DEFAULT_DELAY_MS,
    responseBody: DEFAULT_RESPONSE_BODY,
    responseHeaders: normalizeResponseHeaders(DEFAULT_RESPONSE_HEADERS),
    requestHeaders: [],
    ...overrides,
  };
}

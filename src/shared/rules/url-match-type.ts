export type UrlMatchType = 'equals' | 'contains' | 'ends-with' | 'starts-with';

export const URL_MATCH_TYPES: readonly UrlMatchType[] = ['equals', 'contains', 'ends-with', 'starts-with'];

export const DEFAULT_URL_MATCH_TYPE: UrlMatchType = 'equals';

export function normalizeUrlMatchType(value: unknown): UrlMatchType {
  if (typeof value === 'string' && (URL_MATCH_TYPES as readonly string[]).includes(value)) {
    return value as UrlMatchType;
  }

  return DEFAULT_URL_MATCH_TYPE;
}

export function matchesRuleUrl(requestUrl: string, ruleUrl: string, matchType: UrlMatchType): boolean {
  if (!ruleUrl) return false;

  switch (matchType) {
    case 'equals':
      return requestUrl === ruleUrl;
    case 'contains':
      return requestUrl.includes(ruleUrl);
    case 'ends-with':
      return requestUrl.endsWith(ruleUrl);
    case 'starts-with':
      return requestUrl.startsWith(ruleUrl);
  }
}

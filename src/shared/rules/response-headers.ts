export type ResponseHeader = {
  key: string;
  value: string;
  enabled: boolean;
};

export const DEFAULT_CONTENT_TYPE = 'application/json; charset=utf-8';

export const DEFAULT_RESPONSE_HEADERS: ResponseHeader[] = [{ key: 'Content-Type', value: DEFAULT_CONTENT_TYPE, enabled: true }];

export function createEmptyResponseHeader(): ResponseHeader {
  return { key: '', value: '', enabled: true };
}

export function normalizeResponseHeaders(headers: unknown): ResponseHeader[] {
  if (!Array.isArray(headers)) {
    return DEFAULT_RESPONSE_HEADERS.map((header) => ({ ...header }));
  }

  const normalized: ResponseHeader[] = [];

  for (const header of headers) {
    if (typeof header !== 'object' || header === null) continue;

    const key = 'key' in header ? header.key : undefined;
    const value = 'value' in header ? header.value : undefined;

    if (typeof key !== 'string' || typeof value !== 'string') continue;

    normalized.push({
      key: key.trim(),
      value: value.trim(),
      enabled: 'enabled' in header && typeof header.enabled === 'boolean' ? header.enabled : true,
    });
  }

  return normalized;
}

export function getActiveResponseHeaders(headers: ResponseHeader[]): { name: string; value: string }[] {
  return normalizeResponseHeaders(headers)
    .filter((header) => header.enabled && header.key && header.value)
    .map((header) => ({ name: header.key, value: header.value }));
}

/** Headers copied from a real response that break mocks, cache, or duplicate extension behavior. */
const COPIED_RESPONSE_HEADERS_TO_OMIT = new Set([
  'content-length',
  'content-encoding',
  'transfer-encoding',
  'connection',
  'cache-control',
  'pragma',
  'expires',
  'etag',
  'last-modified',
]);

function shouldOmitCopiedResponseHeader(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  if (COPIED_RESPONSE_HEADERS_TO_OMIT.has(normalized)) return true;
  if (normalized.startsWith('access-control-')) return true;
  return false;
}

export function omitCopiedResponseHeaders(headers: ResponseHeader[]): ResponseHeader[] {
  return headers.filter((header) => !shouldOmitCopiedResponseHeader(header.key));
}

export function isJsonContentType(headers: ResponseHeader[]): boolean {
  const contentType = headers.find((header) => header.enabled && header.key.toLowerCase() === 'content-type')?.value ?? '';
  return contentType.includes('application/json');
}

export function parseResponseHeadersFromRecord(headers: Record<string, string> | undefined): ResponseHeader[] {
  if (!headers) return [];

  return Object.entries(headers).map(([key, value]) => ({ key, value, enabled: true }));
}

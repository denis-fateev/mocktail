import { DEFAULT_CONTENT_TYPE } from './response-headers';

export const COMMON_RESPONSE_HEADER_NAMES = [
  'Content-Type',
  'Cache-Control',
  'Content-Encoding',
  'Content-Language',
  'Content-Disposition',
  'ETag',
  'Last-Modified',
  'Location',
  'Retry-After',
  'Set-Cookie',
  'Vary',
  'WWW-Authenticate',
  'X-Request-Id',
] as const;

const HEADER_VALUE_SUGGESTIONS: Record<string, readonly string[]> = {
  'content-type': [
    DEFAULT_CONTENT_TYPE,
    'application/json',
    'text/plain; charset=utf-8',
    'text/html; charset=utf-8',
    'application/xml',
    'text/xml',
    'application/octet-stream',
  ],
  'cache-control': ['no-cache', 'no-store', 'private', 'public', 'max-age=0', 'max-age=3600'],
  'content-encoding': ['gzip', 'deflate', 'br'],
  'content-language': ['en-US', 'ru-RU'],
  'content-disposition': ['inline', 'attachment', 'attachment; filename="file.json"'],
  'etag': ['"abc123"', 'W/"abc123"'],
  'location': ['https://example.com/'],
  'retry-after': ['60', '120', '3600'],
  'set-cookie': ['session=abc; Path=/; HttpOnly', 'token=abc; Path=/; Secure; SameSite=Lax'],
  'vary': ['Accept-Encoding', 'Origin'],
  'www-authenticate': ['Bearer', 'Basic realm="example"'],
};

const GENERIC_HEADER_VALUE_SUGGESTIONS = ['true', 'false', '0', '1'] as const;

export function getHeaderValueSuggestions(key: string): readonly string[] {
  const normalized = key.trim().toLowerCase();
  if (!normalized) return [];

  return HEADER_VALUE_SUGGESTIONS[normalized] ?? GENERIC_HEADER_VALUE_SUGGESTIONS;
}

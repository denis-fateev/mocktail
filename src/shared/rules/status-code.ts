import { DEFAULT_HTTP_STATUS_CODE } from './defaults';

const MIN_HTTP_STATUS_CODE = 100;
const MAX_HTTP_STATUS_CODE = 599;

const MOCK_STATUS_PHRASE = 'Mock Response';

/** Standard reason phrases for well-known codes; Chromium requires a non-empty phrase in CDP fulfill. */
const HTTP_STATUS_PHRASES: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  418: "I'm a teapot",
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  499: 'Client Closed Request',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

/** Reason phrase for Fetch.fulfillRequest; required for codes Chromium does not know. */
export function getHttpStatusPhrase(statusCode: number): string {
  return HTTP_STATUS_PHRASES[statusCode] ?? MOCK_STATUS_PHRASE;
}

/** Any integer HTTP status code in the standard 100–599 range. */
export function isValidHttpStatusCode(code: number): boolean {
  return Number.isInteger(code) && code >= MIN_HTTP_STATUS_CODE && code <= MAX_HTTP_STATUS_CODE;
}

export function normalizeHttpStatusCode(code: number | undefined): number {
  if (code !== undefined && isValidHttpStatusCode(code)) {
    return code;
  }
  return DEFAULT_HTTP_STATUS_CODE;
}

export function filterStatusCodeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 3);
}

export function normalizeStatusCodeInput(raw: string): number {
  const parsed = Number.parseInt(raw, 10);
  return normalizeHttpStatusCode(Number.isNaN(parsed) ? undefined : parsed);
}

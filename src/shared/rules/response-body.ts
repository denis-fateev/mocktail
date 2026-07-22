export const DEFAULT_RESPONSE_BODY = '{\n  "mock": true\n}';

export function normalizeResponseBody(body: string | undefined): string {
  if (body === undefined) {
    return '';
  }
  return body;
}

export function formatJsonBody(body: string): string | null {
  try {
    const parsed = JSON.parse(body);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
}

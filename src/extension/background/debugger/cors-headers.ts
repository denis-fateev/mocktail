type HeaderEntry = { name: string; value: string };

function headerMap(headers: Record<string, string> = {}): Map<string, string> {
  const map = new Map<string, string>();
  for (const [key, value] of Object.entries(headers)) {
    map.set(key.toLowerCase(), value);
  }
  return map;
}

export function buildCorsHeaders(
  requestHeaders: Record<string, string> | undefined,
  method: string,
): HeaderEntry[] {
  const headers = headerMap(requestHeaders);
  const origin = headers.get('origin');
  const requestedMethod = headers.get('access-control-request-method');
  const requestedHeaders = headers.get('access-control-request-headers');

  const cors: HeaderEntry[] = [];

  if (origin) {
    cors.push({ name: 'Access-Control-Allow-Origin', value: origin });
    cors.push({ name: 'Vary', value: 'Origin' });
    cors.push({ name: 'Access-Control-Allow-Credentials', value: 'true' });
  } else {
    cors.push({ name: 'Access-Control-Allow-Origin', value: '*' });
  }

  if (method.toUpperCase() === 'OPTIONS') {
    cors.push({
      name: 'Access-Control-Allow-Methods',
      value: requestedMethod ?? 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    });
    cors.push({
      name: 'Access-Control-Allow-Headers',
      value:
        requestedHeaders ??
        'Content-Type, Authorization, Accept, X-Requested-With, X-CSRF-Token',
    });
    cors.push({ name: 'Access-Control-Max-Age', value: '86400' });
  }

  return cors;
}

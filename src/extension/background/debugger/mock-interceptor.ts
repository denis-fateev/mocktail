import { sleep, toBase64 } from '@shared/utils';
import { getHttpStatusPhrase } from '@shared/rules/status-code';
import { getActiveResponseHeaders } from '@shared/rules/response-headers';
import type { MockRule, ResponseHeader } from '@shared/rules/types';
import { isSmartResponseHeadersEnabled } from '../settings/app-settings';
import { buildCorsHeaders } from './cors-headers';
import { sendCommand } from './cdp';
import { isTabAttached } from './attached-tabs';

// Map<tabId, Set<requestId>>
const pendingMockedIds = new Map<number, Set<string>>();
const pendingModifiedIds = new Map<number, Set<string>>();

export function clearPendingMocks(tabId: number): void {
  pendingMockedIds.delete(tabId);
  pendingModifiedIds.delete(tabId);
}

export function markPendingMock(tabId: number, id: string): void {
  const pending = pendingMockedIds.get(tabId) ?? new Set<string>();
  pending.add(id);
  pendingMockedIds.set(tabId, pending);
}

export function markPendingModified(tabId: number, id: string): void {
  const pending = pendingModifiedIds.get(tabId) ?? new Set<string>();
  pending.add(id);
  pendingModifiedIds.set(tabId, pending);
}

export function consumePendingMock(tabId: number, id: string): boolean {
  const pending = pendingMockedIds.get(tabId);
  if (!pending?.delete(id)) return false;
  if (pending.size === 0) {
    pendingMockedIds.delete(tabId);
  }
  return true;
}

export function consumePendingModified(tabId: number, id: string): boolean {
  const pending = pendingModifiedIds.get(tabId);
  if (!pending?.delete(id)) return false;
  if (pending.size === 0) {
    pendingModifiedIds.delete(tabId);
  }
  return true;
}

function buildMergedRequestHeaders(
  existing: Record<string, string> | undefined,
  ruleHeaders: ResponseHeader[],
): { name: string; value: string }[] {
  const merged = new Map<string, { name: string; value: string }>();

  if (existing) {
    for (const [name, value] of Object.entries(existing)) {
      merged.set(name.toLowerCase(), { name, value });
    }
  }

  for (const header of getActiveResponseHeaders(ruleHeaders)) {
    merged.set(header.name.toLowerCase(), { name: header.name, value: header.value });
  }

  return Array.from(merged.values());
}

/** Fetch pause may already be gone (abort, navigation, race) — CDP -32602 Invalid InterceptionId. */
async function sendFetchCommand(
  tabId: number,
  sessionId: string | undefined,
  method: 'Fetch.continueRequest' | 'Fetch.fulfillRequest',
  params: Record<string, unknown>,
): Promise<boolean> {
  if (!isTabAttached(tabId)) return false;
  try {
    await sendCommand(tabId, sessionId, method, params);
    return true;
  } catch {
    return false;
  }
}

export async function continueRequest(tabId: number, sessionId: string | undefined, requestId: string): Promise<void> {
  await sendFetchCommand(tabId, sessionId, 'Fetch.continueRequest', { requestId });
}

export async function continueWithModifiedRequest(
  tabId: number,
  sessionId: string | undefined,
  requestId: string,
  request: { headers?: Record<string, string> },
  rule: Pick<MockRule, 'delayMs' | 'requestHeaders'>,
): Promise<void> {
  try {
    if (rule.delayMs > 0) {
      await sleep(rule.delayMs);
    }
    if (!isTabAttached(tabId)) return;

    const activeHeaders = getActiveResponseHeaders(rule.requestHeaders);
    const params: { requestId: string; headers?: { name: string; value: string }[] } = { requestId };

    if (activeHeaders.length > 0) {
      params.headers = buildMergedRequestHeaders(request.headers, rule.requestHeaders);
    }

    const continued = await sendFetchCommand(tabId, sessionId, 'Fetch.continueRequest', params);
    if (!continued && activeHeaders.length > 0) {
      // Header mutation may have been rejected; try an unmodified continue.
      await continueRequest(tabId, sessionId, requestId);
    }
  } catch {
    await continueRequest(tabId, sessionId, requestId);
  }
}

export async function fulfillMock(
  tabId: number,
  sessionId: string | undefined,
  requestId: string,
  request: { method: string; headers?: Record<string, string> },
  rule: Pick<MockRule, 'statusCode' | 'delayMs' | 'responseBody' | 'responseHeaders'>,
): Promise<void> {
  try {
    const method = request.method.toUpperCase();
    const isPreflight = method === 'OPTIONS';
    const smartResponseHeaders = isSmartResponseHeadersEnabled();

    if (!isPreflight && rule.delayMs > 0) {
      await sleep(rule.delayMs);
    }
    if (!isTabAttached(tabId)) return;

    const corsHeaders = smartResponseHeaders ? buildCorsHeaders(request.headers, method) : [];

    let fulfilled: boolean;
    if (isPreflight && smartResponseHeaders) {
      fulfilled = await sendFetchCommand(tabId, sessionId, 'Fetch.fulfillRequest', {
        requestId,
        responseCode: 204,
        responsePhrase: getHttpStatusPhrase(204),
        responseHeaders: corsHeaders,
      });
    } else {
      const responseHeaders = [
        ...getActiveResponseHeaders(rule.responseHeaders),
        ...corsHeaders,
      ];
      fulfilled = await sendFetchCommand(tabId, sessionId, 'Fetch.fulfillRequest', {
        requestId,
        responseCode: rule.statusCode,
        responsePhrase: getHttpStatusPhrase(rule.statusCode),
        responseHeaders,
        body: toBase64(rule.responseBody),
      });
    }

    if (!fulfilled) {
      // Fulfill can fail for payload/header reasons; let the real request proceed.
      await continueRequest(tabId, sessionId, requestId);
    }
  } catch {
    await continueRequest(tabId, sessionId, requestId);
  }
}

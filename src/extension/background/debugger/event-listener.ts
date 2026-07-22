import { DEFAULT_HTTP_STATUS_CODE } from '@shared/rules/defaults';
import { isFetchOrXhrResourceType } from '@shared/network/filter';
import type { CapturedRequest, NetworkResourceType } from '@shared/network/types';
import { parseResponseHeadersFromRecord } from '@shared/rules/response-headers';
import { findMatchingRules } from '../rules/mock-config';
import { recordMockedRequest } from '../rules/mock-stats';
import { clearTabSessionOnNavigation } from '../tab-session-reset';
import { sendCommand } from './cdp';
import { isTabAttached } from './attached-tabs';
import {
  consumePendingMock,
  consumePendingModified,
  continueRequest,
  continueWithModifiedRequest,
  fulfillMock,
  markPendingMock,
  markPendingModified,
} from './mock-interceptor';
import { addRequest, getRequests, hasRequest, truncateResponseBody, updateRequest } from './request-store';
import { isCaptureResponseContentEnabled, isFetchXhrOnlyEnabled } from '../settings/app-settings';
import { handleDebuggerDetached, handleTabRemoved, handleTargetAttached } from './session';

function requestId(sessionId: string | undefined, cdpRequestId: string): string {
  const sessionKey = sessionId ?? 'main';
  return `${sessionKey}:${cdpRequestId}`;
}

function shouldHandleResourceType(type: NetworkResourceType | undefined): boolean {
  return !isFetchXhrOnlyEnabled() || isFetchOrXhrResourceType(type);
}

async function fetchResponseBody(tabId: number, sessionId: string | undefined, cdpRequestId: string, id: string): Promise<void> {
  if (!isCaptureResponseContentEnabled() || !isTabAttached(tabId)) return;

  const existing = getRequests(tabId).find((request) => request.id === id);
  if (existing?.responseBody !== undefined) return;

  try {
    const result = await sendCommand<{ body: string; base64Encoded: boolean }>(tabId, sessionId, 'Network.getResponseBody', {
      requestId: cdpRequestId,
    });

    const responseBody = result.base64Encoded ? '[binary response]' : truncateResponseBody(result.body);

    updateRequest(tabId, id, { responseBody });
  } catch {
    // Body may be unavailable (cached, cancelled, etc.).
  }
}

function handleFetchRequestPaused(
  tabId: number,
  sessionId: string | undefined,
  cdpRequestId: string,
  request: { url: string; method: string; headers?: Record<string, string> },
  resourceType: NetworkResourceType | undefined,
): void {
  if (!shouldHandleResourceType(resourceType)) {
    void continueRequest(tabId, sessionId, cdpRequestId);
    return;
  }

  const id = requestId(sessionId, cdpRequestId);
  const { requestRule, responseRule } = findMatchingRules(request.url, request.method);

  if (responseRule) {
    markPendingMock(tabId, id);
    void fulfillMock(tabId, sessionId, cdpRequestId, request, responseRule);
    return;
  }

  if (requestRule) {
    markPendingModified(tabId, id);
    void continueWithModifiedRequest(tabId, sessionId, cdpRequestId, request, requestRule);
    return;
  }

  void continueRequest(tabId, sessionId, cdpRequestId);
}

function handleRequestWillBeSent(
  tabId: number,
  sessionId: string | undefined,
  cdpRequestId: string,
  request: { url: string; method: string },
  type: CapturedRequest['resourceType'],
): void {
  if (type === 'Document' && !sessionId) {
    clearTabSessionOnNavigation(tabId);
  }

  if (!shouldHandleResourceType(type)) return;

  const id = requestId(sessionId, cdpRequestId);
  if (hasRequest(tabId, id)) return;

  const { requestRule, responseRule } = findMatchingRules(request.url, request.method);
  const mocked = consumePendingMock(tabId, id) || responseRule !== null;
  const modified = !mocked && (consumePendingModified(tabId, id) || requestRule !== null);

  if (mocked && responseRule) recordMockedRequest(tabId, responseRule);
  if (modified && requestRule) recordMockedRequest(tabId, requestRule);

  addRequest(tabId, {
    id,
    url: request.url,
    method: request.method,
    timestamp: Date.now(),
    resourceType: type,
    mocked: mocked || undefined,
    modified: modified || undefined,
    ...(mocked
      ? {
          status: responseRule?.statusCode ?? DEFAULT_HTTP_STATUS_CODE,
          responseBody: truncateResponseBody(responseRule?.responseBody ?? ''),
        }
      : {}),
  });
}

export function initDebuggerEventListeners(): void {
  chrome.debugger.onEvent.addListener((source, method, params) => {
    const tabId = source.tabId;
    if (!tabId || !isTabAttached(tabId)) return;

    if (method === 'Target.attachedToTarget') {
      const { sessionId, waitingForDebugger, targetInfo } = params as {
        sessionId: string;
        waitingForDebugger?: boolean;
        targetInfo: { type: string };
      };
      handleTargetAttached(tabId, sessionId, targetInfo.type, waitingForDebugger);
      return;
    }

    if (method === 'Fetch.requestPaused') {
      const { requestId: cdpRequestId, request, resourceType } = params as {
        requestId: string;
        request: { url: string; method: string; headers?: Record<string, string> };
        resourceType?: NetworkResourceType;
      };
      handleFetchRequestPaused(tabId, source.sessionId, cdpRequestId, request, resourceType);
      return;
    }

    if (method === 'Network.requestWillBeSent') {
      const {
        requestId: cdpRequestId,
        request,
        type,
      } = params as {
        requestId: string;
        request: { url: string; method: string };
        type: CapturedRequest['resourceType'];
      };
      handleRequestWillBeSent(tabId, source.sessionId, cdpRequestId, request, type);
      return;
    }

    if (method === 'Network.responseReceived') {
      const { requestId: cdpRequestId, response } = params as {
        requestId: string;
        response: { status: number; headers?: Record<string, string> };
      };
      const id = requestId(source.sessionId, cdpRequestId);
      const captureResponseContent = isCaptureResponseContentEnabled();

      updateRequest(tabId, id, {
        status: response.status,
        ...(captureResponseContent
          ? { responseHeaders: parseResponseHeadersFromRecord(response.headers) }
          : {}),
      });
      return;
    }

    if (method === 'Network.loadingFinished') {
      const { requestId: cdpRequestId } = params as { requestId: string };
      const id = requestId(source.sessionId, cdpRequestId);
      void fetchResponseBody(tabId, source.sessionId, cdpRequestId, id);
    }
  });

  chrome.debugger.onDetach.addListener((source) => {
    if (source.tabId) {
      handleDebuggerDetached(source.tabId);
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    handleTabRemoved(tabId);
  });
}

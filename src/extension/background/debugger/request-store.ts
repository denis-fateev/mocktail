import { MAX_REQUESTS } from '@shared/network/constants';
import type { CapturedRequest } from '@shared/network/types';
import type { RequestsUpdatedMessage } from '@shared/protocol/messages';
import { isNewestRequestsFirstEnabled } from '../settings/app-settings';

export const MAX_RESPONSE_BODY_CHARS = 1_048_576;

const requestsByTab = new Map<number, CapturedRequest[]>();

export function getRequests(tabId: number): CapturedRequest[] {
  return requestsByTab.get(tabId) ?? [];
}

export function hasRequest(tabId: number, id: string): boolean {
  return getRequests(tabId).some((request) => request.id === id);
}

export function initTabRequests(tabId: number): void {
  requestsByTab.set(tabId, []);
}

function notifyRequestsUpdated(tabId: number): void {
  const message: RequestsUpdatedMessage = {
    type: 'REQUESTS_UPDATED',
    tabId,
    requests: getRequests(tabId),
  };
  chrome.runtime.sendMessage(message).catch(() => {});
}

export function clearTabRequests(tabId: number): void {
  requestsByTab.set(tabId, []);
  notifyRequestsUpdated(tabId);
}

export function reverseAllTabRequestOrders(): void {
  for (const [tabId, list] of requestsByTab) {
    list.reverse();
    notifyRequestsUpdated(tabId);
  }
}

export function truncateResponseBody(text: string): string {
  if (text.length <= MAX_RESPONSE_BODY_CHARS) return text;
  return `${text.slice(0, MAX_RESPONSE_BODY_CHARS)}\n… [truncated]`;
}

export function updateRequest(tabId: number, id: string, patch: Partial<CapturedRequest>): void {
  const list = requestsByTab.get(tabId);
  if (!list) return;

  const index = list.findIndex((request) => request.id === id);
  if (index === -1) return;

  list[index] = { ...list[index], ...patch };
  notifyRequestsUpdated(tabId);
}

export function addRequest(tabId: number, request: CapturedRequest): void {
  const list = requestsByTab.get(tabId) ?? [];
  if (isNewestRequestsFirstEnabled()) {
    list.unshift(request);
    if (list.length > MAX_REQUESTS) list.pop();
  } else {
    list.push(request);
    if (list.length > MAX_REQUESTS) list.shift();
  }
  requestsByTab.set(tabId, list);
  notifyRequestsUpdated(tabId);
}

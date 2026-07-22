import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_REQUESTS } from '../src/shared/network/constants';
import type { CapturedRequest } from '../src/shared/network/types';

vi.mock('../src/extension/background/settings/app-settings', () => ({
  isNewestRequestsFirstEnabled: vi.fn(() => true),
}));

import { isNewestRequestsFirstEnabled } from '../src/extension/background/settings/app-settings';
import {
  MAX_RESPONSE_BODY_CHARS,
  addRequest,
  clearTabRequests,
  getRequests,
  hasRequest,
  initTabRequests,
  reverseAllTabRequestOrders,
  truncateResponseBody,
  updateRequest,
} from '../src/extension/background/debugger/request-store';

const mockedNewestFirst = vi.mocked(isNewestRequestsFirstEnabled);

function makeRequest(id: string): CapturedRequest {
  return {
    id,
    url: `https://api.example.com/${id}`,
    method: 'GET',
    timestamp: Date.now(),
  };
}

describe('truncateResponseBody', () => {
  it('leaves short bodies alone and truncates long ones', () => {
    expect(truncateResponseBody('ok')).toBe('ok');

    const long = 'x'.repeat(MAX_RESPONSE_BODY_CHARS + 10);
    const truncated = truncateResponseBody(long);
    expect(truncated.startsWith('x'.repeat(MAX_RESPONSE_BODY_CHARS))).toBe(true);
    expect(truncated.endsWith('\n… [truncated]')).toBe(true);
  });
});

describe('request store', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', {
      runtime: {
        sendMessage: vi.fn(() => Promise.resolve()),
      },
    });
    mockedNewestFirst.mockReturnValue(true);
    initTabRequests(1);
    clearTabRequests(1);
  });

  it('stores newest-first and caps list length', () => {
    for (let i = 0; i < MAX_REQUESTS + 5; i += 1) {
      addRequest(1, makeRequest(`n-${i}`));
    }

    const requests = getRequests(1);
    expect(requests).toHaveLength(MAX_REQUESTS);
    expect(requests[0]?.id).toBe(`n-${MAX_REQUESTS + 4}`);
    expect(hasRequest(1, 'n-0')).toBe(false);
  });

  it('stores oldest-first when the setting is disabled', () => {
    mockedNewestFirst.mockReturnValue(false);
    addRequest(1, makeRequest('a'));
    addRequest(1, makeRequest('b'));

    expect(getRequests(1).map((request) => request.id)).toEqual(['a', 'b']);
  });

  it('updates, reverses, and clears tab requests', () => {
    addRequest(1, makeRequest('a'));
    addRequest(1, makeRequest('b'));
    updateRequest(1, 'a', { status: 204, mocked: true });

    expect(getRequests(1).find((request) => request.id === 'a')).toMatchObject({
      status: 204,
      mocked: true,
    });

    reverseAllTabRequestOrders();
    expect(getRequests(1).map((request) => request.id)).toEqual(['a', 'b']);

    clearTabRequests(1);
    expect(getRequests(1)).toEqual([]);
  });
});

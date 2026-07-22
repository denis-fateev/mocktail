import { describe, expect, it } from 'vitest';
import {
  isExtensionErrorResponse,
  isExtensionEvent,
  isExtensionMessage,
  isExtensionRequest,
} from '../src/shared/protocol/guards';

describe('protocol guards', () => {
  it('accepts well-formed extension requests', () => {
    expect(isExtensionRequest({ type: 'GET_MOCK_RULES' })).toBe(true);
    expect(isExtensionRequest({ type: 'DEBUGGER_START', tabId: 1 })).toBe(true);
    expect(isExtensionRequest({ type: 'SET_MOCK_RULES', rules: [] })).toBe(true);
    expect(isExtensionRequest({ type: 'ADD_MOCK_RULE', rule: { url: 'https://api.example.com' } })).toBe(true);
    expect(isExtensionRequest({ type: 'IMPORT_RULE_SET', text: '{}' })).toBe(true);
    expect(isExtensionRequest({ type: 'SET_APP_SETTINGS', settings: {} })).toBe(true);
  });

  it('rejects malformed requests', () => {
    expect(isExtensionRequest(null)).toBe(false);
    expect(isExtensionRequest({ type: 'DEBUGGER_START' })).toBe(false);
    expect(isExtensionRequest({ type: 'SET_MOCK_RULES', rules: 'nope' })).toBe(false);
    expect(isExtensionRequest({ type: 'ADD_MOCK_RULE', rule: { url: 1 } })).toBe(false);
    expect(isExtensionRequest({ type: 'UNKNOWN' })).toBe(false);
  });

  it('accepts well-formed extension events', () => {
    expect(isExtensionEvent({ type: 'REQUESTS_UPDATED', tabId: 1, requests: [] })).toBe(true);
    expect(isExtensionEvent({ type: 'MOCK_RULES_UPDATED', rules: [] })).toBe(true);
    expect(
      isExtensionEvent({
        type: 'RULE_SETS_UPDATED',
        sets: [],
        activeSetId: 'set-1',
        rules: [],
      }),
    ).toBe(true);
    expect(isExtensionEvent({ type: 'MOCK_STATS_UPDATED', tabId: 1, counts: {}, total: 0 })).toBe(true);
    expect(isExtensionEvent({ type: 'TAB_STATE_CHANGED', tabId: 1, enabled: true })).toBe(true);
    expect(isExtensionEvent({ type: 'APP_SETTINGS_UPDATED', settings: {} })).toBe(true);
  });

  it('rejects malformed events and classifies messages/errors', () => {
    expect(isExtensionEvent({ type: 'REQUESTS_UPDATED', tabId: 1 })).toBe(false);
    expect(isExtensionEvent({ type: 'MOCK_STATS_UPDATED', tabId: 1, counts: {}, total: '0' })).toBe(false);
    expect(isExtensionMessage({ type: 'GET_MOCK_RULES' })).toBe(true);
    expect(isExtensionMessage({ type: 'REQUESTS_UPDATED', tabId: 1, requests: [] })).toBe(true);
    expect(isExtensionMessage({ type: 'NOPE' })).toBe(false);
    expect(isExtensionErrorResponse({ error: 'boom' })).toBe(true);
    expect(isExtensionErrorResponse({ error: 1 })).toBe(false);
  });
});

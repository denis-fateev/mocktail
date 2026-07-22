import type { ExtensionEvent, ExtensionMessage, ExtensionRequest } from './messages';
import type { ExtensionErrorResponse } from './responses';

function hasType(value: unknown): value is { type: unknown } {
  return typeof value === 'object' && value !== null && 'type' in value;
}

function hasTabId(value: unknown): value is { tabId: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'tabId' in value &&
    typeof (value as { tabId: unknown }).tabId === 'number'
  );
}

export function isExtensionRequest(message: unknown): message is ExtensionRequest {
  if (!hasType(message) || typeof message.type !== 'string') return false;

  switch (message.type) {
    case 'DEBUGGER_START':
    case 'DEBUGGER_STOP':
    case 'GET_TAB_STATE':
    case 'CLEAR_REQUESTS':
      return hasTabId(message);
    case 'GET_MOCK_RULES':
    case 'GET_RULE_SETS':
      return true;
    case 'GET_MOCK_STATS':
      return hasTabId(message);
    case 'SET_MOCK_RULES':
      return 'rules' in message && Array.isArray((message as { rules: unknown }).rules);
    case 'ADD_MOCK_RULE':
      return (
        'rule' in message &&
        typeof (message as { rule: unknown }).rule === 'object' &&
        (message as { rule: unknown }).rule !== null &&
        'url' in (message as { rule: { url: unknown } }).rule &&
        typeof (message as { rule: { url: unknown } }).rule.url === 'string'
      );
    case 'REMOVE_MOCK_RULE':
      return 'index' in message && typeof (message as { index: unknown }).index === 'number';
    case 'CREATE_RULE_SET':
      return !('name' in message) || typeof (message as { name: unknown }).name === 'string';
    case 'DELETE_RULE_SET':
    case 'SET_ACTIVE_RULE_SET':
      return 'setId' in message && typeof (message as { setId: unknown }).setId === 'string';
    case 'EXPORT_RULE_SET':
      return true;
    case 'RENAME_RULE_SET':
      return (
        'setId' in message &&
        typeof (message as { setId: unknown }).setId === 'string' &&
        'name' in message &&
        typeof (message as { name: unknown }).name === 'string'
      );
    case 'IMPORT_RULE_SET':
      return 'text' in message && typeof (message as { text: unknown }).text === 'string';
    case 'GET_APP_SETTINGS':
      return true;
    case 'SET_APP_SETTINGS':
      return (
        'settings' in message &&
        typeof (message as { settings: unknown }).settings === 'object' &&
        (message as { settings: unknown }).settings !== null
      );
    default:
      return false;
  }
}

export function isExtensionEvent(message: unknown): message is ExtensionEvent {
  if (!hasType(message) || typeof message.type !== 'string') return false;

  switch (message.type) {
    case 'REQUESTS_UPDATED':
      return (
        hasTabId(message) &&
        'requests' in message &&
        Array.isArray((message as ExtensionEvent & { requests: unknown }).requests)
      );
    case 'MOCK_RULES_UPDATED':
      return 'rules' in message && Array.isArray((message as { rules: unknown }).rules);
    case 'RULE_SETS_UPDATED':
      return (
        'sets' in message &&
        Array.isArray((message as { sets: unknown }).sets) &&
        'activeSetId' in message &&
        typeof (message as { activeSetId: unknown }).activeSetId === 'string' &&
        'rules' in message &&
        Array.isArray((message as { rules: unknown }).rules)
      );
    case 'MOCK_STATS_UPDATED':
      return (
        hasTabId(message) &&
        'counts' in message &&
        typeof (message as { counts: unknown }).counts === 'object' &&
        (message as { counts: unknown }).counts !== null &&
        'total' in message &&
        typeof (message as { total: unknown }).total === 'number'
      );
    case 'TAB_STATE_CHANGED':
      return (
        hasTabId(message) &&
        'enabled' in message &&
        typeof (message as { enabled: unknown }).enabled === 'boolean'
      );
    case 'APP_SETTINGS_UPDATED':
      return (
        'settings' in message &&
        typeof (message as { settings: unknown }).settings === 'object' &&
        (message as { settings: unknown }).settings !== null
      );
    default:
      return false;
  }
}

export function isExtensionMessage(message: unknown): message is ExtensionMessage {
  return isExtensionRequest(message) || isExtensionEvent(message);
}

export function isExtensionErrorResponse(response: unknown): response is ExtensionErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ExtensionErrorResponse).error === 'string'
  );
}

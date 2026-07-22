import type { CapturedRequest } from '../network/types';
import type { RuleSetSummary } from '../rules/rule-set';
import type { MockRule } from '../rules/types';
import type { AppSettings } from '../settings/types';

/** Messages sent from UI (or other extension contexts) to the background service worker. */
export type ExtensionRequest =
  | { type: 'DEBUGGER_START'; tabId: number }
  | { type: 'DEBUGGER_STOP'; tabId: number }
  | { type: 'GET_TAB_STATE'; tabId: number }
  | { type: 'CLEAR_REQUESTS'; tabId: number }
  | { type: 'GET_MOCK_RULES' }
  | { type: 'GET_RULE_SETS' }
  | { type: 'GET_MOCK_STATS'; tabId: number }
  | { type: 'SET_MOCK_RULES'; rules: MockRule[] }
  | { type: 'ADD_MOCK_RULE'; rule: MockRule }
  | { type: 'REMOVE_MOCK_RULE'; index: number }
  | { type: 'CREATE_RULE_SET'; name?: string }
  | { type: 'DELETE_RULE_SET'; setId: string }
  | { type: 'RENAME_RULE_SET'; setId: string; name: string }
  | { type: 'SET_ACTIVE_RULE_SET'; setId: string }
  | { type: 'EXPORT_RULE_SET' }
  | { type: 'IMPORT_RULE_SET'; text: string }
  | { type: 'GET_APP_SETTINGS' }
  | { type: 'SET_APP_SETTINGS'; settings: Partial<AppSettings> };

/** Push events broadcast from background to listening UI contexts. */
export type RequestsUpdatedMessage = {
  type: 'REQUESTS_UPDATED';
  tabId: number;
  requests: CapturedRequest[];
};

export type MockRulesUpdatedMessage = {
  type: 'MOCK_RULES_UPDATED';
  rules: MockRule[];
};

export type RuleSetsUpdatedMessage = {
  type: 'RULE_SETS_UPDATED';
  sets: RuleSetSummary[];
  activeSetId: string;
  rules: MockRule[];
};

export type MockStatsUpdatedMessage = {
  type: 'MOCK_STATS_UPDATED';
  tabId: number;
  counts: Record<string, number>;
  total: number;
};

export type TabStateChangedMessage = {
  type: 'TAB_STATE_CHANGED';
  tabId: number;
  enabled: boolean;
};

export type AppSettingsUpdatedMessage = {
  type: 'APP_SETTINGS_UPDATED';
  settings: AppSettings;
};

export type ExtensionEvent =
  | RequestsUpdatedMessage
  | MockRulesUpdatedMessage
  | RuleSetsUpdatedMessage
  | MockStatsUpdatedMessage
  | TabStateChangedMessage
  | AppSettingsUpdatedMessage;

export type ExtensionMessage = ExtensionRequest | ExtensionEvent;

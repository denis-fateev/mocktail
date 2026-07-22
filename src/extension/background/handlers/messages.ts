import { isExtensionRequest } from '@shared/protocol/guards';
import type {
  AppSettingsResponse,
  AppSettingsSetResponse,
  ClearRequestsResponse,
  DebuggerStartResponse,
  DebuggerStopResponse,
  ExtensionErrorResponse,
  MockRulesResponse,
  MockRulesSetResponse,
  MockStatsResponse,
  RuleSetExportResponse,
  RuleSetImportResponse,
  RuleSetMutationResponse,
  RuleSetsStateResponse,
  TabStateResponse,
} from '@shared/protocol/responses';
import { clearTabRequests, getRequests } from '../debugger';
import { reverseAllTabRequestOrders } from '../debugger/request-store';
import {
  addMockRule,
  createRuleSet,
  deleteRuleSet,
  ensureMockRulesReady,
  exportActiveRuleSet,
  getMockRules,
  getRuleSetsState,
  importRuleSet,
  removeMockRule,
  renameRuleSet,
  setActiveRuleSet,
  setMockRules,
} from '../rules/mock-rules';
import { getMockStats } from '../rules/mock-stats';
import { getAppSettings, setAppSettings } from '../settings/app-settings';

type MessageHandlers = {
  enableTab: (tabId: number) => Promise<void>;
  disableTab: (tabId: number) => Promise<void>;
  getTabState: (tabId: number) => Promise<TabStateResponse>;
};

function errorResponse(message: string): ExtensionErrorResponse {
  return { error: message };
}

function ruleSetsStateResponse(): RuleSetsStateResponse {
  return {
    ...getRuleSetsState(),
    rules: getMockRules(),
  };
}

async function withMockRulesReady<T>(run: () => T | Promise<T>): Promise<T> {
  await ensureMockRulesReady();
  return run();
}

export function initMessageHandler(handlers: MessageHandlers): void {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isExtensionRequest(message)) return;

    switch (message.type) {
      case 'DEBUGGER_START':
        handlers
          .enableTab(message.tabId)
          .then((): DebuggerStartResponse => ({
            enabled: true,
            requests: getRequests(message.tabId),
          }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'DEBUGGER_STOP':
        handlers
          .disableTab(message.tabId)
          .then((): DebuggerStopResponse => ({ ok: true, enabled: false }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'GET_TAB_STATE':
        handlers
          .getTabState(message.tabId)
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'CLEAR_REQUESTS':
        try {
          clearTabRequests(message.tabId);
          const response: ClearRequestsResponse = {
            ok: true,
            requests: getRequests(message.tabId),
          };
          sendResponse(response);
        } catch (err) {
          sendResponse(errorResponse(err instanceof Error ? err.message : 'Failed to clear requests'));
        }
        return true;

      case 'GET_MOCK_RULES':
        withMockRulesReady(() => ({ rules: getMockRules() } satisfies MockRulesResponse))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'GET_RULE_SETS':
        withMockRulesReady(() => ruleSetsStateResponse())
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'GET_MOCK_STATS':
        Promise.resolve(getMockStats(message.tabId) satisfies MockStatsResponse)
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'SET_MOCK_RULES':
        withMockRulesReady(() => setMockRules(message.rules))
          .then((rules): MockRulesSetResponse => ({ ok: true, rules }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'ADD_MOCK_RULE':
        withMockRulesReady(() => addMockRule(message.rule))
          .then((rules): MockRulesSetResponse => ({ ok: true, rules }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'REMOVE_MOCK_RULE':
        withMockRulesReady(() => removeMockRule(message.index))
          .then((rules): MockRulesSetResponse => ({ ok: true, rules }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'CREATE_RULE_SET':
        withMockRulesReady(() => createRuleSet(message.name))
          .then((state): RuleSetMutationResponse => ({ ok: true, ...state }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'DELETE_RULE_SET':
        withMockRulesReady(() => deleteRuleSet(message.setId))
          .then((state): RuleSetMutationResponse => ({ ok: true, ...state }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'RENAME_RULE_SET':
        withMockRulesReady(() => renameRuleSet(message.setId, message.name))
          .then((state): RuleSetMutationResponse => ({ ok: true, ...state }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'SET_ACTIVE_RULE_SET':
        withMockRulesReady(() => setActiveRuleSet(message.setId))
          .then((state): RuleSetMutationResponse => ({ ok: true, ...state }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'EXPORT_RULE_SET':
        withMockRulesReady(() => ({ text: exportActiveRuleSet() } satisfies RuleSetExportResponse))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'IMPORT_RULE_SET':
        withMockRulesReady(() => importRuleSet(message.text))
          .then((state): RuleSetImportResponse => ({ ok: true, ...state }))
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'GET_APP_SETTINGS':
        Promise.resolve({ settings: getAppSettings() } satisfies AppSettingsResponse)
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;

      case 'SET_APP_SETTINGS': {
        const previous = getAppSettings();
        setAppSettings(message.settings)
          .then((settings): AppSettingsSetResponse => {
            if (previous.newestRequestsFirst !== settings.newestRequestsFirst) {
              reverseAllTabRequestOrders();
            }
            return { ok: true, settings };
          })
          .then(sendResponse)
          .catch((err: Error) => sendResponse(errorResponse(err.message)));
        return true;
      }
    }
  });
}

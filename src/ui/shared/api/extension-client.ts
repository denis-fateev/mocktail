import type {
  AppSettingsResponse,
  AppSettingsSetResponse,
  ClearRequestsResponse,
  DebuggerStartResponse,
  DebuggerStopResponse,
  ExtensionErrorResponse,
  MockRulesResponse,
  MockRulesSetResponse,
  RuleSetExportResponse,
  RuleSetImportResponse,
  RuleSetMutationResponse,
  RuleSetsStateResponse,
  MockStatsResponse,
  TabStateResponse,
} from '@shared/protocol/responses';
import type { ExtensionRequest } from '@shared/protocol/messages';
import type { MockRule } from '@shared/rules/types';
import type { AppSettings } from '@shared/settings/types';

export async function getTabState(
  tabId: number,
): Promise<TabStateResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'GET_TAB_STATE' }> = {
    type: 'GET_TAB_STATE',
    tabId,
  };
  return chrome.runtime.sendMessage(request);
}

export async function getMockRules(): Promise<MockRulesResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'GET_MOCK_RULES' }> = {
    type: 'GET_MOCK_RULES',
  };
  return chrome.runtime.sendMessage(request);
}

export async function getRuleSets(): Promise<RuleSetsStateResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'GET_RULE_SETS' }> = {
    type: 'GET_RULE_SETS',
  };
  return chrome.runtime.sendMessage(request);
}

export async function getMockStats(
  tabId: number,
): Promise<MockStatsResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'GET_MOCK_STATS' }> = {
    type: 'GET_MOCK_STATS',
    tabId,
  };
  return chrome.runtime.sendMessage(request);
}

export async function setMockRules(
  rules: MockRule[],
): Promise<MockRulesSetResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'SET_MOCK_RULES' }> = {
    type: 'SET_MOCK_RULES',
    rules,
  };
  return chrome.runtime.sendMessage(request);
}

export async function addMockRule(
  rule: MockRule,
): Promise<MockRulesSetResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'ADD_MOCK_RULE' }> = {
    type: 'ADD_MOCK_RULE',
    rule,
  };
  return chrome.runtime.sendMessage(request);
}

export async function removeMockRule(
  index: number,
): Promise<MockRulesSetResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'REMOVE_MOCK_RULE' }> = {
    type: 'REMOVE_MOCK_RULE',
    index,
  };
  return chrome.runtime.sendMessage(request);
}

export async function createRuleSet(
  name?: string,
): Promise<RuleSetMutationResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'CREATE_RULE_SET' }> = {
    type: 'CREATE_RULE_SET',
    ...(name !== undefined ? { name } : {}),
  };
  return chrome.runtime.sendMessage(request);
}

export async function deleteRuleSet(
  setId: string,
): Promise<RuleSetMutationResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'DELETE_RULE_SET' }> = {
    type: 'DELETE_RULE_SET',
    setId,
  };
  return chrome.runtime.sendMessage(request);
}

export async function renameRuleSet(
  setId: string,
  name: string,
): Promise<RuleSetMutationResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'RENAME_RULE_SET' }> = {
    type: 'RENAME_RULE_SET',
    setId,
    name,
  };
  return chrome.runtime.sendMessage(request);
}

export async function setActiveRuleSet(
  setId: string,
): Promise<RuleSetMutationResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'SET_ACTIVE_RULE_SET' }> = {
    type: 'SET_ACTIVE_RULE_SET',
    setId,
  };
  return chrome.runtime.sendMessage(request);
}

export async function exportRuleSet(): Promise<RuleSetExportResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'EXPORT_RULE_SET' }> = {
    type: 'EXPORT_RULE_SET',
  };
  return chrome.runtime.sendMessage(request);
}

export async function importRuleSet(
  text: string,
): Promise<RuleSetImportResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'IMPORT_RULE_SET' }> = {
    type: 'IMPORT_RULE_SET',
    text,
  };
  return chrome.runtime.sendMessage(request);
}

export async function startMocking(
  tabId: number,
): Promise<DebuggerStartResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'DEBUGGER_START' }> = {
    type: 'DEBUGGER_START',
    tabId,
  };
  return chrome.runtime.sendMessage(request);
}

export async function stopMocking(
  tabId: number,
): Promise<DebuggerStopResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'DEBUGGER_STOP' }> = {
    type: 'DEBUGGER_STOP',
    tabId,
  };
  return chrome.runtime.sendMessage(request);
}

export async function clearRequests(
  tabId: number,
): Promise<ClearRequestsResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'CLEAR_REQUESTS' }> = {
    type: 'CLEAR_REQUESTS',
    tabId,
  };
  return chrome.runtime.sendMessage(request);
}

export async function getAppSettings(): Promise<AppSettingsResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'GET_APP_SETTINGS' }> = {
    type: 'GET_APP_SETTINGS',
  };
  return chrome.runtime.sendMessage(request);
}

export async function setAppSettings(
  settings: Partial<AppSettings>,
): Promise<AppSettingsSetResponse | ExtensionErrorResponse> {
  const request: Extract<ExtensionRequest, { type: 'SET_APP_SETTINGS' }> = {
    type: 'SET_APP_SETTINGS',
    settings,
  };
  return chrome.runtime.sendMessage(request);
}

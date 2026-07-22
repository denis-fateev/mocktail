import type { CapturedRequest } from '../network/types';
import type { RuleSetSummary } from '../rules/rule-set';
import type { MockRule } from '../rules/types';
import type { AppSettings } from '../settings/types';

export type ExtensionErrorResponse = {
  error: string;
};

export type DebuggerStartResponse = {
  enabled: true;
  requests: CapturedRequest[];
};

export type DebuggerStopResponse = {
  ok: true;
  enabled: false;
};

export type TabStateResponse = {
  enabled: boolean;
  requests: CapturedRequest[];
};

export type ClearRequestsResponse = {
  ok: true;
  requests: CapturedRequest[];
};

export type MockRulesResponse = {
  rules: MockRule[];
};

export type MockRulesSetResponse = {
  ok: true;
  rules: MockRule[];
};

export type RuleSetsStateResponse = {
  sets: RuleSetSummary[];
  activeSetId: string;
  rules: MockRule[];
};

export type RuleSetMutationResponse = {
  ok: true;
} & RuleSetsStateResponse;

export type RuleSetExportResponse = {
  text: string;
};

export type RuleSetImportResponse = {
  ok: true;
  setId: string;
} & RuleSetsStateResponse;

export type MockStatsResponse = {
  counts: Record<string, number>;
  total: number;
};

export type AppSettingsResponse = {
  settings: AppSettings;
};

export type AppSettingsSetResponse = {
  ok: true;
  settings: AppSettings;
};

export type ExtensionResponse =
  | DebuggerStartResponse
  | DebuggerStopResponse
  | TabStateResponse
  | ClearRequestsResponse
  | MockRulesResponse
  | MockRulesSetResponse
  | RuleSetsStateResponse
  | RuleSetMutationResponse
  | RuleSetExportResponse
  | RuleSetImportResponse
  | MockStatsResponse
  | AppSettingsResponse
  | AppSettingsSetResponse
  | ExtensionErrorResponse;

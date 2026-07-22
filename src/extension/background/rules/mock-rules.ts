import type { RuleSetsUpdatedMessage } from '@shared/protocol/messages';
import { parseRuleSetExport, resolveImportedRuleSetName, serializeRuleSetExport } from '@shared/rules/import-export';
import { normalizeRule } from '@shared/rules/normalize';
import { normalizeResponseHeaders } from '@shared/rules/response-headers';
import {
  createDefaultRuleSetsState,
  createRuleSet as buildRuleSet,
  nextDefaultRuleSetName,
  normalizeRuleSetsState,
  summarizeRuleSet,
  type RuleSet,
  type RuleSetSummary,
  type RuleSetsState,
} from '@shared/rules/rule-set';
import { createMockRule, type MockRule, type MockRuleInput } from '@shared/rules/types';

const STORAGE_KEY = 'ruleSets';

let state: RuleSetsState = createDefaultRuleSetsState();
let initPromise: Promise<void> | null = null;

function getActiveSet(): RuleSet {
  const activeSet = state.sets.find((set) => set.id === state.activeSetId);
  if (activeSet) {
    return activeSet;
  }

  if (state.sets.length === 0) {
    state = createDefaultRuleSetsState();
    return state.sets[0];
  }

  state.activeSetId = state.sets[0].id;
  return state.sets[0];
}

function buildRuleSetsSnapshot(): { sets: RuleSetSummary[]; activeSetId: string } {
  return {
    sets: state.sets.map(summarizeRuleSet),
    activeSetId: state.activeSetId,
  };
}

function broadcastRuleSetsUpdated(): void {
  const message: RuleSetsUpdatedMessage = {
    type: 'RULE_SETS_UPDATED',
    ...buildRuleSetsSnapshot(),
    rules: getMockRules(),
  };
  chrome.runtime.sendMessage(message).catch(() => {});
}

async function persistState(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
  broadcastRuleSetsUpdated();
}

function updateActiveSetRules(rules: MockRule[]): MockRule[] {
  const activeSet = getActiveSet();
  activeSet.rules = rules.map(normalizeRule);
  return getMockRules();
}

export function getRuleSetsState(): { sets: RuleSetSummary[]; activeSetId: string } {
  return buildRuleSetsSnapshot();
}

export function getMockRules(): MockRule[] {
  return getActiveSet().rules.map((rule) => ({
    ...rule,
    responseHeaders: normalizeResponseHeaders(rule.responseHeaders),
  }));
}

export async function initMockRules(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const { [STORAGE_KEY]: stored } = await chrome.storage.local.get(STORAGE_KEY);
      state = normalizeRuleSetsState(stored);

      if (!stored) {
        await chrome.storage.local.set({ [STORAGE_KEY]: state });
      }
    })();
  }

  await initPromise;
}

export async function ensureMockRulesReady(): Promise<void> {
  await initMockRules();
}

export async function setMockRules(rules: MockRule[]): Promise<MockRule[]> {
  updateActiveSetRules(rules);
  await persistState();
  return getMockRules();
}

export async function addMockRule(input: MockRuleInput): Promise<MockRule[]> {
  const trimmed = input.url.trim();
  if (!trimmed) return getMockRules();

  const rule = normalizeRule(createMockRule(trimmed, input));
  const activeSet = getActiveSet();
  activeSet.rules = [rule, ...activeSet.rules];
  await persistState();
  return getMockRules();
}

export async function removeMockRule(index: number): Promise<MockRule[]> {
  const activeSet = getActiveSet();
  if (index < 0 || index >= activeSet.rules.length) {
    return getMockRules();
  }

  activeSet.rules = activeSet.rules.filter((_, currentIndex) => currentIndex !== index);
  await persistState();
  return getMockRules();
}

export async function createRuleSet(name?: string): Promise<{ sets: RuleSetSummary[]; activeSetId: string; rules: MockRule[] }> {
  const existingNames = state.sets.map((set) => set.name);
  const nextSet = buildRuleSet(name?.trim() ? name : nextDefaultRuleSetName(existingNames));
  state.sets = [nextSet, ...state.sets];
  state.activeSetId = nextSet.id;
  await persistState();
  return { ...buildRuleSetsSnapshot(), rules: getMockRules() };
}

export async function deleteRuleSet(setId: string): Promise<{ sets: RuleSetSummary[]; activeSetId: string; rules: MockRule[] }> {
  if (state.sets.length <= 1) {
    throw new Error('Cannot delete the last rule set.');
  }

  const nextSets = state.sets.filter((set) => set.id !== setId);
  if (nextSets.length === state.sets.length) {
    return { ...buildRuleSetsSnapshot(), rules: getMockRules() };
  }

  state.sets = nextSets;
  if (!state.sets.some((set) => set.id === state.activeSetId)) {
    state.activeSetId = state.sets[0].id;
  }

  await persistState();
  return { ...buildRuleSetsSnapshot(), rules: getMockRules() };
}

export async function renameRuleSet(
  setId: string,
  name: string,
): Promise<{ sets: RuleSetSummary[]; activeSetId: string; rules: MockRule[] }> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Rule set name cannot be empty.');
  }

  const targetSet = state.sets.find((set) => set.id === setId);
  if (!targetSet) {
    return { ...buildRuleSetsSnapshot(), rules: getMockRules() };
  }

  targetSet.name = trimmed;
  await persistState();
  return { ...buildRuleSetsSnapshot(), rules: getMockRules() };
}

export async function setActiveRuleSet(
  setId: string,
): Promise<{ sets: RuleSetSummary[]; activeSetId: string; rules: MockRule[] }> {
  if (!state.sets.some((set) => set.id === setId)) {
    return { ...buildRuleSetsSnapshot(), rules: getMockRules() };
  }

  state.activeSetId = setId;
  await persistState();
  return { ...buildRuleSetsSnapshot(), rules: getMockRules() };
}

export function exportActiveRuleSet(): string {
  const targetSet = getActiveSet();
  return serializeRuleSetExport(targetSet.name, targetSet.rules);
}

export async function importRuleSet(
  text: string,
): Promise<{ sets: RuleSetSummary[]; activeSetId: string; rules: MockRule[]; setId: string }> {
  const parsed = parseRuleSetExport(text);
  const existingNames = state.sets.map((set) => set.name);
  const importedSet = buildRuleSet(resolveImportedRuleSetName(parsed.name, existingNames), parsed.rules);

  state.sets = [importedSet, ...state.sets];
  state.activeSetId = importedSet.id;
  await persistState();

  return {
    setId: importedSet.id,
    ...buildRuleSetsSnapshot(),
    rules: getMockRules(),
  };
}

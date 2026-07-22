import { normalizeRule, sanitizeRuleForStorage } from './normalize';
import { type MockRule } from './types';

export type RuleSet = {
  id: string;
  name: string;
  rules: MockRule[];
};

export type RuleSetsState = {
  sets: RuleSet[];
  activeSetId: string;
};

export type RuleSetSummary = {
  id: string;
  name: string;
  ruleCount: number;
};

export function createRuleSetId(): string {
  return crypto.randomUUID();
}

export function createRuleSet(name: string, rules: MockRule[] = []): RuleSet {
  return {
    id: createRuleSetId(),
    name: name.trim() || 'Untitled',
    rules: rules.map(normalizeRule),
  };
}

export function normalizeRuleSet(set: Partial<RuleSet> & Pick<RuleSet, 'name'>): RuleSet {
  const rules = (set.rules ?? [])
    .map(sanitizeRuleForStorage)
    .filter((rule): rule is MockRule => rule !== null);

  return {
    id: typeof set.id === 'string' && set.id ? set.id : createRuleSetId(),
    name: typeof set.name === 'string' ? set.name.trim() || 'Untitled' : 'Untitled',
    rules,
  };
}

export function summarizeRuleSet(set: RuleSet): RuleSetSummary {
  return {
    id: set.id,
    name: set.name,
    ruleCount: set.rules.length,
  };
}

export function createDefaultRuleSetsState(): RuleSetsState {
  const defaultSet = createRuleSet('Default');
  return {
    sets: [defaultSet],
    activeSetId: defaultSet.id,
  };
}

export function normalizeRuleSetsState(value: unknown): RuleSetsState {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('sets' in value) ||
    !Array.isArray((value as RuleSetsState).sets) ||
    !('activeSetId' in value) ||
    typeof (value as RuleSetsState).activeSetId !== 'string'
  ) {
    return createDefaultRuleSetsState();
  }

  const sets = (value as RuleSetsState).sets
    .filter((set): set is RuleSet => typeof set === 'object' && set !== null && 'name' in set)
    .map((set) => normalizeRuleSet(set as RuleSet));

  if (sets.length === 0) {
    return createDefaultRuleSetsState();
  }

  const activeSetId = sets.some((set) => set.id === (value as RuleSetsState).activeSetId)
    ? (value as RuleSetsState).activeSetId
    : sets[0].id;

  return { sets, activeSetId };
}

export function uniqueRuleSetName(name: string, existingNames: readonly string[]): string {
  const trimmed = name.trim() || 'Untitled';
  if (!existingNames.includes(trimmed)) return trimmed;

  let index = 2;
  while (existingNames.includes(`${trimmed} (${index})`)) {
    index += 1;
  }

  return `${trimmed} (${index})`;
}

export function nextDefaultRuleSetName(existingNames: readonly string[]): string {
  return uniqueRuleSetName('New set', existingNames);
}

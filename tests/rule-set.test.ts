import { describe, expect, it } from 'vitest';
import {
  createDefaultRuleSetsState,
  nextDefaultRuleSetName,
  normalizeRuleSetsState,
  uniqueRuleSetName,
} from '../src/shared/rules/rule-set';
import { DEFAULT_HTTP_METHOD } from '../src/shared/rules/types';

describe('rule set state', () => {
  it('creates a default state with one active set', () => {
    const state = createDefaultRuleSetsState();
    expect(state.sets).toHaveLength(1);
    expect(state.activeSetId).toBe(state.sets[0]?.id);
    expect(state.sets[0]?.name).toBe('Default');
  });

  it('normalizes invalid persisted state', () => {
    const state = normalizeRuleSetsState({ sets: [], activeSetId: 'missing' });
    expect(state.sets).toHaveLength(1);
    expect(state.activeSetId).toBe(state.sets[0]?.id);
  });

  it('generates unique default set names', () => {
    expect(nextDefaultRuleSetName(['New set'])).toBe('New set (2)');
    expect(uniqueRuleSetName('API', ['API', 'Other'])).toBe('API (2)');
  });

  it('repairs corrupt persisted rules without crashing', () => {
    const defaultState = createDefaultRuleSetsState();
    const setId = defaultState.sets[0]?.id ?? 'set-1';

    const state = normalizeRuleSetsState({
      sets: [
        {
          id: setId,
          name: 'Broken',
          rules: [
            {
              id: 'rule-1',
              url: 'https://api.example.com/users',
              method: 'GETS',
              responseHeaders: 'invalid',
            },
          ],
        },
      ],
      activeSetId: setId,
    });

    expect(state.sets).toHaveLength(1);
    expect(state.sets[0]?.rules).toHaveLength(1);
    expect(state.sets[0]?.rules[0]?.method).toBe(DEFAULT_HTTP_METHOD);
    expect(state.sets[0]?.rules[0]?.responseHeaders).toEqual([
      { key: 'Content-Type', value: 'application/json; charset=utf-8' },
    ]);
  });
});

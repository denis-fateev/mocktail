import { useCallback, useEffect, useRef, useState } from 'react';
import { isExtensionErrorResponse, isExtensionEvent } from '@shared/protocol/guards';
import type { RuleSetSummary } from '@shared/rules/rule-set';
import { createMockRule, DEFAULT_HTTP_METHOD, duplicateMockRule, type MockRule, type MockRuleUpdate } from '@shared/rules/types';
import {
  addMockRule as addMockRuleRequest,
  createRuleSet as createRuleSetRequest,
  deleteRuleSet as deleteRuleSetRequest,
  exportRuleSet as exportRuleSetRequest,
  getRuleSets as getRuleSetsRequest,
  getMockStats as getMockStatsRequest,
  importRuleSet as importRuleSetRequest,
  removeMockRule as removeMockRuleRequest,
  renameRuleSet as renameRuleSetRequest,
  setActiveRuleSet as setActiveRuleSetRequest,
  setMockRules as setMockRulesRequest,
} from '@ui/shared/api/extension-client';

type RuleSetsState = {
  sets: RuleSetSummary[];
  activeSetId: string;
  rules: MockRule[];
};

function applyRuleSetsState(
  setSets: (sets: RuleSetSummary[]) => void,
  setActiveSetId: (activeSetId: string) => void,
  setRules: (rules: MockRule[]) => void,
  state: RuleSetsState,
): void {
  setSets(state.sets);
  setActiveSetId(state.activeSetId);
  setRules(state.rules);
}

export function useMockRules() {
  const [rules, setRules] = useState<MockRule[]>([]);
  const [sets, setSets] = useState<RuleSetSummary[]>([]);
  const [activeSetId, setActiveSetId] = useState('');
  const [mockCounts, setMockCounts] = useState<Record<string, number>>({});
  const [totalMocked, setTotalMocked] = useState(0);
  const [tabId, setTabId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highlightRule = useCallback((ruleId: string) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    setHighlightedRuleId(ruleId);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedRuleId(null);
      highlightTimeoutRef.current = null;
    }, 1300);
  }, []);

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        setTabId(tab.id);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await getRuleSetsRequest();
        if (isExtensionErrorResponse(response)) {
          setError(response.error);
          return;
        }
        applyRuleSetsState(setSets, setActiveSetId, setRules, response);
      } catch {
        setError('Failed to load rule sets');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (tabId === null) return;

    (async () => {
      try {
        const response = await getMockStatsRequest(tabId);
        if (isExtensionErrorResponse(response)) return;
        setMockCounts(response.counts);
        setTotalMocked(response.total);
      } catch {
        // Stats are optional; ignore transient load errors.
      }
    })();
  }, [tabId]);

  useEffect(() => {
    const onMessage = (message: unknown) => {
      if (!isExtensionEvent(message)) return;
      if (message.type === 'RULE_SETS_UPDATED') {
        applyRuleSetsState(setSets, setActiveSetId, setRules, message);
        return;
      }
      if (message.type === 'MOCK_STATS_UPDATED' && tabId !== null && message.tabId === tabId) {
        setMockCounts(message.counts);
        setTotalMocked(message.total);
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [tabId]);

  const syncRules = useCallback(async (nextRules: MockRule[]) => {
    setRules(nextRules);
    setError(null);

    try {
      const response = await setMockRulesRequest(nextRules);
      if (isExtensionErrorResponse(response)) {
        setError(response.error);
        return;
      }
      setRules(response.rules);
    } catch {
      setError('Failed to save mock rules');
    }
  }, []);

  const applyMutationResponse = useCallback((response: RuleSetsState) => {
    applyRuleSetsState(setSets, setActiveSetId, setRules, response);
    setError(null);
  }, []);

  const updateRuleAt = useCallback(
    (index: number, update: MockRuleUpdate) => {
      const nextRules = rules.map((rule, currentIndex) => (currentIndex === index ? { ...rule, ...update } : rule));
      void syncRules(nextRules);
    },
    [syncRules, rules],
  );

  const addEmptyRule = useCallback(() => {
    const newRule = createMockRule('', { method: DEFAULT_HTTP_METHOD });
    highlightRule(newRule.id);
    void syncRules([newRule, ...rules]);
  }, [highlightRule, syncRules, rules]);

  const addRuleFromRequest = useCallback(
    async (rule: MockRule, onAdded?: () => void) => {
      highlightRule(rule.id);

      try {
        await addMockRuleRequest(rule);
        onAdded?.();
      } catch {
        // Highlight already applied; list refreshes via RULE_SETS_UPDATED when the write succeeds.
      }
    },
    [highlightRule],
  );

  const moveRuleUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const nextRules = [...rules];
      [nextRules[index - 1], nextRules[index]] = [nextRules[index], nextRules[index - 1]];
      void syncRules(nextRules);
    },
    [syncRules, rules],
  );

  const moveRuleDown = useCallback(
    (index: number) => {
      if (index >= rules.length - 1) return;
      const nextRules = [...rules];
      [nextRules[index], nextRules[index + 1]] = [nextRules[index + 1], nextRules[index]];
      void syncRules(nextRules);
    },
    [syncRules, rules],
  );

  const duplicateRuleAt = useCallback(
    (index: number) => {
      const rule = rules[index];
      if (!rule) return;
      const duplicated = duplicateMockRule(rule);
      highlightRule(duplicated.id);
      void syncRules([duplicated, ...rules]);
    },
    [highlightRule, syncRules, rules],
  );

  const setAllRulesCollapsed = useCallback(
    (collapsed: boolean) => {
      void syncRules(rules.map((rule) => ({ ...rule, collapsed })));
    },
    [syncRules, rules],
  );

  const removeRuleAt = useCallback(async (index: number) => {
    setError(null);

    try {
      const response = await removeMockRuleRequest(index);
      if (isExtensionErrorResponse(response)) {
        setError(response.error);
        return;
      }
      setRules(response.rules);
    } catch {
      setError('Failed to remove mock rule');
    }
  }, []);

  const createSet = useCallback(
    async (name?: string): Promise<string | null> => {
      setError(null);

      try {
        const response = await createRuleSetRequest(name);
        if (isExtensionErrorResponse(response)) {
          setError(response.error);
          return null;
        }
        applyMutationResponse(response);
        return response.activeSetId;
      } catch {
        setError('Failed to create rule set');
        return null;
      }
    },
    [applyMutationResponse],
  );

  const deleteSet = useCallback(
    async (setId: string): Promise<string | null> => {
      setError(null);

      try {
        const response = await deleteRuleSetRequest(setId);
        if (isExtensionErrorResponse(response)) {
          setError(response.error);
          return null;
        }
        applyMutationResponse(response);
        return response.activeSetId;
      } catch {
        setError('Failed to delete rule set');
        return null;
      }
    },
    [applyMutationResponse],
  );

  const renameSet = useCallback(
    async (setId: string, name: string) => {
      setError(null);

      try {
        const response = await renameRuleSetRequest(setId, name);
        if (isExtensionErrorResponse(response)) {
          setError(response.error);
          return;
        }
        applyMutationResponse(response);
      } catch {
        setError('Failed to rename rule set');
      }
    },
    [applyMutationResponse],
  );

  const switchSet = useCallback(
    async (setId: string): Promise<string | null> => {
      if (setId === activeSetId) return activeSetId;
      setError(null);

      try {
        const response = await setActiveRuleSetRequest(setId);
        if (isExtensionErrorResponse(response)) {
          setError(response.error);
          return null;
        }
        applyMutationResponse(response);
        return response.activeSetId;
      } catch {
        setError('Failed to switch rule set');
        return null;
      }
    },
    [activeSetId, applyMutationResponse],
  );

  const exportActiveSet = useCallback(async (): Promise<string | null> => {
    setError(null);

    try {
      const response = await exportRuleSetRequest();
      if (isExtensionErrorResponse(response)) {
        setError(response.error);
        return null;
      }
      return response.text;
    } catch {
      setError('Failed to export rule set');
      return null;
    }
  }, []);

  const importSet = useCallback(
    async (text: string): Promise<string | null> => {
      setError(null);

      try {
        const response = await importRuleSetRequest(text);
        if (isExtensionErrorResponse(response)) {
          setError(response.error);
          return response.error;
        }
        applyMutationResponse(response);
        return null;
      } catch {
        const message = 'Failed to import rule set';
        setError(message);
        return message;
      }
    },
    [applyMutationResponse],
  );

  return {
    rules,
    sets,
    activeSetId,
    mockCounts,
    totalMocked,
    error,
    loading,
    updateRuleAt,
    addEmptyRule,
    addRuleFromRequest,
    highlightedRuleId,
    moveRuleUp,
    moveRuleDown,
    duplicateRuleAt,
    setAllRulesCollapsed,
    removeRuleAt,
    createSet,
    deleteSet,
    renameSet,
    switchSet,
    exportActiveSet,
    importSet,
  };
}

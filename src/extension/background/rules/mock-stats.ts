import type { MockStatsUpdatedMessage } from '@shared/protocol/messages';
import type { MockRule } from '@shared/rules/types';

type TabMockStats = {
  byRuleKey: Map<string, number>;
  total: number;
};

const statsByTab = new Map<number, TabMockStats>();

function getOrCreate(tabId: number): TabMockStats {
  let stats = statsByTab.get(tabId);
  if (!stats) {
    stats = { byRuleKey: new Map(), total: 0 };
    statsByTab.set(tabId, stats);
  }
  return stats;
}

function broadcastMockStatsUpdated(tabId: number): void {
  const { counts, total } = getMockStats(tabId);
  const message: MockStatsUpdatedMessage = {
    type: 'MOCK_STATS_UPDATED',
    tabId,
    counts,
    total,
  };
  chrome.runtime.sendMessage(message).catch(() => {});
}

export function recordMockedRequest(tabId: number, rule: MockRule): void {
  const stats = getOrCreate(tabId);
  stats.byRuleKey.set(rule.id, (stats.byRuleKey.get(rule.id) ?? 0) + 1);
  stats.total += 1;
  broadcastMockStatsUpdated(tabId);
}

export function clearMockStats(tabId: number): void {
  if (!statsByTab.has(tabId)) return;
  statsByTab.delete(tabId);
  broadcastMockStatsUpdated(tabId);
}

export function getMockStats(tabId: number): { counts: Record<string, number>; total: number } {
  const stats = statsByTab.get(tabId);
  if (!stats) {
    return { counts: {}, total: 0 };
  }

  return {
    counts: Object.fromEntries(stats.byRuleKey),
    total: stats.total,
  };
}


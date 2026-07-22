import type { TabStateChangedMessage } from '@shared/protocol/messages';
import {
  attachDebugger,
  detachDebugger,
  getRequests,
  isTabAttached,
} from './debugger';
import { updateBadgeForActiveTab } from './badge';
import { isTabEnabled, readEnabledTabIds, writeEnabledTabIds } from './enabled-tabs';

export { updateBadgeForActiveTab };

export async function enableTab(tabId: number): Promise<void> {
  const ids = await readEnabledTabIds();
  ids.add(tabId);
  await writeEnabledTabIds(ids);

  if (!isTabAttached(tabId)) {
    await attachDebugger(tabId);
  }

  broadcastTabStateChanged(tabId, true);
  await updateBadgeForActiveTab();
}

export async function disableTab(tabId: number): Promise<void> {
  const ids = await readEnabledTabIds();
  ids.delete(tabId);
  await writeEnabledTabIds(ids);

  await detachDebugger(tabId);
  broadcastTabStateChanged(tabId, false);
  await updateBadgeForActiveTab();
}

export async function removeTab(tabId: number): Promise<void> {
  const ids = await readEnabledTabIds();
  ids.delete(tabId);
  await writeEnabledTabIds(ids);
  await updateBadgeForActiveTab();
}

export async function getTabState(tabId: number): Promise<{
  enabled: boolean;
  requests: ReturnType<typeof getRequests>;
}> {
  return {
    enabled: await isTabEnabled(tabId),
    requests: getRequests(tabId),
  };
}

async function ensureAttachedIfEnabled(tabId: number): Promise<void> {
  if (!(await isTabEnabled(tabId)) || isTabAttached(tabId)) return;

  try {
    await attachDebugger(tabId);
  } catch {
    // tab may be unavailable (e.g. chrome:// pages)
  }
}

export async function restoreEnabledTabs(): Promise<void> {
  const ids = await readEnabledTabIds();
  for (const tabId of ids) {
    await ensureAttachedIfEnabled(tabId);
  }
  await updateBadgeForActiveTab();
}

function broadcastTabStateChanged(tabId: number, enabled: boolean): void {
  const message: TabStateChangedMessage = {
    type: 'TAB_STATE_CHANGED',
    tabId,
    enabled,
  };
  chrome.runtime.sendMessage(message).catch(() => {});
}

async function handleDebuggerDetachedByUser(tabId: number): Promise<void> {
  const ids = await readEnabledTabIds();
  if (!ids.delete(tabId)) return;
  await writeEnabledTabIds(ids);

  broadcastTabStateChanged(tabId, false);
  await updateBadgeForActiveTab();
}

export function initTabStateListeners(): void {
  chrome.debugger.onDetach.addListener((source, reason) => {
    if (reason === 'canceled_by_user' && source.tabId) {
      void handleDebuggerDetachedByUser(source.tabId).catch(() => {});
    }
  });

  chrome.tabs.onActivated.addListener(() => {
    void updateBadgeForActiveTab();
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
      void ensureAttachedIfEnabled(tabId).catch(() => {});
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    void removeTab(tabId).catch(() => {});
  });
}

import { DEBUGGER_VERSION, sendCommand, sendCommandSafe } from './cdp';
import { isTabAttached, markTabAttached, markTabDetached } from './attached-tabs';
import { clearPendingMocks } from './mock-interceptor';
import { clearTabRequests, initTabRequests } from './request-store';
import { clearMockStats } from '../rules/mock-stats';

/** Fetch domain is not available on every CDP target (e.g. service_worker). */
const FETCH_UNSUPPORTED_TYPES = new Set(['service_worker']);

async function setupAutoAttach(tabId: number, sessionId?: string): Promise<void> {
  await sendCommandSafe(tabId, sessionId, 'Target.setAutoAttach', {
    autoAttach: true,
    waitForDebuggerOnStart: true,
    flatten: true,
  });
}

async function enableNetwork(tabId: number, sessionId?: string): Promise<void> {
  await sendCommandSafe(tabId, sessionId, 'Network.enable');
}

async function enableFetch(tabId: number, sessionId?: string): Promise<boolean> {
  return sendCommandSafe(tabId, sessionId, 'Fetch.enable', {
    patterns: [{ urlPattern: '*' }],
  });
}

async function resumeIfWaiting(tabId: number, sessionId: string): Promise<void> {
  try {
    await sendCommand(tabId, sessionId, 'Runtime.runIfWaitingForDebugger');
  } catch {
    // Target may have detached or already resumed.
  }
}

async function onTargetAttached(
  tabId: number,
  sessionId: string,
  targetType: string,
  waitingForDebugger?: boolean,
): Promise<void> {
  try {
    await setupAutoAttach(tabId, sessionId);
    await enableNetwork(tabId, sessionId);
    if (!FETCH_UNSUPPORTED_TYPES.has(targetType)) {
      await enableFetch(tabId, sessionId);
    }
  } finally {
    if (waitingForDebugger) {
      await resumeIfWaiting(tabId, sessionId);
    }
  }
}

export async function attachDebugger(tabId: number): Promise<void> {
  if (isTabAttached(tabId)) return;

  await chrome.debugger.attach({ tabId }, DEBUGGER_VERSION);
  markTabAttached(tabId);
  initTabRequests(tabId);
  clearMockStats(tabId);
  clearPendingMocks(tabId);

  await setupAutoAttach(tabId);
  await enableNetwork(tabId);
  const fetchEnabled = await enableFetch(tabId);
  if (!fetchEnabled) {
    throw new Error('Fetch.enable is not available for this tab');
  }
}

export async function detachDebugger(tabId: number): Promise<void> {
  if (isTabAttached(tabId)) {
    try {
      await chrome.debugger.detach({ tabId });
    } catch {
      // tab may already be gone
    }
    markTabDetached(tabId);
    clearPendingMocks(tabId);
  }

  clearTabRequests(tabId);
  clearMockStats(tabId);
}

export function handleTargetAttached(
  tabId: number,
  sessionId: string,
  targetType: string,
  waitingForDebugger?: boolean,
): void {
  void onTargetAttached(tabId, sessionId, targetType, waitingForDebugger).catch(() => {});
}

export function handleDebuggerDetached(tabId: number): void {
  markTabDetached(tabId);
  clearPendingMocks(tabId);
  clearTabRequests(tabId);
  clearMockStats(tabId);
}

export function handleTabRemoved(tabId: number): void {
  markTabDetached(tabId);
  clearTabRequests(tabId);
  clearMockStats(tabId);
  clearPendingMocks(tabId);
}

// Re-export for consumers that only need attach state.
export { isTabAttached } from './attached-tabs';

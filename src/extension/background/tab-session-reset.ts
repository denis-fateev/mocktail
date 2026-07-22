import { isTabAttached } from './debugger/attached-tabs';
import { clearPendingMocks } from './debugger/mock-interceptor';
import { clearTabRequests } from './debugger/request-store';
import { clearMockStats } from './rules/mock-stats';
import { isClearHistoryOnReloadEnabled } from './settings/app-settings';

export function clearTabSessionOnNavigation(tabId: number): void {
  if (!isClearHistoryOnReloadEnabled()) return;
  if (!isTabAttached(tabId)) return;

  clearTabRequests(tabId);
  clearMockStats(tabId);
  clearPendingMocks(tabId);
}

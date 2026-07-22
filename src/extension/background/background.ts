import { initMessageHandler } from './handlers/messages';
import { initMockRules } from './rules/mock-rules';
import { initAppSettings } from './settings/app-settings';
import { initSidePanel, initSidePanelTabListeners } from './side-panel';
import {
  disableTab,
  enableTab,
  getTabState,
  initTabStateListeners,
  restoreEnabledTabs,
  updateBadgeForActiveTab,
} from './tab-state';

initMessageHandler({ enableTab, disableTab, getTabState });
initTabStateListeners();
initSidePanelTabListeners();

void initAppSettings().catch(() => {});
void initMockRules().catch(() => {});
void restoreEnabledTabs().catch(() => {});
void initSidePanel().catch(() => {});

chrome.runtime.onInstalled.addListener(() => {
  void updateBadgeForActiveTab();
});

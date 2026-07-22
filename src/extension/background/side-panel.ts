const PANEL_PATH = 'sidepanel.html';
const PANEL_OPEN_TABS_KEY = 'panelOpenTabIds';

/** In-memory cache so action clicks can open the panel without awaiting storage first. */
let panelOpenTabIds = new Set<number>();

async function hydratePanelOpenTabIds(): Promise<void> {
  const { [PANEL_OPEN_TABS_KEY]: stored = [] } = await chrome.storage.session.get(PANEL_OPEN_TABS_KEY);
  panelOpenTabIds = new Set(stored as number[]);
}

function persistPanelOpenTabIds(): void {
  void chrome.storage.session.set({ [PANEL_OPEN_TABS_KEY]: [...panelOpenTabIds] }).catch(() => {});
}

export function isPanelOpenForTab(tabId: number): boolean {
  return panelOpenTabIds.has(tabId);
}

export async function syncPanelForTab(tabId: number): Promise<void> {
  if (isPanelOpenForTab(tabId)) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: PANEL_PATH,
      enabled: true,
    });
    return;
  }

  await chrome.sidePanel.setOptions({ tabId, enabled: false });
}

/** Must run synchronously in the action click handler (user gesture) — no await before open() */
function openPanelForTab(tabId: number): void {
  panelOpenTabIds.add(tabId);
  persistPanelOpenTabIds();

  void chrome.sidePanel
    .setOptions({
      tabId,
      path: PANEL_PATH,
      enabled: true,
    })
    .catch(() => {});
  void chrome.sidePanel.open({ tabId }).catch(() => {});
}

function closePanelForTab(tabId: number): void {
  panelOpenTabIds.delete(tabId);
  persistPanelOpenTabIds();

  void chrome.sidePanel.close({ tabId }).catch(() => {});
  void chrome.sidePanel.setOptions({ tabId, enabled: false }).catch(() => {});
}

function onActionClicked(tab: chrome.tabs.Tab): void {
  if (!tab.id) return;

  if (isPanelOpenForTab(tab.id)) {
    closePanelForTab(tab.id);
    return;
  }

  openPanelForTab(tab.id);
}

export async function initSidePanel(): Promise<void> {
  await hydratePanelOpenTabIds();
  await chrome.sidePanel.setOptions({ enabled: false });

  chrome.action.onClicked.addListener(onActionClicked);

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.id) {
    await syncPanelForTab(activeTab.id);
  }
}

export function initSidePanelTabListeners(): void {
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    void syncPanelForTab(tabId).catch(() => {});
  });

  chrome.tabs.onCreated.addListener((tab) => {
    if (!tab.id) return;
    void chrome.sidePanel.setOptions({ tabId: tab.id, enabled: false }).catch(() => {});
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    if (!panelOpenTabIds.delete(tabId)) return;
    persistPanelOpenTabIds();
  });
}

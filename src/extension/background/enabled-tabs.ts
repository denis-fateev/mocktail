const STORAGE_KEY = 'enabledTabIds';

export async function readEnabledTabIds(): Promise<Set<number>> {
  const { [STORAGE_KEY]: enabledTabIds = [] } = await chrome.storage.session.get(STORAGE_KEY);
  return new Set(enabledTabIds as number[]);
}

export async function writeEnabledTabIds(ids: Set<number>): Promise<void> {
  await chrome.storage.session.set({ [STORAGE_KEY]: [...ids] });
}

export async function isTabEnabled(tabId: number): Promise<boolean> {
  const ids = await readEnabledTabIds();
  return ids.has(tabId);
}

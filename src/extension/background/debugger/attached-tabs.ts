const attachedTabs = new Set<number>();

export function isTabAttached(tabId: number): boolean {
  return attachedTabs.has(tabId);
}

export function markTabAttached(tabId: number): void {
  attachedTabs.add(tabId);
}

export function markTabDetached(tabId: number): void {
  attachedTabs.delete(tabId);
}

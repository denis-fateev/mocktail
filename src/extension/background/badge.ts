import { isTabEnabled } from './enabled-tabs';

const BADGE_ON_COLOR = '#22c55e';
const BADGE_ON_TEXT = 'on';

export async function updateBadgeForActiveTab(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      await chrome.action.setBadgeText({ text: '' });
      return;
    }

    const enabled = await isTabEnabled(tab.id);
    if (enabled) {
      await chrome.action.setBadgeBackgroundColor({ color: BADGE_ON_COLOR });
      await chrome.action.setBadgeText({ text: BADGE_ON_TEXT });
    } else {
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch {
    // Service worker may run without a window/tab; badge updates are best-effort.
  }
}

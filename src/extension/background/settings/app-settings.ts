import type { AppSettingsUpdatedMessage } from '@shared/protocol/messages';
import { DEFAULT_APP_SETTINGS } from '@shared/settings/defaults';
import type { AppSettings } from '@shared/settings/types';

const STORAGE_KEY = 'appSettings';

let appSettings: AppSettings = { ...DEFAULT_APP_SETTINGS };

function broadcastAppSettingsUpdated(): void {
  const message: AppSettingsUpdatedMessage = {
    type: 'APP_SETTINGS_UPDATED',
    settings: getAppSettings(),
  };
  chrome.runtime.sendMessage(message).catch(() => {});
}

function resolveBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function getAppSettings(): AppSettings {
  return { ...appSettings };
}

export function isSmartResponseHeadersEnabled(): boolean {
  return appSettings.smartResponseHeaders;
}

export function isCaptureResponseContentEnabled(): boolean {
  return appSettings.captureResponseBodies;
}

export function isClearHistoryOnReloadEnabled(): boolean {
  return appSettings.clearHistoryOnReload;
}

export function isFetchXhrOnlyEnabled(): boolean {
  return appSettings.fetchXhrOnly;
}

export function isNewestRequestsFirstEnabled(): boolean {
  return appSettings.newestRequestsFirst;
}

export async function initAppSettings(): Promise<void> {
  const { [STORAGE_KEY]: stored } = await chrome.storage.local.get(STORAGE_KEY);
  if (stored && typeof stored === 'object') {
    const value = stored as Partial<AppSettings>;
    appSettings = {
      smartResponseHeaders: resolveBoolean(value.smartResponseHeaders, DEFAULT_APP_SETTINGS.smartResponseHeaders),
      captureResponseBodies: resolveBoolean(value.captureResponseBodies, DEFAULT_APP_SETTINGS.captureResponseBodies),
      clearHistoryOnReload: resolveBoolean(value.clearHistoryOnReload, DEFAULT_APP_SETTINGS.clearHistoryOnReload),
      fetchXhrOnly: resolveBoolean(value.fetchXhrOnly, DEFAULT_APP_SETTINGS.fetchXhrOnly),
      newestRequestsFirst: resolveBoolean(value.newestRequestsFirst, DEFAULT_APP_SETTINGS.newestRequestsFirst),
    };
  }
}

export async function setAppSettings(update: Partial<AppSettings>): Promise<AppSettings> {
  appSettings = { ...appSettings, ...update };
  await chrome.storage.local.set({ [STORAGE_KEY]: appSettings });
  broadcastAppSettingsUpdated();
  return getAppSettings();
}

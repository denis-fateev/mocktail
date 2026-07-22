import { useCallback, useEffect, useState } from 'react';
import { isExtensionErrorResponse, isExtensionEvent } from '@shared/protocol/guards';
import { DEFAULT_APP_SETTINGS } from '@shared/settings/defaults';
import type { AppSettings } from '@shared/settings/types';
import {
  getAppSettings as getAppSettingsRequest,
  setAppSettings as setAppSettingsRequest,
} from '@ui/shared/api/extension-client';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getAppSettingsRequest();
        if (isExtensionErrorResponse(response)) {
          setError(response.error);
          return;
        }
        setSettings(response.settings);
      } catch {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onMessage = (message: unknown) => {
      if (!isExtensionEvent(message)) return;
      if (message.type === 'APP_SETTINGS_UPDATED') {
        setSettings(message.settings);
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, []);

  const updateSettings = useCallback(async (update: Partial<AppSettings>) => {
    setError(null);

    try {
      const response = await setAppSettingsRequest(update);
      if (isExtensionErrorResponse(response)) {
        setError(response.error);
        return;
      }
      setSettings(response.settings);
    } catch {
      setError('Failed to save settings');
    }
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}

import { useCallback, useEffect, useState } from 'react';
import type { CapturedRequest } from '@shared/network/types';
import { isExtensionErrorResponse, isExtensionEvent } from '@shared/protocol/guards';
import { clearRequests, getTabState, startMocking, stopMocking } from '@ui/shared/api/extension-client';

export function useTabSession() {
  const [tabId, setTabId] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setError('No active tab');
        return;
      }

      setTabId(tab.id);
      setError(null);

      try {
        const response = await getTabState(tab.id);
        if (isExtensionErrorResponse(response)) {
          setEnabled(false);
          setRequests([]);
          setError(response.error);
          return;
        }
        setEnabled(response.enabled);
        setRequests(response.requests);
      } catch {
        setEnabled(false);
        setRequests([]);
        setError('Failed to load tab state');
      }
    })();
  }, []);

  useEffect(() => {
    if (tabId === null) return;

    const onMessage = (message: unknown) => {
      if (!isExtensionEvent(message)) return;

      if (message.type === 'REQUESTS_UPDATED') {
        if (message.tabId !== tabId) return;
        setRequests(message.requests);
        return;
      }

      if (message.type === 'TAB_STATE_CHANGED') {
        if (message.tabId !== tabId) return;
        setEnabled(message.enabled);
        if (!message.enabled) {
          setRequests([]);
        }
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [tabId]);

  const toggle = useCallback(async () => {
    if (tabId === null || busy) return;

    setBusy(true);
    setError(null);

    try {
      if (enabled) {
        const response = await stopMocking(tabId);
        if (isExtensionErrorResponse(response)) {
          setError(response.error);
          return;
        }
        setEnabled(false);
        setRequests([]);
        return;
      }

      const response = await startMocking(tabId);
      if (isExtensionErrorResponse(response)) {
        setError(response.error);
        return;
      }
      setEnabled(true);
      setRequests(response.requests);
    } catch {
      setError(enabled ? 'Failed to stop' : 'Failed to start');
    } finally {
      setBusy(false);
    }
  }, [tabId, enabled, busy]);

  const clearHistory = useCallback(async () => {
    if (tabId === null || clearing) return;

    setClearing(true);
    setError(null);

    try {
      const response = await clearRequests(tabId);
      if (isExtensionErrorResponse(response)) {
        setError(response.error);
        return;
      }
      setRequests(response.requests);
    } catch {
      setError('Failed to clear request history');
    } finally {
      setClearing(false);
    }
  }, [tabId, clearing]);

  return {
    tabId,
    enabled,
    requests,
    error,
    busy,
    clearing,
    toggle,
    clearHistory,
  };
}

import type { AppSettings } from './types';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  smartResponseHeaders: true,
  captureResponseBodies: true,
  clearHistoryOnReload: true,
  fetchXhrOnly: true,
  newestRequestsFirst: true,
};

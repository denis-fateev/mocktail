import { useAppSettings } from '@features/settings/model/useAppSettings';
import type { AppSettings } from '@shared/settings/types';
import styles from './SettingsPage.module.css';

const SETTINGS: {
  key: keyof AppSettings;
  label: string;
  description: string;
}[] = [
  {
    key: 'smartResponseHeaders',
    label: 'Smart response headers',
    description:
      'Automatically handle CORS preflight requests and add CORS headers to mocked responses. Omit cache, CORS, and transport headers when creating a rule from a captured request.',
  },
  {
    key: 'captureResponseBodies',
    label: 'Capture response bodies and headers',
    description:
      'Store response bodies and headers for newly intercepted requests. When disabled, only URL, method, and status are kept.',
  },
  {
    key: 'clearHistoryOnReload',
    label: 'Clear intercept history on page reload',
    description:
      'Reset the Requests list and mock counters when the page is reloaded. When disabled, history and counters persist across reloads.',
  },
  {
    key: 'fetchXhrOnly',
    label: 'Fetch/XHR only',
    description:
      'Save and modify only Fetch and XHR requests. Turn off to capture and apply rules to all network requests (documents, scripts, images, and others).',
  },
  {
    key: 'newestRequestsFirst',
    label: 'Newest requests on top',
    description:
      'Show the most recently intercepted requests at the top of the list. Turn off to match Chrome DevTools Network order (oldest first).',
  },
];

export const SettingsPage = () => {
  const { settings, loading, error, updateSettings } = useAppSettings();

  return (
    <div className={styles.page}>
      <ul className={styles.list}>
        {SETTINGS.map((item) => {
          const enabled = settings[item.key];

          return (
            <li key={item.key}>
              <button
                type="button"
                className={styles.setting}
                role="switch"
                aria-checked={enabled}
                disabled={loading}
                onClick={() => void updateSettings({ [item.key]: !enabled })}
              >
                <span className={styles.settingText}>
                  <span className={styles.settingLabel}>{item.label}</span>
                  <span className={styles.settingDescription}>{item.description}</span>
                </span>
                <span className={styles.toggleTrack} aria-hidden="true">
                  <span className={styles.toggleThumb} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

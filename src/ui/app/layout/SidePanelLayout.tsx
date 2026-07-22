import { useState } from 'react';
import { useMockRules } from '@features/mock-rule/model/useMockRules';
import { useTabSession } from '@features/tab-session/model/useTabSession';
import { AboutPage } from '@pages/about/ui/AboutPage';
import { RequestsPage } from '@pages/requests/ui/RequestsPage';
import { RulesPage } from '@pages/rules/ui/RulesPage';
import { SettingsPage } from '@pages/settings/ui/SettingsPage';
import styles from './SidePanelLayout.module.css';

type PanelTab = 'rules' | 'requests' | 'settings' | 'about';

const TABS: { id: PanelTab; label: string }[] = [
  { id: 'rules', label: 'Rules' },
  { id: 'requests', label: 'Requests' },
  { id: 'settings', label: 'Settings' },
  { id: 'about', label: 'About' },
];

export const SidePanelLayout = () => {
  const [activeTab, setActiveTab] = useState<PanelTab>('rules');
  const mockRules = useMockRules();
  const {
    tabId,
    enabled,
    busy,
    clearing,
    error: sessionError,
    toggle,
    clearHistory,
    requests,
  } = useTabSession();

  const getTabLabel = (tab: PanelTab) => {
    if (tab === 'rules' && mockRules.rules.length > 0) {
      return `Rules (${mockRules.rules.length})`;
    }
    return TABS.find((item) => item.id === tab)?.label ?? tab;
  };

  return (
    <main className={styles.container}>
      <div className={styles.stickyTop}>
        <nav className={styles.tabs} aria-label="Panel sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {getTabLabel(tab.id)}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.content}>
        {activeTab === 'rules' && (
          <RulesPage
            mockRules={mockRules}
            mockingEnabled={enabled}
            mockingBusy={busy}
            mockingDisabled={!tabId || busy}
            mockingError={sessionError}
            onToggleMocking={() => void toggle()}
            onNavigateToRequests={() => setActiveTab('requests')}
          />
        )}
        {activeTab === 'requests' && (
          <RequestsPage
            tabId={tabId}
            enabled={enabled}
            requests={requests}
            error={sessionError}
            busy={busy}
            clearing={clearing}
            onToggle={() => void toggle()}
            onClearHistory={() => void clearHistory()}
            onNavigateToRules={() => setActiveTab('rules')}
            onAddRuleFromRequest={mockRules.addRuleFromRequest}
          />
        )}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'about' && <AboutPage />}
      </div>
    </main>
  );
};

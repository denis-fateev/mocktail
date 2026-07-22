import type { CapturedRequest } from '@shared/network/types';
import type { MockRule } from '@shared/rules/types';
import { MockingControls } from '@widgets/mocking-controls/ui/MockingControls';
import { RequestList } from '@widgets/request-list/ui/RequestList';
import styles from './RequestsPage.module.css';

type RequestsPageProps = {
  tabId: number | null;
  enabled: boolean;
  requests: CapturedRequest[];
  error: string | null;
  busy: boolean;
  clearing: boolean;
  onToggle: () => void;
  onClearHistory: () => void;
  onNavigateToRules?: () => void;
  onAddRuleFromRequest?: (rule: MockRule, onAdded?: () => void) => void;
};

export const RequestsPage = ({
  tabId,
  enabled,
  requests,
  error,
  busy,
  clearing,
  onToggle,
  onClearHistory,
  onNavigateToRules,
  onAddRuleFromRequest,
}: RequestsPageProps) => {
  return (
    <div className={styles.page}>
      <MockingControls
        variant="banner"
        enabled={enabled}
        busy={busy}
        disabled={!tabId || busy}
        error={error}
        onToggle={onToggle}
      />

      {!enabled && !error && (
        <p className={styles.hint}>
          <span className={styles.hintStrong}>Mocking is off</span>
          Start mocking to capture network requests from the active tab. You can then turn any request into a rule.
        </p>
      )}

      {enabled && (
        <RequestList
          requests={requests}
          hasError={Boolean(error)}
          clearBusy={clearing}
          onClearHistory={onClearHistory}
          onNavigateToRules={onNavigateToRules}
          onAddRuleFromRequest={onAddRuleFromRequest}
        />
      )}
    </div>
  );
};

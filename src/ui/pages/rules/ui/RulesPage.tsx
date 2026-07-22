import { useEffect, useMemo, useRef, useState } from 'react';
import type { useMockRules } from '@features/mock-rule/model/useMockRules';
import { RuleCard } from '@features/mock-rule/ui/RuleCard';
import { RuleSetBar } from '@features/rule-set/ui/RuleSetBar';
import { matchesUrlSearch } from '@shared/utils/url-search';
import { UrlSearchInput } from '@ui/shared/ui/UrlSearchInput';
import { MockingControls } from '@widgets/mocking-controls/ui/MockingControls';
import { IconChevronsDownUp, IconPlus } from '@ui/shared/ui/icons';
import styles from './RulesPage.module.css';

type MockRulesState = ReturnType<typeof useMockRules>;

type RulesPageProps = {
  mockRules: MockRulesState;
  mockingEnabled: boolean;
  mockingBusy: boolean;
  mockingDisabled: boolean;
  mockingError: string | null;
  onToggleMocking: () => void;
  onNavigateToRequests: () => void;
};

export const RulesPage = ({
  mockRules,
  mockingEnabled,
  mockingBusy,
  mockingDisabled,
  mockingError,
  onToggleMocking,
  onNavigateToRequests,
}: RulesPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clearedSearchForHighlightId, setClearedSearchForHighlightId] = useState<string | null>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  const {
    rules,
    sets,
    activeSetId,
    mockCounts,
    error,
    loading,
    highlightedRuleId,
    updateRuleAt,
    addEmptyRule,
    moveRuleUp,
    moveRuleDown,
    duplicateRuleAt,
    setAllRulesCollapsed,
    removeRuleAt,
    createSet,
    deleteSet,
    renameSet,
    switchSet,
    exportActiveSet,
    importSet,
  } = mockRules;

  if (highlightedRuleId && highlightedRuleId !== clearedSearchForHighlightId) {
    setClearedSearchForHighlightId(highlightedRuleId);
    setSearchQuery('');
  }

  useEffect(() => {
    if (!highlightedRuleId) return;
    scrollBodyRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [highlightedRuleId]);

  const hasAnyExpanded = useMemo(() => rules.some((rule) => !rule.collapsed), [rules]);

  const toggleAllExpanded = () => {
    setAllRulesCollapsed(hasAnyExpanded);
  };

  const visibleRules = useMemo(() => {
    const indexedRules = rules.map((rule, index) => ({ rule, index }));
    if (highlightedRuleId || !searchQuery.trim()) return indexedRules;

    return indexedRules.filter(({ rule }) => matchesUrlSearch(searchQuery, rule.url));
  }, [rules, searchQuery, highlightedRuleId]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.stickyHeader}>
        <MockingControls
          variant="banner"
          enabled={mockingEnabled}
          busy={mockingBusy}
          disabled={mockingDisabled}
          error={mockingError}
          onToggle={onToggleMocking}
        />

        <div className={styles.headerControls}>
          <RuleSetBar
            sets={sets}
            activeSetId={activeSetId}
            loading={loading}
            onSwitch={switchSet}
            onCreate={createSet}
            onRename={(setId, name) => void renameSet(setId, name)}
            onDelete={deleteSet}
            onExport={exportActiveSet}
            onImport={importSet}
          />

          <div className={styles.toolbar}>
            <UrlSearchInput className={styles.searchInput} value={searchQuery} onChange={setSearchQuery} disabled={loading} />
            <div className={styles.toolbarActions}>
              {rules.length > 0 && (
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={toggleAllExpanded}
                  disabled={loading}
                  title={hasAnyExpanded ? 'Collapse all rules' : 'Expand all rules'}
                  aria-label={hasAnyExpanded ? 'Collapse all rules' : 'Expand all rules'}
                >
                  <IconChevronsDownUp size={16} />
                </button>
              )}
              <button
                type="button"
                className={styles.addRuleButton}
                onClick={addEmptyRule}
                disabled={loading}
                title="Add mock rule"
                aria-label="Add mock rule"
              >
                Add rule
                <IconPlus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.scrollBody} ref={scrollBodyRef}>
        {rules.length === 0 && !loading && (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No mock rules yet.</p>
            <div className={styles.emptyActions}>
              <button type="button" className={styles.emptyPrimaryButton} onClick={addEmptyRule} disabled={loading}>
                <IconPlus size={14} />
                Add rule
              </button>
              <button type="button" className={styles.emptyLinkButton} onClick={onNavigateToRequests}>
                Go to Requests →
              </button>
            </div>
          </div>
        )}

        {rules.length > 0 && visibleRules.length === 0 && !loading && hasSearchQuery && (
          <p className={styles.emptyText}>No rules match this URL search.</p>
        )}

        <ul className={styles.list}>
          {visibleRules.map(({ rule, index }) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              callCount={mockCounts[rule.id] ?? 0}
              loading={loading}
              mockingEnabled={mockingEnabled}
              highlighted={rule.id === highlightedRuleId}
              expanded={!rule.collapsed}
              onExpandedChange={(expanded) => updateRuleAt(index, { collapsed: !expanded })}
              onRuleChange={(update) => updateRuleAt(index, update)}
              onDuplicate={() => duplicateRuleAt(index)}
              onMoveUp={() => moveRuleUp(index)}
              onMoveDown={() => moveRuleDown(index)}
              onDelete={() => removeRuleAt(index)}
            />
          ))}
        </ul>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

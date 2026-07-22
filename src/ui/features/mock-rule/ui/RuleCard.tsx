import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { HTTP_METHOD_OPTIONS, MODIFY_TYPE_OPTIONS, URL_MATCH_TYPE_OPTIONS } from '@features/mock-rule/model/rule-config-types';
import { formatJsonBody } from '@shared/rules/response-body';
import { createEmptyResponseHeader, isJsonContentType } from '@shared/rules/response-headers';
import type { HttpMethod, MockRule, MockRuleUpdate } from '@shared/rules/types';
import { RuleDelayField } from '@features/mock-rule/ui/RuleDelayField';
import { RuleResponsePanel } from '@features/mock-rule/ui/RuleResponsePanel';
import { RuleSelectField } from '@features/mock-rule/ui/RuleSelectField';
import { RuleStatusCodeField } from '@features/mock-rule/ui/RuleStatusCodeField';
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconCopy,
  IconMoreVertical,
  IconTrash,
} from '@ui/shared/ui/icons';
import styles from './RuleCard.module.css';

type RuleCardProps = {
  rule: MockRule;
  callCount: number;
  loading: boolean;
  mockingEnabled: boolean;
  expanded: boolean;
  highlighted?: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onRuleChange: (update: MockRuleUpdate) => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};

const formatCallCount = (count: number) => `${count} ${count === 1 ? 'call' : 'calls'}`;

export const RuleCard = ({
  rule,
  callCount,
  loading,
  mockingEnabled,
  expanded,
  highlighted = false,
  onExpandedChange,
  onRuleChange,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: RuleCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [responseTab, setResponseTab] = useState<'response' | 'headers'>('response');
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const scrollUrlInputToEnd = () => {
    const input = urlInputRef.current;
    if (!input) return;
    input.scrollLeft = input.scrollWidth;
  };

  useLayoutEffect(() => {
    scrollUrlInputToEnd();
  }, [expanded]);

  const isRequestMode = rule.modifyType === 'request';
  const isJsonResponse = !isRequestMode && isJsonContentType(rule.responseHeaders);
  const responseTabLabel = isJsonResponse ? 'Response JSON' : 'Response';

  const formatMethodBadge = (method: HttpMethod): string => (method === 'ANY' ? '★ ANY' : method);

  const getMethodBadgeStyle = (method: HttpMethod): CSSProperties => {
    switch (method) {
      case 'GET':
        return { backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' };
      case 'POST':
        return { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' };
      case 'PUT':
        return { backgroundColor: '#fefce8', color: '#a16207' };
      case 'PATCH':
        return { backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' };
      case 'DELETE':
        return { backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
      case 'HEAD':
        return { backgroundColor: 'var(--color-redirect-bg)', color: 'var(--color-redirect)' };
      case 'OPTIONS':
        return { backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' };
      case 'ANY':
        return { backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' };
    }

    return { backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' };
  };

  const inactiveClass = !mockingEnabled || !rule.enabled ? styles.cardInactive : undefined;

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const updateResponseHeaderAt = (index: number, patch: { key?: string; value?: string }) => {
    const nextHeaders = rule.responseHeaders.map((header, currentIndex) =>
      currentIndex === index ? { ...header, ...patch } : header,
    );
    onRuleChange({ responseHeaders: nextHeaders });
  };

  const addResponseHeader = () => {
    onRuleChange({
      responseHeaders: [...rule.responseHeaders, createEmptyResponseHeader()],
    });
  };

  const removeResponseHeaderAt = (index: number) => {
    onRuleChange({
      responseHeaders: rule.responseHeaders.filter((_, currentIndex) => currentIndex !== index),
    });
  };

  const updateRequestHeaderAt = (index: number, patch: { key?: string; value?: string }) => {
    const nextHeaders = rule.requestHeaders.map((header, currentIndex) =>
      currentIndex === index ? { ...header, ...patch } : header,
    );
    onRuleChange({ requestHeaders: nextHeaders });
  };

  const addRequestHeader = () => {
    onRuleChange({
      requestHeaders: [...rule.requestHeaders, createEmptyResponseHeader()],
    });
  };

  const removeRequestHeaderAt = (index: number) => {
    onRuleChange({
      requestHeaders: rule.requestHeaders.filter((_, currentIndex) => currentIndex !== index),
    });
  };

  const formatJson = () => {
    const formatted = formatJsonBody(rule.responseBody);
    if (formatted !== null) {
      onRuleChange({ responseBody: formatted });
    }
  };

  return (
    <li
      className={`${styles.card} ${inactiveClass ?? ''} ${menuOpen ? styles.cardMenuOpen : ''} ${highlighted ? styles.cardHighlighted : ''}`}
    >
      <div className={styles.headerRow}>
        <div className={styles.expandCell}>
          <button
            type="button"
            className={styles.expandButton}
            onClick={() => onExpandedChange(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse rule' : 'Expand rule'}
          >
            <IconChevronDown
              size={14}
              className={expanded ? styles.chevronExpanded : styles.chevronCollapsed}
            />
          </button>
        </div>

        {!expanded && (
          <span
            className={`${styles.methodBadge} ${rule.method === 'OPTIONS' ? styles.methodBadgeOptions : ''}`}
            style={getMethodBadgeStyle(rule.method)}
            title={rule.method === 'ANY' ? 'Match any HTTP method' : `Match ${rule.method}`}
          >
            {formatMethodBadge(rule.method)}
          </span>
        )}

        <div className={`${styles.urlCell} ${expanded ? styles.urlCellExpanded : ''}`}>
          <input
            ref={urlInputRef}
            className={styles.urlInput}
            type="text"
            value={rule.url}
            onChange={(event) => onRuleChange({ url: event.target.value })}
            placeholder="https://api.example.com/user"
            disabled={loading}
            spellCheck={false}
            onBlur={scrollUrlInputToEnd}
          />
        </div>

        <span className={styles.callCount} title="Requests matched by this rule">
          {formatCallCount(callCount)}
        </span>

        <div className={styles.actionsCell}>
          <div className={styles.toggleCell}>
            <button
              type="button"
              className={styles.toggle}
              role="switch"
              aria-checked={rule.enabled}
              aria-label={rule.enabled ? 'Rule enabled' : 'Rule disabled'}
              onClick={() => onRuleChange({ enabled: !rule.enabled })}
              disabled={loading}
            >
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb} />
              </span>
            </button>
          </div>

          <div className={styles.menuCell} ref={menuRef}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label="Rule actions"
          >
            <IconMoreVertical size={16} />
          </button>

          {menuOpen && (
            <div id={menuId} className={styles.menu} role="menu">
              <button
                type="button"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onDuplicate();
                }}
              >
                <IconCopy size={14} className={styles.menuItemIcon} />
                Duplicate
              </button>
              <button
                type="button"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onMoveUp();
                }}
              >
                <IconArrowUp size={14} className={styles.menuItemIcon} />
                Move up
              </button>
              <button
                type="button"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onMoveDown();
                }}
              >
                <IconArrowDown size={14} className={styles.menuItemIcon} />
                Move down
              </button>
              <div className={styles.menuDivider} role="separator" />
              <button
                type="button"
                className={styles.menuItemDanger}
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onDelete();
                }}
              >
                <IconTrash size={14} className={styles.menuItemIcon} />
                Delete
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className={styles.body}>
          <div className={`${styles.configRow} ${isRequestMode ? styles.configRowRequest : ''}`}>
            <RuleSelectField
              label="URL match"
              options={URL_MATCH_TYPE_OPTIONS}
              value={rule.urlMatchType}
              onChange={(urlMatchType) => onRuleChange({ urlMatchType })}
              disabled={loading}
            />
            <RuleSelectField
              label="Match method"
              options={HTTP_METHOD_OPTIONS}
              value={rule.method}
              onChange={(method) => onRuleChange({ method })}
              disabled={loading}
            />
            <RuleSelectField
              label="Modify"
              options={MODIFY_TYPE_OPTIONS}
              value={rule.modifyType}
              onChange={(modifyType) => onRuleChange({ modifyType })}
              disabled={loading}
            />
            {!isRequestMode && (
              <RuleStatusCodeField
                label="Status code"
                value={rule.statusCode}
                disabled={loading}
                onChange={(statusCode) => onRuleChange({ statusCode })}
              />
            )}
            <RuleDelayField
              label="Delay, ms"
              value={rule.delayMs}
              disabled={loading}
              onChange={(delayMs) => onRuleChange({ delayMs })}
            />
          </div>

          <RuleResponsePanel
            modifyType={rule.modifyType}
            activeTab={responseTab}
            responseTabLabel={responseTabLabel}
            headerCount={isRequestMode ? rule.requestHeaders.length : rule.responseHeaders.length}
            responseBody={rule.responseBody}
            isJsonResponse={isJsonResponse}
            headers={isRequestMode ? rule.requestHeaders : rule.responseHeaders}
            disabled={loading}
            onTabChange={setResponseTab}
            onResponseBodyChange={(responseBody) => onRuleChange({ responseBody })}
            onFormatJson={formatJson}
            onHeaderKeyChange={(index, key) =>
              isRequestMode ? updateRequestHeaderAt(index, { key }) : updateResponseHeaderAt(index, { key })
            }
            onHeaderValueChange={(index, value) =>
              isRequestMode ? updateRequestHeaderAt(index, { value }) : updateResponseHeaderAt(index, { value })
            }
            onAddHeader={isRequestMode ? addRequestHeader : addResponseHeader}
            onRemoveHeader={isRequestMode ? removeRequestHeaderAt : removeResponseHeaderAt}
          />
        </div>
      )}
    </li>
  );
};

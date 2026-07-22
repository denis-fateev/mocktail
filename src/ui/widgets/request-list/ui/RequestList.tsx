import { useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import { useAppSettings } from '@features/settings/model/useAppSettings';
import type { CapturedRequest } from '@shared/network/types';
import { DEFAULT_RESPONSE_BODY } from '@shared/rules/response-body';
import { omitCopiedResponseHeaders } from '@shared/rules/response-headers';
import { createMockRule, normalizeHttpMethod, type MockRule } from '@shared/rules/types';
import { matchesUrlSearch } from '@shared/utils/url-search';
import { CopyButton } from '@ui/shared/ui/CopyButton';
import { UrlSearchInput } from '@ui/shared/ui/UrlSearchInput';
import { IconTrash } from '@ui/shared/ui/icons';
import styles from './RequestList.module.css';

type RequestListProps = {
  requests: CapturedRequest[];
  hasError: boolean;
  clearBusy?: boolean;
  onClearHistory?: () => void;
  onNavigateToRules?: () => void;
  onAddRuleFromRequest?: (rule: MockRule, onAdded?: () => void) => void;
};

function getMethodBadgeStyle(method: string): CSSProperties {
  switch (method.toUpperCase()) {
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
    default:
      return { backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' };
  }
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return styles.statusOk;
  if (status >= 300 && status < 400) return styles.statusRedirect;
  if (status >= 400) return styles.statusError;
  return styles.status;
}

function hasResponseBody(body: string | undefined): body is string {
  return body !== undefined && body.length > 0;
}

function stopRowToggle(event: MouseEvent) {
  event.stopPropagation();
}

export const RequestList = ({
  requests,
  hasError,
  clearBusy = false,
  onClearHistory,
  onNavigateToRules,
  onAddRuleFromRequest,
}: RequestListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const { settings } = useAppSettings();

  const visibleRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    return requests.filter((request) => matchesUrlSearch(searchQuery, request.url));
  }, [requests, searchQuery]);

  const hasSearchQuery = searchQuery.trim().length > 0;
  const canClear = requests.length > 0 && Boolean(onClearHistory);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMockRequest = (request: CapturedRequest) => {
    const sourceHeaders = request.responseHeaders ?? [];
    const copiedHeaders = settings.smartResponseHeaders ? omitCopiedResponseHeaders(sourceHeaders) : sourceHeaders;

    const rule = createMockRule(request.url, {
      method: normalizeHttpMethod(request.method),
      statusCode: request.status,
      responseBody: request.responseBody ?? DEFAULT_RESPONSE_BODY,
      ...(copiedHeaders.length > 0 ? { responseHeaders: copiedHeaders } : {}),
    });

    if (onAddRuleFromRequest) {
      void onAddRuleFromRequest(rule, onNavigateToRules);
      return;
    }

    void onNavigateToRules?.();
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.toolbar}>
          <UrlSearchInput className={styles.searchInput} value={searchQuery} onChange={setSearchQuery} />
          {canClear && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={onClearHistory}
              disabled={clearBusy}
              title="Clear request history"
            >
              <IconTrash size={14} />
              Clear history
            </button>
          )}
        </div>
      </div>

      <ul className={styles.list}>
        {visibleRequests.length === 0 && !hasError && hasSearchQuery && (
          <li className={styles.empty}>No requests match this URL search.</li>
        )}
        {visibleRequests.length === 0 && !hasError && !hasSearchQuery && (
          <li className={styles.empty}>Waiting for requests…</li>
        )}
        {visibleRequests.map((req, index) => {
          const expanded = expandedIds.has(req.id);
          const responseBody = req.responseBody;

          return (
            <li
              key={req.id}
              className={`${styles.item} ${index % 2 === 1 ? styles.itemAlt : ''}`}
              onClick={() => toggleExpanded(req.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleExpanded(req.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
            >
              <div className={styles.itemTop}>
                <div className={styles.itemMeta} onClick={stopRowToggle}>
                  <span className={styles.method} style={getMethodBadgeStyle(req.method)}>
                    {req.method}
                  </span>
                  {req.status !== undefined && (
                    <span className={`${styles.statusBadge} ${getStatusClass(req.status)}`}>{req.status}</span>
                  )}
                  {req.modified && <span className={styles.modified}>modified</span>}
                  {req.mocked && <span className={styles.mocked}>mocked</span>}
                </div>
                <button
                  type="button"
                  className={styles.mockButton}
                  onClick={(event) => {
                    stopRowToggle(event);
                    handleMockRequest(req);
                  }}
                  title="Add this request as a mock rule"
                >
                  Mock
                </button>
              </div>

              <span className={styles.url} title={req.url}>
                <span className={styles.urlClip}>
                  <bdi className={styles.urlText}>{req.url}</bdi>
                </span>
              </span>

              {expanded && (
                <div className={styles.responsePanel} onClick={stopRowToggle}>
                  <div className={styles.responseToolbar}>
                    <span className={styles.sectionLabel}>Full URL</span>
                    <CopyButton value={req.url} label="Copy URL" />
                  </div>
                  <p className={styles.fullUrl}>{req.url}</p>
                  {hasResponseBody(responseBody) && (
                    <>
                      <div className={styles.responseToolbar}>
                        <span className={styles.sectionLabel}>Response body</span>
                        <CopyButton value={responseBody} label="Copy response body" />
                      </div>
                      <pre className={styles.body}>{responseBody}</pre>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

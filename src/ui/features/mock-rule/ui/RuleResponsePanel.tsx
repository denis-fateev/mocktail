import CodeMirror from '@uiw/react-codemirror';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter, lintGutter } from '@codemirror/lint';
import { useId, useState } from 'react';
import { COMMON_RESPONSE_HEADER_NAMES, getHeaderValueSuggestions } from '@shared/rules/common-response-headers';
import type { ModifyType, ResponseHeader } from '@shared/rules/types';
import { IconPencil, IconPlus, IconTrash } from '@ui/shared/ui/icons';
import styles from './RuleResponsePanel.module.css';

const jsonEditorExtensions = [json(), linter(jsonParseLinter()), lintGutter()];

type ResponseTab = 'response' | 'headers';

type RuleResponsePanelProps = {
  modifyType: ModifyType;
  activeTab: ResponseTab;
  responseTabLabel: string;
  headerCount: number;
  responseBody: string;
  isJsonResponse: boolean;
  headers: ResponseHeader[];
  disabled: boolean;
  onTabChange: (tab: ResponseTab) => void;
  onResponseBodyChange: (value: string) => void;
  onFormatJson: () => void;
  onHeaderKeyChange: (index: number, key: string) => void;
  onHeaderValueChange: (index: number, value: string) => void;
  onHeaderEnabledChange: (index: number, enabled: boolean) => void;
  onHeadersChange: (headers: ResponseHeader[]) => void;
  onAddHeader: () => void;
  onRemoveHeader: (index: number) => void;
};

export const RuleResponsePanel = ({
  modifyType,
  activeTab,
  responseTabLabel,
  headerCount,
  responseBody,
  isJsonResponse,
  headers,
  disabled,
  onTabChange,
  onResponseBodyChange,
  onFormatJson,
  onHeaderKeyChange,
  onHeaderValueChange,
  onHeaderEnabledChange,
  onHeadersChange,
  onAddHeader,
  onRemoveHeader,
}: RuleResponsePanelProps) => {
  const [bulkEditText, setBulkEditText] = useState<string | null>(null);
  const [bulkEditDirty, setBulkEditDirty] = useState(false);
  const baseId = useId();
  const headerKeysListId = `${baseId}-header-keys`;
  const isRequestMode = modifyType === 'request';
  const headersTabLabel = isRequestMode ? 'Request headers' : 'Response headers';
  const visibleTab = isRequestMode ? 'headers' : activeTab;

  const startBulkEdit = () => {
    setBulkEditText(headers.map(({ key, value }) => `${key}: ${value}`).join('\n'));
    setBulkEditDirty(false);
  };

  const cancelBulkEdit = () => {
    setBulkEditText(null);
    setBulkEditDirty(false);
  };

  const saveBulkEdit = () => {
    if (bulkEditText === null) return;

    const remainingHeaders = [...headers];

    const nextHeaders = bulkEditText
      .split('\n')
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex < 0) return null;

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        if (!key) return null;

        let existingIndex = remainingHeaders.findIndex((header) => header.key.trim() === key && header.value.trim() === value);
        if (existingIndex < 0) {
          existingIndex = remainingHeaders.findIndex((header) => header.key.trim() === key);
        }

        const existingHeader = existingIndex >= 0 ? remainingHeaders.splice(existingIndex, 1)[0] : undefined;
        return { key, value, enabled: existingHeader?.enabled ?? true };
      })
      .filter((header): header is ResponseHeader => header !== null);

    onHeadersChange(nextHeaders);
    cancelBulkEdit();
  };

  const headersTable = (
    <table className={styles.headersTable}>
      <datalist id={headerKeysListId}>
        {COMMON_RESPONSE_HEADER_NAMES.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <thead>
        <tr>
          <th className={styles.enabledHeader} aria-label="Enabled" />
          <th>Key</th>
          <th>Value</th>
          <th className={styles.actionsHeader}>
            <button
              type="button"
              className={styles.addButton}
              onClick={onAddHeader}
              disabled={disabled}
              title="Add header"
              aria-label="Add header"
            >
              <IconPlus size={14} />
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {headers.map((header, index) => {
          const valueSuggestions = getHeaderValueSuggestions(header.key);
          const headerValuesListId = valueSuggestions.length > 0 ? `${baseId}-header-values-${index}` : undefined;

          return (
            <tr key={index}>
              <td className={styles.enabledCell}>
                <input
                  className={styles.headerCheckbox}
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(event) => onHeaderEnabledChange(index, event.target.checked)}
                  disabled={disabled}
                  aria-label={`${header.key || `Header ${index + 1}`} enabled`}
                />
              </td>
              <td>
                <input
                  className={`${styles.headerInput} ${!header.enabled ? styles.headerInputDisabled : ''}`}
                  type="text"
                  value={header.key}
                  onChange={(event) => onHeaderKeyChange(index, event.target.value)}
                  placeholder="Header name"
                  disabled={disabled}
                  spellCheck={false}
                  list={headerKeysListId}
                />
              </td>
              <td>
                {headerValuesListId && (
                  <datalist id={headerValuesListId}>
                    {valueSuggestions.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
                <input
                  className={`${styles.headerInput} ${!header.enabled ? styles.headerInputDisabled : ''}`}
                  type="text"
                  value={header.value}
                  onChange={(event) => onHeaderValueChange(index, event.target.value)}
                  placeholder="Header value"
                  disabled={disabled}
                  spellCheck={false}
                  list={headerValuesListId}
                />
              </td>
              <td className={styles.actionsCell}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => onRemoveHeader(index)}
                  disabled={disabled}
                  title="Remove header"
                  aria-label="Remove header"
                >
                  <IconTrash size={13} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className={styles.panel}>
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {!isRequestMode && (
            <button
              type="button"
              className={visibleTab === 'response' ? styles.tabActive : styles.tab}
              onClick={() => onTabChange('response')}
            >
              {isJsonResponse && (
                <span className={styles.codeIcon} aria-hidden>
                  {'</>'}
                </span>
              )}
              {responseTabLabel}
            </button>
          )}
          <button
            type="button"
            className={visibleTab === 'headers' ? styles.tabActive : styles.tab}
            onClick={() => onTabChange('headers')}
          >
            {headersTabLabel}
            <span className={styles.headerCount}>{headerCount}</span>
          </button>
        </div>
        <div className={styles.toolbarActions}>
          {!isRequestMode && visibleTab === 'response' && isJsonResponse && (
            <button
              type="button"
              className={styles.formatButton}
              onClick={onFormatJson}
              disabled={disabled}
              title="Format JSON"
              aria-label="Format JSON"
            >
              <span className={styles.formatIcon} aria-hidden />
            </button>
          )}
          {visibleTab === 'headers' && bulkEditText === null && (
            <button type="button" className={styles.bulkEditButton} onClick={startBulkEdit} disabled={disabled}>
              <IconPencil size={13} />
              Bulk edit
            </button>
          )}
          {visibleTab === 'headers' && bulkEditText !== null && (
            <>
              <button type="button" className={styles.cancelButton} onClick={cancelBulkEdit}>
                Cancel
              </button>
              {bulkEditDirty && (
                <button type="button" className={styles.saveButton} onClick={saveBulkEdit} disabled={disabled}>
                  Save
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {visibleTab === 'response' ? (
          isJsonResponse ? (
            <CodeMirror
              className={styles.codeEditor}
              value={responseBody}
              height="100%"
              editable={!disabled}
              extensions={jsonEditorExtensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                highlightActiveLine: false,
              }}
              onChange={onResponseBodyChange}
            />
          ) : (
            <textarea
              className={styles.textarea}
              value={responseBody}
              onChange={(event) => onResponseBodyChange(event.target.value)}
              disabled={disabled}
              spellCheck={false}
            />
          )
        ) : bulkEditText !== null ? (
          <textarea
            className={styles.bulkTextarea}
            value={bulkEditText}
            onChange={(event) => {
              setBulkEditText(event.target.value);
              setBulkEditDirty(true);
            }}
            disabled={disabled}
            spellCheck={false}
            aria-label="Bulk edit headers"
          />
        ) : (
          headersTable
        )}
      </div>
    </div>
  );
};

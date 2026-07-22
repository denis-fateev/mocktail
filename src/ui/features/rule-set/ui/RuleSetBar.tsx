import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { RULE_SET_AI_IMPORT_PROMPT } from '@shared/rules/ai-import-prompt';
import type { RuleSetSummary } from '@shared/rules/rule-set';
import {
  IconChevronDown,
  IconCopy,
  IconCopySuccess,
  IconDownload,
  IconMoreVertical,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX,
} from '@ui/shared/ui/icons';
import styles from './RuleSetBar.module.css';

const COPY_FEEDBACK_MS = 3000;

type ReadonlyTextBlockProps = {
  label: string;
  value: string;
  rows: number;
  ariaLabel: string;
  copyDisabled?: boolean;
  onCopyError?: (message: string) => void;
};

const ReadonlyTextBlock = ({ label, value, rows, ariaLabel, copyDisabled, onCopyError }: ReadonlyTextBlockProps) => {
  const [copied, setCopied] = useState(false);
  const resetCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetCopiedTimeoutRef.current) {
        clearTimeout(resetCopiedTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!value || copyDisabled) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (resetCopiedTimeoutRef.current) {
        clearTimeout(resetCopiedTimeoutRef.current);
      }
      resetCopiedTimeoutRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      onCopyError?.('Could not copy automatically. Select the text and copy manually.');
    }
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.codeBlockLabel}>{label}</span>
        <button type="button" className={styles.copyButton} onClick={() => void handleCopy()} disabled={copyDisabled}>
          {copied ? <IconCopySuccess size={12} /> : <IconCopy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <textarea
        className={`${styles.transferTextarea} ${styles.transferTextareaReadonly}`}
        value={value}
        readOnly
        rows={rows}
        aria-label={ariaLabel}
      />
    </div>
  );
};

type RuleSetBarProps = {
  sets: RuleSetSummary[];
  activeSetId: string;
  loading: boolean;
  onSwitch: (setId: string) => Promise<string | null>;
  onCreate: () => Promise<string | null>;
  onRename: (setId: string, name: string) => void;
  onDelete: (setId: string) => Promise<string | null>;
  onExport: () => Promise<string | null>;
  onImport: (text: string) => Promise<string | null>;
};

type TransferMode = 'export' | 'import';

export const RuleSetBar = ({
  sets,
  activeSetId,
  loading,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
  onExport,
  onImport,
}: RuleSetBarProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<TransferMode>('export');
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [transferMessage, setTransferMessage] = useState<string | null>(null);
  const [transferMessageIsError, setTransferMessageIsError] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [exportForSetId, setExportForSetId] = useState<string | null>(null);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);

  const activeSet = useMemo(() => sets.find((set) => set.id === activeSetId), [sets, activeSetId]);
  const canDelete = sets.length > 1;

  const loadExportText = useCallback(
    async (setId: string) => {
      if (!setId) {
        setExportText('');
        setExportForSetId(null);
        return;
      }

      setTransferLoading(true);
      const text = await onExport();
      setTransferLoading(false);

      if (text !== null) {
        setExportText(text);
        setExportForSetId(setId);
        return;
      }

      setTransferMessage('Failed to export rule set.');
      setTransferMessageIsError(true);
    },
    [onExport],
  );

  const reloadExportIfOpen = (setId: string | null | undefined) => {
    if (!setId || !transferOpen || transferMode !== 'export') return;
    void loadExportText(setId);
  };

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

  const handleSwitch = async (setId: string) => {
    const nextSetId = await onSwitch(setId);
    reloadExportIfOpen(nextSetId);
  };

  const handleCreate = async () => {
    closeMenu();
    const nextSetId = await onCreate();
    reloadExportIfOpen(nextSetId);
  };

  const startRenaming = () => {
    setRenameValue(activeSet?.name ?? '');
    setIsRenaming(true);
    closeMenu();
  };

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (!activeSet || !trimmed) return;
    onRename(activeSet.id, trimmed);
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (!activeSet || !canDelete) return;
    closeMenu();
    const confirmed = window.confirm(
      `Delete rule set "${activeSet.name}" and all ${activeSet.ruleCount} rule(s)? This cannot be undone.`,
    );
    if (!confirmed) return;
    const nextSetId = await onDelete(activeSet.id);
    reloadExportIfOpen(nextSetId);
  };

  const openTransfer = async (mode: TransferMode) => {
    closeMenu();
    setTransferOpen(true);
    setTransferMode(mode);
    setTransferMessage(null);
    setTransferMessageIsError(false);

    if (mode === 'export' && (exportForSetId !== activeSetId || !exportText)) {
      await loadExportText(activeSetId);
    }
  };

  const switchToExportTab = () => {
    setTransferMode('export');
    setTransferMessage(null);
    setTransferMessageIsError(false);

    if (exportForSetId !== activeSetId || !exportText) {
      void loadExportText(activeSetId);
    }
  };

  const showCopyError = (message: string) => {
    setTransferMessage(message);
    setTransferMessageIsError(true);
  };

  const handleImport = async () => {
    setTransferLoading(true);
    setTransferMessage(null);
    setTransferMessageIsError(false);

    const errorMessage = await onImport(importText);
    setTransferLoading(false);

    if (errorMessage === null) {
      setImportText('');
      setTransferMessage('Rule set imported.');
      return;
    }

    setTransferMessage(errorMessage);
    setTransferMessageIsError(true);
  };

  return (
    <section className={styles.bar} aria-label="Rule sets">
      <div className={styles.row}>
        {isRenaming && activeSet ? (
          <label className={styles.selectorLabel}>
            <span className={styles.selectorCaption}>Rename rule set</span>
            <form
              className={styles.renameForm}
              onSubmit={(event) => {
                event.preventDefault();
                handleRenameSubmit();
              }}
            >
              <input
                className={styles.renameInput}
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                disabled={loading}
                autoFocus
                aria-label="Rule set name"
              />
              <button type="submit" className={styles.renameSave} disabled={loading || !renameValue.trim()}>
                Save
              </button>
              <button type="button" className={styles.renameCancel} onClick={() => setIsRenaming(false)} disabled={loading}>
                Cancel
              </button>
            </form>
          </label>
        ) : (
          <>
            <label className={styles.selectorLabel}>
              <span className={styles.selectorCaption}>Rule set</span>
              <select
                className={styles.selector}
                value={activeSetId}
                disabled={loading || sets.length === 0}
                onChange={(event) => void handleSwitch(event.target.value)}
              >
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.actions}>
              <div className={styles.menuWrap} ref={menuRef}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setMenuOpen((current) => !current)}
                  disabled={loading}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls={menuId}
                  title="Rule set actions"
                  aria-label="Rule set actions"
                >
                  <IconMoreVertical size={16} />
                </button>

                {menuOpen && (
                  <div id={menuId} className={styles.menu} role="menu">
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => void handleCreate()}
                      disabled={loading}
                    >
                      <IconPlus size={14} className={styles.menuItemIcon} />
                      Create new set
                    </button>
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={startRenaming}
                      disabled={!activeSet}
                    >
                      <IconPencil size={14} className={styles.menuItemIcon} />
                      Rename
                    </button>
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => void openTransfer('export')}
                      disabled={!activeSet}
                    >
                      <IconUpload size={14} className={styles.menuItemIcon} />
                      Export
                    </button>
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => void openTransfer('import')}
                      disabled={!activeSet}
                    >
                      <IconDownload size={14} className={styles.menuItemIcon} />
                      Import
                    </button>
                    <div className={styles.menuDivider} role="separator" />
                    <button
                      type="button"
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      role="menuitem"
                      onClick={() => void handleDelete()}
                      disabled={!canDelete}
                    >
                      <IconTrash size={14} className={styles.menuItemIcon} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {transferOpen && (
        <div className={styles.transferPanel}>
          <div className={styles.transferTabs}>
            <button
              type="button"
              className={transferMode === 'export' ? styles.transferTabActive : styles.transferTab}
              onClick={switchToExportTab}
            >
              Export
            </button>
            <button
              type="button"
              className={transferMode === 'import' ? styles.transferTabActive : styles.transferTab}
              onClick={() => {
                setTransferMode('import');
                setTransferMessage(null);
                setTransferMessageIsError(false);
              }}
            >
              Import
            </button>
            <button
              type="button"
              className={styles.transferClose}
              onClick={() => setTransferOpen(false)}
              aria-label="Close import and export panel"
            >
              <IconX size={16} />
            </button>
          </div>

          {transferMode === 'export' ? (
            <div className={styles.transferBody}>
              <p className={styles.transferHint}>Copy this JSON text to share or back up the active rule set.</p>
              <ReadonlyTextBlock
                label="Exported JSON"
                value={exportText}
                rows={8}
                ariaLabel="Exported rule set JSON"
                copyDisabled={transferLoading || !exportText}
                onCopyError={showCopyError}
              />
            </div>
          ) : (
            <div className={styles.transferBody}>
              <details className={styles.aiPromptDetails}>
                <summary className={styles.aiPromptSummary}>
                  <IconChevronDown size={14} className={styles.aiPromptChevron} />
                  AI import prompt
                </summary>
                <p className={styles.transferHint}>
                  Copy this prompt into your AI assistant. Describe the API you want to mock, then paste the returned JSON below.
                </p>
                <ReadonlyTextBlock
                  label="AI prompt"
                  value={RULE_SET_AI_IMPORT_PROMPT}
                  rows={6}
                  ariaLabel="AI prompt for generating mock rules"
                  onCopyError={showCopyError}
                />
              </details>

              <div className={styles.sectionDivider} role="separator">
                <span>or paste JSON directly</span>
              </div>

              <div className={styles.editableBlock}>
                <p className={styles.transferHint}>Paste exported JSON text to create a new rule set.</p>
                <textarea
                  className={`${styles.transferTextarea} ${styles.transferTextareaEditable}`}
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  rows={8}
                  disabled={transferLoading}
                  placeholder='{"format":"mocktail-rule-set",...}'
                  aria-label="Rule set JSON to import"
                />
                <div className={styles.transferActions}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => void handleImport()}
                    disabled={transferLoading || !importText.trim()}
                  >
                    Import rule set
                  </button>
                </div>
              </div>
            </div>
          )}

          {transferMessage && (
            <p className={transferMessageIsError ? styles.transferMessageError : styles.transferMessage} role="status">
              {transferMessage}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

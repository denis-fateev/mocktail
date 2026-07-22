import { normalizeRule } from './normalize';
import type { MockRule } from './types';
import { uniqueRuleSetName } from './rule-set';
import { collectMockRulesValidationErrors } from './validate';

export const RULE_SET_EXPORT_FORMAT = 'mocktail-rule-set' as const;
export const RULE_SET_EXPORT_VERSION = 1 as const;

export type ExportedMockRule = Omit<MockRule, 'collapsed'>;

export type RuleSetExportDocumentV1 = {
  format: typeof RULE_SET_EXPORT_FORMAT;
  version: typeof RULE_SET_EXPORT_VERSION;
  name: string;
  rules: ExportedMockRule[];
};

export type ParsedRuleSetImport = {
  name: string;
  rules: MockRule[];
};

export class RuleSetImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuleSetImportError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toExportedMockRule(rule: MockRule): ExportedMockRule {
  const exportedRule = { ...rule };
  delete (exportedRule as { collapsed?: boolean }).collapsed;
  return exportedRule;
}

function parseRules(value: unknown): MockRule[] {
  const validationErrors = collectMockRulesValidationErrors(value);
  if (validationErrors.length > 0) {
    throw new RuleSetImportError(validationErrors.join(' '));
  }

  return (value as MockRule[]).map((rule) => ({
    ...normalizeRule(rule),
    // Collapse state is UI-only and is not part of the import/export format.
    collapsed: false,
  }));
}

function parseV1Document(document: Record<string, unknown>): ParsedRuleSetImport {
  if (typeof document.name !== 'string' || !document.name.trim()) {
    throw new RuleSetImportError('Export document must include a non-empty "name" field.');
  }

  return {
    name: document.name.trim(),
    rules: parseRules(document.rules),
  };
}

export function serializeRuleSetExport(name: string, rules: MockRule[]): string {
  const document: RuleSetExportDocumentV1 = {
    format: RULE_SET_EXPORT_FORMAT,
    version: RULE_SET_EXPORT_VERSION,
    name: name.trim() || 'Untitled',
    rules: rules.map(toExportedMockRule),
  };

  return JSON.stringify(document, null, 2);
}

export function parseRuleSetExport(text: string): ParsedRuleSetImport {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new RuleSetImportError('Import text is empty.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new RuleSetImportError('Import text is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new RuleSetImportError('Import text must be a JSON object.');
  }

  if (parsed.format !== RULE_SET_EXPORT_FORMAT) {
    throw new RuleSetImportError(
      `Unsupported export format "${String(parsed.format)}". Expected "${RULE_SET_EXPORT_FORMAT}".`,
    );
  }

  if (parsed.version === RULE_SET_EXPORT_VERSION) {
    return parseV1Document(parsed);
  }

  throw new RuleSetImportError(
    `Unsupported export version ${String(parsed.version)}. This extension supports version ${RULE_SET_EXPORT_VERSION}.`,
  );
}

export function resolveImportedRuleSetName(name: string, existingNames: readonly string[]): string {
  return uniqueRuleSetName(name, existingNames);
}

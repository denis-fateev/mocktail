import { describe, expect, it } from 'vitest';
import {
  RULE_SET_EXPORT_FORMAT,
  RULE_SET_EXPORT_VERSION,
  RuleSetImportError,
  parseRuleSetExport,
  resolveImportedRuleSetName,
  serializeRuleSetExport,
} from '../src/shared/rules/import-export';
import { createMockRule } from '../src/shared/rules/types';

describe('rule set import/export', () => {
  it('serializes and parses a v1 export document', () => {
    const rules = [createMockRule('https://api.example.com/users', { collapsed: true })];
    const text = serializeRuleSetExport('My API', rules);
    const exported = JSON.parse(text) as { rules: Array<Record<string, unknown>> };
    const parsed = parseRuleSetExport(text);

    expect(parsed.name).toBe('My API');
    expect(parsed.rules).toHaveLength(1);
    expect(parsed.rules[0]?.url).toBe('https://api.example.com/users');
    expect(exported.rules[0]).not.toHaveProperty('collapsed');
    expect(parsed.rules[0]?.collapsed).toBe(false);
  });

  it('rejects unsupported formats and versions', () => {
    expect(() => parseRuleSetExport('{}')).toThrow(RuleSetImportError);
    expect(() =>
      parseRuleSetExport(
        JSON.stringify({
          format: 'other-format',
          version: 1,
          name: 'Test',
          rules: [],
        }),
      ),
    ).toThrow(/Unsupported export format/);

    expect(() =>
      parseRuleSetExport(
        JSON.stringify({
          format: RULE_SET_EXPORT_FORMAT,
          version: 99,
          name: 'Test',
          rules: [],
        }),
      ),
    ).toThrow(/Unsupported export version/);
  });

  it('validates required fields', () => {
    expect(() =>
      parseRuleSetExport(
        JSON.stringify({
          format: RULE_SET_EXPORT_FORMAT,
          version: RULE_SET_EXPORT_VERSION,
          name: ' ',
          rules: [],
        }),
      ),
    ).toThrow(/name/);

    expect(() =>
      parseRuleSetExport(
        JSON.stringify({
          format: RULE_SET_EXPORT_FORMAT,
          version: RULE_SET_EXPORT_VERSION,
          name: 'Test',
          rules: [{ url: 123 }],
        }),
      ),
    ).toThrow(/Rule 1/);

    expect(() =>
      parseRuleSetExport(
        JSON.stringify({
          format: RULE_SET_EXPORT_FORMAT,
          version: RULE_SET_EXPORT_VERSION,
          name: 'Test',
          rules: [{ url: 'https://api.example.com/users', method: 'GETS' }],
        }),
      ),
    ).toThrow(/method/);
  });

  it('rejects invalid response headers during import', () => {
    expect(() =>
      parseRuleSetExport(
        JSON.stringify({
          format: RULE_SET_EXPORT_FORMAT,
          version: RULE_SET_EXPORT_VERSION,
          name: 'Test',
          rules: [
            {
              url: 'https://api.example.com/users',
              responseHeaders: [{ key: 'Content-Type', value: 1 }],
            },
          ],
        }),
      ),
    ).toThrow(/responseHeaders\[0\]\.value must be a string/);
  });

  it('deduplicates imported set names', () => {
    expect(resolveImportedRuleSetName('Default', ['Default'])).toBe('Default (2)');
    expect(resolveImportedRuleSetName('Default', ['Default', 'Default (2)'])).toBe('Default (3)');
  });
});

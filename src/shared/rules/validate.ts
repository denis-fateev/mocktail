import { isValidDelayMs } from './delay-ms';
import { isValidHttpStatusCode } from './status-code';
import { HTTP_METHODS, MODIFY_TYPES, type HttpMethod, type ModifyType } from './types';
import { URL_MATCH_TYPES } from './url-match-type';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isHttpMethod(value: string): value is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(value);
}

function collectHeadersValidationErrors(headers: unknown, fieldName: string, label: string): string[] {
  if (!Array.isArray(headers)) {
    return [`${label}: "${fieldName}" must be an array.`];
  }

  const errors: string[] = [];
  headers.forEach((header, headerIndex) => {
    if (!isRecord(header)) {
      errors.push(`${label}: ${fieldName}[${headerIndex}] must be an object.`);
      return;
    }

    if (typeof header.key !== 'string') {
      errors.push(`${label}: ${fieldName}[${headerIndex}].key must be a string.`);
    }

    if (typeof header.value !== 'string') {
      errors.push(`${label}: ${fieldName}[${headerIndex}].value must be a string.`);
    }
  });

  return errors;
}

function isModifyType(value: string): value is ModifyType {
  return (MODIFY_TYPES as readonly string[]).includes(value);
}

export function collectMockRuleValidationErrors(rule: unknown, index: number): string[] {
  const label = `Rule ${index + 1}`;
  const errors: string[] = [];

  if (!isRecord(rule)) {
    return [`${label}: must be an object.`];
  }

  if (typeof rule.url !== 'string' || !rule.url.trim()) {
    errors.push(`${label}: "url" must be a non-empty string.`);
  }

  if (rule.method !== undefined) {
    if (typeof rule.method !== 'string' || !isHttpMethod(rule.method)) {
      errors.push(
        `${label}: "method" must be one of ${HTTP_METHODS.join(', ')} (got ${JSON.stringify(rule.method)}).`,
      );
    }
  }

  if (rule.urlMatchType !== undefined) {
    if (typeof rule.urlMatchType !== 'string' || !(URL_MATCH_TYPES as readonly string[]).includes(rule.urlMatchType)) {
      errors.push(
        `${label}: "urlMatchType" must be one of ${URL_MATCH_TYPES.join(', ')} (got ${JSON.stringify(rule.urlMatchType)}).`,
      );
    }
  }

  if (rule.enabled !== undefined && typeof rule.enabled !== 'boolean') {
    errors.push(`${label}: "enabled" must be a boolean.`);
  }

  if (rule.statusCode !== undefined) {
    if (typeof rule.statusCode !== 'number' || !isValidHttpStatusCode(rule.statusCode)) {
      errors.push(`${label}: "statusCode" must be an integer between 100 and 599.`);
    }
  }

  if (rule.delayMs !== undefined) {
    if (typeof rule.delayMs !== 'number' || !isValidDelayMs(rule.delayMs)) {
      errors.push(`${label}: "delayMs" must be an integer between 0 and 999999.`);
    }
  }

  if (rule.responseBody !== undefined && typeof rule.responseBody !== 'string') {
    errors.push(`${label}: "responseBody" must be a string.`);
  }

  if (rule.modifyType !== undefined) {
    if (typeof rule.modifyType !== 'string' || !isModifyType(rule.modifyType)) {
      errors.push(
        `${label}: "modifyType" must be one of ${MODIFY_TYPES.join(', ')} (got ${JSON.stringify(rule.modifyType)}).`,
      );
    }
  }

  if (rule.responseHeaders !== undefined) {
    errors.push(...collectHeadersValidationErrors(rule.responseHeaders, 'responseHeaders', label));
  }

  if (rule.requestHeaders !== undefined) {
    errors.push(...collectHeadersValidationErrors(rule.requestHeaders, 'requestHeaders', label));
  }

  if (rule.id !== undefined && typeof rule.id !== 'string') {
    errors.push(`${label}: "id" must be a string.`);
  }

  return errors;
}

export function collectMockRulesValidationErrors(rules: unknown): string[] {
  if (!Array.isArray(rules)) {
    return ['Export document must include a "rules" array.'];
  }

  return rules.flatMap((rule, index) => collectMockRuleValidationErrors(rule, index));
}

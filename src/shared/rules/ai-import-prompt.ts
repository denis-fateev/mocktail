import { DEFAULT_DELAY_MS, DEFAULT_HTTP_STATUS_CODE } from './defaults';
import { RULE_SET_EXPORT_FORMAT, RULE_SET_EXPORT_VERSION } from './import-export';
import { DEFAULT_CONTENT_TYPE } from './response-headers';
import { HTTP_METHODS } from './types';
import { URL_MATCH_TYPES } from './url-match-type';

export const RULE_SET_AI_IMPORT_EXAMPLE = {
  format: RULE_SET_EXPORT_FORMAT,
  version: RULE_SET_EXPORT_VERSION,
  name: 'Example API mocks',
  rules: [
    {
      url: 'https://api.example.com/users',
      urlMatchType: 'contains',
      method: 'GET',
      modifyType: 'response',
      enabled: true,
      statusCode: DEFAULT_HTTP_STATUS_CODE,
      delayMs: DEFAULT_DELAY_MS,
      responseBody: JSON.stringify({ users: [{ id: 1, name: 'Alice' }] }, null, 2),
      responseHeaders: [{ key: 'Content-Type', value: DEFAULT_CONTENT_TYPE }],
    },
    {
      url: 'https://api.example.com/users',
      method: 'POST',
      modifyType: 'response',
      statusCode: 201,
      responseBody: JSON.stringify({ id: 2, name: 'Bob' }, null, 2),
    },
    {
      url: 'https://api.example.com/graphql',
      method: 'POST',
      modifyType: 'request',
      delayMs: 100,
      requestHeaders: [{ key: 'X-Debug-Mode', value: 'true' }],
    },
  ],
} as const;

export const RULE_SET_AI_IMPORT_PROMPT = `You are helping create mock HTTP rules for the Mocktail browser extension.

Return a single JSON object that Mocktail can import. Do not wrap it in markdown fences or add commentary.

## Document shape

{
  "format": "${RULE_SET_EXPORT_FORMAT}",
  "version": ${RULE_SET_EXPORT_VERSION},
  "name": "Short descriptive name for this rule set",
  "rules": [ /* one object per rule */ ]
}

Required top-level fields:
- format: must be exactly "${RULE_SET_EXPORT_FORMAT}"
- version: must be ${RULE_SET_EXPORT_VERSION}
- name: non-empty string
- rules: array with at least one rule

## Rule object

Each rule matches outgoing requests by URL (and optionally HTTP method) and either replaces the response or modifies the request.

Required:
- url (string): URL or URL fragment to match against the request URL

Optional (defaults shown):
- urlMatchType: ${URL_MATCH_TYPES.map((value) => `"${value}"`).join(' | ')} — default "equals"
- method: ${HTTP_METHODS.join(' | ')} — default "ANY"
- modifyType: "response" | "request" — default "response"
- enabled: boolean — default true
- id: string — omit to let Mocktail generate one

### modifyType: "response" (default)

Replaces the network response with a mock. Use these fields:
- statusCode: integer 100-599 — default ${DEFAULT_HTTP_STATUS_CODE}
- delayMs: integer 0-999999 — simulated response delay in ms, default ${DEFAULT_DELAY_MS}
- responseBody: string — response payload; use a JSON string for APIs
- responseHeaders: array of { "key": string, "value": string } — default Content-Type: ${DEFAULT_CONTENT_TYPE}

### modifyType: "request"

Leaves the real response intact and modifies the outgoing request instead. Use these fields:
- requestHeaders: array of { "key": string, "value": string } — headers merged into the original request (default [])
- delayMs: integer 0-999999 — delay before the request is sent, default ${DEFAULT_DELAY_MS}

Do not set statusCode, responseBody, or responseHeaders for request-modify rules unless you also need them as documentation; they are ignored at runtime.

## Matching and priority

- Rules are evaluated from top to bottom. For each request, Mocktail finds the first matching enabled rule of each modify type.
- If a request matches both a request-modify rule and a response-mock rule, only the response rule applies. Request headers are not added and only the response rule's hit count increases.
- If a request matches only a request-modify rule, the configured headers are added and the request continues to the network normally.

## Example

${JSON.stringify(RULE_SET_AI_IMPORT_EXAMPLE, null, 2)}

Generate a rule set for the scenario described below. Return only the JSON object.`;

import { HTTP_METHODS, type HttpMethod, type ModifyType, type UrlMatchType } from '@shared/rules/types';
import { DEFAULT_URL_MATCH_TYPE } from '@shared/rules/url-match-type';

export type { UrlMatchType };

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export const URL_MATCH_TYPE_OPTIONS: SelectOption<UrlMatchType>[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'ends-with', label: 'Ends with' },
  { value: 'starts-with', label: 'Starts with' },
];

export const HTTP_METHOD_OPTIONS: SelectOption<HttpMethod>[] = [
  ...HTTP_METHODS.map((method) => ({
    value: method,
    label: method === 'ANY' ? '★ ANY' : method,
  })),
];

export const MODIFY_TYPE_OPTIONS: SelectOption<ModifyType>[] = [
  { value: 'response', label: 'Response' },
  { value: 'request', label: 'Request' },
];

export { DEFAULT_URL_MATCH_TYPE };

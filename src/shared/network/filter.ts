import type { NetworkResourceType } from './types';

export function isFetchOrXhrResourceType(type: NetworkResourceType | undefined): boolean {
  return type === 'XHR' || type === 'Fetch';
}

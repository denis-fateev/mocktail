import type { ResponseHeader } from '../rules/response-headers';

/** CDP Network.ResourceType */
export type NetworkResourceType =
  | 'Document'
  | 'Stylesheet'
  | 'Image'
  | 'Media'
  | 'Font'
  | 'Script'
  | 'TextTrack'
  | 'XHR'
  | 'Fetch'
  | 'Prefetch'
  | 'EventSource'
  | 'WebSocket'
  | 'Manifest'
  | 'SignedExchange'
  | 'Ping'
  | 'CSPViolationReport'
  | 'Preflight'
  | 'FedCM'
  | 'Other';

export type CapturedRequest = {
  id: string;
  url: string;
  method: string;
  timestamp: number;
  resourceType?: NetworkResourceType;
  mocked?: boolean;
  modified?: boolean;
  status?: number;
  responseBody?: string;
  responseHeaders?: ResponseHeader[];
};

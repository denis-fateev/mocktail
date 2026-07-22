import { describe, expect, it } from 'vitest';
import {
  clearPendingMocks,
  consumePendingMock,
  consumePendingModified,
  markPendingMock,
  markPendingModified,
} from '../src/extension/background/debugger/mock-interceptor';

describe('pending mock tracking', () => {
  it('marks and consumes pending mocked request ids', () => {
    markPendingMock(3, 'req-1');
    expect(consumePendingMock(3, 'req-1')).toBe(true);
    expect(consumePendingMock(3, 'req-1')).toBe(false);
  });

  it('tracks modified requests separately and clears a tab', () => {
    markPendingMock(4, 'mock-1');
    markPendingModified(4, 'mod-1');

    clearPendingMocks(4);

    expect(consumePendingMock(4, 'mock-1')).toBe(false);
    expect(consumePendingModified(4, 'mod-1')).toBe(false);
  });
});

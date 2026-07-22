import { describe, expect, it } from 'vitest';
import {
  filterDelayInput,
  isValidDelayMs,
  normalizeDelayInput,
  normalizeDelayMs,
} from '../src/shared/rules/delay-ms';
import { DEFAULT_DELAY_MS } from '../src/shared/rules/defaults';

describe('delay helpers', () => {
  it('validates integer delays in range', () => {
    expect(isValidDelayMs(0)).toBe(true);
    expect(isValidDelayMs(999_999)).toBe(true);
    expect(isValidDelayMs(-1)).toBe(false);
    expect(isValidDelayMs(1_000_000)).toBe(false);
    expect(isValidDelayMs(1.5)).toBe(false);
  });

  it('normalizes invalid delays to the default', () => {
    expect(normalizeDelayMs(250)).toBe(250);
    expect(normalizeDelayMs(undefined)).toBe(DEFAULT_DELAY_MS);
    expect(normalizeDelayMs(-5)).toBe(DEFAULT_DELAY_MS);
  });

  it('filters and clamps delay input from the UI', () => {
    expect(filterDelayInput('a1b2c3')).toBe('123');
    expect(filterDelayInput('1234567')).toBe('123456');
    expect(normalizeDelayInput('')).toBe(DEFAULT_DELAY_MS);
    expect(normalizeDelayInput('250')).toBe(250);
    expect(normalizeDelayInput('2000000')).toBe(999_999);
  });
});

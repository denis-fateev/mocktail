import { DEFAULT_DELAY_MS } from './defaults';

const MIN_DELAY_MS = 0;
const MAX_DELAY_MS = 999_999;

export function isValidDelayMs(delayMs: number): boolean {
  return Number.isInteger(delayMs) && delayMs >= MIN_DELAY_MS && delayMs <= MAX_DELAY_MS;
}

export function normalizeDelayMs(delayMs: number | undefined): number {
  if (delayMs !== undefined && isValidDelayMs(delayMs)) {
    return delayMs;
  }
  return DEFAULT_DELAY_MS;
}

export function filterDelayInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6);
}

export function normalizeDelayInput(raw: string): number {
  if (!raw) {
    return DEFAULT_DELAY_MS;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_DELAY_MS;
  }

  return Math.min(Math.max(parsed, MIN_DELAY_MS), MAX_DELAY_MS);
}

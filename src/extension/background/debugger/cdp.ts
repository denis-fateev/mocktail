export const DEBUGGER_VERSION = '1.3';

export type FlatDebuggee = chrome.debugger.Debuggee & { sessionId?: string };

export function debuggee(tabId: number, sessionId?: string): FlatDebuggee {
  return sessionId ? { tabId, sessionId } : { tabId };
}

export async function sendCommand<T = void>(
  tabId: number,
  sessionId: string | undefined,
  method: string,
  commandParams?: Record<string, unknown>,
): Promise<T> {
  return chrome.debugger.sendCommand(
    debuggee(tabId, sessionId),
    method,
    commandParams,
  ) as Promise<T>;
}

export async function sendCommandSafe(
  tabId: number,
  sessionId: string | undefined,
  method: string,
  commandParams?: Record<string, unknown>,
): Promise<boolean> {
  try {
    await sendCommand(tabId, sessionId, method, commandParams);
    return true;
  } catch {
    return false;
  }
}

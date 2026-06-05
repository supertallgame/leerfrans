// Suppress all console output by default. Owners can enable verbose logging
// from the Owner dashboard (writes localStorage `debug_logs` = "true").
// Re-applied on every page load.

const METHODS = ["log", "info", "warn", "error", "debug", "trace"] as const;

declare global {
  interface Window {
    __origConsole?: Record<string, (...args: unknown[]) => void>;
  }
}

export function applyDebugLogging() {
  if (typeof window === "undefined") return;
  if (!window.__origConsole) {
    const orig: Record<string, (...args: unknown[]) => void> = {};
    for (const m of METHODS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orig[m] = (console as any)[m].bind(console);
    }
    window.__origConsole = orig;
  }
  const enabled = localStorage.getItem("debug_logs") === "true";
  const noop = () => {};
  for (const m of METHODS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any)[m] = enabled ? window.__origConsole![m] : noop;
  }
}

export function setDebugLogging(on: boolean) {
  localStorage.setItem("debug_logs", on ? "true" : "false");
  applyDebugLogging();
}

export function isDebugLogging() {
  return localStorage.getItem("debug_logs") === "true";
}

import { useEffect, useRef } from "react";

/**
 * Runs `callback` every `ms` milliseconds, but pauses while the tab is
 * hidden (document.hidden === true) and resumes when it becomes visible.
 *
 * Pass `ms = null` to disable the interval entirely (handy for conditional
 * polling, e.g. fallback only when a realtime channel is down).
 */
export function usePollingInterval(callback: () => void, ms: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (ms === null || ms <= 0) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer !== null) return;
      timer = setInterval(() => {
        savedCallback.current();
      }, ms);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    if (!document.hidden) start();

    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, [ms]);
}

import { lazy, ComponentType } from "react";

export function lazyRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err) => {
      // Retry once after clearing module cache (stale chunk after rebuild)
      console.warn("Retrying dynamic import after failure:", err);
      return new Promise<{ default: T }>((resolve, reject) => {
        setTimeout(() => {
          factory().then(resolve).catch(reject);
        }, 1000);
      });
    })
  );
}

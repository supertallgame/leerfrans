import { useEffect } from "react";

/**
 * Syncs the dark mode class on document.documentElement
 * based on localStorage("theme") or system preference.
 * Call this once per page/layout to ensure consistent theming.
 */
export function useThemeSync() {
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);
}

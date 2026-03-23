import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize an answer string for comparison:
 * lowercases, trims, collapses whitespace, strips punctuation.
 */
export function normalizeAnswer(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ").replace(/[.,?!;:'"]/g, "");
}

/**
 * Check if a user's input matches the expected answer.
 * Handles optional letters in parentheses, e.g. "fort(e)" accepts both "fort" and "forte".
 * Also handles alternatives separated by " / ".
 */
export function isAnswerCorrect(input: string, answer: string): boolean {
  const norm = normalizeAnswer(input);
  const variants = expandAnswer(answer);
  return variants.some((v) => normalizeAnswer(v) === norm);
}

/**
 * Expand an answer with optional parts in parentheses and " / " alternatives
 * into all accepted variants.
 * e.g. "fort(e)" → ["fort", "forte"]
 * e.g. "goed / sterk" → ["goed", "sterk"]
 * e.g. "il/elle est" → ["il/elle est"] (slash without spaces is NOT a separator)
 */
function expandAnswer(answer: string): string[] {
  // Split on " / " (with spaces) for alternatives
  const alts = answer.split(" / ").map((s) => s.trim());
  const results: string[] = [];
  for (const alt of alts) {
    // Expand parenthetical optional parts: e.g. "fort(e)" → "fort", "forte"
    const parenRegex = /\(([^)]+)\)/g;
    if (parenRegex.test(alt)) {
      // Without optional part
      results.push(alt.replace(/\([^)]+\)/g, ""));
      // With optional part (remove parens only)
      results.push(alt.replace(/[()]/g, ""));
    } else {
      results.push(alt);
    }
  }
  return results;
}

/**
 * Get the display-friendly version of an answer (strip parentheses notation).
 * e.g. "fort(e)" → "fort(e)" (keep as-is for display)
 */
export function getCleanAnswer(answer: string): string {
  return answer;
}

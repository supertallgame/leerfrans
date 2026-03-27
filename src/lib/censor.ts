const BANNED_WORDS = ["kut", "fuck", "hoer"];

const normalize = (text: string) =>
  text.toLowerCase().replace(/[^a-z]/g, " ");

export function containsBannedWord(text: string): string | null {
  const normalized = normalize(text);
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`);
    if (regex.test(normalized)) return word;
  }
  return null;
}

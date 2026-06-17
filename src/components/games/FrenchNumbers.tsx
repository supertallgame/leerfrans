import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X, Lightbulb, RefreshCw } from "lucide-react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { trackAnswer } from "@/lib/trackAnswer";
import { useChapter } from "@/contexts/ChapterContext";

interface Props {
  onBack: () => void;
}

// ─── French number conversion 0-100 ───
const UNITS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
const TEENS = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS: Record<number, string> = {
  20: "vingt",
  30: "trente",
  40: "quarante",
  50: "cinquante",
  60: "soixante",
};

function numberToFrench(n: number): string {
  if (n < 0 || n > 100) return "";
  if (n < 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];
  if (n === 100) return "cent";
  if (n < 70) {
    const t = Math.floor(n / 10) * 10;
    const u = n % 10;
    if (u === 0) return TENS[t];
    if (u === 1) return `${TENS[t]} et un`;
    return `${TENS[t]}-${UNITS[u]}`;
  }
  if (n < 80) {
    // 70-79 → soixante + (10..19)
    const sub = n - 60;
    if (n === 71) return "soixante et onze";
    return `soixante-${TEENS[sub - 10]}`;
  }
  if (n < 100) {
    // 80-99 → quatre-vingt(s) + ...
    if (n === 80) return "quatre-vingts";
    const sub = n - 80;
    if (sub < 10) return `quatre-vingt-${UNITS[sub]}`;
    return `quatre-vingt-${TEENS[sub - 10]}`;
  }
  return "";
}

function hintFor(n: number): string[] {
  if (n === 0) return ["0 is gewoon zéro."];
  if (n < 10) return [`${n} is een basisgetal: "${UNITS[n]}".`];
  if (n < 17) return [`${n} (10-16) heeft een eigen woord: "${TEENS[n - 10]}". Deze moet je gewoon leren.`];
  if (n < 20) return [
    `${n} bouw je op als 10 + ${n - 10}.`,
    `Dat wordt "dix-${UNITS[n - 10]}" = "${TEENS[n - 10]}".`,
  ];
  if (n === 20) return [`20 = "vingt". Geen koppelteken, geen rest.`];
  if (n === 100) return [`100 = "cent". Eén woord, klaar.`];
  if (n < 70) {
    const t = Math.floor(n / 10) * 10;
    const u = n % 10;
    if (u === 0) return [`${n} is een rond tiental: "${TENS[t]}".`];
    if (u === 1) return [
      `Tientallen + 1 krijgen "et un" (zonder streepje).`,
      `${n} = ${t} + 1 → "${TENS[t]} et un".`,
    ];
    return [
      `Eerst het tiental ${t} = "${TENS[t]}".`,
      `Dan + ${u} = "${UNITS[u]}", met streepje ertussen.`,
      `Samen: "${TENS[t]}-${UNITS[u]}".`,
    ];
  }
  if (n < 80) {
    // 70-79: in Frans is er geen "septante" — je telt door vanaf 60.
    const sub = n - 60;
    if (n === 70) return [
      `70 bestaat niet als apart woord in Frankrijk.`,
      `Je zegt 60 + 10 → "soixante-dix".`,
    ];
    if (n === 71) return [
      `71 = 60 + 11.`,
      `Net als bij 21 komt er "et" tussen: "soixante et onze".`,
    ];
    return [
      `${n} = 60 + ${sub} (60 + ${sub >= 10 ? TEENS[sub - 10] : UNITS[sub]}).`,
      `Dus: "soixante-${TEENS[sub - 10]}".`,
    ];
  }
  // 80-99
  if (n === 80) return [
    `80 = 4 × 20 in het Frans: "quatre-vingts".`,
    `Let op de -s aan het einde (alleen bij ronde 80).`,
  ];
  const sub = n - 80;
  if (n === 90) return [
    `90 bestaat niet apart: 4 × 20 + 10.`,
    `→ "quatre-vingt-dix" (zonder -s want er volgt nog iets).`,
  ];
  if (sub < 10) return [
    `${n} = 4 × 20 + ${sub}.`,
    `Geen "et" hier. → "quatre-vingt-${UNITS[sub]}".`,
  ];
  return [
    `${n} = 4 × 20 + ${sub} (${sub} = "${TEENS[sub - 10]}").`,
    `→ "quatre-vingt-${TEENS[sub - 10]}".`,
  ];
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[‐-‒–—]/g, "-")
    .replace(/\s*-\s*/g, "-");

function randomNumber(prev: number | null): number {
  let n = Math.floor(Math.random() * 101);
  if (prev !== null && n === prev) n = (n + 1) % 101;
  return n;
}

export default function FrenchNumbers({ onBack }: Props) {
  const { language, chapterId } = useChapter();
  const [current, setCurrent] = useState<number>(() => randomNumber(null));
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [hintsShown, setHintsShown] = useState(0);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const correct = useMemo(() => numberToFrench(current), [current]);
  const hints = useMemo(() => hintFor(current), [current]);

  const next = useCallback(() => {
    setCurrent((c) => randomNumber(c));
    setInput("");
    setStatus("idle");
    setHintsShown(0);
  }, []);

  const check = () => {
    if (status !== "idle") return;
    const ok = normalize(input) === normalize(correct);
    setStatus(ok ? "correct" : "wrong");
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
    ok ? playCorrect() : playWrong();
    trackAnswer({
      gameType: "getallen",
      language,
      chapterId,
      question: String(current),
      correctAnswer: correct,
      givenAnswer: input,
      isCorrect: ok,
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <span className="text-sm text-muted-foreground">
          {score.right} / {score.total}
        </span>
      </div>

      <Card className="w-full">
        <CardContent className="p-6 md:p-8 flex flex-col items-center gap-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Schrijf in het Frans
          </p>
          <p className="text-6xl md:text-7xl font-bold tabular-nums">{current}</p>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                status === "idle" ? check() : next();
              }
            }}
            disabled={status !== "idle"}
            placeholder="bijv. soixante-douze"
            className="text-base text-center"
            autoFocus
          />

          {status === "correct" && (
            <p className="flex items-center gap-2 text-[hsl(var(--success))] font-semibold">
              <Check className="h-5 w-5" /> Juist! {correct}
            </p>
          )}
          {status === "wrong" && (
            <p className="flex items-center gap-2 text-destructive font-semibold text-center">
              <X className="h-5 w-5" /> Het antwoord is "{correct}".
            </p>
          )}

          {hintsShown > 0 && (
            <div className="w-full bg-muted/50 rounded-lg p-3 space-y-1">
              {hints.slice(0, hintsShown).map((h, i) => (
                <p key={i} className="text-sm flex gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" /> {h}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 w-full">
            {status === "idle" ? (
              <>
                <Button onClick={check} className="flex-1" disabled={!input.trim()}>
                  Controleer
                </Button>
                {hintsShown < hints.length && (
                  <Button
                    variant="outline"
                    onClick={() => setHintsShown((h) => h + 1)}
                    className="gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Hint {hints.length > 1 ? `(${hintsShown + 1}/${hints.length})` : ""}
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={next} className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" /> Volgend getal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

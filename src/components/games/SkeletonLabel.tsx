import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, RotateCcw, Lightbulb } from "lucide-react";
import { playCorrect, playWrong, playSkip, playHint } from "@/lib/sounds";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import skeletonImg from "@/assets/skeleton.png";

interface Props {
  onBack: () => void;
}

interface BoneMarker {
  id: number;
  name: string;
  x: number;
  y: number;
}

// Updated bone positions for the new skeleton image
const BONES: BoneMarker[] = [
  { id: 1, name: "schedelbeenderen", x: 62, y: 3 },
  { id: 2, name: "bovenkaak", x: 36, y: 7 },
  { id: 3, name: "onderkaak", x: 36, y: 9 },
  { id: 4, name: "halswervel", x: 36, y: 11 },
  { id: 5, name: "sleutelbeen", x: 36, y: 14 },
  { id: 6, name: "schouderblad", x: 36, y: 16 },
  { id: 7, name: "borstbeen", x: 36, y: 19 },
  { id: 8, name: "opperarmbeen", x: 36, y: 21 },
  { id: 9, name: "rib", x: 36, y: 24 },
  { id: 10, name: "elleboog", x: 36, y: 27 },
  { id: 11, name: "borstwervel", x: 62, y: 30 },
  { id: 12, name: "lendenwervel", x: 62, y: 33 },
  { id: 13, name: "heupbeen", x: 62, y: 35 },
  { id: 14, name: "heiligbeen", x: 62, y: 37 },
  { id: 15, name: "spaakbeen", x: 62, y: 39 },
  { id: 16, name: "ellepijp", x: 62, y: 41 },
  { id: 17, name: "handwortelbeentjes", x: 62, y: 44 },
  { id: 18, name: "middenhandsbeentjes", x: 62, y: 46 },
  { id: 19, name: "vingerkootjes", x: 62, y: 48 },
  { id: 20, name: "dijbeen", x: 48, y: 55 },
  { id: 21, name: "knieschijf", x: 48, y: 63 },
  { id: 22, name: "scheenbeen", x: 48, y: 68 },
  { id: 23, name: "kuitbeen", x: 48, y: 72 },
  { id: 24, name: "voetwortelbeentjes", x: 48, y: 82 },
  { id: 25, name: "hielbeen", x: 48, y: 85 },
  { id: 26, name: "middenvoetsbeentjes", x: 48, y: 88 },
  { id: 27, name: "teenkootjes", x: 48, y: 92 },
];

export default function SkeletonLabel({ onBack }: Props) {
  const locale = useLocale();
  const i = t(locale);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const score = Object.values(results).filter(Boolean).length;
  const total = BONES.length;
  const answered = Object.keys(results).length;
  const skipped = Object.entries(answers).filter(([, v]) => v === "—").length;

  const currentBone = currentIndex < total ? BONES[currentIndex] : null;

  useEffect(() => {
    if (!finished) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex, finished]);

  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[- ]/g, "").replace(/ë/g, "e").replace(/ï/g, "i").replace(/['']/g, "").replace(/\s+/g, "");
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);

  const handleSubmit = () => {
    if (!currentBone || !inputValue.trim()) return;

    const isCorrect = normalize(inputValue) === normalize(currentBone.name);
    setAnswers((prev) => ({ ...prev, [currentBone.id]: inputValue.trim() }));
    setResults((prev) => ({ ...prev, [currentBone.id]: isCorrect }));

    if (isCorrect) playCorrect();
    else playWrong();

    setLastResult(isCorrect ? "correct" : "wrong");
    setTimeout(() => setLastResult(null), 800);

    setInputValue("");
    setHint("");

    if (currentIndex + 1 >= total) {
      setTimeout(() => {
        setFinished(true);
      }, 600);
    } else {
      setTimeout(() => setCurrentIndex((idx) => idx + 1), 600);
    }
  };

  const handleSkip = () => {
    if (!currentBone) return;
    setAnswers((prev) => ({ ...prev, [currentBone.id]: "—" }));
    setResults((prev) => ({ ...prev, [currentBone.id]: false }));
    playSkip();
    setInputValue("");
    setHint("");
    if (currentIndex + 1 >= total) {
      setTimeout(() => setFinished(true), 600);
    } else {
      setTimeout(() => setCurrentIndex((idx) => idx + 1), 600);
    }
  };

  const handleHint = () => {
    if (!currentBone) return;
    const name = currentBone.name;
    const revealed = hint.length + 1;
    if (revealed <= name.length) {
      setHint(name.slice(0, revealed));
      playHint();
    }
  };

  const reset = () => {
    setAnswers({});
    setResults({});
    setCurrentIndex(0);
    setInputValue("");
    setHint("");
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">🦴</p>
            <h2 className="text-2xl font-bold">{i.done}</h2>
            <p className="text-lg">
              {i.score}: <span className="font-bold text-primary">{score}</span> / {total}
            </p>
            <div className="w-full space-y-1 max-h-60 overflow-y-auto">
              {BONES.map((bone) => (
                <div
                  key={bone.id}
                  className={`flex items-center justify-between text-sm px-3 py-1.5 rounded ${
                    results[bone.id] ? "bg-[hsl(var(--success))]/10" : "bg-destructive/10"
                  }`}
                >
                  <span className="font-medium">{bone.id}. {bone.name}</span>
                  <span className="text-muted-foreground">
                    {results[bone.id] ? (
                      <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                    ) : (
                      <span className="text-destructive text-xs">
                        {answers[bone.id] ?? "—"}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> {i.restart}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm shrink-0">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <p className={`text-xs whitespace-nowrap transition-colors duration-300 ${
          lastResult === "correct" ? "text-[hsl(var(--success))] font-bold" :
          lastResult === "wrong" ? "text-destructive font-bold" : "text-muted-foreground"
        }`}>
          {answered}/{total} — {i.score}: {score} — {i.skip}: {skipped}
        </p>
      </div>

      {currentBone && !finished && (
        <div className="flex flex-col gap-2 w-full max-w-sm items-center">
          <p className="text-sm font-medium">
            {i.questionBone.replace("{n}", String(currentIndex + 1)).replace("{total}", String(total)).replace("{id}", String(currentBone.id))}
          </p>
          <div className="flex gap-2 w-full">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={i.typeBoneName}
              autoFocus
              className="text-base"
            />
            <Button onClick={handleSubmit} disabled={!inputValue.trim()} className="px-5">
              <Check className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handleSkip} className="flex-1 text-muted-foreground gap-1">
              <X className="h-4 w-4" /> {i.skip}
            </Button>
            <Button variant="outline" onClick={handleHint} className="flex-1 text-muted-foreground gap-1">
              <Lightbulb className="h-4 w-4" /> {i.hint}
            </Button>
          </div>
          {hint && (
            <p className="text-sm text-muted-foreground">
              {i.hint}: <span className="font-mono font-bold text-primary">{hint}</span>{"_".repeat(Math.max(0, (currentBone?.name.length ?? 0) - hint.length))}
            </p>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full mx-auto overflow-auto rounded-lg"
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        <div className="relative">
          <img
            src={skeletonImg}
            alt={i.skeleton}
            className="w-full h-auto select-none"
            style={{ minWidth: "100%", touchAction: "pinch-zoom", imageRendering: "-webkit-optimize-contrast" }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

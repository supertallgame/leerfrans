import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, RotateCcw, ZoomOut } from "lucide-react";
import { playCorrect, playWrong } from "@/lib/sounds";
import skeletonImg from "@/assets/skeleton-reference.jpeg";

interface Props {
  onBack: () => void;
}

interface BoneMarker {
  id: number;
  name: string;
  x: number; // percentage
  y: number; // percentage
}

const BONES: BoneMarker[] = [
  // Right side - upper body (at number positions, end of lines)
  { id: 1, name: "schedel", x: 63, y: 2 },
  { id: 2, name: "bovenkaak", x: 53, y: 7.5 },
  { id: 3, name: "onderkaak", x: 54, y: 9 },
  { id: 4, name: "halswervel", x: 54, y: 11 },
  { id: 5, name: "sleutelbeen", x: 50, y: 15 },
  { id: 6, name: "schouderblad", x: 52, y: 17 },
  { id: 7, name: "borstbeen", x: 50, y: 19 },
  { id: 8, name: "rib", x: 50, y: 21 },
  { id: 9, name: "borstwervel", x: 50, y: 23.5 },
  { id: 10, name: "opperarmbeen", x: 62, y: 26 },
  // Right side - mid/lower body
  { id: 11, name: "lendenwervel", x: 52, y: 32.5 },
  { id: 12, name: "spaakbeen", x: 53, y: 34.5 },
  { id: 13, name: "heupbeen", x: 53, y: 36 },
  { id: 14, name: "heiligbeen", x: 53, y: 37.5 },
  { id: 15, name: "staartbeen", x: 53, y: 39.5 },
  { id: 16, name: "ellepijp", x: 52, y: 41.5 },
  { id: 17, name: "handwortelbeentjes", x: 62, y: 44.5 },
  { id: 18, name: "middenhandsbeentjes", x: 64, y: 47 },
  { id: 19, name: "vingerkootjes", x: 66, y: 50.5 },
  // Left side - legs & feet
  { id: 20, name: "dijbeen", x: 40, y: 54.5 },
  { id: 21, name: "knieschijf", x: 41, y: 64.5 },
  { id: 22, name: "scheenbeen", x: 38, y: 75.5 },
  { id: 23, name: "kuitbeen", x: 39, y: 77.5 },
  { id: 24, name: "voetwortelbeentjes", x: 37, y: 86.5 },
  { id: 25, name: "middenvoetsbeentjes", x: 37.5, y: 88.5 },
  { id: 26, name: "hielbeen", x: 37.5, y: 90.5 },
  { id: 27, name: "teenkootjes", x: 38, y: 93 },
];

export default function SkeletonLabel({ onBack }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [finished, setFinished] = useState(false);
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
    s.toLowerCase().trim().replace(/[- ]/g, "").replace(/ë/g, "e").replace(/ï/g, "i");

  const handleSubmit = () => {
    if (!currentBone || !inputValue.trim()) return;

    const isCorrect = normalize(inputValue) === normalize(currentBone.name);
    setAnswers((prev) => ({ ...prev, [currentBone.id]: inputValue.trim() }));
    setResults((prev) => ({ ...prev, [currentBone.id]: isCorrect }));

    if (isCorrect) playCorrect();
    else playWrong();

    setInputValue("");

    if (currentIndex + 1 >= total) {
      setTimeout(() => {
        setFinished(true);
      }, 600);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 600);
    }
  };

  const handleSkip = () => {
    if (!currentBone) return;
    setAnswers((prev) => ({ ...prev, [currentBone.id]: "—" }));
    setResults((prev) => ({ ...prev, [currentBone.id]: false }));
    playWrong();
    setInputValue("");
    if (currentIndex + 1 >= total) {
      setTimeout(() => setFinished(true), 600);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 600);
    }
  };

  const reset = () => {
    setAnswers({});
    setResults({});
    setCurrentIndex(0);
    setInputValue("");
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">🦴</p>
            <h2 className="text-2xl font-bold">Klaar!</h2>
            <p className="text-lg">
              Score: <span className="font-bold text-primary">{score}</span> / {total}
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
              <RotateCcw className="h-4 w-4" /> Opnieuw
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <p className="text-sm text-muted-foreground">
          {answered} / {total} beantwoord — Score: {score} — Overgeslagen: {skipped}
        </p>
      </div>

      {currentBone && !finished && (
        <div className="flex flex-col gap-2 w-full max-w-sm items-center">
          <p className="text-sm font-medium">
            Vraag {currentIndex + 1}/{total}: Welk bot is nummer <span className="text-primary font-bold">{currentBone.id}</span>?
          </p>
          <div className="flex gap-2 w-full">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Typ de naam van het bot..."
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={!inputValue.trim()} size="icon">
            <Check className="h-4 w-4" />
          </Button>
            <Button variant="ghost" size="icon" onClick={handleSkip} title="Overslaan">
            <X className="h-4 w-4" />
          </Button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full mx-auto overflow-auto rounded-lg"
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        <div
          className="relative"
        >
          <img
            src={skeletonImg}
            alt="Menselijk skelet"
            className="w-full h-auto select-none"
            style={{ minWidth: "100%", touchAction: "pinch-zoom" }}
            draggable={false}
          />
          {BONES.map((bone) => {
            const isAnswered = results[bone.id] !== undefined;
            const isCorrect = results[bone.id];
            return (
              <div
                key={bone.id}
                className={`absolute w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all z-10 pointer-events-none ${
                  isAnswered
                    ? isCorrect
                      ? "bg-[hsl(var(--success))]/20 border-2 border-[hsl(var(--success))]"
                      : "bg-destructive/20 border-2 border-destructive"
                    : currentBone?.id === bone.id
                    ? "bg-primary/20 border-2 border-primary ring-2 ring-primary/40 animate-pulse"
                    : "bg-transparent border-0"
                }`}
                style={{
                  left: `${bone.x}%`,
                  top: `${bone.y}%`,
                  transform: `translate(-50%, -50%)`,
                }}
              >
                <span className="sr-only">Bot {bone.id}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

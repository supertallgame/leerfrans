import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import { playCorrect, playWrong } from "@/lib/sounds";
import skeletonImg from "@/assets/skeleton.png";

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
  { id: 1, name: "schedel", x: 50, y: 5 },
  { id: 2, name: "bovenkaak", x: 50, y: 8.5 },
  { id: 3, name: "onderkaak", x: 50, y: 10.5 },
  { id: 4, name: "halswervel", x: 50, y: 14 },
  { id: 5, name: "sleutelbeen", x: 40, y: 17 },
  { id: 6, name: "schouderblad", x: 62, y: 20 },
  { id: 7, name: "borstbeen", x: 50, y: 23 },
  { id: 8, name: "rib", x: 38, y: 26 },
  { id: 9, name: "borstwervel", x: 50, y: 32 },
  { id: 10, name: "opperarmbeen", x: 28, y: 30 },
  { id: 11, name: "lendenwervel", x: 50, y: 39 },
  { id: 12, name: "spaakbeen", x: 26, y: 40 },
  { id: 13, name: "heupbeen", x: 42, y: 44 },
  { id: 14, name: "heiligbeen", x: 50, y: 46 },
  { id: 15, name: "staartbeen", x: 50, y: 49 },
  { id: 16, name: "ellepijp", x: 72, y: 40 },
  { id: 17, name: "handwortelbeentjes", x: 24, y: 49 },
  { id: 18, name: "middenhandsbeentjes", x: 23, y: 52 },
  { id: 19, name: "vingerkootjes", x: 22, y: 56 },
  { id: 20, name: "dijbeen", x: 43, y: 60 },
  { id: 21, name: "knieschijf", x: 44, y: 72 },
  { id: 22, name: "scheenbeen", x: 46, y: 80 },
  { id: 23, name: "kuitbeen", x: 55, y: 80 },
  { id: 24, name: "voetwortelbeentjes", x: 44, y: 92 },
  { id: 25, name: "middenvoetsbeentjes", x: 43, y: 95 },
  { id: 26, name: "hielbeen", x: 56, y: 93 },
  { id: 27, name: "teenkootjes", x: 42, y: 97.5 },
];

export default function SkeletonLabel({ onBack }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const score = Object.values(results).filter(Boolean).length;
  const total = BONES.length;
  const answered = Object.keys(results).length;

  useEffect(() => {
    if (activeMarker !== null) {
      inputRef.current?.focus();
    }
  }, [activeMarker]);

  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[- ]/g, "").replace(/ë/g, "e").replace(/ï/g, "i");

  const handleSubmit = () => {
    if (activeMarker === null || !inputValue.trim()) return;
    const bone = BONES.find((b) => b.id === activeMarker);
    if (!bone) return;

    const isCorrect = normalize(inputValue) === normalize(bone.name);
    setAnswers((prev) => ({ ...prev, [activeMarker]: inputValue.trim() }));
    setResults((prev) => ({ ...prev, [activeMarker]: isCorrect }));

    if (isCorrect) playCorrect();
    else playWrong();

    setInputValue("");
    setActiveMarker(null);

    if (answered + 1 >= total) {
      setTimeout(() => setFinished(true), 300);
    }
  };

  const handleMarkerClick = (id: number) => {
    if (results[id] !== undefined) return; // already answered
    setActiveMarker(id);
    setInputValue("");
  };

  const reset = () => {
    setAnswers({});
    setResults({});
    setActiveMarker(null);
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
          {answered} / {total} beantwoord — Score: {score}
        </p>
      </div>

      {activeMarker !== null && (
        <div className="flex gap-2 w-full max-w-sm">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={`Bot ${activeMarker} — typ de naam...`}
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={!inputValue.trim()} size="icon">
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setActiveMarker(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!activeMarker && !finished && (
        <p className="text-sm text-muted-foreground">
          Klik op een nummer om het bot te benoemen
        </p>
      )}

      <div ref={containerRef} className="relative w-full max-w-xs md:max-w-sm mx-auto">
        <img
          src={skeletonImg}
          alt="Menselijk skelet"
          className="w-full h-auto select-none pointer-events-none"
          draggable={false}
        />
        {BONES.map((bone) => {
          const isAnswered = results[bone.id] !== undefined;
          const isCorrect = results[bone.id];
          const isActive = activeMarker === bone.id;

          return (
            <button
              key={bone.id}
              onClick={() => handleMarkerClick(bone.id)}
              className={`absolute w-5 h-5 md:w-6 md:h-6 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold transition-all border-2 ${
                isAnswered
                  ? isCorrect
                    ? "bg-[hsl(var(--success))] border-[hsl(var(--success))] text-white"
                    : "bg-destructive border-destructive text-destructive-foreground"
                  : isActive
                  ? "bg-primary border-primary text-primary-foreground scale-125 ring-2 ring-primary/40"
                  : "bg-background border-primary text-primary hover:scale-110 cursor-pointer shadow-sm"
              }`}
              style={{ left: `${bone.x}%`, top: `${bone.y}%` }}
              disabled={isAnswered}
              title={isAnswered ? (isCorrect ? bone.name : `${answers[bone.id]} → ${bone.name}`) : `Bot ${bone.id}`}
            >
              {bone.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

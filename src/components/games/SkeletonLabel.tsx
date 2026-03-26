import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, RotateCcw, ZoomOut } from "lucide-react";
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
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [finished, setFinished] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const ZOOM_SCALE = 2.5;

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
    // Zoom out after a brief pause so user sees the result color
    setTimeout(() => setZoomTarget(null), 600);

    if (answered + 1 >= total) {
      setTimeout(() => setFinished(true), 300);
    }
  };

  const handleMarkerClick = (id: number) => {
    if (results[id] !== undefined) return;
    const bone = BONES.find((b) => b.id === id);
    if (bone) {
      setZoomTarget({ x: bone.x, y: bone.y });
    }
    setActiveMarker(id);
    setInputValue("");
  };

  const handleZoomOut = () => {
    setZoomTarget(null);
    setActiveMarker(null);
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
          <Button variant="ghost" size="icon" onClick={handleZoomOut}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!activeMarker && !finished && (
        <p className="text-sm text-muted-foreground">
          Klik op een nummer om het bot te benoemen
        </p>
      )}

      <div
        ref={containerRef}
        className="relative w-full max-w-xs md:max-w-sm mx-auto overflow-hidden rounded-lg"
        style={{ cursor: zoomTarget ? "zoom-out" : undefined }}
        onClick={(e) => {
          if (zoomTarget && e.target === containerRef.current) handleZoomOut();
        }}
      >
        <div
          ref={imageWrapperRef}
          className="relative transition-transform duration-500 ease-out origin-center"
          style={
            zoomTarget
              ? {
                  transform: `scale(${ZOOM_SCALE})`,
                  transformOrigin: `${zoomTarget.x}% ${zoomTarget.y}%`,
                }
              : { transform: "scale(1)", transformOrigin: "center center" }
          }
        >
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

            const counterScale = zoomTarget ? 1 / ZOOM_SCALE : 1;

            return (
              <button
                key={bone.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkerClick(bone.id);
                }}
                className={`absolute w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold transition-all border-2 ${
                  isAnswered
                    ? isCorrect
                      ? "bg-[hsl(var(--success))] border-[hsl(var(--success))] text-white"
                      : "bg-destructive border-destructive text-destructive-foreground"
                    : isActive
                    ? "bg-primary border-primary text-primary-foreground ring-2 ring-primary/40"
                    : "bg-background border-primary text-primary hover:scale-110 cursor-pointer shadow-sm"
                }`}
                style={{
                  left: `${bone.x}%`,
                  top: `${bone.y}%`,
                  transform: `translate(-50%, -50%) scale(${counterScale})`,
                }}
                disabled={isAnswered}
                title={isAnswered ? (isCorrect ? bone.name : `${answers[bone.id]} → ${bone.name}`) : `Bot ${bone.id}`}
              >
                {bone.id}
              </button>
            );
          })}
        </div>
      </div>

      {zoomTarget && (
        <Button variant="outline" size="sm" onClick={handleZoomOut} className="gap-2">
          <ZoomOut className="h-4 w-4" /> Uitzoomen
        </Button>
      )}
    </div>
  );
}

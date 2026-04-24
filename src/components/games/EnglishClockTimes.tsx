import { useState, useMemo } from "react";
import { trackAnswer } from "@/lib/trackAnswer";
import { playCorrect, playWrong } from "@/lib/sounds";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

interface ClockQuestion {
  english: string;
  dutch: string;
  hour: number;
  minute: number;
}

// Build English clock phrases following the rules from the textbook (Lesson 3 Speaking)
// - 0 min → o'clock
// - 1-30 → past
// - 31-59 → to (next hour)
// - 15 → quarter / 30 → half
function toTwelve(h: number) {
  const v = ((h % 12) + 12) % 12;
  return v === 0 ? 12 : v;
}

function buildEnglish(hour: number, minute: number): string {
  if (minute === 0) return `It's ${toTwelve(hour)} o'clock.`;
  if (minute === 30) return `It's half past ${toTwelve(hour)}.`;
  if (minute === 15) return `It's (a) quarter past ${toTwelve(hour)}.`;
  if (minute === 45) return `It's (a) quarter to ${toTwelve(hour + 1)}.`;
  if (minute < 30) return `It's ${minute === 5 ? "five" : minute === 10 ? "ten" : minute === 20 ? "twenty" : "twenty-five"} past ${toTwelve(hour)}.`;
  // 31..59 (excluding 45) → to next hour
  const m = 60 - minute;
  return `It's ${m === 5 ? "five" : m === 10 ? "ten" : m === 20 ? "twenty" : "twenty-five"} to ${toTwelve(hour + 1)}.`;
}

function buildDutch(hour: number, minute: number): string {
  // Simplified Dutch reading
  if (minute === 0) return `Het is ${toTwelve(hour)} uur.`;
  if (minute === 30) return `Het is half ${toTwelve(hour + 1)}.`;
  if (minute === 15) return `Het is kwart over ${toTwelve(hour)}.`;
  if (minute === 45) return `Het is kwart voor ${toTwelve(hour + 1)}.`;
  if (minute === 5) return `Het is vijf over ${toTwelve(hour)}.`;
  if (minute === 10) return `Het is tien over ${toTwelve(hour)}.`;
  if (minute === 20) return `Het is tien voor half ${toTwelve(hour + 1)}.`;
  if (minute === 25) return `Het is vijf voor half ${toTwelve(hour + 1)}.`;
  if (minute === 35) return `Het is vijf over half ${toTwelve(hour + 1)}.`;
  if (minute === 40) return `Het is tien over half ${toTwelve(hour + 1)}.`;
  if (minute === 50) return `Het is tien voor ${toTwelve(hour + 1)}.`;
  if (minute === 55) return `Het is vijf voor ${toTwelve(hour + 1)}.`;
  return `${hour}:${minute.toString().padStart(2, "0")}`;
}

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const clockData: ClockQuestion[] = [];
for (let h = 1; h <= 12; h++) {
  for (const m of MINUTE_OPTIONS) {
    clockData.push({
      english: buildEnglish(h, m),
      dutch: buildDutch(h, m),
      hour: h,
      minute: m,
    });
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ClockFace({ hour, minute, size = 140 }: { hour: number; minute: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  function handPoints(angleDeg: number, length: number, baseWidth: number, tailLength: number = 0): string {
    const rad = (angleDeg - 90) * Math.PI / 180;
    const perpRad = rad + Math.PI / 2;
    const tx = cx + Math.cos(rad) * length;
    const ty = cy + Math.sin(rad) * length;
    const blx = cx + Math.cos(perpRad) * baseWidth;
    const bly = cy + Math.sin(perpRad) * baseWidth;
    const brx = cx - Math.cos(perpRad) * baseWidth;
    const bry = cy - Math.sin(perpRad) * baseWidth;
    const tlx = cx - Math.cos(rad) * tailLength;
    const tly = cy - Math.sin(rad) * tailLength;
    return `${tx},${ty} ${blx},${bly} ${tlx},${tly} ${brx},${bry}`;
  }

  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minAngle = minute * 6;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-md">
      <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2.5" />
      {Array.from({ length: 60 }).map((_, idx) => {
        const isHour = idx % 5 === 0;
        const angle = (idx * 6 - 90) * Math.PI / 180;
        const outerR = r - 3;
        const innerR = isHour ? r - 14 : r - 8;
        const x1 = cx + Math.cos(angle) * outerR;
        const y1 = cy + Math.sin(angle) * outerR;
        const x2 = cx + Math.cos(angle) * innerR;
        const y2 = cy + Math.sin(angle) * innerR;
        return (
          <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="hsl(var(--foreground))"
            strokeWidth={isHour ? 2.5 : 0.8}
            strokeLinecap="round"
            opacity={isHour ? 1 : 0.4}
          />
        );
      })}
      {Array.from({ length: 12 }).map((_, idx) => {
        const num = idx === 0 ? 12 : idx;
        const angle = (idx * 30 - 90) * Math.PI / 180;
        const tx = cx + Math.cos(angle) * (r - 26);
        const ty = cy + Math.sin(angle) * (r - 26);
        return (
          <text key={`n${idx}`} x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.11} fontWeight="700" fill="hsl(var(--foreground))"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {num}
          </text>
        );
      })}
      <polygon points={handPoints(hourAngle, r * 0.48, size * 0.035, size * 0.06)}
        fill="hsl(var(--foreground))" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinejoin="round" />
      <polygon points={handPoints(minAngle, r * 0.78, size * 0.022, size * 0.08)}
        fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={size * 0.04} fill="hsl(var(--primary))" />
      <circle cx={cx} cy={cy} r={size * 0.02} fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}

export default function EnglishClockTimes({ onBack }: Props) {
  const [questions] = useState(() => shuffle(clockData).slice(0, 15));
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const finished = qIndex >= questions.length;

  const current = questions[qIndex];

  const options = useMemo(() => {
    if (finished) return [];
    const correct = current.english;
    const others = shuffle(clockData.filter((c) => c.english !== correct))
      .slice(0, 3)
      .map((c) => c.english);
    return shuffle([correct, ...others]);
  }, [qIndex, finished]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt === current.english;
    if (isCorrect) { setScore((s) => s + 1); playCorrect(); }
    else { playWrong(); }
    trackAnswer({
      gameType: "clocktimes",
      language: "english",
      chapterId: "en_chapter2",
      question: current.dutch,
      correctAnswer: current.english,
      givenAnswer: opt,
      isCorrect,
    });
  };

  const handleNext = () => {
    setSelected(null);
    setQIndex((i) => i + 1);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">🎉</p>
            <h2 className="text-2xl font-bold">Klaar!</h2>
            <p className="text-lg">
              Score: <span className="font-bold text-primary">{score}</span> / {questions.length}
            </p>
            <Button onClick={() => { setQIndex(0); setScore(0); setSelected(null); }}>Opnieuw spelen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> Telling the time
        </span>
      </div>

      <Progress value={(qIndex / questions.length) * 100} className="w-full h-2" />

      <Card className="w-full">
        <CardContent className="p-4 md:p-6 flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">What time is it?</p>
          <ClockFace hour={current.hour} minute={current.minute} size={140} />
          <p className="text-sm text-muted-foreground">{current.dutch}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-2 md:gap-3 w-full">
        {options.map((opt, idx) => {
          const isCorrect = opt === current.english;
          const isSelected = opt === selected;
          let variant: "outline" | "default" | "destructive" = "outline";
          if (selected) {
            if (isCorrect) variant = "default";
            else if (isSelected) variant = "destructive";
          }
          return (
            <Button
              key={`${qIndex}-${idx}-${opt}`}
              variant={variant}
              className={`h-auto py-3 px-4 text-left justify-start whitespace-normal ${
                selected && isCorrect ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]" : ""
              }`}
              onClick={() => handleSelect(opt)}
            >
              {selected && isCorrect && <Check className="h-4 w-4 mr-2 shrink-0" />}
              {selected && isSelected && !isCorrect && <X className="h-4 w-4 mr-2 shrink-0" />}
              {opt}
            </Button>
          );
        })}
      </div>

      {selected && (
        <Button onClick={handleNext} className="w-full gap-2">
          Volgende <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

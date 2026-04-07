import { useState, useMemo } from "react";
import { trackAnswer } from "@/lib/trackAnswer";
import { playCorrect, playWrong } from "@/lib/sounds";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";

interface Props {
  onBack: () => void;
}

interface ClockQuestion {
  time: string;
  french: string;
  dutch: string;
  hour: number;
  minute: number;
}

const clockData: ClockQuestion[] = [
  // Hele uren
  { time: "1:00", french: "Il est une heure.", dutch: "Het is één uur.", hour: 1, minute: 0 },
  { time: "2:00", french: "Il est deux heures.", dutch: "Het is twee uur.", hour: 2, minute: 0 },
  { time: "3:00", french: "Il est trois heures.", dutch: "Het is drie uur.", hour: 3, minute: 0 },
  { time: "4:00", french: "Il est quatre heures.", dutch: "Het is vier uur.", hour: 4, minute: 0 },
  { time: "5:00", french: "Il est cinq heures.", dutch: "Het is vijf uur.", hour: 5, minute: 0 },
  { time: "6:00", french: "Il est six heures.", dutch: "Het is zes uur.", hour: 6, minute: 0 },
  { time: "7:00", french: "Il est sept heures.", dutch: "Het is zeven uur.", hour: 7, minute: 0 },
  { time: "8:00", french: "Il est huit heures.", dutch: "Het is acht uur.", hour: 8, minute: 0 },
  { time: "9:00", french: "Il est neuf heures.", dutch: "Het is negen uur.", hour: 9, minute: 0 },
  { time: "10:00", french: "Il est dix heures.", dutch: "Het is tien uur.", hour: 10, minute: 0 },
  { time: "11:00", french: "Il est onze heures.", dutch: "Het is elf uur.", hour: 11, minute: 0 },
  { time: "12:00", french: "Il est midi.", dutch: "Het is twaalf uur 's middags.", hour: 12, minute: 0 },
  { time: "0:00", french: "Il est minuit.", dutch: "Het is twaalf uur 's nachts.", hour: 0, minute: 0 },
  // Kwart over
  { time: "1:15", french: "Il est une heure et quart.", dutch: "Het is kwart over één.", hour: 1, minute: 15 },
  { time: "2:15", french: "Il est deux heures et quart.", dutch: "Het is kwart over twee.", hour: 2, minute: 15 },
  { time: "3:15", french: "Il est trois heures et quart.", dutch: "Het is kwart over drie.", hour: 3, minute: 15 },
  { time: "4:15", french: "Il est quatre heures et quart.", dutch: "Het is kwart over vier.", hour: 4, minute: 15 },
  { time: "5:15", french: "Il est cinq heures et quart.", dutch: "Het is kwart over vijf.", hour: 5, minute: 15 },
  { time: "6:15", french: "Il est six heures et quart.", dutch: "Het is kwart over zes.", hour: 6, minute: 15 },
  { time: "7:15", french: "Il est sept heures et quart.", dutch: "Het is kwart over zeven.", hour: 7, minute: 15 },
  { time: "8:15", french: "Il est huit heures et quart.", dutch: "Het is kwart over acht.", hour: 8, minute: 15 },
  { time: "9:15", french: "Il est neuf heures et quart.", dutch: "Het is kwart over negen.", hour: 9, minute: 15 },
  { time: "10:15", french: "Il est dix heures et quart.", dutch: "Het is kwart over tien.", hour: 10, minute: 15 },
  { time: "11:15", french: "Il est onze heures et quart.", dutch: "Het is kwart over elf.", hour: 11, minute: 15 },
  { time: "12:15", french: "Il est midi et quart.", dutch: "Het is kwart over twaalf.", hour: 12, minute: 15 },
  // Half
  { time: "1:30", french: "Il est une heure et demie.", dutch: "Het is half twee.", hour: 1, minute: 30 },
  { time: "2:30", french: "Il est deux heures et demie.", dutch: "Het is half drie.", hour: 2, minute: 30 },
  { time: "3:30", french: "Il est trois heures et demie.", dutch: "Het is half vier.", hour: 3, minute: 30 },
  { time: "4:30", french: "Il est quatre heures et demie.", dutch: "Het is half vijf.", hour: 4, minute: 30 },
  { time: "5:30", french: "Il est cinq heures et demie.", dutch: "Het is half zes.", hour: 5, minute: 30 },
  { time: "6:30", french: "Il est six heures et demie.", dutch: "Het is half zeven.", hour: 6, minute: 30 },
  { time: "7:30", french: "Il est sept heures et demie.", dutch: "Het is half acht.", hour: 7, minute: 30 },
  { time: "8:30", french: "Il est huit heures et demie.", dutch: "Het is half negen.", hour: 8, minute: 30 },
  { time: "9:30", french: "Il est neuf heures et demie.", dutch: "Het is half tien.", hour: 9, minute: 30 },
  { time: "10:30", french: "Il est dix heures et demie.", dutch: "Het is half elf.", hour: 10, minute: 30 },
  { time: "11:30", french: "Il est onze heures et demie.", dutch: "Het is half twaalf.", hour: 11, minute: 30 },
  { time: "12:30", french: "Il est midi et demi.", dutch: "Het is half één 's middags.", hour: 12, minute: 30 },
  // Kwart voor
  { time: "0:45", french: "Il est une heure moins le quart.", dutch: "Het is kwart voor één.", hour: 0, minute: 45 },
  { time: "1:45", french: "Il est deux heures moins le quart.", dutch: "Het is kwart voor twee.", hour: 1, minute: 45 },
  { time: "2:45", french: "Il est trois heures moins le quart.", dutch: "Het is kwart voor drie.", hour: 2, minute: 45 },
  { time: "3:45", french: "Il est quatre heures moins le quart.", dutch: "Het is kwart voor vier.", hour: 3, minute: 45 },
  { time: "4:45", french: "Il est cinq heures moins le quart.", dutch: "Het is kwart voor vijf.", hour: 4, minute: 45 },
  { time: "5:45", french: "Il est six heures moins le quart.", dutch: "Het is kwart voor zes.", hour: 5, minute: 45 },
  { time: "6:45", french: "Il est sept heures moins le quart.", dutch: "Het is kwart voor zeven.", hour: 6, minute: 45 },
  { time: "7:45", french: "Il est huit heures moins le quart.", dutch: "Het is kwart voor acht.", hour: 7, minute: 45 },
  { time: "8:45", french: "Il est neuf heures moins le quart.", dutch: "Het is kwart voor negen.", hour: 8, minute: 45 },
  { time: "9:45", french: "Il est dix heures moins le quart.", dutch: "Het is kwart voor tien.", hour: 9, minute: 45 },
  { time: "10:45", french: "Il est onze heures moins le quart.", dutch: "Het is kwart voor elf.", hour: 10, minute: 45 },
  { time: "11:45", french: "Il est midi moins le quart.", dutch: "Het is kwart voor twaalf.", hour: 11, minute: 45 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ClockFace({ hour, minute, size = 120 }: { hour: number; minute: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  // Hand helper: creates a tapered polygon for a clock hand
  function handPoints(angleDeg: number, length: number, baseWidth: number, tailLength: number = 0): string {
    const rad = (angleDeg - 90) * Math.PI / 180;
    const perpRad = rad + Math.PI / 2;
    // Tip
    const tx = cx + Math.cos(rad) * length;
    const ty = cy + Math.sin(rad) * length;
    // Base left/right
    const blx = cx + Math.cos(perpRad) * baseWidth;
    const bly = cy + Math.sin(perpRad) * baseWidth;
    const brx = cx - Math.cos(perpRad) * baseWidth;
    const bry = cy - Math.sin(perpRad) * baseWidth;
    // Tail
    const tlx = cx - Math.cos(rad) * tailLength;
    const tly = cy - Math.sin(rad) * tailLength;
    return `${tx},${ty} ${blx},${bly} ${tlx},${tly} ${brx},${bry}`;
  }

  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minAngle = minute * 6;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-md">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
      {/* Clock face */}
      <circle cx={cx} cy={cy} r={r} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2.5" />

      {/* Minute tick marks */}
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

      {/* Numbers */}
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

      {/* Hour hand - thick, short, dark */}
      <polygon
        points={handPoints(hourAngle, r * 0.48, size * 0.035, size * 0.06)}
        fill="hsl(var(--foreground))"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Minute hand - thinner, longer, primary color */}
      <polygon
        points={handPoints(minAngle, r * 0.78, size * 0.022, size * 0.08)}
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary))"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Center cap */}
      <circle cx={cx} cy={cy} r={size * 0.04} fill="hsl(var(--primary))" />
      <circle cx={cx} cy={cy} r={size * 0.02} fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}

export default function ClockTimes({ onBack }: Props) {
  const locale = useLocale();
  const i = t(locale);
  const [questions] = useState(() => shuffle(clockData).slice(0, 15));
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const finished = qIndex >= questions.length;

  const current = questions[qIndex];

  const options = useMemo(() => {
    if (finished) return [];
    const correct = current.french;
    const others = shuffle(clockData.filter((c) => c.french !== correct))
      .slice(0, 3)
      .map((c) => c.french);
    return shuffle([correct, ...others]);
  }, [qIndex, finished]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt === current.french;
    if (isCorrect) { setScore((s) => s + 1); playCorrect(); }
    else { playWrong(); }
    trackAnswer({ gameType: "clocktimes", language: "french", chapterId: "clocktimes", question: current.dutch, correctAnswer: current.french, givenAnswer: opt, isCorrect });
  };

  const handleNext = () => {
    setSelected(null);
    setQIndex((i) => i + 1);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">🎉</p>
            <h2 className="text-2xl font-bold">{i.done}</h2>
            <p className="text-lg">
              {i.score}: <span className="font-bold text-primary">{score}</span> / {questions.length}
            </p>
            <Button onClick={() => { setQIndex(0); setScore(0); setSelected(null); }}>{i.playAgain}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {i.clockTimes}
        </span>
      </div>

      <Progress value={(qIndex / questions.length) * 100} className="w-full h-2" />

      <Card className="w-full">
        <CardContent className="p-4 md:p-6 flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{i.whatTimeIsIt}</p>
          <ClockFace hour={current.hour} minute={current.minute} size={140} />
          <p className="text-sm text-muted-foreground">{current.dutch}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-2 md:gap-3 w-full">
        {options.map((opt, idx) => {
          const isCorrect = opt === current.french;
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
          {i.next} <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

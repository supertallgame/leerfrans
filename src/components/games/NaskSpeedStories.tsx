import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, ArrowRight, RefreshCw, Lightbulb, FlaskConical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { playCorrect } from "@/lib/sounds";

interface Props {
  onBack: () => void;
}

type QuestionType = "speed" | "distance" | "time";
/** Which unit the speed is presented in (for distance/time questions) */
type SpeedUnit = "ms" | "kmh";

interface Scenario {
  text: string;
}

const SCENARIOS: Scenario[] = [
  { text: "Tom fietst naar school" },
  { text: "Anna rent door het park" },
  { text: "Een auto rijdt over de snelweg" },
  { text: "De intercity rijdt van Utrecht naar Eindhoven" },
  { text: "Een vrachtwagen rijdt op de provinciale weg" },
  { text: "Een sprinter rent op de atletiekbaan" },
  { text: "Een marathonloper loopt door de stad" },
  { text: "Een wielrenner trapt door het bos" },
  { text: "Een brommer rijdt door het centrum" },
  { text: "Een skater rolt over het plein" },
  { text: "Een paard galoppeert door de wei" },
  { text: "Een windhond rent over het strand" },
  { text: "Een slak kruipt over een tegel" },
  { text: "Een mier loopt over de stoep" },
  { text: "Een vliegtuig taxiet over de landingsbaan" },
  { text: "Een speedboot vaart over het meer" },
  { text: "Een kano vaart over de rivier" },
  { text: "Lisa wandelt naar de supermarkt" },
  { text: "Sem skiet de berg af" },
  { text: "Emma fietst naar de hockeytraining" },
  { text: "Een politieauto rijdt met sirenes door de stad" },
  { text: "Een ambulance rijdt naar het ziekenhuis" },
  { text: "Een bus rijdt over de busbaan" },
  { text: "Een tram rijdt door Amsterdam" },
  { text: "Een raceauto rijdt over het circuit" },
  { text: "Een go-kart rijdt over de kartbaan" },
  { text: "Een drone vliegt boven het veld" },
  { text: "Een vogel vliegt naar zijn nest" },
  { text: "Een cheetah sprint achter een prooi aan" },
  { text: "Een dolfijn zwemt naast de boot" },
  { text: "Een ijsbeer loopt over het ijs" },
  { text: "Een skiër glijdt van de piste" },
  { text: "Een snowboarder daalt af" },
  { text: "Een step-rijder rolt over het fietspad" },
  { text: "Een hardloper traint op de baan" },
  { text: "Een zwemmer zwemt baantjes in het bad" },
  { text: "Een roeier roeit over het kanaal" },
  { text: "Een veerboot vaart van Den Helder naar Texel" },
  { text: "Een treintje rijdt door de pretpark" },
  { text: "Een skeelersporter rolt door het park" },
  { text: "Een paardrijder draaft door het bos" },
  { text: "Een loopeend waggelt over het pad" },
  { text: "Een raket vliegt door de lucht" },
  { text: "Een satelliet draait om de aarde" },
  { text: "Een geleidetrein zweeft over de Maglev-baan" },
];

interface Generated {
  scenario: Scenario;
  type: QuestionType;
  /** For distance/time: in which unit speed is presented in the prompt */
  speedUnit: SpeedUnit;
  d_m: number;
  t_s: number;
  display: {
    distance: string;
    distanceUnit: "m" | "km";
    time: string;
    timeUnit: "s" | "min" | "uur" | "h";
    speedMs: number;
    speedKmh: number;
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function pickInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(prev?: Generated): Generated {
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const types: QuestionType[] = ["speed", "speed", "distance", "distance", "time"];
  const type = types[Math.floor(Math.random() * types.length)];

  // Pick speed as multiple of 5 m/s so km/h is also a whole number (×3.6)
  const speedChoices = [5, 10, 15, 20, 25, 30];
  const profile = speedChoices[Math.floor(Math.random() * speedChoices.length)]; // m/s
  const t_s = pickInt(10, 600);
  const d_m = profile * t_s;

  const useKm = d_m >= 1000;
  const distance = useKm ? round2(d_m / 1000) : d_m;
  const distanceUnit: "m" | "km" = useKm ? "km" : "m";

  let time: number;
  let timeUnit: "s" | "min" | "uur";
  if (t_s >= 3600 && t_s % 60 === 0) {
    time = round2(t_s / 3600);
    timeUnit = "uur";
  } else if (t_s >= 60 && t_s % 60 === 0) {
    time = t_s / 60;
    timeUnit = "min";
  } else {
    time = t_s;
    timeUnit = "s";
  }

  const speedMs = round2(d_m / t_s);
  const speedKmh = round2(speedMs * 3.6);
  // Randomly present speed in m/s or km/h for distance/time questions
  const speedUnit: SpeedUnit = Math.random() < 0.5 ? "ms" : "kmh";

  const result: Generated = {
    scenario,
    type,
    speedUnit,
    d_m,
    t_s,
    display: { distance: String(distance), distanceUnit, time: String(time), timeUnit, speedMs, speedKmh },
  };

  if (prev && prev.scenario.text === scenario.text && prev.type === type) {
    return generateQuestion(prev);
  }
  return result;
}

function normalizeNumber(s: string): number | null {
  const cleaned = s.replace(/\s/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function isClose(input: number, target: number, tol = 0.15) {
  return Math.abs(input - target) <= tol;
}

function normText(s: string) {
  return s.toLowerCase().replace(/\s+/g, "").replace(/[·*×]/g, "*").replace(/[•∙]/g, "*");
}

/** Check the formule input. Accepts common variants. */
function checkFormule(input: string, type: QuestionType): boolean {
  const n = normText(input);
  if (type === "speed") {
    return n === "v=s/t" || n === "v=s:t" || n === "snelheid=afstand/tijd";
  }
  if (type === "distance") {
    return n === "s=v*t" || n === "s=v.t" || n === "s=vt" || n === "afstand=snelheid*tijd";
  }
  return n === "t=s/v" || n === "t=s:v" || n === "tijd=afstand/snelheid";
}

/** Loose check: each gegeven field must mention one of the two known values */
function checkGegevenPair(a: string, b: string, q: Generated): boolean {
  const both = `${a}\n${b}`;
  if (q.type === "speed") {
    return /(tijd|t\s*=)/i.test(both) && /(afstand|s\s*=)/i.test(both);
  }
  if (q.type === "distance") {
    return /(snelheid|v\s*=)/i.test(both) && /(tijd|t\s*=)/i.test(both);
  }
  return /(snelheid|v\s*=)/i.test(both) && /(afstand|s\s*=)/i.test(both);
}

function checkGevraagd(input: string, q: Generated): boolean {
  if (q.type === "speed") return /(snelheid|v\b|m\/s|km\/h)/i.test(input);
  if (q.type === "distance") return /(afstand|s\b|\bm\b)/i.test(input);
  return /(tijd|t\b|\bs\b|secon)/i.test(input);
}

export default function NaskSpeedStories({ onBack }: Props) {
  const [q, setQ] = useState<Generated>(() => generateQuestion());
  const [index, setIndex] = useState(1);
  const TOTAL = 10;
  const [score, setScore] = useState(0);

  // Worksheet fields
  const [gegeven1, setGegeven1] = useState("");
  const [gegeven2, setGegeven2] = useState("");
  const [gevraagd, setGevraagd] = useState("");
  const [formule, setFormule] = useState("");

  // Numeric answers
  const [ms, setMs] = useState("");
  const [kmh, setKmh] = useState("");
  const [singleAns, setSingleAns] = useState("");
  // For distance/time, also ask the missing speed unit
  const [extraKmh, setExtraKmh] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{ gegeven: boolean; gevraagd: boolean; formule: boolean; numeric: boolean } | null>(null);
  const [showHint, setShowHint] = useState(false);

  const finished = index > TOTAL;

  const prompt = useMemo(() => {
    const { scenario, display, type, speedUnit } = q;
    const shownSpeed = speedUnit === "ms" ? `${display.speedMs} m/s` : `${display.speedKmh} km/h`;
    if (type === "speed") {
      return `${scenario.text} en legt in ${display.time} ${display.timeUnit} een afstand van ${display.distance} ${display.distanceUnit} af. Bereken de gemiddelde snelheid in m/s én km/h.`;
    }
    if (type === "distance") {
      return `${scenario.text} met een gemiddelde snelheid van ${shownSpeed} gedurende ${display.time} ${display.timeUnit}. Bereken de afstand in meter en geef ook de snelheid in ${speedUnit === "ms" ? "km/h" : "m/s"}.`;
    }
    return `${scenario.text} met een gemiddelde snelheid van ${shownSpeed} en legt ${q.d_m} m af. Bereken de tijd in seconden en geef ook de snelheid in ${speedUnit === "ms" ? "km/h" : "m/s"}.`;
  }, [q]);

  const handleCheck = () => {
    if (submitted) return;

    const okGegeven = checkGegevenPair(gegeven1, gegeven2, q);
    const okGevraagd = checkGevraagd(gevraagd, q);
    const okFormule = checkFormule(formule, q.type);

    let okNumeric = false;
    if (q.type === "speed") {
      const a = normalizeNumber(ms);
      const b = normalizeNumber(kmh);
      okNumeric = a !== null && b !== null && isClose(a, q.display.speedMs, 0.2) && isClose(b, q.display.speedKmh, 0.5);
    } else if (q.type === "distance") {
      const a = normalizeNumber(singleAns);
      const conv = normalizeNumber(extraKmh);
      const target = q.speedUnit === "ms" ? q.display.speedKmh : q.display.speedMs;
      okNumeric = a !== null && conv !== null && isClose(a, q.d_m, 1) && isClose(conv, target, 0.5);
    } else {
      const a = normalizeNumber(singleAns);
      const conv = normalizeNumber(extraKmh);
      const target = q.speedUnit === "ms" ? q.display.speedKmh : q.display.speedMs;
      okNumeric = a !== null && conv !== null && isClose(a, q.t_s, 1) && isClose(conv, target, 0.5);
    }

    const allCorrect = okGegeven && okGevraagd && okFormule && okNumeric;
    setFeedback({ gegeven: okGegeven, gevraagd: okGevraagd, formule: okFormule, numeric: okNumeric });
    setResultCorrect(allCorrect);
    setSubmitted(true);
    if (allCorrect) {
      setScore((s) => s + 1);
      playCorrect();
    }
  };

  const handleNext = useCallback(() => {
    setQ((prev) => generateQuestion(prev));
    setGegeven1("");
    setGegeven2("");
    setGevraagd("");
    setFormule("");
    setMs("");
    setKmh("");
    setSingleAns("");
    setExtraKmh("");
    setSubmitted(false);
    setResultCorrect(null);
    setFeedback(null);
    setShowHint(false);
    setIndex((i) => i + 1);
  }, []);

  const handleRestart = () => {
    setQ(generateQuestion());
    setIndex(1);
    setScore(0);
    setGegeven1("");
    setGegeven2("");
    setGevraagd("");
    setFormule("");
    setMs("");
    setKmh("");
    setSingleAns("");
    setExtraKmh("");
    setSubmitted(false);
    setResultCorrect(null);
    setFeedback(null);
    setShowHint(false);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl">⚡</p>
            <h2 className="text-2xl font-bold">Goed gedaan!</h2>
            <p className="text-lg">
              Score: <span className="font-bold text-primary">{score}</span> / {TOTAL}
            </p>
            <Button onClick={handleRestart} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Nieuwe ronde
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fieldStatusClass = (ok: boolean | undefined) => {
    if (feedback === null || ok === undefined) return "";
    return ok ? "border-[hsl(var(--success))]" : "border-destructive";
  };

  const formulePlaceholder = q.type === "speed" ? "v = s / t" : q.type === "distance" ? "s = v · t" : "t = s / v";
  const gegevenPlaceholders: [string, string] =
    q.type === "speed"
      ? ["bv. t = 10 s", "bv. s = 50 m"]
      : q.type === "distance"
        ? ["bv. v = 5 m/s", "bv. t = 10 s"]
        : ["bv. v = 5 m/s", "bv. s = 50 m"];
  const gevraagdPlaceholder = q.type === "speed" ? "v in m/s en km/h" : q.type === "distance" ? "s in m" : "t in s";
  const otherUnitLabel = q.speedUnit === "ms" ? "km/h" : "m/s";

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          <FlaskConical className="h-3.5 w-3.5" /> Snelheid Verhalen
        </span>
      </div>

      <Progress value={((index - 1) / TOTAL) * 100} className="w-full h-2" />
      <div className="flex justify-between w-full text-xs text-muted-foreground">
        <span>Vraag {index} / {TOTAL}</span>
        <span>Score: {score}</span>
      </div>

      <Card className="w-full">
        <CardContent className="p-5 md:p-6 space-y-4">
          <p className="text-base md:text-lg leading-relaxed">{prompt}</p>

          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="grid grid-cols-[110px,1fr] gap-2 items-start">
              <label className="text-sm font-semibold text-muted-foreground pt-2">Gegeven:</label>
              <div className="space-y-2">
                <Input
                  value={gegeven1}
                  onChange={(e) => setGegeven1(e.target.value)}
                  disabled={submitted}
                  placeholder={gegevenPlaceholders[0]}
                  className={`text-base ${fieldStatusClass(feedback?.gegeven)}`}
                />
                <Input
                  value={gegeven2}
                  onChange={(e) => setGegeven2(e.target.value)}
                  disabled={submitted}
                  placeholder={gegevenPlaceholders[1]}
                  className={`text-base ${fieldStatusClass(feedback?.gegeven)}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-[110px,1fr] gap-2 items-center">
              <label className="text-sm font-semibold text-muted-foreground">Gevraagd:</label>
              <Input
                value={gevraagd}
                onChange={(e) => setGevraagd(e.target.value)}
                disabled={submitted}
                placeholder={gevraagdPlaceholder}
                className={`text-base ${fieldStatusClass(feedback?.gevraagd)}`}
              />
            </div>
            <div className="grid grid-cols-[110px,1fr] gap-2 items-center">
              <label className="text-sm font-semibold text-muted-foreground">Formule:</label>
              <Input
                value={formule}
                onChange={(e) => setFormule(e.target.value)}
                disabled={submitted}
                placeholder={formulePlaceholder}
                className={`text-base font-mono ${fieldStatusClass(feedback?.formule)}`}
              />
            </div>

            {q.type === "speed" ? (
              <div className="space-y-2">
                <div className="grid grid-cols-[110px,1fr] gap-2 items-center">
                  <label className="text-sm font-semibold text-muted-foreground">Antwoord m/s:</label>
                  <Input value={ms} onChange={(e) => setMs(e.target.value)} disabled={submitted} placeholder="bv. 5,5" inputMode="decimal" className={`text-base ${fieldStatusClass(feedback?.numeric)}`} />
                </div>
                <div className="grid grid-cols-[110px,1fr] gap-2 items-center">
                  <label className="text-sm font-semibold text-muted-foreground">Antwoord km/h:</label>
                  <Input value={kmh} onChange={(e) => setKmh(e.target.value)} disabled={submitted} placeholder="bv. 19,8" inputMode="decimal" className={`text-base ${fieldStatusClass(feedback?.numeric)}`} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[110px,1fr] gap-2 items-center">
                  <label className="text-sm font-semibold text-muted-foreground">Antwoord:</label>
                  <Input value={singleAns} onChange={(e) => setSingleAns(e.target.value)} disabled={submitted} placeholder={q.type === "distance" ? "afstand in m" : "tijd in s"} inputMode="decimal" className={`text-base ${fieldStatusClass(feedback?.numeric)}`} />
                </div>
                <div className="grid grid-cols-[110px,1fr] gap-2 items-center">
                  <label className="text-sm font-semibold text-muted-foreground">Snelheid in {otherUnitLabel}:</label>
                  <Input value={extraKmh} onChange={(e) => setExtraKmh(e.target.value)} disabled={submitted} placeholder={`snelheid in ${otherUnitLabel}`} inputMode="decimal" className={`text-base ${fieldStatusClass(feedback?.numeric)}`} />
                </div>
              </div>
            )}
          </div>

          {showHint && !submitted && (
            <div className="text-xs text-muted-foreground bg-accent/10 border border-accent/30 rounded-lg p-3">
              💡 Tip: zet eerst alles om naar SI-eenheden (meters en seconden). 1 km = 1000 m, 1 min = 60 s, 1 uur = 3600 s. Voor km/h → m/s: deel door 3,6. Voor m/s → km/h: maal 3,6.
            </div>
          )}

          {submitted && (
            <div className={`rounded-lg p-3 text-sm space-y-2 ${resultCorrect ? "bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30" : "bg-destructive/10 border border-destructive/30"}`}>
              <div className={`flex items-center gap-2 font-medium ${resultCorrect ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                {resultCorrect ? <><Check className="h-4 w-4" /> Helemaal goed!</> : <><X className="h-4 w-4" /> Bekijk je antwoord</>}
              </div>
              {feedback && (
                <ul className="text-xs space-y-0.5">
                  <li>Gegeven: {feedback.gegeven ? "✅" : "❌"}</li>
                  <li>Gevraagd: {feedback.gevraagd ? "✅" : "❌"}</li>
                  <li>Formule: {feedback.formule ? "✅" : "❌"}</li>
                  <li>Berekening: {feedback.numeric ? "✅" : "❌"}</li>
                </ul>
              )}
              <div className="space-y-1 text-foreground pt-1 border-t border-current/10">
                <p className="font-semibold">Voorbeeld uitwerking:</p>
                <p className="font-mono text-xs">Gegeven: afstand = {q.d_m} m, tijd = {q.t_s} s</p>
                <p className="font-mono text-xs">
                  Formule: {q.type === "speed" ? "v = s / t" : q.type === "distance" ? "s = v · t" : "t = s / v"}
                </p>
                {q.type === "speed" && (
                  <>
                    <p className="font-mono text-xs">v = {q.d_m} / {q.t_s} = {q.display.speedMs} m/s</p>
                    <p className="font-mono text-xs">v = {q.display.speedMs} × 3,6 = {q.display.speedKmh} km/h</p>
                    <p className="font-semibold">Antwoord: {q.display.speedMs} m/s = {q.display.speedKmh} km/h</p>
                  </>
                )}
                {q.type === "distance" && (
                  <>
                    <p className="font-mono text-xs">s = {q.display.speedMs} × {q.t_s} = {q.d_m} m</p>
                    <p className="font-semibold">Antwoord: {q.d_m} m — snelheid = {q.display.speedMs} m/s = {q.display.speedKmh} km/h</p>
                  </>
                )}
                {q.type === "time" && (
                  <>
                    <p className="font-mono text-xs">t = {q.d_m} / {q.display.speedMs} = {q.t_s} s</p>
                    <p className="font-semibold">Antwoord: {q.t_s} s — snelheid = {q.display.speedMs} m/s = {q.display.speedKmh} km/h</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!submitted ? (
              <>
                <Button onClick={handleCheck} className="flex-1">Controleer</Button>
                <Button variant="outline" onClick={() => setShowHint((h) => !h)} className="gap-2">
                  <Lightbulb className="h-4 w-4" /> Hint
                </Button>
              </>
            ) : (
              <Button onClick={handleNext} className="flex-1 gap-2">
                Volgende <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

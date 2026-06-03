import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, ArrowRight, RefreshCw, Lightbulb, FlaskConical, Repeat, Calculator as CalcIcon, Delete } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { playCorrect } from "@/lib/sounds";

interface Props {
  onBack: () => void;
}

type QuestionType = "speed" | "distance" | "time";
type SpeedUnit = "ms" | "kmh";
type DistUnit = "m" | "km";
type TimeUnit = "s" | "min" | "uur";

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
  { text: "Een vliegtuig taxiet over de landingsbaan" },
  { text: "Een speedboot vaart over het meer" },
  { text: "Lisa wandelt naar de supermarkt" },
  { text: "Sem skiet de berg af" },
  { text: "Emma fietst naar de hockeytraining" },
  { text: "Een politieauto rijdt met sirenes door de stad" },
  { text: "Een ambulance rijdt naar het ziekenhuis" },
  { text: "Een bus rijdt over de busbaan" },
  { text: "Een tram rijdt door Amsterdam" },
  { text: "Een raceauto rijdt over het circuit" },
  { text: "Een drone vliegt boven het veld" },
  { text: "Een cheetah sprint achter een prooi aan" },
  { text: "Een dolfijn zwemt naast de boot" },
  { text: "Een skiër glijdt van de piste" },
  { text: "Een snowboarder daalt af" },
  { text: "Een hardloper traint op de baan" },
  { text: "Een zwemmer zwemt baantjes in het bad" },
  { text: "Een roeier roeit over het kanaal" },
  { text: "Een veerboot vaart van Den Helder naar Texel" },
];

interface Generated {
  scenario: Scenario;
  type: QuestionType;
  speedUnit: SpeedUnit;
  d_m: number;
  t_s: number;
  display: {
    distance: string;
    distanceUnit: "m" | "km";
    time: string;
    timeUnit: "s" | "min" | "uur";
    speedMs: number;
    speedKmh: number;
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const pickInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateQuestion(prev?: Generated): Generated {
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const types: QuestionType[] = ["speed", "speed", "distance", "distance", "time"];
  const type = types[Math.floor(Math.random() * types.length)];

  const speedChoices = [5, 10, 15, 20, 25, 30];
  const profile = speedChoices[Math.floor(Math.random() * speedChoices.length)];
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
  const speedUnit: SpeedUnit = Math.random() < 0.5 ? "ms" : "kmh";

  const result: Generated = {
    scenario,
    type,
    speedUnit,
    d_m,
    t_s,
    display: { distance: String(distance), distanceUnit, time: String(time), timeUnit, speedMs, speedKmh },
  };

  if (prev && prev.scenario.text === scenario.text && prev.type === type) return generateQuestion(prev);
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

function checkFormule(input: string, type: QuestionType): boolean {
  const n = normText(input);
  if (type === "speed") return n === "v=s/t" || n === "v=s:t" || n === "snelheid=afstand/tijd";
  if (type === "distance") return n === "s=v*t" || n === "s=v.t" || n === "s=vt" || n === "afstand=snelheid*tijd";
  return n === "t=s/v" || n === "t=s:v" || n === "tijd=afstand/snelheid";
}

function checkGegevenPair(a: string, b: string, q: Generated): boolean {
  const both = `${a}\n${b}`;
  if (q.type === "speed") return /(tijd|t\s*=)/i.test(both) && /(afstand|s\s*=)/i.test(both);
  if (q.type === "distance") return /(snelheid|v\s*=)/i.test(both) && /(tijd|t\s*=)/i.test(both);
  return /(snelheid|v\s*=)/i.test(both) && /(afstand|s\s*=)/i.test(both);
}

function checkGevraagd(input: string, q: Generated): boolean {
  if (q.type === "speed") return /(snelheid|v\b|m\/s|km\/h)/i.test(input);
  if (q.type === "distance") return /(afstand|s\b|\bm\b|km)/i.test(input);
  return /(tijd|t\b|\bs\b|secon|min|uur)/i.test(input);
}

// Mini calculator
function MiniCalculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string>("");

  const append = (v: string) => setExpr((e) => e + v);
  const clear = () => { setExpr(""); setResult(""); };
  const back = () => setExpr((e) => e.slice(0, -1));
  const evalNow = () => {
    try {
      const sanitized = expr.replace(/,/g, ".").replace(/×/g, "*").replace(/÷/g, "/");
      if (!/^[-+/*().0-9\s]*$/.test(sanitized)) { setResult("Err"); return; }
      // eslint-disable-next-line no-new-func
      const v = Function(`"use strict";return (${sanitized || "0"})`)();
      setResult(String(Math.round(v * 10000) / 10000));
    } catch { setResult("Err"); }
  };

  const keys: { l: string; v?: string; act?: () => void; cls?: string }[] = [
    { l: "C", act: clear, cls: "bg-destructive/15 text-destructive" },
    { l: "⌫", act: back },
    { l: "(", v: "(" },
    { l: ")", v: ")" },
    { l: "7", v: "7" }, { l: "8", v: "8" }, { l: "9", v: "9" }, { l: "÷", v: "/" },
    { l: "4", v: "4" }, { l: "5", v: "5" }, { l: "6", v: "6" }, { l: "×", v: "*" },
    { l: "1", v: "1" }, { l: "2", v: "2" }, { l: "3", v: "3" }, { l: "−", v: "-" },
    { l: "0", v: "0" }, { l: ".", v: "." }, { l: "=", act: evalNow, cls: "bg-primary text-primary-foreground" }, { l: "+", v: "+" },
  ];

  return (
    <Card className="w-full md:w-56 shrink-0">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalcIcon className="h-3.5 w-3.5" /> Rekenmachine
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1.5 min-h-[3.25rem] text-right">
          <div className="text-xs text-muted-foreground truncate">{expr || "0"}</div>
          <div className="text-lg font-mono font-semibold truncate">{result || ""}</div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {keys.map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => (k.act ? k.act() : k.v && append(k.v))}
              className={`h-9 rounded-md border bg-card hover:bg-accent text-sm font-medium transition ${k.cls ?? ""}`}
            >
              {k.l === "⌫" ? <Delete className="h-4 w-4 mx-auto" /> : k.l}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function NaskSpeedStories({ onBack }: Props) {
  const [q, setQ] = useState<Generated>(() => generateQuestion());
  const [index, setIndex] = useState(1);
  const TOTAL = 10;
  const [score, setScore] = useState(0);

  const [gegeven1, setGegeven1] = useState("");
  const [gegeven2, setGegeven2] = useState("");
  const [gevraagd, setGevraagd] = useState("");
  const [formule, setFormule] = useState("");

  const [answer, setAnswer] = useState("");
  // Unit chosen by user for the answer
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("ms");
  const [distUnit, setDistUnit] = useState<DistUnit>("m");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("s");

  const [submitted, setSubmitted] = useState(false);
  const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{ gegeven: boolean; gevraagd: boolean; formule: boolean; numeric: boolean } | null>(null);
  const [showHint, setShowHint] = useState(false);

  const finished = index > TOTAL;

  const prompt = useMemo(() => {
    const { scenario, display, type, speedUnit: su } = q;
    const shownSpeed = su === "ms" ? `${display.speedMs} m/s` : `${display.speedKmh} km/h`;
    if (type === "speed") {
      return `${scenario.text} en legt in ${display.time} ${display.timeUnit} een afstand van ${display.distance} ${display.distanceUnit} af. Bereken de gemiddelde snelheid.`;
    }
    if (type === "distance") {
      return `${scenario.text} met een gemiddelde snelheid van ${shownSpeed} gedurende ${display.time} ${display.timeUnit}. Bereken de afstand.`;
    }
    return `${scenario.text} met een gemiddelde snelheid van ${shownSpeed} en legt ${q.d_m} m af. Bereken de tijd.`;
  }, [q]);

  const cycleUnit = () => {
    if (q.type === "speed") setSpeedUnit((u) => (u === "ms" ? "kmh" : "ms"));
    else if (q.type === "distance") setDistUnit((u) => (u === "m" ? "km" : "m"));
    else setTimeUnit((u) => (u === "s" ? "min" : u === "min" ? "uur" : "s"));
  };

  const currentUnitLabel =
    q.type === "speed" ? (speedUnit === "ms" ? "m/s" : "km/h")
    : q.type === "distance" ? distUnit
    : timeUnit;

  const handleCheck = () => {
    if (submitted) return;

    const okGegeven = checkGegevenPair(gegeven1, gegeven2, q);
    const okGevraagd = checkGevraagd(gevraagd, q);
    const okFormule = checkFormule(formule, q.type);

    let okNumeric = false;
    const a = normalizeNumber(answer);
    if (a !== null) {
      if (q.type === "speed") {
        const target = speedUnit === "ms" ? q.display.speedMs : q.display.speedKmh;
        okNumeric = isClose(a, target, speedUnit === "ms" ? 0.2 : 0.5);
      } else if (q.type === "distance") {
        const target = distUnit === "m" ? q.d_m : round2(q.d_m / 1000);
        okNumeric = isClose(a, target, distUnit === "m" ? 1 : 0.05);
      } else {
        const target = timeUnit === "s" ? q.t_s : timeUnit === "min" ? round2(q.t_s / 60) : round2(q.t_s / 3600);
        okNumeric = isClose(a, target, timeUnit === "s" ? 1 : timeUnit === "min" ? 0.1 : 0.02);
      }
    }

    const allCorrect = okGegeven && okGevraagd && okFormule && okNumeric;
    setFeedback({ gegeven: okGegeven, gevraagd: okGevraagd, formule: okFormule, numeric: okNumeric });
    setResultCorrect(allCorrect);
    setSubmitted(true);
    if (allCorrect) { setScore((s) => s + 1); playCorrect(); }
  };

  const resetFields = () => {
    setGegeven1(""); setGegeven2(""); setGevraagd(""); setFormule("");
    setAnswer(""); setSpeedUnit("ms"); setDistUnit("m"); setTimeUnit("s");
    setSubmitted(false); setResultCorrect(null); setFeedback(null); setShowHint(false);
  };

  const handleNext = useCallback(() => {
    setQ((prev) => generateQuestion(prev));
    resetFields();
    setIndex((i) => i + 1);
  }, []);

  const handleRestart = () => {
    setQ(generateQuestion()); setIndex(1); setScore(0); resetFields();
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
            <p className="text-lg">Score: <span className="font-bold text-primary">{score}</span> / {TOTAL}</p>
            <Button onClick={handleRestart} className="gap-2"><RefreshCw className="h-4 w-4" /> Nieuwe ronde</Button>
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
    q.type === "speed" ? ["bv. t = 10 s", "bv. s = 50 m"]
      : q.type === "distance" ? ["bv. v = 5 m/s", "bv. t = 10 s"]
      : ["bv. v = 5 m/s", "bv. s = 50 m"];
  const gevraagdPlaceholder = q.type === "speed" ? "v in m/s of km/h" : q.type === "distance" ? "s in m of km" : "t in s, min of uur";

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-5xl mx-auto">
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

      <div className="flex flex-col md:flex-row gap-4 w-full items-start">
        <Card className="w-full flex-1">
          <CardContent className="p-5 md:p-6 space-y-4">
            <p className="text-base md:text-lg leading-relaxed">{prompt}</p>

            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="grid grid-cols-[110px,1fr] gap-2 items-start">
                <label className="text-sm font-semibold text-muted-foreground pt-2">Gegeven:</label>
                <div className="space-y-2">
                  <Input value={gegeven1} onChange={(e) => setGegeven1(e.target.value)} disabled={submitted} placeholder={gegevenPlaceholders[0]} className={`text-base ${fieldStatusClass(feedback?.gegeven)}`} />
                  <Input value={gegeven2} onChange={(e) => setGegeven2(e.target.value)} disabled={submitted} placeholder={gegevenPlaceholders[1]} className={`text-base ${fieldStatusClass(feedback?.gegeven)}`} />
                </div>
              </div>
              <div className="grid grid-cols-[110px,1fr] gap-2 items-center">
                <label className="text-sm font-semibold text-muted-foreground">Gevraagd:</label>
                <Input value={gevraagd} onChange={(e) => setGevraagd(e.target.value)} disabled={submitted} placeholder={gevraagdPlaceholder} className={`text-base ${fieldStatusClass(feedback?.gevraagd)}`} />
              </div>
              <div className="grid grid-cols-[110px,1fr] gap-2 items-center">
                <label className="text-sm font-semibold text-muted-foreground">Formule:</label>
                <Input value={formule} onChange={(e) => setFormule(e.target.value)} disabled={submitted} placeholder={formulePlaceholder} className={`text-base font-mono ${fieldStatusClass(feedback?.formule)}`} />
              </div>

              <div className="grid grid-cols-[110px,1fr] gap-2 items-start">
                <label className="text-sm font-semibold text-muted-foreground pt-2">Antwoord:</label>
                <div className="space-y-2">
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={submitted}
                    placeholder="bv. 5,5"
                    inputMode="decimal"
                    className={`text-base ${fieldStatusClass(feedback?.numeric)}`}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Eenheid:</span>
                    {(q.type === "speed"
                      ? (["ms", "kmh"] as const).map((u) => ({ key: u, label: u === "ms" ? "m/s" : "km/h", active: speedUnit === u, set: () => setSpeedUnit(u) }))
                      : q.type === "distance"
                        ? (["m", "km"] as const).map((u) => ({ key: u, label: u, active: distUnit === u, set: () => setDistUnit(u) }))
                        : (["s", "min", "uur"] as const).map((u) => ({ key: u, label: u, active: timeUnit === u, set: () => setTimeUnit(u) }))
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={opt.set}
                        disabled={submitted}
                        className={`px-3 py-1.5 rounded-md border text-sm font-medium transition disabled:opacity-60 ${
                          opt.active
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card hover:bg-accent border-border text-muted-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
                  <p className="font-mono text-xs">Formule: {q.type === "speed" ? "v = s / t" : q.type === "distance" ? "s = v · t" : "t = s / v"}</p>
                  {q.type === "speed" && (
                    <>
                      <p className="font-mono text-xs">v = {q.d_m} / {q.t_s} = {q.display.speedMs} m/s</p>
                      <p className="font-semibold">Antwoord: {q.display.speedMs} m/s = {q.display.speedKmh} km/h</p>
                    </>
                  )}
                  {q.type === "distance" && (
                    <>
                      <p className="font-mono text-xs">s = {q.display.speedMs} × {q.t_s} = {q.d_m} m</p>
                      <p className="font-semibold">Antwoord: {q.d_m} m = {round2(q.d_m / 1000)} km</p>
                    </>
                  )}
                  {q.type === "time" && (
                    <>
                      <p className="font-mono text-xs">t = {q.d_m} / {q.display.speedMs} = {q.t_s} s</p>
                      <p className="font-semibold">Antwoord: {q.t_s} s</p>
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

        <MiniCalculator />
      </div>
    </div>
  );
}

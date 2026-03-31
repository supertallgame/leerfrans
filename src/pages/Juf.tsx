import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getChaptersForLanguage, Language } from "@/data/vocabulary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, Brain, Download, GitCompareArrows, Loader2, MessageSquarePlus, RefreshCw, StickyNote, Trash2, TrendingDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

const ALLOWED_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

const GAME_TYPE_LABELS: Record<string, string> = {
  quiz: "Meerkeuze Quiz",
  type: "Typ het Antwoord",
  truefalse: "Waar of Onwaar",
  fill: "Ontbrekende Letters",
  sentence: "Zin Aanvullen",
  memory: "Memory",
  match: "Koppel Paren",
  clocktimes: "Kloktijden",
  etre: "Être (zijn)",
};

const PERIOD_LABELS: Record<string, string> = {
  "1": "24 uur",
  "7": "Week",
  "30": "Maand",
  "90": "3 maanden",
};

interface DailyPoint { date: string; total: number; correct: number; accuracy: number; }
interface Stats { total: number; correct: number; wrong: number; accuracy: number; }
interface DifficultItem { question: string; correct: number; wrong: number; total: number; accuracy: number; wrongAnswers: string[]; }
interface AnalysisResult {
  analysis: string;
  stats: Stats;
  difficultItems: DifficultItem[];
  gameStats: Record<string, { total: number; correct: number }>;
  dailyStats: DailyPoint[];
}

const chartConfig = {
  accuracy: { label: "Nauwkeurigheid %", color: "hsl(var(--primary))" },
  total: { label: "Aantal antwoorden", color: "hsl(var(--muted-foreground))" },
};

function downloadCSV(result: AnalysisResult) {
  const rows = [
    ["Vraag", "Totaal", "Correct", "Fout", "Nauwkeurigheid %", "Veelgemaakte fouten"],
    ...result.difficultItems.map(i => [`"${i.question}"`, i.total, i.correct, i.wrong, i.accuracy, `"${i.wrongAnswers.join(", ")}"`]),
    [], ["Speltype", "Totaal", "Correct", "Nauwkeurigheid %"],
    ...Object.entries(result.gameStats).map(([type, s]) => [GAME_TYPE_LABELS[type] || type, s.total, s.correct, Math.round((s.correct / s.total) * 100)]),
    [], ["Datum", "Totaal", "Correct", "Nauwkeurigheid %"],
    ...(result.dailyStats || []).map(d => [d.date, d.total, d.correct, d.accuracy]),
  ];
  const csv = rows.map(r => (r as (string | number)[]).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leerling-analyse-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Stat card with optional comparison ── */
function StatCard({ label, value, compareValue, color }: { label: string; value: number; compareValue?: number; color?: string }) {
  const diff = compareValue != null ? value - compareValue : null;
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className={`text-2xl md:text-3xl font-bold ${color || ""}`}>{typeof value === "number" && label.includes("%") ? `${value}%` : value}</p>
        {diff != null && (
          <p className={`text-xs font-semibold mt-1 ${diff > 0 ? "text-[hsl(var(--success))]" : diff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {diff > 0 ? "▲" : diff < 0 ? "▼" : "="} {Math.abs(diff)}{label.includes("%") ? "%" : ""} vs vorige
          </p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

const Juf = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [language, setLanguage] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [days, setDays] = useState("7");

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareDays, setCompareDays] = useState("30");
  const [compareResult, setCompareResult] = useState<AnalysisResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Notes
  interface JufNote { id: string; note: string; filters: Record<string, string>; created_at: string; }
  const [notes, setNotes] = useState<JufNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const fetchNotes = useCallback(async () => {
    const { data } = await supabase.from("juf_notes").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setNotes(data as unknown as JufNote[]);
  }, []);

  const saveNote = async () => {
    if (!newNote.trim()) return;
    await supabase.from("juf_notes").insert({
      user_email: (await supabase.auth.getUser()).data.user?.email ?? "",
      note: newNote.trim(),
      filters: { language, chapter: chapterFilter, days } as unknown as Record<string, string>,
    });
    setNewNote("");
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await supabase.from("juf_notes").delete().eq("id", id);
    fetchNotes();
  };

  const availableChapters = useMemo(() => {
    if (language === "all") return [];
    return getChaptersForLanguage(language as Language);
  }, [language]);

  useEffect(() => { setChapterFilter("all"); }, [language]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthorized(!!session?.user?.email && ALLOWED_EMAILS.includes(session.user.email));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthorized(!!session?.user?.email && ALLOWED_EMAILS.includes(session.user.email));
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchOne = useCallback(async (periodDays: number) => {
    const { data, error } = await supabase.functions.invoke("analyze-answers", {
      body: {
        language: language === "all" ? null : language,
        chapterId: chapterFilter === "all" ? null : chapterFilter,
        days: periodDays,
      },
    });
    if (error) throw error;
    return data as AnalysisResult;
  }, [language, chapterFilter]);

  const fetchAnalysis = async () => {
    setLoading(true);
    if (compareMode) setCompareLoading(true);
    try {
      const [primary, secondary] = await Promise.all([
        fetchOne(parseInt(days)),
        compareMode ? fetchOne(parseInt(compareDays)) : Promise.resolve(null),
      ]);
      setResult(primary);
      setCompareResult(secondary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setCompareLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) { fetchAnalysis(); fetchNotes(); }
  }, [authorized]);

  if (authorized === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-xl text-muted-foreground">Pagina niet gevonden</p>
        </div>
      </main>
    );
  }

  const cmp = compareMode && compareResult ? compareResult.stats : undefined;

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-3xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Leerling Analyse
          </h1>
          <div className="w-20" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Vak</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle vakken</SelectItem>
                <SelectItem value="french">Frans</SelectItem>
                <SelectItem value="english">Engels</SelectItem>
                <SelectItem value="nask">NASK</SelectItem>
                <SelectItem value="biology">Biologie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {language !== "all" && availableChapters.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Hoofdstuk</label>
              <Select value={chapterFilter} onValueChange={setChapterFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle hoofdstukken</SelectItem>
                  {availableChapters.map(ch => (
                    <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Periode{compareMode ? " A" : ""}</label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Laatste 24 uur</SelectItem>
                <SelectItem value="7">Laatste week</SelectItem>
                <SelectItem value="30">Laatste maand</SelectItem>
                <SelectItem value="90">Laatste 3 maanden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {compareMode && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Periode B</label>
              <Select value={compareDays} onValueChange={setCompareDays}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Laatste 24 uur</SelectItem>
                  <SelectItem value="7">Laatste week</SelectItem>
                  <SelectItem value="30">Laatste maand</SelectItem>
                  <SelectItem value="90">Laatste 3 maanden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant={compareMode ? "secondary" : "outline"}
            size="icon"
            onClick={() => { setCompareMode(!compareMode); setCompareResult(null); }}
            title="Vergelijk periodes"
          >
            <GitCompareArrows className="h-4 w-4" />
          </Button>
          <Button onClick={fetchAnalysis} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Analyseer
          </Button>
          {result && result.stats.total > 0 && (
            <Button variant="outline" onClick={() => downloadCSV(result)} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
          )}
        </div>

        {loading && !result && (
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Data wordt geanalyseerd...</span>
          </div>
        )}

        {result && (
          <>
            {/* Compare banner */}
            {compareMode && compareResult && (
              <div className="rounded-lg bg-muted/50 border px-4 py-2 text-sm text-center">
                Vergelijking: <strong>Laatste {PERIOD_LABELS[days]}</strong> vs <strong>Laatste {PERIOD_LABELS[compareDays]}</strong>
              </div>
            )}

            {/* Stats overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Totaal antwoorden" value={result.stats.total} compareValue={cmp?.total} color="text-primary" />
              <StatCard label="Correct" value={result.stats.correct} compareValue={cmp?.correct} color="text-[hsl(var(--success))]" />
              <StatCard label="Fout" value={result.stats.wrong} compareValue={cmp?.wrong} color="text-destructive" />
              <StatCard label="Nauwkeurigheid %" value={result.stats.accuracy} compareValue={cmp?.accuracy} />
            </div>

            {/* Progress chart */}
            {result.dailyStats && result.dailyStats.length > 1 && (
              <Card>
                <CardContent className="p-5 md:p-6">
                  <h2 className="text-lg font-bold mb-4">Voortgang over tijd</h2>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart data={result.dailyStats} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="date" tickFormatter={(v: string) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} className="text-xs" />
                      <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => new Date(v as string).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })} />} />
                      <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Nauwkeurigheid %" />
                    </LineChart>
                  </ChartContainer>
                  <ChartContainer config={chartConfig} className="h-[100px] w-full mt-2">
                    <BarChart data={result.dailyStats} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="date" tickFormatter={(v: string) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} name="Aantal antwoorden" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Side-by-side game stats comparison */}
            {compareMode && compareResult && result.gameStats && Object.keys(result.gameStats).length > 0 && (
              <Card>
                <CardContent className="p-5 md:p-6">
                  <h2 className="text-lg font-bold mb-4">Per speltype — vergelijking</h2>
                  <div className="space-y-4">
                    {Object.entries(result.gameStats)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([type, stats]) => {
                        const accA = Math.round((stats.correct / stats.total) * 100);
                        const bStats = compareResult.gameStats?.[type];
                        const accB = bStats ? Math.round((bStats.correct / bStats.total) * 100) : null;
                        const diff = accB != null ? accA - accB : null;
                        return (
                          <div key={type} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{GAME_TYPE_LABELS[type] || type}</span>
                              <span className="text-muted-foreground flex items-center gap-2">
                                <span>{accA}%</span>
                                {diff != null && (
                                  <span className={`text-xs font-semibold ${diff > 0 ? "text-[hsl(var(--success))]" : diff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                    ({diff > 0 ? "+" : ""}{diff}%)
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="flex gap-1 items-center">
                              <Progress value={accA} className="h-2 flex-1" />
                              {accB != null && (
                                <Progress value={accB} className="h-2 flex-1 opacity-50" />
                              )}
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>A: {stats.total} antw.</span>
                              {bStats && <span>B: {bStats.total} antw.</span>}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game type breakdown (non-compare) */}
            {!compareMode && result.gameStats && Object.keys(result.gameStats).length > 0 && (
              <Card>
                <CardContent className="p-5 md:p-6">
                  <h2 className="text-lg font-bold mb-4">Per speltype</h2>
                  <div className="space-y-3">
                    {Object.entries(result.gameStats)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([type, stats]) => {
                        const acc = Math.round((stats.correct / stats.total) * 100);
                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{GAME_TYPE_LABELS[type] || type}</span>
                              <span className="text-muted-foreground">{stats.total} antwoorden · {acc}%</span>
                            </div>
                            <Progress value={acc} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">AI Analyse</h2>
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.analysis}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Difficult items */}
            {result.difficultItems && result.difficultItems.length > 0 && (
              <Card>
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    <h2 className="text-lg font-bold">Moeilijkste items</h2>
                  </div>
                  <div className="space-y-3">
                    {result.difficultItems.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{item.question}</p>
                          <span className={`text-sm font-bold ${item.accuracy < 40 ? "text-destructive" : item.accuracy < 70 ? "text-amber-500" : "text-[hsl(var(--success))]"}`}>
                            {item.accuracy}%
                          </span>
                        </div>
                        <Progress value={item.accuracy} className="h-1.5" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.total}x beantwoord</span>
                          <span>✅ {item.correct} · ❌ {item.wrong}</span>
                        </div>
                        {item.wrongAnswers.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Veelgemaakte fouten: <span className="italic">{item.wrongAnswers.join(", ")}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Juf;

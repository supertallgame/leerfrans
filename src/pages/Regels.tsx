import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Home, ScrollText, Pencil, Save, X, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

const Regels = () => {
  useThemeSync();
  const navigate = useNavigate();
  const [rules, setRules] = useState<string>("");
  const [draft, setDraft] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getUser();
      const email = sess.user?.email?.toLowerCase();
      setIsOwner(!!email && OWNER_EMAILS.includes(email));
      const { data } = await supabase.rpc("get_public_setting", { p_key: "site_rules" });
      const text = typeof data === "string" ? data : "";
      setRules(text);
      setDraft(text);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.rpc("upsert_site_rules", { p_rules: draft });
    setSaving(false);
    if (error) { toast.error("Opslaan mislukt: " + error.message); return; }
    setRules(draft);
    setEditing(false);
    toast.success("Regels opgeslagen");
  };

  // Parse rules into clean numbered items; strip any markdown list prefixes / headers
  const parsed = useMemo(() => {
    const lines = rules
      .split("\n")
      .map((l) =>
        l
          .trim()
          .replace(/^(#{1,6}\s+|[-*]\s+|\d+\.\s+|>\s*)/, "")
          .trim()
      )
      .filter(Boolean);
    // strip a leading "Regels" or "Regels:" title line
    const items = lines.filter((l) => !/^regels:?$/i.test(l));
    return { kind: "list" as const, items };
  }, [rules]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" /> Terug
          </Button>
          {isOwner && !editing && (
            <Button size="sm" onClick={() => { setDraft(rules); setEditing(true); }}>
              <Pencil className="h-4 w-4 mr-2" /> Bewerken
            </Button>
          )}
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 mb-6">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 relative">
            <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <ScrollText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Regels</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Samen maken we LeerFrans leuk en veilig
              </p>
            </div>
          </div>
        </div>

        {editing ? (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={18}
                className="font-mono text-sm"
                placeholder="Schrijf de regels (één per regel, of gebruik Markdown)…"
              />
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" /> {saving ? "Opslaan…" : "Opslaan"}
                </Button>
                <Button variant="outline" onClick={() => { setDraft(rules); setEditing(false); }}>
                  <X className="h-4 w-4 mr-2" /> Annuleren
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Tip: één regel per lijn voor een mooie genummerde weergave. Markdown ook ondersteund.</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : parsed.kind === "list" && parsed.items.length > 0 ? (
          <ol className="space-y-3">
            {parsed.items.map((item, i) => (
              <li
                key={i}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card/60 backdrop-blur p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-md"
              >
                <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {i + 1}
                </div>
                <p className="text-base leading-relaxed pt-1">{item}</p>
              </li>
            ))}
          </ol>
        ) : rules.trim() ? (
          <Card>
            <CardContent className="pt-6">
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{rules}</ReactMarkdown>
              </article>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Er zijn nog geen regels.</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Overtredingen kunnen leiden tot een waarschuwing, mute of ban.
        </div>
      </div>
    </main>
  );
};

export default Regels;

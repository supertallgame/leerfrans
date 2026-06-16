import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Home, ScrollText, Pencil, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

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

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" /> Regels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Laden…</p>
          ) : editing ? (
            <div className="space-y-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={18}
                className="font-mono text-sm"
                placeholder="Schrijf de regels in Markdown…"
              />
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" /> {saving ? "Opslaan…" : "Opslaan"}
                </Button>
                <Button variant="outline" onClick={() => { setDraft(rules); setEditing(false); }}>
                  <X className="h-4 w-4 mr-2" /> Annuleren
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Markdown ondersteund (kopjes, lijsten, vet, etc.).</p>
            </div>
          ) : rules.trim() ? (
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{rules}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-sm text-muted-foreground">Er zijn nog geen regels.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Regels;

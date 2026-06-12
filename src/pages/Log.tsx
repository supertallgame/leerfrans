import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ScrollText, Search, RefreshCw, Crown, ShieldCheck, Shield, TestTube, Beaker } from "lucide-react";

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

interface LogRow {
  id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ROLE_META: Record<string, { label: string; icon: any; cls: string }> = {
  owner:       { label: "Owner",       icon: Crown,       cls: "bg-red-500/15 text-red-500 border-red-500/30" },
  head_admin:  { label: "Head Admin",  icon: ShieldCheck, cls: "bg-purple-500/15 text-purple-500 border-purple-500/30" },
  admin:       { label: "Admin",       icon: Shield,      cls: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  head_tester: { label: "Head Tester", icon: TestTube,    cls: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  tester:      { label: "Tester",      icon: Beaker,      cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
};

function describeAction(action: string, target: string | null, details: Record<string, unknown> | null): string {
  const d = details ?? {};
  const onOff = (v: unknown) => (v ? "ingeschakeld" : "uitgeschakeld");
  const name = (target ?? "").replace(/^setting\./, "").replace(/_/g, " ");

  // Settings toggles
  if (action === "setting.toggle" || action.startsWith("setting.")) {
    const key = target?.replace(/^setting\./, "") ?? action.replace(/^setting\./, "");
    const pretty: Record<string, string> = {
      block_anonymous_reviews: "Anonieme reviews blokkeren",
      explorer_enabled: "Explorer-spel",
      ai_teacher_enabled: "AI-leraar",
      polar_express_enabled: "Polar Express easter egg",
      obama_enabled: "Obama easter egg",
      onboarding_enabled: "Onboarding",
      disabled_subjects: "Uitgeschakelde vakken",
      disabled_niveaus: "Uitgeschakelde niveaus",
    };
    const label = pretty[key] ?? key.replace(/_/g, " ");
    if ("enabled" in d) return `${label} ${onOff(d.enabled)}`;
    if ("value" in d) return `${label} ingesteld op ${JSON.stringify(d.value)}`;
    return `${label} aangepast`;
  }

  // Role changes
  if (action === "role.assign" || action === "role.promote") return `Rol toegekend: ${d.role ?? "?"} aan ${target ?? "?"}`;
  if (action === "role.revoke" || action === "role.demote") return `Rol ingetrokken: ${d.role ?? "?"} van ${target ?? "?"}`;

  // Bans / mutes
  if (action === "user.ban")   return `Gebruiker ${target} gebanned${d.reason ? ` (reden: ${d.reason})` : ""}`;
  if (action === "user.unban") return `Ban opgeheven voor ${target}`;
  if (action === "user.mute")  return `Gebruiker ${target} gedempt${d.until ? ` tot ${d.until}` : ""}`;
  if (action === "user.unmute")return `Demping opgeheven voor ${target}`;
  if (action === "ip.ban")     return `IP gebanned: ${target}`;
  if (action === "ip.unban")   return `IP-ban opgeheven: ${target}`;

  // Reviews / replies
  if (action === "review.delete") return `Review verwijderd (${target})`;
  if (action === "reply.delete")  return `Reactie verwijderd (${target})`;
  if (action === "votes.delete")  return `Stemmen verwijderd op review ${target}`;

  // Game rooms
  if (action === "room.close")    return `Multiplayer-kamer gesloten: ${target}`;

  // Subjects
  if (action === "subject.toggle") return `Vak ${target} ${onOff(d.enabled)}`;
  if (action === "niveau.toggle")  return `Niveau ${target} ${onOff(d.enabled)}`;

  // Admin applications
  if (action === "application.approve") return `Admin-aanvraag goedgekeurd voor ${target}`;
  if (action === "application.reject")  return `Admin-aanvraag afgewezen voor ${target}`;

  // Polls / announcements
  if (action === "poll.create")       return `Poll aangemaakt${d.question ? `: "${d.question}"` : ""}`;
  if (action === "poll.delete")       return `Poll verwijderd (${target})`;
  if (action === "announcement.create") return `Aankondiging geplaatst${d.title ? `: "${d.title}"` : ""}`;
  if (action === "announcement.delete") return `Aankondiging verwijderd (${target})`;

  // Generic fallbacks
  const verb = action.split(".").pop() ?? action;
  const subj = action.split(".")[0] ?? "";
  return `${subj || "Actie"} ${verb}${target ? ` → ${target}` : ""}`;
}

export default function Log() {
  const navigate = useNavigate();
  useThemeSync();
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | "all">("all");

  useEffect(() => { check(); }, []);

  const check = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !OWNER_EMAILS.includes(session.user.email ?? "")) {
      setIsOwner(false); setLoading(false); return;
    }
    setIsOwner(true);
    await load();
    setLoading(false);
  };

  const load = async () => {
    const { data, error } = await supabase
      .from("staff_action_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (!error && data) setLogs(data as LogRow[]);
  };

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (roleFilter !== "all" && l.actor_role !== roleFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        l.actor_email.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.target ?? "").toLowerCase().includes(q)
      );
    });
  }, [logs, query, roleFilter]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">Pagina niet gevonden</p>
          <Button onClick={() => navigate("/")} className="gap-2"><Home className="h-4 w-4" /> Naar homepagina</Button>
        </div>
      </div>
    );
  }

  const roles: (string | "all")[] = ["all", "owner", "head_admin", "admin", "head_tester", "tester"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <ScrollText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Staff Action Log</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" /> Vernieuwen</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/owner")} className="gap-2"><Crown className="h-4 w-4" /> Owner</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2"><Home className="h-4 w-4" /> Home</Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Zoek op e-mail, actie of target..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map(r => (
                <Button key={r} size="sm" variant={roleFilter === r ? "default" : "outline"} onClick={() => setRoleFilter(r)} className="capitalize">
                  {r === "all" ? "Alles" : ROLE_META[r as string]?.label ?? r}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{filtered.length} {filtered.length === 1 ? "actie" : "acties"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Geen acties gevonden.</p>
            )}
            {filtered.map((l) => {
              const meta = ROLE_META[l.actor_role] ?? { label: l.actor_role, icon: Shield, cls: "bg-muted text-muted-foreground border-border" };
              const Icon = meta.icon;
              return (
                <div key={l.id} className="rounded-lg border p-3 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className={`gap-1 ${meta.cls}`}>
                        <Icon className="h-3 w-3" /> {meta.label}
                      </Badge>
                      <span className="text-sm font-medium truncate">{l.actor_email}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("nl-NL")}</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{describeAction(l.action, l.target, l.details)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{l.action}</span>
                      {l.target && <span> → {l.target}</span>}
                    </p>
                  </div>
                  {l.details && Object.keys(l.details).length > 0 && (
                    <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">{JSON.stringify(l.details, null, 2)}</pre>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

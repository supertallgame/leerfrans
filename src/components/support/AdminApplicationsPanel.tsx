import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logStaffAction } from "@/lib/logStaffAction";
import { Check, ShieldQuestion, X } from "lucide-react";

interface App {
  id: string;
  user_id: string;
  user_email: string;
  motivation: string;
  status: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export default function AdminApplicationsPanel() {
  const [apps, setApps] = useState<App[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-applications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_applications" }, () => {
        void load();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("admin_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setApps(data as App[]);
  };

  const review = async (a: App, status: "approved" | "rejected") => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("admin_applications")
      .update({ status, reviewed_by: session?.user?.email, reviewed_at: new Date().toISOString() })
      .eq("id", a.id);
    if (error) { toast.error("Kon niet bijwerken"); return; }
    if (status === "approved") {
      // Try to insert admin role (only owners can promote head_admin/tester; anyone with insert rights can do admin)
      const { error: roleErr } = await supabase.from("user_roles").insert({
        user_id: a.user_id,
        email: a.user_email,
        role: "admin",
      });
      if (roleErr) toast.warning("Status bijgewerkt, maar rol kon niet worden toegekend");
      else toast.success(`${a.user_email} is admin`);
    } else {
      toast.success("Aanvraag afgewezen");
    }
    await load();
  };

  const visible = showAll ? apps : apps.filter((a) => a.status === "pending");
  const pendingCount = apps.filter((a) => a.status === "pending").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldQuestion className="h-5 w-5 text-primary" /> Admin-aanvragen
          <span className="text-sm font-normal text-muted-foreground">({pendingCount})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button variant={showAll ? "outline" : "default"} size="sm" onClick={() => setShowAll(false)}>Open</Button>
          <Button variant={showAll ? "default" : "outline"} size="sm" onClick={() => setShowAll(true)}>Alle</Button>
        </div>
        {visible.length === 0 && <p className="text-sm text-muted-foreground">Geen aanvragen.</p>}
        {visible.map((a) => (
          <div key={a.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium truncate">{a.user_email}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${a.status === "pending" ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : a.status === "approved" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {a.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{a.motivation}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString("nl-NL")}</p>
            {a.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => review(a, "approved")} className="gap-1">
                  <Check className="h-3.5 w-3.5" /> Goedkeuren
                </Button>
                <Button size="sm" variant="outline" onClick={() => review(a, "rejected")} className="gap-1">
                  <X className="h-3.5 w-3.5" /> Afwijzen
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

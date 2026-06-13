import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Warning {
  id: string;
  sender_email: string;
  reason: string;
  role_target: string;
  created_at: string;
}

/** Shows unread staff warnings to the current admin/tester user. */
export default function WarningsCheck() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data, error } = await supabase
      .from("staff_warnings")
      .select("id, sender_email, reason, role_target, created_at")
      .eq("recipient_id", session.user.id)
      .is("acknowledged_at", null)
      .order("created_at", { ascending: false });
    if (error) return;
    if (data && data.length > 0) {
      setWarnings(data as Warning[]);
      setOpen(true);
    }
  };

  const acknowledge = async () => {
    const ids = warnings.map((w) => w.id);
    const { error } = await supabase
      .from("staff_warnings")
      .update({ acknowledged_at: new Date().toISOString() })
      .in("id", ids);
    if (error) {
      toast.error("Kon niet bevestigen");
      return;
    }
    setOpen(false);
    setWarnings([]);
    toast.success("Waarschuwing(en) bevestigd");
  };

  if (warnings.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) return; setOpen(v); }}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            {warnings.length > 1 ? `${warnings.length} waarschuwingen` : "Waarschuwing"}
          </DialogTitle>
          <DialogDescription>
            Je hebt {warnings.length > 1 ? "officiële waarschuwingen" : "een officiële waarschuwing"} ontvangen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {warnings.map((w) => (
            <div key={w.id} className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                Van <span className="font-medium text-foreground">{w.sender_email}</span> · {new Date(w.created_at).toLocaleString("nl-NL")}
              </p>
              <p className="text-sm whitespace-pre-wrap">{w.reason}</p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={acknowledge} className="w-full">Ik heb het gelezen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

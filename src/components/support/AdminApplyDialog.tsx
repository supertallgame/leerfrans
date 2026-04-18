import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, ShieldCheck } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function AdminApplyDialog({ open, onOpenChange }: Props) {
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<{ status: string; created_at: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    void check();
  }, [open]);

  const check = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data } = await supabase
      .from("admin_applications")
      .select("status, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data && data.length > 0) setExisting(data[0]);
    else setExisting(null);
  };

  const submit = async () => {
    if (motivation.trim().length < 30) {
      toast.error("Schrijf een motivatie van minstens 30 tekens");
      return;
    }
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) { setLoading(false); return; }
    const { error } = await supabase.from("admin_applications").insert({
      user_id: session.user.id,
      user_email: session.user.email,
      motivation: motivation.trim().slice(0, 1000),
    });
    setLoading(false);
    if (error) { toast.error(error.message || "Kon aanvraag niet versturen"); return; }
    toast.success("Aanvraag verstuurd!");
    setMotivation("");
    void check();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Admin worden
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {existing && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              Je hebt al een aanvraag ingediend op {new Date(existing.created_at).toLocaleDateString("nl-NL")}.
              <br /><span className="font-medium">Status: {existing.status}</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Vertel waarom jij geschikt bent om admin te worden. Een owner zal je aanvraag beoordelen.
          </p>
          <Textarea
            placeholder="Bijvoorbeeld: ik help graag andere leerlingen, ik heb veel ervaring met..."
            value={motivation}
            maxLength={1000}
            rows={6}
            onChange={(e) => setMotivation(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">{motivation.length} / 1000</p>
          <Button onClick={submit} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Verstuur aanvraag
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

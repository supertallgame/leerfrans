import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logStaffAction } from "@/lib/logStaffAction";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recipient: { user_id: string; email: string } | null;
  roleTarget: "admin" | "tester" | "head_admin" | "head_tester" | "member";
}

export default function GiveWarningDialog({ open, onOpenChange, recipient, roleTarget }: Props) {
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!recipient) return;
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      toast.error("Geef een duidelijke reden (min. 5 tekens)");
      return;
    }
    setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setSending(false);
      toast.error("Niet ingelogd");
      return;
    }
    const { error } = await supabase.from("staff_warnings").insert({
      sender_id: session.user.id,
      sender_email: session.user.email ?? "",
      recipient_id: recipient.user_id,
      recipient_email: recipient.email,
      role_target: roleTarget,
      reason: trimmed,
    });
    setSending(false);
    if (error) {
      toast.error(`Kon waarschuwing niet versturen: ${error.message}`);
      return;
    }
    logStaffAction(`warning.${roleTarget}`, recipient.email, { reason: trimmed });
    toast.success(`Waarschuwing verstuurd naar ${recipient.email}`);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!sending) onOpenChange(v); if (!v) setReason(""); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" /> Waarschuwing geven
          </DialogTitle>
          <DialogDescription>
            {recipient ? <>Verstuur een officiële waarschuwing naar <span className="font-medium">{recipient.email}</span>.</> : null}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Reden (verplicht)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          maxLength={1000}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>Annuleren</Button>
          <Button onClick={send} disabled={sending} className="bg-amber-500 hover:bg-amber-600 text-white">
            {sending ? "Versturen..." : "Verstuur waarschuwing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

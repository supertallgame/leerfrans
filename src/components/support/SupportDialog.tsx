import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageIcon, Send, X, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface Report {
  id: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  user_email: string;
  user_id: string;
}

interface Message {
  id: string;
  report_id: string;
  message: string;
  image_url: string | null;
  sender_role: string;
  sender_email: string;
  sender_id: string;
  created_at: string;
}

const SESSION_NAME_KEY = "support_chat_username";

const ROLE_STYLES: Record<string, { label: string; cls: string }> = {
  owner: { label: "Owner", cls: "text-destructive" },
  head_admin: { label: "Head Admin", cls: "text-purple-500" },
  admin: { label: "Admin", cls: "text-primary" },
  tester: { label: "Tester", cls: "text-green-500" },
};

export default function SupportDialog({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  // Per-session username (re-prompted every open)
  const [displayName, setDisplayName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");

  // Map of staff sender_id -> role for badge display
  const [rolesMap, setRolesMap] = useState<Record<string, string>>({});

  // New report form
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("bug");
  const [firstMessage, setFirstMessage] = useState("");
  const [creating, setCreating] = useState(false);

  // Reply form
  const [reply, setReply] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setDisplayName("");
    setNameInput("");
    void load();
    const interval = setInterval(() => { void load(false); }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const load = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) { setLoading(false); return; }
    setUser({ id: session.user.id, email: session.user.email });

    const { data: reports } = await supabase
      .from("support_reports")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1);

    if (reports && reports.length > 0) {
      setReport(reports[0] as Report);
      const { data: msgs } = await supabase
        .from("support_report_messages")
        .select("*")
        .eq("report_id", reports[0].id)
        .order("created_at", { ascending: true });
      if (msgs) {
        const list = msgs as Message[];
        setMessages(list);
        // Look up roles for any staff senders we haven't seen yet
        const staffIds = Array.from(new Set(list.filter(m => m.sender_role !== "user").map(m => m.sender_id)));
        const unknown = staffIds.filter(id => !(id in rolesMap));
        if (unknown.length > 0) {
          const { data: rows } = await supabase
            .from("user_roles")
            .select("user_id, role")
            .in("user_id", unknown);
          const next = { ...rolesMap };
          unknown.forEach(id => { next[id] = ""; });
          (rows || []).forEach((r: any) => { if (!next[r.user_id]) next[r.user_id] = r.role; });
          setRolesMap(next);
        }
      }
    } else {
      setReport(null);
      setMessages([]);
    }
    if (showLoading) setLoading(false);
  };

  const confirmName = () => {
    const trimmed = nameInput.trim().slice(0, 30);
    if (trimmed.length < 2) {
      toast.error("Naam moet minimaal 2 tekens zijn");
      return;
    }
    setDisplayName(trimmed);
    sessionStorage.setItem(SESSION_NAME_KEY, trimmed);
  };

  const getStaffRole = (m: Message): string => {
    if (m.sender_email === "brankovantland@gmail.com" || m.sender_email === "branko18vantland@gmail.com") return "owner";
    return rolesMap[m.sender_id] || "";
  };

  const createReport = async () => {
    if (!subject.trim() || !firstMessage.trim() || !user) {
      toast.error("Vul een onderwerp en bericht in");
      return;
    }
    if (subject.length > 120 || firstMessage.length > 2000) {
      toast.error("Tekst is te lang");
      return;
    }
    setCreating(true);
    const { data: r, error } = await supabase
      .from("support_reports")
      .insert({
        subject: subject.trim().slice(0, 120),
        category,
        user_id: user.id,
        user_email: user.email,
      })
      .select()
      .single();
    if (error || !r) {
      toast.error(error?.message || "Kon rapport niet aanmaken");
      setCreating(false);
      return;
    }
    await supabase.from("support_report_messages").insert({
      report_id: r.id,
      sender_id: user.id,
      sender_email: user.email,
      sender_role: "user",
      message: firstMessage.trim().slice(0, 2000),
    });
    setSubject("");
    setFirstMessage("");
    setCategory("bug");
    toast.success("Rapport verstuurd! Een admin reageert zo snel mogelijk.");
    await load();
    setCreating(false);
  };

  const sendReply = async () => {
    if (!reply.trim() && !replyImage) return;
    if (!report || !user) return;
    setSending(true);
    let imageUrl: string | null = null;
    if (replyImage) {
      const ext = replyImage.name.split(".").pop()?.toLowerCase() || "jpg";
      if (!["jpg","jpeg","png","gif","webp"].includes(ext)) {
        toast.error("Alleen afbeeldingen toegestaan");
        setSending(false);
        return;
      }
      if (replyImage.size > 5 * 1024 * 1024) {
        toast.error("Afbeelding mag max 5MB zijn");
        setSending(false);
        return;
      }
      const path = `${user.id}/${report.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("support-uploads").upload(path, replyImage);
      if (upErr) {
        toast.error("Kon afbeelding niet uploaden");
        setSending(false);
        return;
      }
      const { data: signed } = await supabase.storage.from("support-uploads").createSignedUrl(path, 60 * 60 * 24 * 7);
      imageUrl = signed?.signedUrl || null;
    }
    const { error } = await supabase.from("support_report_messages").insert({
      report_id: report.id,
      sender_id: user.id,
      sender_email: user.email,
      sender_role: "user",
      message: reply.trim().slice(0, 2000),
      image_url: imageUrl,
    });
    if (error) {
      toast.error(error.message || "Kon bericht niet sturen");
    } else {
      setReply("");
      setReplyImage(null);
      await load(false);
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{report ? `Support: ${report.subject}` : "Support / Bug melden"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !displayName ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Kies een gebruikersnaam voor deze sessie. Je e-mailadres blijft verborgen voor het support team.
            </p>
            <Input
              placeholder="Bijv. AnoniemeFan"
              value={nameInput}
              maxLength={30}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmName(); }}
              autoFocus
            />
            <Button onClick={confirmName} className="w-full">Doorgaan</Button>
          </div>
        ) : !report ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Beschrijf je bug of vraag. Een admin zal in deze chat reageren. Je kunt 1 melding tegelijk open hebben.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium">Categorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Bug</SelectItem>
                  <SelectItem value="feature">💡 Feature verzoek</SelectItem>
                  <SelectItem value="question">❓ Vraag</SelectItem>
                  <SelectItem value="other">📝 Anders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Onderwerp (kort)"
              value={subject}
              maxLength={120}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Beschrijf je probleem of vraag..."
              value={firstMessage}
              maxLength={2000}
              rows={5}
              onChange={(e) => setFirstMessage(e.target.value)}
            />
            <Button onClick={createReport} disabled={creating} className="w-full gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Verstuur melding
            </Button>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[200px] max-h-[50vh]">
              {messages.length === 0 && <p className="text-sm text-muted-foreground text-center">Geen berichten.</p>}
              {messages.map((m) => {
                const isStaff = m.sender_role !== "user";
                const staffRole = isStaff ? getStaffRole(m) : "";
                const roleStyle = staffRole ? ROLE_STYLES[staffRole] : null;
                return (
                  <div key={m.id} className={`flex ${isStaff ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isStaff ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                      {isStaff && (
                        <p className="text-[10px] font-semibold mb-0.5 flex items-center gap-1.5">
                          <span className="opacity-70">🛡️ Support team</span>
                          {roleStyle && (
                            <span className={`font-bold uppercase tracking-wide ${roleStyle.cls}`}>
                              [{roleStyle.label}]
                            </span>
                          )}
                        </p>
                      )}
                      {!isStaff && (
                        <p className="text-[10px] font-semibold mb-0.5 opacity-90">{displayName}</p>
                      )}
                      {m.message && <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>}
                      {m.image_url && (
                        <img src={m.image_url} alt="bijlage" className="mt-1 rounded-md max-h-48 w-auto" />
                      )}
                      <p className="text-[9px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Verstuurd als <span className="font-semibold text-foreground">{displayName}</span></span>
                <button
                  className="underline hover:text-foreground"
                  onClick={() => { setDisplayName(""); setNameInput(""); }}
                >
                  Wijzig naam
                </button>
              </div>
              <Textarea
                placeholder="Typ je bericht..."
                value={reply}
                maxLength={2000}
                rows={2}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {replyImage ? replyImage.name.slice(0, 20) : "Afbeelding"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setReplyImage(e.target.files?.[0] ?? null)}
                  />
                </label>
                {replyImage && (
                  <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => setReplyImage(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <div className="flex-1" />
                <Button onClick={sendReply} disabled={sending} size="sm" className="gap-1">
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Stuur
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Status: {report.status} • Categorie: {report.category}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

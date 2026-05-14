import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, ChevronUp, ImageIcon, LifeBuoy, Loader2, Send, X } from "lucide-react";

interface Report {
  id: string;
  subject: string;
  category: string;
  status: string;
  user_email: string;
  user_id: string;
  created_at: string;
  updated_at: string;
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

export default function SupportAdminPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [showClosed, setShowClosed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void load();

    // Realtime: refresh report list on any insert/update
    const reportsChannel = supabase
      .channel("admin_support_reports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_reports" },
        (payload) => {
          const newRow = (payload.new ?? null) as Report | null;
          const oldRow = (payload.old ?? null) as Report | null;
          if (payload.eventType === "INSERT" && newRow) {
            setReports((prev) => (prev.some((r) => r.id === newRow.id) ? prev : [newRow, ...prev]));
          } else if (payload.eventType === "UPDATE" && newRow) {
            setReports((prev) => {
              const next = prev.map((r) => (r.id === newRow.id ? newRow : r));
              next.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
              return next;
            });
          } else if (payload.eventType === "DELETE" && oldRow) {
            setReports((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    // Visibility-aware fallback poll (covers missed events / reconnects)
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const startPoll = () => {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        if (document.visibilityState === "visible") void load();
      }, 30000);
    };
    const stopPoll = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } };
    startPoll();
    const onVis = () => { if (document.visibilityState === "visible") startPoll(); else stopPoll(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      supabase.removeChannel(reportsChannel);
      document.removeEventListener("visibilitychange", onVis);
      stopPoll();
    };
  }, []);

  // Per-open-report messages subscription
  useEffect(() => {
    if (!openId) return;
    const channel = supabase
      .channel(`admin_support_msgs_${openId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_report_messages", filter: `report_id=eq.${openId}` },
        (payload) => {
          const row = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [openId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const load = async () => {
    const { data } = await supabase
      .from("support_reports")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (data) setReports(data as Report[]);
  };

  const loadMessages = async (reportId: string) => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("support_report_messages")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
    setLoadingMsgs(false);
  };

  const open = async (id: string) => {
    if (openId === id) { setOpenId(null); setMessages([]); return; }
    setOpenId(id);
    await loadMessages(id);
  };

  const send = async () => {
    if (!openId || (!reply.trim() && !image)) return;
    setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) { setSending(false); return; }
    let imageUrl: string | null = null;
    if (image) {
      const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `staff/${session.user.id}/${openId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("support-uploads").upload(path, image);
      if (upErr) { toast.error("Upload mislukt"); setSending(false); return; }
      const { data: signed } = await supabase.storage.from("support-uploads").createSignedUrl(path, 60 * 60 * 24 * 7);
      imageUrl = signed?.signedUrl || null;
    }
    const { error } = await supabase.from("support_report_messages").insert({
      report_id: openId,
      sender_id: session.user.id,
      sender_email: session.user.email,
      sender_role: "staff",
      message: reply.trim().slice(0, 2000),
      image_url: imageUrl,
    });
    if (error) toast.error(error.message);
    else {
      setReply("");
      setImage(null);
      await loadMessages(openId);
    }
    setSending(false);
  };

  const closeReport = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("support_reports")
      .update({ status: "closed", closed_at: new Date().toISOString(), closed_by: session?.user?.email })
      .eq("id", id);
    if (error) toast.error("Kon niet sluiten");
    else { toast.success("Rapport gesloten"); await load(); if (openId === id) { setOpenId(null); setMessages([]); } }
  };

  const filtered = reports.filter((r) => showClosed ? true : r.status === "open");
  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LifeBuoy className="h-5 w-5 text-primary" /> Support tickets
          <span className="text-sm font-normal text-muted-foreground">({openCount} open)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Button variant={showClosed ? "outline" : "default"} size="sm" onClick={() => setShowClosed(false)}>Open</Button>
          <Button variant={showClosed ? "default" : "outline"} size="sm" onClick={() => setShowClosed(true)}>Alle</Button>
        </div>
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">Geen tickets.</p>}
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-lg border">
              <button
                onClick={() => open(r.id)}
                className="w-full text-left p-3 flex items-start gap-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.status === "open" ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-muted text-muted-foreground"}`}>
                      {r.status}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{r.category}</span>
                    <p className="text-sm font-medium truncate">{r.subject}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.user_email}</p>
                </div>
                {openId === r.id ? <ChevronUp className="h-4 w-4 mt-1 shrink-0" /> : <ChevronDown className="h-4 w-4 mt-1 shrink-0" />}
              </button>
              {openId === r.id && (
                <div className="border-t p-3 space-y-3 bg-muted/30">
                  {loadingMsgs ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                  ) : (
                    <div ref={scrollRef} className="space-y-2 max-h-72 overflow-y-auto">
                      {messages.map((m) => {
                        const isStaff = m.sender_role !== "user";
                        return (
                          <div key={m.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isStaff ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                              <p className="text-[10px] font-semibold mb-0.5 opacity-70">{isStaff ? "🛡️ " + m.sender_email : "👤 " + m.sender_email}</p>
                              {m.message && <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>}
                              {m.image_url && <img src={m.image_url} alt="" className="mt-1 rounded-md max-h-40 w-auto" />}
                              <p className="text-[9px] opacity-60 mt-1">{new Date(m.created_at).toLocaleString("nl-NL")}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {r.status === "open" && (
                    <>
                      <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reageer..." rows={2} maxLength={2000} />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          <ImageIcon className="h-3.5 w-3.5" />
                          {image ? image.name.slice(0, 18) : "Bestand"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
                        </label>
                        {image && (
                          <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => setImage(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                        <div className="flex-1" />
                        <Button onClick={send} disabled={sending} size="sm" className="gap-1">
                          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Stuur
                        </Button>
                        <Button onClick={() => closeReport(r.id)} variant="outline" size="sm" className="gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Sluit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Send, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { containsBannedWord } from "@/lib/censor";
import { useThemeSync } from "@/hooks/use-theme-sync";

export default function SlovakFeedback() {
  const navigate = useNavigate();
  useThemeSync();

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mutedUntil, setMutedUntil] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [blockAnonymous, setBlockAnonymous] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        const { data: anonSetting } = await supabase
          .rpc("get_public_setting", { p_key: "block_anonymous_reviews" });
        if (anonSetting === true) {
          setBlocked(true);
          setBlockAnonymous(true);
        }
      }
      if (session?.user?.email) {
        const { data: muteData } = await supabase.rpc("get_my_mute_status" as any);
        if (muteData && (muteData as any[]).length > 0) {
          setMutedUntil(new Date((muteData as any[])[0].muted_until).toLocaleString("sk-SK"));
        }
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) return toast.error("Vyplň svoje meno!");
    if (trimmedName.length > 50) return toast.error("Meno môže mať maximálne 50 znakov");
    if (rating < 1 || rating > 5) return toast.error("Vyber hodnotenie (1-5 hviezdičiek)");
    if (!trimmedMessage) return toast.error("Napíš správu!");
    if (trimmedMessage.length > 500) return toast.error("Správa môže mať maximálne 500 znakov");

    if (containsBannedWord(trimmedName)) return toast.error("Tvoje meno obsahuje nevhodný jazyk");
    if (containsBannedWord(trimmedMessage)) return toast.error("Tvoja správa obsahuje nevhodný jazyk");

    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      if (blockAnonymous) {
        setSubmitting(false);
        return toast.error("Písanie recenzií je dočasne vypnuté.");
      }
    }

    if (session?.user?.email) {
      const { data: muteData } = await supabase.rpc("get_my_mute_status" as any);
      if (muteData && (muteData as any[]).length > 0) {
        setSubmitting(false);
        const until = new Date((muteData as any[])[0].muted_until).toLocaleString("sk-SK");
        return toast.error(`Tvoj účet je stlmený do ${until}`);
      }
    }

    const insertData: any = {
      display_name: trimmedName,
      rating,
      message: trimmedMessage,
    };
    if (session?.user?.id) {
      insertData.user_id = session.user.id;
      insertData.user_email = session.user.email;
    }

    const { error } = await supabase.from("reviews" as any).insert(insertData as any);

    setSubmitting(false);
    if (error) {
      if (error.message?.includes("Too many reviews")) {
        toast.error("Príliš veľa recenzií. Počkaj 5 minút.");
      } else {
        toast.error("Nepodarilo sa odoslať recenziu");
      }
      return;
    }

    toast.success("Ďakujeme za tvoj názor! 🎉");
    navigate("/slovak/reviews");
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-md w-full space-y-4 md:space-y-6">
        <Button variant="ghost" onClick={() => navigate("/slovak")} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Späť
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Spätná väzba</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Zanechaj anonymne svoj názor na aplikáciu
          </p>
        </div>
        {mutedUntil && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <VolumeX className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Tvoj účet je stlmený</p>
                <p className="text-xs text-muted-foreground">Nemôžeš písať recenzie do {mutedUntil}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {blocked && !mutedUntil && (
          <Card className="border-muted-foreground/20 bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium">Písanie recenzií je dočasne vypnuté</p>
              <p className="text-xs text-muted-foreground mt-1">Skús to neskôr.</p>
            </CardContent>
          </Card>
        )}

        <Card className={mutedUntil || blocked ? "opacity-50 pointer-events-none" : ""}>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Meno</label>
              <Input
                placeholder="Ako sa chceš volať?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Hodnotenie</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} hviezdičiek`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Správa</label>
              <Textarea
                placeholder="Čo si myslíš o aplikácii?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {message.length}/500
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full gap-2"
              size="lg"
            >
              <Send className="h-4 w-4" /> Odoslať
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="link"
          onClick={() => navigate("/slovak/reviews")}
          className="w-full text-muted-foreground"
        >
          Pozri všetky recenzie →
        </Button>
      </div>
    </main>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { containsBannedWord } from "@/lib/censor";

export default function Feedback() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) return toast.error("Vul je naam in!");
    if (trimmedName.length > 50) return toast.error("Naam mag maximaal 50 tekens zijn");
    if (rating < 1 || rating > 5) return toast.error("Kies een beoordeling (1-5 sterren)");
    if (!trimmedMessage) return toast.error("Schrijf een bericht!");
    if (trimmedMessage.length > 500) return toast.error("Bericht mag maximaal 500 tekens zijn");

    const bannedInName = containsBannedWord(trimmedName);
    if (bannedInName) return toast.error("Je naam bevat ongepast taalgebruik");
    const bannedInMsg = containsBannedWord(trimmedMessage);
    if (bannedInMsg) return toast.error("Je bericht bevat ongepast taalgebruik");

    setSubmitting(true);

    // Get current user session if logged in
    const { data: { session } } = await supabase.auth.getSession();
    console.log("SESSION DEBUG:", session?.user?.id, session?.user?.email);

    const insertData: any = {
      display_name: trimmedName,
      rating,
      message: trimmedMessage,
    };
    if (session?.user?.id) {
      insertData.user_id = session.user.id;
      insertData.user_email = session.user.email;
    }
    console.log("INSERT DATA:", JSON.stringify(insertData));

    const { error, data: insertedData } = await supabase.from("reviews" as any).insert(insertData as any).select() as any;
    console.log("INSERT RESULT:", JSON.stringify(insertedData), error);

    setSubmitting(false);
    if (error) {
      toast.error("Kon review niet versturen");
      return;
    }

    toast.success("Bedankt voor je feedback! 🎉");
    navigate("/reviews");
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-md w-full space-y-4 md:space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Feedback</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Laat anoniem je mening achter over de app
          </p>
        </div>

        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Naam</label>
              <Input
                placeholder="Hoe wil je genoemd worden?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Beoordeling</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} sterren`}
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
              <label className="text-sm font-medium mb-1.5 block">Bericht</label>
              <Textarea
                placeholder="Wat vind je van de app?"
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
              <Send className="h-4 w-4" /> Versturen
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="link"
          onClick={() => navigate("/reviews")}
          className="w-full text-muted-foreground"
        >
          Bekijk alle reviews →
        </Button>
      </div>
    </main>
  );
}

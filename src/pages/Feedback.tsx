import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Send, VolumeX, ImagePlus, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { containsBannedWord } from "@/lib/censor";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { useIsMobile } from "@/hooks/use-mobile";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function Feedback() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mutedUntil, setMutedUntil] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [blockAnonymous, setBlockAnonymous] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useThemeSync();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        const { data: anonSetting } = await supabase
          .rpc("get_public_setting", { p_key: "block_anonymous_reviews" });
        if (anonSetting === true) {
          setBlocked(true);
        }
      }

      if (session?.user?.email) {
        const { data: muteData } = await supabase.rpc("get_my_mute_status" as any);
        if (muteData && (muteData as any[]).length > 0) {
          setMutedUntil(new Date((muteData as any[])[0].muted_until).toLocaleString("nl-NL"));
        }
      }
    };
    checkStatus();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Dit is geen afbeelding. Upload een JPG, PNG, GIF of WebP bestand.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Afbeelding is te groot. Maximaal 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      if (blockAnonymous) {
        setSubmitting(false);
        return toast.error("Reviews plaatsen is tijdelijk uitgeschakeld. Probeer het later opnieuw.");
      }
    }

    if (session?.user?.email) {
      const { data: muteData } = await supabase.rpc("get_my_mute_status" as any);
      if (muteData && (muteData as any[]).length > 0) {
        setSubmitting(false);
        const until = new Date((muteData as any[])[0].muted_until).toLocaleString("nl-NL");
        return toast.error(`Je account is gemute tot ${until}`);
      }
    }

    // Upload image if selected
    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(fileName, imageFile, { contentType: imageFile.type });

      if (uploadError) {
        setSubmitting(false);
        toast.error("Kon afbeelding niet uploaden");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("review-images")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const insertData: any = {
      display_name: trimmedName,
      rating,
      message: trimmedMessage,
      image_url: imageUrl,
    };
    if (session?.user?.id) {
      insertData.user_id = session.user.id;
      insertData.user_email = session.user.email;
    }

    const { error } = await supabase.from("reviews" as any).insert(insertData as any);

    setSubmitting(false);
    if (error) {
      if (error.message?.includes("Too many reviews")) {
        toast.error("Je plaatst te snel reviews. Wacht 5 minuten en probeer het opnieuw.");
      } else {
        toast.error("Kon review niet versturen");
      }
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
        {mutedUntil && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <VolumeX className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Je account is gemute</p>
                <p className="text-xs text-muted-foreground">Je kunt geen reviews plaatsen tot {mutedUntil}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {blocked && !mutedUntil && (
          <Card className="border-muted-foreground/20 bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium">Reviews plaatsen is tijdelijk uitgeschakeld</p>
              <p className="text-xs text-muted-foreground mt-1">Probeer het later opnieuw.</p>
            </CardContent>
          </Card>
        )}

        <Card className={mutedUntil || blocked ? "opacity-50 pointer-events-none" : ""}>
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

            <div>
              <label className="text-sm font-medium mb-1.5 block">Afbeelding (optioneel)</label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-lg max-h-40 object-cover border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : isMobile ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 flex-1 border-dashed"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" /> Maak foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 flex-1 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" /> Kies foto
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 w-full border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" /> Kies een afbeelding
                </Button>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, GIF of WebP · max 2MB
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full gap-2"
              size="lg"
            >
              <Send className="h-4 w-4" /> {submitting ? "Bezig met versturen..." : "Versturen"}
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

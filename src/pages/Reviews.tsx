import { useEffect, useState } from "react";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, MessageSquare, Trash2, Reply, ChevronDown, ChevronUp, Send } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { containsBannedWord } from "@/lib/censor";

interface ReviewReply {
  id: string;
  review_id: string;
  display_name: string;
  message: string;
  created_at: string;
}

interface Review {
  id: string;
  display_name: string;
  rating: number;
  message: string;
  created_at: string;
  image_url?: string | null;
}

const OPERATOR_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com", "tamoopdam@gmail.com", "jack.ouwerkerk@vsodaafgeluk.nl"];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "zojuist";
  if (mins < 60) return `${mins}m geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d geleden`;
  return new Date(dateStr).toLocaleDateString("nl-NL");
}

function ReplySection({
  reviewId,
  replies,
  isOperator,
  onReplyAdded,
  onDeleteReply,
}: {
  reviewId: string;
  replies: ReviewReply[];
  isOperator: boolean;
  onReplyAdded: (reply: ReviewReply) => void;
  onDeleteReply: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mutedUntil, setMutedUntil] = useState<string | null>(null);

  useEffect(() => {
    if (!showForm) return;
    const checkMute = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data } = await supabase.rpc("get_my_mute_status" as any);
        if (data && (data as any[]).length > 0) {
          setMutedUntil(new Date((data as any[])[0].muted_until).toLocaleString("nl-NL"));
        } else {
          setMutedUntil(null);
        }
      }
    };
    checkMute();
  }, [showForm]);

  const reviewReplies = replies.filter((r) => r.review_id === reviewId);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) {
      toast.error("Vul je naam en bericht in");
      return;
    }
    if (containsBannedWord(name.trim()) || containsBannedWord(message.trim())) {
      toast.error("Je bericht bevat ongepast taalgebruik");
      return;
    }
    setSubmitting(true);

    // Check if user is muted
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      const { data: muteData } = await supabase.rpc("get_my_mute_status" as any);
      if (muteData && (muteData as any[]).length > 0) {
        setSubmitting(false);
        const until = new Date((muteData as any[])[0].muted_until).toLocaleString("nl-NL");
        toast.error(`Je account is gemute tot ${until}`);
        return;
      }
    }

    const { data, error } = await (supabase.from("review_replies" as any) as any)
      .insert({ review_id: reviewId, display_name: name.trim(), message: message.trim() })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      if (error.message?.includes("Too many replies")) {
        toast.error("Je plaatst te snel reacties. Wacht even en probeer het opnieuw.");
      } else {
        toast.error("Kon reactie niet plaatsen");
      }
      return;
    }
    onReplyAdded(data);
    setName("");
    setMessage("");
    setShowForm(false);
    toast.success("Reactie geplaatst!");
  };

  return (
    <div className="pt-1 space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 text-muted-foreground px-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Reply className="h-3 w-3" /> Reageer
        </Button>
        {reviewReplies.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {reviewReplies.length} reactie{reviewReplies.length !== 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="ml-3 border-l-2 border-primary/20 pl-3 space-y-2">
          {mutedUntil ? (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-2 text-xs text-destructive flex items-center gap-1.5">
              <span>🔇</span>
              <span>Je account is gemute tot {mutedUntil}. Je kunt geen reacties plaatsen.</span>
            </div>
          ) : (
            <>
              <Input
                placeholder="Je naam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="h-8 text-sm"
              />
              <Textarea
                placeholder="Je reactie..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                className="text-sm min-h-[60px] resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs gap-1" onClick={handleSubmit} disabled={submitting}>
                  <Send className="h-3 w-3" /> {submitting ? "Bezig..." : "Verstuur"}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>
                  Annuleer
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {expanded && reviewReplies.length > 0 && (
        <div className="ml-3 border-l-2 border-muted pl-3 space-y-2">
          {reviewReplies.map((reply) => (
            <div key={reply.id} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs">{reply.display_name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{timeAgo(reply.created_at)}</span>
                  {isOperator && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive hover:text-destructive"
                      onClick={() => onDeleteReply(reply.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground/70">{reply.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [loading, setLoading] = useState(true);

  useThemeSync();
  const [isOperator, setIsOperator] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "rating">("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
    const [reviewsRes, repliesRes] = await Promise.all([
        supabase.from("reviews_public" as any).select("id, display_name, rating, message, created_at, image_url").order("created_at", { ascending: false }) as any,
        supabase.from("review_replies" as any).select("*").order("created_at", { ascending: true }) as any,
      ]);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (repliesRes.data) setReplies(repliesRes.data);
      setLoading(false);
    };
    fetchData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOperator(OPERATOR_EMAILS.includes(session?.user?.email ?? ""));
    });

    const refetchAll = async () => {
      const [reviewsRes, repliesRes] = await Promise.all([
        supabase.from("reviews_public" as any).select("id, display_name, rating, message, created_at").order("created_at", { ascending: false }) as any,
        supabase.from("review_replies" as any).select("*").order("created_at", { ascending: true }) as any,
      ]);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (repliesRes.data) setReplies(repliesRes.data);
    };

    const reviewChannel = supabase
      .channel('reviews-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        refetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'review_replies' }, () => {
        refetchAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(reviewChannel); };
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await (supabase.from("reviews" as any) as any).delete().eq("id", deleteId);
    if (error) {
      toast.error("Kon review niet verwijderen");
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== deleteId));
      setReplies((prev) => prev.filter((r) => r.review_id !== deleteId));
      toast.success("Review verwijderd");
    }
    setDeleteId(null);
  };

  const handleDeleteReply = async () => {
    if (!deleteReplyId) return;
    const { error } = await (supabase.from("review_replies" as any) as any).delete().eq("id", deleteReplyId);
    if (error) {
      toast.error("Kon reactie niet verwijderen");
    } else {
      setReplies((prev) => prev.filter((r) => r.id !== deleteReplyId));
      toast.success("Reactie verwijderd");
    }
    setDeleteReplyId(null);
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "–";

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-lg w-full space-y-4 md:space-y-6">
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <Button onClick={() => navigate("/feedback")} size="sm" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Schrijf review
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Reviews</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Wat anderen vinden van Woordjes Leren
          </p>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{avgRating}</span>
              <div>
                <Stars rating={Math.round(Number(avgRating) || 0)} />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === "newest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("newest")}
          >
            Nieuwste eerst
          </Button>
          <Button
            variant={sortBy === "rating" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("rating")}
          >
            Hoogste score
          </Button>
        </div>

        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-muted-foreground mr-1">Filter:</span>
          <Button
            variant={filterRating === null ? "default" : "outline"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setFilterRating(null)}
          >
            Alle
          </Button>
          {[5, 4, 3, 2, 1].map((n) => (
            <Button
              key={n}
              variant={filterRating === n ? "default" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs gap-0.5"
              onClick={() => setFilterRating(filterRating === n ? null : n)}
            >
              {n} <Star className="h-3 w-3 fill-current" />
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nog geen reviews. Wees de eerste! 🎉</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedReviews.map((review) => (
              <Card key={review.id} className="animate-fade-in">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{review.display_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(review.created_at)}
                      </span>
                      {isOperator && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(review.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Stars rating={review.rating} />
                  <p className="text-sm text-foreground/80">{review.message}</p>
                  <ReplySection
                    reviewId={review.id}
                    replies={replies}
                    isOperator={isOperator}
                    onReplyAdded={(reply) => setReplies((prev) => [...prev, reply])}
                    onDeleteReply={(id) => setDeleteReplyId(id)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze review wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteReplyId} onOpenChange={(open) => !open && setDeleteReplyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactie verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze reactie wilt verwijderen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReply} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

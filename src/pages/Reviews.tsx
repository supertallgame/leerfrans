import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, MessageSquare, Trash2 } from "lucide-react";
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

interface Review {
  id: string;
  display_name: string;
  rating: number;
  message: string;
  created_at: string;
}

const OPERATOR_EMAIL = "brankovantland@gmail.com";

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

export default function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOperator, setIsOperator] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "rating">("newest");

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews" as any)
        .select("*")
        .order("created_at", { ascending: false }) as any;
      if (data) setReviews(data);
      setLoading(false);
    };
    fetchReviews();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOperator(session?.user?.email === OPERATOR_EMAIL);
    });
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await (supabase.from("reviews" as any) as any).delete().eq("id", deleteId);
    if (error) {
      toast.error("Kon review niet verwijderen");
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success("Review verwijderd");
    }
    setDeleteId(null);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
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

        <div className="flex gap-2">
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
            {reviews.map((review) => (
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
    </main>
  );
}

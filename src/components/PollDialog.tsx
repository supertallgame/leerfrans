import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Check } from "lucide-react";
import { toast } from "sonner";

interface PollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
}

interface VoteCount {
  option: string;
  count: number;
}

export default function PollDialog({ open, onOpenChange, user }: PollDialogProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<VoteCount[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (open) loadPoll();
  }, [open]);

  const loadPoll = async () => {
    setLoading(true);
    // Get active poll
    const { data: polls } = await supabase
      .from("update_polls")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!polls || polls.length === 0) {
      setPoll(null);
      setLoading(false);
      return;
    }

    const p = polls[0];
    const parsedPoll: Poll = {
      id: p.id,
      question: p.question,
      options: (p.options as any) || [],
      is_active: p.is_active,
    };
    setPoll(parsedPoll);

    // Get votes + my vote in parallel
    const [votesRes, myVoteRes] = await Promise.all([
      supabase.from("poll_votes").select("selected_option").eq("poll_id", p.id),
      user ? supabase.from("poll_votes").select("selected_option").eq("poll_id", p.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    const counts: Record<string, number> = {};
    parsedPoll.options.forEach(o => counts[o] = 0);
    votesRes.data?.forEach(v => {
      counts[v.selected_option] = (counts[v.selected_option] || 0) + 1;
    });
    setVotes(Object.entries(counts).map(([option, count]) => ({ option, count })));
    setMyVote(myVoteRes.data?.selected_option ?? null);
    setLoading(false);
  };

  const handleVote = async (option: string) => {
    if (!user || !poll) return;
    setVoting(true);
    try {
      if (myVote) {
        // Update existing vote
        await supabase
          .from("poll_votes")
          .update({ selected_option: option })
          .eq("poll_id", poll.id)
          .eq("user_id", user.id);
      } else {
        // Insert new vote
        await supabase
          .from("poll_votes")
          .insert({ poll_id: poll.id, user_id: user.id, selected_option: option });
      }
      setMyVote(option);
      toast.success("Stem opgeslagen!");
      await loadPoll();
    } catch {
      toast.error("Kon niet stemmen");
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Poll
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : !poll ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Er is momenteel geen actieve poll.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium">{poll.question}</p>
            <div className="space-y-2">
              {poll.options.map((option) => {
                const voteData = votes.find(v => v.option === option);
                const count = voteData?.count ?? 0;
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isMyVote = myVote === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleVote(option)}
                    disabled={voting || !user}
                    className={`w-full text-left rounded-lg border p-3 transition-all relative overflow-hidden ${
                      isMyVote
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    } ${!user ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {/* Background bar */}
                    {myVote && (
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <div className="relative flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        {isMyVote && <Check className="h-3.5 w-3.5 text-primary" />}
                        {option}
                      </span>
                      {myVote && (
                        <span className="text-xs text-muted-foreground">
                          {pct}% ({count})
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {myVote && (
              <p className="text-xs text-muted-foreground text-center">
                {totalVotes} {totalVotes === 1 ? "stem" : "stemmen"} · Klik om je stem te wijzigen
              </p>
            )}
            {!user && (
              <p className="text-xs text-muted-foreground text-center">
                Log in om te stemmen
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Lock, ArrowRight } from "lucide-react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "5952") {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <form
          onSubmit={handleSubmit}
          className={`relative w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl transition-transform ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
            <p className="text-sm text-muted-foreground text-center">Voer het wachtwoord in om toegang te krijgen</p>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="pl-10"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive text-center">Onjuist wachtwoord</p>}
          <Button type="submit" className="w-full gap-2">
            Inloggen <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Welkom! Het dashboard is nog leeg.</p>
        </div>
      </div>
    </div>
  );
}

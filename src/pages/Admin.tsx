import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "5254") {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <h1 className="text-xl font-bold text-center text-foreground">Admin Login</h1>
          <Input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            autoFocus
          />
          {error && <p className="text-sm text-destructive text-center">Onjuist wachtwoord</p>}
          <Button type="submit" className="w-full">Inloggen</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welkom! Het dashboard is nog leeg.</p>
    </div>
  );
}

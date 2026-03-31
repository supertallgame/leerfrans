import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

const Juf = () => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthorized(!!session?.user?.email && ALLOWED_EMAILS.includes(session.user.email));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthorized(!!session?.user?.email && ALLOWED_EMAILS.includes(session.user.email));
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authorized === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-xl text-muted-foreground">Pagina niet gevonden</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold">Juf</h1>
      </div>
    </main>
  );
};

export default Juf;

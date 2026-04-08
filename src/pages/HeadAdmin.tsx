import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Home, ShieldPlus, ShieldMinus, Search, Users, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

interface AppUser {
  id: string;
  email: string;
  created_at: string;
}

export default function HeadAdmin() {
  const navigate = useNavigate();
  const [isHeadAdmin, setIsHeadAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminRoles, setAdminRoles] = useState<UserRole[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsHeadAdmin(false);
      setLoading(false);
      return;
    }

    // Owners should use /owner instead
    if (OWNER_EMAILS.includes(session.user.email ?? "")) {
      setIsHeadAdmin(false);
      setLoading(false);
      return;
    }

    // Check if user has head_admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "head_admin");

    if (!roles || roles.length === 0) {
      setIsHeadAdmin(false);
      setLoading(false);
      return;
    }

    setIsHeadAdmin(true);
    await Promise.all([loadAdminRoles(), loadUsers()]);
    setLoading(false);
  };

  const loadAdminRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("role", "admin")
      .order("created_at", { ascending: true });
    if (!error && data) setAdminRoles(data);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase.rpc("list_all_users");
    if (!error && data) setAllUsers(data as AppUser[]);
  };

  const promoteUser = async (user: AppUser) => {
    if (OWNER_EMAILS.includes(user.email) || adminRoles.some(r => r.email === user.email)) {
      toast.error("Deze gebruiker is al admin");
      return;
    }
    setPromoting(user.id);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: user.id,
        email: user.email,
        role: "admin",
      });
      if (error) throw error;
      toast.success(`${user.email} is nu admin`);
      await loadAdminRoles();
    } catch (e: any) {
      console.error(e);
      toast.error("Kon niet promoveren");
    } finally {
      setPromoting(null);
    }
  };

  const demoteAdmin = async (role: UserRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", role.id);
    if (error) {
      toast.error("Kon admin niet degraderen");
      return;
    }
    toast.success(`${role.email} is geen admin meer`);
    setAdminRoles(prev => prev.filter(r => r.id !== role.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isHeadAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground">Pagina niet gevonden</p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" /> Naar homepagina
          </Button>
        </div>
      </div>
    );
  }

  // Get all emails that are already admin, head_admin or owner
  const excludedEmails = new Set([...OWNER_EMAILS, ...adminRoles.map(r => r.email)]);
  const normalUsers = allUsers.filter(u => !excludedEmails.has(u.email));
  const filteredUsers = searchQuery
    ? normalUsers.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : normalUsers;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Head Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>

        {/* Current Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" /> Admins
              <span className="text-sm font-normal text-muted-foreground">({adminRoles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {adminRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen admins. Promoveer gebruikers hieronder.</p>
            ) : (
              adminRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{role.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => demoteAdmin(role)}
                  >
                    <ShieldMinus className="h-4 w-4" /> Degraderen
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Users to promote */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-muted-foreground" /> Gebruikers
              <span className="text-sm font-normal text-muted-foreground">({normalUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  {searchQuery ? "Geen gebruikers gevonden." : "Geen gewone gebruikers."}
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{user.email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 shrink-0 ml-2"
                      disabled={promoting === user.id}
                      onClick={() => promoteUser(user)}
                    >
                      <ShieldPlus className="h-4 w-4" />
                      {promoting === user.id ? "Bezig..." : "Promoveren"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

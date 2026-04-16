import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Ban, Search, Wifi, WifiOff, Globe, Trash2, Clock, AlertTriangle, Users, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserIp {
  id: string;
  user_id: string | null;
  user_email: string;
  ip_address: string;
  is_vpn: boolean;
  vpn_provider: string | null;
  country: string | null;
  city: string | null;
  last_seen_at: string;
  created_at: string;
}

interface IpBan {
  id: string;
  ip_address: string;
  reason: string | null;
  banned_by: string;
  created_at: string;
  is_mute: boolean;
  mute_until: string | null;
}

interface UserBan {
  id: string;
  user_email: string;
  reason: string | null;
  ban_type: string;
  mute_until: string | null;
  banned_by: string;
  created_at: string;
}

const MUTE_DURATIONS = [
  { label: "1 uur", value: "1h" },
  { label: "6 uur", value: "6h" },
  { label: "24 uur", value: "24h" },
  { label: "7 dagen", value: "7d" },
  { label: "30 dagen", value: "30d" },
  { label: "Permanent", value: "permanent" },
];

function getMuteUntil(duration: string): string {
  const until = new Date();
  switch (duration) {
    case "1h": until.setHours(until.getHours() + 1); break;
    case "6h": until.setHours(until.getHours() + 6); break;
    case "24h": until.setDate(until.getDate() + 1); break;
    case "7d": until.setDate(until.getDate() + 7); break;
    case "30d": until.setDate(until.getDate() + 30); break;
    case "permanent": until.setFullYear(until.getFullYear() + 100); break;
  }
  return until.toISOString();
}

export default function BanManagement() {
  const [userIps, setUserIps] = useState<UserIp[]>([]);
  const [ipBans, setIpBans] = useState<IpBan[]>([]);
  const [userBans, setUserBans] = useState<UserBan[]>([]);
  const [searchIp, setSearchIp] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadUserIps(), loadIpBans(), loadUserBans()]);
    setLoading(false);
  };

  const loadUserIps = async () => {
    const { data } = await supabase
      .from("user_ips")
      .select("*")
      .order("last_seen_at", { ascending: false });
    if (data) setUserIps(data as UserIp[]);
  };

  const loadIpBans = async () => {
    const { data } = await supabase
      .from("ip_bans")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setIpBans(data as IpBan[]);
  };

  const loadUserBans = async () => {
    const { data } = await supabase
      .from("user_bans")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUserBans(data as UserBan[]);
  };

  const banIp = async (ip: string, reason?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("ip_bans").upsert(
      { ip_address: ip, reason: reason || "IP Ban", banned_by: session!.user.email!, is_mute: false, mute_until: null } as any,
      { onConflict: "ip_address" }
    );
    if (error) { toast.error("Kon IP niet bannen"); return; }
    toast.success(`IP ${ip} geband`);
    await Promise.all([loadIpBans(), loadUserIps()]);
  };

  const muteIp = async (ip: string, duration: string, reason?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const muteUntil = getMuteUntil(duration);
    const { error } = await supabase.from("ip_bans").upsert(
      { ip_address: ip, reason: reason || `IP Mute (${duration})`, banned_by: session!.user.email!, is_mute: true, mute_until: muteUntil } as any,
      { onConflict: "ip_address" }
    );
    if (error) { toast.error("Kon IP niet muten"); return; }
    toast.success(`IP ${ip} gemutet`);
    await Promise.all([loadIpBans(), loadUserIps()]);
  };

  const unbanIp = async (id: string) => {
    await supabase.from("ip_bans").delete().eq("id", id);
    toast.success("IP ban/mute verwijderd");
    await Promise.all([loadIpBans(), loadUserIps()]);
  };

  const banUser = async (email: string, reason?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("user_bans").upsert(
      { user_email: email, ban_type: "ban", reason: reason || "Geband door owner", banned_by: session!.user.email! } as any,
      { onConflict: "user_email,ban_type" }
    );
    if (error) { toast.error("Kon gebruiker niet bannen"); return; }
    toast.success(`${email} geband`);
    await Promise.all([loadUserBans(), loadUserIps()]);
  };

  const muteUser = async (email: string, duration: string, reason?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const muteUntil = getMuteUntil(duration);
    const { error } = await supabase.from("user_bans").upsert(
      { user_email: email, ban_type: "mute", mute_until: muteUntil, reason: reason || `Gemutet (${duration})`, banned_by: session!.user.email! } as any,
      { onConflict: "user_email,ban_type" }
    );
    if (error) { toast.error("Kon gebruiker niet muten"); return; }
    toast.success(`${email} gemutet`);
    await Promise.all([loadUserBans(), loadUserIps()]);
  };

  const removeBan = async (id: string) => {
    await supabase.from("user_bans").delete().eq("id", id);
    toast.success("Ban/mute verwijderd");
    await Promise.all([loadUserBans(), loadUserIps()]);
  };

  // Group emails by IP
  const ipToEmails: Record<string, string[]> = {};
  userIps.forEach((u) => {
    if (!ipToEmails[u.ip_address]) ipToEmails[u.ip_address] = [];
    if (!ipToEmails[u.ip_address].includes(u.user_email)) {
      ipToEmails[u.ip_address].push(u.user_email);
    }
  });

  const vpnUsers = userIps.filter(u => u.is_vpn);
  const filteredIps = searchIp
    ? userIps.filter(u => u.user_email.toLowerCase().includes(searchIp.toLowerCase()) || u.ip_address.includes(searchIp))
    : userIps;

  const bannedIpSet = new Set(ipBans.map(b => b.ip_address));
  const bannedEmailSet = new Set(userBans.map(b => b.user_email));

  if (loading) {
    return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />;
  }

  return (
    <div className="space-y-6">
      {/* VPN Users Alert */}
      {vpnUsers.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="h-5 w-5" /> VPN Gebruikers ({vpnUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vpnUsers.map((u) => {
              const connectedEmails = ipToEmails[u.ip_address]?.filter(e => e !== u.user_email) || [];
              return (
                <div key={u.id} className="flex flex-col rounded-lg border border-destructive/30 p-3 gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <WifiOff className="h-4 w-4 text-destructive shrink-0" />
                        <span className="text-sm font-medium truncate">{u.user_email}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        IP: {u.ip_address} • {u.vpn_provider || "VPN"} • {u.country}{u.city ? `, ${u.city}` : ""}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!bannedIpSet.has(u.ip_address) && (
                        <Button variant="destructive" size="sm" className="gap-1" onClick={() => banIp(u.ip_address, `VPN: ${u.vpn_provider || "unknown"}`)}>
                          <Ban className="h-3.5 w-3.5" /> IP Ban
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => banUser(u.user_email, "VPN gebruik")}>
                        <Ban className="h-3.5 w-3.5" /> Ban
                      </Button>
                      <MuteDropdown onSelect={(d) => muteUser(u.user_email, d, "VPN gebruik")} label="Mute" />
                      <MuteDropdown onSelect={(d) => muteIp(u.ip_address, d, `VPN IP mute`)} label="IP Mute" />
                    </div>
                  </div>
                  {connectedEmails.length > 0 && (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                      <span className="font-medium flex items-center gap-1"><Users className="h-3 w-3" /> Zelfde IP:</span>
                      {connectedEmails.map(e => <span key={e} className="ml-2 block">{e}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Active Bans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ban className="h-5 w-5 text-destructive" /> Actieve Bans & Mutes
            <span className="text-sm font-normal text-muted-foreground">({userBans.length + ipBans.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userBans.length === 0 && ipBans.length === 0 && (
            <p className="text-sm text-muted-foreground">Geen actieve bans of mutes.</p>
          )}
          {userBans.map((ban) => (
            <div key={ban.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-sm font-medium truncate">{ban.user_email}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ban.ban_type === "ban" ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-600"}`}>
                    {ban.ban_type === "ban" ? "Geband" : "Gemutet"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {ban.reason || "Geen reden"} 
                  {ban.ban_type === "mute" && ban.mute_until && ` • Tot ${new Date(ban.mute_until).toLocaleString("nl")}`}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => removeBan(ban.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Opheffen
              </Button>
            </div>
          ))}
          {ipBans.map((ban) => (
            <div key={ban.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-sm font-medium">{ban.ip_address}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ban.is_mute ? "bg-yellow-500/10 text-yellow-600" : "bg-destructive/10 text-destructive"}`}>
                    {ban.is_mute ? "IP Mute" : "IP Ban"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {ban.reason || "Geen reden"}
                  {ban.is_mute && ban.mute_until && ` • Tot ${new Date(ban.mute_until).toLocaleString("nl")}`}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => unbanIp(ban.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Opheffen
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* All User IPs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wifi className="h-5 w-5 text-muted-foreground" /> Alle IP's
            <span className="text-sm font-normal text-muted-foreground">({userIps.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op e-mail of IP..."
              value={searchIp}
              onChange={(e) => setSearchIp(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredIps.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Geen IP records gevonden.</p>
            ) : (
              filteredIps.map((u) => {
                const connectedEmails = ipToEmails[u.ip_address]?.filter(e => e !== u.user_email) || [];
                const isBannedUser = bannedEmailSet.has(u.user_email);
                return (
                  <div key={u.id} className="flex flex-col rounded-lg border p-3 gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {u.is_vpn ? (
                            <WifiOff className="h-4 w-4 text-destructive shrink-0" />
                          ) : (
                            <Wifi className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate">{u.user_email}</span>
                          {u.is_vpn && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">VPN</span>
                          )}
                          {bannedIpSet.has(u.ip_address) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">IP Geband</span>
                          )}
                          {isBannedUser && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Geband</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {u.ip_address} • {u.country || "?"}{u.city ? `, ${u.city}` : ""} 
                          {u.vpn_provider ? ` • ${u.vpn_provider}` : ""}
                          {" • "}{new Date(u.last_seen_at).toLocaleString("nl")}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!bannedIpSet.has(u.ip_address) && (
                          <>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => banIp(u.ip_address)}>
                              <Ban className="h-3.5 w-3.5" /> IP
                            </Button>
                            <MuteDropdown onSelect={(d) => muteIp(u.ip_address, d)} label="IP Mute" size="sm" />
                          </>
                        )}
                        {!isBannedUser && (
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => banUser(u.user_email)}>
                            <Ban className="h-3.5 w-3.5" /> Ban
                          </Button>
                        )}
                        <MuteDropdown onSelect={(d) => muteUser(u.user_email, d)} label="Mute" size="sm" />
                      </div>
                    </div>
                    {connectedEmails.length > 0 && (
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                        <span className="font-medium flex items-center gap-1"><Users className="h-3 w-3" /> Zelfde IP:</span>
                        {connectedEmails.map(e => <span key={e} className="ml-2 block">{e}</span>)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MuteDropdown({ onSelect, label, size = "sm" }: { onSelect: (duration: string) => void; label: string; size?: "sm" | "default" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="gap-1">
          <Clock className="h-3.5 w-3.5" /> {label} <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {MUTE_DURATIONS.map((d) => (
          <DropdownMenuItem key={d.value} onClick={() => onSelect(d.value)}>
            {d.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

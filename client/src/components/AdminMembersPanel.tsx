import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Loader2, UserPlus, Send, Check, Copy, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface Member {
  id: number;
  email: string;
  status: string;
  createdAt: string;
  telegramInviteLink: string | null;
  telegramJoinedAt: string | null;
}

interface Health {
  resendKey: boolean;
  emailFrom: string | null;
  ownerEmail: string;
  ownerTelegram: boolean;
  stripeSecret: boolean;
  stripeWebhookSecret: boolean;
  stripePriceId: boolean;
  telegramBotToken: boolean;
  telegramChatId: boolean;
  telegramChannelReachable?: boolean;
  telegramMemberCount?: number | string;
}

export default function AdminMembersPanel() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [lastInvite, setLastInvite] = useState<{ email: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const { data: membersList, isLoading } = useQuery<Member[]>({
    queryKey: ["/api/admin/members"],
    queryFn: async () => {
      const res = await fetch("/api/admin/members", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load members");
      return res.json();
    },
  });

  const { data: health } = useQuery<Health>({
    queryKey: ["/api/admin/health"],
    queryFn: async () => {
      const res = await fetch("/api/admin/health", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load health");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (e: string) => apiRequest("POST", "/api/admin/members", { email: e }),
    onSuccess: () => {
      toast({ title: "Member added", description: `${email} is now active.` });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
    },
    onError: (err: any) => {
      toast({ title: "Could not add member", description: err?.message || "Error", variant: "destructive" });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (e: string) => apiRequest("POST", "/api/admin/members/activate", { email: e }),
    onSuccess: (_d, e) => {
      toast({ title: "Member activated", description: `${e} is now active.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
    },
    onError: (err: any) => {
      toast({ title: "Could not activate", description: err?.message || "Error", variant: "destructive" });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (e: string) => {
      const res = await apiRequest("POST", "/api/admin/members/resend-invite", { email: e });
      return (await res.json()) as { inviteLink: string };
    },
    onSuccess: (data, e) => {
      setLastInvite({ email: e, link: data.inviteLink });
      setCopied(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
    },
    onError: (err: any) => {
      toast({ title: "Could not create invite", description: err?.message || "Error", variant: "destructive" });
    },
  });

  const copyInvite = async () => {
    if (!lastInvite) return;
    try {
      await navigator.clipboard.writeText(lastInvite.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const HealthDot = ({ ok }: { ok: boolean }) => (
    <span
      className={`inline-block w-2 h-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`}
    />
  );

  return (
    <Card data-testid="card-members">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4" /> Members
        </CardTitle>
        <CardDescription>
          Active members can log in at <code>/member-login</code> and see the full plan. Add a
          comp/test member by email, resend a fresh Telegram invite, or re-activate someone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System health */}
        {health && (
          <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs space-y-1" data-testid="box-health">
            <div className="flex items-center gap-2 font-medium text-white/80 mb-1">
              <Activity className="w-3.5 h-3.5" /> Delivery health
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-white/70">
              <span className="flex items-center gap-2"><HealthDot ok={health.resendKey} /> Email sending (Resend)</span>
              <span className="flex items-center gap-2"><HealthDot ok={!!health.telegramChannelReachable} /> Telegram channel</span>
              <span className="flex items-center gap-2"><HealthDot ok={health.stripeWebhookSecret} /> Stripe webhook</span>
              <span className="flex items-center gap-2"><HealthDot ok={health.ownerEmail?.includes("@")} /> Signup alert email</span>
              <span className="flex items-center gap-2"><HealthDot ok={health.ownerTelegram} /> Signup alert Telegram</span>
              <span className="text-white/50">Channel members: {String(health.telegramMemberCount ?? "?")}</span>
            </div>
            {!health.ownerEmail?.includes("@") && (
              <div className="text-amber-300/90 pt-1">
                Set the <code>OWNER_EMAIL</code> secret so signup alerts reach you.
              </div>
            )}
          </div>
        )}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) addMutation.mutate(email.trim());
          }}
        >
          <Input
            type="email"
            placeholder="member@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-add-member-email"
          />
          <Button type="submit" disabled={addMutation.isPending} data-testid="button-add-member">
            {addMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <UserPlus className="w-4 h-4 mr-1" />
            )}
            Add active
          </Button>
        </form>

        {/* Freshly minted invite to hand a customer directly */}
        {lastInvite && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm" data-testid="box-fresh-invite">
            <div className="text-white/80 mb-1">Fresh invite for <b>{lastInvite.email}</b> (send this directly):</div>
            <div className="flex gap-2 items-center">
              <code className="flex-1 break-all text-emerald-200 text-xs">{lastInvite.link}</code>
              <Button size="sm" variant="outline" onClick={copyInvite} data-testid="button-copy-invite">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : !membersList || membersList.length === 0 ? (
          <div className="text-sm text-white/60">No members yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-members">
              <thead className="text-left text-xs uppercase tracking-wide text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Telegram</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {membersList.map((m) => (
                  <tr key={m.id} className="border-b border-white/5" data-testid={`row-member-${m.id}`}>
                    <td className="py-2 pr-3 text-white/80">{m.email}</td>
                    <td className="py-2 pr-3">
                      <Badge
                        className={
                          m.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-white/10 text-white/60"
                        }
                      >
                        {m.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-xs text-white/60">
                      {m.telegramJoinedAt
                        ? "joined"
                        : m.telegramInviteLink
                          ? "invited"
                          : "no invite"}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendMutation.mutate(m.email)}
                          disabled={resendMutation.isPending}
                          data-testid={`button-resend-${m.id}`}
                          title="Mint a fresh single-use Telegram invite"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Invite
                        </Button>
                        {m.status !== "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activateMutation.mutate(m.email)}
                            disabled={activateMutation.isPending}
                            data-testid={`button-activate-${m.id}`}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

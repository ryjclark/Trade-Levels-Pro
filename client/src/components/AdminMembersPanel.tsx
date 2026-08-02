import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Loader2, UserPlus } from "lucide-react";
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
}

export default function AdminMembersPanel() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const { data: membersList, isLoading } = useQuery<Member[]>({
    queryKey: ["/api/admin/members"],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch("/api/admin/members", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load members");
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

  return (
    <Card data-testid="card-members">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4" /> Members
        </CardTitle>
        <CardDescription>
          Active members can log in at <code>/member-login</code> and see the full plan. Add a
          comp/test member by email (no Stripe needed).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

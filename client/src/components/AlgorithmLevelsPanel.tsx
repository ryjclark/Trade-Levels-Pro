import { useQuery, useMutation } from "@tanstack/react-query";
import { Bot, Send, Loader2, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Plan } from "@shared/schema";

function statusBadge(status: string) {
  if (status === "published") return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Published</Badge>;
  if (status === "publish_failed") return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Failed</Badge>;
  if (status === "draft") return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Draft</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function fmtNum(n: number | null | undefined) {
  return n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtAge(iso: string | null | undefined) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "—";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AlgorithmLevelsPanel() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["/api/admin/algorithm-plans"],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch("/api/admin/algorithm-plans", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load algorithm plans");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/generate-levels", {});
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Levels generated",
        description: "Fresh ES/NQ levels created, sent to Telegram, and published to the site.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/algorithm-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
    },
    onError: (err: any) => {
      toast({
        title: "Generation failed",
        description: err?.message || "Could not generate levels.",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/plans/${id}/republish`, { variant: "pro" });
      return res;
    },
    onSuccess: () => {
      toast({ title: "Sent to Telegram", description: "Algorithm levels republished." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/algorithm-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
    },
    onError: (err: any) => {
      toast({
        title: "Resend failed",
        description: err?.message || "Telegram returned an error.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card data-testid="card-algorithm-levels">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="w-4 h-4" /> Algorithm Levels
            </CardTitle>
            <CardDescription>
              Self-generated ES/NQ levels. Auto-runs weekdays at 5:15pm ET; also shown on the public archive. Use “Generate now” to run on demand.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="button-generate-levels"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Zap className="w-3 h-3 mr-1" />
            )}
            Generate now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : !plans || plans.length === 0 ? (
          <div className="flex items-start gap-2 text-sm text-white/60 p-3 rounded border border-white/10 bg-white/5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              No algorithm levels yet. Once your algorithm POSTs to <code>/api/levels/ingest</code>, the most recent runs will appear here.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-algorithm-plans">
              <thead className="text-left text-xs uppercase tracking-wide text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Sym</th>
                  <th className="py-2 pr-3">DZ</th>
                  <th className="py-2 pr-3">Magnet</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Ver</th>
                  <th className="py-2 pr-3">Generated</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-white/5" data-testid={`row-algo-plan-${p.id}`}>
                    <td className="py-2 pr-3 text-white/80">{p.date}</td>
                    <td className="py-2 pr-3 font-medium text-white">{p.symbol}</td>
                    <td className="py-2 pr-3 text-white/70">
                      {fmtNum(p.dynamicZoneBottom)} – {fmtNum(p.dynamicZoneTop)}
                    </td>
                    <td className="py-2 pr-3 text-white/70">{fmtNum(p.magnet)}</td>
                    <td className="py-2 pr-3 text-white/70">{fmtNum((p as any).currentPrice)}</td>
                    <td className="py-2 pr-3 text-white/60">{(p as any).algorithmVersion || "—"}</td>
                    <td className="py-2 pr-3 text-white/60">{fmtAge((p as any).generatedAt)}</td>
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center gap-1">
                        {p.status === "published" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {statusBadge(p.status)}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={resendMutation.isPending && resendMutation.variables === p.id}
                        onClick={() => resendMutation.mutate(p.id)}
                        data-testid={`button-resend-algo-${p.id}`}
                      >
                        {resendMutation.isPending && resendMutation.variables === p.id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Send className="w-3 h-3 mr-1" />
                        )}
                        Resend
                      </Button>
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

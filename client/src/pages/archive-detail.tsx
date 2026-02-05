import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  formatTelegramFree, 
  formatTelegramPro, 
  formatSubstackFree, 
  formatSubstackPro, 
  formatTitle 
} from "@/lib/formatter";
import { queryClient } from "@/lib/queryClient";
import type { Plan, PublishLog } from "@shared/schema";
import { useState } from "react";
import { 
  TrendingUp, 
  LogOut, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Target,
  TrendingDown,
  Activity,
  Clock,
  MessageCircle,
  Send,
  Loader2
} from "lucide-react";

export default function ArchiveDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { logout, getToken } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState<"telegramFree" | "telegramPro" | "substackFree" | "substackPro" | null>(null);

  const { data: plan, isLoading: planLoading } = useQuery<Plan>({
    queryKey: ['/api/plans', params.id],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch(`/api/plans/${params.id}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error("Failed to load plan");
      return response.json();
    },
    enabled: !!params.id
  });

  const { data: logs, isLoading: logsLoading } = useQuery<PublishLog[]>({
    queryKey: ['/api/plans', params.id, 'logs'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch(`/api/plans/${params.id}/logs`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error("Failed to load logs");
      return response.json();
    },
    enabled: !!params.id
  });

  const republishMutation = useMutation({
    mutationFn: async (variant: "free" | "pro") => {
      const token = getToken();
      const response = await fetch(`/api/plans/${params.id}/republish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ variant })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to republish");
      }
      return response.json();
    },
    onSuccess: (_, variant) => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans', params.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/plans', params.id, 'logs'] });
      const tierLabel = variant === "free" ? "FREE" : "PRO";
      toast({
        title: `Published ${tierLabel} to Telegram`,
        description: `Your ${tierLabel} trade plan has been sent to Telegram.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to republish",
        variant: "destructive"
      });
    }
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleCopy = async (type: "telegramFree" | "telegramPro" | "substackFree" | "substackPro") => {
    if (!plan) return;
    
    const formatters = {
      telegramFree: formatTelegramFree,
      telegramPro: formatTelegramPro,
      substackFree: formatSubstackFree,
      substackPro: formatSubstackPro
    };
    
    const text = formatters[type](plan);
    
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    
    const labels = {
      telegramFree: "Telegram Free",
      telegramPro: "Telegram Pro",
      substackFree: "Substack Free",
      substackPro: "Substack Pro"
    };
    toast({
      title: "Copied",
      description: `${labels[type]} version copied to clipboard.`,
    });
  };

  const isLoading = planLoading || logsLoading;

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    return value.toString();
  };

  const formatLogTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Trade Levels Pro</h1>
              <p className="text-xs text-muted-foreground">Plan Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/archive")}
            data-testid="link-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Archive
          </Button>
          
          {plan && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => republishMutation.mutate("free")}
                disabled={republishMutation.isPending}
                data-testid="button-republish-free"
              >
                {republishMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send FREE
              </Button>
              <Button
                onClick={() => republishMutation.mutate("pro")}
                disabled={republishMutation.isPending}
                data-testid="button-republish-pro"
              >
                {republishMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send PRO
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !plan ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Plan not found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Activity className="w-5 h-5" />
                      {formatTitle(plan)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.bias && `Bias: ${plan.bias}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.telegramMessageVariant && (
                      <Badge 
                        variant="outline"
                        data-testid="badge-tier"
                      >
                        {plan.telegramMessageVariant.toUpperCase()}
                      </Badge>
                    )}
                    <Badge 
                      variant={plan.status === "published" ? "default" : "secondary"}
                      data-testid="badge-status"
                    >
                      {plan.status === "published" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {plan.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      Dynamic Zone
                    </div>
                    <p className="text-2xl font-semibold font-mono">
                      {formatNumber(plan.dynamicZoneBottom)} – {formatNumber(plan.dynamicZoneTop)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      Magnet
                    </div>
                    <p className="text-2xl font-semibold font-mono">{formatNumber(plan.magnet)}</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 text-chart-2" />
                      Resistance Levels
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["r1", "r2", "r3", "r4"].map((level) => (
                        <div key={level} className="text-center p-2 rounded-lg bg-muted">
                          <div className="text-xs text-muted-foreground uppercase">{level}</div>
                          <div className="font-mono font-medium">{formatNumber(plan[level as keyof Plan] as number)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TrendingDown className="w-4 h-4 text-destructive" />
                      Support Levels
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["s1", "s2", "s3", "s4"].map((level) => (
                        <div key={level} className="text-center p-2 rounded-lg bg-muted">
                          <div className="text-xs text-muted-foreground uppercase">{level}</div>
                          <div className="font-mono font-medium">{formatNumber(plan[level as keyof Plan] as number)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {(plan.setup1 || plan.setup2) && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Best Setups</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {plan.setup1 && (
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="text-xs text-muted-foreground mb-1">Setup 1</div>
                          <p className="text-sm whitespace-pre-wrap">{plan.setup1}</p>
                        </div>
                      )}
                      {plan.setup2 && (
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="text-xs text-muted-foreground mb-1">Setup 2</div>
                          <p className="text-sm whitespace-pre-wrap">{plan.setup2}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {plan.notes && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Notes</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Telegram Free</CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCopy("telegramFree")}
                      data-testid="button-copy-telegram-free"
                    >
                      {copied === "telegramFree" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-48 overflow-auto" data-testid="preview-telegram-free">
                    {formatTelegramFree(plan)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Telegram Pro</CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCopy("telegramPro")}
                      data-testid="button-copy-telegram-pro"
                    >
                      {copied === "telegramPro" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-48 overflow-auto" data-testid="preview-telegram-pro">
                    {formatTelegramPro(plan)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Substack Free</CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCopy("substackFree")}
                      data-testid="button-copy-substack-free"
                    >
                      {copied === "substackFree" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-48 overflow-auto" data-testid="preview-substack-free">
                    {formatSubstackFree(plan)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Substack Pro</CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCopy("substackPro")}
                      data-testid="button-copy-substack-pro"
                    >
                      {copied === "substackPro" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-48 overflow-auto" data-testid="preview-substack-pro">
                    {formatSubstackPro(plan)}
                  </pre>
                </CardContent>
              </Card>
            </div>

            {logs && logs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Publish Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {logs.map((log) => (
                      <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Badge variant={log.status === "success" ? "default" : "destructive"}>
                              {log.status}
                            </Badge>
                            {log.variant && (
                              <Badge variant="outline">
                                {log.variant.toUpperCase()}
                              </Badge>
                            )}
                            <span className="text-sm">{log.destination}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatLogTime(log.attemptTime)}
                          </div>
                        </div>
                        {log.errorMessage && (
                          <p className="text-sm text-destructive mt-2">{log.errorMessage}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

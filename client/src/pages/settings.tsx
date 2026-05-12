import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Copy, Check, KeyRound, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SiteSettingsData } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState<SiteSettingsData>({
    joinUrl: "",
    substackUrl: "",
    xUrl: "",
    priceText: "",
    footerText: "",
    footerEnabled: false,
    algorithmAutoSend: true,
  });
  const [revealKey, setRevealKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const { isLoading } = useQuery<SiteSettingsData>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch("/api/settings", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setFormData({ algorithmAutoSend: true, ...data });
      return data;
    },
  });

  const { data: keyInfo } = useQuery<{ configured: boolean; key: string; length: number }>({
    queryKey: ["/api/admin/ingest-key"],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch("/api/admin/ingest-key", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch ingest key");
      return response.json();
    },
  });

  const ingestUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/levels/ingest`
    : "/api/levels/ingest";

  const { data: claudeUsage } = useQuery<{
    days: number; totalCalls: number; successCalls: number; successRate: number | null;
    totalCostUsd: number; promptVersion: string; anthropicConfigured: boolean;
  }>({
    queryKey: ["/api/admin/claude-usage", 30],
    queryFn: async () => {
      const token = getToken();
      const r = await fetch("/api/admin/claude-usage?days=30", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) throw new Error("Failed to fetch claude usage");
      return r.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: SiteSettingsData) => {
      return apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved", description: "Your settings have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1117' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0c1117' }}>
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ background: 'rgba(12, 17, 23, 0.95)', backdropFilter: 'blur(8px)' }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin"><Button variant="ghost" size="icon" data-testid="button-back" className="text-white/70"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-lg font-semibold text-white">Settings</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Trade Levels Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin"><Button variant="outline" size="sm" data-testid="link-admin" className="text-white/70 border-white/20">Admin</Button></Link>
            <Link href="/admin/archive"><Button variant="outline" size="sm" data-testid="link-archive" className="text-white/70 border-white/20">Archive</Button></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Newsletter Parser (Claude)
            </CardTitle>
            <CardDescription>
              {claudeUsage?.anthropicConfigured
                ? `Active • prompt ${claudeUsage.promptVersion}`
                : "ANTHROPIC_API_KEY not configured — parser will return 503"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {claudeUsage ? (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Calls (last {claudeUsage.days}d)</div>
                  <div className="text-lg font-semibold" data-testid="text-claude-calls">{claudeUsage.totalCalls}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Success rate</div>
                  <div className="text-lg font-semibold" data-testid="text-claude-success">
                    {claudeUsage.successRate === null ? "—" : `${Math.round(claudeUsage.successRate * 100)}%`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total cost</div>
                  <div className="text-lg font-semibold" data-testid="text-claude-cost">${claudeUsage.totalCostUsd.toFixed(4)}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>Configure public site links and Telegram footer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="joinUrl">Join URL (required)</Label>
                <Input
                  id="joinUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.joinUrl}
                  onChange={(e) => setFormData({ ...formData, joinUrl: e.target.value })}
                  data-testid="input-join-url"
                />
                <p className="text-sm text-muted-foreground">
                  Subscription or Telegram channel link shown on public pages
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="substackUrl">Substack URL (optional)</Label>
                <Input
                  id="substackUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.substackUrl}
                  onChange={(e) => setFormData({ ...formData, substackUrl: e.target.value })}
                  data-testid="input-substack-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xUrl">X / Twitter URL (optional)</Label>
                <Input
                  id="xUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.xUrl}
                  onChange={(e) => setFormData({ ...formData, xUrl: e.target.value })}
                  data-testid="input-x-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceText">Price Text (optional)</Label>
                <Input
                  id="priceText"
                  type="text"
                  placeholder="$29/mo"
                  value={formData.priceText}
                  onChange={(e) => setFormData({ ...formData, priceText: e.target.value })}
                  data-testid="input-price-text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text (optional)</Label>
                <Input
                  id="footerText"
                  type="text"
                  placeholder="Join: {JOIN_URL}"
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  data-testid="input-footer-text"
                />
                <p className="text-sm text-muted-foreground">
                  Use {"{JOIN_URL}"} to insert your join link
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="footerEnabled"
                  checked={formData.footerEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, footerEnabled: checked === true })
                  }
                  data-testid="checkbox-footer-enabled"
                />
                <Label htmlFor="footerEnabled" className="font-normal">
                  Append footer to Telegram posts
                </Label>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <Label className="font-medium">Algorithm ingest</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="algorithmAutoSend"
                    checked={formData.algorithmAutoSend}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, algorithmAutoSend: checked === true })
                    }
                    data-testid="checkbox-algorithm-auto-send"
                  />
                  <Label htmlFor="algorithmAutoSend" className="font-normal">
                    Auto-send algorithm levels to Telegram on ingest
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  When off, ingested levels still appear on the dashboard but you have to press <em>Resend</em> to fire them.
                </p>
              </div>

              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full"
                data-testid="button-save-settings"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" /> Algorithm Ingest API
            </CardTitle>
            <CardDescription>
              Endpoint your external algorithm POSTs levels to. Auth via <code>Authorization: Bearer &lt;key&gt;</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <div className="flex gap-2">
                <Input value={ingestUrl} readOnly data-testid="input-ingest-url" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(ingestUrl)}
                  data-testid="button-copy-url"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>API Key (from Replit Secret <code>ALGORITHM_INGEST_API_KEY</code>)</Label>
              {keyInfo?.configured ? (
                <div className="flex gap-2">
                  <Input
                    value={revealKey ? keyInfo.key : "•".repeat(Math.max(20, Math.min(64, keyInfo.length || 32)))}
                    readOnly
                    type="text"
                    data-testid="input-ingest-key"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setRevealKey((v) => !v)}
                    data-testid="button-reveal-key"
                    title={revealKey ? "Hide" : "Reveal"}
                  >
                    {revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!revealKey}
                    onClick={() => {
                      navigator.clipboard.writeText(keyInfo.key);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 1500);
                    }}
                    data-testid="button-copy-key"
                    title="Copy key"
                  >
                    {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 rounded border border-orange-500/30 bg-orange-500/10 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-orange-400 shrink-0" />
                  <span className="text-orange-200">
                    <code>ALGORITHM_INGEST_API_KEY</code> is not set. Add it in the Replit Secrets tab and restart the workflow — the ingest endpoint will return <code>503</code> until then.
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                To rotate: open the Replit Secrets tab, replace the value of <code>ALGORITHM_INGEST_API_KEY</code>, and restart the workflow. The key isn't stored in the app database — only in Replit Secrets.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Example request</Label>
              <pre className="text-xs bg-black/30 border border-white/10 rounded p-3 overflow-x-auto" data-testid="text-example-curl">{`curl -X POST ${ingestUrl} \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "symbol": "ES",
    "target_date": "2026-05-13",
    "current_price": 7438.75,
    "dynamic_zone_high": 7454.75,
    "dynamic_zone_low": 7410.00,
    "magnet": 7438.75,
    "r1": 7445.75, "r2": 7454.75, "r3": null, "r4": null,
    "s1": 7434.75, "s2": 7427.46, "s3": 7410.00, "s4": 7345.60,
    "algorithm_version": "v1.1"
  }'`}</pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

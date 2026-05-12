import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Loader2, Send, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface AiPlan {
  target_date: string;
  symbol: string;
  dynamic_zone_high: number;
  dynamic_zone_low: number;
  magnet: number;
  r1: number; r2: number; r3: number; r4: number;
  s1: number; s2: number; s3: number; s4: number;
  bias: "bullish" | "neutral" | "bearish";
  bias_reasoning: string;
  top_long_trade: string;
  top_short_trade: string;
}

interface ParseResponse {
  ok: true;
  plan: AiPlan;
  prompt_version: string;
  claude_api_call_id: number;
  cost_usd: number;
  tokens: { input: number; cache_creation: number; cache_read: number; output: number };
}

interface CollisionInfo {
  existing_plan_id: number;
  existing_source: string;
  existing_updated_at: string;
}

const NUMERIC_FIELDS: (keyof AiPlan)[] = [
  "dynamic_zone_high", "dynamic_zone_low", "magnet",
  "r1", "r2", "r3", "r4", "s1", "s2", "s3", "s4",
];

export default function ParseNewsletterPage() {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [, setLocation] = useLocation();

  const [newsletterText, setNewsletterText] = useState("");
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [meta, setMeta] = useState<{ promptVersion: string; callId: number; cost: number; tokens: ParseResponse["tokens"] } | null>(null);
  const [originalPlan, setOriginalPlan] = useState<AiPlan | null>(null);
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const [sendTelegram, setSendTelegram] = useState(true);
  const [collision, setCollision] = useState<CollisionInfo | null>(null);

  const authHeader = (): Record<string, string> => {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const parseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/parse-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ newsletter_text: newsletterText }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
      return body as ParseResponse;
    },
    onSuccess: (data) => {
      setPlan(data.plan);
      setOriginalPlan(data.plan);
      setEditedFields(new Set());
      setMeta({ promptVersion: data.prompt_version, callId: data.claude_api_call_id, cost: data.cost_usd, tokens: data.tokens });
      toast({ title: "Parsed", description: `Cost $${data.cost_usd.toFixed(4)} • ${data.tokens.input + data.tokens.output} tokens` });
    },
    onError: (err: any) => {
      toast({ title: "Parse failed", description: err?.message || "Unknown error", variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (force: boolean) => {
      if (!plan || !meta) throw new Error("No parsed plan");
      const payload = {
        ...plan,
        edited_fields: Array.from(editedFields),
        claude_api_call_id: meta.callId,
        prompt_version: meta.promptVersion,
        send_telegram: sendTelegram,
        force_overwrite: force,
      };
      const res = await fetch("/api/admin/save-parsed-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) {
        const err: any = new Error("collision");
        err.collision = body;
        throw err;
      }
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
      return body;
    },
    onSuccess: (body: any) => {
      setCollision(null);
      toast({
        title: body.telegramSent ? "Saved + sent to Telegram" : "Saved as draft",
        description: body.telegramError ? `Telegram error: ${body.telegramError}` : `Plan #${body.plan.id} (${body.plan.source})`,
      });
      setLocation(`/admin/archive/${body.plan.id}`);
    },
    onError: (err: any) => {
      if (err?.collision) {
        setCollision(err.collision);
        return;
      }
      toast({ title: "Save failed", description: err?.message || "Unknown error", variant: "destructive" });
    },
  });

  const updatePlanField = <K extends keyof AiPlan>(key: K, value: AiPlan[K]) => {
    if (!plan) return;
    setPlan({ ...plan, [key]: value });
    if (originalPlan && originalPlan[key] !== value) {
      setEditedFields((prev) => new Set(prev).add(key as string));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="link-back-admin">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
            </Button>
          </Link>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Newsletter Parser
          </h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Paste newsletter</CardTitle>
            <CardDescription>
              Paste the full daily newsletter text. Claude will extract the structured trade plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={newsletterText}
              onChange={(e) => setNewsletterText(e.target.value)}
              placeholder="Paste newsletter text here…"
              rows={12}
              className="font-mono text-xs"
              data-testid="input-newsletter-text"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{newsletterText.length} chars</span>
              <Button
                onClick={() => parseMutation.mutate()}
                disabled={parseMutation.isPending || newsletterText.trim().length < 50}
                data-testid="button-parse-newsletter"
              >
                {parseMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Parse with Claude</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {plan && meta && (
          <Card>
            <CardHeader>
              <CardTitle>2. Review &amp; edit</CardTitle>
              <CardDescription>
                Prompt {meta.promptVersion} • call #{meta.callId} • ${meta.cost.toFixed(4)} •{" "}
                {meta.tokens.input}/{meta.tokens.output} in/out
                {editedFields.size > 0 && <> • <span className="text-primary">{editedFields.size} field(s) edited</span></>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="target_date">Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={plan.target_date}
                    onChange={(e) => updatePlanField("target_date", e.target.value)}
                    data-testid="input-target-date"
                  />
                </div>
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={plan.symbol}
                    onChange={(e) => updatePlanField("symbol", e.target.value.toUpperCase())}
                    data-testid="input-symbol"
                  />
                </div>
                <div>
                  <Label htmlFor="bias">Bias</Label>
                  <Select value={plan.bias} onValueChange={(v) => updatePlanField("bias", v as AiPlan["bias"])}>
                    <SelectTrigger id="bias" data-testid="select-bias"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullish">Bullish</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="bearish">Bearish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>DZ High</Label>
                  <Input type="number" step="0.01" value={plan.dynamic_zone_high}
                    onChange={(e) => updatePlanField("dynamic_zone_high", parseFloat(e.target.value))}
                    data-testid="input-dz-high" />
                </div>
                <div>
                  <Label>DZ Low</Label>
                  <Input type="number" step="0.01" value={plan.dynamic_zone_low}
                    onChange={(e) => updatePlanField("dynamic_zone_low", parseFloat(e.target.value))}
                    data-testid="input-dz-low" />
                </div>
                <div>
                  <Label>Magnet</Label>
                  <Input type="number" step="0.01" value={plan.magnet}
                    onChange={(e) => updatePlanField("magnet", parseFloat(e.target.value))}
                    data-testid="input-magnet" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-rose-500">Resistance</Label>
                  {(["r1", "r2", "r3", "r4"] as const).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs uppercase w-8">{k}</span>
                      <Input type="number" step="0.01" value={plan[k]}
                        onChange={(e) => updatePlanField(k, parseFloat(e.target.value))}
                        data-testid={`input-${k}`} />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-emerald-500">Support</Label>
                  {(["s1", "s2", "s3", "s4"] as const).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs uppercase w-8">{k}</span>
                      <Input type="number" step="0.01" value={plan[k]}
                        onChange={(e) => updatePlanField(k, parseFloat(e.target.value))}
                        data-testid={`input-${k}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bias_reasoning">Bias reasoning</Label>
                <Textarea id="bias_reasoning" rows={3} value={plan.bias_reasoning}
                  onChange={(e) => updatePlanField("bias_reasoning", e.target.value)}
                  data-testid="input-bias-reasoning" />
              </div>
              <div>
                <Label htmlFor="top_long">Top long trade</Label>
                <Textarea id="top_long" rows={2} value={plan.top_long_trade}
                  onChange={(e) => updatePlanField("top_long_trade", e.target.value)}
                  data-testid="input-top-long" />
              </div>
              <div>
                <Label htmlFor="top_short">Top short trade</Label>
                <Textarea id="top_short" rows={2} value={plan.top_short_trade}
                  onChange={(e) => updatePlanField("top_short_trade", e.target.value)}
                  data-testid="input-top-short" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={sendTelegram}
                    onCheckedChange={(v) => setSendTelegram(v === true)}
                    data-testid="checkbox-send-telegram"
                  />
                  <span className="text-sm">Send to Telegram on save</span>
                </label>
                <Button
                  onClick={() => saveMutation.mutate(false)}
                  disabled={saveMutation.isPending}
                  data-testid="button-save-parsed-plan"
                >
                  {saveMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                  ) : sendTelegram ? (
                    <><Send className="w-4 h-4 mr-2" /> Save &amp; Send</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Draft</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={collision !== null} onOpenChange={(open) => !open && setCollision(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Existing plan found
            </AlertDialogTitle>
            <AlertDialogDescription>
              {collision && plan && (
                <>
                  A <strong>{collision.existing_source}</strong> plan already exists for {plan.symbol} {plan.target_date}
                  {" "}(last updated {new Date(collision.existing_updated_at).toLocaleString()}).
                  Replace it with this AI-parsed version?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-collision-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => saveMutation.mutate(true)}
              data-testid="button-collision-replace"
            >
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

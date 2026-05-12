import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatTelegramFree, formatTelegramPro, formatSubstackFree, formatSubstackPro, formatMiddayUpdate, formatXPost } from "@/lib/formatter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Plan } from "@shared/schema";
import AlgorithmLevelsPanel from "@/components/AlgorithmLevelsPanel";
import { 
  LogOut, 
  Save, 
  Send, 
  Archive, 
  TestTube,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  ClipboardCopy,
  Clock,
  ClipboardPaste
} from "lucide-react";

function getNextTradingDayISO() {
  const now = new Date();
  const day = now.getDay();
  let add = 1;
  if (day === 5) add = 3;
  else if (day === 6) add = 2;
  const next = new Date(now);
  next.setDate(now.getDate() + add);
  const yyyy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  
  const [date, setDate] = useState(getNextTradingDayISO());
  const [symbol, setSymbol] = useState("ES");
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [pasteText, setPasteText] = useState<string>("");
  const [copied, setCopied] = useState<"telegramFree" | "telegramPro" | "substackFree" | "substackPro" | "middayUpdate" | "xPost" | null>(null);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    contract: "",
    tier: "pro",
    dynamicZoneTop: "",
    dynamicZoneBottom: "",
    magnet: "",
    r1: "", r2: "", r3: "", r4: "",
    s1: "", s2: "", s3: "", s4: "",
    bias: "",
    setup1: "",
    setup2: "",
    notes: "",
    status: "draft"
  });

  const { getToken } = useAuth();
  
  const { data: plan, isLoading, refetch } = useQuery<Plan>({
    queryKey: ['/api/plans/lookup', date, symbol],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch(`/api/plans/lookup?date=${date}&symbol=${symbol}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to load plan");
      return response.json();
    },
    enabled: !!date && !!symbol
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        id: plan.id,
        contract: plan.contract || "",
        tier: plan.tier || "pro",
        dynamicZoneTop: plan.dynamicZoneTop?.toString() || "",
        dynamicZoneBottom: plan.dynamicZoneBottom?.toString() || "",
        magnet: plan.magnet?.toString() || "",
        r1: plan.r1?.toString() || "",
        r2: plan.r2?.toString() || "",
        r3: plan.r3?.toString() || "",
        r4: plan.r4?.toString() || "",
        s1: plan.s1?.toString() || "",
        s2: plan.s2?.toString() || "",
        s3: plan.s3?.toString() || "",
        s4: plan.s4?.toString() || "",
        bias: plan.bias || "",
        setup1: plan.setup1 || "",
        setup2: plan.setup2 || "",
        notes: plan.notes || "",
        status: plan.status
      });
    } else if (!isLoading) {
      setFormData({
        id: null,
        contract: "",
        tier: "pro",
        dynamicZoneTop: "",
        dynamicZoneBottom: "",
        magnet: "",
        r1: "", r2: "", r3: "", r4: "",
        s1: "", s2: "", s3: "", s4: "",
        bias: "",
        setup1: "",
        setup2: "",
        notes: "",
        status: "draft"
      });
    }
  }, [plan, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async (action: "save" | "publish_free" | "publish_pro") => {
      const payload = {
        ...formData,
        date,
        symbol,
        action,
        dynamicZoneTop: formData.dynamicZoneTop ? parseFloat(formData.dynamicZoneTop) : null,
        dynamicZoneBottom: formData.dynamicZoneBottom ? parseFloat(formData.dynamicZoneBottom) : null,
        magnet: formData.magnet ? parseFloat(formData.magnet) : null,
        r1: formData.r1 ? parseFloat(formData.r1) : null,
        r2: formData.r2 ? parseFloat(formData.r2) : null,
        r3: formData.r3 ? parseFloat(formData.r3) : null,
        r4: formData.r4 ? parseFloat(formData.r4) : null,
        s1: formData.s1 ? parseFloat(formData.s1) : null,
        s2: formData.s2 ? parseFloat(formData.s2) : null,
        s3: formData.s3 ? parseFloat(formData.s3) : null,
        s4: formData.s4 ? parseFloat(formData.s4) : null,
      };
      
      const response = await apiRequest("POST", "/api/plans/save", payload);
      return response.json();
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans/lookup'] });
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      const isPublish = action.startsWith("publish");
      const variant = action === "publish_free" ? "FREE" : "PRO";
      toast({
        title: isPublish ? `Published ${variant} to Telegram` : "Draft Saved",
        description: isPublish 
          ? `Your ${variant} trade plan has been sent to Telegram.` 
          : "Your draft has been saved successfully.",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save plan",
        variant: "destructive"
      });
    }
  });

  const { data: latestPublished } = useQuery<Plan | null>({
    queryKey: ['/api/plans/latest-published'],
  });

  const copyPreviousMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      const res = await fetch(
        `/api/plans/copy-previous?date=${date}&symbol=${symbol}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.status === 404) throw new Error("No previous plan found");
      if (!res.ok) throw new Error("Failed to load previous plan");
      return (await res.json()) as Plan;
    },
    onSuccess: (prev) => {
      setFormData({
        id: null,
        contract: prev.contract || "",
        tier: prev.tier || "pro",
        dynamicZoneTop: prev.dynamicZoneTop?.toString() || "",
        dynamicZoneBottom: prev.dynamicZoneBottom?.toString() || "",
        magnet: prev.magnet?.toString() || "",
        r1: prev.r1?.toString() || "",
        r2: prev.r2?.toString() || "",
        r3: prev.r3?.toString() || "",
        r4: prev.r4?.toString() || "",
        s1: prev.s1?.toString() || "",
        s2: prev.s2?.toString() || "",
        s3: prev.s3?.toString() || "",
        s4: prev.s4?.toString() || "",
        bias: prev.bias || "",
        setup1: prev.setup1 || "",
        setup2: prev.setup2 || "",
        notes: prev.notes || "",
        status: "draft",
      });
      toast({ title: "Prefilled from previous day", description: `Loaded ${prev.date}` });
    },
    onError: (err: Error) => {
      toast({ title: "No previous plan", description: err.message, variant: "destructive" });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!formData.id) throw new Error("Save the draft first, then schedule.");
      if (!scheduledFor) throw new Error("Pick a date & time first.");
      const res = await apiRequest("POST", "/api/plans/schedule", {
        id: formData.id,
        scheduledFor: new Date(scheduledFor).toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans/lookup'] });
      toast({ title: "Scheduled", description: `Will publish at ${new Date(scheduledFor).toLocaleString()}` });
      refetch();
    },
    onError: (err: Error) => {
      toast({ title: "Schedule failed", description: err.message, variant: "destructive" });
    },
  });

  const pasteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/plans/parse-paste", { text: pasteText });
      return res.json();
    },
    onSuccess: (parsed: any) => {
      setFormData((prev) => ({
        ...prev,
        contract: parsed.contract ?? prev.contract,
        bias: parsed.bias ?? prev.bias,
        dynamicZoneTop: parsed.dynamicZoneTop != null ? String(parsed.dynamicZoneTop) : prev.dynamicZoneTop,
        dynamicZoneBottom: parsed.dynamicZoneBottom != null ? String(parsed.dynamicZoneBottom) : prev.dynamicZoneBottom,
        magnet: parsed.magnet != null ? String(parsed.magnet) : prev.magnet,
        r1: parsed.r1 != null ? String(parsed.r1) : prev.r1,
        r2: parsed.r2 != null ? String(parsed.r2) : prev.r2,
        r3: parsed.r3 != null ? String(parsed.r3) : prev.r3,
        r4: parsed.r4 != null ? String(parsed.r4) : prev.r4,
        s1: parsed.s1 != null ? String(parsed.s1) : prev.s1,
        s2: parsed.s2 != null ? String(parsed.s2) : prev.s2,
        s3: parsed.s3 != null ? String(parsed.s3) : prev.s3,
        s4: parsed.s4 != null ? String(parsed.s4) : prev.s4,
        setup1: parsed.setup1 ?? prev.setup1,
        setup2: parsed.setup2 ?? prev.setup2,
        notes: parsed.notes ?? prev.notes,
      }));
      if (parsed.date) setDate(parsed.date);
      if (parsed.symbol) setSymbol(parsed.symbol);
      toast({ title: "Imported", description: "Form fields filled from paste." });
    },
    onError: (err: Error) => {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    },
  });

  const testTelegramMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/telegram/test", {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send test message");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Successful",
        description: "Test message sent to Telegram successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleCopy = async (type: "telegramFree" | "telegramPro" | "substackFree" | "substackPro" | "middayUpdate" | "xPost") => {
    const planPreview = {
      ...formData,
      date,
      symbol,
      dynamicZoneTop: formData.dynamicZoneTop ? parseFloat(formData.dynamicZoneTop) : null,
      dynamicZoneBottom: formData.dynamicZoneBottom ? parseFloat(formData.dynamicZoneBottom) : null,
      magnet: formData.magnet ? parseFloat(formData.magnet) : null,
      r1: formData.r1 ? parseFloat(formData.r1) : null,
      r2: formData.r2 ? parseFloat(formData.r2) : null,
      r3: formData.r3 ? parseFloat(formData.r3) : null,
      r4: formData.r4 ? parseFloat(formData.r4) : null,
      s1: formData.s1 ? parseFloat(formData.s1) : null,
      s2: formData.s2 ? parseFloat(formData.s2) : null,
      s3: formData.s3 ? parseFloat(formData.s3) : null,
      s4: formData.s4 ? parseFloat(formData.s4) : null,
    } as Plan;
    
    let text: string;
    if (type === "xPost") {
      text = formatXPost(planPreview);
    } else {
      const formatters = {
        telegramFree: formatTelegramFree,
        telegramPro: formatTelegramPro,
        substackFree: formatSubstackFree,
        substackPro: formatSubstackPro,
        middayUpdate: formatMiddayUpdate
      };
      text = formatters[type](planPreview);
    }
    
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    
    const labels = {
      telegramFree: "Telegram Free",
      telegramPro: "Telegram Pro", 
      substackFree: "Substack Free",
      substackPro: "Substack Pro",
      middayUpdate: "Midday Update",
      xPost: "X Post"
    };
    toast({
      title: "Copied",
      description: `${labels[type]} version copied to clipboard.`,
    });
  };

  const planPreview = {
    ...formData,
    date,
    symbol,
    dynamicZoneTop: formData.dynamicZoneTop ? parseFloat(formData.dynamicZoneTop) : null,
    dynamicZoneBottom: formData.dynamicZoneBottom ? parseFloat(formData.dynamicZoneBottom) : null,
    magnet: formData.magnet ? parseFloat(formData.magnet) : null,
    r1: formData.r1 ? parseFloat(formData.r1) : null,
    r2: formData.r2 ? parseFloat(formData.r2) : null,
    r3: formData.r3 ? parseFloat(formData.r3) : null,
    r4: formData.r4 ? parseFloat(formData.r4) : null,
    s1: formData.s1 ? parseFloat(formData.s1) : null,
    s2: formData.s2 ? parseFloat(formData.s2) : null,
    s3: formData.s3 ? parseFloat(formData.s3) : null,
    s4: formData.s4 ? parseFloat(formData.s4) : null,
  } as Plan;

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const xPostText = formatXPost(planPreview);
  const xPostLength = xPostText.length;

  return (
    <div className="min-h-screen" style={{ background: '#0c1117' }}>
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ background: 'rgba(12, 17, 23, 0.95)', backdropFilter: 'blur(8px)' }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo-square.webp" alt="Trade Levels Pro" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <h1 className="text-lg font-semibold text-white">Trade Levels Pro</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-white/70"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <AlgorithmLevelsPanel />
        </div>
        {latestPublished && (
          <div
            className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 flex items-center justify-between gap-3 flex-wrap"
            data-testid="text-last-published"
          >
            <span>
              Last published: <span className="text-white font-medium">{latestPublished.symbol}</span> for{" "}
              <span className="text-white font-medium">{latestPublished.date}</span>
              {latestPublished.publishedAt
                ? ` at ${new Date(latestPublished.publishedAt).toLocaleString()}`
                : ""}
            </span>
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Load Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      data-testid="input-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Select value={symbol} onValueChange={setSymbol}>
                      <SelectTrigger id="symbol" data-testid="select-symbol">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ES">ES</SelectItem>
                        <SelectItem value="NQ">NQ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Utilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => testTelegramMutation.mutate()}
                    disabled={testTelegramMutation.isPending}
                    data-testid="button-test-telegram"
                  >
                    {testTelegramMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Telegram
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setLocation("/admin/archive")}
                    data-testid="link-archive"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    View Archive
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => copyPreviousMutation.mutate()}
                    disabled={copyPreviousMutation.isPending}
                    data-testid="button-copy-previous"
                  >
                    {copyPreviousMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ClipboardCopy className="w-4 h-4 mr-2" />
                    )}
                    Prefill from previous day
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setLocation("/admin/settings")}
                    data-testid="link-settings"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Daily Plan
                  </CardTitle>
                  <Badge 
                    variant={formData.status === "published" ? "default" : "secondary"}
                    data-testid="badge-status"
                  >
                    {formData.status === "published" ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertCircle className="w-3 h-3 mr-1" />
                    )}
                    {formData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contract">Contract (optional)</Label>
                        <Input
                          id="contract"
                          value={formData.contract}
                          onChange={(e) => updateField("contract", e.target.value)}
                          placeholder="e.g., ESH25"
                          data-testid="input-contract"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bias">Bias</Label>
                        <Input
                          id="bias"
                          value={formData.bias}
                          onChange={(e) => updateField("bias", e.target.value)}
                          placeholder="e.g., Bullish, Bearish, Neutral"
                          data-testid="input-bias"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">Dynamic Zone & Magnet</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="dzTop">DZ Top</Label>
                          <Input
                            id="dzTop"
                            type="number"
                            step="0.01"
                            value={formData.dynamicZoneTop}
                            onChange={(e) => updateField("dynamicZoneTop", e.target.value)}
                            data-testid="input-dz-top"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dzBottom">DZ Bottom</Label>
                          <Input
                            id="dzBottom"
                            type="number"
                            step="0.01"
                            value={formData.dynamicZoneBottom}
                            onChange={(e) => updateField("dynamicZoneBottom", e.target.value)}
                            data-testid="input-dz-bottom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="magnet">Magnet</Label>
                          <Input
                            id="magnet"
                            type="number"
                            step="0.01"
                            value={formData.magnet}
                            onChange={(e) => updateField("magnet", e.target.value)}
                            data-testid="input-magnet"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-chart-2" />
                        <span className="font-medium text-sm">Resistance Levels</span>
                      </div>
                      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                        {["r1", "r2", "r3", "r4"].map((level) => (
                          <div key={level} className="space-y-2">
                            <Label htmlFor={level}>{level.toUpperCase()}</Label>
                            <Input
                              id={level}
                              type="number"
                              step="0.01"
                              value={formData[level as keyof typeof formData] as string}
                              onChange={(e) => updateField(level, e.target.value)}
                              data-testid={`input-${level}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-destructive" />
                        <span className="font-medium text-sm">Support Levels</span>
                      </div>
                      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                        {["s1", "s2", "s3", "s4"].map((level) => (
                          <div key={level} className="space-y-2">
                            <Label htmlFor={level}>{level.toUpperCase()}</Label>
                            <Input
                              id={level}
                              type="number"
                              step="0.01"
                              value={formData[level as keyof typeof formData] as string}
                              onChange={(e) => updateField(level, e.target.value)}
                              data-testid={`input-${level}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="setup1">Setup 1</Label>
                        <Textarea
                          id="setup1"
                          value={formData.setup1}
                          onChange={(e) => updateField("setup1", e.target.value)}
                          placeholder="Describe best setup #1"
                          rows={2}
                          data-testid="input-setup1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setup2">Setup 2</Label>
                        <Textarea
                          id="setup2"
                          value={formData.setup2}
                          onChange={(e) => updateField("setup2", e.target.value)}
                          placeholder="Describe best setup #2"
                          rows={2}
                          data-testid="input-setup2"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="Additional notes or context"
                        rows={3}
                        data-testid="input-notes"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => saveMutation.mutate("save")}
                        disabled={saveMutation.isPending}
                        data-testid="button-save-draft"
                      >
                        {saveMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Draft
                      </Button>
                      <Button
                        onClick={() => saveMutation.mutate("publish_pro")}
                        disabled={saveMutation.isPending}
                        data-testid="button-publish"
                      >
                        {saveMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Publish to Telegram
                      </Button>
                    </div>

                    <div className="pt-4 mt-2 border-t border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="w-4 h-4" /> Schedule publish
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledFor">Publish date & time (local)</Label>
                          <Input
                            id="scheduledFor"
                            type="datetime-local"
                            value={scheduledFor}
                            onChange={(e) => setScheduledFor(e.target.value)}
                            data-testid="input-scheduled-for"
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => scheduleMutation.mutate()}
                          disabled={scheduleMutation.isPending || !formData.id || !scheduledFor}
                          data-testid="button-schedule"
                        >
                          {scheduleMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4 mr-2" />
                          )}
                          Schedule
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Saves status as <code>scheduled</code>. A cron job runs every minute and publishes when the time arrives.
                      </p>
                    </div>

                    <div className="pt-4 mt-2 border-t border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ClipboardPaste className="w-4 h-4" /> Paste-import
                      </div>
                      <Textarea
                        rows={5}
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={`Paste JSON or key:value lines, e.g.\nmagnet: 5872\ndzTop: 5880\ndzBottom: 5864\nr1: 5894\ns1: 5856\nbias: Neutral upside lean`}
                        data-testid="input-paste"
                      />
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pasteMutation.mutate()}
                          disabled={pasteMutation.isPending || !pasteText.trim()}
                          data-testid="button-paste-import"
                        >
                          {pasteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ClipboardPaste className="w-4 h-4 mr-2" />
                          )}
                          Import into form
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Midday Update</CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleCopy("middayUpdate")}
                    data-testid="button-copy-midday"
                  >
                    {copied === "middayUpdate" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-48 overflow-auto" data-testid="preview-midday">
                  {formatMiddayUpdate(planPreview)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">X (Twitter) Post</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono ${xPostLength > 280 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`} data-testid="text-xpost-count">
                      {xPostLength}/280
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCopy("xPost")}
                      data-testid="button-copy-xpost"
                    >
                      {copied === "xPost" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className={`text-xs font-mono whitespace-pre-wrap p-3 rounded-lg max-h-48 overflow-auto ${xPostLength > 280 ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted'}`} data-testid="preview-xpost">
                  {xPostText}
                </pre>
                {xPostLength > 280 && (
                  <p className="text-xs text-destructive mt-2" data-testid="text-xpost-warning">Over 280 character limit by {xPostLength - 280} characters</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Telegram Preview</CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleCopy("telegramPro")}
                    data-testid="button-copy-telegram"
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
                <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-64 overflow-auto" data-testid="preview-telegram">
                  {formatTelegramPro(planPreview)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Substack Preview</CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleCopy("substackPro")}
                    data-testid="button-copy-substack"
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
                <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-64 overflow-auto" data-testid="preview-substack">
                  {formatSubstackPro(planPreview)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

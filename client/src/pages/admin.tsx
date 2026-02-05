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
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { formatTelegram, formatSubstack } from "@/lib/formatter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Plan } from "@shared/schema";
import { 
  TrendingUp, 
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
  TrendingDown,
  Activity
} from "lucide-react";

function getTodayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  
  const [date, setDate] = useState(getTodayISO());
  const [symbol, setSymbol] = useState("ES");
  const [copied, setCopied] = useState<"telegram" | "substack" | null>(null);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    contract: "",
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
    mutationFn: async (action: "save" | "publish") => {
      const payload = {
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
      };
      
      const response = await apiRequest("POST", `/api/plans/${action}`, payload);
      return response.json();
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans/lookup'] });
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: action === "publish" ? "Published to Telegram" : "Draft Saved",
        description: action === "publish" 
          ? "Your trade plan has been sent to Telegram." 
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

  const handleCopy = async (type: "telegram" | "substack") => {
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
    
    const text = type === "telegram" 
      ? formatTelegram(planPreview)
      : formatSubstack(planPreview);
    
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copied",
      description: `${type === "telegram" ? "Telegram" : "Substack"} version copied to clipboard.`,
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
              <p className="text-xs text-muted-foreground">Daily Plan Admin</p>
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

      <main className="container mx-auto px-4 py-6 max-w-6xl">
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
                    onClick={() => setLocation("/archive")}
                    data-testid="link-archive"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    View Archive
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
                        onClick={() => saveMutation.mutate("publish")}
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Telegram Preview</CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleCopy("telegram")}
                    data-testid="button-copy-telegram"
                  >
                    {copied === "telegram" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-64 overflow-auto" data-testid="preview-telegram">
                  {formatTelegram(planPreview)}
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
                    onClick={() => handleCopy("substack")}
                    data-testid="button-copy-substack"
                  >
                    {copied === "substack" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-64 overflow-auto" data-testid="preview-substack">
                  {formatSubstack(planPreview)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatXPost } from "@/lib/formatter";
import { apiRequest } from "@/lib/queryClient";
import type { Plan } from "@shared/schema";
import AlgorithmLevelsPanel from "@/components/AlgorithmLevelsPanel";
import AdminMembersPanel from "@/components/AdminMembersPanel";
import {
  LogOut,
  Send,
  Archive,
  TestTube,
  Copy,
  Check,
  Loader2,
  Settings,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();

  const [copied, setCopied] = useState<"xPost" | null>(null);

  const { data: latestPublished } = useQuery<Plan | null>({
    queryKey: ['/api/plans/latest-published'],
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

  const xPostText = latestPublished ? formatXPost(latestPublished) : "";
  const xPostLength = xPostText.length;

  const handleCopy = async () => {
    if (!latestPublished) return;
    const text = formatXPost(latestPublished);
    await navigator.clipboard.writeText(text);
    setCopied("xPost");
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copied",
      description: "X post copied to clipboard.",
    });
  };

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
        <div className="mb-6">
          <AdminMembersPanel />
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
                  onClick={() => setLocation("/admin/parse-newsletter")}
                  data-testid="link-parse-newsletter"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Parse Newsletter (AI)
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

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">X (Twitter) Post</CardTitle>
                  {latestPublished && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${xPostLength > 280 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`} data-testid="text-xpost-count">
                        {xPostLength}/280
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopy}
                        data-testid="button-copy-xpost"
                      >
                        {copied === "xPost" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {latestPublished ? (
                  <>
                    <pre className={`text-xs font-mono whitespace-pre-wrap p-3 rounded-lg max-h-48 overflow-auto ${xPostLength > 280 ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted'}`} data-testid="preview-xpost">
                      {xPostText}
                    </pre>
                    {xPostLength > 280 && (
                      <p className="text-xs text-destructive mt-2" data-testid="text-xpost-warning">Over the 280 character limit by {xPostLength - 280} characters</p>
                    )}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(xPostText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center w-full rounded-md border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/5"
                      data-testid="link-open-x"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Open X with this post
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground" data-testid="text-xpost-empty">
                    No published plan yet — hit Generate first.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

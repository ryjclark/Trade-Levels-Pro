import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
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
  });

  const { isLoading } = useQuery<SiteSettingsData>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch("/api/settings", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setFormData(data);
      return data;
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm" data-testid="link-admin">
                Admin
              </Button>
            </Link>
            <Link href="/archive">
              <Button variant="outline" size="sm" data-testid="link-archive">
                Archive
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
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
      </main>
    </div>
  );
}

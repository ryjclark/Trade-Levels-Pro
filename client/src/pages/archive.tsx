import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import type { Plan } from "@shared/schema";
import { 
  TrendingUp, 
  LogOut, 
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Archive as ArchiveIcon,
  FileText
} from "lucide-react";

export default function ArchivePage() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const response = await fetch("/api/plans?limit=200", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to load plans");
      return response.json();
    }
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
              <p className="text-xs text-muted-foreground">Plan Archive</p>
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

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/admin")}
            data-testid="link-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArchiveIcon className="w-5 h-5" />
              Saved Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !plans || plans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No plans saved yet.</p>
                <p className="text-sm mt-1">Create your first trade plan to get started.</p>
              </div>
            ) : (
              <div className="divide-y">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setLocation(`/archive/${plan.id}`)}
                    className="w-full flex items-center justify-between gap-4 py-4 px-2 hover-elevate rounded-lg text-left transition-colors"
                    data-testid={`link-plan-${plan.id}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{plan.symbol}</span>
                          <span className="text-muted-foreground">{formatDate(plan.date)}</span>
                          {plan.contract && (
                            <span className="text-xs text-muted-foreground">({plan.contract})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={plan.status === "published" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {plan.status === "published" ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            )}
                            {plan.status}
                          </Badge>
                          {plan.bias && (
                            <span className="text-xs text-muted-foreground">
                              Bias: {plan.bias}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

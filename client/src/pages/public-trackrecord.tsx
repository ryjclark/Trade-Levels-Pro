import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrendingUp, BarChart3, Calendar } from "lucide-react";

export default function PublicTrackRecordPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" data-testid="link-home">
            Trade Levels Pro
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" size="sm" data-testid="link-pricing">
                Pricing
              </Button>
            </Link>
            <Link href="/trackrecord">
              <Button variant="ghost" size="sm" data-testid="link-trackrecord">
                Track Record
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" data-testid="link-about">
                About
              </Button>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Track Record</h1>
            <p className="text-xl text-muted-foreground">
              Performance history and level accuracy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Consistent</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Daily levels published after market close
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Accurate</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Levels based on proven methodology
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Reliable</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Published every trading day
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Performance Details</h2>
              <p className="text-muted-foreground mb-6">
                Track record details and historical performance will be available soon.
                Subscribe to stay updated on our latest analysis and results.
              </p>
              <Link href="/pricing">
                <Button data-testid="button-view-pricing">View Pricing</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Trade Levels Pro - Daily ES/NQ Trade Plans</p>
        </div>
      </footer>
    </div>
  );
}

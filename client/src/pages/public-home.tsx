import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TrendingUp, Target, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

interface PublicSettings {
  joinUrl: string;
  substackUrl: string;
  xUrl: string;
  priceText: string;
}

export default function PublicHomePage() {
  const { data: settings } = useQuery<PublicSettings>({
    queryKey: ["/api/public/settings"],
  });

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

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Trade Levels Pro</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Daily ES/NQ levels (Dynamic Zone, Magnet, Support/Resistance) + trade plan.
            </p>
            {settings?.joinUrl ? (
              <a href={settings.joinUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" data-testid="button-subscribe">
                  Subscribe / Join Telegram
                </Button>
              </a>
            ) : (
              <p className="text-muted-foreground">Join link coming soon.</p>
            )}
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">What You Get</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Daily Levels</h3>
                    <p className="text-sm text-muted-foreground">
                      After-close levels and bias for the next trading day
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Dynamic Zone</h3>
                    <p className="text-sm text-muted-foreground">
                      Clear magnet + dynamic zone context for price action
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Trade Setups</h3>
                    <p className="text-sm text-muted-foreground">
                      Support/Resistance levels and best setups
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Pricing</h2>
                <p className="text-xl mb-6">
                  {settings?.priceText || "Pricing details coming soon."}
                </p>
                {settings?.joinUrl && (
                  <a href={settings.joinUrl} target="_blank" rel="noopener noreferrer">
                    <Button data-testid="button-subscribe-pricing">
                      Subscribe / Join Telegram
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">Find Me</h2>
                <div className="flex justify-center gap-4 flex-wrap">
                  {settings?.substackUrl && (
                    <a href={settings.substackUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" data-testid="link-substack">
                        Substack
                      </Button>
                    </a>
                  )}
                  {settings?.xUrl && (
                    <a href={settings.xUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" data-testid="link-x">
                        X / Twitter
                      </Button>
                    </a>
                  )}
                  {!settings?.substackUrl && !settings?.xUrl && (
                    <p className="text-muted-foreground">Links coming soon.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Trade Levels Pro - Daily ES/NQ Trade Plans</p>
        </div>
      </footer>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Check, Target, TrendingUp, Brain, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" data-testid="link-home">
            Trade Levels Pro
          </Link>
          <nav className="flex items-center gap-2 md:gap-4">
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
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center max-w-4xl">
            <p className="text-primary font-medium mb-4">Trade Smart. React to Price. No Predictions.</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Master ES Futures Trading</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Daily ES support &amp; resistance levels, dynamic zones, and complete trade plans
            </p>
            <Link href="/pricing">
              <Button size="lg" className="text-lg px-8" data-testid="button-get-started">
                Start Trading Smarter - {settings?.priceText || "$25/month"}
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Trade Levels Pro?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Key Market Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Four support and four resistance levels, clearly defined for the next trading day.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Dynamic Zone &amp; Magnet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Understand the "zones of interest" where price is likely to react.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Complete Trade Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Daily market context and suggested setups for level-by-level trading.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-2">Sign Up</h3>
                <p className="text-muted-foreground">Get instant access to our daily trading levels.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-2">Receive Alerts</h3>
                <p className="text-muted-foreground">Get tomorrow's trading plan after market close via Substack.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-2">Trade with Confidence</h3>
                <p className="text-muted-foreground">Use our levels to navigate the market with clarity.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card className="border-primary">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Start Trading with Precision</h2>
                <p className="text-xl text-muted-foreground mb-6">
                  Get daily ES trading levels for just {settings?.priceText || "$25/month"}
                </p>
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">What You Get:</h3>
                  <ul className="space-y-2 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Daily Support &amp; Resistance Levels</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Dynamic Trading Zones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Complete Trade Plans</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Daily Substack Alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Cancel Anytime</span>
                    </li>
                  </ul>
                </div>
                <Link href="/pricing">
                  <Button size="lg" className="w-full max-w-xs" data-testid="button-subscribe">
                    Subscribe Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {(settings?.substackUrl || settings?.xUrl) && (
          <section className="py-16 px-4 bg-muted/50">
            <div className="container mx-auto text-center">
              <h2 className="text-2xl font-bold mb-6">Follow Us</h2>
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
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p className="mb-2">Trade Levels Pro | Daily ES Futures Trade Plans</p>
          <p>Trade Smarter. React to Price. No Predictions.</p>
        </div>
      </footer>
    </div>
  );
}

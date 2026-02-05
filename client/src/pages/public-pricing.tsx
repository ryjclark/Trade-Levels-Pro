import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

interface PublicSettings {
  joinUrl: string;
  substackUrl: string;
  xUrl: string;
  priceText: string;
}

export default function PublicPricingPage() {
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

      <main className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-2">Simple, Transparent Pricing</p>
            <h1 className="text-4xl font-bold mb-4">Start Trading with Precision</h1>
            <p className="text-xl text-muted-foreground">
              Get daily ES trading levels for just {settings?.priceText || "$25/month"}
            </p>
          </div>

          <Card className="max-w-lg mx-auto border-primary">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Pro Membership</CardTitle>
              <p className="text-4xl font-bold mt-4">
                {settings?.priceText || "$25/month"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Daily Support &amp; Resistance Levels (R1-R4, S1-S4)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Dynamic Trading Zones &amp; Magnet Price</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Complete Daily Trade Plans</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Daily Substack Alerts After Market Close</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Telegram Channel Access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Cancel Anytime</span>
                </li>
              </ul>

              {settings?.joinUrl ? (
                <a href={settings.joinUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button size="lg" className="w-full" data-testid="button-subscribe">
                    Subscribe Now
                  </Button>
                </a>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  Coming Soon
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="mt-12 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <p className="font-semibold mb-1">What is included?</p>
                  <p className="text-muted-foreground">
                    Daily ES/NQ levels including support (S1-S4), resistance (R1-R4), 
                    dynamic zone, magnet price, directional bias, and suggested trade setups.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">When is it posted?</p>
                  <p className="text-muted-foreground">
                    After market close on trading days, so you have the levels ready 
                    for the next trading session.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">How do I access it?</p>
                  <p className="text-muted-foreground">
                    Via Substack newsletter and Telegram channel. You'll receive 
                    notifications when new levels are published.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Can I cancel anytime?</p>
                  <p className="text-muted-foreground">
                    Yes, you can cancel your subscription at any time with no questions asked.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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

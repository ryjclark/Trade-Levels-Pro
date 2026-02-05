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
            <h1 className="text-4xl font-bold mb-4">Pricing</h1>
            <p className="text-xl text-muted-foreground">
              {settings?.priceText || "Pricing details coming soon."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Free Tier</CardTitle>
                <p className="text-3xl font-bold mt-2">Free</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Daily ES/NQ levels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Dynamic Zone & Magnet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>R1, R2, S1, S2 levels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Daily bias</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader className="text-center">
                <CardTitle>Pro Tier</CardTitle>
                <p className="text-3xl font-bold mt-2">
                  {settings?.priceText || "Contact us"}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>R3, R4, S3, S4 levels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Trade setups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Notes & commentary</span>
                  </li>
                </ul>
                {settings?.joinUrl && (
                  <a href={settings.joinUrl} target="_blank" rel="noopener noreferrer" className="block mt-6">
                    <Button className="w-full" data-testid="button-subscribe">
                      Subscribe Now
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-12 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">FAQ</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">What is included?</p>
                  <p className="text-muted-foreground">
                    Daily ES/NQ levels, bias, and setups.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">When is it posted?</p>
                  <p className="text-muted-foreground">
                    After market close on trading days.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">How do I access it?</p>
                  <p className="text-muted-foreground">
                    Via Telegram channel and Substack newsletter.
                  </p>
                </div>
              </div>
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

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { AlertTriangle } from "lucide-react";

export default function PublicAboutPage() {
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
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About</h1>
            <p className="text-xl text-muted-foreground">
              Trade Levels Pro delivers a daily trade plan focused on Dynamic Zones,
              Magnet levels, and clear support/resistance.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">How The Levels Are Used</h2>
              <p className="text-muted-foreground">
                These levels provide context for potential reactions and areas of interest.
                The plan outlines the directional bias and top setups for the day.
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>
                  <strong>Dynamic Zone:</strong> The area between DZ Top and DZ Bottom
                  represents a zone of high activity and potential reversals.
                </li>
                <li>
                  <strong>Magnet:</strong> A key level where price tends to gravitate,
                  often serving as a target or pivot point.
                </li>
                <li>
                  <strong>Support/Resistance:</strong> Key levels (R1-R4, S1-S4) where
                  price may find support or face resistance.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
                  <p className="text-muted-foreground">
                    This content is for educational purposes only and is not financial advice.
                    Trading futures involves substantial risk of loss and is not suitable for
                    all investors. Past performance is not indicative of future results.
                    Always do your own research and consult with a qualified financial advisor
                    before making any trading decisions.
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

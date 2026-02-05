import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(password);
      if (success) {
        setLocation("/admin");
      } else {
        setError("Invalid password. Please try again.");
        setPassword("");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Levels Pro</h1>
          <p className="text-muted-foreground mt-2">Daily ES/NQ Trade Plan System</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Admin Login
            </CardTitle>
            <CardDescription>
              Enter your password to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md" data-testid="alert-error">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  data-testid="input-password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password}
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Trade Smarter. React to Price. No Predictions.
        </p>
      </div>
    </div>
  );
}

import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import AdminPage from "@/pages/admin";
import ArchivePage from "@/pages/archive";
import ArchiveDetailPage from "@/pages/archive-detail";
import SettingsPage from "@/pages/settings";
import PublicHomePage from "@/pages/public-home";
import PublicPricingPage from "@/pages/public-pricing";
import PublicSamplePage from "@/pages/public-sample";
import PublicHowItWorksPage from "@/pages/public-how-it-works";
import PublicLegalPage from "@/pages/public-legal";
import PublicWelcomePage from "@/pages/public-welcome";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function PublicLoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  return <LoginPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicHomePage} />
      <Route path="/sample" component={PublicSamplePage} />
      <Route path="/how-it-works" component={PublicHowItWorksPage} />
      <Route path="/pricing" component={PublicPricingPage} />
      <Route path="/about">{() => <Redirect to="/how-it-works" />}</Route>
      <Route path="/subscribe">{() => <Redirect to="/pricing" />}</Route>
      <Route path="/terms">{() => <PublicLegalPage kind="terms" />}</Route>
      <Route path="/privacy">{() => <PublicLegalPage kind="privacy" />}</Route>
      <Route path="/risk">{() => <PublicLegalPage kind="risk" />}</Route>
      <Route path="/welcome" component={PublicWelcomePage} />
      <Route path="/login" component={PublicLoginRoute} />
      <Route path="/admin">
        <ProtectedRoute component={AdminPage} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/archive">
        <ProtectedRoute component={ArchivePage} />
      </Route>
      <Route path="/archive/:id">
        <ProtectedRoute component={ArchiveDetailPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="trade-levels-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

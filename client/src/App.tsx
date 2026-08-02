import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import LoginPage from "@/pages/login";
import AdminPage from "@/pages/admin";
import ArchivePage from "@/pages/archive";
import ArchiveDetailPage from "@/pages/archive-detail";
import SettingsPage from "@/pages/settings";
import ParseNewsletterPage from "@/pages/parse-newsletter";
import PublicHomePage from "@/pages/public-home";
import PublicPricingPage from "@/pages/public-pricing";
import PublicSamplePage from "@/pages/public-sample";
import PublicTrackRecordPage from "@/pages/public-trackrecord";
import PublicTerminalPage from "@/pages/public-terminal";
import PublicHowItWorksPage from "@/pages/public-how-it-works";
import PublicLegalPage from "@/pages/public-legal";
import PublicWelcomePage from "@/pages/public-welcome";
import PublicPropFirmsPage from "@/pages/public-prop-firms";
import PublicIndicatorPage from "@/pages/public-indicator";
import PublicLearnPage from "@/pages/public-learn";
import PublicArticlePage from "@/pages/public-article";
import PublicArchivePage from "@/pages/public-archive";
import PublicPlanDetailPage from "@/pages/public-plan-detail";
import PublicAboutPage from "@/pages/public-about";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <Component />
    </div>
  );
}

function PublicLoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <LoginPage />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicHomePage} />
      <Route path="/sample" component={PublicSamplePage} />
      <Route path="/how-it-works" component={PublicHowItWorksPage} />
      <Route path="/pricing" component={PublicPricingPage} />
      <Route path="/prop-firms" component={PublicPropFirmsPage} />
      <Route path="/indicator" component={PublicIndicatorPage} />
      <Route path="/learn" component={PublicLearnPage} />
      <Route path="/learn/:slug" component={PublicArticlePage} />
      <Route path="/about" component={PublicAboutPage} />
      <Route path="/archive" component={PublicArchivePage} />
      <Route path="/track-record" component={PublicTrackRecordPage} />
      <Route path="/terminal" component={PublicTerminalPage} />
      <Route path="/p/:id" component={PublicPlanDetailPage} />
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
      <Route path="/admin/archive">
        <ProtectedRoute component={ArchivePage} />
      </Route>
      <Route path="/admin/parse-newsletter">
        <ProtectedRoute component={ParseNewsletterPage} />
      </Route>
      <Route path="/admin/archive/:id">
        <ProtectedRoute component={ArchiveDetailPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ClarityLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).__clarityLoaded) return;
    fetch("/api/public/site-config")
      .then((r) => r.json())
      .then((cfg: { clarityProjectId?: string | null }) => {
        const id = cfg?.clarityProjectId;
        if (!id) return;
        (window as any).__clarityLoaded = true;
        const s = document.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.text = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`;
        document.head.appendChild(s);
      })
      .catch(() => {});
  }, []);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="trade-levels-theme">
        <TooltipProvider>
          <Toaster />
          <ClarityLoader />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

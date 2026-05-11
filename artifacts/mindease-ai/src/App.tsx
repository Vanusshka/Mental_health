import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MoodProvider } from "@/contexts/MoodContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PatientSessionProvider } from "@/contexts/PatientSessionContext";
import MoodBackground from "@/components/MoodBackground";
import MusicPlayer from "@/components/MusicPlayer";
import MouseGlow from "@/components/MouseGlow";

import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import CheckIn from "@/pages/CheckIn";
import Dashboard from "@/pages/Dashboard";
import Experts from "@/pages/Experts";
import Doctor from "@/pages/Doctor";
import OrgPortal from "@/pages/OrgPortal";
import WorkshopCheckin from "@/pages/WorkshopCheckin";
import SessionSummary from "@/pages/SessionSummary";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/checkin" component={CheckIn} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/experts" component={Experts} />
        <Route path="/doctor" component={Doctor} />
        <Route path="/org" component={OrgPortal} />
        <Route path="/workshop/:id" component={WorkshopCheckin} />
        <Route path="/session-summary" component={SessionSummary} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PatientSessionProvider>
          <MoodProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base="">
                <AppInner />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </MoodProvider>
        </PatientSessionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppInner() {
  const [location] = useLocation();
  const isClean = location === "/" || location === "/login";
  return (
    <>
      {!isClean && <MoodBackground />}
      {!isClean && <MouseGlow />}
      <div className="flex min-h-screen flex-col relative">
        <main className="flex-1">
          <Router />
        </main>
      </div>
      {!isClean && <MusicPlayer />}
    </>
  );
}

export default App;

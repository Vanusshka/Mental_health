import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MoodProvider } from "@/contexts/MoodContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MoodBackground from "@/components/MoodBackground";
import MusicPlayer from "@/components/MusicPlayer";
import MouseGlow from "@/components/MouseGlow";

// Pages
import Home from "@/pages/Home";
import Mood from "@/pages/Mood";
import Chat from "@/pages/Chat";
import Dashboard from "@/pages/Dashboard";
import Experts from "@/pages/Experts";
import Doctor from "@/pages/Doctor";
import SessionSummary from "@/pages/SessionSummary";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/" component={Home} />
        <Route path="/mood" component={Mood} />
        <Route path="/chat" component={Chat} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/experts" component={Experts} />
        <Route path="/doctor" component={Doctor} />
        <Route path="/session-summary" component={SessionSummary} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <MoodProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              {/* Global mood-reactive background */}
              <MoodBackground />
              {/* Mouse follow glow */}
              <MouseGlow />

              <div className="flex min-h-screen flex-col relative">
                <Navigation />
                <main className="flex-1">
                  <Router />
                </main>
                <Footer />
              </div>

              {/* Floating music player */}
              <MusicPlayer />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </MoodProvider>
    </ThemeProvider>
  );
}

export default App;

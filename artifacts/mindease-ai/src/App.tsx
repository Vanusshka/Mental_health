import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MoodProvider } from "@/contexts/MoodContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MoodBackground from "@/components/MoodBackground";
import MusicPlayer from "@/components/MusicPlayer";
import MouseGlow from "@/components/MouseGlow";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import CheckIn from "@/pages/CheckIn";
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
        {/* Public routes */}
        <Route path="/"      component={Home}  />
        <Route path="/login" component={Login} />

        {/* Protected routes — require authentication */}
        <Route path="/checkin">
          <ProtectedRoute><CheckIn /></ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        </Route>
        <Route path="/experts">
          <ProtectedRoute><Experts /></ProtectedRoute>
        </Route>
        <Route path="/doctor">
          <ProtectedRoute><Doctor /></ProtectedRoute>
        </Route>
        <Route path="/session-summary">
          <ProtectedRoute><SessionSummary /></ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MoodProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <MoodBackground />
                <MouseGlow />
                <div className="flex min-h-screen flex-col relative">
                  <Navigation />
                  <main className="flex-1">
                    <Router />
                  </main>
                  <Footer />
                </div>
                <MusicPlayer />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </MoodProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

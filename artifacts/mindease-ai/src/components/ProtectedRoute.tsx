/**
 * ProtectedRoute
 * ─────────────────────────────────────────────────────────────────────────
 * Wraps routes that require authentication.
 * Shows a calming loading state while Firebase restores the session.
 * Redirects unauthenticated users to /login.
 */

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth();
  const [, navigate] = useLocation();

  // While Firebase is restoring the session, show a minimal loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain size={24} className="text-white" />
          </motion.div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/50"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Firebase not configured — allow access without auth (dev/demo mode)
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Not authenticated — redirect to login
  if (!user) {
    navigate("/login");
    return null;
  }

  return <>{children}</>;
}

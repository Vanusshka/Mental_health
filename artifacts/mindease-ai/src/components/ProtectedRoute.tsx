/**
 * ProtectedRoute
 * ─────────────────────────────────────────────────────────────────────────
 * Wraps routes that require authentication.
 * Also handles role-based redirects:
 *   - No role yet → /role-select
 *   - Role exists → correct space (patient → /checkin, doctor → /doctor)
 */

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, only users with this role can access. Others are redirected. */
  requiredRole?: "patient" | "doctor";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isConfigured, role, roleLoading } = useAuth();
  const [, navigate] = useLocation();

  // Show loading while Firebase restores session or role is being fetched
  if (loading || (user && roleLoading)) {
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

  // Not authenticated → login
  if (!user) {
    navigate("/login");
    return null;
  }

  // Authenticated but no role yet → role selection
  if (!role) {
    navigate("/role-select");
    return null;
  }

  // Role mismatch — redirect to the correct space
  if (requiredRole && role !== requiredRole) {
    navigate(role === "doctor" ? "/doctor" : "/checkin");
    return null;
  }

  return <>{children}</>;
}

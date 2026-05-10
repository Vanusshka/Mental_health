/**
 * AuthContext
 * ─────────────────────────────────────────────────────────────────────────
 * Provides the current Firebase user, auth loading state, and config status.
 * Handles both popup and redirect sign-in flows.
 * Restores session automatically on page refresh.
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChange, checkRedirectResult, isFirebaseConfigured } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  /** True if all required Firebase env vars are present */
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured            = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      // Firebase not configured — skip auth entirely
      setLoading(false);
      return;
    }

    // 1. Subscribe to auth state — fires immediately with cached session
    const unsubscribe = onAuthStateChanged_internal((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // 2. Check for pending redirect result (fires after signInWithRedirect)
    checkRedirectResult().then((redirectUser) => {
      if (redirectUser) setUser(redirectUser);
    });

    return unsubscribe;
  }, [configured]);

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured: configured }}>
      {children}
    </AuthContext.Provider>
  );
}

// Internal helper to avoid circular import
function onAuthStateChanged_internal(cb: (u: User | null) => void) {
  return onAuthStateChange(cb);
}

export function useAuth() {
  return useContext(AuthContext);
}

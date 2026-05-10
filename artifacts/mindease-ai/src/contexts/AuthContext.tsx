/**
 * AuthContext
 * ─────────────────────────────────────────────────────────────────────────
 * Provides Firebase user, auth loading state, config status, and user role.
 * Role is fetched from Firestore after auth state resolves.
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChange, checkRedirectResult, isFirebaseConfigured } from "@/services/authService";
import { getUserRole, type UserRole } from "@/services/firestoreService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  /** True if all required Firebase env vars are present */
  isConfigured: boolean;
  /** "patient" | "doctor" | null (null = not yet chosen or still loading) */
  role: UserRole | null;
  /** True while the role is being fetched from Firestore */
  roleLoading: boolean;
  /** Call after saving a new role so the context updates immediately */
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  role: null,
  roleLoading: false,
  refreshRole: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const [role, setRole]               = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const configured                    = isFirebaseConfigured();

  async function fetchRole(firebaseUser: User | null) {
    if (!firebaseUser || !configured) {
      setRole(null);
      return;
    }
    setRoleLoading(true);
    try {
      const r = await getUserRole(firebaseUser.uid);
      setRole(r);
    } catch {
      setRole(null);
    } finally {
      setRoleLoading(false);
    }
  }

  async function refreshRole() {
    await fetchRole(user);
  }

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Only subscribe to auth state if Firebase is properly configured
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthStateChanged_internal(async (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
        await fetchRole(firebaseUser);
      });

      checkRedirectResult().then(async (redirectUser) => {
        if (redirectUser) {
          setUser(redirectUser);
          await fetchRole(redirectUser);
        }
      });
    } catch {
      setLoading(false);
    }

    return () => unsubscribe?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured: configured, role, roleLoading, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

function onAuthStateChanged_internal(cb: (u: User | null) => void) {
  return onAuthStateChange(cb);
}

export function useAuth() {
  return useContext(AuthContext);
}

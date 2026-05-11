/**
 * AuthContext — Supabase-ready session context
 * Reads/writes from localStorage session (no Firebase).
 */

import { createContext, useContext, useState, useEffect } from "react";
import { getSession, setSession, clearSession, type SessionUser, type UserRole } from "@/services/authService";

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  isConfigured: boolean;
  role: UserRole | null;
  roleLoading: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: false, isConfigured: true,
  role: null, roleLoading: false,
  login: () => {}, logout: () => {}, refreshRole: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]   = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  function login(email: string, role: UserRole) {
    // Use email as stable ID so Supabase queries return same user's data on re-login
    const stableId = btoa(email.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, "").slice(0, 36);
    const session: SessionUser = {
      id:           stableId,
      email,
      display_name: email.split("@")[0],
      role,
    };
    setSession(session);
    setUser(session);
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  async function refreshRole() {}

  return (
    <AuthContext.Provider value={{
      user, loading, isConfigured: true,
      role: user?.role ?? null, roleLoading: false,
      login, logout, refreshRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthContext — session context with Supabase doctor profile persistence
 */

import { createContext, useContext, useState, useEffect } from "react";
import { getSession, setSession, clearSession, type SessionUser, type UserRole } from "@/services/authService";
import { saveDoctorProfile, getDoctorProfile } from "@/services/supabaseService";

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  isConfigured: boolean;
  role: UserRole | null;
  roleLoading: boolean;
  login: (email: string, role: UserRole, fullName?: string, specialization?: string) => Promise<void>;
  logout: () => void;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: false, isConfigured: true,
  role: null, roleLoading: false,
  login: async () => {}, logout: () => {}, refreshRole: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      // If doctor, try to load latest profile from Supabase to get real name
      if (session.role === "doctor") {
        getDoctorProfile(session.id).then(profile => {
          if (profile && profile.full_name) {
            const updated = { ...session, display_name: profile.full_name, specialization: profile.specialization ?? undefined };
            setSession(updated);
            setUser(updated);
          }
        }).catch(() => {});
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, role: UserRole, fullName?: string, specialization?: string) {
    const stableId = btoa(email.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, "").slice(0, 36);
    const displayName = fullName?.trim() || email.split("@")[0];
    const session: SessionUser = { id: stableId, email, display_name: displayName, role, specialization };
    setSession(session);
    setUser(session);

    // Persist doctor profile to Supabase
    if (role === "doctor") {
      try {
        await saveDoctorProfile({ id: stableId, email, full_name: displayName, specialization: specialization ?? null });
      } catch { /* non-blocking */ }
    }
  }

  function logout() { clearSession(); setUser(null); }
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

export function useAuth() { return useContext(AuthContext); }

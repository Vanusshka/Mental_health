/**
 * Auth Service — Session auth with Supabase doctor profile persistence
 */

export type UserRole = "user" | "doctor" | "org";

export interface SessionUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  specialization?: string;
}

const SESSION_KEY = "MANAS_session";

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(user: SessionUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isConfigured(): boolean { return true; }

export function signOut(): void { clearSession(); }

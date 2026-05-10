/**
 * Auth Service — Firebase Google Authentication
 * ─────────────────────────────────────────────────────────────────────────
 * Strategy: popup first, redirect fallback.
 * Popup works on most browsers; redirect handles popup-blocked environments.
 *
 * Error codes are surfaced verbatim so the UI can show actionable messages.
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ── Sign-in ────────────────────────────────────────────────────────────────

/**
 * Attempts Google sign-in via popup.
 * Falls back to redirect if the popup is blocked.
 * Returns the signed-in User on success, or throws a typed error.
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? "";

    // Popup was blocked by the browser — fall back to redirect
    if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, googleProvider);
      // Page will reload; getRedirectResult() in AuthContext will handle the result
      throw new Error("__redirect__"); // sentinel — not a real error
    }

    // Re-throw with a human-readable message attached
    const message = AUTH_ERROR_MESSAGES[code] ?? `Authentication failed (${code || "unknown"})`;
    const typed = new Error(message);
    (typed as Error & { code: string }).code = code;
    console.error("[MANAS Auth] Sign-in error:", code, err);
    throw typed;
  }
}

/**
 * Checks for a pending redirect result on page load.
 * Call this once from AuthContext after the auth state listener fires.
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? "";
    console.error("[MANAS Auth] Redirect result error:", code, err);
    return null;
  }
}

// ── Sign-out ───────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ── Auth state ─────────────────────────────────────────────────────────────

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ── Config validation ──────────────────────────────────────────────────────

/**
 * Returns true if all required Firebase env vars are set.
 * Call this on app startup to surface misconfiguration early.
 */
export function isFirebaseConfigured(): boolean {
  const required = [
    import.meta.env.VITE_FIREBASE_API_KEY,
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
    import.meta.env.VITE_FIREBASE_APP_ID,
  ];
  return required.every((v) => v && v !== "your_api_key_here" && !v.startsWith("your_"));
}

// ── Error message map ──────────────────────────────────────────────────────

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/cancelled-popup-request":    "Another sign-in is already in progress.",
  "auth/popup-closed-by-user":       "Sign-in was cancelled.",
  "auth/popup-blocked":              "Your browser blocked the sign-in popup. Trying redirect…",
  "auth/network-request-failed":     "Network error. Please check your connection and try again.",
  "auth/too-many-requests":          "Too many attempts. Please wait a moment and try again.",
  "auth/user-disabled":              "This account has been disabled.",
  "auth/operation-not-allowed":      "Google sign-in is not enabled. Please contact support.",
  "auth/unauthorized-domain":        "This domain is not authorised for sign-in. Add localhost to Firebase Console → Authentication → Authorised Domains.",
  "auth/internal-error":             "An internal error occurred. Please try again.",
  "auth/invalid-api-key":            "Firebase API key is invalid. Check your .env configuration.",
};

/**
 * Firebase Initialisation
 * ─────────────────────────────────────────────────────────────────────────
 * Initialises the Firebase app, Auth, and Firestore instances.
 * All config values are read from Vite environment variables.
 *
 * Import `auth` and `db` from this file — never call initializeApp() again.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isConfigured = apiKey && !apiKey.startsWith("your_");

const firebaseConfig = {
  apiKey:            apiKey || "demo-key",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID  || "demo-project",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:demo",
};

// Prevent duplicate initialisation during HMR
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export { isConfigured };
export default app;

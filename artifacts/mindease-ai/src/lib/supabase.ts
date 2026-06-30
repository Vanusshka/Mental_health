/**
 * Supabase Client
 * ─────────────────────────────────────────────────────────────────────────
 * Single shared client instance for the entire app.
 * URL and anon key come from Vite env vars.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl.includes("supabase.co") &&
  !!supabaseKey &&
  supabaseKey.length > 20 &&
  !supabaseKey.includes("your_supabase") &&
  !supabaseKey.includes("placeholder");

// Always create a client — if keys are missing it will fail gracefully on queries
export const supabase = createClient<Database>(
  supabaseUrl  || "https://placeholder.supabase.co",
  supabaseKey  || "placeholder",
  {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 10 } },
  }
);

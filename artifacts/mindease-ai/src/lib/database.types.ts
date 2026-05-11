/**
 * Supabase Database Types
 * Auto-generated shape matching the schema below.
 *
 * Tables:
 *   emotional_checkins
 *   workshops
 *   workshop_participants
 */

export interface Database {
  public: {
    Tables: {
      emotional_checkins: {
        Row: {
          id: string;
          user_id: string | null;
          display_name: string | null;
          email: string | null;
          mood: "happy" | "neutral" | "sad";
          stress_score: number;
          emotional_summary: string | null;
          dominant_emotion: string | null;
          dominant_score: number | null;
          assessment_level: "elevated" | "moderate" | "positive";
          emotional_balance: number;
          burnout_risk: number;
          sleep_wellness: number;
          emotional_resilience: number;
          social_connectivity: number;
          wellness_score: number;
          reflection: string | null;
          answers: { question: string; answer: string }[] | null;
          workshop_id: string | null;
          timestamp: string;
        };
        Insert: Omit<Database["public"]["Tables"]["emotional_checkins"]["Row"], "id" | "timestamp"> & { id?: string; timestamp?: string };
        Update: Partial<Database["public"]["Tables"]["emotional_checkins"]["Row"]>;
      };
      workshops: {
        Row: {
          id: string;
          workshop_name: string;
          description: string | null;
          organization_id: string | null;
          organization_name: string | null;
          date: string | null;
          created_at: string;
          checkin_count: number;
        };
        Insert: Omit<Database["public"]["Tables"]["workshops"]["Row"], "id" | "created_at" | "checkin_count"> & { id?: string; created_at?: string; checkin_count?: number };
        Update: Partial<Database["public"]["Tables"]["workshops"]["Row"]>;
      };
      workshop_participants: {
        Row: {
          id: string;
          workshop_id: string;
          participant_mood: "happy" | "neutral" | "sad";
          stress_score: number;
          timestamp: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workshop_participants"]["Row"], "id" | "timestamp"> & { id?: string; timestamp?: string };
        Update: Partial<Database["public"]["Tables"]["workshop_participants"]["Row"]>;
      };
    };
  };
}

// Convenience row types
export type EmotionalCheckin   = Database["public"]["Tables"]["emotional_checkins"]["Row"];
export type Workshop           = Database["public"]["Tables"]["workshops"]["Row"];
export type WorkshopParticipant = Database["public"]["Tables"]["workshop_participants"]["Row"];

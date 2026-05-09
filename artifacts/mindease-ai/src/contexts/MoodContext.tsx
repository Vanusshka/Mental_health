import { createContext, useContext, useState, useCallback } from "react";

export type MoodType = "happy" | "neutral" | "sad" | null;

export interface MoodTheme {
  bg1: string;
  bg2: string;
  bg3: string;
  particle1: string;
  particle2: string;
  glow: string;
  accent: string;
  name: string;
  emoji: string;
  gradientCSS: string;
}

export const moodThemes: Record<NonNullable<MoodType>, MoodTheme> = {
  happy: {
    bg1: "#fef3c7",
    bg2: "#fde68a",
    bg3: "#fed7aa",
    particle1: "#fbbf24",
    particle2: "#fb923c",
    glow: "rgba(251, 191, 36, 0.35)",
    accent: "#f97316",
    name: "Happy",
    emoji: "😊",
    gradientCSS:
      "radial-gradient(ellipse at 20% 30%, #fef3c7 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #fde68a 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, #fed7aa 0%, transparent 55%), linear-gradient(145deg, #fefce8 0%, #fef9e7 40%, #fff7ed 100%)",
  },
  neutral: {
    bg1: "#e0f2fe",
    bg2: "#cffafe",
    bg3: "#d1fae5",
    particle1: "#38bdf8",
    particle2: "#34d399",
    glow: "rgba(56, 189, 248, 0.28)",
    accent: "#0ea5e9",
    name: "Neutral",
    emoji: "😐",
    gradientCSS:
      "radial-gradient(ellipse at 20% 30%, #e0f2fe 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #cffafe 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, #d1fae5 0%, transparent 55%), linear-gradient(145deg, #f0f9ff 0%, #ecfeff 40%, #f0fdf4 100%)",
  },
  sad: {
    bg1: "#ede9fe",
    bg2: "#ddd6fe",
    bg3: "#bfdbfe",
    particle1: "#818cf8",
    particle2: "#93c5fd",
    glow: "rgba(129, 140, 248, 0.32)",
    accent: "#6366f1",
    name: "Sad",
    emoji: "😔",
    gradientCSS:
      "radial-gradient(ellipse at 20% 30%, #ede9fe 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #ddd6fe 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, #bfdbfe 0%, transparent 55%), linear-gradient(145deg, #f5f3ff 0%, #f0f4ff 40%, #eff6ff 100%)",
  },
};

interface MoodContextType {
  mood: MoodType;
  setMood: (mood: MoodType) => void;
  theme: MoodTheme | null;
}

const MoodContext = createContext<MoodContextType>({
  mood: null,
  setMood: () => {},
  theme: null,
});

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMoodState] = useState<MoodType>(null);

  const setMood = useCallback((m: MoodType) => {
    setMoodState(m);
  }, []);

  const theme = mood ? moodThemes[mood] : null;

  return (
    <MoodContext.Provider value={{ mood, setMood, theme }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  return useContext(MoodContext);
}

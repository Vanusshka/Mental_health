import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown, ChevronRight, Wind, Music, Brain, Dumbbell, BookOpen, Activity, Target, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { useMood, MoodType } from "@/contexts/MoodContext";

const moods = [
  {
    id: "happy" as MoodType,
    emoji: "😊",
    label: "Happy",
    description: "Feeling bright, positive, and full of energy",
    icon: Smile,
    gradient: "from-yellow-400 via-orange-400 to-amber-400",
    bgGlow: "rgba(251, 191, 36, 0.25)",
    textGradient: "from-yellow-500 to-orange-500",
    ringColor: "#fbbf24",
  },
  {
    id: "neutral" as MoodType,
    emoji: "😐",
    label: "Neutral",
    description: "Balanced and steady, neither high nor low",
    icon: Meh,
    gradient: "from-sky-400 via-cyan-400 to-teal-400",
    bgGlow: "rgba(56, 189, 248, 0.25)",
    textGradient: "from-sky-500 to-teal-500",
    ringColor: "#38bdf8",
  },
  {
    id: "sad" as MoodType,
    emoji: "😔",
    label: "Sad",
    description: "Feeling low, heavy, or emotionally drained",
    icon: Frown,
    gradient: "from-indigo-400 via-violet-400 to-purple-500",
    bgGlow: "rgba(129, 140, 248, 0.25)",
    textGradient: "from-indigo-500 to-violet-500",
    ringColor: "#818cf8",
  },
];

const moodContent: Record<string, { icon: React.ElementType; title: string; desc: string; color: string }[]> = {
  happy: [
    { icon: Smile, title: "Keep Your Momentum", desc: "You're doing great! Channel this energy into something meaningful today.", color: "from-yellow-400 to-orange-400" },
    { icon: Music, title: "Morning Glow Playlist", desc: "Uplifting lo-fi beats to match your sunny mood.", color: "from-orange-400 to-amber-400" },
    { icon: Dumbbell, title: "Recommended Activities", desc: "Try journaling, a nature walk, or a creative project.", color: "from-amber-400 to-yellow-400" },
    { icon: Target, title: "Today's Wellness Streak", desc: "Day 7 of positive check-ins. Keep it going!", color: "from-yellow-500 to-orange-500" },
  ],
  neutral: [
    { icon: Brain, title: "Productivity Balance", desc: "Use the Pomodoro technique: 25 min focus, 5 min rest.", color: "from-sky-400 to-cyan-400" },
    { icon: Moon, title: "Sleep Improvement Tips", desc: "Aim for 7-8 hours. Try a consistent bedtime routine.", color: "from-cyan-400 to-teal-400" },
    { icon: Activity, title: "Stress Prevention", desc: "Light stretching or a 10-min mindful walk can reset your day.", color: "from-teal-400 to-sky-400" },
    { icon: BookOpen, title: "Focus Exercise", desc: "Try a 5-minute breathing exercise before your next task.", color: "from-sky-500 to-teal-500" },
  ],
  sad: [
    { icon: Wind, title: "Breathing Exercise", desc: "Inhale 4 counts, hold 4, exhale 6. Repeat to calm your nervous system.", color: "from-indigo-400 to-violet-400" },
    { icon: Brain, title: "Your AI is Here", desc: "You don't have to navigate this alone. MindEase AI listens with care.", color: "from-violet-400 to-purple-400" },
    { icon: Moon, title: "Rest is Healing", desc: "Rest is not giving up. Rest is how you keep going.", color: "from-purple-400 to-indigo-400" },
    { icon: Music, title: "Soothing Sounds", desc: "Ambient music has started playing to help you feel supported.", color: "from-indigo-500 to-violet-500" },
  ],
};

function BreathingCircle({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center my-6">
      <div className="relative flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ border: `1.5px solid ${color}50`, width: 80 + i * 45, height: 80 + i * 45 }}
            animate={{ scale: [1, 1.55, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: i * 1.3, ease: "easeInOut" }}
          />
        ))}
        <motion.div
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: `linear-gradient(135deg, ${color}cc, ${color}88)`, boxShadow: `0 0 40px ${color}40` }}
          animate={{ scale: [1, 1.22, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Wind size={32} className="text-white" />
        </motion.div>
      </div>
      <motion.p
        className="mt-6 text-sm text-muted-foreground font-medium tracking-wide"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Breathe In... Hold... Breathe Out...
      </motion.p>
    </div>
  );
}

export default function MoodPage() {
  const [selected, setSelected] = useState<MoodType>(null);
  const { setMood } = useMood();
  const [, navigate] = useLocation();

  function handleSelect(id: MoodType) {
    setSelected(id);
    setMood(id);
  }

  function handleContinue() {
    if (selected === "happy") navigate("/dashboard");
    else navigate("/chat");
  }

  const activeMood = moods.find((m) => m.id === selected);
  const content = selected ? moodContent[selected as string] : [];

  return (
    <PageTransition>
      <div className="min-h-screen px-6 py-16">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/40 text-sm font-medium text-muted-foreground mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Daily Mood Check-In
            </motion.div>
            <motion.h1
              className="text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              How are you feeling?
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              Select the emotion that resonates most with you right now.
            </motion.p>
          </div>

          {/* Mood Cards — 3 options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {moods.map((mood, i) => {
              const isSelected = selected === mood.id;
              return (
                <motion.button
                  key={mood.id as string}
                  onClick={() => handleSelect(mood.id)}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative rounded-3xl p-8 text-left overflow-hidden transition-all duration-500 cursor-pointer ${
                    isSelected
                      ? "shadow-2xl"
                      : "bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/50 dark:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/10"
                  }`}
                  style={
                    isSelected
                      ? {
                          background: `linear-gradient(145deg, ${mood.bgGlow.replace("0.25", "0.15")}, white 80%)`,
                          boxShadow: `0 20px 60px ${mood.bgGlow}, 0 0 0 2px ${mood.ringColor}60`,
                          border: `2px solid ${mood.ringColor}50`,
                        }
                      : {}
                  }
                >
                  {/* Background glow on selected */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: `radial-gradient(ellipse at 30% 30%, ${mood.bgGlow}, transparent 70%)`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}

                  {/* Emoji */}
                  <motion.div
                    className="text-6xl mb-5 relative z-10"
                    animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {mood.emoji}
                  </motion.div>

                  {/* Label */}
                  <div className="relative z-10">
                    <p
                      className={`text-2xl font-bold mb-1.5 bg-gradient-to-r ${mood.textGradient} bg-clip-text text-transparent`}
                    >
                      {mood.label}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{mood.description}</p>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      className={`absolute top-4 right-4 w-7 h-7 rounded-full bg-gradient-to-br ${mood.gradient} flex items-center justify-center shadow-md`}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </motion.div>
                  )}

                  {/* Shimmer line at bottom on selected */}
                  {isSelected && (
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl bg-gradient-to-r ${mood.gradient}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic content based on selected mood */}
          <AnimatePresence mode="wait">
            {selected && activeMood && (
              <motion.div
                key={selected as string}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Breathing circle for sad */}
                {selected === "sad" && (
                  <div className="text-center mb-8">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">
                      Take a gentle moment to breathe
                    </p>
                    <BreathingCircle color="#818cf8" />
                  </div>
                )}

                {/* Content cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {content.map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.09, duration: 0.45 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="p-5 rounded-2xl bg-white/70 dark:bg-white/8 backdrop-blur-md border border-white/50 dark:border-white/10 hover:shadow-lg transition-all duration-300 cursor-default"
                    >
                      <div
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} w-fit mb-3 shadow-sm`}
                      >
                        <item.icon size={17} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    className={`rounded-full px-12 py-6 text-base font-semibold bg-gradient-to-r ${activeMood.gradient} hover:opacity-90 shadow-xl gap-2 text-white border-0`}
                    style={{ boxShadow: `0 12px 40px ${activeMood.bgGlow}` }}
                  >
                    {selected === "happy"
                      ? "View My Wellness Dashboard"
                      : selected === "neutral"
                      ? "Start Focused Session"
                      : "Talk to MindEase AI"}
                    <ChevronRight size={18} />
                  </Button>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Your ambient music has started — immerse yourself
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown, Activity, Flame, Moon, Music, BookOpen, Dumbbell, Target, Brain, ChevronRight, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

type Mood = "happy" | "neutral" | "low" | "anxious" | "overwhelmed" | "exhausted" | null;

const moods: { id: Mood; label: string; icon: React.ReactNode; gradient: string; bgGradient: string; textColor: string; description: string }[] = [
  {
    id: "happy",
    label: "Happy",
    icon: <Smile size={36} />,
    gradient: "from-yellow-400 to-orange-400",
    bgGradient: "from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-amber-900/20",
    textColor: "text-orange-500",
    description: "Feeling bright and positive",
  },
  {
    id: "neutral",
    label: "Neutral",
    icon: <Meh size={36} />,
    gradient: "from-blue-400 to-teal-400",
    bgGradient: "from-blue-50 via-teal-50 to-cyan-50 dark:from-blue-900/20 dark:via-teal-900/20 dark:to-cyan-900/20",
    textColor: "text-teal-500",
    description: "Steady, neither high nor low",
  },
  {
    id: "low",
    label: "Low",
    icon: <Frown size={36} />,
    gradient: "from-blue-400 to-indigo-500",
    bgGradient: "from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-violet-900/20",
    textColor: "text-indigo-500",
    description: "Feeling down or sad",
  },
  {
    id: "anxious",
    label: "Anxious",
    icon: <Activity size={36} />,
    gradient: "from-cyan-400 to-sky-500",
    bgGradient: "from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-900/20 dark:via-sky-900/20 dark:to-blue-900/20",
    textColor: "text-cyan-500",
    description: "Worried or unsettled",
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    icon: <Flame size={36} />,
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20",
    textColor: "text-violet-500",
    description: "Too much, need grounding",
  },
  {
    id: "exhausted",
    label: "Exhausted",
    icon: <Moon size={36} />,
    gradient: "from-rose-300 to-pink-400",
    bgGradient: "from-rose-50 via-pink-50 to-red-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-red-900/20",
    textColor: "text-rose-400",
    description: "Drained, need rest",
  },
];

const happyContent = [
  { icon: Smile, title: "Keep Your Momentum", desc: "You're doing great! Channel this energy into something meaningful today.", color: "from-yellow-400 to-orange-400" },
  { icon: Music, title: "Morning Glow Playlist", desc: "Uplifting lo-fi beats to match your sunny mood.", color: "from-orange-400 to-amber-400" },
  { icon: Dumbbell, title: "Recommended Activities", desc: "Try journaling, a nature walk, or a creative project.", color: "from-amber-400 to-yellow-400" },
  { icon: Target, title: "Today's Wellness Streak", desc: "Day 7 of positive check-ins. Keep it going!", color: "from-yellow-500 to-orange-500" },
];

const neutralContent = [
  { icon: Brain, title: "Productivity Balance", desc: "Use the Pomodoro technique: 25 min focus, 5 min rest.", color: "from-blue-400 to-teal-400" },
  { icon: Moon, title: "Sleep Improvement Tips", desc: "Aim for 7-8 hours. Try a consistent bedtime routine.", color: "from-teal-400 to-cyan-400" },
  { icon: Activity, title: "Stress Prevention", desc: "Light stretching or a 10-min mindful walk can reset your day.", color: "from-cyan-400 to-blue-400" },
  { icon: BookOpen, title: "Focus Exercise", desc: "Try a 5-minute breathing exercise before your next task.", color: "from-blue-500 to-teal-500" },
];

function BreathingCircle() {
  return (
    <div className="flex flex-col items-center my-8">
      <div className="relative flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-cyan-300/40 dark:border-cyan-500/30"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: "easeInOut" }}
            style={{ width: 80 + i * 40, height: 80 + i * 40 }}
          />
        ))}
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center shadow-lg shadow-cyan-400/30"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Wind size={32} className="text-white" />
        </motion.div>
      </div>
      <motion.p
        className="mt-6 text-sm text-muted-foreground font-medium"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        Breathe In... Hold... Breathe Out...
      </motion.p>
    </div>
  );
}

export default function Mood() {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);

  const selected = moods.find((m) => m.id === selectedMood);
  const needsChat = selectedMood === "low" || selectedMood === "anxious" || selectedMood === "overwhelmed" || selectedMood === "exhausted";

  return (
    <PageTransition>
      <motion.div
        className="min-h-screen transition-all duration-700 px-6 py-16"
        animate={{
          background: selected
            ? undefined
            : undefined,
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <motion.h1
              className="text-4xl md:text-5xl font-semibold tracking-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              How are you feeling today?
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Select the emotion that resonates most with you right now.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {moods.map((mood, i) => (
              <motion.button
                key={mood.id}
                data-testid={`mood-card-${mood.id}`}
                onClick={() => setSelectedMood(mood.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className={`relative rounded-2xl p-6 border-2 transition-all duration-300 text-left overflow-hidden
                  ${selectedMood === mood.id
                    ? `border-transparent bg-gradient-to-br ${mood.bgGradient} shadow-xl ring-2 ring-offset-2`
                    : "border-border bg-card hover:border-primary/30 hover:shadow-lg"
                  }`}
              >
                {selectedMood === mood.id && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${mood.bgGradient} opacity-60`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                  />
                )}
                <div className={`relative z-10 ${selectedMood === mood.id ? mood.textColor : "text-muted-foreground"} mb-3`}>
                  {mood.icon}
                </div>
                <div className="relative z-10">
                  <p className={`font-semibold ${selectedMood === mood.id ? mood.textColor : ""}`}>{mood.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{mood.description}</p>
                </div>
                {selectedMood === mood.id && (
                  <motion.div
                    className={`absolute bottom-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br ${mood.gradient} flex items-center justify-center`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedMood && (
              <motion.div
                key={selectedMood}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {(selectedMood === "anxious" || selectedMood === "overwhelmed") && (
                  <div className="mb-8 text-center">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Take a moment to breathe</p>
                    <BreathingCircle />
                  </div>
                )}

                {needsChat ? (
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl glass-card border border-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                          <Brain size={22} />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Your AI is here</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            You don't have to navigate this alone. MindEase AI is ready to listen, ask thoughtful questions, and help you find your footing.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["Safe Space", "Empathetic Listening", "Guided Support"].map((card, i) => (
                        <div key={card} className="p-4 rounded-xl bg-card border border-border text-center">
                          <p className="text-sm font-medium">{card}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {["Your privacy is protected.", "AI that responds to your tone.", "Gentle, adaptive guidance."][i]}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="text-center pt-4">
                      <Link href="/chat">
                        <Button
                          size="lg"
                          className="rounded-full px-10 bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2"
                          data-testid="button-start-session"
                        >
                          Start Your Session <ChevronRight size={18} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : selectedMood === "happy" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {happyContent.map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
                      >
                        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${item.color} w-fit mb-3`}>
                          <item.icon size={18} className="text-white" />
                        </div>
                        <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </motion.div>
                    ))}
                    <div className="md:col-span-2 text-center pt-4">
                      <Link href="/chat">
                        <Button variant="outline" className="rounded-full px-8 gap-2" data-testid="button-chat-happy">
                          Share your joy with AI <ChevronRight size={16} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {neutralContent.map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
                      >
                        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${item.color} w-fit mb-3`}>
                          <item.icon size={18} className="text-white" />
                        </div>
                        <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </motion.div>
                    ))}
                    <div className="md:col-span-2 text-center pt-4">
                      <Link href="/dashboard">
                        <Button className="rounded-full px-8 gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90" data-testid="button-view-dashboard">
                          View Your Wellness Dashboard <ChevronRight size={16} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </PageTransition>
  );
}

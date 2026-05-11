import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, Wind, Heart, ChevronRight, BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  ts: number;
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", role: "ai", text: "Hello, I'm MANAS. I'm really glad you're here. How are you doing today?", ts: Date.now() - 120000 },
  { id: "2", role: "user", text: "I've been feeling pretty stressed lately with work and everything.", ts: Date.now() - 90000 },
  { id: "3", role: "ai", text: "I hear you — that kind of sustained stress can feel heavy. Can you tell me a bit more about what's been weighing on you most? Work deadlines, people, or something else?", ts: Date.now() - 60000 },
  { id: "4", role: "user", text: "Mostly deadlines. I can't seem to switch off even at night.", ts: Date.now() - 30000 },
  { id: "5", role: "ai", text: "That's really common, and it's worth taking seriously. When the mind can't rest, even sleep stops being restorative. Let's work through this together — I'll suggest some grounding techniques, and we can explore what might be driving that mental loop. Does that sound okay?", ts: Date.now() - 10000 },
];

const AI_RESPONSES = [
  "That's a really important thing to notice. Can you tell me more about when you first started feeling this way?",
  "I appreciate you sharing that. It takes courage to look at these feelings honestly. What does a typical day look like for you right now?",
  "It sounds like you've been carrying a lot. Remember, you don't have to figure everything out at once. What's one small thing that brought you peace recently?",
  "That makes a lot of sense. Your nervous system is trying to protect you — but it's working overtime. Let's try to help it settle a little.",
  "Thank you for trusting me with that. I want you to know: feeling this way doesn't mean something is permanently wrong. Emotions are data, not destiny.",
  "I notice you're being quite hard on yourself. What would you say to a close friend who was feeling what you're feeling?",
];


const supportCards = [
  { text: "You are not your thoughts. You are the observer of them.", color: "from-primary/20 to-secondary/10" },
  { text: "This too shall pass. You've gotten through hard days before.", color: "from-accent/20 to-primary/10" },
  { text: "Rest is not giving up. Rest is how you keep going.", color: "from-secondary/20 to-accent/10" },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
        <Brain size={14} className="text-white" />
      </div>
      <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BreathingWidget() {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  useEffect(() => {
    const phases: ("in" | "hold" | "out")[] = ["in", "hold", "out"];
    const durations = [4000, 2000, 4000];
    let idx = 0;
    const cycle = () => {
      setPhase(phases[idx]);
      idx = (idx + 1) % 3;
    };
    const timers: ReturnType<typeof setTimeout>[] = [];
    const runCycle = () => {
      cycle();
      let d = 0;
      durations.forEach((dur, i) => {
        d += dur;
        timers.push(setTimeout(runCycle, d));
      });
    };
    // simplified: just cycle every 3.5s
    const interval = setInterval(() => {
      idx = (idx + 1) % 3;
      setPhase(phases[idx]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const labels = { in: "Breathe In", hold: "Hold", out: "Breathe Out" };
  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative flex items-center justify-center mb-3">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-cyan-400/30"
            animate={{ scale: phase === "in" ? 1 + i * 0.3 : phase === "out" ? 1 : 1 + i * 0.15 }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
            style={{ width: 52 + i * 24, height: 52 + i * 24 }}
          />
        ))}
        <motion.div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center shadow-md shadow-cyan-400/30"
          animate={{ scale: phase === "in" ? 1.2 : phase === "out" ? 0.9 : 1.05 }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
        >
          <Wind size={20} className="text-white" />
        </motion.div>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{labels[phase]}</p>
    </div>
  );
}


export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const responseIdx = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const aiText = AI_RESPONSES[responseIdx.current % AI_RESPONSES.length];
      responseIdx.current++;
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", text: aiText, ts: Date.now() };
      setMessages((m) => [...m, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden relative">
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20 pointer-events-none"
            style={{ left: `${10 + (i * 7.5) % 80}%`, top: `${15 + (i * 8.3) % 70}%` }}
            animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -15, 0] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        {/* Main chat area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">MANAS</p>
                <p className="text-xs text-muted-foreground">Your wellness companion</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 ml-1 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5" data-testid="button-view-dashboard">
                  <BarChart2 size={13} /> View Dashboard
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-xs"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="button-toggle-sidebar"
              >
                {sidebarOpen ? "Hide Tools" : "Show Tools"}
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""} mb-4`}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Brain size={14} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "ai"
                        ? "glass-card rounded-bl-sm text-foreground"
                        : "bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm shadow-md shadow-primary/20"
                    }`}
                    data-testid={`message-${msg.role}-${msg.id}`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Share how you're feeling..."
                  className="w-full rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
                  data-testid="input-chat-message"
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="rounded-full w-11 h-11 p-0 bg-gradient-to-br from-primary to-secondary hover:opacity-90 transition-opacity shadow-md shadow-primary/20 flex items-center justify-center"
                data-testid="button-send-message"
              >
                <Send size={16} className="text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 overflow-hidden border-l border-border bg-card/60 backdrop-blur-sm"
            >
              <div className="w-[260px] p-4 space-y-4 h-full overflow-y-auto">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Breathing Exercise</p>
                  <div className="rounded-xl bg-background/50 border border-border">
                    <BreathingWidget />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Support Cards</p>
                  <div className="space-y-2">
                    {supportCards.map((card, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-3 rounded-xl bg-gradient-to-br ${card.color} border border-white/10`}
                      >
                        <div className="flex items-start gap-2">
                          <Heart size={12} className="text-accent mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground/80 leading-relaxed italic">{card.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

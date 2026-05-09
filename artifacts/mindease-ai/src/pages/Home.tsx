import { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import {
  Brain, Sparkles, Shield, TrendingUp, MessageCircle, Users,
  ChevronDown, Star, CheckCircle, Zap, Heart, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const FloatingBlob = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
    animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  />
);

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const features = [
  { icon: Brain, title: "Emotionally Adaptive AI", desc: "Our AI understands your emotional context and adjusts its approach in real time.", color: "text-primary" },
  { icon: Shield, title: "Private & Secure", desc: "Your conversations and data are encrypted and never shared with third parties.", color: "text-secondary" },
  { icon: TrendingUp, title: "Wellness Analytics", desc: "Track emotional patterns over time with beautiful, insightful dashboards.", color: "text-accent" },
  { icon: MessageCircle, title: "24/7 AI Support", desc: "Access compassionate AI guidance whenever you need it, day or night.", color: "text-primary" },
  { icon: Users, title: "Expert Connections", desc: "Connect with vetted mental health professionals for deeper support.", color: "text-secondary" },
  { icon: Activity, title: "Mood Tracking", desc: "Simple, daily check-ins that build a picture of your emotional wellbeing.", color: "text-accent" },
];

const steps = [
  { step: "01", title: "Check In Daily", desc: "Share how you're feeling with a quick, intuitive mood check-in.", icon: Heart },
  { step: "02", title: "Talk to Your AI", desc: "Have a meaningful conversation with your emotionally intelligent AI companion.", icon: MessageCircle },
  { step: "03", title: "Gain Insights", desc: "Discover patterns and receive personalized wellness recommendations.", icon: Sparkles },
];

const testimonials = [
  { name: "Priya Mehta", role: "Graduate Student", text: "MindEase has been a game changer for managing exam anxiety. The breathing exercises and AI chat are incredibly calming.", stars: 5 },
  { name: "Arjun Sharma", role: "Software Engineer", text: "I love how the interface adapts to my mood. It genuinely feels like talking to someone who understands.", stars: 5 },
  { name: "Sneha Reddy", role: "Healthcare Professional", text: "As someone who helps others with mental health, I appreciate how thoughtfully this platform has been built.", stars: 5 },
];

const faqs = [
  { q: "Is MindEase AI a replacement for therapy?", a: "No. MindEase AI is a wellness support tool designed to complement — not replace — professional mental healthcare. For serious concerns, we encourage you to connect with a licensed therapist." },
  { q: "How is my data kept private?", a: "All conversations are encrypted end-to-end. We never sell your data or share it with advertisers. You can delete your data at any time." },
  { q: "How does the emotion-adaptive AI work?", a: "Our AI analyzes the emotional tone of your messages and adjusts its communication style, response depth, and wellness suggestions to match your current state." },
  { q: "Can I connect with a real therapist?", a: "Yes. Our Experts page connects you with vetted mental wellness professionals, including online and offline options with flexible pricing." },
  { q: "Is MindEase AI free to use?", a: "Core features including mood tracking and AI chat are free. Premium features like in-depth analytics and expert sessions have affordable plans." },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-6 text-center">
        <FloatingBlob className="w-96 h-96 bg-primary top-10 -left-20" />
        <FloatingBlob className="w-80 h-80 bg-secondary top-20 right-0" />
        <FloatingBlob className="w-64 h-64 bg-accent bottom-20 left-1/3" />

        {/* Particle dots */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{ left: `${5 + (i * 4.7) % 90}%`, top: `${10 + (i * 7.3) % 80}%` }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary mb-8"
          >
            <Sparkles size={14} />
            <span>AI-Powered Mental Wellness</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-semibold leading-tight tracking-tight mb-6 bg-gradient-to-br from-foreground via-primary to-secondary bg-clip-text text-transparent">
            Your Mental Wellness Companion
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered emotional support, wellness insights, and adaptive mental health guidance — whenever you need it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mood">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-base font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                data-testid="button-start-checkin"
              >
                Start Your Check-In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base font-medium border-border hover:bg-primary/5 transition-colors"
                data-testid="button-explore-tools"
              >
                Explore Wellness Tools
              </Button>
            </Link>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-16 text-muted-foreground/60"
          >
            <ChevronDown size={24} className="mx-auto" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <FadeInSection>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Simple Process</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">How It Works</h2>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <FadeInSection key={step.step} delay={i * 0.15}>
                <div className="relative p-8 rounded-2xl glass-card group hover:scale-[1.02] transition-transform duration-300">
                  <div className="text-5xl font-bold text-primary/10 mb-4">{step.step}</div>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <FadeInSection>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-3">What We Offer</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Emotional Wellness Features</h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                A thoughtfully designed toolkit for your mental wellbeing journey.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 0.1}>
                <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                  <div className={`p-3 rounded-xl bg-primary/5 w-fit mb-4 group-hover:bg-primary/10 transition-colors ${f.color}`}>
                    <f.icon size={22} />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Support Banner */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <FadeInSection>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 border border-primary/20 p-10 md:p-16 text-center">
              <FloatingBlob className="w-64 h-64 bg-primary -top-10 -right-10 opacity-20" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur border border-white/30 px-4 py-1.5 text-sm mb-6">
                  <Zap size={14} className="text-primary" />
                  <span>AI-Powered Adaptive Support</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
                  An AI that truly listens
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                  MindEase adapts to your emotional state in real time — changing its tone, pacing, and guidance based on how you're actually feeling, not how it assumes you should feel.
                </p>
                <Link href="/chat">
                  <Button
                    size="lg"
                    className="rounded-full px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                    data-testid="button-talk-to-ai"
                  >
                    Talk to MindEase AI
                  </Button>
                </Link>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <FadeInSection>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-accent uppercase tracking-widest mb-3">Real Stories</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">What People Are Saying</h2>
            </div>
          </FadeInSection>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 0.12}>
                <div className="p-6 rounded-2xl glass-card h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic mb-6">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Insights */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeInSection>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">For Professionals</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">Doctor Insights Portal</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Mental health professionals get a dedicated dashboard to track patient progress, review session summaries, and access AI-generated insights about emotional trends.
              </p>
              <ul className="space-y-3 mb-8">
                {["Patient emotional timeline tracking", "AI-generated session insights", "Progress trend analytics", "Secure session summaries"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle size={16} className="text-secondary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/doctor">
                <Button variant="outline" className="rounded-full px-6" data-testid="button-doctor-portal">
                  Access Doctor Portal
                </Button>
              </Link>
            </FadeInSection>
            <FadeInSection delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border p-8">
                  <div className="space-y-4">
                    {["Emotional Stability", "Stress Management", "Sleep Quality", "Social Connection"].map((metric, idx) => (
                      <div key={metric}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{metric}</span>
                          <span className="font-medium">{[78, 62, 55, 84][idx]}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            initial={{ width: 0 }}
                            animate={{ width: `${[78, 62, 55, 84][idx]}%` }}
                            transition={{ duration: 1, delay: idx * 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <FadeInSection>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Common Questions</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Frequently Asked Questions</h2>
            </div>
          </FadeInSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeInSection key={i} delay={i * 0.07}>
                <div
                  className="rounded-2xl bg-card border border-border overflow-hidden cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-item-${i}`}
                >
                  <div className="flex items-center justify-between p-5">
                    <h3 className="font-medium text-sm pr-4">{faq.q}</h3>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown size={18} className="text-muted-foreground" />
                    </motion.div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

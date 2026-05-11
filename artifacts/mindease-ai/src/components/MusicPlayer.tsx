/**
 * MusicPlayer — Web Audio ambient engine
 * Plays automatically on first user interaction after mood selection.
 * No files, no accounts, no video — pure browser audio.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useMood, type MoodType } from "@/contexts/MoodContext";
import { useLocation } from "wouter";

const DEFAULT_VOL = 0.28;
const HIDDEN_PATHS = ["/dashboard", "/session-summary", "/doctor", "/org", "/experts", "/login", "/role-select"];

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private oscs: OscillatorNode[] = [];
  private lfos: OscillatorNode[] = [];
  private started = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.setValueAtTime(0, this.ctx.currentTime);
      this.master.connect(this.ctx.destination);
    }
  }

  async start(mood: NonNullable<MoodType>, vol = DEFAULT_VOL) {
    this.init();
    if (!this.ctx || !this.master) return;
    // Resume suspended context (required after user gesture)
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.stopAll();
    this.started = true;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0, now);
    this.master.gain.linearRampToValueAtTime(vol, now + 2.5);
    if (mood === "happy") this.buildHappy();
    else if (mood === "neutral") this.buildNeutral();
    else this.buildSad();
  }

  private tone(freq: number, gain: number, delay = 0, filterHz = 900, vRate = 0.2, vDepth = 0.003) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    const f   = this.ctx.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    f.type = "lowpass";
    f.frequency.setValueAtTime(filterHz, this.ctx.currentTime);
    f.Q.setValueAtTime(0.7, this.ctx.currentTime);
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + delay + 2);
    const lfo = this.ctx.createOscillator();
    const lg  = this.ctx.createGain();
    lfo.frequency.setValueAtTime(vRate, this.ctx.currentTime);
    lg.gain.setValueAtTime(freq * vDepth, this.ctx.currentTime);
    lfo.connect(lg); lg.connect(osc.frequency);
    lfo.start(this.ctx.currentTime + delay);
    this.lfos.push(lfo);
    osc.connect(f); f.connect(g); g.connect(this.master);
    osc.start(this.ctx.currentTime + delay);
    this.oscs.push(osc);
  }

  private buildHappy() {
    this.tone(130.8, 0.16, 0,   400,  0.10, 0.002);
    this.tone(261.6, 0.20, 0,   1400, 0.20, 0.003);
    this.tone(329.6, 0.18, 0.3, 1600, 0.15, 0.003);
    this.tone(392.0, 0.16, 0.6, 1800, 0.18, 0.003);
    this.tone(440.0, 0.14, 1.0, 2200, 0.30, 0.004);
    this.tone(523.3, 0.12, 1.4, 2800, 0.35, 0.004);
    this.tone(659.3, 0.07, 1.8, 3500, 0.40, 0.005);
  }

  private buildNeutral() {
    this.tone(146.8, 0.17, 0,   350,  0.08, 0.002);
    this.tone(293.7, 0.18, 0.2, 900,  0.20, 0.003);
    this.tone(392.0, 0.15, 0.5, 1000, 0.18, 0.003);
    this.tone(440.0, 0.14, 0.8, 1100, 0.22, 0.003);
    this.tone(587.3, 0.10, 1.2, 1600, 0.30, 0.004);
    this.tone(880.0, 0.05, 1.5, 2000, 0.25, 0.005);
  }

  private buildSad() {
    this.tone(110.0, 0.16, 0,   300,  0.06, 0.002);
    this.tone(220.0, 0.20, 0.4, 600,  0.12, 0.003);
    this.tone(261.6, 0.18, 0.8, 700,  0.14, 0.003);
    this.tone(329.6, 0.16, 1.2, 800,  0.16, 0.003);
    this.tone(392.0, 0.12, 1.6, 900,  0.18, 0.003);
    this.tone(659.3, 0.07, 2.0, 1200, 0.20, 0.005);
  }

  setVolume(vol: number) {
    if (!this.master || !this.ctx) return;
    this.master.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.4);
  }

  fadeOut(dur = 1.8) {
    if (!this.master || !this.ctx) return;
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);
  }

  isStarted() { return this.started; }

  private stopAll() {
    this.oscs.forEach(o => { try { o.stop(); } catch (_) {} });
    this.lfos.forEach(l => { try { l.stop(); } catch (_) {} });
    this.oscs = []; this.lfos = [];
    this.started = false;
  }
}

const engine = new AmbientEngine();

const MOOD_CFG: Record<string, { label: string; gradient: string; glow: string; accent: string; emoji: string }> = {
  happy:   { label: "Uplifting Vibes",  gradient: "linear-gradient(135deg,#fbbf24,#fb923c)", glow: "rgba(251,191,36,0.4)",  accent: "#f97316", emoji: "😊" },
  neutral: { label: "Focus Ambient",    gradient: "linear-gradient(135deg,#38bdf8,#34d399)", glow: "rgba(56,189,248,0.35)", accent: "#0ea5e9", emoji: "😐" },
  sad:     { label: "Soothing Calm",    gradient: "linear-gradient(135deg,#818cf8,#93c5fd)", glow: "rgba(129,140,248,0.4)", accent: "#6366f1", emoji: "😔" },
};

export default function MusicPlayer() {
  const { mood } = useMood();
  const [location] = useLocation();
  const [playing, setPlaying]     = useState(false);
  const [muted, setMuted]         = useState(false);
  const [volume, setVolume]       = useState(DEFAULT_VOL);
  const [showSlider, setShowSlider] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const prevMood = useRef<MoodType>(null);
  const pendingMood = useRef<NonNullable<MoodType> | null>(null);

  const isHidden = HIDDEN_PATHS.some(p => location === p) || location.startsWith("/workshop");

  // When mood changes, try to start audio
  useEffect(() => {
    if (!mood || isHidden) return;
    if (mood !== prevMood.current) {
      prevMood.current = mood;
      pendingMood.current = mood;
      // Try to start — if AudioContext is suspended, show tap prompt
      engine.start(mood, muted ? 0 : volume)
        .then(() => { setPlaying(true); setNeedsGesture(false); })
        .catch(() => { setNeedsGesture(true); });
    }
  }, [mood, isHidden]);

  // Stop on hidden pages
  useEffect(() => {
    if (isHidden && playing) { engine.fadeOut(); setPlaying(false); }
  }, [isHidden]);

  // Handle tap-to-start (needed when browser blocks autoplay)
  async function handleGestureTap() {
    const m = pendingMood.current || mood;
    if (!m) return;
    await engine.start(m as NonNullable<MoodType>, muted ? 0 : volume);
    setPlaying(true);
    setNeedsGesture(false);
  }

  const togglePlay = useCallback(async () => {
    if (playing) { engine.fadeOut(); setPlaying(false); }
    else if (mood) {
      await engine.start(mood, muted ? 0 : volume);
      setPlaying(true);
    }
  }, [playing, mood, muted, volume]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    engine.setVolume(next ? 0 : volume);
  }, [muted, volume]);

  const handleVol = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (!muted && playing) engine.setVolume(v);
  }, [muted, playing]);

  if (!mood || isHidden) return null;
  const cfg = MOOD_CFG[mood];
  if (!cfg) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={`player-${mood}`}
        initial={{ opacity: 0, y: 36, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 36, scale: 0.88 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 50 }}
      >
        <div style={{
          background: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRadius: 50,
          border: `1px solid ${cfg.accent}35`,
          boxShadow: `0 8px 32px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.07)`,
          display: "flex", alignItems: "center", gap: "0.55rem",
          padding: "0.5rem 0.85rem 0.5rem 0.6rem",
        }}>

          {/* Pulsing orb — tap to start if gesture needed */}
          <div style={{ position: "relative", flexShrink: 0 }} onClick={needsGesture ? handleGestureTap : undefined}>
            <motion.div
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: cfg.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 14px ${cfg.glow}`,
                cursor: needsGesture ? "pointer" : "default",
              }}
              animate={playing ? { scale: [1, 1.09, 1] } : { scale: 1 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Music2 size={16} color="white" />
            </motion.div>
            {playing && (
              <motion.div
                style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${cfg.accent}` }}
                animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </div>

          {/* Label */}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.74rem", fontWeight: 700, color: "#111827", lineHeight: 1.2, whiteSpace: "nowrap" }}>
              {cfg.emoji} {cfg.label}
            </p>
            <AnimatePresence mode="wait">
              {showSlider ? (
                <motion.div key="slider" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 90 }} exit={{ opacity: 0, width: 0 }} style={{ overflow: "hidden", marginTop: 4 }}>
                  <input type="range" min={0} max={0.45} step={0.01}
                    value={muted ? 0 : volume} onChange={handleVol}
                    style={{ width: 90, height: 3, accentColor: cfg.accent, cursor: "pointer" }} />
                </motion.div>
              ) : (
                <motion.p key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: "0.67rem", color: "#6b7280", marginTop: 2, whiteSpace: "nowrap" }}>
                  {needsGesture ? "▶ Tap to play" : playing ? "♪ Playing..." : "Paused"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <button onClick={needsGesture ? handleGestureTap : togglePlay}
              style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
              {playing ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button onClick={toggleMute}
              style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <button onClick={() => setShowSlider(v => !v)}
              style={{ width: 22, height: 22, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: showSlider ? "#374151" : "#9ca3af" }}>
              ≡
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

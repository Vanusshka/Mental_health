import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useMood, MoodType } from "@/contexts/MoodContext";

// Default volume: 0.08 (~25% — subtle and atmospheric)
const DEFAULT_VOL = 0.08;

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfos: OscillatorNode[] = [];

  private init() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  async start(mood: NonNullable<MoodType>, volume = DEFAULT_VOL) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.stopAll();

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    // Gentle 3s fade-in
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 3);

    if (mood === "happy") this.buildHappy();
    else if (mood === "neutral") this.buildNeutral();
    else this.buildSad();
  }

  // Adds a sine oscillator with optional slow LFO vibrato, routed through a warm lowpass filter
  private addTone(
    freq: number,
    gainAmt: number,
    startDelay = 0,
    filterHz = 800,
    vibratoRate = 0.25,
    vibratoDepth = 0.004
  ) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterHz, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainAmt, this.ctx.currentTime + startDelay + 2.5);

    // Slow natural vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(vibratoRate, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(freq * vibratoDepth, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(this.ctx.currentTime + startDelay);
    this.lfos.push(lfo);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime + startDelay);
    this.oscillators.push(osc);
  }

  // --- 😊 HAPPY: Bright C major pentatonic — uplifting lo-fi feel ---
  private buildHappy() {
    // Root chord: C major (C4, E4, G4) — warm and uplifting
    this.addTone(261.6, 0.12, 0, 1400, 0.2, 0.003);   // C4
    this.addTone(329.6, 0.10, 0.3, 1600, 0.15, 0.003); // E4
    this.addTone(392.0, 0.09, 0.6, 1800, 0.18, 0.003); // G4
    // Upper melody: A4, C5 — cheerful brightness
    this.addTone(440.0, 0.07, 1.0, 2200, 0.3, 0.004);  // A4
    this.addTone(523.3, 0.06, 1.4, 2800, 0.35, 0.004); // C5
    // Warm bass: C3 — grounded feel-good energy
    this.addTone(130.8, 0.08, 0, 400, 0.1, 0.002);     // C3 sub
    // Soft shimmer: E5 — light and airy
    this.addTone(659.3, 0.03, 1.8, 3500, 0.4, 0.006);  // E5
  }

  // --- 😐 NEUTRAL: D pentatonic — calm ambient focus music ---
  private buildNeutral() {
    // Foundation: D3 drone — centered and stable
    this.addTone(146.8, 0.09, 0, 350, 0.08, 0.002);    // D3 deep drone
    // Mid layer: D4, G4, A4 — balanced and peaceful
    this.addTone(293.7, 0.10, 0.2, 900, 0.2, 0.003);   // D4
    this.addTone(392.0, 0.08, 0.5, 1000, 0.18, 0.003); // G4
    this.addTone(440.0, 0.07, 0.8, 1100, 0.22, 0.003); // A4
    // Soft upper layer: D5 — clarity and mental space
    this.addTone(587.3, 0.04, 1.2, 1600, 0.3, 0.004);  // D5
    // Subtle overtone: A5 — atmospheric texture
    this.addTone(880.0, 0.02, 1.5, 2000, 0.25, 0.005); // A5 whisper
  }

  // --- 😔 SAD: A minor — emotional piano / ambient calming ---
  private buildSad() {
    // Deep foundation: A2 — safe and grounding
    this.addTone(110.0, 0.08, 0, 300, 0.06, 0.002);    // A2 sub bass
    // A minor chord: A3, C4, E4 — emotionally supportive, not dark
    this.addTone(220.0, 0.11, 0.4, 600, 0.12, 0.003);  // A3
    this.addTone(261.6, 0.10, 0.8, 700, 0.14, 0.003);  // C4
    this.addTone(329.6, 0.09, 1.2, 800, 0.16, 0.003);  // E4
    // Soft G4 — adds warmth to minor (not too dark)
    this.addTone(392.0, 0.06, 1.6, 900, 0.18, 0.003);  // G4
    // High longing note: E5 — gentle emotional release
    this.addTone(659.3, 0.03, 2.0, 1200, 0.2, 0.005);  // E5
  }

  setVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.5);
  }

  fadeOut() {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
  }

  private stopAll() {
    this.oscillators.forEach((o) => { try { o.stop(); } catch (_) {} });
    this.lfos.forEach((l) => { try { l.stop(); } catch (_) {} });
    this.oscillators = [];
    this.lfos = [];
  }
}

const engine = new AmbientAudioEngine();

export default function MusicPlayer() {
  const { mood, theme } = useMood();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOL);
  const [showVolume, setShowVolume] = useState(false);
  const prevMood = useRef<MoodType>(null);

  useEffect(() => {
    if (mood && mood !== prevMood.current) {
      prevMood.current = mood;
      engine.start(mood, muted ? 0 : volume);
      setPlaying(true);
    }
  }, [mood, muted, volume]);

  const togglePlay = useCallback(() => {
    if (playing) {
      engine.fadeOut();
      setPlaying(false);
    } else {
      engine.setVolume(muted ? 0 : volume);
      setPlaying(true);
    }
  }, [playing, muted, volume]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    engine.setVolume(next ? 0 : volume);
  }, [muted, volume]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      setVolume(v);
      if (!muted && playing) engine.setVolume(v);
    },
    [muted, playing]
  );

  const moodLabels: Record<string, string> = {
    happy: "Uplifting Vibes",
    neutral: "Focus Ambient",
    sad: "Soothing Calm",
  };

  if (!mood) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="music-player"
        initial={{ opacity: 0, y: 30, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.85 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div
          className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl"
          style={{
            borderColor: theme ? `${theme.accent}22` : undefined,
            boxShadow: theme
              ? `0 8px 32px ${theme.glow}, 0 2px 8px rgba(0,0,0,0.06)`
              : undefined,
          }}
        >
          {/* Animated mood orb */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: theme
                  ? `linear-gradient(135deg, ${theme.particle1}, ${theme.accent})`
                  : "linear-gradient(135deg, #818cf8, #6366f1)",
              }}
              animate={playing ? { scale: [1, 1.07, 1] } : {}}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Music2 size={15} className="text-white" />
            </motion.div>
            {playing && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${theme?.particle1 || "#818cf8"}` }}
                animate={{ scale: [1, 1.75], opacity: [0.55, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </div>

          {/* Label + volume slider */}
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-none truncate">
              {theme?.emoji} {mood ? moodLabels[mood] : ""}
            </p>
            <AnimatePresence mode="wait">
              {showVolume ? (
                <motion.div
                  key="slider"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 80 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="mt-1.5 overflow-hidden"
                >
                  <input
                    type="range"
                    min={0}
                    max={0.3}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 accent-current cursor-pointer"
                    style={{ accentColor: theme?.accent ?? "#6366f1" }}
                  />
                </motion.div>
              ) : (
                <motion.p
                  key="label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-muted-foreground mt-0.5"
                >
                  {playing ? "♪ Ambient playing..." : "Paused"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/8 dark:hover:bg-white/10 transition-colors"
              title={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/8 dark:hover:bg-white/10 transition-colors"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
            <button
              onClick={() => setShowVolume((v) => !v)}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
                showVolume
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Adjust volume"
            >
              ≡
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

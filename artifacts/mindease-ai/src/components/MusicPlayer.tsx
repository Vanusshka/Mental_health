import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useMood, MoodType } from "@/contexts/MoodContext";

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];

  private init() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  async start(mood: NonNullable<MoodType>, volume = 0.18) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.stopOscillators();

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 2.5);

    if (mood === "happy") this.buildHappy();
    else if (mood === "neutral") this.buildNeutral();
    else this.buildSad();
  }

  private addNote(
    freq: number,
    type: OscillatorType,
    gainAmt: number,
    startDelay = 0,
    filterFreq = 900
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainAmt, this.ctx.currentTime + startDelay + 2);

    // Slow vibrato on some notes
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.3, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(freq * 0.005, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(this.ctx.currentTime + startDelay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime + startDelay);

    this.oscillators.push({ osc, gain });
  }

  private buildHappy() {
    // C major pentatonic: C4, E4, G4, A4, C5
    const notes = [261.6, 329.6, 392, 440, 523.3, 659.3];
    notes.forEach((f, i) => {
      this.addNote(f, "sine", 0.07, i * 0.25, 1200);
      this.addNote(f * 2, "sine", 0.018, i * 0.25 + 0.1, 2000);
    });
    // Bright shimmer overtones
    this.addNote(1046.5, "sine", 0.012, 1, 3000);
    this.addNote(1318.5, "sine", 0.008, 1.5, 3000);
  }

  private buildNeutral() {
    // Pentatonic D: D4, F#4, G4, A4, C5
    const notes = [293.7, 370, 392, 440, 523.3];
    notes.forEach((f, i) => {
      this.addNote(f, "sine", 0.06, i * 0.4, 900);
      this.addNote(f * 0.5, "sine", 0.025, i * 0.4, 500); // sub octave
    });
    // Soft drone bass
    this.addNote(146.8, "sine", 0.04, 0, 400);
  }

  private buildSad() {
    // A minor: A3, C4, E4, G4
    const notes = [220, 261.6, 329.6, 392];
    notes.forEach((f, i) => {
      this.addNote(f, "sine", 0.07, i * 0.6, 700);
      this.addNote(f * 0.5, "sine", 0.02, i * 0.6, 350);
    });
    // High longing note
    this.addNote(659.3, "sine", 0.022, 2, 1000);
    // Deep sub bass
    this.addNote(110, "sine", 0.03, 0, 300);
  }

  setVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.4);
  }

  fadeOut() {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
  }

  private stopOscillators() {
    this.oscillators.forEach(({ osc }) => {
      try { osc.stop(); } catch (_) {}
    });
    this.oscillators = [];
  }
}

const engine = new AmbientAudioEngine();

export default function MusicPlayer() {
  const { mood, theme } = useMood();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const prevMood = useRef<MoodType>(null);

  useEffect(() => {
    if (mood && mood !== prevMood.current) {
      prevMood.current = mood;
      engine.start(mood, muted ? 0 : 0.18);
      setPlaying(true);
    }
  }, [mood, muted]);

  const togglePlay = useCallback(() => {
    if (playing) {
      engine.fadeOut();
      setPlaying(false);
    } else {
      engine.setVolume(muted ? 0 : 0.18);
      setPlaying(true);
    }
  }, [playing, muted]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    engine.setVolume(next ? 0 : 0.18);
  }, [muted]);

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
            borderColor: theme ? `${theme.accent}25` : undefined,
            boxShadow: theme ? `0 8px 32px ${theme.glow}` : undefined,
          }}
        >
          {/* Animated orb */}
          <div className="relative">
            <motion.div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: theme
                  ? `linear-gradient(135deg, ${theme.particle1}, ${theme.accent})`
                  : "linear-gradient(135deg, #818cf8, #6366f1)",
              }}
              animate={playing ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Music2 size={15} className="text-white" />
            </motion.div>
            {playing && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${theme?.particle1 || "#818cf8"}` }}
                animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </div>

          {/* Label */}
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-none truncate">
              {theme?.emoji} {theme?.name} Vibes
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {playing ? "♪ Playing..." : "Paused"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/8 dark:hover:bg-white/10 transition-colors"
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/8 dark:hover:bg-white/10 transition-colors"
            >
              {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

/**
 * Procedural Web Audio API Sound Synthesizer for NASA Mission Control UI
 * 100% Royalty-Free, CC0 Unencumbered, Commercial Ready, Zero External Assets
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioMuted(): boolean {
  return isMuted;
}

export function setAudioMuted(muted: boolean): void {
  isMuted = muted;
  if (typeof window !== "undefined") {
    localStorage.setItem("impactiq_audio_muted", muted ? "true" : "false");
  }
}

export function initAudioState(): boolean {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("impactiq_audio_muted");
    if (saved !== null) {
      isMuted = saved === "true";
    }
  }
  return isMuted;
}

/**
 * 1. Telemetry Click / UI Quindar Chirp (Subtle, crisp, high-tech)
 */
export function playTelemetryClick(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

/**
 * 2. Deep Space Radar Ping (Decaying resonant pulse for target selection / lock)
 */
export function playRadarPing(freq = 920): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.35);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.35);
}

/**
 * 3. Astrodynamic Computation Sweep (Ascending frequency data assimilation)
 */
export function playComputationSweep(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.45);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.exponentialRampToValueAtTime(2400, now + 0.45);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.45);
}

/**
 * 4. Granite Guardian Verified Chime (Harmonic confirmation dual-tone)
 */
export function playGuardianVerified(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Tone 1: C5 (523.25 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(523.25, now);
  gain1.gain.setValueAtTime(0.08, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.25);

  // Tone 2: E5 (659.25 Hz)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(659.25, now + 0.12);
  gain2.gain.setValueAtTime(0.09, now + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.12);
  osc2.stop(now + 0.4);
}

/**
 * 5. Guardian Alert / Flagged Warning (Low double pulse)
 */
export function playGuardianAlert(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  [0, 0.12].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(240, now + offset);
    osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.1);

    gain.gain.setValueAtTime(0.14, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 0.1);
  });
}

/**
 * 6. Orbital Time Scrubber Tick (Pitch shifts with progress 0.0 - 1.0)
 */
export function playScrubberTick(progress: number): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const baseFreq = 400 + progress * 600;
  osc.type = "sine";
  osc.frequency.setValueAtTime(baseFreq, now);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.025);
}

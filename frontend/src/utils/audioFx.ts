"use client";

/**
 * Procedural Web Audio API Sound Synthesizer for NASA Mission Control UI
 * 100% Royalty-Free, Soothing Celestial Space Atmosphere, Zero External Assets
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

// Celestial Ambient Soundscape State
let ambientOscillators: OscillatorNode[] = [];
let ambientGainNode: GainNode | null = null;
let ambientFilterNode: BiquadFilterNode | null = null;
let isAmbientRunning = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  if (muted) {
    stopAmbientSpaceDrone();
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
 * 0. Soothing Celestial Deep Space Pad (Brian Eno / Interstellar Style)
 * Soft, pure sine-wave D-Major 9th chord (D3, A3, F#4, C#5) with a warm 450Hz low-pass filter and gentle 20s breathing swell.
 * 100% peaceful, relaxing, and pleasant to listen to.
 */
export function startAmbientSpaceDrone(): void {
  if (isMuted || isAmbientRunning) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Warm Low-Pass Filter to eliminate all harsh highs (buttery smooth sound)
    ambientFilterNode = ctx.createBiquadFilter();
    ambientFilterNode.type = "lowpass";
    ambientFilterNode.frequency.setValueAtTime(450, now);
    ambientFilterNode.Q.setValueAtTime(1.0, now);

    // 2. Master Ambient Gain with very gentle level and smooth 4s fade-in
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(0.0001, now);
    ambientGainNode.gain.exponentialRampToValueAtTime(0.018, now + 4.0); // Gentle, subtle, relaxing volume

    ambientFilterNode.connect(ambientGainNode);
    ambientGainNode.connect(ctx.destination);

    // 3. Ethereal Celestial Chord Frequencies (Pure Sine Waves Only)
    // D3 (146.83 Hz), A3 (220.00 Hz), F#4 (369.99 Hz), C#5 (554.37 Hz)
    const chordFrequencies = [146.83, 220.0, 369.99, 554.37];
    ambientOscillators = [];

    chordFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();

      osc.type = "sine"; // Pure, silky-smooth sine wave (no harsh harmonics)
      osc.frequency.setValueAtTime(freq, now);

      // Subtle detune for lush spatial chorus effect
      osc.detune.setValueAtTime((idx - 1.5) * 4, now);

      // Individual voice balance (higher notes slightly quieter)
      const level = idx === 0 ? 0.35 : idx === 1 ? 0.28 : idx === 2 ? 0.2 : 0.14;
      voiceGain.gain.setValueAtTime(level, now);

      // Slow, relaxing 18-second breathing LFO modulation per voice
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.055 + idx * 0.015, now); // ~18-second slow swell
      lfoGain.gain.setValueAtTime(0.06, now);

      lfo.connect(lfoGain);
      lfoGain.connect(voiceGain.gain);

      osc.connect(voiceGain);
      voiceGain.connect(ambientFilterNode!);

      osc.start(now);
      lfo.start(now);

      ambientOscillators.push(osc);
    });

    isAmbientRunning = true;
  } catch {
    // Graceful fallback
  }
}

export function stopAmbientSpaceDrone(): void {
  if (!isAmbientRunning || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    if (ambientGainNode) {
      ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, now);
      ambientGainNode.gain.exponentialRampToValueAtTime(0.00001, now + 2.5); // Smooth 2.5s fade out
    }
    setTimeout(() => {
      try {
        ambientOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        ambientOscillators = [];
        ambientFilterNode?.disconnect();
        ambientGainNode?.disconnect();
      } catch {}
      isAmbientRunning = false;
    }, 2500);
  } catch {
    isAmbientRunning = false;
  }
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

  gain.gain.setValueAtTime(0.05, now);
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

  gain.gain.setValueAtTime(0.09, now);
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

  osc.type = "sine";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.4);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(1800, now + 0.4);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.4);
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
  gain1.gain.setValueAtTime(0.07, now);
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
  gain2.gain.setValueAtTime(0.07, now + 0.12);
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

    osc.type = "sine";
    osc.frequency.setValueAtTime(240, now + offset);
    osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.1);

    gain.gain.setValueAtTime(0.09, now + offset);
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

  const baseFreq = 350 + progress * 450;
  osc.type = "sine";
  osc.frequency.setValueAtTime(baseFreq, now);

  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.025);
}

let lastSwooshTime = 0;

/**
 * 7. Cinematic Doppler Asteroid Flyby / Close Approach Swoosh
 * Dramatic, exciting pitch-curving air-rush swoosh (190Hz -> 680Hz -> 140Hz) with sub-bass impact body.
 */
export function playCloseApproachSwoosh(intensity = 1.0): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (now - lastSwooshTime < 0.35) return; // Prevent rapid stutter
  lastSwooshTime = now;

  try {
    // 1. Primary Doppler Sine Sweep & Resonant Filter
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.5);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.18);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.5);

    const maxGain = 0.12 * Math.min(1.5, Math.max(0.5, intensity));
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(maxGain, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);

    // 2. Secondary Sub-Bass Flyby Body
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(110, now + 0.06);
    subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.45);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.exponentialRampToValueAtTime(0.1 * Math.min(1.5, intensity), now + 0.18);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now + 0.06);
    subOsc.stop(now + 0.45);
  } catch {}
}

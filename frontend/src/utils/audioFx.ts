"use client";

/**
 * Procedural Web Audio API Sound Synthesizer for NASA Mission Control UI
 * 100% Royalty-Free, CC0 Unencumbered, Commercial Ready, Zero External Assets
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

// Ambient space drone state
let ambientDroneOsc1: OscillatorNode | null = null;
let ambientDroneOsc2: OscillatorNode | null = null;
let ambientDroneGain: GainNode | null = null;
let ambientNoiseNode: AudioBufferSourceNode | null = null;
let ambientNoiseFilter: BiquadFilterNode | null = null;
let isAmbientRunning = false;

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
  if (muted) {
    stopAmbientSpaceDrone();
  } else {
    startAmbientSpaceDrone();
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
 * 0. Cinematic Deep Space Ambient Drone & Telemetry Atmosphere
 * Generates an atmospheric sub-bass resonance (55Hz/110Hz) with cosmic solar wind bandpass filtering.
 */
export function startAmbientSpaceDrone(): void {
  if (isMuted || isAmbientRunning) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Master ambient gain
    ambientDroneGain = ctx.createGain();
    ambientDroneGain.gain.setValueAtTime(0.001, now);
    ambientDroneGain.gain.exponentialRampToValueAtTime(0.045, now + 3.0); // Gentle 3s fade in
    ambientDroneGain.connect(ctx.destination);

    // Sub-bass root drone (55 Hz - A1 note)
    ambientDroneOsc1 = ctx.createOscillator();
    ambientDroneOsc1.type = "sine";
    ambientDroneOsc1.frequency.setValueAtTime(55, now);

    // Harmonic fifth drone (82.5 Hz - E2 note) with subtle slow vibrato
    ambientDroneOsc2 = ctx.createOscillator();
    ambientDroneOsc2.type = "triangle";
    ambientDroneOsc2.frequency.setValueAtTime(82.5, now);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, now); // 0.12 Hz slow wave
    lfoGain.gain.setValueAtTime(1.5, now);
    lfo.connect(lfoGain);
    lfoGain.connect(ambientDroneOsc2.frequency);
    lfo.start(now);

    // Procedural Pink Noise / Cosmic Background Radiation Layer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.05) * 0.08;
    }

    ambientNoiseNode = ctx.createBufferSource();
    ambientNoiseNode.buffer = noiseBuffer;
    ambientNoiseNode.loop = true;

    // Resonant bandpass filter for cosmic wind sweep
    ambientNoiseFilter = ctx.createBiquadFilter();
    ambientNoiseFilter.type = "bandpass";
    ambientNoiseFilter.frequency.setValueAtTime(280, now);
    ambientNoiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.015, now);

    ambientNoiseNode.connect(ambientNoiseFilter);
    ambientNoiseFilter.connect(noiseGain);
    noiseGain.connect(ambientDroneGain);

    ambientDroneOsc1.connect(ambientDroneGain);
    ambientDroneOsc2.connect(ambientDroneGain);

    ambientDroneOsc1.start(now);
    ambientDroneOsc2.start(now);
    ambientNoiseNode.start(now);

    isAmbientRunning = true;
  } catch {
    // Ignore audio initialization edge cases
  }
}

export function stopAmbientSpaceDrone(): void {
  if (!isAmbientRunning || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    if (ambientDroneGain) {
      ambientDroneGain.gain.setValueAtTime(ambientDroneGain.gain.value, now);
      ambientDroneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5); // Smooth 1.5s fade out
    }
    setTimeout(() => {
      try {
        ambientDroneOsc1?.stop();
        ambientDroneOsc2?.stop();
        ambientNoiseNode?.stop();
        ambientDroneOsc1?.disconnect();
        ambientDroneOsc2?.disconnect();
        ambientNoiseNode?.disconnect();
      } catch {}
      isAmbientRunning = false;
    }, 1500);
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

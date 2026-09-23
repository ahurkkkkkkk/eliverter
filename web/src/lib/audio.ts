/**
 * Procedural sound engine. Every effect is synthesised at call time from
 * oscillators and filters - there are no audio files in this app, so the whole
 * soundtrack costs zero bytes and stays offline-capable on device.
 */

type Ctx = AudioContext & { webkitAudioContext?: never };

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let muted = false;

function ensure(): Ctx | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC() as Ctx;
    master = ctx.createGain();
    master.gain.value = 0.28;
    master.connect(ctx.destination);
  }
  return ctx;
}

/** Browsers keep audio asleep until a gesture; call this from the first tap. */
export function unlock(): void {
  const c = ensure();
  if (c && c.state === 'suspended') void c.resume();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(next ? 0 : 0.28, ctx.currentTime + 0.08);
  }
}

export function isMuted(): boolean {
  return muted;
}

interface SweepOptions {
  from: number;
  to: number;
  duration: number;
  type?: OscillatorType;
  peak?: number;
  resonance?: number;
  filterAt?: number;
}

function sweep({
  from,
  to,
  duration,
  type = 'sine',
  peak = 0.9,
  resonance = 0.8,
  filterAt,
}: SweepOptions): void {
  const c = ensure();
  if (!c || !master || muted) return;
  const t = c.currentTime;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + duration);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + duration * 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  let tail: AudioNode = gain;
  if (filterAt) {
    // A resonant lowpass tap gives the plop its watery body.
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterAt, t);
    filter.Q.value = resonance;
    gain.connect(filter);
    tail = filter;
  }

  osc.connect(gain);
  tail.connect(master);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** Micro rise under the cursor: 650 -> 900 Hz over 45 ms. */
export function bubbleHover(): void {
  sweep({ from: 650, to: 900, duration: 0.045, peak: 0.35 });
}

/** Water droplet landing: 500 -> 180 Hz with a resonant filter tap. */
export function filePlop(): void {
  sweep({ from: 500, to: 180, duration: 0.16, peak: 0.85, resonance: 6, filterAt: 900 });
}

/** Crisp candy pop when a format pill is chosen. */
export function formatPop(): void {
  sweep({ from: 420, to: 80, duration: 0.03, type: 'triangle', peak: 0.8, resonance: 12 });
}

const FANFARE = [1046.5, 1318.51, 1567.98, 2093.0]; // C6 E6 G6 C7

/** Rising arpeggio on completion, soft triangle waves with a touch of decay. */
export function completeFanfare(): void {
  const c = ensure();
  if (!c || !master || muted) return;
  FANFARE.forEach((freq, i) => {
    const t = c.currentTime + i * 0.11;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.55, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    osc.connect(gain);
    gain.connect(master!);
    osc.start(t);
    osc.stop(t + 0.36);
  });
}

/** Low descending blip for a failed job, deliberately gentle rather than harsh. */
export function sadBoop(): void {
  sweep({ from: 320, to: 120, duration: 0.22, type: 'sine', peak: 0.5, filterAt: 700 });
}

/* ============================================================
   SOUND ENGINE (Web Audio API, no audio files needed)
============================================================ */
let audioCtx: AudioContext | null = null;
let muted = false;
try { muted = localStorage.getItem('gns.mute') === '1'; } catch { /* ignore */ }

export const isMuted = () => muted;
export function setMuted(on: boolean) {
  muted = on;
  try { localStorage.setItem('gns.mute', muted ? '1' : '0'); } catch { /* ignore */ }
}

export function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

interface ToneOpts { type?: OscillatorType; slideTo?: number; volume?: number }

function tone(freq: number, startTime: number, duration: number, opts: ToneOpts = {}) {
  if (muted) return;
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type || 'sine';
  osc.frequency.setValueAtTime(freq, startTime);
  if (opts.slideTo) osc.frequency.linearRampToValueAtTime(opts.slideTo, startTime + duration);
  const peak = opts.volume !== undefined ? opts.volume : 0.2;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

// Every sound starts at "now"; the AudioContext throws before the first tap on some browsers.
function play(f: (t0: number) => void) {
  if (muted) return;
  try { f(getAudioCtx().currentTime); } catch { /* ignore */ }
}

export const playCorrect = () => play(t0 => {
  tone(523.25, t0, 0.12, { type: 'triangle' });
  tone(659.25, t0 + 0.1, 0.12, { type: 'triangle' });
  tone(783.99, t0 + 0.2, 0.22, { type: 'triangle' });
});
export const playWrong = () => play(t0 => tone(180, t0, 0.28, { type: 'sawtooth', slideTo: 90, volume: 0.18 }));
export const playWildcardSpin = () => play(t0 => {
  for (let i = 0; i < 6; i++) tone(300 + i * 60, t0 + i * 0.09, 0.08, { type: 'square', volume: 0.1 });
});
export const playWildcardReveal = () => play(t0 => {
  tone(392, t0, 0.15, { type: 'sawtooth', volume: 0.15 });
  tone(523.25, t0 + 0.13, 0.15, { type: 'sawtooth', volume: 0.15 });
  tone(659.25, t0 + 0.26, 0.3, { type: 'sawtooth', volume: 0.18 });
});
export const playDailyDouble = () => play(t0 => {
  tone(220, t0, 0.5, { type: 'sawtooth', slideTo: 440, volume: 0.2 });
  tone(220, t0 + 0.5, 0.5, { type: 'sawtooth', slideTo: 880, volume: 0.22 });
});
export const playTick = () => play(t0 => tone(1200, t0, 0.06, { type: 'square', volume: 0.12 }));
export const playBuzzer = () => play(t0 => {
  tone(160, t0, 0.5, { type: 'sawtooth', volume: 0.22 });
  tone(120, t0, 0.5, { type: 'sawtooth', volume: 0.22 });
});
export const playFanfare = () => play(t0 => {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, t0 + i * 0.11, 0.4, { volume: 0.18 }));
});

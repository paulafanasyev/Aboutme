/* Shared Web Audio: a quiet ambient drone, reverb and small struck tones.
   Everything here is synthesised; the one field recording on the site is the
   khomus, loaded separately by js/khomus.js. */

let ctx = null;
let bus = null;
let wet = null;
let drone = null;
let enabled = false;
let idleTimer = 0;

const STORAGE_KEY = "olonkho-sound";

/* Two stages, because the khomus needs a context and nothing else. Building the
   ambient graph — four oscillators, an LFO and a 2.6-second convolution
   impulse — for a visitor who never turns the sound on spends the whole run of
   the page synthesising a drone that is multiplied by zero. */
function ensureContext() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  return true;
}

function build() {
  if (bus || !ensureContext()) return;

  bus = ctx.createGain();
  bus.gain.value = 0;
  bus.connect(ctx.destination);

  wet = ctx.createGain();
  wet.gain.value = 0.4;
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(2.6, 2.4);
  wet.connect(reverb);
  reverb.connect(bus);

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.034;
  droneGain.connect(bus);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.6;
  filter.connect(droneGain);

  const voices = [
    { f: 55, type: "sine", gain: 1, detune: -4 },
    { f: 82.5, type: "sine", gain: 0.55, detune: 5 },
    { f: 110, type: "triangle", gain: 0.22, detune: -7 },
    { f: 164.5, type: "sine", gain: 0.12, detune: 9 },
  ];

  const oscs = [];
  voices.forEach((v) => {
    const osc = ctx.createOscillator();
    osc.type = v.type;
    osc.frequency.value = v.f;
    osc.detune.value = v.detune;
    const g = ctx.createGain();
    g.gain.value = v.gain;
    osc.connect(g);
    g.connect(filter);
    osc.start();
    oscs.push(osc);
  });

  // Slow breathing of the drone.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.012;
  lfo.connect(lfoGain);
  lfoGain.connect(droneGain.gain);
  lfo.start();

  drone = { gain: droneGain, oscs, lfo };
}

function impulse(seconds, decay) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const buffer = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch += 1) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return buffer;
}

export function isSoundEnabled() {
  return enabled;
}

/* Pull the drone back while the recitation speaks, so the two never fight. */
export function setDuck(on) {
  if (!ctx || !drone) return;
  const now = ctx.currentTime;
  drone.gain.cancelScheduledValues(now);
  drone.gain.setTargetAtTime(on ? 0.011 : 0.034, now, on ? 0.12 : 0.5);
}

export function getAudio() {
  build();
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume();
  return { ctx, bus, wet };
}

/* A context for instruments that must sound even when the ambient drone is off.
   Only the context: the drone, the reverb and the bus are not built here. */
export function getAudioContext() {
  if (!ensureContext()) return null;
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setSoundEnabled(on, { silent = false } = {}) {
  build();
  if (!ctx) return false;
  enabled = Boolean(on);
  window.clearTimeout(idleTimer);
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* storage may be unavailable */
  }
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;
  bus.gain.cancelScheduledValues(now);
  bus.gain.setTargetAtTime(enabled ? 0.9 : 0, now, enabled ? 0.8 : 0.25);
  if (!enabled) {
    idleTimer = window.setTimeout(() => {
      if (!enabled && ctx && ctx.state === "running") ctx.suspend();
    }, 1400);
  }
  if (!silent) {
    window.dispatchEvent(new CustomEvent("soundchange", { detail: { enabled } }));
  }
  return enabled;
}

export function restoreSoundPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/* A soft struck tone, used when the recitation turns a line. */
export function pluck(freq = 220, { gain = 0.12, dur = 1.1, pan = 0 } = {}) {
  const a = getAudio();
  if (!a || !enabled) return;
  const { ctx: c, bus: out, wet: room } = a;
  const t = c.currentTime;

  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.985, t + dur);

  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  let node = osc;
  if (c.createStereoPanner) {
    const p = c.createStereoPanner();
    p.pan.value = pan;
    osc.connect(p);
    node = p;
  }
  node.connect(env);
  env.connect(out);
  env.connect(room);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export function chime() {
  pluck(660, { gain: 0.07, dur: 1.4 });
  setTimeout(() => pluck(990, { gain: 0.045, dur: 1.6, pan: 0.25 }), 90);
}

document.addEventListener("visibilitychange", () => {
  if (!ctx) return;
  if (document.hidden) {
    if (ctx.state === "running") ctx.suspend();
    return;
  }
  if (enabled && ctx.state === "suspended") ctx.resume();
});

export { STORAGE_KEY };

/* A playable jaw harp, built from a real performance.

   The audio is a recording of a хомус, so the reed's fundamental is whatever
   the instrument actually does — measured near 73 Hz. What the browser adds is
   the listener's mouth: holding the pointer and moving up and down lifts a
   narrow resonance onto a different partial of that same drone, which is the
   one thing a jaw harp can do. The tape keeps running between presses, so each
   hold continues the same performance rather than restarting it. */

import { getAudioContext } from "./audio.js";

const SRC = "assets/audio/khomus-real.wav";
const REED = 73;
const FIRST_PARTIAL = 2;
const LAST_PARTIAL = 8;

export function initKhomus() {
  const button = document.getElementById("khomus");
  const pitchDot = document.getElementById("khomusPitch");
  if (!button) return;

  let tone = null;
  let pitch = 0.5;
  let pressing = false;
  let burstTimer = 0;
  let lastDirect = 0;
  let bytes = null;
  let buffer = null;
  let decoding = false;
  let playhead = 0;
  let pending = false;

  fetch(SRC).then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((b) => { if (b) bytes = b; })
    .catch(() => {});

  function ensureBuffer(ctx) {
    if (buffer || !bytes || decoding) return buffer;
    decoding = true;
    ctx.decodeAudioData(bytes.slice(0), (b) => {
      decoding = false;
      buffer = b;
      bytes = null;
      if (pending) {
        pending = false;
        start();
      }
    }, () => { decoding = false; });
    return null;
  }

  function partialAt(t) {
    const k = FIRST_PARTIAL + Math.round(t * (LAST_PARTIAL - FIRST_PARTIAL));
    return Math.min(LAST_PARTIAL, Math.max(FIRST_PARTIAL, k));
  }

  function movePitch(clientY) {
    const rect = button.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height));
    pitch = t;
    const k = partialAt(t);
    if (pitchDot) {
      const step = (k - FIRST_PARTIAL) / (LAST_PARTIAL - FIRST_PARTIAL);
      pitchDot.style.setProperty("--step", step.toFixed(3));
    }
    if (tone) {
      const now = tone.ctx.currentTime;
      const freq = REED * k;
      tone.cavity.frequency.cancelScheduledValues(now);
      tone.cavity.frequency.setTargetAtTime(freq, now, 0.03);
      /* Higher partials are quieter on a real instrument; the mix keeps up. */
      tone.cavity.gain.setTargetAtTime(0.5 + (k - FIRST_PARTIAL) * 0.11, now, 0.05);
    }
  }

  function start() {
    if (tone) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const tape = ensureBuffer(ctx);
    if (!tape) {
      pending = pressing;
      return;
    }

    const now = ctx.currentTime;
    const freq = REED * partialAt(pitch);

    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, now);
    out.gain.exponentialRampToValueAtTime(0.85, now + 0.02);
    out.gain.exponentialRampToValueAtTime(0.62, now + 0.2);

    const source = ctx.createBufferSource();
    source.buffer = tape;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = tape.duration;

    /* The mouth: a narrow resonance lifted onto one partial of the drone. */
    const cavity = ctx.createBiquadFilter();
    cavity.type = "bandpass";
    cavity.frequency.value = freq;
    cavity.Q.value = 7;
    const cavityGain = ctx.createGain();
    cavityGain.gain.value = 0.72;

    /* And the plain instrument underneath it, so the tone never goes thin. */
    const body = ctx.createBiquadFilter();
    body.type = "lowpass";
    body.frequency.value = 2600;
    const bodyGain = ctx.createGain();
    bodyGain.gain.value = 0.62;

    source.connect(cavity);
    cavity.connect(cavityGain);
    cavityGain.connect(out);
    source.connect(body);
    body.connect(bodyGain);
    bodyGain.connect(out);

    /* Tonguing shimmer: slow, small swings of the resonance. */
    const wobble = ctx.createOscillator();
    wobble.frequency.value = 5.2;
    const wobbleGain = ctx.createGain();
    wobbleGain.gain.value = freq * 0.014;
    wobble.connect(wobbleGain);
    wobbleGain.connect(cavity.frequency);

    out.connect(master);
    source.start(now, playhead % tape.duration);
    wobble.start(now);

    tone = { ctx, cavity, cavityGain, out, master, wobble, wobbleGain, source, startedAt: now };
    button.classList.add("is-playing");
  }

  function stop() {
    if (!tone) {
      pending = false;
      return;
    }
    const { ctx } = tone;
    const now = ctx.currentTime;
    playhead = (playhead + (now - tone.startedAt) + 0.4) % (tone.source.buffer.duration);
    tone.out.gain.cancelScheduledValues(now);
    tone.out.gain.setTargetAtTime(0.0001, now, 0.05);
    try {
      tone.source.stop(now + 0.3);
      tone.wobble.stop(now + 0.3);
    } catch {
      /* already stopped */
    }
    const dead = tone;
    tone = null;
    window.clearTimeout(burstTimer);
    window.setTimeout(() => {
      try {
        dead.out.disconnect();
        dead.master.disconnect();
        dead.wobbleGain.disconnect();
      } catch {
        /* already disconnected */
      }
    }, 380);
    button.classList.remove("is-playing");
  }

  button.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    lastDirect = performance.now();
    pressing = true;
    button.setPointerCapture?.(event.pointerId);
    movePitch(event.clientY);
    start();
  });

  button.addEventListener("pointermove", (event) => {
    if (!pressing) return;
    movePitch(event.clientY);
  });

  const release = (event) => {
    if (!pressing) return;
    pressing = false;
    lastDirect = performance.now();
    if (event && button.hasPointerCapture?.(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
    stop();
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  window.addEventListener("blur", () => {
    pressing = false;
    stop();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pressing = false;
      stop();
    }
  });

  button.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      if (event.repeat) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      lastDirect = performance.now();
      if (!tone) start();
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const rect = button.getBoundingClientRect();
      const span = 1 / (LAST_PARTIAL - FIRST_PARTIAL);
      const next = Math.min(1, Math.max(0, pitch + (event.key === "ArrowUp" ? span : -span)));
      movePitch(rect.bottom - next * rect.height);
    }
  });

  button.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      stop();
    }
  });

  button.addEventListener("blur", () => {
    stop();
  });

  /* Assistive tech often activates a button with a synthetic click,
     which has no press-and-hold. Play a short phrase instead. */
  button.addEventListener("click", () => {
    if (performance.now() - lastDirect < 800 || tone) return;
    pressing = true;
    start();
    burstTimer = window.setTimeout(() => {
      pressing = false;
      stop();
    }, 2600);
  });
}

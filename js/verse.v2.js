/* Recitation: eight lines, a speaking voice (when the browser has one),
   a timed visual fallback, progress ring and a responsive wave. */

import { pluck, isSoundEnabled, setDuck } from "./audio.v2.js";

const LABELS = {
  ru: {
    idle: "Не начато",
    playing: "Читает",
    paused: "Пауза",
    done: "Сказание завершено",
    play: "Слушать сказание",
    pause: "Поставить на паузу",
  },
  en: {
    idle: "Not started",
    playing: "Reading",
    paused: "Paused",
    done: "Tale complete",
    play: "Listen to the tale",
    pause: "Pause the tale",
  },
  sah: {
    idle: "Саҕаламмата",
    playing: "Ааҕар",
    paused: "Тохтоото",
    done: "Остуоруйа бүттэ",
    play: "Остуоруйаны истин",
    pause: "Остуоруйаны тохтот",
  },
  vi: {
    idle: "Chưa bắt đầu",
    playing: "Đang đọc",
    paused: "Tạm dừng",
    done: "Câu chuyện hoàn tất",
    play: "Nghe câu chuyện",
    pause: "Tạm dừng câu chuyện",
  },
};

const VOICE_LANG = { ru: "ru-RU", en: "en-US", sah: "sah-RU", vi: "vi-VN" };
const VOICE_FALLBACK = { ru: ["ru"], en: ["en"], sah: ["sah", "ru"], vi: ["vi", "en"] };

const NOTES = [220, 246.94, 293.66, 329.63, 392, 440, 493.88, 587.33];
const LINE_MS = 3400;

export function initVerse({ getLang }) {
  const root = document.getElementById("verse");
  const playBtn = document.getElementById("versePlay");
  const stateEl = document.getElementById("verseState");
  const currentEl = document.getElementById("verseCurrent");
  const wave = document.getElementById("verseWave");
  const voiceBtn = document.getElementById("voiceToggle");
  const ring = playBtn?.querySelector(".play-ring circle");
  if (!root || !playBtn || !stateEl || !currentEl || !wave) return;

  const lines = Array.from(root.querySelectorAll(".verse-line"));
  const LEN = lines.length;
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;

  let index = 0;
  let playing = false;
  let paused = false;
  let timer = 0;
  let token = 0;
  let utterance = null;
  let voiceOn = Boolean(synth);

  if (wave.childElementCount === 0) {
    const heights = [24, 48, 72, 36, 60, 90, 42, 64, 30, 76, 52, 94, 38, 62, 82, 46, 68, 28, 56, 86, 40, 74, 50, 92, 34, 66];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < heights.length; i += 1) {
      const bar = document.createElement("span");
      bar.style.height = `${heights[i]}%`;
      frag.append(bar);
    }
    wave.append(frag);
  }

  if (voiceBtn) {
    voiceBtn.setAttribute("aria-pressed", String(voiceOn));
    if (!synth) {
      voiceBtn.disabled = true;
      voiceBtn.setAttribute("aria-pressed", "false");
    }
  }

  const labels = () => LABELS[getLang()] || LABELS.ru;

  function setState(key) {
    stateEl.textContent = labels()[key];
  }

  function setButton() {
    playBtn.classList.toggle("is-playing", playing);
    playBtn.setAttribute("aria-label", playing ? labels().pause : labels().play);
  }

  function paint() {
    lines.forEach((line, i) => {
      const current = (playing || paused) && i === index;
      line.classList.toggle("is-active", current);
      line.classList.toggle("is-read", i < index || index >= LEN);
      if (current) line.setAttribute("aria-current", "true");
      else line.removeAttribute("aria-current");
    });

    const shown = index >= LEN ? LEN : index > 0 || playing ? Math.min(index + 1, LEN) : 0;
    currentEl.textContent = String(shown).padStart(2, "0");

    const progress = index >= LEN ? 1 : index / LEN;
    if (ring) ring.style.strokeDashoffset = String(176 * (1 - progress));

    wave.classList.toggle("is-playing", playing);
  }

  function clearTimer() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function stopSpeech() {
    if (!synth) return;
    utterance = null;
    try {
      synth.cancel();
    } catch {
      /* some engines throw when idle */
    }
  }

  function pickVoice() {
    if (!synth) return null;
    const lang = VOICE_LANG[getLang()] ? getLang() : "ru";
    const voices = synth.getVoices();
    for (const code of VOICE_FALLBACK[lang]) {
      const match = voices.find((voice) => voice.lang?.toLowerCase().startsWith(code));
      if (match) return match;
    }
    return null;
  }

  function speak(i) {
    if (!voiceOn || !synth) return false;
    const text = lines[i]?.querySelector(".v-text")?.textContent?.trim();
    if (!text) return false;

    stopSpeech();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICE_LANG[getLang()] || "ru-RU";
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.pitch = 0.92;
    u.volume = 0.95;
    const mine = token;
    u.onend = () => {
      if (mine === token && playing) advance();
    };
    u.onerror = () => {
      if (mine !== token || !playing) return;
      schedule(LINE_MS);
    };
    utterance = u;
    try {
      synth.speak(u);
      return true;
    } catch {
      return false;
    }
  }

  function schedule(ms) {
    clearTimer();
    const mine = token;
    timer = window.setTimeout(() => {
      if (mine === token && playing) advance();
    }, ms);
  }

  function beginLine(i) {
    index = i;
    paused = false;
    token += 1;
    paint();
    setState("playing");

    if (isSoundEnabled()) {
      const freq = NOTES[i % NOTES.length];
      pluck(freq, { gain: 0.055, dur: 1.6, pan: i % 2 ? 0.2 : -0.2 });
    }

    const spoken = speak(i);
    setDuck(spoken);
    schedule(spoken ? 9000 : LINE_MS);
  }

  function advance() {
    if (!playing) return;
    clearTimer();
    const next = index + 1;
    if (next >= LEN) {
      finish();
      return;
    }
    beginLine(next);
  }

  function finish() {
    playing = false;
    paused = false;
    index = LEN;
    token += 1;
    clearTimer();
    stopSpeech();
    setDuck(false);
    paint();
    setButton();
    setState("done");
    if (ring) ring.style.strokeDashoffset = "0";
    if (isSoundEnabled()) pluck(440, { gain: 0.05, dur: 2.2 });
  }

  function reset({ announce = true } = {}) {
    playing = false;
    paused = false;
    index = 0;
    token += 1;
    clearTimer();
    stopSpeech();
    setDuck(false);
    paint();
    setButton();
    if (announce) setState("idle");
    if (ring) ring.style.strokeDashoffset = "176";
  }

  function playFromStart() {
    if (index >= LEN) reset({ announce: false });
    playing = true;
    setButton();
    beginLine(index);
  }

  function pause() {
    if (!playing) return;
    playing = false;
    paused = true;
    token += 1;
    clearTimer();
    stopSpeech();
    setDuck(false);
    paint();
    setButton();
    setState("paused");
  }

  playBtn.addEventListener("click", () => {
    if (playing) pause();
    else playFromStart();
  });

  if (voiceBtn && synth) {
    voiceBtn.addEventListener("click", () => {
      voiceOn = !voiceOn;
      voiceBtn.setAttribute("aria-pressed", String(voiceOn));
      if (!voiceOn) {
        stopSpeech();
        setDuck(false);
        if (playing) {
          token += 1;
          schedule(LINE_MS);
        }
      } else if (playing) {
        token += 1;
        const spoken = speak(index);
        setDuck(spoken);
        schedule(spoken ? 9000 : LINE_MS);
      }
    });
  }

  if (synth) {
    // Voices arrive asynchronously in some browsers; the picker is called per line.
    pickVoice();
  }

  window.addEventListener("langchange", () => {
    reset();
    if (ring) ring.style.strokeDashoffset = "176";
    setState("idle");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) pause();
  });

  reset();
  setState("idle");
}

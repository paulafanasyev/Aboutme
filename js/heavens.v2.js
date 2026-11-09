/* Тоҕус халлаан — a 3D ascent up the world tree, drawn by hand:
   perspective projection on a 2D canvas, no libraries, no WebGL.
   Fly through the hoops of the nine heavens; each four hoops is one heaven. */

import { pluck, isSoundEnabled } from "./audio.js";

const FOCAL = 620;
const RING_STEP = 300;
const RINGS_AHEAD = 11;
const RINGS_PER_HEAVEN = 4;
const HEAVENS = 9;
const RINGS_TOTAL = RINGS_PER_HEAVEN * HEAVENS;
const BEST_KEY = "olonkho-heavens";

const MSG = {
  ru: {
    start: "Начать восхождение",
    resume: "Продолжить",
    again: "Ещё раз",
    hint: "Мышь или палец ведёт искру · стрелки и WASD в фокусе · пробел — пауза",
    record: "Новый рекорд",
    ready: "Держи курс по центру кольца. Четыре кольца — одно небо.",
    heaven: (n) => `Небо ${n} · пройдено ${n * RINGS_PER_HEAVEN} из ${RINGS_TOTAL}`,
    graze: "Задел край",
    hit: "Кольцо потеряно — нить саламаат рвётся",
    mend: "Пять искр восстановили нить",
    crown: "Вершина Аал Луук Мас. Девять небес позади.",
    over: (rings, motes) => `Восхождение прервано: ${rings} колец, ${motes} искр.`,
    paused: "Пауза",
  },
  en: {
    start: "Begin the ascent",
    resume: "Resume",
    again: "Play again",
    hint: "Mouse or finger steers the spark · arrows and WASD in focus · Space pauses",
    record: "New record",
    ready: "Aim for the middle of each hoop. Four hoops make one heaven.",
    heaven: (n) => `Heaven ${n} · ${n * RINGS_PER_HEAVEN} of ${RINGS_TOTAL} hoops`,
    graze: "You grazed the rim",
    hit: "Hoop missed — a саламаат thread snaps",
    mend: "Five sparks restored a thread",
    crown: "The crown of Аал Луук Мас. Nine heavens behind you.",
    over: (rings, motes) => `Ascent ended: ${rings} hoops, ${motes} sparks.`,
    paused: "Paused",
  },
  sah: {
    start: "Көтүүнү саҕалаа",
    resume: "Салҕаа",
    again: "Хатыылаа",
    hint: "Кутуйах уонна тарбах уот кыымын салайар · стрелка уонна WASD · пробел — тохтотуу",
    record: "Саҥа рекорд",
    ready: "Хас биирдии төҥүрүк ортотунан көт. Түөрт төҥүрүк — биир халлаан.",
    heaven: (n) => `${n}-с халлаан · ${RINGS_TOTAL} төҥүрүктэн ${n * RINGS_PER_HEAVEN} ааһынна`,
    graze: "Төҥүрүк кырыытыгар таарыйдын",
    hit: "Төҥүрүк ааспата — саламаат быстыбыта",
    mend: "Биэс уот кыыма саламааты төннөрдө",
    crown: "Аал Луук Мас чыпчаала. Тоҕус халлаан ааста.",
    over: (rings, motes) => `Көтүү тохтоото: ${rings} төҥүрүк, ${motes} уот кыыма.`,
    paused: "Тохтоото",
  },
  vi: {
    start: "Bắt đầu chuyến bay",
    resume: "Tiếp tục",
    again: "Chơi lại",
    hint: "Chuột hoặc ngón tay dẫn tia sáng · phím mũi tên và WASD · Space tạm dừng",
    record: "Kỷ lục mới",
    ready: "Bay vào giữa vòng. Bốn vòng là một tầng trời.",
    heaven: (n) => `Tầng trời ${n} · ${n * RINGS_PER_HEAVEN} / ${RINGS_TOTAL} vòng`,
    graze: "Bạn chạm vành",
    hit: "Lỡ vòng — một sợi саламаат đứt",
    crown: "Đỉnh cây Аал Луук Мас. Chín tầng trời phía sau.",
    over: (rings, motes) => `Chuyến bay kết thúc: ${rings} vòng, ${motes} tia sáng.`,
    mend: "Năm tia sáng đã khôi phục một sợi",
    paused: "Tạm dừng",
  },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function initHeavens({ getLang }) {
  const canvas = document.getElementById("heavensCanvas");
  const stage = document.querySelector(".heavens-stage");
  if (!canvas || !stage) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const startBtn = document.getElementById("hvStart");
  const heavenEl = document.getElementById("hvHeaven");
  const ringEl = document.getElementById("hvRings");
  const moteEl = document.getElementById("hvMotes");
  const bestEl = document.getElementById("hvBest");
  const threadEl = document.getElementById("hvThreads");
  const msgEl = document.getElementById("hvMsg");
  const resultEl = document.getElementById("hvResult");
  const overlay = document.getElementById("hvOverlay");
  const hintEl = document.getElementById("hvHint");
  const pauseBtn = document.getElementById("hvPause");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  let w = 1;
  let h = 1;
  let dpr = 1;
  let unit = 1;
  let raf = 0;
  let last = 0;
  let running = false;
  let renderQuality = 1;
  let frameAverage = 16.7;
  let qualityTicks = 0;
  let fastFrames = 0;
  let phase = "idle"; /* idle | play | pause | done */
  let lastCrowned = false;

  const keys = new Set();
  let pointer = null;

  const state = {
    travel: 0,
    speed: 240,
    targetSpeed: 240,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    rings: 0,
    motes: 0,
    threads: 3,
    heaven: 0,
    shake: 0,
    flash: 0,
    ringsList: [],
    sparks: [],
    trail: [],
  };

  const labels = () => MSG[getLang()] || MSG.ru;
  let beatRecord = false;
  /* localStorage is synchronous; paint() runs on every ring crossed. */
  let best = readBest();

  /* The card is the only place a player reads what happened, so it carries the
     record too: a best run that only repaints a 13 px HUD digit is not a win. */
  function resultText() {
    const line = lastCrowned ? labels().crown : labels().over(state.rings, state.motes);
    return beatRecord ? `${line} ${labels().record}.` : line;
  }

  /* One button, three meanings. A card that always says "begin" cannot tell a
     paused run from an unstarted one. */
  function paintCard() {
    const L = labels();
    startBtn.textContent = phase === "pause" ? L.resume : phase === "done" ? L.again : L.start;
    if (hintEl) hintEl.textContent = L.hint;
  }
  const calm = () => reduce.matches;

  function readBest() {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  function writeBest(value) {
    try {
      localStorage.setItem(BEST_KEY, String(value));
    } catch {
      /* storage may be unavailable */
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    /* A glow-heavy scene does not need retina sampling, and a large stage on a
       retina screen costs four times the fill rate. Spend the budget, cap it. */
    const natural = Math.min(window.devicePixelRatio || 1, 2);
    const pixelBudget = phase === "play" ? 300000 : 540000;
    const budget = Math.sqrt(pixelBudget / (w * h)) * renderQuality;
    dpr = clamp(Math.min(natural, budget), 0.35, natural);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    unit = clamp(Math.min(w, h * 1.25) / 620, 0.5, 1.3);
    skyKey = "";
    aurKey = "";
    atmosphereKey = "";
    /* Resizing clears the bitmap, so the idle frame has to be repainted. */
    if (!running) draw();
  }

  /* The trunk: a slow spiral the hoops are strung on, like the world tree. */
  function pathAt(z) {
    const a = z * 0.0019;
    return [
      Math.cos(a) * 202 * unit * (0.55 + 0.45 * Math.sin(z * 0.00061)),
      Math.sin(a * 0.82) * 132 * unit - 26 * unit,
    ];
  }

  function project(x, y, z) {
    const s = FOCAL / (FOCAL + z);
    return [x * s, y * s, s];
  }

  /* ---------- the world around the track ----------
     Everything below is painted, not loaded: a fixed star field, the sky of the
     heaven you are standing in, aurora over the crown, and the bark of the tree
     the hoops are strung on. */

  /* A seeded field, so the stars do not boil between frames. */
  function mulberry(seed) {
    let a = seed;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeStarGlow(color) {
    const sprite = document.createElement("canvas");
    sprite.width = 32;
    sprite.height = 32;
    const g = sprite.getContext("2d");
    const glow = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, `rgba(${color}, 0.6)`);
    glow.addColorStop(0.5, `rgba(${color}, 0.2)`);
    glow.addColorStop(1, `rgba(${color}, 0)`);
    g.fillStyle = glow;
    g.fillRect(0, 0, 32, 32);
    return sprite;
  }
  const starGlowWarm = makeStarGlow("245, 217, 168");
  const starGlowCold = makeStarGlow("214, 244, 238");

  const STAR_DEPTH = RING_STEP * RINGS_AHEAD;
  const stars = (() => {
    const rnd = mulberry(880519);
    const list = [];
    for (let i = 0; i < 320; i += 1) {
      const edge = rnd() * 2 - 1;
      list.push({
        x: (rnd() * 2 - 1) * 1600,
        y: Math.sign(edge || 1) * (0.2 + 0.8 * Math.abs(edge)) * 1150,
        z: rnd() * STAR_DEPTH,
        par: 0.55 + rnd() * 0.45,
        r: 0.5 + rnd() * 1.8,
        warm: rnd() > 0.74,
        tw: rnd() * 6.283,
      });
    }
    return list;
  })();

  /* Cold earth below, thinning to a pale gold crown at the ninth heaven. */
  const SKY_LOW = { top: [9, 13, 22], mid: [19, 26, 38], low: [44, 30, 21], glow: [196, 122, 58] };
  const SKY_HIGH = { top: [5, 8, 17], mid: [14, 26, 49], low: [26, 39, 63], glow: [244, 220, 168] };
  const mixRGB = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
  const skyOf = (t) => ({
    top: mixRGB(SKY_LOW.top, SKY_HIGH.top, t),
    mid: mixRGB(SKY_LOW.mid, SKY_HIGH.mid, t),
    low: mixRGB(SKY_LOW.low, SKY_HIGH.low, t),
    glow: mixRGB(SKY_LOW.glow, SKY_HIGH.glow, t),
  });

  /* Vignette and grain are painted into the sky, not over the finished frame:
     a full-screen alpha blend every frame costs more than it looks worth, and
     the framing it gives — dark corners, a little tooth in the shadows — belongs
     to the sky anyway. */
  function paintVignette(g, cw, ch) {
    const rad = g.createRadialGradient(cw / 2, ch * 0.46, Math.min(cw, ch) * 0.22,
      cw / 2, ch * 0.46, Math.max(cw, ch) * 0.78);
    rad.addColorStop(0, "rgba(0, 0, 0, 0)");
    rad.addColorStop(0.62, "rgba(0, 0, 0, 0.2)");
    rad.addColorStop(1, "rgba(0, 0, 0, 0.58)");
    g.fillStyle = rad;
    g.fillRect(0, 0, cw, ch);
    /* a faint grain keeps the large dark areas from banding */
    const cells = Math.round((cw * ch) / 2600);
    const rnd = mulberry(4242);
    g.globalAlpha = 0.05;
    for (let i = 0; i < cells; i += 1) {
      g.fillStyle = rnd() > 0.5 ? "#ffffff" : "#000000";
      g.fillRect(rnd() * cw, rnd() * ch, 1, 1);
    }
    g.globalAlpha = 1;
  }

  /* The sky only changes when you reach a new height, so it is painted once into
     an offscreen canvas and blitted. Gradients are the expensive part here. */
  let skyCanvas = null;
  let skyKey = "";
  function skyAt(t) {
    const rung = Math.round(t * 24);
    const key = `${rung}|${Math.round(w)}x${Math.round(h)}`;
    if (key === skyKey && skyCanvas) return skyCanvas;
    skyKey = key;
    if (!skyCanvas) skyCanvas = document.createElement("canvas");
    skyCanvas.width = Math.max(1, Math.round(w));
    skyCanvas.height = Math.max(1, Math.round(h));
    const g = skyCanvas.getContext("2d");
    const sky = skyOf(rung / 24);
    const grad = g.createLinearGradient(0, 0, 0, skyCanvas.height);
    grad.addColorStop(0, rgb(sky.top, 1));
    grad.addColorStop(0.52, rgb(sky.mid, 1));
    grad.addColorStop(1, rgb(sky.low, 1));
    g.fillStyle = grad;
    g.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

    /* the crown: a low sun that grows as you rise */
    const cx = skyCanvas.width / 2;
    const cy = skyCanvas.height * (0.42 - (rung / 24) * 0.16);
    const rad = Math.max(skyCanvas.width, skyCanvas.height) * (0.2 + (rung / 24) * 0.34);
    const halo = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
    halo.addColorStop(0, rgb(sky.glow, 0.16 + (rung / 24) * 0.2));
    halo.addColorStop(0.35, rgb(sky.glow, 0.06 + (rung / 24) * 0.08));
    halo.addColorStop(1, rgb(sky.glow, 0));
    g.fillStyle = halo;
    g.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

    /* haze pooling at the floor of the frame, so the scene has ground under it */
    const floor = g.createLinearGradient(0, skyCanvas.height * 0.66, 0, skyCanvas.height);
    floor.addColorStop(0, rgb(sky.low, 0));
    floor.addColorStop(1, rgb(sky.low, 0.72));
    g.fillStyle = floor;
    g.fillRect(0, skyCanvas.height * 0.66, skyCanvas.width, skyCanvas.height * 0.34);

    paintVignette(g, skyCanvas.width, skyCanvas.height);
    return skyCanvas;
  }

  function drawStars(t, time) {
    const drift = calm() ? 0 : state.travel;
    const hw = w / 2;
    const hh = h / 2;
    const bright = 0.55 + t * 0.45;
    const stride = renderQuality < 0.7 ? 2 : 1;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    /* Two solid colours, and the alpha rides on globalAlpha: building a rgba()
       string for every star every frame is the single most expensive thing here. */
    for (let pass = 0; pass < 2; pass += 1) {
      ctx.fillStyle = pass ? "#d6f4ee" : "#f5d9a8";
      for (let i = 0; i < stars.length; i += stride) {
        const s = stars[i];
        if ((pass === 0) !== s.warm) continue;
        const z = ((((s.z - drift * s.par) % STAR_DEPTH) + STAR_DEPTH) % STAR_DEPTH);
        const sc = FOCAL / (FOCAL + z);
        const x = s.x * unit * sc + hw;
        if (x < -3 || x > w + 3) continue;
        const y = s.y * unit * sc + hh;
        if (y < -3 || y > h + 3) continue;
        const near = 1 - z / STAR_DEPTH;
        const twinkle = calm() ? 0.85 : 0.72 + 0.28 * Math.sin(time * 1.7 + s.tw);
        ctx.globalAlpha = Math.min(1, (0.1 + near * 0.72) * twinkle * bright);
        const size = Math.max(0.7, s.r * sc * 2.2);
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }
    // Bloom pass for bright stars - 3-tap kernel
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < stars.length; i += 3 * stride) {
      const s = stars[i];
      if (s.r < 1.2) continue;
      const z = ((((s.z - drift * s.par) % STAR_DEPTH) + STAR_DEPTH) % STAR_DEPTH);
      const sc = FOCAL / (FOCAL + z);
      const x = s.x * unit * sc + hw;
      if (x < -10 || x > w + 10) continue;
      const y = s.y * unit * sc + hh;
      if (y < -10 || y > h + 10) continue;
      const near = 1 - z / STAR_DEPTH;
      const bloomSize = Math.max(2, s.r * sc * 6);
      ctx.drawImage(s.warm ? starGlowWarm : starGlowCold,
        x - bloomSize, y - bloomSize, bloomSize * 2, bloomSize * 2);
    }
    ctx.restore();
  }

  /* Northern light, riding above the crown. Painted at half scale — it is soft
     by nature, and upscaling is free where a full-res fill would cost the most.
     It also drifts slowly enough that a fresh sheet every screenful of light is
     wasted: the ribbon is rebuilt at 30 Hz and the additive blit only covers the
     band of sky it can reach. */
  let aurCanvas = null;
  let aurKey = "";
  const AURORA_BANDS = [
    { y: 0.16, amp: 0.05, hue: [96, 214, 168], a: 0.15 },
    { y: 0.24, amp: 0.075, hue: [120, 176, 226], a: 0.11 },
    { y: 0.11, amp: 0.035, hue: [188, 132, 214], a: 0.07 },
  ];
  function buildAurora(aw, ah, t, time) {
    if (!aurCanvas) aurCanvas = document.createElement("canvas");
    if (aurCanvas.width !== aw || aurCanvas.height !== ah) {
      aurCanvas.width = aw;
      aurCanvas.height = ah;
    }
    const g = aurCanvas.getContext("2d");
    g.clearRect(0, 0, aw, ah);
    const phase = calm() ? 1.2 : time * 0.11 + state.travel * 0.00012;
    const stride = Math.max(7, aw / 40);
    AURORA_BANDS.forEach((b, i) => {
      const top = ah * b.y;
      const grad = g.createLinearGradient(0, top - ah * 0.09, 0, top + ah * 0.2);
      const strength = b.a * (0.45 + t * 0.75);
      grad.addColorStop(0, rgb(b.hue, 0));
      grad.addColorStop(0.34, rgb(b.hue, strength));
      grad.addColorStop(1, rgb(b.hue, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(-6, ah);
      for (let x = -6; x <= aw + 6; x += stride) {
        const u = x / aw;
        g.lineTo(x, top + Math.sin(u * 3.1 + phase * (1 + i * 0.4)) * ah * b.amp
          + Math.sin(u * 7.7 - phase * 1.6) * ah * b.amp * 0.35);
      }
      for (let x = aw + 6; x >= -6; x -= stride) {
        const u = x / aw;
        g.lineTo(x, top + ah * 0.19 + Math.sin(u * 2.4 - phase * 0.8 + i) * ah * b.amp * 0.7);
      }
      g.closePath();
      g.fill();
    });
  }
  function paintAurora(g, t, time, aw, ah) {
    const key = `${aw}x${ah}|${Math.round(t * 24)}|${Math.floor(time * 12)}`;
    if (key !== aurKey) {
      aurKey = key;
      buildAurora(aw, ah, t, time);
    }
    const reach = Math.round(ah * 0.5);
    g.save();
    g.globalCompositeOperation = "lighter";
    g.drawImage(aurCanvas, 0, 0, aw, reach, 0, 0, aw, reach * 2);
    g.restore();
  }

  const cloudSprites = Array.from({ length: 3 }, (_, spriteIndex) => {
    const sheet = document.createElement("canvas");
    sheet.width = 320;
    sheet.height = 180;
    const g = sheet.getContext("2d");
    const rnd = mulberry(7120 + spriteIndex * 97);
    for (let i = 0; i < 17; i += 1) {
      const x = 45 + rnd() * 230;
      const y = 72 + rnd() * 55;
      const r = 28 + rnd() * 55;
      const shade = g.createRadialGradient(x, y + 12, 0, x, y + 12, r);
      shade.addColorStop(0, "rgba(24, 35, 52, 0.34)");
      shade.addColorStop(0.55, "rgba(36, 51, 69, 0.16)");
      shade.addColorStop(1, "rgba(36, 51, 69, 0)");
      g.fillStyle = shade;
      g.fillRect(x - r, y - r, r * 2, r * 2);
      const lit = g.createRadialGradient(x - r * 0.2, y - r * 0.3, 0, x, y, r);
      lit.addColorStop(0, "rgba(205, 218, 219, 0.3)");
      lit.addColorStop(0.38, "rgba(127, 153, 169, 0.2)");
      lit.addColorStop(0.76, "rgba(71, 94, 119, 0.08)");
      lit.addColorStop(1, "rgba(52, 72, 96, 0)");
      g.fillStyle = lit;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return sheet;
  });

  const clouds = (() => {
    const rnd = mulberry(91411);
    return Array.from({ length: 16 }, (_, i) => ({
      x: (rnd() * 2 - 1) * 1900,
      y: (rnd() * 2 - 1) * 1050,
      z: rnd() * STAR_DEPTH,
      width: 720 + rnd() * 850,
      par: 0.18 + rnd() * 0.32,
      sprite: i % cloudSprites.length,
      drift: rnd() * Math.PI * 2,
      alpha: 0.32 + rnd() * 0.42,
    }));
  })();

  function paintLightShafts(g, t, time, aw, ah) {
    const sx = aw * 0.76;
    const sy = ah * (0.08 + t * 0.03);
    const motion = calm() ? 0 : Math.sin(time * 0.08) * 0.035;
    g.save();
    g.globalCompositeOperation = "lighter";
    const sun = g.createRadialGradient(sx, sy, 0, sx, sy, Math.max(aw, ah) * 0.38);
    sun.addColorStop(0, `rgba(255, 231, 181, ${0.1 + t * 0.08})`);
    sun.addColorStop(0.18, `rgba(233, 184, 110, ${0.045 + t * 0.035})`);
    sun.addColorStop(1, "rgba(233, 184, 110, 0)");
    g.fillStyle = sun;
    g.fillRect(0, 0, aw, ah);
    for (let i = 0; i < 7; i += 1) {
      const angle = 1.76 + i * 0.135 + motion;
      const spread = 0.025 + (i % 3) * 0.012;
      const length = Math.max(aw, ah) * 1.45;
      const ex = sx + Math.cos(angle) * length;
      const ey = sy + Math.sin(angle) * length;
      const ray = g.createLinearGradient(sx, sy, ex, ey);
      ray.addColorStop(0, `rgba(255, 229, 176, ${0.032 + t * 0.025})`);
      ray.addColorStop(0.48, `rgba(233, 197, 139, ${0.018 + t * 0.015})`);
      ray.addColorStop(1, "rgba(233, 184, 110, 0)");
      g.fillStyle = ray;
      g.beginPath();
      g.moveTo(sx, sy);
      g.lineTo(sx + Math.cos(angle - spread) * length, sy + Math.sin(angle - spread) * length);
      g.lineTo(sx + Math.cos(angle + spread) * length, sy + Math.sin(angle + spread) * length);
      g.closePath();
      g.fill();
    }
    g.restore();
  }

  function paintClouds(g, t, time, aw, ah) {
    const drift = calm() ? 0 : state.travel;
    const scale = aw / w;
    const su = unit * scale;
    const hw = aw / 2;
    const hh = ah / 2;
    g.save();
    const stride = renderQuality < 0.7 ? 2 : 1;
    for (let i = 0; i < clouds.length; i += stride) {
      const cloud = clouds[i];
      const z = ((cloud.z - drift * cloud.par) % STAR_DEPTH + STAR_DEPTH) % STAR_DEPTH;
      const sc = FOCAL / (FOCAL + z);
      const sway = calm() ? 0 : Math.sin(time * 0.055 + cloud.drift) * 36;
      const x = (cloud.x + sway) * su * sc + hw;
      const y = cloud.y * su * sc + hh;
      const cw = cloud.width * su * sc;
      const ch = cw * 0.56;
      if (x + cw * 0.6 < 0 || x - cw * 0.6 > aw || y + ch * 0.6 < 0 || y - ch * 0.6 > ah) continue;
      const near = 1 - z / STAR_DEPTH;
      g.globalAlpha = cloud.alpha * (0.34 + near * 0.66) * (0.78 + t * 0.22);
      g.drawImage(cloudSprites[cloud.sprite], x - cw / 2, y - ch / 2, cw, ch);
    }
    g.restore();
  }

  let atmosphereCanvas = null;
  let atmosphereCtx = null;
  let atmosphereKey = "";
  function drawAtmosphere(t, time) {
    const atmosphereScale = Math.min(0.5, Math.max(0.25, renderQuality * 0.5));
    const aw = Math.max(1, Math.round(w * atmosphereScale));
    const ah = Math.max(1, Math.round(h * atmosphereScale));
    const lean = renderQuality < 0.7;
    const tick = calm() ? 0 : Math.floor(time * (lean ? 3 : 6));
    const travelStep = calm() ? 0 : Math.floor(state.travel / (lean ? 48 : 24));
    const key = `${aw}x${ah}|${Math.round(t * 24)}|${tick}|${travelStep}`;
    if (key !== atmosphereKey || !atmosphereCanvas) {
      atmosphereKey = key;
      if (!atmosphereCanvas) {
        atmosphereCanvas = document.createElement("canvas");
        atmosphereCtx = atmosphereCanvas.getContext("2d");
      }
      if (atmosphereCanvas.width !== aw || atmosphereCanvas.height !== ah) {
        atmosphereCanvas.width = aw;
        atmosphereCanvas.height = ah;
      }
      atmosphereCtx.clearRect(0, 0, aw, ah);
      paintLightShafts(atmosphereCtx, t, time, aw, ah);
      paintAurora(atmosphereCtx, t, time, aw, ah);
      paintClouds(atmosphereCtx, t, time, aw, ah);
    }
    ctx.drawImage(atmosphereCanvas, 0, 0, aw, ah, 0, 0, w, h);
  }

  /* The tree itself.

     It is the axis of the world, not one of the gates: a great column the nine
     tiers hang on, leaning slowly as it rises and thinning toward the crown. The
     camera climbs inside the spiral of gates, so the trunk passes it first on one
     side then the other, which is what going up a tree actually feels like — and a
     trunk thin enough to be overlooked through every gate is not a tree at all, it
     is the dotted line in a diagram.

     So the trunk is drawn in the same depth order as the gates instead of
     underneath all of them, and every gate is held by a branch off the column. A
     far hoop painted across a near trunk is the fastest way there is to turn a
     wood back into a schematic.

     The skin is a photographed larch, mapped one segment at a time. The pattern's x
     axis is turned to run down the trunk so the grain follows the tree instead of
     lying across it, and its scale is fixed in world units, so a furrow is the same
     width at the root as at the crown while the trunk's own silhouette narrows
     inside it. Each segment carries its own rotation and its own texture offset,
     which is the only way the grain survives the handover from one segment to the
     next: one pattern for the whole ribbon puts coarse bark on the receding trunk,
     and one global scale clipped to the ribbon leaves gaps wherever the spine
     wanders.

     The offset is not tuned. A point of the trunk at world height T wears the bark
     at T, and one tile runs 528 units of that height, so the grain is pinned to the
     tree and scrolls past the camera as you climb. The rounding of the column is
     baked into the plate rather than laid over it per segment: the tile's short axis
     is always the stem's diameter with the shaded side first, so the light can be
     painted once, in the asset build, instead of as a second fill every frame. */
  const TRUNK_STEPS = 28;
  /* One flat quad per band: at four bands the alpha steps are wide enough to
     read as a dark flap laid over the rings instead of a trunk tapering away. */
  const TRUNK_BANDS = 12;
  /* The bark plate, authored at the size it is displayed: the tile wraps the
     column's circumference once, and canvas has no mipmaps, so a plate finer than
     the trunk's own screen width aliases into speckle and the tree comes out as
     granite. See _heavens_assets.py. */
  const BARK_W = 512;
  const BARK_H = 128;
  const TRUNK_HALF = 66;
  /* screen px per texture px at the camera — the base trunk's own diameter across
     the tile, so the tile spans the stem exactly once at the roots */
  const BARK_PX = (TRUNK_HALF * 2) / BARK_H;
  const BARK_RISE = BARK_W * BARK_PX;
  const CLIMB = RING_STEP * RINGS_TOTAL;
  /* A step of the column, in world height. The ribbon is cut this finely because
     the bark is mapped one step at a time and a step that spans a third of the
     trunk's own length arrives as a slab rather than as wood. */
  const TRUNK_Z_STEP = 186;
  const trunkSpineX = new Float64Array(TRUNK_STEPS + 1);
  const trunkSpineY = new Float64Array(TRUNK_STEPS + 1);
  const trunkHalf = new Float64Array(TRUNK_STEPS + 1);
  const trunkHalfL = new Float64Array(TRUNK_STEPS + 1);
  const trunkHalfR = new Float64Array(TRUNK_STEPS + 1);
  const trunkDepth = new Float64Array(TRUNK_STEPS + 1);
  const trunkRelZ = new Float64Array(TRUNK_STEPS + 1);
  const trunkU = new Float64Array(TRUNK_STEPS + 1);
  const trunkT = new Float64Array(TRUNK_STEPS + 1);
  const trunkNX = new Float64Array(TRUNK_STEPS + 1);
  const trunkNY = new Float64Array(TRUNK_STEPS + 1);
  const trunkLX = new Float64Array(TRUNK_STEPS + 1);
  const trunkLY = new Float64Array(TRUNK_STEPS + 1);
  const trunkRX = new Float64Array(TRUNK_STEPS + 1);
  const trunkRY = new Float64Array(TRUNK_STEPS + 1);
  const trunkAt0 = new Float64Array(TRUNK_STEPS + 1);
  const trunkAt1 = new Float64Array(TRUNK_STEPS + 1);
  /* the column's own depth pass, far step first */
  const trunkOrder = Array.from({ length: TRUNK_STEPS }, (_, i) => TRUNK_STEPS - 1 - i);

  /* The column is off the line of sight, and slowly orbits it. A trunk on the
     camera axis projects to a dot however thick you draw it — that is why the
     first pass at this put a smudge in the middle of the sky and called it a tree.
     Set the wood at a fixed distance from the eye and its near end sits out there
     while its far end runs into the vanishing point, so the column has a length;
     turn that distance as the climb goes on and the trunk swings round the frame,
     which is what going up the outside of a world tree looks like from inside the
     spiral of its gates. The phase puts it low and to the left at the foot, so the
     cover shows a tree rising rather than a beam lying across the sky. */
  function trunkAt(t) {
    const a = t * 0.00013 + 1.85;
    return [Math.cos(a) * 392 * unit, Math.sin(a) * 300 * unit];
  }

  /* A silhouette built from sines is a sine, and no bark hides that. The column's
     girth is studded instead with swellings pinned to the wood. They have to be
     broad: a bump that rises and dies within one step of the ribbon is not a
     swelling, it is a sawtooth on the edge, and a sawtooth reads as a torn strip of
     paper rather than as a tree. Two independent fields, one per edge, because a
     trunk whose left side is its right side reflected is a spindle. */
  const TRUNK_KNOTS = 22;
  const knotPos = new Float64Array(TRUNK_KNOTS);
  const knotSpan = new Float64Array(TRUNK_KNOTS);
  const knotAmpL = new Float64Array(TRUNK_KNOTS);
  const knotAmpR = new Float64Array(TRUNK_KNOTS);
  {
    const rnd = mulberry(20261102);
    const range = TRUNK_Z_STEP * TRUNK_STEPS + CLIMB + 1400;
    for (let i = 0; i < TRUNK_KNOTS; i += 1) {
      knotPos[i] = rnd() * range;
      knotSpan[i] = 420 + rnd() * 520;
      knotAmpL[i] = 0.03 + rnd() * 0.11;
      knotAmpR[i] = 0.03 + rnd() * 0.11;
    }
  }

  function knotField(t, right) {
    let h = 0;
    for (let k = 0; k < TRUNK_KNOTS; k += 1) {
      const d = (t - knotPos[k]) / knotSpan[k];
      if (d > -1 && d < 1) {
        h += (right ? knotAmpR[k] : knotAmpL[k]) * (0.5 + 0.5 * Math.cos(Math.PI * d));
      }
    }
    return h - 0.07;
  }

  /* Dead knots. A larch carries its old branches down the stem as short upturned
     stubs, and they are the second half of why the bare column read as a spire: a
     tree is not a tube, it is a tube things grew out of. Pinned to the wood in
     world height, so they scroll past the camera as you climb instead of sliding
     along the bark. */
  const TRUNK_STUBS = 30;
  const stubAt = new Float64Array(TRUNK_STUBS);
  const stubSide = new Int8Array(TRUNK_STUBS);
  const stubLen = new Float64Array(TRUNK_STUBS);
  const stubLean = new Float64Array(TRUNK_STUBS);
  {
    const rnd = mulberry(777001);
    const range = TRUNK_Z_STEP * TRUNK_STEPS + CLIMB + 1400;
    for (let i = 0; i < TRUNK_STUBS; i += 1) {
      stubAt[i] = 200 + rnd() * range;
      stubSide[i] = rnd() > 0.5 ? 1 : -1;
      stubLen[i] = 1.5 + rnd() * 2.4;
      stubLean[i] = 0.3 + rnd() * 0.55;
    }
  }

  /* Starlight comes from above and to the right, and the lit flank of the column
     has to face it wherever the column happens to be pointing. */
  const LIGHT_X = 0.5;
  const LIGHT_Y = -0.86;

  const bark = new Image();
  bark.decoding = "async";
  bark.src = "assets/img/bark-larch.jpg";
  let barkPat = null;

  bark
    .decode()
    .then(() => {
      const a = ctx.createPattern(bark, "repeat");
      /* setTransform is what makes the per-segment mapping possible at all; where
         it is missing the painted ribbon below is the whole answer. */
      if (!a || typeof a.setTransform !== "function") return;
      barkPat = a;
      if (!running) draw();
    })
    .catch(() => {
      /* no bark: the painted trunk is a complete fallback */
    });

  const barkMat = new DOMMatrix();
  /* The colour the column drowns in at distance — the middle of the sky it stands
     against, set once per frame in draw(). */
  let trunkFogRGB = [20, 28, 42];

  function trunkQuad(i, ux, uy, ext) {
    /* Running each band a little past both joints along its own tangent: the bands
       are painted far end first, so the nearer one simply covers the overlap and
       the seam disappears. Without it the ribbon is a column of abutting quads and
       shows every one of them. */
    ctx.beginPath();
    ctx.moveTo(trunkLX[i] - ux * ext, trunkLY[i] - uy * ext);
    ctx.lineTo(trunkLX[i + 1] + ux * ext, trunkLY[i + 1] + uy * ext);
    ctx.lineTo(trunkRX[i + 1] + ux * ext, trunkRY[i + 1] + uy * ext);
    ctx.lineTo(trunkRX[i] - ux * ext, trunkRY[i] - uy * ext);
    ctx.closePath();
  }

  function computeTrunk() {
    const hw = w / 2;
    const hh = h / 2;
    /* The column is not a full depth of field wide: it is a tree, and a tree that
       reaches from the lens to the horizon has no trunk left to see. It starts a
       little ahead of the gates you are inside and ends where the fog takes it.
       The axis is filled from the far end downward so that the wood nearest the
       eye lies over the wood behind it: the ribbon is a tube, and a tube painted
       inside-out shows its own far wall through every joint. */
    for (let i = TRUNK_STEPS; i >= 0; i -= 1) {
      const t = 150 + i * TRUNK_Z_STEP + state.travel;
      const [tx, ty] = trunkAt(t);
      trunkAt0[i] = tx;
      trunkAt1[i] = ty;
    }
    for (let i = 0; i <= TRUNK_STEPS; i += 1) {
      const z = 150 + i * TRUNK_Z_STEP;
      const t = z + state.travel;
      const up = clamp(t / CLIMB, 0, 1);
      const [sx, sy, s] = project(trunkAt0[i], trunkAt1[i], z);
      trunkRelZ[i] = z;
      trunkSpineX[i] = sx + hw;
      trunkSpineY[i] = sy + hh;
      trunkDepth[i] = s;
      trunkT[i] = t;
      /* Taper with the height, then break the taper with the knots. */
      trunkHalf[i] = Math.max(1.1,
        TRUNK_HALF * unit * (1 - 0.55 * up)
        * (1 + 0.05 * Math.sin(t * 0.0063)) * s);
      trunkHalfL[i] = trunkHalf[i] * clamp(1 + knotField(t, false), 0.8, 1.26);
      trunkHalfR[i] = trunkHalf[i] * clamp(1 + knotField(t, true), 0.8, 1.26);
      /* Root flare: the part the camera sits next to is the part still going down
         into the ground, so it widens as it comes toward you instead of stopping
         at the taper law. */
      if (i < 3) {
        trunkHalfL[i] *= 1 + (3 - i) * 0.2;
        trunkHalfR[i] *= 1 + (3 - i) * 0.16;
      }
      trunkU[i] = ((t * BARK_W) / (BARK_RISE * unit)) % BARK_W;
    }
    /* The ribbon's edges are offset across the column, not sideways on the screen.
       Measured in x — which is what the painted ribbon did, because the trunk used
       to run up the frame — a trunk that happens to lie across the frame has no
       thickness at all, and the whole tree arrives as a needle. The normal is
       carried from step to step instead of being re-chosen by the light each time,
       because a column that curves through the direction of the light would then
       twist and cross itself on one segment. */
    let px = 0;
    let py = 0;
    for (let i = 0; i <= TRUNK_STEPS; i += 1) {
      const j0 = i > 0 ? i - 1 : 0;
      const j1 = i < TRUNK_STEPS ? i + 1 : TRUNK_STEPS;
      let dx = trunkSpineX[j1] - trunkSpineX[j0];
      let dy = trunkSpineY[j1] - trunkSpineY[j0];
      const L = Math.hypot(dx, dy);
      if (L < 1e-6) {
        dx = 0;
        dy = 1;
      } else {
        dx /= L;
        dy /= L;
      }
      let nx = -dy;
      let ny = dx;
      if (i === 0 ? nx * LIGHT_X + ny * LIGHT_Y < 0 : nx * px + ny * py < 0) {
        nx = -nx;
        ny = -ny;
      }
      px = nx;
      py = ny;
      trunkNX[i] = nx;
      trunkNY[i] = ny;
      /* One smoothing pass over the girth: the knots are broad but the ribbon
         samples them a few steps apart, and a two-tap blur is what turns "sampled"
         into "continuous" on the outline. */
      const end = i === 0 || i === TRUNK_STEPS;
      const hl = end ? trunkHalfL[i] : (trunkHalfL[i - 1] + 2 * trunkHalfL[i] + trunkHalfL[i + 1]) * 0.25;
      const hr = end ? trunkHalfR[i] : (trunkHalfR[i - 1] + 2 * trunkHalfR[i] + trunkHalfR[i + 1]) * 0.25;
      trunkLX[i] = trunkSpineX[i] - nx * hl;
      trunkLY[i] = trunkSpineY[i] - ny * hl;
      trunkRX[i] = trunkSpineX[i] + nx * hr;
      trunkRY[i] = trunkSpineY[i] + ny * hr;
    }
  }

  /* One band of the column, far end first, so the ribbon overlaps itself the way
     solid wood does. */
  function drawTrunkSegment(i) {
    const s = (trunkDepth[i] + trunkDepth[i + 1]) * 0.5;
    /* The column is solid, so it is painted solid. It used to be laid over the sky
       half-transparent and every joint then showed as a band where one quad's
       opacity ended and the next one began: an accordion of slabs, not a tree.
       Distance is carried by fog instead — but sparingly, and toward a fog darker
       than the sky. Washed to the sky's own brightness the wood turned to concrete
       a hundred steps up; what a night trunk actually does with distance is lose
       its relief and go blue-black before it goes pale. */
    const fog = clamp((0.24 - s) / 0.24, 0, 1) * 0.42;
    /* The tip where the taiga takes it, and the root the camera sits inside, are
       the only parts allowed to be see-through; both are places where a hard edge
       would be a cut in mid-air rather than wood running out of the scene. */
    const fade = clamp((s - 0.085) / 0.075, 0, 1)
      * (i === 0 ? 0.34 : i === 1 ? 0.62 : i === 2 ? 0.85 : 1);
    if (fade < 0.05) return;

    const dx = trunkSpineX[i + 1] - trunkSpineX[i];
    const dy = trunkSpineY[i + 1] - trunkSpineY[i];
    const len = Math.hypot(dx, dy);
    if (len < 0.01) return;
    const ux = dx / len;
    const uy = dy / len;
    let nx = (trunkNX[i] + trunkNX[i + 1]) * 0.5;
    let ny = (trunkNY[i] + trunkNY[i + 1]) * 0.5;
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl;
    ny /= nl;
    const span = Math.hypot(trunkRX[i] - trunkLX[i], trunkRY[i] - trunkLY[i]);
    const ps = BARK_PX * unit * s;
    const kx = span / BARK_H;
    /* screen = L + (u - U)·ps·along + v·kx·across, so the tile wraps the stem once
       however lopsided the two edges happen to be. The plate already carries the
       cylinder — dark at v = 0, lit at v = BARK_H — and the ribbon is built so that
       v = 0 is always the side turned away from the light, so one fill per band
       rounds the column. */
    barkMat.a = ps * ux;
    barkMat.b = ps * uy;
    barkMat.c = kx * nx;
    barkMat.d = kx * ny;
    barkMat.e = trunkLX[i] - ps * trunkU[i] * ux;
    barkMat.f = trunkLY[i] - ps * trunkU[i] * uy;

    ctx.globalAlpha = fade;
    const ext = Math.min(4.5, len * 0.16);
    trunkQuad(i, ux, uy, ext);
    barkPat.setTransform(barkMat);
    ctx.fillStyle = barkPat;
    ctx.fill();
    if (fog > 0.01) {
      ctx.fillStyle = `rgba(${trunkFogRGB[0]}, ${trunkFogRGB[1]}, ${trunkFogRGB[2]}, ${fog.toFixed(3)})`;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* The dead knots this step carries: one stub per position that falls inside
       the band, drawn from the silhouette outward and up the trunk, the way a larch
       holds its old branches. */
    const halfw = span * 0.5;
    const t0 = trunkT[i];
    const t1 = trunkT[i + 1];
    ctx.lineCap = "round";
    for (let k = 0; k < TRUNK_STUBS; k += 1) {
      const p = stubAt[k];
      if (p < t0 || p >= t1 || halfw < 1.6) continue;
      const f = (p - t0) / (t1 - t0 || 1);
      const right = stubSide[k] > 0;
      const ox = right ? nx : -nx;
      const oy = right ? ny : -ny;
      const ex = right ? trunkRX[i] + (trunkRX[i + 1] - trunkRX[i]) * f
        : trunkLX[i] + (trunkLX[i + 1] - trunkLX[i]) * f;
      const ey = right ? trunkRY[i] + (trunkRY[i + 1] - trunkRY[i]) * f
        : trunkLY[i] + (trunkLY[i + 1] - trunkLY[i]) * f;
      let vx = ox + ux * stubLean[k];
      let vy = oy + uy * stubLean[k];
      const vl = Math.hypot(vx, vy) || 1;
      vx /= vl;
      vy /= vl;
      const len = halfw * stubLen[k];
      const cx = ex + vx * len * 0.5 + ux * len * 0.3;
      const cy = ey + vy * len * 0.5 + uy * len * 0.3;
      const a = fade * (1 - fog * 0.7);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.quadraticCurveTo(cx, cy, ex + vx * len, ey + vy * len);
      ctx.lineWidth = Math.max(0.8, halfw * 0.32);
      ctx.strokeStyle = `rgba(22, 16, 12, ${(0.8 * a).toFixed(3)})`;
      ctx.stroke();
      ctx.lineWidth = Math.max(0.5, halfw * 0.12);
      ctx.strokeStyle = `rgba(132, 100, 60, ${(0.34 * a).toFixed(3)})`;
      ctx.stroke();
    }
    ctx.lineCap = "butt";

    ctx.beginPath();
    ctx.moveTo(trunkRX[i], trunkRY[i]);
    ctx.lineTo(trunkRX[i + 1], trunkRY[i + 1]);
    ctx.lineWidth = Math.max(0.5, 1.6 * unit * s);
    ctx.strokeStyle = `rgba(214, 168, 88, ${((0.10 + fog * 0.1) * (0.25 + s) * (phase === "idle" ? 2.6 : 1)).toFixed(3)})`;
    ctx.stroke();
  }

  /* Without the photograph there is nothing to map, so the column goes back to
     being painted: bands, because one flat fill piles up into a smudge where the
     trunk recedes and ends on a hard cut where it passes the camera. */
  function drawTrunkPainted() {
    const idle = phase === "idle";
    const rim = idle ? 3.2 : 1;
    ctx.lineJoin = "round";
    for (let b = 0; b < TRUNK_BANDS; b += 1) {
      const i0 = Math.round((b * TRUNK_STEPS) / TRUNK_BANDS);
      const i1 = Math.round(((b + 1) * TRUNK_STEPS) / TRUNK_BANDS);
      const s = trunkDepth[(i0 + i1) >> 1];
      const near = b === 0 ? 0.4 : 1;
      ctx.beginPath();
      ctx.moveTo(trunkLX[i0], trunkLY[i0]);
      for (let i = i0 + 1; i <= i1; i += 1) ctx.lineTo(trunkLX[i], trunkLY[i]);
      for (let i = i1; i >= i0; i -= 1) ctx.lineTo(trunkRX[i], trunkRY[i]);
      ctx.closePath();
      ctx.fillStyle = `rgba(19, 13, 9, ${(clamp(0.55 * near * (0.25 + s * 0.95) * (idle ? 1.35 : 1), 0, 0.8)).toFixed(3)})`;
      ctx.fill();

      ctx.beginPath();
      for (let i = i0; i <= i1; i += 1) {
        if (i === i0) ctx.moveTo(trunkRX[i], trunkRY[i]);
        else ctx.lineTo(trunkRX[i], trunkRY[i]);
      }
      ctx.lineWidth = Math.max(0.5, 1.5 * unit * s);
      ctx.strokeStyle = `rgba(233, 184, 110, ${(0.2 * near * (0.25 + s) * rim).toFixed(3)})`;
      ctx.stroke();
    }
  }

  function makeRing(index) {
    const z = index * RING_STEP;
    const [cx, cy] = pathAt(z);
    const mote = index % 2 === 1;
    return {
      z,
      cx,
      cy,
      r: (112 + ((index * 37) % 42)) * unit,
      prev: z,
      passed: false,
      glow: 0,
      hit: 0,
      mote: mote ? { a: (index * 2.4) % (Math.PI * 2), taken: false } : null,
    };
  }

  function buildTrack() {
    state.ringsList = [];
    for (let i = 1; i <= RINGS_AHEAD; i += 1) state.ringsList.push(makeRing(i));
  }

  function resetRun() {
    state.travel = 0;
    state.speed = calm() ? 185 : 240;
    state.targetSpeed = state.speed;
    const [startX, startY] = pathAt(RING_STEP);
    state.px = startX;
    state.py = startY;
    state.vx = 0;
    state.vy = 0;
    state.rings = 0;
    state.motes = 0;
    state.threads = 3;
    state.heaven = 0;
    state.shake = 0;
    state.flash = 0;
    state.sparks = [];
    state.trail = [];
    buildTrack();
    paint();
  }

  function paint() {
    heavenEl.textContent = state.heaven ? `${state.heaven}/${HEAVENS}` : `—/${HEAVENS}`;
    ringEl.textContent = String(state.rings).padStart(2, "0");
    moteEl.textContent = String(state.motes).padStart(2, "0");
    /* Three dots read as "black circle black circle black circle" to a screen
       reader; the count is the fact, the dots are the picture. */
    threadEl.textContent = "●".repeat(Math.max(0, state.threads)) + "○".repeat(Math.max(0, 3 - state.threads));
    threadEl.setAttribute("aria-label", state.threads + "/3");
    bestEl.textContent = String(best).padStart(2, "0");
  }

  function say(text) {
    msgEl.textContent = text;
  }

  function burst(x, y, tint, count) {
    if (calm()) return;
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const v = 55 + Math.random() * 240;
      const life = 0.45 + Math.random() * 0.65;
      state.sparks.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life,
        maxLife: life,
        size: 0.8 + Math.random() * 1.8,
        tint,
      });
    }
  }

  function tone(freq, gain, dur, pan) {
    if (!isSoundEnabled()) return;
    pluck(freq, { gain, dur, pan });
  }

  function crossRing(ring) {
    const d = Math.hypot(state.px - ring.cx, state.py - ring.cy);
    if (d < ring.r * 0.82) {
      ring.passed = true;
      ring.glow = 1;
      state.rings += 1;
      burst(state.px + w / 2, state.py + h / 2, "255, 224, 158", 28);
      state.targetSpeed = Math.min(calm() ? 300 : 430, state.targetSpeed + 5.5);
      tone(392 + (state.rings % 8) * 33, 0.05, 1.1, (state.rings % 2 ? 0.2 : -0.2));
      const completed = Math.floor(state.rings / RINGS_PER_HEAVEN);
      if (completed > state.heaven) {
        state.heaven = completed;
        if (!calm()) state.flash = 1;
        say(labels().heaven(completed));
        tone(660, 0.06, 1.8, 0);
      }
      if (state.rings >= RINGS_TOTAL) return finish(true);
    } else if (d < ring.r * 1.12) {
      ring.hit = 1;
      burst(state.px + w / 2, state.py + h / 2, "255, 157, 82", 18);
      say(labels().graze);
      tone(196, 0.04, 0.5, 0);
    } else {
      ring.hit = 1;
      burst(state.px + w / 2, state.py + h / 2, "224, 82, 54", 24);
      state.threads -= 1;
      state.shake = calm() ? 0 : 1;
      state.targetSpeed = Math.max(calm() ? 185 : 215, state.targetSpeed - 55);
      say(labels().hit);
      tone(110, 0.07, 0.7, 0);
      if (state.threads <= 0) return finish(false);
    }
    paint();
    return undefined;
  }

  function finish(crowned) {
    phase = "done";
    running = false;
    lastCrowned = crowned;
    stage.classList.remove("is-live");
    document.body.classList.remove("heavens-playing");
    keys.clear();
    pointer = null;
    cancelAnimationFrame(raf);
    beatRecord = state.rings > best && state.rings > 0;
    if (beatRecord) {
      best = state.rings;
      writeBest(state.rings);
    }
    paint();
    overlay.hidden = false;
    overlay.classList.add("is-result");
    resultEl.textContent = resultText();
    paintCard();
    if (crowned && !calm()) {
      state.flash = 1;
      tone(880, 0.07, 2.4, 0);
    }
  }

  function step(now) {
    if (!running) return;
    const elapsed = Math.max(0, now - last);
    const dt = Math.min(0.05, elapsed / 1000 || 0);
    last = now;
    advance(dt);
    draw();
    if (elapsed > 0 && elapsed < 2000) {
      frameAverage = frameAverage * 0.9 + elapsed * 0.1;
      qualityTicks += 1;
      if (frameAverage > 28) {
        fastFrames = 0;
        const sampleWindow = frameAverage > 80 ? 4 : 20;
        if (qualityTicks >= sampleWindow && renderQuality > 0.45) {
          renderQuality = Math.max(0.45, renderQuality * 0.8);
          qualityTicks = 0;
          resize();
        }
      } else if (frameAverage < 19) {
        qualityTicks = 0;
        fastFrames += 1;
        if (fastFrames >= 240 && renderQuality < 1) {
          renderQuality = Math.min(1, renderQuality + 0.1);
          fastFrames = 0;
          frameAverage = 24;
          resize();
        }
      } else {
        qualityTicks = 0;
        fastFrames = 0;
      }
    }
    raf = requestAnimationFrame(step);
  }

  /* Before the ascent starts, the world is still a world: the camera waits at
     the foot of the tree while the gates drift past it. The loop stops when the
     section leaves the screen, and never runs behind the pause or result card. */
  let idleRaf = 0;
  let visible = true;

  function idleStep(now) {
    idleRaf = 0;
    if (running || phase !== "idle" || !visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    state.travel += (calm() ? 6 : 34) * dt;
    for (const ring of state.ringsList) {
      if (ring.z - state.travel < -90) {
        ring.z += RING_STEP * RINGS_AHEAD;
        const fresh = makeRing(Math.round(ring.z / RING_STEP));
        Object.assign(ring, fresh, { prev: ring.z - state.travel });
      }
    }
    draw();
    idleRaf = requestAnimationFrame(idleStep);
  }

  function startIdle() {
    if (idleRaf || running || phase !== "idle" || !visible || document.hidden) return;
    /* Reduced motion: the cover is a still. An unattended drift is exactly the
       kind of animation that setting asks us not to run. */
    if (calm()) {
      draw();
      return;
    }
    last = performance.now();
    idleRaf = requestAnimationFrame(idleStep);
  }

  function stopIdle() {
    if (idleRaf) cancelAnimationFrame(idleRaf);
    idleRaf = 0;
  }

  function advance(dt) {
    // Smooth speed transitions
    const speedEase = Math.min(1, dt * 3);
    state.speed += (state.targetSpeed - state.speed) * speedEase;

    state.travel += state.speed * dt;

    /* A key held while focus moves inside the page — to the nav, to the language
       switch — never gets its keyup here, and the spark would ride the clamp to
       the end of the run. */
    if (keys.size && document.activeElement !== stage) keys.clear();

    /* Steering is dt-correct: the keys set a target velocity, and the spark
       eases onto it, so the feel is the same at 60fps and at 120fps. */
    const cruise = 640 * unit;
    const tx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
    const ty = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);

    if (pointer) {
      // Improved pointer physics with momentum and drift
      const dx = pointer[0] - state.px;
      const dy = pointer[1] - state.py;
      const dist = Math.hypot(dx, dy);

      // Accelerate toward pointer with spring-like feel
      const springStrength = Math.min(1, dt * 12);
      const damping = 0.85; // Momentum retention

      state.vx = state.vx * damping + dx * springStrength;
      state.vy = state.vy * damping + dy * springStrength;

      // Limit max velocity for control
      const maxVel = 800 * unit;
      const vel = Math.hypot(state.vx, state.vy);
      if (vel > maxVel) {
        state.vx = (state.vx / vel) * maxVel;
        state.vy = (state.vy / vel) * maxVel;
      }

      state.px += state.vx * dt;
      state.py += state.vy * dt;
    } else {
      // Improved keyboard physics with acceleration and drift
      const ease = Math.min(1, dt * 10);
      const acceleration = cruise * 1.2; // Slightly faster response
      const friction = 0.92; // Momentum retention when keys released

      // Apply acceleration toward target velocity
      const targetVx = tx * acceleration;
      const targetVy = ty * acceleration;

      state.vx += (targetVx - state.vx) * ease;
      state.vy += (targetVy - state.vy) * ease;

      // Add subtle drift when no input
      if (tx === 0) state.vx *= friction;
      if (ty === 0) state.vy *= friction;

      state.px += state.vx * dt;
      state.py += state.vy * dt;
    }

    const lim = [w / 2 - 18, h / 2 - 18];
    state.px = clamp(state.px, -lim[0], lim[0]);
    state.py = clamp(state.py, -lim[1], lim[1]);

    if (calm()) {
      state.trail.length = 0;
    } else {
      state.trail.unshift([state.px, state.py]);
      if (state.trail.length > 24) state.trail.pop();
    }

    for (const ring of state.ringsList) {
      if (phase !== "play") break;
      const rel = ring.z - state.travel;
      if (!ring.passed && ring.prev > 0 && rel <= 0) crossRing(ring);
      ring.prev = rel;
      ring.glow = Math.max(0, ring.glow - dt * 1.6);
      ring.hit = Math.max(0, ring.hit - dt * 2.2);
      if (phase === "play" && ring.mote && !ring.mote.taken) {
        const mr = Math.hypot(state.px - (ring.cx + Math.cos(ring.mote.a) * ring.r * 0.42), state.py - (ring.cy + Math.sin(ring.mote.a) * ring.r * 0.42));
        if (Math.abs(rel) < 40 && mr < 46 * unit) {
          ring.mote.taken = true;
          state.motes += 1;
          const mx = ring.cx + Math.cos(ring.mote.a) * ring.r * 0.42;
          const my = ring.cy + Math.sin(ring.mote.a) * ring.r * 0.42;
          const [sx, sy] = project(mx, my, Math.max(0, rel));
          burst(sx + w / 2, sy + h / 2, "213, 190, 255", 20);
          tone(985, 0.035, 0.6, 0);
          if (state.motes % 5 === 0 && state.threads > 0 && state.threads < 3) {
            state.threads += 1;
            say(labels().mend);
            tone(740, 0.045, 0.9, 0);
          }
          paint();
        }
      }
      if (rel < -90) {
        ring.z += RING_STEP * RINGS_AHEAD;
        const fresh = makeRing(Math.round(ring.z / RING_STEP));
        Object.assign(ring, fresh, { prev: ring.z - state.travel });
      }
    }

    const sparkDrag = Math.pow(0.09, dt);
    for (const s of state.sparks) {
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= sparkDrag;
      s.vy = s.vy * sparkDrag + 22 * dt;
    }
    state.sparks = state.sparks.filter((s) => s.life > 0);
    state.shake = Math.max(0, state.shake - dt * 3.4);
    state.flash = Math.max(0, state.flash - dt * 1.5);
  }

  let navigationRing = null;

  function drawHoop(ring, rel) {
    const [sx, sy, s] = project(ring.cx, ring.cy, rel);
    const cx = sx + w / 2;
    const cy = sy + h / 2;
    const depth = clamp(1 - rel / (RING_STEP * RINGS_AHEAD), 0, 1);
    /* A hoop that has just gone past the spark blows up around it, then dies. */
    const past = rel < 0 ? clamp(1 + rel / 90, 0, 1) : 1;
    const fog = depth * depth;
    const tint = ring.hit > 0 ? "200, 82, 54" : ring.passed ? "245, 217, 168" : ring === navigationRing ? "124, 214, 232" : "233, 184, 110";
    const idle = phase === "idle";
    /* On the cover nobody is steering yet and no ring is lit by the game, so the
       gates carry their own light — otherwise the first frame is an empty sky.
       They are also drawn wider: the cover is a poster, and a tunnel you can
       count is what sells the climb. */
    const cover = idle ? 1.9 + fog * 1.3 : 1;
    const r = ring.r * s * (idle ? 1.26 : 1);
    const lit = (0.1 + fog * 0.78 + ring.glow * 0.6) * past * cover;

    /* Every gate is a bough: a branch leaves the column and the collar is the
       twigs curled into a ring at its end. Nine circles hanging in the air with
       nothing holding them is the definition of a diagram. */
    if (r > 3 && past > 0.1) {
      const [twx, twy] = trunkAt(ring.z);
      const [bx, by] = project(twx, twy, rel);
      const tx = bx + w / 2;
      const ty = by + h / 2;
      const ddx = tx - cx;
      const ddy = ty - cy;
      const dd = Math.hypot(ddx, ddy) || 1;
      const rimx = cx + (ddx / dd) * r;
      const rimy = cy + (ddy / dd) * r;
      const girth = Math.max(0.9, 9 * unit * s);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo((tx + rimx) / 2 + (ddy / dd) * girth * 2.4,
        (ty + rimy) / 2 - (ddx / dd) * girth * 2.4 - 12 * unit * s, rimx, rimy);
      ctx.lineWidth = girth;
      ctx.strokeStyle = `rgba(41, 29, 20, ${(Math.min(0.9, 0.2 + s * 0.8) * past).toFixed(3)})`;
      ctx.stroke();
      ctx.lineWidth = girth * 0.42;
      ctx.strokeStyle = `rgba(158, 116, 66, ${(Math.min(0.5, 0.1 + s * 0.42) * past * (idle ? 2 : 1)).toFixed(3)})`;
      ctx.stroke();
    }

    /* the collar itself is wood before it is light */
    if (barkPat && r > 9 && past > 0.15) {
      const ps = BARK_PX * unit * s;
      barkMat.a = ps;
      barkMat.b = 0;
      barkMat.c = 0;
      barkMat.d = ps;
      barkMat.e = cx - (BARK_W / 2) * ps;
      barkMat.f = cy - (BARK_H / 2) * ps;
      barkPat.setTransform(barkMat);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(1.4, (5.4 + ring.glow * 3.4) * s * unit * 1.5);
      ctx.strokeStyle = barkPat;
      ctx.globalAlpha = Math.min(1, 0.3 + depth * 0.72) * past;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (r > 26 && past > 0.2) {
      ctx.save();
      ctx.lineCap = "round";
      const twigCount = renderQuality < 0.7 ? 7 : 14;
      for (let i = 0; i < twigCount; i += 1) {
        const seed = Math.sin(ring.z * 0.017 + i * 91.17) * 43758.5453;
        const rnd = seed - Math.floor(seed);
        const a = (i / twigCount) * Math.PI * 2 + rnd * 0.12;
        const reach = (3.5 + rnd * 8) * s * unit;
        const bx = cx + Math.cos(a) * r;
        const by = cy + Math.sin(a) * r;
        const tx = cx + Math.cos(a + 0.08) * (r + reach);
        const ty = cy + Math.sin(a + 0.08) * (r + reach);
        ctx.globalAlpha = Math.min(0.8, (0.22 + depth * 0.5) * past);
        ctx.strokeStyle = i % 3 ? "#5d4227" : "#b58a50";
        ctx.lineWidth = Math.max(0.45, (0.8 + rnd) * s * unit);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo((bx + tx) * 0.5 + Math.sin(a) * reach * 0.35,
          (by + ty) * 0.5 - Math.cos(a) * reach * 0.35, tx, ty);
        ctx.stroke();
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.1, 2.15);
      ctx.strokeStyle = `rgba(24, 16, 11, ${(0.42 * depth * past).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, 4.2 * s * unit);
      ctx.stroke();
    }

    /* Enhanced gate rendering with multiple glow layers */
    if (r > 44 && past > 0.2) {
      // Outer atmospheric glow
      const outerGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 2.5);
      outerGlow.addColorStop(0, `rgba(${tint}, ${(0.08 * past + ring.glow * 0.15).toFixed(3)})`);
      outerGlow.addColorStop(0.5, `rgba(${tint}, ${(0.03 * past).toFixed(3)})`);
      outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner disc with gradient
      const disc = ctx.createRadialGradient(cx, cy, r * 0.12, cx, cy, r);
      disc.addColorStop(0, `rgba(${tint}, ${(0.012 * past + ring.glow * 0.1).toFixed(3)})`);
      disc.addColorStop(0.78, `rgba(${tint}, ${(0.05 * fog * past).toFixed(3)})`);
      disc.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Rotating particle ring
      if (!calm() && r > 30) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const particleCount = renderQuality < 0.7 ? 6 : 12;
        const time = performance.now() * 0.001;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + time * 0.5 + ring.z * 0.01;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          const size = 2.5 * s * unit;
          const alpha = lit * 0.6 * (0.5 + 0.5 * Math.sin(time * 2 + i));
          ctx.fillStyle = `rgba(255, 250, 236, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    /* a hoop is a torus: one side catches the light, the other falls into it */
    const wide = Math.max(0.5, (1.5 + ring.glow * 3.2) * s * 1.6 * (idle ? 1.5 : 1));

    // Multi-layer rim with bloom
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // Outer bloom
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${tint}, ${(lit * 0.12).toFixed(3)})`;
    ctx.lineWidth = wide * 3;
    ctx.stroke();

    // Mid glow
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${tint}, ${(lit * 0.28).toFixed(3)})`;
    ctx.lineWidth = wide * 1.8;
    ctx.stroke();
    ctx.restore();

    // Core rim
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${tint}, ${(lit * 0.5).toFixed(3)})`;
    ctx.lineWidth = wide;
    ctx.stroke();

    // Bright arc highlight
    ctx.beginPath();
    ctx.arc(cx, cy, r, -2.5, -0.5);
    ctx.strokeStyle = `rgba(${tint}, ${Math.min(1, lit * 1.35).toFixed(3)})`;
    ctx.lineWidth = wide * 1.25;
    ctx.stroke();

    if (r > 12 && past > 0.15) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.arc(cx, cy, r, -2.2, -1.2);
      ctx.strokeStyle = `rgba(255, 250, 236, ${(lit * 0.5).toFixed(3)})`;
      ctx.lineWidth = wide * 0.7;
      ctx.stroke();
      ctx.restore();
    }

    if (ring === navigationRing && r > 10 && past > 0.15) {
      /* The next gate is a cold, broken orbit with a centre reticle; all other
         gates keep their plain warm wooden rims. No extra full-screen bloom. */
      ctx.save();
      ctx.strokeStyle = `rgba(158, 231, 242, ${Math.min(0.9, (0.4 + depth * 0.5) * past).toFixed(3)})`;
      ctx.lineWidth = Math.max(0.8, 1.7 * s * unit);
      ctx.setLineDash([Math.max(3, 11 * s * unit), Math.max(2, 7 * s * unit)]);
      ctx.beginPath();
      ctx.arc(cx, cy, r + Math.max(2, 4 * s * unit), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const mark = clamp(9 * s * unit, 3, 11);
      ctx.beginPath();
      ctx.moveTo(cx, cy - mark);
      ctx.lineTo(cx + mark, cy);
      ctx.lineTo(cx, cy + mark);
      ctx.lineTo(cx - mark, cy);
      ctx.closePath();
      ctx.moveTo(cx - mark * 1.6, cy);
      ctx.lineTo(cx - mark * 0.75, cy);
      ctx.moveTo(cx + mark * 0.75, cy);
      ctx.lineTo(cx + mark * 1.6, cy);
      ctx.stroke();
      ctx.fillStyle = "rgba(218, 250, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, 1.5 * s * unit), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (ring.mote && !ring.mote.taken && past > 0.2) {
      const mx = ring.cx + Math.cos(ring.mote.a) * ring.r * 0.42;
      const my = ring.cy + Math.sin(ring.mote.a) * ring.r * 0.42;
      const [dx, dy, ds] = project(mx, my, rel);
      const size = 7 * ds * unit * 1.4;
      const px = dx + w / 2;
      const py = dy + h / 2;
      if (size > 2.4) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const spark = ctx.createRadialGradient(px, py, 0, px, py, size * 3.2);
        spark.addColorStop(0, `rgba(237, 224, 255, ${(0.5 * past).toFixed(3)})`);
        spark.addColorStop(1, "rgba(190, 156, 244, 0)");
        ctx.fillStyle = spark;
        ctx.beginPath();
        ctx.arc(px, py, size * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = `rgba(213, 190, 255, ${((0.45 + depth * 0.55) * past).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(px, py - size);
      ctx.lineTo(px + size, py);
      ctx.lineTo(px, py + size);
      ctx.lineTo(px - size, py);
      ctx.closePath();
      ctx.fill();
    }
    if (ring.glow > 0.02) {
      const wave = 1 - ring.glow;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = ring.glow * 0.52;
      ctx.strokeStyle = "#ffe6ae";
      ctx.lineWidth = Math.max(0.6, wide * ring.glow * 1.8);
      ctx.beginPath();
      ctx.arc(cx, cy, r * (1 + wave * 0.48), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    return { cx, cy, r, depth };
  }

  function draw() {
    const time = performance.now() / 1000;
    const up = clamp(state.rings / RINGS_TOTAL, 0, 1);
    /* The cover parks the camera at the foot of the tree, where the sky really
       is near-black — but the first frame is also the invitation, so it borrows
       the light of the fourth heaven. The gates read against a horizon instead
       of against a void, and the promise of the climb is in the picture. */
    const view = phase === "idle" ? Math.max(up, 0.42) : up;
    const shakeX = state.shake ? (Math.random() - 0.5) * 14 * state.shake : 0;
    const shakeY = state.shake ? (Math.random() - 0.5) * 14 * state.shake : 0;
    /* The sky is opaque and exactly frame-sized, so it doubles as the clear. It
       goes down before the shake: the camera jolts, the world behind it does
       not, which is what a jolt actually looks like. */
    ctx.drawImage(skyAt(view), 0, 0, w, h);
    trunkFogRGB = mixRGB([9, 12, 19], skyOf(view).mid, 0.4);
    ctx.save();
    ctx.translate(shakeX, shakeY);
    drawStars(view, time);
    drawAtmosphere(view, time);

    ctx.lineJoin = "round";
    navigationRing = null;
    if (phase === "play") {
      let nearest = Infinity;
      for (const ring of state.ringsList) {
        const rel = ring.z - state.travel;
        if (!ring.passed && rel >= 0 && rel < nearest) {
          navigationRing = ring;
          nearest = rel;
        }
      }
    }
    const ordered = state.ringsList.slice().sort((a, b) => b.z - a.z);
    const simpleTrunk = renderQuality < 0.6 && frameAverage > 60;
    computeTrunk();
    if (barkPat && !simpleTrunk) {
      /* Column and gates in one depth pass. The trunk is a body the gates swing
         around, so a far gate must be able to sit behind it — painting the whole
         ribbon underneath every hoop is what flattens the scene into a diagram. */
      let k = 0;
      for (const ring of ordered) {
        const rel = ring.z - state.travel;
        if (renderQuality < 0.7 && rel > RING_STEP * 8) continue;
        while (k < TRUNK_STEPS && trunkRelZ[trunkOrder[k]] > rel) {
          drawTrunkSegment(trunkOrder[k]);
          k += 1;
        }
        drawHoop(ring, rel);
      }
      while (k < TRUNK_STEPS) {
        drawTrunkSegment(trunkOrder[k]);
        k += 1;
      }
    } else {
      drawTrunkPainted();
      for (const ring of ordered) {
        const rel = ring.z - state.travel;
        if (renderQuality >= 0.7 || rel <= RING_STEP * 8) drawHoop(ring, rel);
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const s of state.sparks) {
      const life = clamp(s.life / s.maxLife, 0, 1);
      const tail = 0.025 + life * 0.035;
      ctx.globalAlpha = life * life * 0.7;
      ctx.strokeStyle = `rgba(${s.tint}, 0.8)`;
      ctx.lineWidth = Math.max(0.5, s.size * life);
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * tail, s.y - s.vy * tail);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.globalAlpha = life * 0.9;
      ctx.fillStyle = `rgba(${s.tint}, 0.9)`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 0.5 + s.size * life, 0, Math.PI * 2);
      ctx.fill();
      if (s.size > 1.8) {
        ctx.globalAlpha = life * 0.8;
        ctx.fillStyle = "#fff8e8";
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.45, s.size * life * 0.35), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    const trail = state.trail;
    if (trail.length > 1) {
      for (let pass = 0; pass < 2; pass += 1) {
        ctx.strokeStyle = pass ? "#ffe8b8" : "#d89b50";
        for (let i = trail.length - 1; i > 0; i -= 1) {
          const fall = 1 - i / trail.length;
          ctx.globalAlpha = fall * fall * (pass ? 0.58 : 0.12);
          ctx.lineWidth = Math.max(0.4, fall * (pass ? 2.2 : 10.5) * unit);
          ctx.beginPath();
          ctx.moveTo(trail[i][0] + w / 2, trail[i][1] + h / 2);
          ctx.lineTo(trail[i - 1][0] + w / 2, trail[i - 1][1] + h / 2);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    const px = state.px + w / 2;
    const py = state.py + h / 2;
    const pulse = calm() ? 1 : 1 + Math.sin(time * 5.2) * 0.055;
    const bloom = 48 * unit * pulse * (1 + Math.min(0.32, state.speed / 1300));
    const halo = ctx.createRadialGradient(px, py, 0, px, py, bloom);
    halo.addColorStop(0, "rgba(255, 254, 246, 0.96)");
    halo.addColorStop(0.1, "rgba(255, 239, 196, 0.72)");
    halo.addColorStop(0.32, "rgba(244, 190, 104, 0.24)");
    halo.addColorStop(0.68, "rgba(219, 137, 62, 0.07)");
    halo.addColorStop(1, "rgba(219, 137, 62, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(px, py, bloom, 0, Math.PI * 2);
    ctx.fill();

    const spike = 23 * unit * pulse;
    const chromaOffset = 1.2 * unit;
    ctx.lineWidth = Math.max(0.55, unit);
    ctx.strokeStyle = "rgba(255, 129, 96, 0.2)";
    ctx.beginPath();
    ctx.moveTo(px - spike - chromaOffset, py);
    ctx.lineTo(px + spike - chromaOffset, py);
    ctx.moveTo(px - chromaOffset, py - spike);
    ctx.lineTo(px - chromaOffset, py + spike);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 174, 104, 0.22)";
    ctx.beginPath();
    ctx.moveTo(px - spike + chromaOffset, py);
    ctx.lineTo(px + spike + chromaOffset, py);
    ctx.moveTo(px + chromaOffset, py - spike);
    ctx.lineTo(px + chromaOffset, py + spike);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 250, 232, 0.62)";
    ctx.beginPath();
    ctx.moveTo(px - spike, py);
    ctx.lineTo(px + spike, py);
    ctx.moveTo(px, py - spike);
    ctx.lineTo(px, py + spike);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 218, 153, 0.24)";
    ctx.beginPath();
    ctx.moveTo(px - spike * 0.48, py - spike * 0.48);
    ctx.lineTo(px + spike * 0.48, py + spike * 0.48);
    ctx.moveTo(px + spike * 0.48, py - spike * 0.48);
    ctx.lineTo(px - spike * 0.48, py + spike * 0.48);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 210, 129, 0.72)";
    ctx.beginPath();
    ctx.arc(px, py, 6.6 * unit * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fffdf6";
    ctx.beginPath();
    ctx.arc(px, py, 3.4 * unit, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.arc(px - 0.8 * unit, py - 0.9 * unit, 1.35 * unit, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(244, 220, 168, ${(state.flash * 0.14).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function start() {
    stopIdle();
    resetRun();
    phase = "play";
    running = true;
    last = performance.now();
    resize();
    stage.classList.add("is-live");
    document.body.classList.add("heavens-playing");
    /* The card holding the start button is about to leave the layout. If nothing
       takes the focus, it falls to <body> and the arrow keys scroll the page
       instead of steering the spark — so the stage takes it first. */
    stage.focus({ preventScroll: true });
    /* A phone can land with the foot of the playfield under its own fold, and a
       live canvas answers drags with steering, not scrolling. Centre it. */
    const box = stage.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) {
      stage.scrollIntoView({ block: "center", behavior: calm() ? "auto" : "smooth" });
    }
    overlay.classList.remove("is-result");
    overlay.hidden = true;
    say(labels().ready);
    paintCard();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }

  function pause() {
    if (phase !== "play") return;
    phase = "pause";
    running = false;
    keys.clear();
    pointer = null;
    stage.classList.remove("is-live");
    document.body.classList.remove("heavens-playing");
    cancelAnimationFrame(raf);
    say(labels().paused);
    overlay.hidden = false;
    overlay.classList.remove("is-result");
    paintCard();
  }

  function resume() {
    if (phase !== "pause") return;
    phase = "play";
    running = true;
    last = performance.now();
    resize();
    stage.classList.add("is-live");
    document.body.classList.add("heavens-playing");
    /* The card is about to be hidden with the button still inside it. Focus left
       there falls to <body>, and a player who paused with the mouse would find
       the arrows scrolling the page instead of steering. */
    stage.focus({ preventScroll: true });
    overlay.hidden = true;
    /* The paused line must not linger over a flying spark. */
    say(labels().ready);
    paintCard();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }

  /* Escape from a paused card, or from the death frame: the cover comes back and
     the world starts drifting again instead of staying frozen mid-collapse. */
  function toIdle() {
    if (phase === "idle") return;
    phase = "idle";
    running = false;
    keys.clear();
    pointer = null;
    beatRecord = false;
    stage.classList.remove("is-live");
    document.body.classList.remove("heavens-playing");
    cancelAnimationFrame(raf);
    resetRun();
    resize();
    overlay.hidden = false;
    overlay.classList.remove("is-result");
    say(labels().ready);
    paintCard();
    startIdle();
  }

  startBtn.addEventListener("click", () => {
    stopIdle();
    if (phase === "pause") resume();
    else start();
  });

  /* The field is short, and a cursor that grazes its edge is the player asking
     for the rail — not for the spark to stop dead mid-flight. So the target is
     clamped to the frame and released never; a re-click takes the focus back. */
  const steer = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer = [
      clamp(event.clientX - rect.left - w / 2, 18 - w / 2, w / 2 - 18),
      clamp(event.clientY - rect.top - h / 2, 18 - h / 2, h / 2 - 18),
    ];
  };
  canvas.addEventListener("pointermove", (event) => {
    if (phase !== "play") return;
    steer(event);
  });
  canvas.addEventListener("pointerdown", (event) => {
    stage.focus({ preventScroll: true });
    if (phase !== "play") return;
    steer(event);
    canvas.setPointerCapture?.(event.pointerId);
  });

  const KEY_MAP = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    a: "left",
    d: "right",
    w: "up",
    s: "down",
  };

  /* Physical codes first: on a Cyrillic layout the same keys read ы/ф/в/а, and a
     Russian player pressing the keys the help line names would steer nothing. */
  const CODE_MAP = { KeyA: "left", KeyD: "right", KeyW: "up", KeyS: "down" };
  const dirOf = (event) =>
    CODE_MAP[event.code] || KEY_MAP[event.key] || KEY_MAP[event.key.toLowerCase?.()];

  stage.addEventListener("keydown", (event) => {
    const dir = dirOf(event);
    /* Arrows belong to the page until a run is actually flying. Cancelling them
       in every phase leaves a paused player unable to scroll away from the card. */
    if (dir) {
      if (phase !== "play") return;
      event.preventDefault();
      pointer = null;
      keys.add(dir);
      return;
    }
    if (event.key === "Escape") {
      if (phase === "play") {
        event.preventDefault();
        pause();
      } else if (phase === "pause" || phase === "done") {
        event.preventDefault();
        toIdle();
      }
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      /* The button activates itself when it holds focus, and a held Space would
         otherwise flip pause and resume thirty times a second. */
      if (event.repeat || event.target === startBtn || event.target === pauseBtn) return;
      event.preventDefault();
      if (phase === "play") pause();
      else if (phase === "pause") resume();
      else start();
    }
  });
  stage.addEventListener("keyup", (event) => {
    const dir = dirOf(event);
    if (dir) keys.delete(dir);
  });
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      stage.focus({ preventScroll: true });
      pause();
    });
  }
  window.addEventListener("blur", () => {
    keys.clear();
    pause();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else startIdle();
  });
  window.addEventListener("resize", resize);
  /* The idle drift is free on a screen nobody is looking at — and a run is not
     worth playing off-screen: it would spend its threads behind the footer. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) startIdle();
      else {
        stopIdle();
        if (phase === "play") pause();
      }
    }, { rootMargin: "160px" }).observe(stage);
  }
  window.addEventListener("langchange", () => {
    paintCard();
    if (phase === "done") {
      resultEl.textContent = resultText();
    } else if (phase === "pause") {
      say(labels().paused);
    } else if (phase === "idle") {
      say(labels().ready);
    }
    /* Mid-flight the last gameplay line stays on the screen: it is the player's
       own commentary, not a prompt to start over. */
  });

  resize();
  resetRun();
  say(labels().ready);
  paintCard();
  draw();
  startIdle();

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    ro.observe(stage);
  }

  window.addEventListener("load", () => {
    resize();
    if (!running) draw();
  });

  return { start, pause, resume };
}

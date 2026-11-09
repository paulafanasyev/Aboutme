/* Site shell: language, navigation, reveals, spotlight, sound, toast.
   Modules receive getLang() and re-render on the langchange event. */

/* `has-js` arms every reveal on the page, so it is added here rather than in the
   head: if this module — or any of the eleven it imports — 404s or fails to
   parse, the honest state is the content standing in the open, not forty-nine
   elements parked at opacity zero with only the navigation above them. The
   inline script in the head still drops `no-js`, so the chrome appears either
   way and nothing flickers. */
document.documentElement.classList.add("has-js");

import { TRANSLATIONS } from "./content.js";
import { initHero } from "./hero.js";
import { initDeeds } from "./deeds.js";
import { initWorlds } from "./worlds.js";
import { initHeavens } from "./heavens.js";
import { initArena } from "./arena.js";
import { initCraft } from "./craft.js";
import { initVerse } from "./verse.js";
import { initKhomus } from "./khomus.js";
import { initContact } from "./contact.js";
import { initChat } from "./chat.js";
import { initAlas } from "./alas.js";
import {
  isSoundEnabled,
  setSoundEnabled,
  restoreSoundPreference,
} from "./audio.js";

const LANG_KEY = "olonkho-lang";
const LANGS = ["ru", "en", "sah", "vi"];
const OG_LOCALE = { ru: "ru_RU", en: "en_US", sah: "sah_RU", vi: "vi_VN" };

/* The toggle governs the drone and the struck tones the page answers with. The
   khomus is an instrument you play on purpose and sounds whatever this switch
   says, so the switch names itself "ambient" rather than promising to silence
   everything on the page. A toggle button names the thing it switches and lets
   aria-pressed carry which way it is; an action label on top of that reads as a
   contradiction. */
const soundText = {
  ru: { label: "Фоновый звук", toastOn: "Фоновый звук включён", toastOff: "Фоновый звук выключен" },
  en: { label: "Ambient sound", toastOn: "Ambient sound enabled", toastOff: "Ambient sound muted" },
  sah: { label: "Тыас", toastOn: "Тыас холбонулунна", toastOff: "Тыас умурулунна" },
  vi: { label: "Âm nền", toastOn: "Đã bật âm nền", toastOff: "Đã tắt âm nền" },
};

function readLang() {
  try {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (LANGS.includes(param)) return param;
    const stored = localStorage.getItem(LANG_KEY);
    return LANGS.includes(stored) ? stored : "ru";
  } catch {
    return "ru";
  }
}

function writeLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* private mode */
  }
  try {
    const url = new URL(window.location.href);
    if (lang === "ru") url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang);
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  } catch {
    /* history may be restricted */
  }
}

function buildI18n() {
  const text = Array.from(document.querySelectorAll("[data-i18n]")).map((el) => ({
    el,
    key: el.getAttribute("data-i18n"),
    original: el.textContent,
  }));
  const html = Array.from(document.querySelectorAll("[data-i18n-html]")).map((el) => ({
    el,
    key: el.getAttribute("data-i18n-html"),
    original: el.innerHTML,
  }));
  const aria = Array.from(document.querySelectorAll("[data-i18n-aria]")).map((el) => ({
    el,
    key: el.getAttribute("data-i18n-aria"),
    original: el.getAttribute("aria-label") || "",
  }));
  const placeholder = Array.from(document.querySelectorAll("[data-i18n-placeholder]")).map((el) => ({
    el,
    key: el.getAttribute("data-i18n-placeholder"),
    original: el.getAttribute("placeholder") || "",
  }));
  /* Alt is the only text a screen reader gets from a photograph, so it belongs
     to the dictionary as much as a heading does. */
  const alt = Array.from(document.querySelectorAll("[data-i18n-alt]")).map((el) => ({
    el,
    key: el.getAttribute("data-i18n-alt"),
    original: el.getAttribute("alt") || "",
  }));

  const title = document.title;
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  const descriptionOriginal = metaDescription?.getAttribute("content") || "";
  const ogTitleOriginal = ogTitle?.getAttribute("content") || "";
  const ogDescriptionOriginal = ogDescription?.getAttribute("content") || "";

  return { text, html, aria, placeholder, alt, title, descriptionOriginal, ogTitleOriginal, ogDescriptionOriginal, ogLocale, metaDescription, ogTitle, ogDescription };
}

function init() {
  let lang = readLang();
  const i18n = buildI18n();
  const getLang = () => lang;

  const progress = document.getElementById("scrollProgress");
  const nav = document.getElementById("nav");
  const spotlight = document.getElementById("spotlight");
  const toastEl = document.getElementById("toast");
  const soundToggle = document.getElementById("soundToggle");
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menuBtn");
  const menuClose = document.getElementById("menuClose");

  let toastTimer = 0;
  function toast(message) {
    if (!toastEl || !message) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  function syncSound() {
    if (!soundToggle) return;
    const on = soundUI;
    /* A toggle button names the thing it switches; aria-pressed carries which
       way it is, and an action label on top of it reads as a contradiction. */
    soundToggle.setAttribute("aria-pressed", String(on));
    soundToggle.setAttribute("aria-label", (soundText[lang] || soundText.ru).label);
  }

  function applyLang(next, { initial = false } = {}) {
    lang = LANGS.includes(next) ? next : "ru";
    writeLang(lang);
    document.documentElement.lang = lang;

    const table = TRANSLATIONS[lang];
    const pick = (key, original) => (table && table[key] != null ? table[key] : original);

    i18n.text.forEach(({ el, key, original }) => {
      el.textContent = pick(key, original);
    });
    i18n.html.forEach(({ el, key, original }) => {
      el.innerHTML = pick(key, original);
    });
    i18n.aria.forEach(({ el, key, original }) => {
      el.setAttribute("aria-label", pick(key, original));
    });
    i18n.placeholder.forEach(({ el, key, original }) => {
      el.setAttribute("placeholder", pick(key, original));
    });
    i18n.alt.forEach(({ el, key, original }) => {
      el.setAttribute("alt", pick(key, original));
    });

    document.title = pick("pageTitle", i18n.title);
    if (i18n.metaDescription) {
      i18n.metaDescription.setAttribute("content", pick("pageDescription", i18n.descriptionOriginal));
    }
    if (i18n.ogTitle) {
      i18n.ogTitle.setAttribute("content", pick("pageTitle", i18n.ogTitleOriginal));
    }
    if (i18n.ogDescription) {
      i18n.ogDescription.setAttribute(
        "content",
        pick("pageDescription", i18n.ogDescriptionOriginal)
      );
    }
    if (i18n.ogLocale) {
      i18n.ogLocale.setAttribute("content", OG_LOCALE[lang]);
    }

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-lang") === lang));
    });

    syncSound();

    if (!initial) {
      window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
    }
  }

  /* ---------- language switches ---------- */

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.getAttribute("data-lang");
      if (next === lang) return;
      applyLang(next);
      if (menu?.classList.contains("is-open")) closeMenu();
    });
  });

  /* ---------- mobile menu ---------- */

  let lastFocus = null;

  function focusables() {
    if (!menu) return [];
    return Array.from(menu.querySelectorAll('a[href], button:not([disabled])')).filter(
      (el) => el.offsetParent !== null || el === menuClose
    );
  }

  function openMenu() {
    if (!menu || !menuBtn) return;
    lastFocus = document.activeElement;
    menu.classList.add("is-open");
    menu.removeAttribute("inert");
    menu.setAttribute("aria-hidden", "false");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-locked");
    menuClose?.focus({ preventScroll: true });
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (!menu || !menuBtn) return;
    menu.classList.remove("is-open");
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    if (restoreFocus && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  menuBtn?.addEventListener("click", () => {
    if (menu?.classList.contains("is-open")) closeMenu();
    else openMenu();
  });
  menuClose?.addEventListener("click", closeMenu);
  menu?.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href")?.replace("#", "");
      closeMenu({ restoreFocus: false });
      const target = id ? document.getElementById(id) : null;
      /* The ascent asks for the stage rather than its heading: focus on a heading
         leaves Space scrolling the page instead of starting the run. */
      const wanted = link.dataset.focus ? document.querySelector(link.dataset.focus) : null;
      const heading = target?.querySelector("h1, h2");
      const anchor = wanted || heading;
      if (!anchor) return;
      if (!wanted) anchor.setAttribute("tabindex", "-1");
      window.requestAnimationFrame(() => anchor.focus({ preventScroll: true }));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.classList.contains("is-open")) {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== "Tab" || !menu?.classList.contains("is-open")) return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- sound ---------- */

  let soundWanted = restoreSoundPreference();
  let soundUI = soundWanted;
  if (soundToggle) {
    syncSound();
    soundToggle.addEventListener("click", () => {
      const next = !soundUI;
      const applied = setSoundEnabled(next);
      soundWanted = applied;
      soundUI = applied;
      syncSound();
      toast(applied ? soundText[lang].toastOn : soundText[lang].toastOff);
    });
  }

  window.addEventListener("soundchange", (event) => {
    soundWanted = Boolean(event.detail?.enabled);
    soundUI = soundWanted;
    syncSound();
  });

  document.addEventListener(
    "pointerdown",
    () => {
      if (soundWanted && !isSoundEnabled()) {
        setSoundEnabled(true, { silent: true });
        soundUI = true;
        syncSound();
      }
    },
    { once: true, capture: true }
  );

  /* ---------- scroll progress, nav state, rail ---------- */

  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const railLinks = Array.from(document.querySelectorAll(".rail a[data-section]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-links a[data-nav]"));

  function setActive(id) {
    railLinks.forEach((link) => {
      const on = link.getAttribute("data-section") === id;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    navLinks.forEach((link) => {
      const on = link.getAttribute("data-nav") === id;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const activeSection = document.getElementById(id);
    document.body.classList.toggle("on-paper", Boolean(activeSection?.classList.contains("is-paper")));
  }

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progress) progress.style.transform = `scaleX(${ratio.toFixed(4)})`;

      nav?.classList.toggle("is-scrolled", y > 28);

      const probe = y + window.innerHeight * 0.34;
      let active = sections[0]?.id || "home";
      for (const section of sections) {
        if (section.offsetTop <= probe) active = section.id;
      }
      if (max - y < 8) active = sections[sections.length - 1]?.id || active;
      setActive(active);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- reveal ---------- */

  const reveals = Array.from(document.querySelectorAll(".reveal"));
  reveals.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const siblings = Array.from(parent.children).filter((child) => child.classList.contains("reveal"));
    const order = siblings.indexOf(el);
    if (order > 0) el.style.setProperty("--delay", `${Math.min(order, 6) * 70}ms`);
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  function revealVisible() {
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("is-in");
    });
  }
  window.addEventListener("load", revealVisible);
  window.addEventListener("hashchange", () => window.setTimeout(revealVisible, 80));
  window.setTimeout(revealVisible, 700);

  /* ---------- spotlight ---------- */

  if (spotlight && window.matchMedia("(pointer: fine)").matches) {
    let sx = window.innerWidth / 2;
    let sy = window.innerHeight / 2;
    let cx = sx;
    let cy = sy;
    let following = false;

    const loop = () => {
      cx += (sx - cx) * 0.12;
      cy += (sy - cy) * 0.12;
      spotlight.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(sx - cx) > 0.4 || Math.abs(sy - cy) > 0.4) requestAnimationFrame(loop);
      else following = false;
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        sx = event.clientX;
        sy = event.clientY;
        document.body.classList.add("has-pointer");
        if (!following) {
          following = true;
          requestAnimationFrame(loop);
        }
      },
      { passive: true }
    );
    document.addEventListener("pointerleave", () => document.body.classList.remove("has-pointer"));
  }

  /* ---------- modules ---------- */

  initHero(document.getElementById("sky"));
  initDeeds();
  initWorlds({ getLang });
  initHeavens({ getLang });
  initArena({ getLang });
  initCraft({ getLang });
  initVerse({ getLang });
  initKhomus();
  initContact({ getLang });
  initChat({ getLang });
  initAlas();

  applyLang(lang, { initial: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

/* Three-world diagram: a small tablist with roving focus,
   a cross-fade panel and language-aware content. */

import { WORLDS } from "./content.js";

/* One real photograph per world. The place names and the credits are proper
   nouns, so they stay the same in every language; the alt text is not a proper
   noun, so each world carries its own description per locale in WORLDS. */
const PLATES = {
  upper: { src: "assets/img/verkhoyansk.webp", place: "Verkhoyansk Range", credit: "Ilya Varlamov · CC BY-SA 3.0 · Wikimedia Commons" },
  middle: { src: "assets/img/lena-pillars.webp", place: "Lena Pillars", credit: "Hardscarf · CC BY-SA 4.0 · Wikimedia Commons" },
  lower: { src: "assets/img/oymyakon.webp", place: "Oymyakon", credit: "Ilya Varlamov · CC BY-SA 4.0 · Wikimedia Commons" },
};

export function initWorlds({ getLang }) {
  const panel = document.getElementById("worldPanel");
  const inner = panel?.querySelector("[data-world-panel]");
  if (!panel || !inner) return;

  const plateImg = document.getElementById("worldPlateImg");
  const platePlace = document.getElementById("worldPlatePlace");
  const plateCredit = document.getElementById("worldPlateCredit");

  const tabs = Array.from(document.querySelectorAll(".world-node[data-world]"));
  const fields = {
    eyebrow: inner.querySelector('[data-world-field="eyebrow"]'),
    title: inner.querySelector('[data-world-field="title"]'),
    subtitle: inner.querySelector('[data-world-field="subtitle"]'),
    metaphor: inner.querySelector('[data-world-field="metaphor"]'),
    copy: inner.querySelector('[data-world-field="copy"]'),
    tags: inner.querySelector('[data-world-field="tags"]'),
  };
  const index = inner.querySelector(".w-index");

  let current = tabs.find((t) => t.getAttribute("aria-selected") === "true")?.dataset.world || "middle";
  let token = 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function apply(world) {
    const data = WORLDS[getLang()]?.[world] || WORLDS.ru[world];
    if (!data) return;
    if (index) index.textContent = data.index;
    fields.eyebrow.textContent = data.eyebrow;
    fields.title.textContent = data.title;
    fields.subtitle.textContent = data.subtitle;
    fields.metaphor.textContent = data.metaphor;
    fields.copy.textContent = data.copy;
    fields.tags.replaceChildren(
      ...data.tags.map((tag) => {
        const span = document.createElement("span");
        span.textContent = tag;
        return span;
      })
    );

    tabs.forEach((tab) => {
      const selected = tab.dataset.world === world;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    const active = tabs.find((t) => t.dataset.world === world);
    if (active) panel.setAttribute("aria-labelledby", active.id);

    const plate = PLATES[world];
    if (plate && plateImg) {
      if (plateImg.dataset.world !== world) {
        plateImg.src = plate.src;
        plateImg.dataset.world = world;
      }
      plateImg.alt = data.alt || `${plate.place} — ${data.subtitle}`;
      if (platePlace) platePlace.textContent = `${data.title} · ${plate.place}`;
      if (plateCredit) plateCredit.textContent = plate.credit;
    }
  }

  function select(world, { animate = true, focus = false } = {}) {
    if (!WORLDS.ru[world]) return;
    const changed = world !== current;
    current = world;

    tabs.forEach((tab) => {
      const selected = tab.dataset.world === world;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    const active = tabs.find((t) => t.dataset.world === world);
    if (active) {
      panel.setAttribute("aria-labelledby", active.id);
      if (focus) active.focus({ preventScroll: true });
    }

    if (!changed) {
      apply(world);
      return;
    }

    if (!animate || reduce.matches) {
      apply(world);
      return;
    }

    const mine = ++token;
    inner.classList.add("is-switching");
    window.setTimeout(() => {
      if (mine !== token) return;
      apply(world);
      inner.classList.remove("is-switching");
    }, 200);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab.dataset.world));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = i;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (i + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      select(tabs[next].dataset.world, { focus: true });
    });

    /* 3D tilt + glow that follows the pointer — the card leans into the
       cursor the way a physical badge tilts under a fingertip. */
    let tiltRAF = 0;
    tab.addEventListener("pointermove", (event) => {
      const rect = tab.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 18;
      const rotateX = (0.5 - y) * 18;
      cancelAnimationFrame(tiltRAF);
      tiltRAF = requestAnimationFrame(() => {
        tab.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        tab.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
        tab.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
        tab.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);
        tab.classList.add("is-tilted");
      });
    });
    tab.addEventListener("pointerleave", () => {
      cancelAnimationFrame(tiltRAF);
      tab.classList.remove("is-tilted");
    });
  });

  apply(current);

  window.addEventListener("langchange", () => apply(current));
}

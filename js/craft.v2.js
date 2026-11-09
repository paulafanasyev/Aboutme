/* The craft orbit: 24 chips placed on three rings,
   with a live caption that explains each tool. */

import { CRAFT } from "./content.v2.v2.js";

export function initCraft({ getLang }) {
  const orbit = document.getElementById("orbit");
  const title = document.getElementById("craftTitle");
  const note = document.getElementById("craftNote");
  if (!orbit || !title || !note) return;

  let data = CRAFT[getLang()] || CRAFT.ru;
  let active = null;

  function resetCaption() {
    title.textContent = data.defaultTitle;
    note.textContent = data.defaultNote;
    active = null;
  }

  function focusChip(button, chip, group) {
    if (active === button) return;
    active?.classList.remove("is-active");
    active = button;
    button.classList.add("is-active");
    title.textContent = chip.name;
    note.textContent = `${chip.note} · ${group.label}`;
  }

  function render() {
    data = CRAFT[getLang()] || CRAFT.ru;
    orbit.querySelectorAll(".chip, .chip-group-label").forEach((el) => el.remove());
    active = null;

    const frag = document.createDocumentFragment();
    const layerKeys = ["core", "layers", "practice"];
    data.groups.forEach((group, gi) => {
      const groupLabel = document.createElement("span");
      groupLabel.className = "chip-group-label";
      groupLabel.textContent = group.label;
      frag.append(groupLabel);

      const step = 360 / group.chips.length;
      group.chips.forEach((chip, i) => {
        const angle = ((group.start + step * i) * Math.PI) / 180;
        const x = 50 + Math.cos(angle) * group.radius;
        const y = 50 + Math.sin(angle) * group.radius;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "chip";
        button.style.left = `${x.toFixed(3)}%`;
        button.style.top = `${y.toFixed(3)}%`;
        button.dataset.group = group.label;
        button.setAttribute("aria-label", `${chip.name}: ${chip.note}`);

        const dot = document.createElement("span");
        dot.className = "chip-dot chip-dot--" + (layerKeys[gi] || "practice");
        dot.setAttribute("aria-hidden", "true");
        const name = document.createElement("span");
        name.className = "chip-name";
        name.textContent = chip.name;
        button.append(dot, name);

        button.addEventListener("mouseenter", () => focusChip(button, chip, group));
        button.addEventListener("focus", () => focusChip(button, chip, group));
        button.addEventListener("click", () => focusChip(button, chip, group));
        button.addEventListener("mouseleave", () => {
          if (document.activeElement !== button) resetCaption();
        });
        button.addEventListener("blur", () => {
          if (!button.matches(":hover")) resetCaption();
        });

        frag.append(button);
      });
    });

    orbit.append(frag);
    resetCaption();
  }

  render();
  window.addEventListener("langchange", render);
}

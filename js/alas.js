export function initAlas() {
  const frame = document.getElementById("alasFrame");
  const overlay = document.getElementById("alasOverlay");
  const loadBtn = document.getElementById("alasLoadBtn");
  const embed = frame?.closest(".alas-embed");
  if (!frame || !embed) return;

  let loaded = false;

  function loadAlas() {
    if (loaded) return;
    loaded = true;
    const src = frame.dataset.src || frame.getAttribute("data-src") || "alas/";
    frame.src = src;
    frame.addEventListener("load", () => {
      embed.classList.add("is-loaded");
      if (overlay) overlay.style.opacity = "0";
      if (overlay) overlay.style.pointerEvents = "none";
    }, { once: true });
  }

  loadBtn?.addEventListener("click", loadAlas);
}

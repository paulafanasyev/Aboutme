/* Six inline SVG plates for the deeds. Each is drawn from primitives —
   no raster images, no icon fonts, no external requests. */

const wrap = (inner) =>
  `<svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${inner}</svg>`;

const line = (d, cls = "art-line") => `<path class="${cls}" d="${d}" />`;

const ART = {
  sun: wrap(`
    <g opacity="0.55">
      <circle cx="150" cy="96" r="66" class="art-line art-line--soft" stroke-dasharray="2 7" />
      <circle cx="150" cy="96" r="52" class="art-line art-line--soft" />
    </g>
    <circle cx="150" cy="96" r="34" class="art-fill" />
    <circle cx="150" cy="96" r="34" class="art-line" />
    <circle cx="150" cy="96" r="17" class="art-line art-ember" />
    <g class="art-line">
      <path d="M150 44v-12M150 160v-8M98 96H86M214 96h-12M113 59l-8-8M187 59l8-8M113 133l-8 8M187 133l8 8" />
    </g>
    <g class="art-dot">
      <circle cx="106" cy="146" r="2.4" /><circle cx="150" cy="166" r="2" /><circle cx="194" cy="146" r="2.4" />
    </g>
    <path class="art-line art-line--soft" d="M18 168c40-9 70 8 104 0s64-14 98-2 46 2 62-3" />
    <path class="art-line art-ember" d="M18 178c44-6 74 9 108 1s58-12 92-3" opacity="0.5" />
    <g class="art-line art-line--soft" opacity="0.6">
      <path d="M62 186h44M196 186h44" />
    </g>
  `),

  speech: wrap(`
    <g class="art-line art-line--soft" opacity="0.6">
      <path d="M28 42h64M28 52h40M246 158h-58M246 168h-36" />
    </g>
    <path class="art-line art-fill" d="M44 64h104a10 10 0 0 1 10 10v46a10 10 0 0 1-10 10H92l-18 16v-16H44a10 10 0 0 1-10-10V74a10 10 0 0 1 10-10z" />
    <path class="art-line" d="M44 64h104a10 10 0 0 1 10 10v46a10 10 0 0 1-10 10H92l-18 16v-16H44a10 10 0 0 1-10-10V74a10 10 0 0 1 10-10z" />
    <g class="art-line art-ember">
      <path d="M52 88v14M64 82v26M76 92v10M88 76v38M100 86v16M112 90v12M124 80v30M136 88v14" />
    </g>
    <path class="art-line" d="M156 74h108a8 8 0 0 1 8 8v54a8 8 0 0 1-8 8h-44l-14 13v-13h-50a8 8 0 0 1-8-8V82a8 8 0 0 1 8-8z" opacity="0.7" />
    <g class="art-line art-line--soft">
      <path d="M170 96h74M170 108h56M170 120h64" />
    </g>
    <g class="art-dot">
      <circle cx="54" cy="146" r="1.8" /><circle cx="66" cy="146" r="1.8" /><circle cx="78" cy="146" r="1.8" />
    </g>
    <path class="art-line art-line--soft" d="M150 24v24" opacity="0.4" />
  `),

  bridge: wrap(`
    <path class="art-line art-line--soft" d="M0 142h300" />
    <g class="art-line">
      <path d="M52 150V84M248 150V84" />
      <path d="M52 84c28-4 56 10 74 26 8 7 16 12 24 14 8-2 16-7 24-14 18-16 46-30 74-26" />
      <path d="M52 104c26-2 48 8 66 22M248 104c-26-2-48 8-66 22" />
    </g>
    <g class="art-line art-line--soft">
      <path d="M72 96v54M94 106v44M116 116v34M138 126v24M162 126v24M184 116v34M206 106v44M228 96v54" />
    </g>
    <path class="art-line" d="M40 150h220" />
    <path class="art-ember art-line" d="M150 132c-9-9-24-3-24 8 0 11 16 18 24 24 8-6 24-13 24-24 0-11-15-17-24-8z" />
    <g class="art-line art-line--soft" opacity="0.5">
      <path d="M20 165c22-5 38 6 60 1s38-7 60-1M160 172c22-5 38 6 60 1s30-6 52-2M28 184c26-4 44 6 70 1s46-6 72-1" />
    </g>
    <g class="art-dot"><circle cx="52" cy="84" r="2.2" /><circle cx="248" cy="84" r="2.2" /></g>
  `),

  eye: wrap(`
    <path class="art-fill" d="M36 100c34-38 70-56 114-56s80 18 114 56c-34 38-70 56-114 56s-80-18-114-56z" />
    <path class="art-line" d="M36 100c34-38 70-56 114-56s80 18 114 56c-34 38-70 56-114 56s-80-18-114-56z" />
    <circle cx="150" cy="100" r="30" class="art-line" />
    <circle cx="150" cy="100" r="16" class="art-line art-ember" />
    <circle cx="150" cy="100" r="4" class="art-dot" />
    <g class="art-line art-line--soft">
      <path d="M150 44v10M150 146v10M238 100h-12M62 100H50M212 60l-8 8M96 60l8 8M212 140l-8-8M96 140l8-8" />
    </g>
    <g class="art-line art-line--soft" opacity="0.7">
      <path d="M24 40h22M24 40v22M276 40h-22M276 40v22M24 160h22M24 160v-22M276 160h-22M276 160v-22" />
    </g>
    <path class="art-line art-ember" d="M60 100h180" opacity="0.35" stroke-dasharray="3 6" />
    <g class="art-dot" opacity="0.8">
      <circle cx="96" cy="172" r="1.4" /><circle cx="126" cy="180" r="1.1" /><circle cx="196" cy="174" r="1.6" /><circle cx="222" cy="182" r="1" />
    </g>
  `),

  network: wrap(`
    <g class="art-line art-line--soft" opacity="0.5">
      <circle cx="150" cy="100" r="74" stroke-dasharray="2 7" />
      <circle cx="150" cy="100" r="52" />
    </g>
    <g class="art-line">
      <path d="M150 100L150 42M150 100l50-29M150 100l50 29M150 100v58M150 100l-50 29M150 100l-50-29" />
    </g>
    <g class="art-line art-ember">
      <path d="M150 100l50-29M150 100l50 29M150 100v58" opacity="0.6" />
    </g>
    <g class="art-dot">
      <circle cx="150" cy="42" r="4" /><circle cx="200" cy="71" r="4" /><circle cx="200" cy="129" r="4" /><circle cx="150" cy="158" r="4" /><circle cx="100" cy="129" r="4" /><circle cx="100" cy="71" r="4" />
    </g>
    <circle cx="150" cy="100" r="16" class="art-fill" />
    <circle cx="150" cy="100" r="16" class="art-line" />
    <g class="art-line art-line--soft">
      <rect x="24" y="24" width="18" height="18" rx="3" />
      <rect x="258" y="24" width="18" height="18" rx="3" />
      <rect x="24" y="158" width="18" height="18" rx="3" />
      <rect x="258" y="158" width="18" height="18" rx="3" />
    </g>
    <path class="art-line art-line--soft" d="M42 33h-8M33 42v-8M258 33h8M267 42v-8M42 167h-8M33 158v8M258 167h8M267 158v8" opacity="0.6" />
  `),

  moon: wrap(`
    <circle cx="126" cy="92" r="54" class="art-line art-line--soft" stroke-dasharray="2 8" />
    <path class="art-fill" d="M140 38a58 58 0 1 0 24 108 46 46 0 0 1-24-108z" />
    <path class="art-line" d="M140 38a58 58 0 1 0 24 108 46 46 0 0 1-24-108z" />
    <path class="art-line art-line--soft" d="M146 54a42 42 0 1 0 14 76" opacity="0.55" />
    <g class="art-dot">
      <circle cx="212" cy="52" r="2" /><circle cx="236" cy="86" r="1.5" /><circle cx="204" cy="122" r="1.8" /><circle cx="248" cy="140" r="1.3" /><circle cx="70" cy="150" r="1.5" />
    </g>
    <g class="art-line art-line--soft" opacity="0.75">
      <path d="M214 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
    </g>
    <g class="art-line art-ember" opacity="0.75">
      <path d="M226 96h50M226 108h38M226 120h46M226 132h30" />
    </g>
    <g class="art-line art-line--soft">
      <path d="M214 96h6M214 108h6M214 120h6M214 132h6" />
    </g>
    <path class="art-line art-line--soft" d="M32 176c34 6 60-6 92-2s58 10 88 4 38-4 56 0" opacity="0.6" />
  `),

  search: wrap(`
    <g class="art-line art-line--soft" opacity="0.6">
      <path d="M28 48h72M28 60h48M28 152h64M28 164h40M226 44h46M238 56h34" />
    </g>
    <circle cx="138" cy="96" r="46" class="art-fill" />
    <circle cx="138" cy="96" r="46" class="art-line" />
    <circle cx="138" cy="96" r="33" class="art-line art-line--soft" stroke-dasharray="2 6" />
    <g class="art-line">
      <path d="M114 84h48M114 108h40" />
    </g>
    <path class="art-line art-ember" d="M114 96h52" />
    <path class="art-line" d="M171 129l37 37" />
    <path class="art-line art-ember" d="M177 135l31 31" opacity="0.5" />
    <g class="art-dot">
      <circle cx="52" cy="104" r="2" /><circle cx="66" cy="116" r="1.5" /><circle cx="232" cy="120" r="2" /><circle cx="248" cy="136" r="1.4" /><circle cx="222" cy="152" r="1.7" />
    </g>
    <g class="art-line art-line--soft" opacity="0.7">
      <path d="M24 24h18M24 24v18M276 24h-18M276 24v18M24 176h18M24 176v-18M276 176h-18M276 176v-18" />
    </g>
  `),
};

export function initDeeds() {
  document.querySelectorAll("[data-art]").forEach((node) => {
    const art = ART[node.getAttribute("data-art")];
    if (art) node.innerHTML = art;
  });
}

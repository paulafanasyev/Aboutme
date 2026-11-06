import * as THREE from "three";

export type FieldTextures = {
  grass: THREE.CanvasTexture;
  blade: THREE.CanvasTexture;
  flower: THREE.CanvasTexture;
  birch: THREE.CanvasTexture;
  bark: THREE.CanvasTexture;
  wood: THREE.CanvasTexture;
  coat: THREE.CanvasTexture;
  ornament: THREE.CanvasTexture;
  hide: THREE.CanvasTexture;
  sand: THREE.CanvasTexture;
  steel: THREE.CanvasTexture;
  cover: THREE.CanvasTexture;
  foliage: THREE.CanvasTexture;
};

function paint(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat = false,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  return tex;
}

function noise(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function buildTextures(): FieldTextures {
  const grass = paint(
    512,
    512,
    (g, w, h) => {
      const img = g.createImageData(w, h);
      const data = img.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n = noise(x * 0.11, y * 0.11);
          const broad = noise(x * 0.02, y * 0.025);
          const patch = noise(x * 0.006, y * 0.006);
          const fiber = noise(x * 1.7, y * 0.45);
          let r = 42 + broad * 18 + n * 14 + patch * 22;
          let gg = 86 + broad * 30 + n * 14 + patch * 28;
          let b = 30 + n * 8;
          if (fiber > 0.78) {
            r += 28;
            gg += 24;
          }
          if (fiber < 0.16) {
            r -= 10;
            gg -= 16;
          }
          const i = (y * w + x) * 4;
          data[i] = r;
          data[i + 1] = gg;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      for (let i = 0; i < 28; i++) {
        g.fillStyle = i % 3 === 0 ? "#efe6c4" : "#d7c15a";
        g.fillRect((i * 97) % w, (i * 61) % h, 2, 2);
      }
    },
    true,
  );
  grass.repeat.set(9, 9);

  const blade = paint(256, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const colors = ["#234c28", "#3d6e34", "#5c9144", "#87a84e", "#c2a15a"];
    for (let i = 0; i < 14; i++) {
      const x = 12 + (i * 17) % (w - 24);
      g.strokeStyle = colors[i % colors.length] ?? "#3d6e34";
      g.lineWidth = i % 4 === 0 ? 3 : 1.5;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(x, h - 4);
      g.quadraticCurveTo(x + (i % 5) * 4 - 8, h * 0.42, x + (i % 7) * 3 - 9, 20 + (i % 5) * 16);
      g.stroke();
    }
  });

  const flower = paint(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.translate(w / 2, h / 2);
    for (let i = 0; i < 6; i++) {
      g.rotate(Math.PI / 3);
      g.fillStyle = i % 2 ? "#f7f4ee" : "#f0c3d4";
      g.beginPath();
      g.ellipse(0, 22, 8, 16, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#e2b23a";
    g.beginPath();
    g.arc(0, 0, 7, 0, Math.PI * 2);
    g.fill();
  });

  const birch = paint(
    128,
    256,
    (g, w, h) => {
      g.fillStyle = "#efe6d4";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        const shade = noise(0, y * 0.2);
        g.fillStyle = shade > 0.55 ? "#f7f1e4" : "#e4d8c4";
        g.fillRect(0, y, w, 1);
      }
      g.fillStyle = "#1a1612";
      for (let i = 0; i < 46; i++) {
        const y = (i * 17) % h;
        const x = (i * 29) % (w - 18);
        g.fillRect(x, y, 8 + (i % 5) * 2, 2);
        if (i % 3 === 0) g.fillRect(x + 14, y + 3, 5, 1);
      }
    },
    true,
  );

  const bark = paint(
    128,
    256,
    (g, w, h) => {
      g.fillStyle = "#6a4630";
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 7) {
        g.strokeStyle = x % 14 === 0 ? "#3a2618" : "#8a6244";
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + 2, h);
        g.stroke();
      }
    },
    true,
  );

  const wood = paint(
    128,
    128,
    (g, w, h) => {
      g.fillStyle = "#7a5132";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#4e301c";
      for (let y = 0; y < h; y += 6) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w, y + 2);
        g.stroke();
      }
    },
    true,
  );

  const coat = paint(128, 512, (g, w, h) => {
    g.fillStyle = "#1a335c";
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y++) {
      const n = noise(3, y * 0.35);
      g.fillStyle = n > 0.55 ? "#234272" : "#152a50";
      g.fillRect(0, y, w, 1);
    }
    g.strokeStyle = "#9a3030";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(14, 24);
    g.lineTo(14, h - 48);
    g.moveTo(w - 14, 24);
    g.lineTo(w - 14, h - 48);
    g.stroke();
    g.strokeStyle = "#f4efe4";
    g.lineWidth = 1;
    g.strokeRect(22, 30, w - 44, h - 90);
    g.fillStyle = "#6d5644";
    g.fillRect(0, h - 36, w, 36);
    for (let x = 3; x < w; x += 6) {
      g.fillStyle = x % 12 === 3 ? "#cbb79a" : "#4e3b2e";
      g.fillRect(x, h - 34, 3, 30);
    }
  });

  const ornament = paint(128, 256, (g, w, h) => {
    g.fillStyle = "#f6f1e4";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#a62e28";
    g.lineWidth = 4;
    for (let y = 16; y < h; y += 32) {
      g.beginPath();
      g.moveTo(w / 2, y);
      g.lineTo(w - 10, y + 14);
      g.lineTo(w / 2, y + 28);
      g.lineTo(10, y + 14);
      g.closePath();
      g.stroke();
    }
  });

  const hide = paint(
    128,
    128,
    (g, w, h) => {
      g.fillStyle = "#8a5a3a";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 400; i++) {
        const x = (i * 19) % w;
        const y = (i * 29) % h;
        g.fillStyle = noise(x, y) > 0.5 ? "#6e4128" : "#b07a52";
        g.fillRect(x, y, 3, 2);
      }
    },
    true,
  );

  const sand = paint(
    128,
    128,
    (g, w, h) => {
      g.fillStyle = "#e4d0a0";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 500; i++) {
        g.fillStyle = i % 2 ? "#c9b07a" : "#f3e6c4";
        g.fillRect((i * 13) % w, (i * 17) % h, 2, 2);
      }
    },
    true,
  );
  sand.repeat.set(4, 8);

  const steel = paint(
    128,
    512,
    (g, w, h) => {
      const img = g.createImageData(w, h);
      const data = img.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const band = Math.pow(Math.sin((x / w) * Math.PI), 1.4);
          const grain = noise(x * 0.8, y * 0.05);
          const v = 92 + band * 120 + grain * 16;
          const i = (y * w + x) * 4;
          data[i] = v;
          data[i + 1] = v + 3;
          data[i + 2] = v + 8;
          data[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
    },
    true,
  );
  steel.wrapS = THREE.RepeatWrapping;
  steel.wrapT = THREE.RepeatWrapping;

  const cover = paint(
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#efe4cc";
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 28) {
        g.fillStyle = x % 56 === 0 ? "#d9c7a2" : "#f7f0de";
        g.fillRect(x, 0, 26, h);
        g.strokeStyle = "#6d5a40";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + 1, h);
        g.stroke();
      }
      g.fillStyle = "#2a241c";
      for (let i = 0; i < 80; i++) g.fillRect((i * 37) % w, (i * 19) % h, 7, 2);
    },
    true,
  );

  const foliage = paint(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const greens = ["#2f5a2c", "#4c7c3a", "#6b9a48", "#8fb85c", "#c6b15a"];
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 70; i++) {
      const ang = i * 2.399;
      const rad = 18 + (i % 9) * 10;
      const x = cx + Math.cos(ang) * rad;
      const y = cy + Math.sin(ang) * rad * 0.72;
      g.fillStyle = greens[i % greens.length] ?? "#4c7c3a";
      g.beginPath();
      g.ellipse(x, y, 14 + (i % 3) * 4, 8 + (i % 4) * 2, ang, 0, Math.PI * 2);
      g.fill();
    }
  });

  return { grass, blade, flower, birch, bark, wood, coat, ornament, hide, sand, steel, cover, foliage };
}

let cached: FieldTextures | null = null;

export function createFieldTextures() {
  if (!cached) cached = buildTextures();
  return cached;
}

/* Procedural night sky for the hero. DPR-aware, pauses when hidden,
   renders a single static frame under prefers-reduced-motion. */

const GOLD = "244, 220, 168";
const FROST = "233, 239, 242";
const EMBER = "200, 112, 78";

export function initHero(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let stars = [];
  let motes = [];
  let shooting = null;
  let nextShoot = 0;
  let raf = 0;
  let last = 0;
  let running = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (!running) draw(0);
  }

  function seed() {
    const area = w * h;
    const starCount = Math.min(190, Math.round(area / 7600));
    stars = Array.from({ length: starCount }, () => {
      const depth = Math.random();
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.35 + depth * 1.15,
        base: 0.18 + depth * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.6,
        tint: Math.random() < 0.16 ? GOLD : FROST,
      };
    });
    motes = Array.from({ length: Math.min(34, Math.round(area / 42000)) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.4,
      vy: 4 + Math.random() * 9,
      drift: (Math.random() - 0.5) * 4,
      phase: Math.random() * Math.PI * 2,
      tint: Math.random() < 0.4 ? GOLD : EMBER,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      const twinkle = reduce.matches ? 1 : 0.62 + 0.38 * Math.sin(t * 0.001 * s.speed + s.phase);
      const alpha = s.base * twinkle;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.tint}, ${alpha.toFixed(3)})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.r > 1.15) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.tint}, ${(alpha * 0.12).toFixed(3)})`;
        ctx.arc(s.x, s.y, s.r * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const m of motes) {
      const glow = reduce.matches ? 0.5 : 0.28 + 0.32 * Math.sin(t * 0.0012 + m.phase);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${m.tint}, ${glow.toFixed(3)})`;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (shooting) {
      const p = shooting.life / shooting.total;
      const eased = 1 - (1 - p) ** 2;
      const x = shooting.x + shooting.dx * eased;
      const y = shooting.y + shooting.dy * eased;
      const tailX = x - shooting.dx * 0.08;
      const tailY = y - shooting.dy * 0.08;
      const grad = ctx.createLinearGradient(x, y, tailX, tailY);
      grad.addColorStop(0, `rgba(${GOLD}, ${0.9 * (1 - eased)})`);
      grad.addColorStop(1, `rgba(${GOLD}, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  function step(t) {
    if (!running) return;
    const dt = Math.min(64, t - last || 16);
    last = t;

    for (const m of motes) {
      m.y -= (m.vy * dt) / 1000;
      m.x += (m.drift * dt) / 1000;
      if (m.y < -8) {
        m.y = h + 8;
        m.x = Math.random() * w;
      }
      if (m.x < -8) m.x = w + 8;
      if (m.x > w + 8) m.x = -8;
    }

    if (!shooting && t > nextShoot) {
      const fromLeft = Math.random() > 0.5;
      shooting = {
        x: fromLeft ? -40 : w + 40,
        y: h * (0.08 + Math.random() * 0.32),
        dx: (fromLeft ? 1 : -1) * (220 + Math.random() * 200),
        dy: 90 + Math.random() * 90,
        life: 0,
        total: 1100,
      };
      nextShoot = t + 5200 + Math.random() * 7000;
    }

    if (shooting) {
      shooting.life += dt;
      shooting.x += (shooting.dx * dt) / 1000;
      shooting.y += (shooting.dy * dt) / 1000;
      if (shooting.life > shooting.total) shooting = null;
    }

    draw(t);
    raf = requestAnimationFrame(step);
  }

  function start() {
    if (running || reduce.matches) return;
    running = true;
    last = performance.now();
    nextShoot = last + 2200;
    raf = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  draw(0);
  start();

  let resizeTimer = 0;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 140);
    },
    { passive: true }
  );

  let inView = true;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !document.hidden) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (inView) start();
  });

  const onMotion = () => {
    stop();
    resize();
    if (reduce.matches) draw(0);
    else start();
  };
  if (reduce.addEventListener) reduce.addEventListener("change", onMotion);
  else if (reduce.addListener) reduce.addListener(onMotion);
}

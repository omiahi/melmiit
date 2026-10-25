import { useEffect, useRef } from 'react';
import { drawGallop, loadGallop } from './gallop';
import { usePrefersReducedMotion } from '../state';

interface Rider {
  layer: 0 | 1 | 2;
  x: number; // 0..1 across the scene (wraps)
  phase: number;
  speed: number; // personal variation
  rider: boolean;
  banner: boolean;
  lane: number; // small vertical offset within the layer
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
}

// far → near: ground line (fraction of height), size (fraction of height), screen speed, colour
const LAYERS = [
  { ground: 0.645, size: 0.085, speed: 0.018, fill: '#3a2e1f', parallax: 6 },
  { ground: 0.7, size: 0.17, speed: 0.034, fill: '#15110c', parallax: 14 },
  { ground: 0.8, size: 0.31, speed: 0.055, fill: '#030302', parallax: 26 },
];

function makeHerd(compact: boolean): Rider[] {
  const r = (n: number) => {
    // deterministic spread so the composition is the same on every load
    const x = Math.sin(n * 91.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const herd: Rider[] = [];
  if (compact) {
    for (let i = 0; i < 6; i++)
      herd.push({ layer: 1, x: i / 6 + r(i) * 0.05, phase: r(i + 9), speed: 0.9 + r(i + 3) * 0.2, rider: i % 3 === 0, banner: false, lane: r(i + 5) * 0.04 });
    return herd;
  }
  for (let i = 0; i < 11; i++)
    herd.push({ layer: 0, x: i / 11 + r(i) * 0.04, phase: r(i + 20), speed: 0.85 + r(i + 30) * 0.3, rider: i % 4 === 1, banner: false, lane: r(i + 40) * 0.03 });
  for (let i = 0; i < 5; i++)
    herd.push({ layer: 1, x: i / 5 + 0.08 + r(i + 50) * 0.06, phase: r(i + 60), speed: 0.92 + r(i + 70) * 0.16, rider: i % 2 === 0, banner: i === 2, lane: r(i + 80) * 0.03 });
  herd.push({ layer: 2, x: 0.18, phase: 0.1, speed: 1, rider: true, banner: true, lane: 0 });
  herd.push({ layer: 2, x: 0.66, phase: 0.55, speed: 1.04, rider: true, banner: false, lane: 0.015 });
  return herd;
}

/**
 * Horsemen crossing a lit steppe horizon.
 * Pointer position sets the pace (left: canter, right: full gallop); scrolling urges them on.
 */
export function Herd({ className, compact = false }: { className?: string; compact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext('2d')!;
    const herd = makeHerd(compact);
    const dust: Dust[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let pace = 1;
    let targetPace = 1;
    let px = 0; // pointer -1..1 for parallax
    let scrollBoost = 0;
    let lastScroll = window.scrollY;
    let time = 0;
    // the camera tracks the riders, so the ground streams past beneath them
    const groundOffset = [0, 0, 0];

    // soft dust sprite, drawn once
    const puff = document.createElement('canvas');
    puff.width = puff.height = 64;
    const pctx = puff.getContext('2d')!;
    const pg = pctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pg.addColorStop(0, 'rgba(176,146,100,1)');
    pg.addColorStop(0.5, 'rgba(150,122,84,0.45)');
    pg.addColorStop(1, 'rgba(120,98,68,0)');
    pctx.fillStyle = pg;
    pctx.fillRect(0, 0, 64, 64);

    const resize = () => {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    };

    const onPointer = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth;
      targetPace = 0.55 + nx * 1.1;
      px = nx * 2 - 1;
    };
    const onScroll = () => {
      const y = window.scrollY;
      scrollBoost = Math.min(1.5, scrollBoost + Math.abs(y - lastScroll) / 300);
      lastScroll = y;
    };

    const drawScene = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const horizon = h * (compact ? 0.7 : 0.62);

      if (!compact) {
        // the light along the horizon: a wide warm haze and a fine bright line
        const haze = ctx.createLinearGradient(0, horizon - h * 0.45, 0, h);
        // stops are fractions of the band; the horizon sits at ~0.54
        haze.addColorStop(0, 'rgba(184,151,90,0)');
        haze.addColorStop(0.3, 'rgba(184,151,90,0.07)');
        haze.addColorStop(0.48, 'rgba(205,172,112,0.32)');
        haze.addColorStop(0.54, 'rgba(232,208,156,0.62)');
        haze.addColorStop(0.57, 'rgba(150,116,68,0.42)');
        haze.addColorStop(0.72, 'rgba(92,70,42,0.3)');
        haze.addColorStop(1, 'rgba(7,6,5,1)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, horizon - h * 0.45, w, h);

        // distant ranges, shifting slightly with the pointer
        ctx.fillStyle = 'rgba(30,23,15,0.85)';
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        const shift = px * 4;
        for (let i = 0; i <= 24; i++) {
          const x = (i / 24) * w;
          const y = horizon - h * (0.03 + 0.05 * Math.abs(Math.sin(i * 1.7 + 0.4)) + 0.03 * Math.sin(i * 0.6));
          ctx.lineTo(x + shift, y);
        }
        ctx.lineTo(w, horizon);
        ctx.closePath();
        ctx.fill();

        // the horizon line, brightest at the centre
        const line = ctx.createLinearGradient(0, 0, w, 0);
        line.addColorStop(0, 'rgba(217,191,134,0)');
        line.addColorStop(0.5, 'rgba(240,222,180,0.9)');
        line.addColorStop(1, 'rgba(217,191,134,0)');
        ctx.fillStyle = line;
        ctx.fillRect(0, horizon - 0.5, w, 1);
      } else {
        const line = ctx.createLinearGradient(0, 0, w, 0);
        line.addColorStop(0, 'rgba(184,151,90,0)');
        line.addColorStop(0.5, 'rgba(184,151,90,0.55)');
        line.addColorStop(1, 'rgba(184,151,90,0)');
        ctx.fillStyle = line;
        ctx.fillRect(0, horizon, w, 1);
      }

      // dust behind the hooves
      for (const d of dust) {
        ctx.globalAlpha = d.life * d.life * 0.16;
        ctx.drawImage(puff, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
      }
      ctx.globalAlpha = 1;

      // horsemen, far to near
      for (const layerIndex of [0, 1, 2] as const) {
        const L = LAYERS[layerIndex];
        // narrow screens get smaller riders so the herd keeps its proportions
        const narrow = Math.min(1, Math.max(0.62, w / 1000));
        const size = compact ? h * 0.52 : h * L.size * (layerIndex === 0 ? 1 : narrow);
        const ground = compact ? h * 0.72 : h * L.ground;
        const fill = compact ? '#b8975a' : L.fill;

        // grass and stones streaming past along this layer's ground
        if (!compact && layerIndex > 0) {
          ctx.fillStyle = layerIndex === 2 ? 'rgba(10,8,6,0.55)' : 'rgba(30,24,16,0.45)';
          const gap = size * 0.9;
          const off = groundOffset[layerIndex] % gap;
          for (let gx = -off, n = 0; gx < w + gap; gx += gap, n++) {
            const j = Math.sin((n + Math.floor(groundOffset[layerIndex] / gap)) * 12.9898) * 43758.5453;
            const rnd = j - Math.floor(j);
            const tx = gx + rnd * gap;
            const th = size * (0.03 + rnd * 0.05);
            ctx.fillRect(tx, ground + size * 0.02 - th, Math.max(1, size * 0.012), th);
            ctx.fillRect(tx + size * 0.03, ground + size * 0.02 - th * 0.6, Math.max(1, size * 0.01), th * 0.6);
          }
        }

        for (const r of herd) {
          if (r.layer !== layerIndex) continue;
          const span = w + size * 3;
          const x = ((r.x * span) % span) - size * 1.5 + px * L.parallax;
          drawGallop(ctx, x, ground + r.lane * h, size * 1.35, r.phase, fill, dpr, {
            banner: r.banner,
            t: time + r.phase * 3,
          });
        }
      }
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      scrollBoost *= 0.94;
      pace += (targetPace + scrollBoost - pace) * Math.min(1, dt * 2.5);

      const strideRate = 1.55 + pace * 0.9; // strides per second
      if (!compact) {
        for (const i of [1, 2]) {
          // one stride covers about 2.6 figure-heights of ground
          const size = h * LAYERS[i].size * Math.min(1, Math.max(0.62, w / 1000)) * 1.35;
          groundOffset[i] += (size * 2.6 * strideRate - LAYERS[i].speed * pace * w) * dt * 0.55;
        }
      }
      for (const r of herd) {
        const L = LAYERS[r.layer];
        r.x += (L.speed * pace * r.speed * dt * (compact ? 0.6 : 1));
        if (r.x > 1) r.x -= 1;
        // stride rate rises with pace; nearer horses take visibly longer strides
        r.phase += dt * strideRate * r.speed;
        // dust from the mid and near horses on footfall
        if (!compact && r.layer > 0 && Math.random() < dt * 6 * pace) {
          const size = h * L.size;
          const span = w + size * 3;
          const x = ((r.x * span) % span) - size * 1.5;
          dust.push({
            x: x - size * 0.6 + Math.random() * size * 0.9,
            y: h * L.ground + r.lane * h - Math.random() * size * 0.05,
            vx: -(60 + Math.random() * 60) * (r.layer === 2 ? 2.2 : 1),
            vy: -(4 + Math.random() * 10),
            r: size * (0.12 + Math.random() * 0.14),
            life: 1,
          });
        }
      }
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.r *= 1 + dt * 0.6;
        d.life -= dt * 0.7;
        if (d.life <= 0) dust.splice(i, 1);
      }
      drawScene();
      if (visible) raf = requestAnimationFrame(step);
    };

    resize();
    drawScene();
    loadGallop().then(drawScene, () => undefined);
    const ro = new ResizeObserver(() => {
      resize();
      drawScene();
    });
    ro.observe(el);

    if (reduced) return () => ro.disconnect();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    });
    io.observe(el);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [compact, reduced]);

  return <canvas ref={canvas} aria-hidden className={className} />;
}

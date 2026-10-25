import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { usePrefersReducedMotion } from '../state';

export interface StarfieldHandle {
  parallax: (x: number, y: number) => void;
  burst: () => void;
}

interface Star {
  x: number;
  y: number;
  r: number;
  depth: number;
  phase: number;
  speed: number;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: string;
}

const SPARK_COLORS = ['#ecd28f', '#c9a45c', '#fff3cf', '#c8413a', '#3e8e6e', '#5b8fd6'];

/** Twinkling night sky with parallax and gold sparks. Pauses when off screen. */
export const Starfield = forwardRef<StarfieldHandle, { className?: string }>(function Starfield(
  { className },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const sparks = useRef<Spark[]>([]);
  const size = useRef({ w: 0, h: 0 });
  const reduced = usePrefersReducedMotion();

  useImperativeHandle(ref, () => ({
    parallax(x, y) {
      offset.current = { x, y };
    },
    burst() {
      if (reduced) return;
      const { w, h } = size.current;
      const cx = w / 2;
      const cy = h * 0.44;
      for (let i = 0; i < 110; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 7;
        sparks.current.push({
          x: cx + Math.cos(a) * 60,
          y: cy + Math.sin(a) * 60,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 1.5,
          life: 1,
          hue: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
        });
      }
    },
  }));

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext('2d')!;
    let stars: Star[] = [];
    let raf = 0;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      size.current = { w: width, h: height };
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((width * height) / 3800);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.92,
        r: Math.random() ** 3 * 1.5 + 0.25,
        depth: Math.random() * 0.9 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.6,
      }));
    };

    const draw = (t: number) => {
      const { w, h } = size.current;
      ctx.clearRect(0, 0, w, h);
      const { x: ox, y: oy } = offset.current;
      for (const s of stars) {
        const tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t / 1000 * s.speed + s.phase);
        const x = s.x - ox * 26 * s.depth;
        const y = s.y - oy * 18 * s.depth;
        ctx.globalAlpha = tw * (0.35 + s.depth * 0.65);
        ctx.fillStyle = s.r > 1.2 ? '#fff4d6' : '#dfe6ff';
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // sparks
      const list = sparks.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.965;
        p.vy = p.vy * 0.965 + 0.06;
        p.life -= 0.012;
        if (p.life <= 0) {
          list.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.hue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * p.life + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (visible && !reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(draw);
    });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  return <canvas ref={canvas} aria-hidden className={className} />;
});

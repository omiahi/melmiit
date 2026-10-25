import { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { useSite, usePrefersReducedMotion } from '../state';
import { Starfield, type StarfieldHandle } from './Starfield';

const LOGO_RATIO = 875 / 666; // emblem width / height

export function Hero() {
  const { ui } = useSite();
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stars = useRef<StarfieldHandle>(null);
  const lastPointer = useRef(0);
  const [bursts, setBursts] = useState<number[]>([]);
  const [hinted, setHinted] = useState(false);

  // Pointer position, -1..1 across the hero
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 14, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 90, damping: 14, mass: 0.6 });
  const rotateY = useTransform(sx, (v) => v * 16);
  const rotateX = useTransform(sy, (v) => v * -12);
  const shiftX = useTransform(sx, (v) => v * -18);
  const shiftY = useTransform(sy, (v) => v * -12);
  const sheenX = useTransform(sx, (v) => `${50 + v * 55}%`);
  const sheenY = useTransform(sy, (v) => `${45 + v * 50}%`);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,236,180,0.75) 0%, rgba(255,214,140,0.25) 18%, transparent 42%)`;
  const glowX = useTransform(sx, (v) => v * 40);
  const glowY = useTransform(sy, (v) => v * 30);

  // Scroll: the emblem recedes and fades as the page moves on
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.55]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-18%']);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced) return;
    const r = sectionRef.current!.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
    stars.current?.parallax(px.get(), py.get());
    lastPointer.current = performance.now();
  };

  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  // With no pointer (phones, or a resting mouse) the emblem drifts on its own
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = (t: number) => {
      if (t - lastPointer.current > 2500) {
        px.set(Math.sin(t / 2600) * 0.45);
        py.set(Math.cos(t / 3400) * 0.3);
        stars.current?.parallax(px.get(), py.get());
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, px, py]);

  const burst = useCallback(() => {
    setHinted(true);
    const id = performance.now();
    setBursts((b) => [...b.slice(-3), id]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1700);
    stars.current?.burst();
  }, []);

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex h-[100svh] min-h-[560px] items-center justify-center overflow-hidden"
      aria-label="Dayan Melmiit"
    >
      {/* Sky */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 110%, #16305e 0%, #0e1a33 38%, #060912 72%), #060912',
        }}
      />
      <Starfield ref={stars} className="absolute inset-0 -z-10 h-full w-full" />

      {/* Horizon: a low ridge of mountains */}
      <svg
        aria-hidden
        className="absolute bottom-0 left-0 -z-10 h-[22vh] w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f1c38" />
            <stop offset="1" stopColor="#060912" />
          </linearGradient>
        </defs>
        <path
          fill="url(#ridge)"
          d="M0 150 L120 112 L210 136 L330 84 L430 128 L560 96 L650 118 L770 70 L880 120 L1010 92 L1110 126 L1230 88 L1330 120 L1440 100 L1440 220 L0 220 Z"
        />
        <path
          fill="#060912"
          d="M0 186 L160 160 L300 178 L470 150 L620 176 L790 156 L960 180 L1130 158 L1290 178 L1440 164 L1440 220 L0 220 Z"
        />
      </svg>

      <motion.div style={{ scale, opacity: fade, y: lift }} className="relative flex flex-col items-center">
        <div className="relative aspect-square w-[min(94vw,680px,70svh)]">
          {/* Aura behind the emblem, drifting opposite the tilt */}
          <motion.div
            aria-hidden
            style={{ x: glowX, y: glowY }}
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(236,210,143,0.32) 0%, rgba(201,164,92,0.14) 26%, rgba(42,90,160,0.18) 46%, transparent 68%)',
                animation: reduced ? undefined : 'breathe 7s ease-in-out infinite',
              }}
            />
          </motion.div>

          {/* Turning ring of text */}
          <svg
            aria-hidden
            viewBox="0 0 500 500"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-75"
            style={{ animation: reduced ? undefined : 'spin-slow 90s linear infinite' }}
          >
            <defs>
              <path id="ring-path" d="M250,250 m-226,0 a226,226 0 1,1 452,0 a226,226 0 1,1 -452,0" />
            </defs>
            <circle cx="250" cy="250" r="242" fill="none" stroke="#c9a45c" strokeOpacity="0.35" strokeWidth="0.6" />
            <circle
              cx="250"
              cy="250"
              r="210"
              fill="none"
              stroke="#c9a45c"
              strokeOpacity="0.4"
              strokeWidth="0.6"
              strokeDasharray="1 7"
            />
            <text
              fill="#d9bd7d"
              style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: 6, fontWeight: 600 }}
            >
              <textPath href="#ring-path" textLength="1400">
                {ui.ring.repeat(2)}
              </textPath>
            </text>
          </svg>

          {/* The emblem */}
          <div className="absolute inset-0 grid place-items-center" style={{ perspective: 1100 }}>
            <motion.button
              type="button"
              onClick={burst}
              aria-label={ui.tapLogo}
              initial={reduced ? false : { opacity: 0, scale: 0.86, filter: 'blur(14px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              style={{
                rotateX,
                rotateY,
                x: shiftX,
                y: shiftY,
                transformStyle: 'preserve-3d',
                width: '86%',
                aspectRatio: `${LOGO_RATIO}`,
              }}
              className="relative block cursor-pointer rounded-full bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-8"
            >
              <img
                src="/brand/logo-700.webp"
                srcSet="/brand/logo-700.webp 700w, /brand/logo.webp 875w"
                sizes="(max-width: 700px) 82vw, 600px"
                alt="Dayan Melmiit"
                draggable={false}
                className="absolute inset-0 h-full w-full select-none"
                style={{
                  filter:
                    'drop-shadow(0 0 22px rgba(236,210,143,0.35)) drop-shadow(0 24px 60px rgba(0,0,0,0.65))',
                }}
              />
              {/* Light catching the gold, following the pointer */}
              <motion.span
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage: sheen,
                  mixBlendMode: 'overlay',
                  WebkitMaskImage: 'url(/brand/logo-700.webp)',
                  maskImage: 'url(/brand/logo-700.webp)',
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                  transform: 'translateZ(30px)',
                }}
              />
              {bursts.map((id) => (
                <span key={id} aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[110%] rounded-full border border-gold-bright"
                      style={{
                        animation: `ring-out 1.4s cubic-bezier(0.2,0.7,0.2,1) ${i * 0.16}s both`,
                        boxShadow: '0 0 30px rgba(236,210,143,0.35), inset 0 0 30px rgba(236,210,143,0.2)',
                      }}
                    />
                  ))}
                </span>
              ))}
            </motion.button>
          </div>
        </div>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="-mt-[2svh] font-display text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium italic text-parchment/85"
        >
          {ui.tagline}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: hinted ? 0 : 1 }}
          transition={{ delay: hinted ? 0 : 2.4, duration: 0.8 }}
          className="mt-2 text-sm text-mist/70"
          aria-hidden
        >
          {ui.tapLogo}
        </motion.p>
      </motion.div>

      {/* Scroll cue */}
      <a
        href="#stories"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs text-mist/80 hover:text-parchment"
      >
        <span>{ui.scroll}</span>
        <span className="relative block h-10 w-px overflow-hidden bg-gold/20">
          <span
            className="absolute inset-x-0 top-0 h-1/2 bg-gold-bright"
            style={{ animation: reduced ? undefined : 'scroll-cue 2.2s ease-in-out infinite' }}
          />
        </span>
      </a>
    </section>
  );
}

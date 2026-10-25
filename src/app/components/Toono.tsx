import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { byline, formatDate, t, type Article } from '../data';
import { useSite, usePrefersReducedMotion } from '../state';
import { Kicker, Photo } from './Stories';

/*
 * The front page seen as the inside of a ger, looking up: the lead story fills
 * the toono (the crown wheel, open to the sky) and the other stories sit at the
 * ends of the uni, the roof poles that radiate from it.
 */

const MAX_AROUND = 6;
const POLES = 48; // uni around the crown
const CROWN = 0.215; // crown radius, fraction of the stage
const RIM = 0.495; // outer roof ring
const CARD_R = 0.395; // where the stories sit

/** Angles (degrees, 0 = right, clockwise) for n stories around the crown. */
function anglesFor(n: number) {
  const sets: Record<number, number[]> = {
    1: [0],
    2: [180, 0],
    3: [210, 330, 90],
    4: [215, 325, 35, 145],
    5: [200, 270, 340, 50, 130],
    6: [210, 270, 330, 30, 90, 150],
  };
  return sets[n] || sets[6];
}

function useWide() {
  const q = '(min-width: 980px) and (min-height: 640px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

/** The roof seen from below: rim, poles, crown with its pole sockets. Drawn on a 1000×1000 grid. */
function Roof({ active, angles }: { active: number | null; angles: number[] }) {
  const c = 500;
  const r0 = CROWN * 1000;
  const r1 = RIM * 1000;
  const poles = Array.from({ length: POLES }, (_, i) => (i / POLES) * 360);
  return (
    <g>
      {/* felt between the poles, warmer near the crown where the light falls */}
      <circle cx={c} cy={c} r={r1} fill="url(#roof-felt)" />
      {poles.map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={c + Math.cos(rad) * (r0 + 8)}
            y1={c + Math.sin(rad) * (r0 + 8)}
            x2={c + Math.cos(rad) * r1}
            y2={c + Math.sin(rad) * r1}
            stroke="rgba(184,151,90,0.3)"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        );
      })}
      {/* the pole that leads to the story under the pointer */}
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const on = active === i;
        return (
          <line
            key={`hot-${a}`}
            x1={c + Math.cos(rad) * (r0 + 8)}
            y1={c + Math.sin(rad) * (r0 + 8)}
            x2={c + Math.cos(rad) * (CARD_R * 1000 - 70)}
            y2={c + Math.sin(rad) * (CARD_R * 1000 - 70)}
            stroke="#ecd9a8"
            strokeWidth={on ? 3 : 1.4}
            strokeLinecap="round"
            opacity={on ? 1 : 0.45}
            style={{ transition: 'opacity 0.4s, stroke-width 0.4s', filter: on ? 'drop-shadow(0 0 6px rgba(236,217,168,0.7))' : undefined }}
          />
        );
      })}
      {/* outer roof ring, with the khana lattice heads as small ticks */}
      <circle cx={c} cy={c} r={r1} fill="none" stroke="rgba(184,151,90,0.55)" strokeWidth={1.5} />
      <circle cx={c} cy={c} r={r1 - 10} fill="none" stroke="rgba(184,151,90,0.25)" strokeWidth={1} strokeDasharray="2 9" />
      {/* the crown: a double ring with sockets for every pole */}
      <circle cx={c} cy={c} r={r0 + 16} fill="none" stroke="#b8975a" strokeWidth={2} />
      <circle cx={c} cy={c} r={r0 + 6} fill="none" stroke="#d9bf86" strokeWidth={5} />
      {poles.map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <circle
            key={`s-${a}`}
            cx={c + Math.cos(rad) * (r0 + 11)}
            cy={c + Math.sin(rad) * (r0 + 11)}
            r={1.8}
            fill="#070605"
          />
        );
      })}
    </g>
  );
}

function ToonoStage({ lead, around }: { lead: Article; around: Article[] }) {
  const { lang, authors, ui } = useSite();
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const angles = anglesFor(around.length);

  // the roof turns slowly as the page scrolls past
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const turn = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-14, 14]);

  return (
    <section ref={ref} aria-labelledby="toono-heading" className="relative overflow-hidden py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        <h2 id="toono-heading" className="text-center font-display text-[clamp(2.6rem,4vw,3.6rem)] font-semibold leading-none text-parchment">
          {ui.toonoTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-[56ch] text-center text-[15px] leading-relaxed text-parchment/65">{ui.toonoLede}</p>
      </div>

      <div
        className="relative mx-auto mt-8 aspect-square"
        style={{ width: 'min(92vw, calc(100svh - 96px), 1000px)' }}
      >
        {/* daylight falling through the crown */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(236,217,168,0.16) 0%, rgba(184,151,90,0.06) 30%, transparent 55%)' }}
        />

        <motion.svg viewBox="0 0 1000 1000" aria-hidden className="absolute inset-0 h-full w-full" style={{ rotate: turn }}>
          <defs>
            <radialGradient id="roof-felt" cx="50%" cy="50%" r="50%">
              <stop offset="40%" stopColor="#1a150e" />
              <stop offset="100%" stopColor="#0b0907" />
            </radialGradient>
          </defs>
          <Roof active={active} angles={angles} />
        </motion.svg>

        {/* the crown: the lead story, open to the sky */}
        <Link
          to={`/article/${lead.id}`}
          className="story cinema group absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
          style={{ width: `${CROWN * 200}%`, height: `${CROWN * 200}%` }}
        >
          <Photo src={lead.image} alt={t(lead, 'title', lang)} eager className="absolute inset-0 h-full w-full !rounded-full" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle at 50% 45%, rgba(7,6,5,0.45) 0%, rgba(7,6,5,0.8) 62%, rgba(7,6,5,0.92) 100%)' }}
          />
          <div className="absolute inset-[13%] flex flex-col items-center justify-center text-center">
            <Kicker a={lead} className="text-[13px]" />
            <h3 className="mt-2 line-clamp-4 font-display text-[clamp(1.35rem,2.15vw,2.15rem)] font-semibold leading-[1.06] text-parchment">
              <span className="draw-line">{t(lead, 'title', lang)}</span>
            </h3>
            <p className="mt-3 text-[12px] text-mist">
              <span className="text-parchment/85">{byline(lead, lang, authors)}</span>
              <span className="mx-1.5 text-gold/60" aria-hidden>
                /
              </span>
              {formatDate(lead, lang)}
            </p>
          </div>
        </Link>

        {/* the stories at the ends of the poles */}
        {around.map((a, i) => {
          const rad = (angles[i] * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * CARD_R * 100;
          const y = 50 + Math.sin(rad) * CARD_R * 100;
          return (
            <Link
              key={a.id}
              to={`/article/${a.id}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="story group absolute flex w-[min(18rem,29%)] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="relative block h-[clamp(64px,7.5vw,92px)] w-[clamp(64px,7.5vw,92px)] overflow-hidden rounded-full ring-1 ring-gold/50 transition-[box-shadow] duration-500 group-hover:ring-gold-bright group-hover:[box-shadow:0_0_24px_rgba(236,217,168,0.35)]">
                <Photo src={a.image} alt="" className="absolute inset-0 h-full w-full !rounded-full" />
              </span>
              <span
                className="mt-3 px-4 py-2"
                style={{ background: 'radial-gradient(closest-side, rgba(10,8,6,0.94), rgba(10,8,6,0.82) 60%, rgba(10,8,6,0))' }}
              >
                <span className="block font-display text-[15px] italic text-gold">{formatDate(a, lang)}</span>
                <span className="mt-1 block font-display text-[clamp(1.05rem,1.35vw,1.35rem)] font-semibold leading-[1.15] text-parchment">
                  <span className="draw-line line-clamp-4">{t(a, 'title', lang)}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Phones: the crown with the lead story, then the others along a single pole. */
function ToonoColumn({ lead, around }: { lead: Article; around: Article[] }) {
  const { lang, authors, ui } = useSite();
  return (
    <section aria-labelledby="toono-heading" className="mx-auto max-w-[680px] px-4 pb-8 pt-20 sm:px-6">
      <h2 id="toono-heading" className="text-center font-display text-[2.6rem] font-semibold leading-none text-parchment">
        {ui.toonoTitle}
      </h2>
      <p className="mx-auto mt-3 max-w-[40ch] text-center text-[15px] text-parchment/65">{ui.toonoLede}</p>

      <div className="relative mx-auto mt-10 aspect-square w-full max-w-[460px]">
        <svg viewBox="0 0 1000 1000" aria-hidden className="absolute inset-0 h-full w-full">
          {Array.from({ length: 36 }, (_, i) => {
            const rad = (i / 36) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={500 + Math.cos(rad) * 370}
                y1={500 + Math.sin(rad) * 370}
                x2={500 + Math.cos(rad) * 495}
                y2={500 + Math.sin(rad) * 495}
                stroke="rgba(184,151,90,0.35)"
                strokeWidth={3}
              />
            );
          })}
          <circle cx={500} cy={500} r={358} fill="none" stroke="#d9bf86" strokeWidth={9} />
          <circle cx={500} cy={500} r={378} fill="none" stroke="#b8975a" strokeWidth={3} />
        </svg>
        <Link to={`/article/${lead.id}`} className="story cinema group absolute inset-[15%] block overflow-hidden rounded-full">
          <Photo src={lead.image} alt={t(lead, 'title', lang)} eager className="absolute inset-0 h-full w-full !rounded-full" />
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(7,6,5,0.5) 0%, rgba(7,6,5,0.88) 70%)' }}
          />
          <div className="absolute inset-[12%] flex flex-col items-center justify-center text-center">
            <Kicker a={lead} className="text-[12px]" />
            <h3 className="mt-1.5 line-clamp-4 font-display text-[clamp(1.2rem,5.2vw,1.7rem)] font-semibold leading-[1.08] text-parchment">
              {t(lead, 'title', lang)}
            </h3>
            <p className="mt-2 text-[11px] text-mist">{byline(lead, lang, authors)}</p>
          </div>
        </Link>
      </div>

      <ol className="relative mx-auto mt-6 max-w-[520px] border-l border-gold/35 pl-6">
        {around.map((a) => (
          <li key={a.id} className="relative pb-8 last:pb-2">
            <span aria-hidden className="absolute -left-[30px] top-3 h-3 w-3 rounded-full border border-gold-bright bg-night" />
            <Link to={`/article/${a.id}`} className="story group flex items-start gap-4">
              <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/50">
                <Photo src={a.image} alt="" className="absolute inset-0 h-full w-full !rounded-full" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-sm italic text-gold">{formatDate(a, lang)}</span>
                <span className="mt-0.5 block font-display text-[1.3rem] font-semibold leading-[1.15] text-parchment">
                  <span className="draw-line">{t(a, 'title', lang)}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Toono({ articles }: { articles: Article[] }) {
  const wide = useWide();
  const [lead, ...rest] = articles;
  if (!lead) return null;
  const around = rest.slice(0, MAX_AROUND);
  return wide ? <ToonoStage lead={lead} around={around} /> : <ToonoColumn lead={lead} around={around} />;
}

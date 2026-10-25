import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { byline, formatDate, t, type Article } from '../data';
import { useSite, usePrefersReducedMotion } from '../state';
import { Kicker, Photo } from './Stories';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const MAX_STATIONS = 8;

/** The horseman: Muybridge's gallop as a gold silhouette (CSS mask over the sprite sheet). */
function Rider({ frame, className = '', style }: { frame: number | string; className?: string; style?: React.CSSProperties }) {
  const pos = typeof frame === 'number' ? `${(frame % 11) * 10}% 0` : frame;
  return (
    <div
      aria-hidden
      className={className}
      style={{
        aspectRatio: '608 / 412',
        background: 'linear-gradient(180deg, #ecd9a8, #b8975a)',
        WebkitMaskImage: 'url(/brand/horse-gallop.webp)',
        maskImage: 'url(/brand/horse-gallop.webp)',
        WebkitMaskSize: '1100% 100%',
        maskSize: '1100% 100%',
        WebkitMaskPosition: pos,
        maskPosition: pos,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        ...style,
      }}
    />
  );
}

function useWide() {
  const q = '(min-width: 960px) and (min-height: 620px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

/** A small gold ger: every Örtöö relay station was one. */
export function GerIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 30" aria-hidden className={className}>
      <path
        d="M4 28 L4.4 16.6 L2.6 17.1 Q12 7.4 16.8 5 L23.2 5 Q28 7.4 37.4 17.1 L35.6 16.6 L36 28 Z"
        fill="#070605"
        stroke="#d9bf86"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <rect x="16.2" y="2.8" width="7.6" height="1.6" rx="0.4" fill="#d9bf86" />
      <path d="M4.6 21 Q20 22.4 35.4 21" fill="none" stroke="#d9bf86" strokeWidth="0.8" opacity="0.6" />
      <rect x="17.4" y="19" width="5.2" height="9" fill="#ecc583" />
    </svg>
  );
}

function StationDot({ n }: { n: number }) {
  const { ui } = useSite();
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <GerIcon className="w-7 -translate-y-[38%]" />
      <span className="font-display text-sm italic text-gold">{ui.station(ROMAN[n] || String(n + 1))}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Wide screens: scroll down, travel sideways                          */
/* ------------------------------------------------------------------ */

function RelayTrack({ lead, stations }: { lead: Article; stations: Article[] }) {
  const { lang, authors, ui } = useSite();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0); // how far the track travels sideways

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [stations.length]);

  const { scrollYProgress, scrollY } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const x = useTransform(smooth, (p) => -p * dist);
  const riderLeft = useTransform(smooth, (p) => `calc(6vw + ${p} * 78vw)`);
  // the horse gallops only while the page moves: one frame every 26px of scrolling
  const maskPos = useTransform(scrollY, (y) => `${(Math.floor(y / 26) % 11) * 10}% 0`);
  const routeFill = useTransform(smooth, (p) => `${p * 100}%`);

  return (
    <section ref={section} aria-labelledby="relay-heading" style={{ height: `calc(100vh + ${dist}px)` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* the route */}
        <div aria-hidden className="absolute inset-x-0 top-[54%] h-px bg-gold/20" />
        <motion.div aria-hidden style={{ width: routeFill }} className="absolute left-0 top-[54%] h-px bg-gradient-to-r from-gold/0 via-gold to-gold-bright" />

        {/* the horseman, riding the route as you scroll */}
        <motion.div aria-hidden className="pointer-events-none absolute top-[54%] z-20 w-[min(9vw,130px)] -translate-y-[90%]" style={{ left: riderLeft }}>
          <motion.div
            className="w-full"
            style={{
              aspectRatio: '608 / 412',
              background: 'linear-gradient(180deg, #ecd9a8, #b8975a)',
              WebkitMaskImage: 'url(/brand/horse-gallop.webp)',
              maskImage: 'url(/brand/horse-gallop.webp)',
              WebkitMaskSize: '1100% 100%',
              maskSize: '1100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: maskPos,
              maskPosition: maskPos,
              filter: 'drop-shadow(0 0 14px rgba(217,191,134,0.35))',
            }}
          />
        </motion.div>

        <motion.div ref={track} style={{ x }} className="relative flex h-full w-max items-stretch gap-[4vw] pl-[7vw] pr-[12vw]">
          {/* opening of the relay */}
          <div className="flex w-[26vw] min-w-[300px] flex-col justify-start pt-[19vh]">
            <h2 id="relay-heading" className="font-display text-[clamp(3.4rem,6vw,6.2rem)] font-semibold leading-[0.9] text-parchment">
              {ui.relayTitle}
            </h2>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-parchment/70">{ui.relayLede}</p>
            <p className="mt-6 font-display text-lg italic text-gold">{ui.relayHint}</p>
          </div>

          {/* station I: the lead story, spanning the route */}
          <Link
            to={`/article/${lead.id}`}
            className="story cinema group relative my-[11vh] block w-[44vw] min-w-[520px] shrink-0 overflow-hidden rounded-[3px]"
          >
            <Photo src={lead.image} alt={t(lead, 'title', lang)} eager className="absolute inset-0 h-full w-full" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(7,6,5,0.95) 0%, rgba(7,6,5,0.6) 42%, rgba(7,6,5,0.1) 75%)' }}
            />
            <div className="absolute left-8 top-8">
              <StationDot n={0} />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
              <Kicker a={lead} />
              <h3 className="mt-3 max-w-[22ch] font-display text-[clamp(2rem,3.3vw,3.4rem)] font-semibold leading-[1.02] text-parchment">
                <span className="draw-line">{t(lead, 'title', lang)}</span>
              </h3>
              <p className="mt-4 line-clamp-2 max-w-[50ch] text-parchment/75">{t(lead, 'excerpt', lang)}</p>
              <p className="mt-4 text-sm text-mist">
                <span className="text-parchment/85">{byline(lead, lang, authors)}</span>
                <span className="mx-2 text-gold/60" aria-hidden>
                  /
                </span>
                {formatDate(lead, lang)}
              </p>
            </div>
          </Link>

          {/* the other stations, alternating above and below the route */}
          {stations.map((a, i) => {
            const above = i % 2 === 0;
            return (
              <Link
                key={a.id}
                to={`/article/${a.id}`}
                className={`story group relative flex w-[24vw] min-w-[300px] shrink-0 flex-col ${
                  above ? 'justify-end pb-[calc(46vh+28px)]' : 'justify-start pt-[calc(54vh+28px)]'
                }`}
              >
                <span className="absolute left-0 top-[54%] -translate-y-1/2">
                  <StationDot n={i + 1} />
                </span>
                {/* a large, faint numeral fills the empty side of the route */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-[-0.04em] select-none font-display font-semibold leading-none text-transparent transition-[-webkit-text-stroke-color] duration-500 [-webkit-text-stroke:1px_rgba(184,151,90,0.26)] group-hover:[-webkit-text-stroke:1px_rgba(217,191,134,0.6)] ${
                    above ? 'top-[calc(54%+3.2vh)]' : 'bottom-[calc(46%+3.2vh)]'
                  }`}
                  style={{ fontSize: '30vh' }}
                >
                  {ROMAN[i + 1]}
                </span>
                <div className={`flex flex-col gap-3 ${above ? '' : 'flex-col-reverse'}`}>
                  <div>
                    <p className="font-display text-base italic text-gold">{formatDate(a, lang)}</p>
                    <Kicker a={a} className="mt-1 text-[13px]" />
                    <h3 className="mt-1.5 line-clamp-3 font-display text-[clamp(1.35rem,1.9vw,1.9rem)] font-semibold leading-[1.1] text-parchment">
                      <span className="draw-line">{t(a, 'title', lang)}</span>
                    </h3>
                  </div>
                  <Photo src={a.image} alt="" className="aspect-[16/10] max-h-[22vh] w-full" />
                </div>
              </Link>
            );
          })}

          {/* the last station */}
          <div className="flex w-[24vw] min-w-[300px] shrink-0 flex-col justify-start pt-[calc(54vh+40px)]">
            <p className="max-w-[30ch] font-display text-2xl italic leading-snug text-parchment/85">{ui.relayEnd}</p>
            <a href="#map-heading" className="mt-4 text-sm text-gold hover:text-gold-bright">
              {ui.relayMap}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Phones and reduced motion: the same route, running downwards        */
/* ------------------------------------------------------------------ */

function RelayColumn({ lead, stations }: { lead: Article; stations: Article[] }) {
  const { lang, ui } = useSite();
  const all = [lead, ...stations];
  return (
    <section aria-labelledby="relay-heading" className="mx-auto max-w-[760px] px-4 pb-8 pt-20 sm:px-6">
      <h2 id="relay-heading" className="font-display text-[3.4rem] font-semibold leading-[0.9] text-parchment">
        {ui.relayTitle}
      </h2>
      <p className="mt-4 max-w-[40ch] text-parchment/70">{ui.relayLede}</p>
      <ol className="relative mt-12 border-l border-gold/30 pl-7">
        {all.map((a, i) => (
          <li key={a.id} className="relative pb-14 last:pb-4">
            <GerIcon className="absolute -left-[42px] -top-1 w-7" />
            <p className="font-display text-sm italic text-gold">{ui.station(ROMAN[i] || String(i + 1))}</p>
            <Link to={`/article/${a.id}`} className="story group mt-3 block">
              <Photo src={a.image} alt="" eager={i === 0} className={i === 0 ? 'aspect-[4/3]' : 'aspect-[16/9]'} />
              <p className="mt-4 font-display text-base italic text-gold">{formatDate(a, lang)}</p>
              <Kicker a={a} className="mt-1 text-[13px]" />
              <h3
                className={`mt-1.5 font-display font-semibold leading-[1.08] text-parchment ${
                  i === 0 ? 'text-[2.2rem]' : 'text-[1.6rem]'
                }`}
              >
                <span className="draw-line">{t(a, 'title', lang)}</span>
              </h3>
              {i === 0 && <p className="mt-3 text-parchment/70">{t(a, 'excerpt', lang)}</p>}
            </Link>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-4 pl-7">
        <Rider frame={3} className="w-20 opacity-80" />
        <a href="#map-heading" className="text-sm text-gold hover:text-gold-bright">
          {ui.relayMap}
        </a>
      </div>
    </section>
  );
}

export function Relay({ articles }: { articles: Article[] }) {
  const wide = useWide();
  const reduced = usePrefersReducedMotion();
  const [lead, ...rest] = articles;
  if (!lead) return null;
  const stations = rest.slice(0, MAX_STATIONS - 1);
  return wide && !reduced ? <RelayTrack lead={lead} stations={stations} /> : <RelayColumn lead={lead} stations={stations} />;
}

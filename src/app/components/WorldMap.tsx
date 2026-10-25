import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { geoCircle, geoDistance, geoPath, geoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { PARTNERS, RELATION_LABEL, ULAANBAATAR, formatDate, t, type Partner } from '../data';
import { useSite } from '../state';

const SIZE = 640;
const EARTH_KM = 6371;
const RINGS_KM = [2000, 5000, 10000, 15000];

const countries = feature(
  world as unknown as Topology,
  (world as unknown as Topology).objects.countries as GeometryCollection,
) as FeatureCollection<Geometry, { name: string }>;

/**
 * Azimuthal projection centred on Ulaanbaatar. Directions from the city are true and
 * every country keeps its order by distance, but radius grows with the square root of
 * distance, so the near neighbourhood is magnified and the far side of the world compressed.
 */
function ubRaw(x: number, y: number): [number, number] {
  const cx = Math.cos(x);
  const cy = Math.cos(y);
  const c = Math.acos(Math.max(-1, Math.min(1, cx * cy)));
  if (c < 1e-9) return [0, 0];
  const k = Math.sqrt(c) / Math.sin(c);
  return [k * cy * Math.sin(x), k * Math.sin(y)];
}

const projection = geoProjection(ubRaw)
  .rotate([-ULAANBAATAR[0], -ULAANBAATAR[1]])
  .clipAngle(172)
  .fitExtent(
    [
      [6, 6],
      [SIZE - 6, SIZE - 6],
    ],
    { type: 'Sphere' },
  );
const path = geoPath(projection);
const sphere = path({ type: 'Sphere' })!;
const center = projection(ULAANBAATAR)!;

const partnerByIso = new Map<string, Partner>();
for (const p of PARTNERS) for (const iso of p.iso) partnerByIso.set(iso, p);

/** Point reached from `from` after `deg` degrees of arc on bearing `bearing` (degrees). */
function destination(from: [number, number], deg: number, bearing: number): [number, number] {
  const r = Math.PI / 180;
  const p1 = from[1] * r;
  const l1 = from[0] * r;
  const d = deg * r;
  const th = bearing * r;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(th));
  const l2 = l1 + Math.atan2(Math.sin(th) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [l2 / r, p2 / r];
}

const rings = RINGS_KM.map((km) => {
  const deg = (km / EARTH_KM) * (180 / Math.PI);
  const d = path(geoCircle().center(ULAANBAATAR).radius(deg)())!;
  // label sits where the ring crosses the empty north-east (Siberia, the Pacific)
  const at = projection(destination(ULAANBAATAR, deg, 50))!;
  return { km, d, at };
});

const routes = PARTNERS.map((p) => {
  const end = projection(p.capital)!;
  const km = geoDistance(ULAANBAATAR, p.capital) * EARTH_KM;
  const dx = end[0] - center[0];
  const dy = end[1] - center[1];
  const len = Math.hypot(dx, dy) || 1;
  return { p, end, km, ux: dx / len, uy: dy / len };
});

const countryShapes = countries.features.map((f: Feature<Geometry, { name: string }>) => ({
  id: String(f.id ?? ''),
  d: path(f) || '',
  partner: partnerByIso.get(String(f.id ?? '')),
  mongolia: String(f.id) === '496',
}));

// small label adjustments where capitals sit close together on the map
const NUDGE: Record<string, [number, number]> = { CA: [0, -12], US: [0, 14], KZ: [0, 4], TR: [0, 4] };

const nf = new Intl.NumberFormat('en-US');
const km = (n: number) => nf.format(n).replace(/,/g, '\u2009');

export default function WorldMap({ heading = true }: { heading?: boolean }) {
  const { articles, lang, ui } = useSite();
  const [active, setActive] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Draw the routes once the map scrolls into view
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const storiesBy = useMemo(() => {
    const m = new Map<string, typeof articles>();
    for (const a of articles) for (const c of a.countries || []) m.set(c, [...(m.get(c) || []), a]);
    return m;
  }, [articles]);

  // Start on the first partner that has stories, so the panel isn't empty
  useEffect(() => {
    if (active) return;
    const first = PARTNERS.find((p) => storiesBy.has(p.code));
    if (first) setActive(first.code);
  }, [storiesBy, active]);

  const sel = routes.find((r) => r.p.code === active);
  const selStories = sel ? storiesBy.get(sel.p.code) || [] : [];

  return (
    <section ref={ref} aria-labelledby="map-heading" className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto block w-full max-w-[640px]"
          role="img"
          aria-label={ui.mapLede}
        >
          <defs>
            <radialGradient id="globe-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#15120d" />
              <stop offset="100%" stopColor="#0a0907" />
            </radialGradient>
            <radialGradient id="ub-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(217,191,134,0.55)" />
              <stop offset="100%" stopColor="rgba(217,191,134,0)" />
            </radialGradient>
          </defs>

          <path d={sphere} fill="url(#globe-fill)" stroke="rgba(184,151,90,0.45)" strokeWidth={0.8} />

          {/* distance rings around Ulaanbaatar */}
          {rings.map((r) => (
            <g key={r.km}>
              <path d={r.d} fill="none" stroke="rgba(184,151,90,0.3)" strokeWidth={0.6} strokeDasharray="2 4" />
              {r.km > 2000 && (
              <text
                className="map-ring-label"
                x={r.at[0] + 4}
                y={r.at[1] - 4}
                textAnchor="start"
                fill="rgba(184,151,90,0.55)"
                style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, letterSpacing: '0.06em' }}
              >
                {km(r.km)} km
              </text>
              )}
            </g>
          ))}

          {/* countries */}
          <g>
            {countryShapes.map((c, i) => {
              const isActive = c.partner && c.partner.code === active;
              const fill = c.mongolia
                ? '#b8975a'
                : isActive
                  ? 'rgba(184,151,90,0.42)'
                  : c.partner
                    ? '#2a2318'
                    : '#17140f';
              return (
                <path
                  key={c.id + i}
                  d={c.d}
                  fill={fill}
                  stroke={isActive ? 'rgba(217,191,134,0.9)' : 'rgba(7,6,5,0.9)'}
                  strokeWidth={isActive ? 0.8 : 0.4}
                  style={{ transition: 'fill 0.35s, stroke 0.35s', cursor: c.partner ? 'pointer' : 'default' }}
                  onMouseEnter={c.partner ? () => setActive(c.partner!.code) : undefined}
                  onClick={c.partner ? () => setActive(c.partner!.code) : undefined}
                />
              );
            })}
          </g>

          {/* routes from Ulaanbaatar */}
          {routes.map((r, i) => {
            const on = r.p.code === active;
            const d = `M${center[0]},${center[1]} L${r.end[0]},${r.end[1]}`;
            return (
              <g key={r.p.code}>
                <path
                  d={d}
                  pathLength={100}
                  fill="none"
                  stroke={on ? '#d9bf86' : 'rgba(184,151,90,0.5)'}
                  strokeWidth={on ? 1.3 : 0.7}
                  strokeDasharray="100 100"
                  strokeDashoffset={seen ? 0 : 100}
                  style={{
                    transition: `stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.09}s, stroke 0.3s, stroke-width 0.3s`,
                  }}
                />
                {seen && (
                  <path
                    className="map-dispatch"
                    d={d}
                    pathLength={100}
                    fill="none"
                    stroke="#f3e2b8"
                    strokeWidth={on ? 2 : 1.2}
                    strokeLinecap="round"
                    style={{ animationDelay: `${2 + i * 0.7}s`, opacity: on ? 1 : 0.7 }}
                  />
                )}
              </g>
            );
          })}

          {/* capitals and names */}
          {routes.map((r) => {
            const on = r.p.code === active;
            const [nx, ny] = NUDGE[r.p.code] || [0, 0];
            const lx = r.end[0] + r.ux * 9 + nx;
            const ly = r.end[1] + r.uy * 9 + 3 + ny;
            return (
              <g
                key={r.p.code}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActive(r.p.code)}
                onClick={() => setActive(r.p.code)}
              >
                <circle cx={r.end[0]} cy={r.end[1]} r={on ? 3.6 : 2.4} fill={on ? '#f3e2b8' : '#b8975a'} />
                <text
                  className="map-label"
                  x={lx}
                  y={ly}
                  textAnchor={r.ux < -0.2 ? 'end' : r.ux > 0.2 ? 'start' : 'middle'}
                  fill={on ? '#f3e2b8' : 'rgba(236,230,216,0.72)'}
                  style={{ fontFamily: 'var(--font-sans)', fontWeight: on ? 600 : 500, transition: 'fill 0.3s' }}
                >
                  {r.p[lang]}
                </text>
              </g>
            );
          })}

          {/* Ulaanbaatar */}
          <circle cx={center[0]} cy={center[1]} r={16} fill="url(#ub-glow)" />
          <circle cx={center[0]} cy={center[1]} r={3.2} fill="#f3e2b8" />
          <circle cx={center[0]} cy={center[1]} r={7} fill="none" stroke="rgba(243,226,184,0.6)" strokeWidth={0.7} className="map-ub" />
        </svg>
      </div>

      <div className="lg:col-span-5">
        <h2
          id="map-heading"
          className={heading ? 'font-display text-[clamp(2.2rem,4vw,3.2rem)] font-semibold leading-none text-parchment' : 'sr-only'}
        >
          {ui.mapTitle}
        </h2>
        <p className={`max-w-[44ch] text-parchment/70 ${heading ? 'mt-4' : ''}`}>{ui.mapLede}</p>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={ui.mapTitle}>
          {PARTNERS.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => setActive(p.code)}
              aria-pressed={active === p.code}
              className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
                active === p.code
                  ? 'border-gold-bright bg-gold-bright text-night'
                  : 'border-gold/25 text-parchment/75 hover:border-gold/60 hover:text-parchment'
              }`}
            >
              {p[lang]}
            </button>
          ))}
        </div>

        <div className="mt-8 min-h-[220px] border-t border-gold/20 pt-6" aria-live="polite">
          {sel ? (
            <>
              <p className="text-sm text-gold">{RELATION_LABEL[sel.p.relation][lang]}</p>
              <p className="mt-1 font-display text-3xl font-semibold text-parchment">{sel.p[lang]}</p>
              <p className="mt-1 text-sm text-mist">{ui.mapFromUb(km(Math.round(sel.km / 10) * 10))}</p>
              {selStories.length ? (
                <ul className="mt-5 divide-y divide-white/[0.07]">
                  {selStories.slice(0, 3).map((a) => (
                    <li key={a.id}>
                      <Link to={`/article/${a.id}`} className="story group block py-3">
                        <span className="block font-display text-xl font-semibold leading-snug text-parchment">
                          <span className="draw-line">{t(a, 'title', lang)}</span>
                        </span>
                        <span className="mt-0.5 block text-sm text-mist">{formatDate(a, lang)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-mist">{ui.mapNoStories(sel.p[lang])}</p>
              )}
              {selStories.length > 0 && (
                <Link to={`/country/${sel.p.code.toLowerCase()}`} className="mt-4 inline-block text-sm text-gold hover:text-gold-bright">
                  {ui.mapAll(sel.p[lang])}
                </Link>
              )}
            </>
          ) : (
            <p className="text-mist">{ui.mapPrompt}</p>
          )}
        </div>
      </div>
    </section>
  );
}

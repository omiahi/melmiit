import { useState } from 'react';
import { Link } from 'react-router-dom';
import { byline, categoryLabel, formatDate, kindLabel, t, type Article } from '../data';
import { useSite } from '../state';

/** Story photo. Missing or broken images fall back to a quiet night-sky panel with the emblem. */
export function Photo({ src, alt, className = '', eager }: { src?: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`frame ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <img src="/brand/logo-240.webp" alt="" className="w-1/4 max-w-[120px] opacity-25" />
        </div>
      )}
    </div>
  );
}

/** Story type (Analysis, Interview…) in italics, then the section in gold. */
export function Kicker({ a, className = 'text-sm' }: { a: Article; className?: string }) {
  const { lang } = useSite();
  const kind = kindLabel(a, lang);
  return (
    <p className={`font-medium ${className}`}>
      {kind && <span className="mr-2 font-display text-[1.15em] italic text-parchment/90">{kind}</span>}
      <span className="text-gold">{categoryLabel(a, lang)}</span>
    </p>
  );
}

function Meta({ a }: { a: Article }) {
  const { lang, authors } = useSite();
  return (
    <p className="text-sm text-mist">
      <span className="text-parchment/80">{byline(a, lang, authors)}</span>
      <span className="mx-2 text-gold/60" aria-hidden>
        /
      </span>
      <time dateTime={a.date}>{formatDate(a, lang)}</time>
    </p>
  );
}

export function StoryLead({ a }: { a: Article }) {
  const { lang } = useSite();
  return (
    <Link to={`/article/${a.id}`} className="story group grid gap-6 md:grid-cols-12 md:gap-10">
      <Photo src={a.image} alt={t(a, 'title', lang)} eager className="aspect-[4/3] md:col-span-7 md:aspect-[5/4]" />
      <div className="flex flex-col justify-center md:col-span-5">
        <Kicker a={a} />
        <h2 className="mt-3 font-display text-[clamp(2.1rem,4.2vw,3.6rem)] font-semibold leading-[1.04] text-parchment">
          <span className="draw-line">{t(a, 'title', lang)}</span>
        </h2>
        <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-parchment/75">{t(a, 'excerpt', lang)}</p>
        <div className="mt-6">
          <Meta a={a} />
        </div>
      </div>
    </Link>
  );
}

export function StoryCard({ a, large }: { a: Article; large?: boolean }) {
  const { lang } = useSite();
  return (
    <Link to={`/article/${a.id}`} className="story group block">
      <Photo src={a.image} alt={t(a, 'title', lang)} className="aspect-[3/2]" />
      <Kicker a={a} className="mt-4 text-sm" />
      <h3
        className={`mt-2 font-display font-semibold leading-[1.1] text-parchment ${
          large ? 'text-[clamp(1.7rem,2.6vw,2.2rem)]' : 'text-[1.6rem]'
        }`}
      >
        <span className="draw-line">{t(a, 'title', lang)}</span>
      </h3>
      <p className="mt-3 line-clamp-3 max-w-[60ch] leading-relaxed text-parchment/70">{t(a, 'excerpt', lang)}</p>
      <div className="mt-3">
        <Meta a={a} />
      </div>
    </Link>
  );
}

export function StoryLine({ a }: { a: Article }) {
  const { lang } = useSite();
  return (
    <Link to={`/article/${a.id}`} className="story group block py-4">
      <Kicker a={a} className="text-[13px]" />
      <h3 className="mt-1 font-display text-xl font-semibold leading-snug text-parchment">
        <span className="draw-line">{t(a, 'title', lang)}</span>
      </h3>
      <time dateTime={a.date} className="mt-1 block text-sm text-mist">
        {formatDate(a, lang)}
      </time>
    </Link>
  );
}

/** The lead story, full width: a darkened photograph with the headline set over it. */
export function StoryCinema({ a }: { a: Article }) {
  const { lang, authors } = useSite();
  return (
    <Link
      to={`/article/${a.id}`}
      className="story cinema group relative block overflow-hidden rounded-[3px] bg-dusk"
    >
      <Photo
        src={a.image}
        alt={t(a, 'title', lang)}
        eager
        className="aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[2/1]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(7,6,5,0.96) 0%, rgba(7,6,5,0.72) 38%, rgba(7,6,5,0.15) 70%, rgba(7,6,5,0.35) 100%), linear-gradient(to right, rgba(7,6,5,0.55), transparent 60%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
        <Kicker a={a} />
        <h2 className="mt-3 max-w-[24ch] font-display text-[clamp(2.1rem,4.2vw,4rem)] font-semibold leading-[1.02] text-parchment">
          <span className="draw-line">{t(a, 'title', lang)}</span>
        </h2>
        {t(a, 'excerpt', lang) && (
          <p className="mt-5 hidden max-w-[52ch] text-lg leading-relaxed text-parchment/80 sm:block">
            {t(a, 'excerpt', lang)}
          </p>
        )}
        <p className="mt-5 text-sm text-mist">
          <span className="text-parchment/85">{byline(a, lang, authors)}</span>
          <span className="mx-2 text-gold/60" aria-hidden>
            /
          </span>
          <time dateTime={a.date}>{formatDate(a, lang)}</time>
        </p>
      </div>
    </Link>
  );
}

/** A story as a line in the dispatch list: date, headline and summary, small photograph. */
export function StoryDispatch({ a }: { a: Article }) {
  const { lang } = useSite();
  return (
    <Link
      to={`/article/${a.id}`}
      className="story group grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 border-t border-gold/15 py-7 sm:grid-cols-[9rem_1fr_auto] sm:gap-x-10"
    >
      <time
        dateTime={a.date}
        className="col-span-2 font-display text-lg italic text-gold sm:col-span-1 sm:pt-1"
      >
        {formatDate(a, lang)}
      </time>
      <div className="min-w-0">
        <Kicker a={a} className="text-[13px]" />
        <h3 className="mt-1.5 font-display text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold leading-[1.12] text-parchment">
          <span className="draw-line">{t(a, 'title', lang)}</span>
        </h3>
        {t(a, 'excerpt', lang) && (
          <p className="mt-2 line-clamp-2 max-w-[62ch] leading-relaxed text-parchment/65">{t(a, 'excerpt', lang)}</p>
        )}
      </div>
      <Photo src={a.image} alt="" className="aspect-[4/3] w-24 self-start sm:w-44" />
    </Link>
  );
}

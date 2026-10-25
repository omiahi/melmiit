import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { Check, Link2, Share2 } from 'lucide-react';
import {
  CATEGORIES,
  PARTNERS,
  RELATION_LABEL,
  authorOf,
  byline,
  categoryLabel,
  categoryOf,
  formatDate,
  kindLabel,
  readingMinutes,
  t,
  ta,
  type Article,
  type Author,
} from './data';
import { useSite } from './state';
import { Hero } from './components/Hero';
import { Photo, StoryCard, StoryCinema, StoryDispatch, StoryLead } from './components/Stories';
import { Brief } from './components/Brief';

const WorldMap = lazy(() => import('./components/WorldMap'));

function MapBlock({ heading = true }: { heading?: boolean }) {
  return (
    <Suspense fallback={<div className="min-h-[520px]" />}>
      <WorldMap heading={heading} />
    </Suspense>
  );
}

function WriterPhoto({ w, className = '' }: { w: Author; className?: string }) {
  return w.photo ? (
    <img src={w.photo} alt="" className={`rounded-full object-cover ${className}`} />
  ) : (
    <span
      aria-hidden
      className={`grid place-items-center rounded-full border border-gold/40 font-display text-gold-bright ${className}`}
    >
      {w.name.charAt(0)}
    </span>
  );
}

function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Dayan Melmiit` : 'Dayan Melmiit — Diplomacy, geopolitics and international affairs';
  }, [title]);
}

function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <img src="/brand/logo-240.webp" alt="" className="w-24 animate-pulse opacity-40" />
    </div>
  );
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return <p className="py-24 text-center font-display text-2xl italic text-mist">{children}</p>;
}

function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="flex items-center gap-4 font-display text-[1.7rem] font-semibold text-parchment">
      {children}
      <span aria-hidden className="flex flex-1 items-center gap-2">
        <span className="h-1.5 w-1.5 rotate-45 border border-gold/80" />
        <span className="h-px flex-1 bg-gradient-to-r from-gold/45 to-transparent" />
      </span>
    </h2>
  );
}

/* ---------- Front page ---------- */

export function HomePage() {
  const { articles, status, ui } = useSite();
  useTitle();
  const [lead, ...rest] = articles;
  const dispatches = rest.slice(0, 5);
  const more = rest.slice(5);

  return (
    <>
      <Hero />
      <div id="stories" className="mx-auto max-w-[1240px] scroll-mt-20 px-4 pb-24 pt-16 sm:px-6 md:pt-24">
        {status === 'loading' && <Loading />}
        {status === 'error' && <StatusMessage>{ui.loadError}</StatusMessage>}
        {status === 'ready' && !lead && <StatusMessage>{ui.empty}</StatusMessage>}
        {lead && (
          <>
            <StoryCinema a={lead} />

            {dispatches.length > 0 && (
              <section className="mx-auto mt-24 max-w-[1080px]" aria-labelledby="latest-heading">
                <SectionHeading id="latest-heading">{ui.latest}</SectionHeading>
                <div className="mt-8 border-b border-gold/15">
                  {dispatches.map((a) => (
                    <StoryDispatch key={a.id} a={a} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-28 border-t border-gold/15 pt-20">
              <MapBlock />
            </div>

            {more.length > 0 && (
              <section className="mt-24" aria-labelledby="more-heading">
                <SectionHeading id="more-heading">{ui.more}</SectionHeading>
                <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                  {more.map((a) => (
                    <StoryCard key={a.id} a={a} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      {lead && <Brief />}
    </>
  );
}

/* ---------- Section page ---------- */

export function SectionPage() {
  const { slug } = useParams();
  const { articles, status, lang, ui } = useSite();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const list = useMemo(() => articles.filter((a) => categoryOf(a)?.slug === slug), [articles, slug]);
  useTitle(cat?.[lang]);

  if (!cat) return <NotFoundPage />;
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-32 sm:px-6">
      <header className="relative">
        <img
          src="/brand/logo-240.webp"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -top-10 right-0 w-40 opacity-[0.08] sm:w-56"
        />
        <h1 className="font-display text-[clamp(3rem,8vw,6rem)] font-semibold leading-none text-parchment">
          {cat[lang]}
        </h1>
        {status === 'ready' && <p className="mt-3 text-mist">{ui.stories(list.length)}</p>}
      </header>
      {slug === 'mongolia' && (
        <div className="mt-14 border-b border-gold/15 pb-20">
          <MapBlock heading={false} />
        </div>
      )}
      <div className="mt-14">
        {status === 'loading' && <Loading />}
        {status === 'error' && <StatusMessage>{ui.loadError}</StatusMessage>}
        {status === 'ready' && list.length === 0 && (
          <div className="py-16 text-center">
            <StatusMessage>{ui.empty}</StatusMessage>
            <Link to="/" className="text-gold hover:text-gold-bright">
              {ui.allStories}
            </Link>
          </div>
        )}
        {list[0] && <StoryLead a={list[0]} />}
        {list.length > 1 && (
          <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.slice(1).map((a) => (
              <StoryCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Article page ---------- */

function ShareButton({ title }: { title: string }) {
  const { ui } = useSite();
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const onClick = async () => {
    const url = window.location.href;
    if (canShare) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* closed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const Icon = copied ? Check : canShare ? Share2 : Link2;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-gold/35 px-4 py-2 text-sm text-parchment/90 transition-colors hover:border-gold-bright hover:text-gold-bright"
    >
      <Icon className="h-4 w-4" />
      {copied ? ui.copied : canShare ? ui.share : ui.copyLink}
    </button>
  );
}

export function ArticlePage() {
  const { id } = useParams();
  const { articles, authors, status, lang, ui } = useSite();
  const a = articles.find((x) => x.id === id);
  const writer = a ? authorOf(a, authors) : undefined;
  const title = a ? t(a, 'title', lang) : undefined;
  useTitle(title);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  const related = useMemo(() => {
    if (!a) return [];
    // most shared countries first, then same section, then the rest
    const score = (x: Article) =>
      (x.countries || []).filter((c) => a.countries?.includes(c)).length * 2 + (x.category === a.category ? 1 : 0);
    return articles
      .filter((x) => x.id !== a.id)
      .map((x, i) => ({ x, s: score(x), i }))
      .sort((p, q) => q.s - p.s || p.i - q.i)
      .slice(0, 3)
      .map((r) => r.x);
  }, [a, articles]);

  if (status === 'loading') return <div className="pt-32"><Loading /></div>;
  if (status === 'error') return <div className="pt-32"><StatusMessage>{ui.loadError}</StatusMessage></div>;
  if (!a) return <NotFoundPage />;

  const body = t(a, 'content', lang);
  const cat = categoryOf(a);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-16 z-40 h-0.5 origin-left bg-gradient-to-r from-gold to-gold-bright"
      />
      <article className="pb-24 pt-28 sm:pt-36">
        <header className="mx-auto max-w-[920px] px-4 sm:px-6">
          <p className="text-sm font-medium">
            {kindLabel(a, lang) && (
              <span className="mr-2 font-display text-[1.15em] italic text-parchment/90">{kindLabel(a, lang)}</span>
            )}
            {cat ? (
              <Link to={`/section/${cat.slug}`} className="text-gold hover:text-gold-bright">
                {cat[lang]}
              </Link>
            ) : (
              <span className="text-gold">{categoryLabel(a, lang)}</span>
            )}
          </p>
          <motion.h1
            key={lang}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 font-display text-[clamp(2.4rem,6vw,4.6rem)] font-semibold leading-[1.02] text-parchment"
          >
            {title}
          </motion.h1>
          {t(a, 'excerpt', lang) && (
            <p className="mt-6 max-w-[56ch] font-display text-[1.45rem] italic leading-snug text-parchment/80">
              {t(a, 'excerpt', lang)}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-white/[0.08] py-4">
            <p className="text-sm text-mist">
              {writer ? (
                <Link to={`/author/${writer.id}`} className="text-parchment/85 hover:text-gold-bright">
                  {byline(a, lang, authors)}
                </Link>
              ) : (
                <span className="text-parchment/85">{byline(a, lang, authors)}</span>
              )}
              <span className="mx-2 text-gold/60" aria-hidden>
                /
              </span>
              <time dateTime={a.date}>{formatDate(a, lang)}</time>
              {body && (
                <>
                  <span className="mx-2 text-gold/60" aria-hidden>
                    /
                  </span>
                  {ui.minRead(readingMinutes(body))}
                </>
              )}
            </p>
            <ShareButton title={title || ''} />
          </div>
        </header>

        {a.image && (
          <div className="mx-auto mt-10 max-w-[1240px] px-0 sm:px-6">
            <Photo src={a.image} alt={title || ''} eager className="aspect-[16/9] sm:rounded" />
          </div>
        )}

        <div className="prose-article mx-auto mt-12 max-w-[66ch] px-4 text-[1.13rem] leading-[1.78] text-parchment/90 sm:px-6">
          {body ? (
            body
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="italic text-mist">{ui.contentSoon}</p>
          )}
        </div>

        <div className="mx-auto mt-12 flex max-w-[66ch] justify-center px-4" aria-hidden>
          <img src="/brand/logo-240.webp" alt="" className="w-14 opacity-50" />
        </div>

        {(a.countries?.length ?? 0) > 0 && (
          <div className="mx-auto mt-10 flex max-w-[66ch] flex-wrap justify-center gap-2 px-4">
            {PARTNERS.filter((p) => a.countries!.includes(p.code)).map((p) => (
              <Link
                key={p.code}
                to={`/country/${p.code.toLowerCase()}`}
                className="rounded-full border border-gold/30 px-3 py-1 text-[13px] text-parchment/75 hover:border-gold-bright hover:text-gold-bright"
              >
                {p[lang]}
              </Link>
            ))}
          </div>
        )}

        {writer && (
          <aside
            aria-label={ui.aboutWriter}
            className="mx-auto mt-14 flex max-w-[66ch] gap-5 border-t border-gold/20 px-4 pt-8 sm:px-6"
          >
            <WriterPhoto w={writer} className="h-16 w-16 shrink-0 text-2xl" />
            <div>
              <p className="text-sm text-gold">{ui.aboutWriter}</p>
              <Link to={`/author/${writer.id}`} className="font-display text-2xl font-semibold text-parchment hover:text-gold-bright">
                {ta(writer, 'name', lang)}
              </Link>
              {ta(writer, 'role', lang) && <p className="text-sm text-mist">{ta(writer, 'role', lang)}</p>}
              {ta(writer, 'bio', lang) && <p className="mt-2 text-parchment/75">{ta(writer, 'bio', lang)}</p>}
            </div>
          </aside>
        )}
      </article>

      <Brief compact />

      {related.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-4 pb-24 sm:px-6" aria-labelledby="related-heading">
          <SectionHeading id="related-heading">{ui.more}</SectionHeading>
          <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((x: Article) => (
              <StoryCard key={x.id} a={x} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ---------- Country page ---------- */

export function CountryPage() {
  const { code } = useParams();
  const { articles, status, lang, ui } = useSite();
  const p = PARTNERS.find((x) => x.code.toLowerCase() === code);
  const list = useMemo(() => articles.filter((a) => p && a.countries?.includes(p.code)), [articles, p]);
  useTitle(p?.[lang]);

  if (!p) return <NotFoundPage />;
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-32 sm:px-6">
      <header>
        <Link to="/section/mongolia" className="text-sm text-gold hover:text-gold-bright">
          {ui.mapTitle}
        </Link>
        <h1 className="mt-3 font-display text-[clamp(3rem,8vw,6rem)] font-semibold leading-none text-parchment">
          {p[lang]}
        </h1>
        <p className="mt-3 text-mist">
          {RELATION_LABEL[p.relation][lang]}
          {status === 'ready' && (
            <>
              <span className="mx-2 text-gold/60" aria-hidden>
                /
              </span>
              {ui.stories(list.length)}
            </>
          )}
        </p>
      </header>
      <div className="mt-14">
        {status === 'loading' && <Loading />}
        {status === 'ready' && list.length === 0 && <StatusMessage>{ui.mapNoStories(p[lang])}</StatusMessage>}
        {list[0] && <StoryLead a={list[0]} />}
        {list.length > 1 && (
          <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.slice(1).map((a) => (
              <StoryCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Writer page ---------- */

export function AuthorPage() {
  const { id } = useParams();
  const { articles, authors, status, lang, ui } = useSite();
  const w = authors.find((x) => x.id === id);
  const list = useMemo(() => articles.filter((a) => a.authorId === id), [articles, id]);
  useTitle(w ? ta(w, 'name', lang) : undefined);

  if (status === 'loading') return <div className="pt-32"><Loading /></div>;
  if (!w) return <NotFoundPage />;
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-32 sm:px-6">
      <header className="flex flex-col gap-8 sm:flex-row sm:items-center">
        <WriterPhoto w={w} className="h-32 w-32 shrink-0 text-5xl sm:h-40 sm:w-40" />
        <div>
          <p className="text-sm text-gold">{ui.writer}</p>
          <h1 className="mt-1 font-display text-[clamp(2.6rem,6vw,4.5rem)] font-semibold leading-none text-parchment">
            {ta(w, 'name', lang)}
          </h1>
          {ta(w, 'role', lang) && <p className="mt-2 text-lg text-parchment/70">{ta(w, 'role', lang)}</p>}
          {ta(w, 'bio', lang) && <p className="mt-4 max-w-[60ch] leading-relaxed text-parchment/80">{ta(w, 'bio', lang)}</p>}
        </div>
      </header>
      {list.length > 0 && (
        <section className="mt-20" aria-labelledby="writer-stories">
          <SectionHeading id="writer-stories">{ui.byWriter}</SectionHeading>
          <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <StoryCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- 404 ---------- */

export function NotFoundPage() {
  const { ui } = useSite();
  useTitle();
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-20 text-center">
      <img src="/brand/logo-240.webp" alt="" className="w-28 opacity-40" />
      <p className="mt-8 font-display text-3xl text-parchment">{ui.notFound}</p>
      <Link to="/" className="mt-4 text-gold hover:text-gold-bright">
        {ui.backHome}
      </Link>
    </div>
  );
}

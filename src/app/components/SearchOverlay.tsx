import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { categoryLabel, formatDate, t } from '../data';
import { useSite } from '../state';

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { articles, lang, ui } = useSite();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return articles.filter((a) => {
      // search both languages so a Mongolian query finds stories while reading in English
      const hay = norm(
        [a.title, a.titleMn, a.excerpt, a.excerptMn, a.content, a.contentMn, a.category, a.categoryMn].join(' '),
      );
      return terms.every((term) => hay.includes(term));
    });
  }, [q, articles]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={ui.search}
      className="fixed inset-0 z-50 overflow-y-auto bg-night/92 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mx-auto max-w-[760px] px-4 pb-16 pt-6 sm:px-6 sm:pt-16">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-parchment/80 hover:bg-white/5"
            aria-label={ui.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="mt-4 flex items-center gap-4 border-b border-gold/40 pb-3 focus-within:border-gold-bright">
          <Search className="h-6 w-6 shrink-0 text-gold" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ui.searchPlaceholder}
            aria-label={ui.searchPlaceholder}
            className="w-full bg-transparent font-display text-3xl text-parchment placeholder:text-parchment/35 focus:outline-none sm:text-5xl"
          />
        </label>

        <ul className="mt-8 divide-y divide-white/5">
          {results.map((a) => (
            <li key={a.id}>
              <Link to={`/article/${a.id}`} onClick={onClose} className="story group block py-5">
                <span className="text-sm text-gold">{categoryLabel(a, lang)}</span>
                <span className="mt-1 block font-display text-2xl leading-snug text-parchment">
                  <span className="draw-line">{t(a, 'title', lang)}</span>
                </span>
                <span className="mt-1 block text-sm text-mist">{formatDate(a, lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
        {q.trim() && results.length === 0 && <p className="mt-8 text-mist">{ui.noResults}</p>}
      </div>
    </motion.div>
  );
}

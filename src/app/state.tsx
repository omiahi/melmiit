import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadArticles, loadAuthors, UI, type Article, type Author, type Lang } from './data';

interface SiteState {
  lang: Lang;
  setLang: (l: Lang) => void;
  ui: (typeof UI)['en'];
  articles: Article[];
  authors: Author[];
  status: 'loading' | 'ready' | 'error';
}

const Ctx = createContext<SiteState | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('melmiit-lang');
    if (saved === 'en' || saved === 'mn') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('mn') ? 'mn' : 'en';
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [status, setStatus] = useState<SiteState['status']>('loading');

  useEffect(() => {
    Promise.all([loadArticles(), loadAuthors()])
      .then(([list, writers]) => {
        setArticles(list);
        setAuthors(writers);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('melmiit-lang', l);
    } catch {
      /* storage unavailable */
    }
  };

  return <Ctx.Provider value={{ lang, setLang, ui: UI[lang], articles, authors, status }}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSite must be used inside SiteProvider');
  return v;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

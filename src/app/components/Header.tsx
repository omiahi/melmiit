import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Search, X } from 'lucide-react';
import { CATEGORIES } from '../data';
import { useSite } from '../state';
import { SearchOverlay } from './SearchOverlay';

export function Header() {
  const { lang, ui } = useSite();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(!isHome);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const on = () => setScrolled(window.scrollY > window.innerHeight * 0.62);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [isHome]);

  useEffect(() => setMenuOpen(false), [pathname]);

  // "/" opens search, like most news sites
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(target.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-[15px] transition-colors ${
      isActive ? 'text-gold-bright' : 'text-parchment/75 hover:text-parchment'
    }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled
            ? 'border-b border-gold/15 bg-night/80 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6">
          <Link
            to="/"
            aria-label="Dayan Melmiit — home"
            className={`flex shrink-0 items-center gap-3 transition-all duration-500 ${
              scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
            }`}
            tabIndex={scrolled ? 0 : -1}
          >
            <img src="/brand/logo-240.webp" alt="" className="h-10 w-auto" width={53} height={40} />
            <span className="hidden font-display text-lg font-semibold tracking-[0.28em] text-parchment sm:inline">
              DAYAN MELMIIT
            </span>
          </Link>

          <nav aria-label="Sections" className="mx-auto hidden lg:block">
            <ul className="flex items-center gap-7">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <NavLink to={`/section/${c.slug}`} className={navClass}>
                    {c[lang]}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-parchment/80 hover:bg-white/5 hover:text-parchment"
              aria-label={ui.search}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <LangSwitch />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-parchment/80 hover:bg-white/5 hover:text-parchment lg:hidden"
              aria-label={ui.menu}
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>{menuOpen && <MenuDrawer onClose={() => setMenuOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}</AnimatePresence>
    </>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useSite();
  const pillId = useId();
  return (
    <div role="group" aria-label="Language" className="flex w-fit rounded-full border border-gold/30 p-0.5 text-[13px]">
      {(['en', 'mn'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`relative rounded-full px-2.5 py-1 font-medium transition-colors ${
            lang === l ? 'text-night' : 'text-parchment/70 hover:text-parchment'
          }`}
        >
          {lang === l && (
            <motion.span
              layoutId={pillId}
              className="absolute inset-0 rounded-full bg-gold-bright"
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            />
          )}
          <span className="relative">{l.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

function MenuDrawer({ onClose }: { onClose: () => void }) {
  const { lang, ui } = useSite();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={ui.menu}
    >
      <div className="absolute inset-0 bg-night/70 backdrop-blur-sm" onClick={onClose} />
      <motion.nav
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 36 }}
        className="absolute right-0 top-0 flex h-full w-[min(86vw,360px)] flex-col border-l border-gold/20 bg-dusk px-6 pb-8 pt-4"
      >
        <div className="flex items-center justify-between">
          <img src="/brand/logo-240.webp" alt="Dayan Melmiit" className="h-12 w-auto" />
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-parchment/80 hover:bg-white/5"
            aria-label={ui.close}
            autoFocus
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="mt-8 space-y-1">
          <li>
            <Link to="/" className="block py-2 font-display text-3xl text-parchment hover:text-gold-bright">
              {ui.home}
            </Link>
          </li>
          {CATEGORIES.map((c, i) => (
            <motion.li
              key={c.slug}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
            >
              <NavLink
                to={`/section/${c.slug}`}
                className={({ isActive }) =>
                  `block py-2 font-display text-3xl ${isActive ? 'text-gold-bright' : 'text-parchment hover:text-gold-bright'}`
                }
              >
                {c[lang]}
              </NavLink>
            </motion.li>
          ))}
        </ul>
        <div className="mt-auto">
          <LangSwitch />
        </div>
      </motion.nav>
    </motion.div>
  );
}

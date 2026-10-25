import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { CATEGORIES } from './data';
import { SiteProvider, useSite } from './state';
import { Header } from './components/Header';
import { ArticlePage, HomePage, NotFoundPage, SectionPage } from './pages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Footer() {
  const { lang, ui } = useSite();
  return (
    <footer className="relative overflow-hidden border-t border-gold/15 bg-[radial-gradient(80%_120%_at_50%_0%,#0e1a33_0%,#060912_70%)]">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center px-4 py-16 text-center sm:px-6">
        <Link to="/" aria-label="Dayan Melmiit — home" className="group">
          <img
            src="/brand/logo-700.webp"
            alt="Dayan Melmiit"
            loading="lazy"
            className="w-48 transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:[filter:drop-shadow(0_0_24px_rgba(236,210,143,0.45))]"
          />
        </Link>
        <p className="mt-4 font-display text-xl italic text-parchment/75">{ui.tagline}</p>
        <nav aria-label="Sections" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px]">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/section/${c.slug}`} className="text-parchment/65 hover:text-gold-bright">
                  {c[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-10 text-sm text-mist/70">© {new Date().getFullYear()} Dayan Melmiit</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <ScrollToTop />
        <a
          href="#main"
          className="sr-only z-50 rounded bg-gold-bright px-4 py-2 text-night focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/section/:slug" element={<SectionPage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </SiteProvider>
  );
}

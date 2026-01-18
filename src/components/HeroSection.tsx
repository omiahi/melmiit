import { Link } from 'react-router-dom';
import type { Language } from '../App';
import { articles } from '../data/articles';

interface HeroSectionProps {
  language: Language;
}

const translations = {
  en: {
    readMore: 'READ MORE',
  },
  mn: {
    readMore: 'ДЭЛГЭРЭНГҮЙ',
  },
};

export function HeroSection({ language }: HeroSectionProps) {
  const t = translations[language];
  const heroArticle = articles[0]; // First article is the hero

  const category = language === 'en' ? heroArticle.category : heroArticle.categoryMn;
  const title = language === 'en' ? heroArticle.title : heroArticle.titleMn;
  const excerpt = language === 'en' ? heroArticle.excerpt : heroArticle.excerptMn;

  return (
    <section className="relative bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl">
          <div className="inline-block mb-6">
            <span className="text-xs tracking-[0.3em] text-zinc-400 border border-zinc-800 px-4 py-2">
              {category}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
            {excerpt}
          </p>
          <Link 
            to={`/article/${heroArticle.id}`}
            className="inline-block border border-white px-8 py-3 text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300"
          >
            {t.readMore}
          </Link>
        </div>
      </div>
    </section>
  );
}

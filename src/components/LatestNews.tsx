import { Link } from 'react-router-dom';
import type { Language } from '../App';
import { articles } from '../data/articles';

interface LatestNewsProps {
  language: Language;
}

const translations = {
  en: {
    title: 'LATEST NEWS',
  },
  mn: {
    title: 'СҮҮЛИЙН ҮЕИЙН МЭДЭЭ',
  },
};

export function LatestNews({ language }: LatestNewsProps) {
  const t = translations[language];
  // Use articles 4, 5, and some repeats for latest section
  const latestArticles = articles.slice(4, 6).concat(articles.slice(1, 5));

  return (
    <section className="bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl tracking-widest mb-12 border-b border-zinc-800 pb-4">
          {t.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {latestArticles.map((article, index) => {
            const category = language === 'en' ? article.category : article.categoryMn;
            const title = language === 'en' ? article.title : article.titleMn;
            const time = article.time 
              ? (language === 'en' ? article.time : article.timeMn)
              : (language === 'en' ? article.date : article.dateMn);

            return (
              <Link
                key={`${article.id}-${index}`}
                to={`/article/${article.id}`}
                className="group cursor-pointer border-l-2 border-zinc-800 pl-6 hover:border-white transition-colors"
              >
                <div className="mb-2">
                  <span className="text-xs tracking-[0.2em] text-zinc-600">
                    {category}
                  </span>
                </div>
                <h3 className="text-lg mb-2 group-hover:text-zinc-300 transition-colors">
                  {title}
                </h3>
                <time className="text-xs text-zinc-600">
                  {time}
                </time>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

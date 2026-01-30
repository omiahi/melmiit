import { Link } from 'react-router-dom';
import type { Language } from '../App';
import { Article } from '../data/articles';

interface FeaturedNewsProps {
  language: Language;
  articles: Article[];
}

export function FeaturedNews({ language, articles }: FeaturedNewsProps) {
  // Use articles 1, 2, 3 for featured section
  const featuredArticles = articles.slice(1, 4);

  return (
    <section className="bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArticles.map((article) => {
            const category = language === 'en' ? article.category : article.categoryMn;
            const title = language === 'en' ? article.title : article.titleMn;
            const excerpt = language === 'en' ? article.excerpt : article.excerptMn;
            const date = language === 'en' ? article.date : article.dateMn;

            return (
              <Link 
                key={article.id}
                to={`/article/${article.id}`}
                className="group cursor-pointer border-t border-zinc-800 pt-6 hover:border-zinc-600 transition-colors"
              >
                <div className="mb-4">
                  <span className="text-xs tracking-[0.3em] text-zinc-500">
                    {category}
                  </span>
                </div>
                <h3 className="text-xl mb-3 leading-tight group-hover:text-zinc-300 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
                  {excerpt}
                </p>
                <time className="text-xs text-zinc-600">
                  {date}
                </time>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

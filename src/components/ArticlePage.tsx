import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Language } from '../App';
import { articles } from '../data/articles';

interface ArticlePageProps {
  language: Language;
}

const translations = {
  en: {
    backToHome: 'BACK TO HOME',
    notFound: 'Article not found',
  },
  mn: {
    backToHome: 'НҮҮР ХУУДАС РУУ',
    notFound: 'Нийтлэл олдсонгүй',
  },
};

export function ArticlePage({ language }: ArticlePageProps) {
  const { id } = useParams<{ id: string }>();
  const t = translations[language];
  
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-2xl text-zinc-400">{t.notFound}</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 mt-8 text-sm tracking-widest hover:text-zinc-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToHome}
        </Link>
      </div>
    );
  }

  const title = language === 'en' ? article.title : article.titleMn;
  const category = language === 'en' ? article.category : article.categoryMn;
  const date = language === 'en' ? article.date : article.dateMn;
  const content = language === 'en' ? article.content : article.contentMn;

  return (
    <article className="bg-black">
      {/* Back button */}
      <div className="border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>
      </div>

      {/* Article header */}
      <div className="border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <span className="text-xs tracking-[0.3em] text-zinc-400 border border-zinc-800 px-4 py-2">
              {category}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            {title}
          </h1>
          <time className="text-sm text-zinc-500">
            {date}
          </time>
        </div>
      </div>

      {/* Featured image */}
      <div className="border-b border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <img 
            src={article.image} 
            alt={title}
            className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover"
          />
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert prose-lg max-w-none">
          {content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-lg text-zinc-300 leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

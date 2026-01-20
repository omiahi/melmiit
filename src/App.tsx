import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturedNews } from './components/FeaturedNews';
import { LatestNews } from './components/LatestNews';
import { Footer } from './components/Footer';
import { ArticlePage } from './components/ArticlePage';
import Admin from './pages/Admin';
import { Article } from './data/articles';
import { fetchArticles } from './lib/api';

export type Language = 'en' | 'mn';

function HomePage({ language, selectedCategory }: { language: Language; selectedCategory: string | null }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-zinc-500 tracking-widest animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  // Filter articles by selected category
  const filteredArticles = selectedCategory
    ? articles.filter(article => article.category === selectedCategory)
    : articles;

  return (
    <>
      <HeroSection language={language} articles={filteredArticles} />
      <FeaturedNews language={language} articles={filteredArticles} />
      <LatestNews language={language} articles={filteredArticles} />
    </>
  );
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        <Header
          language={language}
          setLanguage={setLanguage}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <Routes>
          <Route path="/" element={<HomePage language={language} selectedCategory={selectedCategory} />} />
          <Route path="/article/:id" element={<ArticlePage language={language} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer language={language} />
      </div>
    </BrowserRouter>
  );
}

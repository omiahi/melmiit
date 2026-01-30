import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/app/components/Header';
import { HomePage } from '@/app/pages/HomePage';
import { ArticleDetailPage } from '@/app/pages/ArticleDetailPage';
import { fetchArticles } from '@/lib/api';
import { mapOldToNew } from '@/app/lib/bridge';
import { NewArticle } from '@/app/data/newsData';
import logo from '@/assets/1B64D690-775F-4269-8428-369C6A0FF8AD.png';

export default function App() {
  const [language, setLanguage] = useState<'en' | 'mn'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<NewArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(fetched => {
        setArticles(fetched.map(mapOldToNew));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50 tracking-widest animate-pulse font-serif italic text-2xl">
          Melmiit...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        <Header 
          language={language} 
          onLanguageChange={setLanguage}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <main className="max-w-[1280px] mx-auto px-6 py-12">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  language={language} 
                  selectedCategory={selectedCategory}
                  articles={articles}
                />
              } 
            />
            <Route 
              path="/article/:id" 
              element={<ArticleDetailPage language={language} articles={articles} />} 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black mt-24">
          <div className="max-w-[1280px] mx-auto px-6 py-12">
            <div className="text-center space-y-4">
              <img src={logo} alt="Dayan Melmiit" className="h-20 mx-auto mb-2 opacity-80 object-contain" />
              <p className="text-white/60 text-sm tracking-wide">
                {language === 'en' 
                  ? 'International Journalism | Established 2026' 
                  : 'Олон улсын сэтгүүл зүй | Байгуулагдсан 2026'}
              </p>
              <div className="flex items-center justify-center gap-8 text-white/50 text-sm pt-6">
                <button className="hover:text-white transition-colors">
                  {language === 'en' ? 'About' : 'Бидний тухай'}
                </button>
                <button className="hover:text-white transition-colors">
                  {language === 'en' ? 'Contact' : 'Холбоо барих'}
                </button>
                <button className="hover:text-white transition-colors">
                  {language === 'en' ? 'Privacy' : 'Нууцлал'}
                </button>
                <button className="hover:text-white transition-colors">
                  {language === 'en' ? 'Terms' : 'Нөхцөл'}
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
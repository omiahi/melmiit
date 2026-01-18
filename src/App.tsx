import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturedNews } from './components/FeaturedNews';
import { LatestNews } from './components/LatestNews';
import { Footer } from './components/Footer';
import { ArticlePage } from './components/ArticlePage';

export type Language = 'en' | 'mn';

function HomePage({ language }: { language: Language }) {
  return (
    <>
      <HeroSection language={language} />
      <FeaturedNews language={language} />
      <LatestNews language={language} />
    </>
  );
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        <Header language={language} setLanguage={setLanguage} />
        <Routes>
          <Route path="/" element={<HomePage language={language} />} />
          <Route path="/article/:id" element={<ArticlePage language={language} />} />
        </Routes>
        <Footer language={language} />
      </div>
    </BrowserRouter>
  );
}

import { Globe } from 'lucide-react';
import type { Language } from '../App';
import logo from 'figma:asset/7af99ccca81e67ea546fd3afd91ac4248a65ee2b.png';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const translations = {
  en: {
    world: 'WORLD',
    politics: 'POLITICS',
    business: 'BUSINESS',
    culture: 'CULTURE',
    opinion: 'OPINION',
  },
  mn: {
    world: 'ДЭЛХИЙ',
    politics: 'УЛСТӨР',
    business: 'БИЗНЕС',
    culture: 'СОЁЛ',
    opinion: 'САНАЛ',
  },
};

export function Header({ language, setLanguage }: HeaderProps) {
  const t = translations[language];

  return (
    <header className="border-b border-zinc-800">
      {/* Top bar with language selector */}
      <div className="border-b border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-end items-center gap-2">
          <Globe className="w-4 h-4 text-zinc-400" />
          <button
            onClick={() => setLanguage('en')}
            className={`text-sm px-2 py-1 transition-colors ${
              language === 'en' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            EN
          </button>
          <span className="text-zinc-700">|</span>
          <button
            onClick={() => setLanguage('mn')}
            className={`text-sm px-2 py-1 transition-colors ${
              language === 'mn' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            MN
          </button>
        </div>
      </div>

      {/* Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <img 
            src={logo} 
            alt="Dayan Melmiit" 
            className="h-40 sm:h-52 lg:h-64 w-auto object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 py-4">
            <a href="#" className="text-sm tracking-widest hover:text-zinc-400 transition-colors">
              {t.world}
            </a>
            <a href="#" className="text-sm tracking-widest hover:text-zinc-400 transition-colors">
              {t.politics}
            </a>
            <a href="#" className="text-sm tracking-widest hover:text-zinc-400 transition-colors">
              {t.business}
            </a>
            <a href="#" className="text-sm tracking-widest hover:text-zinc-400 transition-colors">
              {t.culture}
            </a>
            <a href="#" className="text-sm tracking-widest hover:text-zinc-400 transition-colors">
              {t.opinion}
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
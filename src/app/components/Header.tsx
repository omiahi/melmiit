import { Globe, Menu, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/1B64D690-775F-4269-8428-369C6A0FF8AD.png';

interface HeaderProps {
  language: 'en' | 'mn';
  onLanguageChange: (lang: 'en' | 'mn') => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function Header({ language, onLanguageChange, selectedCategory, onCategoryChange }: HeaderProps) {
  const content = {
    en: {
      sections: [
        { name: 'World', slug: 'world' },
        { name: 'Politics', slug: 'politics' },
        { name: 'Business', slug: 'business' },
        { name: 'International', slug: 'international' },
        { name: 'Culture', slug: 'culture' },
        { name: 'Technology', slug: 'technology' },
      ],
      subscribe: 'Subscribe',
      login: 'Log In'
    },
    mn: {
      sections: [
        { name: 'Дэлхий', slug: 'world' },
        { name: 'Улс Төр', slug: 'politics' },
        { name: 'Бизнес', slug: 'business' },
        { name: 'Олон Улс', slug: 'international' },
        { name: 'Соёл', slug: 'culture' },
        { name: 'Технологи', slug: 'technology' },
      ],
      subscribe: 'Бүртгүүлэх',
      login: 'Нэвтрэх'
    }
  };

  const t = content[language];

  return (
    <header className="border-b border-white/10 bg-black sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-white/10 py-2">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <button className="p-2 hover:bg-white/5 rounded transition-colors">
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded transition-colors">
              <Search className="w-5 h-5 text-white" />
            </button>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2 border border-white/20 rounded px-3 py-1.5">
              <Globe className="w-4 h-4 text-white" />
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  language === 'en' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                EN
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => onLanguageChange('mn')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  language === 'mn' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                MN
              </button>
            </div>
            
            <button className="px-4 py-1.5 bg-white text-black hover:bg-white/90 transition-colors rounded">
              {t.subscribe}
            </button>
            
            <button className="px-4 py-1.5 text-white hover:bg-white/5 transition-colors rounded">
              {t.login}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center py-6 border-b border-white/10">
        <Link to="/" onClick={() => onCategoryChange(null)}>
          <img 
            src={logo} 
            alt="Dayan Melmiit" 
            className="h-32 mx-auto mb-2 hover:opacity-90 transition-opacity object-contain"
          />
        </Link>
        <p className="text-center text-white/60 text-sm mt-1 tracking-wide">
          INTERNATIONAL JOURNALISM
        </p>
      </div>

      {/* Navigation */}
      <nav className="py-3">
        <div className="max-w-[1280px] mx-auto px-6">
          <ul className="flex items-center justify-center gap-8">
            {t.sections.map((section) => (
              <li key={section.slug}>
                <button 
                  onClick={() => onCategoryChange(selectedCategory === section.slug ? null : section.slug)}
                  className={`text-sm tracking-wide transition-colors ${
                    selectedCategory === section.slug 
                      ? 'text-white border-b-2 border-white pb-1' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {section.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
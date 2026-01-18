import type { Language } from '../App';

interface FooterProps {
  language: Language;
}

const translations = {
  en: {
    about: 'ABOUT',
    contact: 'CONTACT',
    privacy: 'PRIVACY',
    terms: 'TERMS',
    tagline: 'International journalism with integrity and excellence',
    copyright: '© 2026 Dayan Melmiit. All rights reserved.',
  },
  mn: {
    about: 'БИДНИЙ ТУХАЙ',
    contact: 'ХОЛБОО БАРИХ',
    privacy: 'НУУЦЛАЛ',
    terms: 'НӨХЦӨЛ',
    tagline: 'Шударга байдал болон шилдэг чанартай олон улсын сэтгүүл зүй',
    copyright: '© 2026 Даян Мэлмийт. Бүх эрх хуулиар хамгаалагдсан.',
  },
};

export function Footer({ language }: FooterProps) {
  const t = translations[language];

  return (
    <footer className="bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <p className="text-sm text-zinc-500 tracking-wider">
            {t.tagline}
          </p>
          
          <nav className="flex gap-8">
            <a href="#" className="text-xs tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors">
              {t.about}
            </a>
            <a href="#" className="text-xs tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors">
              {t.contact}
            </a>
            <a href="#" className="text-xs tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors">
              {t.privacy}
            </a>
            <a href="#" className="text-xs tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors">
              {t.terms}
            </a>
          </nav>

          <div className="pt-6 border-t border-zinc-900 w-full">
            <p className="text-xs text-zinc-700">
              {t.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { HeroSection } from './HeroSection';
import { FeaturedNews } from './FeaturedNews';
import { LatestNews } from './LatestNews';
import type { Language } from '../App';

interface HomePageProps {
  language: Language;
}

export function HomePage({ language }: HomePageProps) {
  return (
    <>
      <HeroSection language={language} />
      <FeaturedNews language={language} />
      <LatestNews language={language} />
    </>
  );
}

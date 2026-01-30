import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface FeaturedArticleProps {
  category: string;
  title: string;
  excerpt: string;
  author: string;
  time: string;
  imageUrl: string;
  onClick?: () => void;
}

export function FeaturedArticle({ category, title, excerpt, author, time, imageUrl, onClick }: FeaturedArticleProps) {
  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <div className="relative overflow-hidden mb-4 aspect-[16/9]">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="space-y-3">
        <div className="text-white/60 text-xs tracking-widest uppercase">
          {category}
        </div>
        <h2 className="text-white text-4xl leading-tight font-serif group-hover:text-white/80 transition-colors">
          {title}
        </h2>
        <p className="text-white/70 text-lg leading-relaxed">
          {excerpt}
        </p>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <span>{author}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
    </article>
  );
}
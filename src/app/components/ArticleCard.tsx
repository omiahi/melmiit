import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface ArticleCardProps {
  category: string;
  title: string;
  excerpt?: string;
  author: string;
  time: string;
  imageUrl?: string;
  size?: 'medium' | 'small';
  onClick?: () => void;
}

export function ArticleCard({ category, title, excerpt, author, time, imageUrl, size = 'medium', onClick }: ArticleCardProps) {
  return (
    <article className="group cursor-pointer" onClick={onClick}>
      {imageUrl && (
        <div className="relative overflow-hidden mb-3 aspect-[16/9]">
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="space-y-2">
        <div className="text-white/60 text-xs tracking-widest uppercase">
          {category}
        </div>
        <h3 className={`text-white font-serif group-hover:text-white/80 transition-colors ${
          size === 'medium' ? 'text-2xl leading-tight' : 'text-xl leading-tight'
        }`}>
          {title}
        </h3>
        {excerpt && (
          <p className="text-white/70 leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <span>{author}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
    </article>
  );
}
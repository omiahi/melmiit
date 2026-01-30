interface ArticleListItemProps {
  category: string;
  title: string;
  time: string;
  onClick?: () => void;
}

export function ArticleListItem({ category, title, time, onClick }: ArticleListItemProps) {
  return (
    <article className="group cursor-pointer py-4 border-b border-white/10 last:border-b-0" onClick={onClick}>
      <div className="space-y-2">
        <div className="text-white/60 text-xs tracking-widest uppercase">
          {category}
        </div>
        <h4 className="text-white leading-snug group-hover:text-white/80 transition-colors">
          {title}
        </h4>
        <div className="text-white/50 text-sm">
          {time}
        </div>
      </div>
    </article>
  );
}
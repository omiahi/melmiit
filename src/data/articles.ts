export interface Article {
  id: string;
  category: string;
  categoryMn: string;
  title: string;
  titleMn: string;
  excerpt: string;
  excerptMn: string;
  content: string;
  contentMn: string;
  image: string;
  date: string;
  dateMn: string;
  time?: string;
  timeMn?: string;
}

// Articles are now loaded dynamically from /articles.json
// No hardcoded data - use fetchArticles() from lib/api.ts
export const articles: Article[] = [];

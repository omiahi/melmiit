import { Article as OldArticle } from '../../data/articles';
import { Article as NewArticle } from '../data/newsData';

export type { NewArticle };

export function mapOldToNew(old: OldArticle): NewArticle {
  return {
    id: old.id,
    category: {
      en: old.category,
      mn: old.categoryMn
    },
    categorySlug: old.category.toLowerCase().replace(/\s+/g, '-'),
    title: {
      en: old.title,
      mn: old.titleMn
    },
    excerpt: {
      en: old.excerpt,
      mn: old.excerptMn
    },
    author: {
      en: 'Melmiit Staff',
      mn: 'Мэлмий Баг'
    },
    time: old.date || old.time || '',
    imageUrl: old.image,
    fullContent: {
      en: old.content,
      mn: old.contentMn
    }
  };
}

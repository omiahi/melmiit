export type Lang = 'en' | 'mn';

/** One article as stored in public/articles.json (edited from /admin). */
export interface Article {
  id: string;
  category: string; // e.g. "DIPLOMACY"
  categoryMn?: string;
  title: string;
  titleMn?: string;
  date?: string; // ISO "2026-01-18" or free text
  dateMn?: string;
  image?: string;
  excerpt?: string;
  excerptMn?: string;
  content?: string;
  contentMn?: string;
  author?: string;
  authorMn?: string;
}

export const CATEGORIES = [
  { slug: 'diplomacy', key: 'DIPLOMACY', en: 'Diplomacy', mn: 'Дипломат' },
  { slug: 'geopolitics', key: 'GEOPOLITICS', en: 'Geopolitics', mn: 'Геополитик' },
  { slug: 'security', key: 'SECURITY', en: 'Security', mn: 'Аюулгүй байдал' },
  { slug: 'economy', key: 'ECONOMY', en: 'Economy & trade', mn: 'Эдийн засаг, худалдаа' },
  { slug: 'mongolia', key: 'MONGOLIA', en: 'Mongolia & the world', mn: 'Монгол ба дэлхий' },
  { slug: 'culture', key: 'CULTURE', en: 'Culture', mn: 'Соёл' },
] as const;

/** Section names used before the international-relations sections; kept so old stories still file correctly. */
const LEGACY: Record<string, string> = {
  INTERNATIONAL: 'DIPLOMACY',
  WORLD: 'GEOPOLITICS',
  POLITICS: 'GEOPOLITICS',
  BUSINESS: 'ECONOMY',
  TECHNOLOGY: 'SECURITY',
};

export type Category = (typeof CATEGORIES)[number];

export function categoryOf(a: Article): Category | undefined {
  const key = a.category?.toUpperCase() ?? '';
  return CATEGORIES.find((c) => c.key === (LEGACY[key] || key));
}

export function categoryLabel(a: Article, lang: Lang) {
  const c = categoryOf(a);
  if (c) return c[lang];
  return lang === 'mn' && a.categoryMn ? a.categoryMn : a.category;
}

/** Pick the right language, falling back to English when a translation is missing. */
export function t(a: Article, field: 'title' | 'excerpt' | 'content' | 'author', lang: Lang): string {
  if (lang === 'mn') {
    const mn = a[`${field}Mn` as keyof Article];
    if (mn) return mn as string;
  }
  return (a[field] as string) || '';
}

const MN_MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export function formatDate(a: Article, lang: Lang): string {
  if (lang === 'mn' && a.dateMn) return a.dateMn;
  if (!a.date) return '';
  const d = new Date(a.date.length === 10 ? a.date + 'T12:00:00' : a.date);
  if (isNaN(d.getTime())) return a.date;
  if (lang === 'mn') return `${d.getFullYear()} оны ${MN_MONTHS[d.getMonth()]}-р сарын ${d.getDate()}`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function byline(a: Article, lang: Lang) {
  return t(a, 'author', lang) || 'Dayan Melmiit';
}

export function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export async function loadArticles(): Promise<Article[]> {
  const res = await fetch('/articles.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load articles (${res.status})`);
  const list = (await res.json()) as Article[];
  return list.filter((a) => a && a.id && (a.title || a.titleMn));
}

export const UI = {
  en: {
    tagline: 'Diplomacy, geopolitics and international affairs',
    latest: 'Latest dispatches',
    more: 'More stories',
    readStory: 'Read the analysis',
    search: 'Search',
    searchPlaceholder: 'Search stories',
    noResults: 'No stories match that search.',
    close: 'Close',
    menu: 'Menu',
    home: 'Home',
    allStories: 'All stories',
    stories: (n: number) => `${n} ${n === 1 ? 'story' : 'stories'}`,
    minRead: (n: number) => `${n} min read`,
    empty: 'Nothing published here yet.',
    notFound: 'This story could not be found.',
    backHome: 'Back to the front page',
    copyLink: 'Copy link',
    copied: 'Link copied',
    share: 'Share',
    loadError: 'Stories could not load. Check your connection and refresh the page.',
    scroll: 'Scroll',
    contentSoon: 'The full text of this story is on its way.',
  },
  mn: {
    tagline: 'Дипломат, геополитик, олон улсын харилцаа',
    latest: 'Шинэ мэдээ',
    more: 'Бусад мэдээ',
    readStory: 'Унших',
    search: 'Хайх',
    searchPlaceholder: 'Мэдээ хайх',
    noResults: 'Хайлтад тохирох мэдээ олдсонгүй.',
    close: 'Хаах',
    menu: 'Цэс',
    home: 'Нүүр',
    allStories: 'Бүх мэдээ',
    stories: (n: number) => `${n} нийтлэл`,
    minRead: (n: number) => `${n} мин унших`,
    empty: 'Энд одоогоор нийтлэл алга.',
    notFound: 'Энэ нийтлэл олдсонгүй.',
    backHome: 'Нүүр хуудас руу буцах',
    copyLink: 'Холбоос хуулах',
    copied: 'Хуулагдлаа',
    share: 'Хуваалцах',
    loadError: 'Мэдээ ачаалагдсангүй. Интернэтээ шалгаад хуудсаа дахин ачаална уу.',
    scroll: 'Доош',
    contentSoon: 'Энэ нийтлэлийн бүрэн эх удахгүй нэмэгдэнэ.',
  },
};

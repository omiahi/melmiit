export type Lang = 'en' | 'mn';

export type StoryKind = 'news' | 'analysis' | 'interview' | 'brief' | 'opinion';

/** One article as stored in public/articles.json (edited from /admin). */
export interface Article {
  id: string;
  category: string; // e.g. "DIPLOMACY"
  categoryMn?: string;
  kind?: StoryKind;
  title: string;
  titleMn?: string;
  date?: string; // ISO "2026-01-18" or free text
  dateMn?: string;
  image?: string;
  excerpt?: string;
  excerptMn?: string;
  content?: string;
  contentMn?: string;
  authorId?: string; // a writer from public/authors.json
  author?: string; // guest byline when there is no writer profile
  authorMn?: string;
  countries?: string[]; // partner codes, e.g. ["RU", "CN"]
}

/** A writer, stored in public/authors.json (edited from /admin). */
export interface Author {
  id: string;
  name: string;
  nameMn?: string;
  role?: string;
  roleMn?: string;
  bio?: string;
  bioMn?: string;
  photo?: string;
}

export const CATEGORIES = [
  { slug: 'diplomacy', key: 'DIPLOMACY', en: 'Diplomacy', mn: 'Дипломат' },
  { slug: 'geopolitics', key: 'GEOPOLITICS', en: 'Geopolitics', mn: 'Геополитик' },
  { slug: 'security', key: 'SECURITY', en: 'Security', mn: 'Аюулгүй байдал' },
  { slug: 'economy', key: 'ECONOMY', en: 'Economy & trade', mn: 'Эдийн засаг, худалдаа' },
  { slug: 'mongolia', key: 'MONGOLIA', en: 'Mongolia & the world', mn: 'Монгол ба дэлхий' },
  { slug: 'culture', key: 'CULTURE', en: 'Culture', mn: 'Соёл' },
] as const;

export const KINDS: { key: StoryKind; en: string; mn: string }[] = [
  { key: 'news', en: 'News', mn: 'Мэдээ' },
  { key: 'analysis', en: 'Analysis', mn: 'Дүн шинжилгээ' },
  { key: 'interview', en: 'Interview', mn: 'Ярилцлага' },
  { key: 'brief', en: 'Brief', mn: 'Товч' },
  { key: 'opinion', en: 'Opinion', mn: 'Байр суурь' },
];

export type Relation = 'neighbour' | 'third' | 'region';

export interface Partner {
  code: string;
  en: string;
  mn: string;
  relation: Relation;
  /** ISO 3166 numeric ids of the countries to highlight on the map */
  iso: string[];
  /** [longitude, latitude] of the capital */
  capital: [number, number];
}

const EU_ISO = [
  '040', '056', '100', '191', '196', '203', '208', '233', '246', '250', '276', '300', '348', '372',
  '380', '428', '440', '442', '470', '528', '616', '620', '642', '703', '705', '724', '752',
];

/** Mongolia's two neighbours, its "third neighbours", and close regional partners. */
export const PARTNERS: Partner[] = [
  { code: 'RU', en: 'Russia', mn: 'Орос', relation: 'neighbour', iso: ['643'], capital: [37.62, 55.75] },
  { code: 'CN', en: 'China', mn: 'Хятад', relation: 'neighbour', iso: ['156'], capital: [116.4, 39.9] },
  { code: 'US', en: 'United States', mn: 'АНУ', relation: 'third', iso: ['840'], capital: [-77.04, 38.9] },
  { code: 'JP', en: 'Japan', mn: 'Япон', relation: 'third', iso: ['392'], capital: [139.69, 35.69] },
  { code: 'KR', en: 'South Korea', mn: 'Өмнөд Солонгос', relation: 'third', iso: ['410'], capital: [126.98, 37.57] },
  { code: 'EU', en: 'European Union', mn: 'Европын холбоо', relation: 'third', iso: EU_ISO, capital: [4.35, 50.85] },
  { code: 'IN', en: 'India', mn: 'Энэтхэг', relation: 'third', iso: ['356'], capital: [77.21, 28.61] },
  { code: 'TR', en: 'Türkiye', mn: 'Турк', relation: 'third', iso: ['792'], capital: [32.85, 39.93] },
  { code: 'CA', en: 'Canada', mn: 'Канад', relation: 'third', iso: ['124'], capital: [-75.7, 45.42] },
  { code: 'AU', en: 'Australia', mn: 'Австрали', relation: 'third', iso: ['036'], capital: [149.13, -35.28] },
  { code: 'KZ', en: 'Kazakhstan', mn: 'Казахстан', relation: 'region', iso: ['398'], capital: [71.43, 51.13] },
];

export const ULAANBAATAR: [number, number] = [106.92, 47.92];

export const RELATION_LABEL: Record<Relation, { en: string; mn: string }> = {
  neighbour: { en: 'Neighbour', mn: 'Хөрш' },
  third: { en: 'Third neighbour', mn: 'Гуравдагч хөрш' },
  region: { en: 'Regional partner', mn: 'Бүс нутгийн түнш' },
};

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

/** The story type label, or '' for plain news (which goes unlabelled). */
export function kindLabel(a: Article, lang: Lang) {
  if (!a.kind || a.kind === 'news') return '';
  return KINDS.find((k) => k.key === a.kind)?.[lang] ?? '';
}

/** Pick the right language, falling back to English when a translation is missing. */
export function t(a: Article, field: 'title' | 'excerpt' | 'content' | 'author', lang: Lang): string {
  if (lang === 'mn') {
    const mn = a[`${field}Mn` as keyof Article];
    if (mn) return mn as string;
  }
  return (a[field] as string) || '';
}

export function ta(a: Author, field: 'name' | 'role' | 'bio', lang: Lang): string {
  if (lang === 'mn') {
    const mn = a[`${field}Mn` as keyof Author];
    if (mn) return mn;
  }
  return a[field] || '';
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

export function authorOf(a: Article, authors: Author[]) {
  return a.authorId ? authors.find((x) => x.id === a.authorId) : undefined;
}

export function byline(a: Article, lang: Lang, authors: Author[] = []) {
  const w = authorOf(a, authors);
  if (w) return ta(w, 'name', lang);
  return t(a, 'author', lang).trim() || 'Dayan Melmiit';
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

export async function loadAuthors(): Promise<Author[]> {
  try {
    const res = await fetch('/authors.json', { cache: 'no-cache' });
    if (!res.ok) return [];
    const list = (await res.json()) as Author[];
    return Array.isArray(list) ? list.filter((a) => a && a.id && a.name) : [];
  } catch {
    return [];
  }
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
    // map
    mapTitle: 'Mongolia and the world',
    mapLede: 'The world as seen from Ulaanbaatar. Choose a country to read about its ties with Mongolia.',
    mapFromUb: (km: string) => `${km} km from Ulaanbaatar`,
    mapNoStories: (name: string) => `No stories about ${name} yet.`,
    mapAll: (name: string) => `All stories on ${name}`,
    mapPrompt: 'Choose a country on the map or below.',
    // writers
    writer: 'Writer',
    aboutWriter: 'About the writer',
    byWriter: 'Stories',
    // newsletter
    briefTitle: 'The Brief',
    briefLede: 'The week in diplomacy and geopolitics, in one email.',
    briefPlaceholder: 'Your email address',
    briefButton: 'Subscribe',
    briefDone: 'Subscribed. Check your inbox to confirm.',
    briefDuplicate: 'That address is already subscribed.',
    briefError: 'That did not work. Check the address and try again.',
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
    mapTitle: 'Монгол ба дэлхий',
    mapLede: 'Улаанбаатараас харсан дэлхий. Монголтой харилцааных нь тухай унших улсаа сонгоно уу.',
    mapFromUb: (km: string) => `Улаанбаатараас ${km} км`,
    mapNoStories: (name: string) => `${name}: нийтлэл одоогоор алга.`,
    mapAll: (name: string) => `${name}: бүх нийтлэл`,
    mapPrompt: 'Газрын зураг эсвэл доорх жагсаалтаас улсаа сонгоно уу.',
    writer: 'Нийтлэлч',
    aboutWriter: 'Нийтлэлчийн тухай',
    byWriter: 'Нийтлэлүүд',
    briefTitle: 'Товч тойм',
    briefLede: 'Долоо хоногийн дипломат, геополитикийн гол мэдээ нэг имэйлээр.',
    briefPlaceholder: 'Имэйл хаяг',
    briefButton: 'Бүртгүүлэх',
    briefDone: 'Бүртгэгдлээ. Баталгаажуулахын тулд имэйлээ шалгана уу.',
    briefDuplicate: 'Энэ хаяг аль хэдийн бүртгэлтэй байна.',
    briefError: 'Амжилтгүй боллоо. Хаягаа шалгаад дахин оролдоно уу.',
  },
};

import { Article } from '../data/articles';

export async function fetchArticles(): Promise<Article[]> {
  const response = await fetch('/articles.json');
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}

export async function fetchArticleById(id: string): Promise<Article> {
  const articles = await fetchArticles();
  const article = articles.find(a => a.id === id);
  if (!article) {
    throw new Error('Article not found');
  }
  return article;
}

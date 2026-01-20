import { Article } from '../data/articles';

export async function fetchArticles(): Promise<Article[]> {
  const response = await fetch('/api/articles');
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}

export async function fetchArticleById(id: string): Promise<Article> {
  const response = await fetch(`/api/articles/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

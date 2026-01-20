import { VercelRequest, VercelResponse } from '@vercel/node';
import { articles } from '../../src/data/articles';

// In a real app, this would be a database. 
// For this task, we'll use the static data as a base.
let mockArticles = [...articles];

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request;

  if (method === 'GET') {
    return response.status(200).json(mockArticles);
  }

  if (method === 'POST') {
    const newArticle = request.body;
    if (!newArticle.id || !newArticle.title) {
      return response.status(400).json({ message: 'Missing required fields' });
    }
    mockArticles = [newArticle, ...mockArticles];
    return response.status(201).json(newArticle);
  }

  return response.status(405).json({ message: 'Method Not Allowed' });
}

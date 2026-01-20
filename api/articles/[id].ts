import { VercelRequest, VercelResponse } from '@vercel/node';
import { articles } from '../../src/data/articles';

// In a real app, this would shared with the other handler via a DB.
// For demonstration, we keep it consistent with the base data.
let mockArticles = [...articles];

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { id } = request.query;
  const { method } = request;

  if (method === 'GET') {
    const article = mockArticles.find((a) => a.id === id);
    if (!article) {
      return response.status(404).json({ message: 'Article not found' });
    }
    return response.status(200).json(article);
  }

  if (method === 'PUT') {
    const index = mockArticles.findIndex((a) => a.id === id);
    if (index === -1) {
      return response.status(404).json({ message: 'Article not found' });
    }
    mockArticles[index] = { ...mockArticles[index], ...request.body };
    return response.status(200).json(mockArticles[index]);
  }

  if (method === 'DELETE') {
    const index = mockArticles.findIndex((a) => a.id === id);
    if (index === -1) {
      return response.status(404).json({ message: 'Article not found' });
    }
    mockArticles.splice(index, 1);
    return response.status(204).end();
  }

  return response.status(405).json({ message: 'Method Not Allowed' });
}

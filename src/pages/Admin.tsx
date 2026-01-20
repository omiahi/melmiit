import { useState, useEffect } from 'react';

/**
 * Article type matching content/articles.json schema
 */
interface Article {
  id: string;
  category: string;
  categoryMn: string;
  title: string;
  titleMn: string;
  date: string;
  dateMn: string;
  image: string;
  body: string;
  bodyMn?: string;
}

/**
 * Simple password-protected admin panel for managing articles
 * - Password stored in VITE_ADMIN_PASSWORD environment variable
 * - Displays all articles in a list
 * - Allows editing existing articles and creating new ones
 * - Saves changes via /api/save-articles serverless function
 */
export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load articles from JSON file
  useEffect(() => {
    if (authenticated) {
      fetch('/content/articles.json')
        .then(res => res.json())
        .then(setArticles)
        .catch(err => setMessage('Failed to load articles: ' + err.message));
    }
  }, [authenticated]);

  // Simple password check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, check against environment variable on server
    // For now, hardcoded for simplicity (will validate on API)
    if (password) {
      setAuthenticated(true);
    }
  };

  // Save all articles to GitHub via serverless function
  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/save-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, articles }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setMessage('✅ Articles saved and committed to GitHub!');
    } catch (err: any) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add new empty article
  const handleAddNew = () => {
    const newArticle: Article = {
      id: Date.now().toString(),
      category: '',
      categoryMn: '',
      title: '',
      titleMn: '',
      date: new Date().toISOString().split('T')[0],
      dateMn: '',
      image: '',
      body: '',
      bodyMn: '',
    };
    setArticles([...articles, newArticle]);
    setEditingId(newArticle.id);
  };

  // Update article field
  const updateArticle = (id: string, field: keyof Article, value: string) => {
    setArticles(articles.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  // Delete article
  const deleteArticle = (id: string) => {
    if (confirm('Delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-800 p-8 rounded-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Article Manager</h1>
          <div className="flex gap-2">
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
            >
              + Add New Article
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-zinc-800 rounded">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="bg-zinc-800 p-6 rounded-lg">
              {editingId === article.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">Editing: {article.title || 'New Article'}</h3>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
                    >
                      Done
                    </button>
                  </div>

                  <input
                    placeholder="ID"
                    value={article.id}
                    onChange={e => updateArticle(article.id, 'id', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-700 rounded text-sm"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Category (EN)"
                      value={article.category}
                      onChange={e => updateArticle(article.id, 'category', e.target.value)}
                      className="px-3 py-2 bg-zinc-700 rounded"
                    />
                    <input
                      placeholder="Category (MN)"
                      value={article.categoryMn}
                      onChange={e => updateArticle(article.id, 'categoryMn', e.target.value)}
                      className="px-3 py-2 bg-zinc-700 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Title (EN)"
                      value={article.title}
                      onChange={e => updateArticle(article.id, 'title', e.target.value)}
                      className="px-3 py-2 bg-zinc-700 rounded"
                    />
                    <input
                      placeholder="Title (MN)"
                      value={article.titleMn}
                      onChange={e => updateArticle(article.id, 'titleMn', e.target.value)}
                      className="px-3 py-2 bg-zinc-700 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={article.date}
                      onChange={e => updateArticle(article.id, 'date', e.target.value)}
                      className="px-3 py-2 bg-zinc-700 rounded"
                    />
                    <input
                      placeholder="Date (MN)"
                      value={article.dateMn}
                      onChange={e => updateArticle(article.id, 'dateMn', e.target.value)}
                      className="px-3 py-2 bg-zinc-700 rounded"
                    />
                  </div>

                  <input
                    placeholder="Image URL"
                    value={article.image}
                    onChange={e => updateArticle(article.id, 'image', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-700 rounded"
                  />

                  <textarea
                    placeholder="Body (EN)"
                    value={article.body}
                    onChange={e => updateArticle(article.id, 'body', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-700 rounded h-32"
                  />

                  <textarea
                    placeholder="Body (MN)"
                    value={article.bodyMn || ''}
                    onChange={e => updateArticle(article.id, 'bodyMn', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-700 rounded h-32"
                  />

                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete Article
                  </button>
                </div>
              ) : (
                // View mode
                <div
                  onClick={() => setEditingId(article.id)}
                  className="cursor-pointer hover:bg-zinc-750"
                >
                  <h3 className="font-bold text-xl mb-2">{article.title || 'Untitled'}</h3>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>ID: {article.id}</p>
                    <p>Category: {article.category} / {article.categoryMn}</p>
                    <p>Date: {article.date}</p>
                    <p className="truncate">Body: {article.body.substring(0, 100)}...</p>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Click to edit</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

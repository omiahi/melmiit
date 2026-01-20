import { useState, useEffect } from 'react';

/**
 * Article type matching content/articles.json schema
 * All fields optional for safety - articles.json may have incomplete data
 */
interface Article {
  id?: string;
  category?: string;
  categoryMn?: string;
  title?: string;
  titleMn?: string;
  date?: string;
  dateMn?: string;
  image?: string;
  excerpt?: string;
  excerptMn?: string;
  content?: string;
  contentMn?: string;
  // Legacy fields for backward compatibility
  body?: string;
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
      fetch('/articles.json')
        .then(res => res.json())
        .then(setArticles)
        .catch(err => setMessage('Failed to load articles: ' + err.message));
    }
  }, [authenticated]);

  // Simple password check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Check against environment variable (VITE_ADMIN_PASSWORD)
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === correctPassword) {
      setAuthenticated(true);
    } else {
      setMessage('❌ Invalid password');
      setPassword('');
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
      category: 'WORLD',
      categoryMn: 'ДЭЛХИЙ',
      title: '',
      titleMn: '',
      date: new Date().toISOString().split('T')[0],
      dateMn: '',
      image: '',
      excerpt: '',
      excerptMn: '',
      content: '',
      contentMn: '',
    };
    setArticles([newArticle, ...articles]); // Add to beginning instead of end
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
      <div className="admin-login-page">
        <form onSubmit={handleLogin} className="admin-login-form">
          <h1>Admin Login</h1>
          {message && <div className="admin-error">{message}</div>}
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="admin-panel">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Article Manager</h1>
          <div className="admin-actions">
            <button onClick={handleAddNew} className="btn btn-success">
              + Add New Article
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="article-list">
          {articles.map((article, index) => (
            <div key={article.id || `article-${index}`} className="article-card">
              {editingId === article.id ? (
                // Edit mode
                <div className="article-edit">
                  <div className="article-edit-header">
                    <h3>Editing: {article.title || 'New Article'}</h3>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm">
                      Done
                    </button>
                  </div>

                  <input
                    placeholder="ID"
                    value={article.id || ''}
                    onChange={e => updateArticle(article.id || '', 'id', e.target.value)}
                    className="form-input form-input-sm"
                  />

                  <div>
                    <div className="category-label">Category: {article.category || 'None'}</div>
                    <div className="category-selector">
                      {['WORLD', 'POLITICS', 'BUSINESS', 'CULTURE', 'INTERNATIONAL'].map(cat => {
                        const isActive = article.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            className={`category-btn ${isActive ? 'active' : ''}`}
                            onClick={() => {
                              console.log('Clicking category:', cat, 'Current:', article.category);
                              updateArticle(article.id || '', 'category', cat);
                              // Auto-set Mongolian category
                              const mnCategories: Record<string, string> = {
                                'WORLD': 'ДЭЛХИЙ',
                                'POLITICS': 'УЛСТӨР',
                                'BUSINESS': 'БИЗНЕС',
                                'CULTURE': 'СОЁЛ',
                                'INTERNATIONAL': 'ОЛОН УЛСЫН'
                              };
                              updateArticle(article.id || '', 'categoryMn', mnCategories[cat] || '');
                            }}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-row">
                    <input
                      placeholder="Title (EN)"
                      value={article.title || ''}
                      onChange={e => updateArticle(article.id || '', 'title', e.target.value)}
                      className="form-input"
                    />
                    <input
                      placeholder="Title (MN)"
                      value={article.titleMn || ''}
                      onChange={e => updateArticle(article.id || '', 'titleMn', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="date"
                      value={article.date || ''}
                      onChange={e => updateArticle(article.id || '', 'date', e.target.value)}
                      className="form-input"
                    />
                    <input
                      placeholder="Date (MN)"
                      value={article.dateMn || ''}
                      onChange={e => updateArticle(article.id || '', 'dateMn', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <input
                    placeholder="Image URL"
                    value={article.image || ''}
                    onChange={e => updateArticle(article.id || '', 'image', e.target.value)}
                    className="form-input"
                  />

                  <textarea
                    placeholder="Excerpt (EN)"
                    value={article.excerpt || article.body || ''}
                    onChange={e => updateArticle(article.id || '', 'excerpt', e.target.value)}
                    className="form-textarea"
                  />

                  <textarea
                    placeholder="Excerpt (MN)"
                    value={article.excerptMn || article.bodyMn || ''}
                    onChange={e => updateArticle(article.id || '', 'excerptMn', e.target.value)}
                    className="form-textarea"
                  />

                  <textarea
                    placeholder="Content (EN)"
                    value={article.content || ''}
                    onChange={e => updateArticle(article.id || '', 'content', e.target.value)}
                    className="form-textarea"
                  />

                  <textarea
                    placeholder="Content (MN)"
                    value={article.contentMn || ''}
                    onChange={e => updateArticle(article.id || '', 'contentMn', e.target.value)}
                    className="form-textarea"
                  />

                  <button onClick={() => deleteArticle(article.id || '')} className="btn btn-danger btn-sm">
                    Delete Article
                  </button>
                </div>
              ) : (
                // View mode
                <div onClick={() => setEditingId(article.id || '')} className="article-card-view">
                  <h3>{article.title || 'Untitled'}</h3>
                  <div className="article-meta">
                    <p>ID: {article.id || 'N/A'}</p>
                    <p>Category: {article.category || 'N/A'} / {article.categoryMn || 'N/A'}</p>
                    <p>Date: {article.date || 'N/A'}</p>
                    <p>Preview: {(article.content || article.body || article.excerpt || '').substring(0, 100)}...</p>
                  </div>
                  <p className="article-hint">Click to edit</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

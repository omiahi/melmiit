/**
 * Publishes the articles (and any newly uploaded photos) as a single commit on GitHub.
 * Vercel sees the commit and redeploys the site, usually within a minute.
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   ADMIN_PASSWORD  password for melmiit.com/admin
 *   GITHUB_TOKEN    GitHub token with "Contents: Read and write" on the repository
 *   GITHUB_REPO     optional, defaults to "omiahi/melmiit"
 *   GITHUB_BRANCH   optional, defaults to "main"
 */
import { ARTICLES_PATH, BRANCH, gh, requirePassword } from './_lib.js';

const UPLOAD_PATH = /^public\/uploads\/[a-z0-9-]+\.(jpg|webp|png)$/;
const TEXT_FIELDS = [
  'id', 'category', 'categoryMn', 'title', 'titleMn', 'date', 'dateMn', 'image',
  'excerpt', 'excerptMn', 'content', 'contentMn', 'author', 'authorMn',
];

function clean(article) {
  const out = {};
  for (const key of TEXT_FIELDS) {
    const v = article?.[key];
    if (typeof v === 'string' && v.trim() !== '') out[key] = v.trim();
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requirePassword(req, res))) return;

  const { articles, files = [] } = req.body || {};
  if (!Array.isArray(articles)) return res.status(400).json({ error: 'No articles were sent.' });

  const list = articles.map(clean);
  const ids = new Set();
  for (const a of list) {
    if (!a.id || !/^[a-z0-9-]+$/i.test(a.id)) {
      return res.status(400).json({ error: `Article "${a.title || a.titleMn || '?'}" has an invalid ID.` });
    }
    if (ids.has(a.id)) return res.status(400).json({ error: `Two articles share the ID "${a.id}".` });
    ids.add(a.id);
    if (!a.title && !a.titleMn) return res.status(400).json({ error: 'Every article needs a title.' });
  }
  for (const f of files) {
    if (!UPLOAD_PATH.test(f?.path || '') || !/^[0-9a-f]{40}$/.test(f?.sha || '')) {
      return res.status(400).json({ error: 'A photo upload was not recognized. Upload it again.' });
    }
  }

  try {
    const ref = await gh(`/git/ref/heads/${BRANCH}`);
    const parent = await gh(`/git/commits/${ref.object.sha}`);
    const articlesBlob = await gh('/git/blobs', {
      method: 'POST',
      body: JSON.stringify({ content: JSON.stringify(list, null, 2) + '\n', encoding: 'utf-8' }),
    });
    const tree = await gh('/git/trees', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: parent.tree.sha,
        tree: [
          { path: ARTICLES_PATH, mode: '100644', type: 'blob', sha: articlesBlob.sha },
          ...files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', sha: f.sha })),
        ],
      }),
    });
    const commit = await gh('/git/commits', {
      method: 'POST',
      body: JSON.stringify({
        message: files.length
          ? `Publish articles from admin (+${files.length} photo${files.length > 1 ? 's' : ''})`
          : 'Publish articles from admin',
        tree: tree.sha,
        parents: [parent.sha],
      }),
    });
    await gh(`/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha }),
    });
    res.status(200).json({ success: true, commit: commit.sha });
  } catch (err) {
    console.error('Publish failed:', err);
    res.status(500).json({ error: err.message });
  }
}

// Returns the latest articles straight from GitHub, so the admin never edits a stale copy
// while the site is still redeploying after the last publish.
import { ARTICLES_PATH, AUTHORS_PATH, BRANCH, gh, requirePassword } from './_lib.js';

async function readJson(path, fallback) {
  try {
    const file = await gh(`/contents/${path}?ref=${BRANCH}`);
    return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  } catch (err) {
    if (fallback !== undefined && /Not Found/i.test(err.message)) return fallback;
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requirePassword(req, res))) return;
  try {
    const [articles, authors] = await Promise.all([readJson(ARTICLES_PATH), readJson(AUTHORS_PATH, [])]);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ articles, authors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

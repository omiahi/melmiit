// Returns the latest articles straight from GitHub, so the admin never edits a stale copy
// while the site is still redeploying after the last publish.
import { ARTICLES_PATH, BRANCH, gh, requirePassword } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requirePassword(req, res))) return;
  try {
    const file = await gh(`/contents/${ARTICLES_PATH}?ref=${BRANCH}`);
    const text = Buffer.from(file.content, 'base64').toString('utf8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ articles: JSON.parse(text) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

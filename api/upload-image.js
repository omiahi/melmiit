// Stores one photo in the repository (as a git blob). It becomes part of the site
// in the same commit as the articles when you press Publish.
import { gh, requirePassword } from './_lib.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };
const MAX_BYTES = 3 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requirePassword(req, res))) return;

  const { name, type, data } = req.body || {};
  const ext = TYPES[type];
  if (!ext) return res.status(400).json({ error: 'Photos must be JPG, PNG or WebP.' });
  if (typeof data !== 'string') return res.status(400).json({ error: 'No photo was sent.' });

  const bytes = Buffer.from(data, 'base64');
  if (bytes.length > MAX_BYTES) return res.status(413).json({ error: 'That photo is larger than 3 MB.' });

  const base =
    String(name || 'photo')
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'photo';
  const stamp = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 7);
  const file = `${stamp}-${base}-${rand}.${ext}`;

  try {
    const blob = await gh('/git/blobs', {
      method: 'POST',
      body: JSON.stringify({ content: data, encoding: 'base64' }),
    });
    res.status(200).json({ path: `public/uploads/${file}`, url: `/uploads/${file}`, sha: blob.sha });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

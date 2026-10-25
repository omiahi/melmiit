import { requirePassword } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not set in Vercel environment variables.' });
  }
  if (!(await requirePassword(req, res))) return;
  res.status(200).json({ ok: true });
}

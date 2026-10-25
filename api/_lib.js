// Shared helpers for the admin API. Files starting with "_" are not exposed as routes on Vercel.
import { createHash, timingSafeEqual } from 'node:crypto';

export const REPO = process.env.GITHUB_REPO || 'omiahi/melmiit';
export const BRANCH = process.env.GITHUB_BRANCH || 'main';
export const ARTICLES_PATH = 'public/articles.json';

/** Constant-time password check against the ADMIN_PASSWORD environment variable. */
export function passwordOk(given) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof given !== 'string' || !given) return false;
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Reject wrong passwords, with a short delay to slow down guessing. */
export async function requirePassword(req, res) {
  const pw = req.body?.password ?? req.headers['x-admin-password'];
  if (passwordOk(pw)) return true;
  await new Promise((r) => setTimeout(r, 700));
  res.status(401).json({ error: 'That password is not correct.' });
  return false;
}

export async function gh(path, init = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set in Vercel environment variables.');
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint =
      res.status === 401 || res.status === 403
        ? ' Check that GITHUB_TOKEN is valid and has "Contents: Read and write" access to the repository.'
        : '';
    throw new Error(`GitHub: ${data.message || res.statusText}.${hint}`);
  }
  return data;
}

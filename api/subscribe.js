// "The Brief" newsletter signup, via Buttondown (https://buttondown.com).
// Set BUTTONDOWN_API_KEY in Vercel to switch the signup form on; without it the form stays hidden.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  const key = process.env.BUTTONDOWN_API_KEY;

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json({ enabled: !!key });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!key) return res.status(503).json({ error: 'Newsletter is not set up yet.' });

  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email address.', reason: 'invalid' });
  }

  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  try {
    const r = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_address: email,
        ...(forwarded ? { ip_address: forwarded } : {}),
        referrer_url: req.headers.referer || 'https://melmiit.com',
      }),
    });
    if (r.ok) return res.status(200).json({ ok: true });
    const data = await r.json().catch(() => ({}));
    const text = JSON.stringify(data).toLowerCase();
    if (r.status === 400 && (text.includes('already') || text.includes('exists'))) {
      return res.status(409).json({ error: 'Already subscribed.', reason: 'duplicate' });
    }
    console.error('Buttondown error', r.status, data);
    return res.status(502).json({ error: 'Subscription failed.', reason: 'upstream' });
  } catch (err) {
    console.error('Buttondown unreachable', err);
    return res.status(502).json({ error: 'Subscription failed.', reason: 'upstream' });
  }
}

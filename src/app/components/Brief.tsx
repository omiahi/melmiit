import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSite } from '../state';

let enabledCache: Promise<boolean> | null = null;
function newsletterEnabled() {
  enabledCache ??= fetch('/api/subscribe')
    .then((r) => (r.ok ? r.json() : { enabled: false }))
    .then((d) => !!d.enabled)
    .catch(() => false);
  return enabledCache;
}

/** "The Brief" signup. Stays hidden until the newsletter service is configured on the server. */
export function Brief({ compact = false }: { compact?: boolean }) {
  const { ui } = useSite();
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'duplicate' | 'error'>('idle');

  useEffect(() => {
    newsletterEnabled().then(setEnabled);
  }, []);

  if (!enabled) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('busy');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setState('done');
      else setState(data.reason === 'duplicate' ? 'duplicate' : 'error');
    } catch {
      setState('error');
    }
  };

  const message =
    state === 'done' ? ui.briefDone : state === 'duplicate' ? ui.briefDuplicate : state === 'error' ? ui.briefError : '';

  return (
    <section
      aria-labelledby="brief-heading"
      className={`relative overflow-hidden border-y border-gold/20 ${compact ? 'py-10' : 'py-14 sm:py-16'}`}
      style={{ background: 'radial-gradient(60% 120% at 50% 0%, rgba(184,151,90,0.09), transparent 70%)' }}
    >
      <div className="mx-auto flex max-w-[760px] flex-col items-center px-4 text-center">
        <img src="/brand/logo-240.webp" alt="" aria-hidden className="w-14 opacity-80" />
        <h2 id="brief-heading" className="mt-4 font-display text-4xl font-semibold text-parchment">
          {ui.briefTitle}
        </h2>
        <p className="mt-2 max-w-[44ch] text-parchment/70">{ui.briefLede}</p>
        {state === 'done' ? (
          <p className="mt-6 text-gold-bright" role="status">
            {message}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 flex w-full max-w-[460px] flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state !== 'busy') setState('idle');
              }}
              placeholder={ui.briefPlaceholder}
              aria-label={ui.briefPlaceholder}
              autoComplete="email"
              className="min-w-0 flex-1 rounded-full border border-gold/30 bg-white/[0.03] px-5 py-3 text-parchment placeholder:text-parchment/35 focus:border-gold-bright focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === 'busy'}
              className="flex items-center justify-center gap-2 rounded-full bg-gold-bright px-6 py-3 font-medium text-night transition hover:bg-[#e8d4a4] disabled:opacity-60"
            >
              {state === 'busy' && <Loader2 className="h-4 w-4 animate-spin" />}
              {ui.briefButton}
            </button>
          </form>
        )}
        {message && state !== 'done' && (
          <p className="mt-3 text-sm text-[#f0a39c]" role="status">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}

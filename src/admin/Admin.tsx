import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, LogOut, Plus, Trash2, X } from 'lucide-react';
import { CATEGORIES, categoryOf, type Article } from '../app/data';

/* ------------------------------------------------------------------ */
/* Types & helpers                                                     */
/* ------------------------------------------------------------------ */

interface PendingPhoto {
  /** Local preview until published */
  preview: string;
  /** Set once uploaded */
  upload?: { path: string; url: string; sha: string };
  file: Blob;
  name: string;
}

const today = () => new Date().toISOString().slice(0, 10);

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

function uniqueId(base: string, taken: Set<string>) {
  let id = base || `story-${today()}`;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

async function api<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

/** Shrink a photo in the browser: max 1800px wide, JPEG. Keeps uploads fast and the site light. */
async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not read that photo.'))), 'image/jpeg', 0.84),
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

export default function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem('melmiit-admin') || '');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    document.title = 'Admin — Dayan Melmiit';
    // Re-check a password saved earlier in this browser tab
    if (password) {
      api('/api/login', { password })
        .then(() => setAuthed(true))
        .catch(() => {
          sessionStorage.removeItem('melmiit-admin');
          setPassword('');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed)
    return (
      <Login
        onSuccess={(pw) => {
          sessionStorage.setItem('melmiit-admin', pw);
          setPassword(pw);
          setAuthed(true);
        }}
      />
    );
  return (
    <Manager
      password={password}
      onLogout={() => {
        sessionStorage.removeItem('melmiit-admin');
        setPassword('');
        setAuthed(false);
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

function Login({ onSuccess }: { onSuccess: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/login', { password: pw });
      onSuccess(pw);
    } catch (err) {
      setError((err as Error).message);
      setPw('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(70%_50%_at_50%_45%,rgba(184,151,90,0.12),#070605_70%)] px-4">
      <form onSubmit={submit} className="w-full max-w-sm text-center">
        <img src="/brand/logo-700.webp" alt="Dayan Melmiit" className="mx-auto w-56" />
        <h1 className="mt-6 font-display text-3xl font-semibold">Newsroom</h1>
        <p className="mt-1 text-sm text-mist">Sign in to write and publish stories.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          aria-label="Password"
          autoFocus
          className="mt-8 w-full rounded-lg border border-gold/30 bg-white/5 px-4 py-3 text-parchment placeholder:text-parchment/40 focus:border-gold-bright focus:outline-none"
        />
        {error && <p className="mt-3 text-sm text-[#f0a39c]">{error}</p>}
        <button
          type="submit"
          disabled={busy || !pw}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gold-bright px-4 py-3 font-medium text-night transition hover:bg-[#f5e0a8] disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
        <a href="/" className="mt-6 inline-block text-sm text-mist hover:text-parchment">
          Back to the site
        </a>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Manager: list + editor + publish                                    */
/* ------------------------------------------------------------------ */

type Status =
  | { kind: 'idle' }
  | { kind: 'busy'; text: string }
  | { kind: 'ok'; text: string }
  | { kind: 'error'; text: string };

function Manager({ password, onLogout }: { password: string; onLogout: () => void }) {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [saved, setSaved] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<string, PendingPhoto>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const load = async () => {
    try {
      const data = await api<{ articles: Article[] }>('/api/articles', { password });
      setArticles(data.articles);
      setSaved(JSON.stringify(data.articles));
    } catch {
      // Fall back to the published copy if GitHub can't be reached
      const res = await fetch('/articles.json', { cache: 'no-store' });
      const list = (await res.json()) as Article[];
      setArticles(list);
      setSaved(JSON.stringify(list));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = articles !== null && (JSON.stringify(articles) !== saved || Object.keys(photos).length > 0);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (id: string, patch: Partial<Article>) =>
    setArticles((list) => list!.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const addNew = () => {
    const taken = new Set(articles!.map((a) => a.id));
    const id = uniqueId(`new-${today()}`, taken);
    const a: Article = { id, category: 'DIPLOMACY', categoryMn: 'ДИПЛОМАТ', title: '', date: today() };
    setArticles([a, ...articles!]);
    setEditing(id);
  };

  const remove = (id: string) => {
    const a = articles!.find((x) => x.id === id);
    if (!confirm(`Delete “${a?.title || a?.titleMn || 'this story'}”? It disappears from the site when you publish.`)) return;
    setArticles(articles!.filter((x) => x.id !== id));
    setPhotos(({ [id]: _, ...rest }) => rest);
    setEditing(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    const list = [...articles!];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setArticles(list);
  };

  const publish = async () => {
    if (!articles) return;
    const untitled = articles.find((a) => !a.title?.trim() && !a.titleMn?.trim());
    if (untitled) {
      setEditing(untitled.id);
      setStatus({ kind: 'error', text: 'Give every story a title before publishing.' });
      return;
    }
    try {
      // 1. Upload photos waiting to go up
      let list = articles;
      const files: { path: string; sha: string }[] = [];
      const entries = Object.entries(photos);
      for (let n = 0; n < entries.length; n++) {
        const [id, p] = entries[n];
        if (!list.some((a) => a.id === id)) continue;
        setStatus({ kind: 'busy', text: `Uploading photo ${n + 1} of ${entries.length}…` });
        const up =
          p.upload ||
          (await api<{ path: string; url: string; sha: string }>('/api/upload-image', {
            password,
            name: p.name,
            type: 'image/jpeg',
            data: await blobToBase64(p.file),
          }));
        p.upload = up;
        files.push({ path: up.path, sha: up.sha });
        list = list.map((a) => (a.id === id ? { ...a, image: up.url } : a));
      }

      // 2. Give new stories a readable web address based on the English title
      const taken = new Set(list.filter((a) => !a.id.startsWith('new-')).map((a) => a.id));
      list = list.map((a) => {
        if (!a.id.startsWith('new-')) return a;
        const id = uniqueId(slugify(a.title || '') || a.id.replace(/^new-/, 'story-'), taken);
        taken.add(id);
        return { ...a, id };
      });

      // 3. One commit with everything
      setStatus({ kind: 'busy', text: 'Publishing…' });
      await api('/api/save-articles', { password, articles: list, files });
      setArticles(list);
      setSaved(JSON.stringify(list));
      Object.values(photos).forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos({});
      setEditing(null);
      setStatus({ kind: 'ok', text: 'Published. The site updates in about a minute.' });
    } catch (err) {
      setStatus({ kind: 'error', text: (err as Error).message });
    }
  };

  const current = articles?.find((a) => a.id === editing);

  return (
    <div className="min-h-screen bg-night pb-28">
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-night/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-3 px-4">
          <img src="/brand/logo-240.webp" alt="" className="h-9" />
          <span className="font-display text-xl font-semibold">Newsroom</span>
          <a href="/" target="_blank" rel="noreferrer" className="ml-4 hidden text-sm text-mist hover:text-parchment sm:inline">
            View site
          </a>
          <button onClick={onLogout} className="ml-auto flex items-center gap-2 text-sm text-mist hover:text-parchment">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 pt-8">
        {!articles ? (
          <div className="grid place-items-center py-24 text-mist">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : current ? (
          <Editor
            article={current}
            photo={photos[current.id]}
            onChange={(patch) => update(current.id, patch)}
            onPhoto={(p) =>
              setPhotos((all) => {
                if (all[current.id]) URL.revokeObjectURL(all[current.id].preview);
                const next = { ...all };
                if (p) next[current.id] = p;
                else delete next[current.id];
                return next;
              })
            }
            onDone={() => setEditing(null)}
            onDelete={() => remove(current.id)}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-semibold">Stories</h1>
                <p className="mt-1 text-sm text-mist">
                  The top story is the big one on the front page. Use the arrows to change the order.
                </p>
              </div>
              <button
                onClick={addNew}
                className="flex items-center gap-2 rounded-lg bg-gold-bright px-4 py-2.5 font-medium text-night hover:bg-[#f5e0a8]"
              >
                <Plus className="h-4 w-4" /> New story
              </button>
            </div>

            {articles.length === 0 && (
              <p className="mt-16 text-center text-mist">No stories yet. Press “New story” to write the first one.</p>
            )}

            <ol className="mt-8 space-y-3">
              {articles.map((a, i) => {
                const img = photos[a.id]?.preview || a.image;
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 transition hover:border-gold/30"
                  >
                    <button onClick={() => setEditing(a.id)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-dusk">
                        {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gold">
                          {i === 0 && <span className="mr-2 rounded bg-gold/20 px-1.5 py-0.5 text-gold-bright">Front page</span>}
                          {categoryOf(a)?.en || a.category} · {a.date}
                        </p>
                        <p className="mt-1 truncate font-display text-xl font-semibold">
                          {a.title || a.titleMn || <span className="italic text-mist">Untitled story</span>}
                        </p>
                        {!a.titleMn && a.title && <p className="text-xs text-mist">Mongolian version missing</p>}
                      </div>
                    </button>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="rounded p-1.5 text-mist hover:bg-white/5 hover:text-parchment disabled:opacity-20"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === articles.length - 1}
                        aria-label="Move down"
                        className="rounded p-1.5 text-mist hover:bg-white/5 hover:text-parchment disabled:opacity-20"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>

      {/* Publish bar */}
      {articles && (dirty || status.kind !== 'idle') && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-dusk/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-3 px-4 py-3">
            <p
              className={`flex-1 text-sm ${
                status.kind === 'error' ? 'text-[#f0a39c]' : status.kind === 'ok' ? 'text-[#9fd8b8]' : 'text-parchment/80'
              }`}
              role="status"
            >
              {status.kind === 'idle' ? 'You have changes that are not on the site yet.' : status.text}
            </p>
            {dirty && (
              <button
                onClick={publish}
                disabled={status.kind === 'busy'}
                className="flex items-center gap-2 rounded-lg bg-gold-bright px-5 py-2.5 font-medium text-night hover:bg-[#f5e0a8] disabled:opacity-60"
              >
                {status.kind === 'busy' && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-parchment/90">{label}</span>
      {hint && <span className="ml-2 text-xs text-mist">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-parchment placeholder:text-parchment/30 focus:border-gold-bright focus:outline-none';

function Editor({
  article: a,
  photo,
  onChange,
  onPhoto,
  onDone,
  onDelete,
}: {
  article: Article;
  photo?: PendingPhoto;
  onChange: (p: Partial<Article>) => void;
  onPhoto: (p: PendingPhoto | null) => void;
  onDone: () => void;
  onDelete: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const preview = photo?.preview || a.image;

  const words = useMemo(
    () => ({
      en: (a.content || '').trim().split(/\s+/).filter(Boolean).length,
      mn: (a.contentMn || '').trim().split(/\s+/).filter(Boolean).length,
    }),
    [a.content, a.contentMn],
  );

  const takeFile = async (file?: File) => {
    setPhotoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('That file is not a photo. Use a JPG, PNG or WebP image.');
      return;
    }
    try {
      const blob = await compressPhoto(file);
      onPhoto({ preview: URL.createObjectURL(blob), file: blob, name: file.name });
    } catch (err) {
      setPhotoError((err as Error).message);
    }
  };

  const setCategory = (key: string) => {
    const c = CATEGORIES.find((x) => x.key === key)!;
    onChange({ category: c.key, categoryMn: c.mn.toUpperCase() });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <button onClick={onDone} className="flex items-center gap-2 text-sm text-mist hover:text-parchment">
          <X className="h-4 w-4" /> Back to all stories
        </button>
        <button onClick={onDelete} className="flex items-center gap-2 text-sm text-[#f0a39c] hover:text-[#ffc2bc]">
          <Trash2 className="h-4 w-4" /> Delete story
        </button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <Field label="Section">
          <select value={categoryOf(a)?.key || 'DIPLOMACY'} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key} className="bg-dusk">
                {c.en} / {c.mn}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={/^\d{4}-\d{2}-\d{2}$/.test(a.date || '') ? a.date : ''}
            onChange={(e) => onChange({ date: e.target.value, dateMn: '' })}
            className={`${inputCls} [color-scheme:dark]`}
          />
        </Field>
        <Field label="Writer" hint="optional">
          <input
            value={a.author || ''}
            onChange={(e) => onChange({ author: e.target.value })}
            placeholder="Dayan Melmiit"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Photo */}
      <div className="mt-6">
        <span className="text-sm font-medium text-parchment/90">Photo</span>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            takeFile(e.dataTransfer.files[0]);
          }}
          className={`mt-1.5 grid gap-4 rounded-xl border border-dashed p-4 sm:grid-cols-[240px_1fr] ${
            dragging ? 'border-gold-bright bg-gold/10' : 'border-white/15'
          }`}
        >
          <div className="aspect-[3/2] overflow-hidden rounded-lg bg-dusk">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-mist">
                <ImagePlus className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="rounded-lg border border-gold/40 px-4 py-2 text-sm hover:border-gold-bright hover:text-gold-bright"
              >
                {preview ? 'Replace photo' : 'Choose photo'}
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={() => {
                    onPhoto(null);
                    onChange({ image: '' });
                  }}
                  className="rounded-lg px-4 py-2 text-sm text-mist hover:text-parchment"
                >
                  Remove photo
                </button>
              )}
            </div>
            <p className="text-xs text-mist">Or drag a photo here. It is resized automatically. Landscape photos look best.</p>
            {photo && <p className="text-xs text-gold">New photo: uploads when you publish.</p>}
            {photoError && <p className="text-xs text-[#f0a39c]">{photoError}</p>}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                takeFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            {!photo && (
              <input
                value={a.image || ''}
                onChange={(e) => onChange({ image: e.target.value })}
                placeholder="…or paste a photo link (https://…)"
                className={`${inputCls} text-sm`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Text, side by side */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {(['en', 'mn'] as const).map((lang) => {
          const sfx = lang === 'mn' ? 'Mn' : '';
          const k = (f: string) => `${f}${sfx}` as keyof Article;
          return (
            <section key={lang} className="space-y-4 rounded-xl border border-white/[0.07] p-4">
              <h2 className="font-display text-2xl font-semibold">{lang === 'en' ? 'English' : 'Монгол'}</h2>
              <Field label={lang === 'en' ? 'Headline' : 'Гарчиг'}>
                <input
                  value={(a[k('title')] as string) || ''}
                  onChange={(e) => onChange({ [k('title')]: e.target.value })}
                  className={`${inputCls} font-display text-xl`}
                />
              </Field>
              <Field label={lang === 'en' ? 'Summary' : 'Товч агуулга'} hint={lang === 'en' ? 'one or two sentences' : '1–2 өгүүлбэр'}>
                <textarea
                  rows={3}
                  value={(a[k('excerpt')] as string) || ''}
                  onChange={(e) => onChange({ [k('excerpt')]: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field
                label={lang === 'en' ? 'Story' : 'Нийтлэл'}
                hint={`${words[lang]} ${lang === 'en' ? 'words · leave a blank line between paragraphs' : 'үг · догол мөрийн хооронд хоосон мөр үлдээнэ'}`}
              >
                <textarea
                  rows={16}
                  value={(a[k('content')] as string) || ''}
                  onChange={(e) => onChange({ [k('content')]: e.target.value })}
                  className={`${inputCls} leading-relaxed`}
                />
              </Field>
            </section>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-mist">
        Missing a Mongolian version? The site shows the English text instead until you add it.
      </p>
    </div>
  );
}

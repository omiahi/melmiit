import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, LogOut, Plus, Trash2, X } from 'lucide-react';
import { CATEGORIES, KINDS, PARTNERS, categoryOf, type Article, type Author, type StoryKind } from '../app/data';

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
async function compressPhoto(file: File, square = false): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  if (square) {
    // portraits: centre-crop to a square, 600px
    const side = Math.min(bitmap.width, bitmap.height);
    canvas.width = canvas.height = Math.min(600, side);
    canvas
      .getContext('2d')!
      .drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  } else {
    const scale = Math.min(1, 1800 / bitmap.width);
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
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
  const [authors, setAuthors] = useState<Author[]>([]);
  const [saved, setSaved] = useState('');
  const [tab, setTab] = useState<'stories' | 'writers'>('stories');
  const [editing, setEditing] = useState<string | null>(null);
  const [editingWriter, setEditingWriter] = useState<string | null>(null);
  // pending photos: story id, or "w:<writer id>"
  const [photos, setPhotos] = useState<Record<string, PendingPhoto>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const snapshot = (a: Article[], w: Author[]) => JSON.stringify([a, w]);

  const load = async () => {
    try {
      const data = await api<{ articles: Article[]; authors?: Author[] }>('/api/articles', { password });
      const w = data.authors || [];
      setArticles(data.articles);
      setAuthors(w);
      setSaved(snapshot(data.articles, w));
    } catch {
      // Fall back to the published copies if GitHub can't be reached
      const list = (await (await fetch('/articles.json', { cache: 'no-store' })).json()) as Article[];
      const w = await fetch('/authors.json', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []);
      setArticles(list);
      setAuthors(w);
      setSaved(snapshot(list, w));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty =
    articles !== null && (snapshot(articles, authors) !== saved || Object.keys(photos).length > 0);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setPhoto = (key: string, p: PendingPhoto | null) =>
    setPhotos((all) => {
      if (all[key]) URL.revokeObjectURL(all[key].preview);
      const next = { ...all };
      if (p) next[key] = p;
      else delete next[key];
      return next;
    });

  /* stories */
  const update = (id: string, patch: Partial<Article>) =>
    setArticles((list) => list!.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const addNew = () => {
    const taken = new Set(articles!.map((a) => a.id));
    const id = uniqueId(`new-${today()}`, taken);
    const a: Article = { id, category: 'DIPLOMACY', categoryMn: 'ДИПЛОМАТ', kind: 'news', title: '', date: today() };
    setArticles([a, ...articles!]);
    setEditing(id);
  };

  const remove = (id: string) => {
    const a = articles!.find((x) => x.id === id);
    if (!confirm(`Delete “${a?.title || a?.titleMn || 'this story'}”? It disappears from the site when you publish.`)) return;
    setArticles(articles!.filter((x) => x.id !== id));
    setPhoto(id, null);
    setEditing(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    const list = [...articles!];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setArticles(list);
  };

  /* writers */
  const updateWriter = (id: string, patch: Partial<Author>) =>
    setAuthors((list) => list.map((w) => (w.id === id ? { ...w, ...patch } : w)));

  const addWriter = () => {
    const id = uniqueId(`new-writer-${Date.now().toString(36)}`, new Set(authors.map((w) => w.id)));
    setAuthors([...authors, { id, name: '' }]);
    setEditingWriter(id);
  };

  const removeWriter = (id: string) => {
    const w = authors.find((x) => x.id === id);
    const used = articles!.filter((a) => a.authorId === id).length;
    const note = used ? ` Their ${used} ${used === 1 ? 'story keeps' : 'stories keep'} running under the Dayan Melmiit name.` : '';
    if (!confirm(`Remove ${w?.name || 'this writer'}?${note}`)) return;
    setAuthors(authors.filter((x) => x.id !== id));
    setArticles(articles!.map((a) => (a.authorId === id ? { ...a, authorId: undefined } : a)));
    setPhoto(`w:${id}`, null);
    setEditingWriter(null);
  };

  const publish = async () => {
    if (!articles) return;
    const untitled = articles.find((a) => !a.title?.trim() && !a.titleMn?.trim());
    if (untitled) {
      setTab('stories');
      setEditing(untitled.id);
      setStatus({ kind: 'error', text: 'Give every story a title before publishing.' });
      return;
    }
    const unnamed = authors.find((w) => !w.name?.trim());
    if (unnamed) {
      setTab('writers');
      setEditingWriter(unnamed.id);
      setStatus({ kind: 'error', text: 'Give every writer a name before publishing.' });
      return;
    }
    try {
      // 1. Upload photos waiting to go up
      let list = articles;
      let writers = authors;
      const files: { path: string; sha: string }[] = [];
      const entries = Object.entries(photos);
      for (let n = 0; n < entries.length; n++) {
        const [key, p] = entries[n];
        const isWriter = key.startsWith('w:');
        const id = isWriter ? key.slice(2) : key;
        if (isWriter ? !writers.some((w) => w.id === id) : !list.some((a) => a.id === id)) continue;
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
        if (isWriter) writers = writers.map((w) => (w.id === id ? { ...w, photo: up.url } : w));
        else list = list.map((a) => (a.id === id ? { ...a, image: up.url } : a));
      }

      // 2. Readable web addresses for new stories and writers
      const taken = new Set(list.filter((a) => !a.id.startsWith('new-')).map((a) => a.id));
      list = list.map((a) => {
        if (!a.id.startsWith('new-')) return a;
        const id = uniqueId(slugify(a.title || '') || a.id.replace(/^new-/, 'story-'), taken);
        taken.add(id);
        return { ...a, id };
      });
      const wTaken = new Set(writers.filter((w) => !w.id.startsWith('new-writer-')).map((w) => w.id));
      const renamed: Record<string, string> = {};
      writers = writers.map((w) => {
        if (!w.id.startsWith('new-writer-')) return w;
        const id = uniqueId(slugify(w.name) || 'writer', wTaken);
        wTaken.add(id);
        renamed[w.id] = id;
        return { ...w, id };
      });
      list = list.map((a) => (a.authorId && renamed[a.authorId] ? { ...a, authorId: renamed[a.authorId] } : a));

      // 3. One commit with everything
      setStatus({ kind: 'busy', text: 'Publishing…' });
      await api('/api/save-articles', { password, articles: list, authors: writers, files });
      setArticles(list);
      setAuthors(writers);
      setSaved(snapshot(list, writers));
      Object.values(photos).forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos({});
      setEditing(null);
      setEditingWriter(null);
      setStatus({ kind: 'ok', text: 'Published. The site updates in about a minute.' });
    } catch (err) {
      setStatus({ kind: 'error', text: (err as Error).message });
    }
  };

  const current = articles?.find((a) => a.id === editing);
  const currentWriter = authors.find((w) => w.id === editingWriter);

  const tabBtn = (key: 'stories' | 'writers', label: string, count: number) => (
    <button
      onClick={() => {
        setTab(key);
        setEditing(null);
        setEditingWriter(null);
      }}
      aria-pressed={tab === key}
      className={`border-b-2 px-1 pb-2 text-sm transition-colors ${
        tab === key ? 'border-gold-bright text-parchment' : 'border-transparent text-mist hover:text-parchment'
      }`}
    >
      {label} <span className="text-mist">{count}</span>
    </button>
  );

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
            authors={authors}
            photo={photos[current.id]}
            onChange={(patch) => update(current.id, patch)}
            onPhoto={(p) => setPhoto(current.id, p)}
            onDone={() => setEditing(null)}
            onDelete={() => remove(current.id)}
          />
        ) : currentWriter ? (
          <WriterEditor
            writer={currentWriter}
            photo={photos[`w:${currentWriter.id}`]}
            onChange={(patch) => updateWriter(currentWriter.id, patch)}
            onPhoto={(p) => setPhoto(`w:${currentWriter.id}`, p)}
            onDone={() => setEditingWriter(null)}
            onDelete={() => removeWriter(currentWriter.id)}
          />
        ) : (
          <>
            <nav className="mb-8 flex gap-6 border-b border-white/[0.07]">
              {tabBtn('stories', 'Stories', articles.length)}
              {tabBtn('writers', 'Writers', authors.length)}
            </nav>

            {tab === 'stories' ? (
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
                    const kind = KINDS.find((k) => k.key === (a.kind || 'news'))?.en;
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
                              {kind} · {categoryOf(a)?.en || a.category} · {a.date}
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
            ) : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1 className="font-display text-4xl font-semibold">Writers</h1>
                    <p className="mt-1 text-sm text-mist">Each writer gets a page on the site listing their stories.</p>
                  </div>
                  <button
                    onClick={addWriter}
                    className="flex items-center gap-2 rounded-lg bg-gold-bright px-4 py-2.5 font-medium text-night hover:bg-[#f5e0a8]"
                  >
                    <Plus className="h-4 w-4" /> New writer
                  </button>
                </div>
                {authors.length === 0 && (
                  <p className="mt-16 text-center text-mist">
                    No writers yet. Press “New writer” to add one, then choose them on a story.
                  </p>
                )}
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {authors.map((w) => {
                    const img = photos[`w:${w.id}`]?.preview || w.photo;
                    const count = articles.filter((a) => a.authorId === w.id).length;
                    return (
                      <li key={w.id}>
                        <button
                          onClick={() => setEditingWriter(w.id)}
                          className="flex w-full items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-left transition hover:border-gold/30"
                        >
                          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-dusk font-display text-xl text-gold-bright">
                            {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : (w.name || '?').charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-display text-xl font-semibold">
                              {w.name || <span className="italic text-mist">Unnamed writer</span>}
                            </p>
                            <p className="truncate text-sm text-mist">
                              {w.role || 'No title yet'} · {count} {count === 1 ? 'story' : 'stories'}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
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
  authors,
  photo,
  onChange,
  onPhoto,
  onDone,
  onDelete,
}: {
  article: Article;
  authors: Author[];
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

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Type">
          <select
            value={a.kind || 'news'}
            onChange={(e) => onChange({ kind: e.target.value as StoryKind })}
            className={inputCls}
          >
            {KINDS.map((k) => (
              <option key={k.key} value={k.key} className="bg-dusk">
                {k.en} / {k.mn}
              </option>
            ))}
          </select>
        </Field>
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
        <Field label="Writer">
          <select
            value={a.authorId || (a.author ? '__guest' : '')}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__guest') onChange({ authorId: undefined, author: a.author || ' ' });
              else onChange({ authorId: v || undefined, author: undefined, authorMn: undefined });
            }}
            className={inputCls}
          >
            <option value="" className="bg-dusk">
              Dayan Melmiit (no name)
            </option>
            {authors.map((w) => (
              <option key={w.id} value={w.id} className="bg-dusk">
                {w.name || 'Unnamed writer'}
              </option>
            ))}
            <option value="__guest" className="bg-dusk">
              Guest writer…
            </option>
          </select>
        </Field>
      </div>

      {!a.authorId && a.author !== undefined && (
        <div className="mt-4 max-w-md">
          <Field label="Guest writer's name">
            <input
              value={a.author.trim() ? a.author : ''}
              onChange={(e) => onChange({ author: e.target.value || ' ' })}
              className={inputCls}
              autoFocus
            />
          </Field>
        </div>
      )}

      <div className="mt-6">
        <span className="text-sm font-medium text-parchment/90">Countries</span>
        <span className="ml-2 text-xs text-mist">the story appears on the map under each one you pick</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PARTNERS.map((p) => {
            const on = a.countries?.includes(p.code);
            return (
              <button
                key={p.code}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  const set = new Set(a.countries || []);
                  if (on) set.delete(p.code);
                  else set.add(p.code);
                  onChange({ countries: [...set] });
                }}
                className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
                  on ? 'border-gold-bright bg-gold-bright text-night' : 'border-white/15 text-parchment/75 hover:border-gold/50'
                }`}
              >
                {p.en}
              </button>
            );
          })}
        </div>
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

/* ------------------------------------------------------------------ */
/* Writer editor                                                       */
/* ------------------------------------------------------------------ */

function WriterEditor({
  writer: w,
  photo,
  onChange,
  onPhoto,
  onDone,
  onDelete,
}: {
  writer: Author;
  photo?: PendingPhoto;
  onChange: (p: Partial<Author>) => void;
  onPhoto: (p: PendingPhoto | null) => void;
  onDone: () => void;
  onDelete: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const preview = photo?.preview || w.photo;

  const takeFile = async (file?: File) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That file is not a photo. Use a JPG, PNG or WebP image.');
      return;
    }
    try {
      const blob = await compressPhoto(file, true);
      onPhoto({ preview: URL.createObjectURL(blob), file: blob, name: `writer-${w.name || 'photo'}` });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onDone} className="flex items-center gap-2 text-sm text-mist hover:text-parchment">
          <X className="h-4 w-4" /> Back to all writers
        </button>
        <button onClick={onDelete} className="flex items-center gap-2 text-sm text-[#f0a39c] hover:text-[#ffc2bc]">
          <Trash2 className="h-4 w-4" /> Remove writer
        </button>
      </div>

      <div className="mt-6 flex items-center gap-5">
        <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border border-gold/30 bg-dusk font-display text-4xl text-gold-bright">
          {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : (w.name || '?').charAt(0)}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="rounded-lg border border-gold/40 px-4 py-2 text-sm hover:border-gold-bright hover:text-gold-bright"
            >
              {preview ? 'Replace photo' : 'Add photo'}
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  onPhoto(null);
                  onChange({ photo: undefined });
                }}
                className="rounded-lg px-4 py-2 text-sm text-mist hover:text-parchment"
              >
                Remove photo
              </button>
            )}
          </div>
          <p className="text-xs text-mist">A head-and-shoulders portrait works best. It is cropped to a circle.</p>
          {photo && <p className="text-xs text-gold">New photo: uploads when you publish.</p>}
          {error && <p className="text-xs text-[#f0a39c]">{error}</p>}
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
        </div>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {(['en', 'mn'] as const).map((lang) => {
          const sfx = lang === 'mn' ? 'Mn' : '';
          const k = (f: string) => `${f}${sfx}` as keyof Author;
          return (
            <section key={lang} className="space-y-4 rounded-xl border border-white/[0.07] p-4">
              <h2 className="font-display text-2xl font-semibold">{lang === 'en' ? 'English' : 'Монгол'}</h2>
              <Field label={lang === 'en' ? 'Name' : 'Нэр'}>
                <input
                  value={(w[k('name')] as string) || ''}
                  onChange={(e) => onChange({ [k('name')]: e.target.value })}
                  className={`${inputCls} font-display text-xl`}
                />
              </Field>
              <Field label={lang === 'en' ? 'Title' : 'Албан тушаал'} hint={lang === 'en' ? 'e.g. Senior analyst, East Asia' : ''}>
                <input
                  value={(w[k('role')] as string) || ''}
                  onChange={(e) => onChange({ [k('role')]: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label={lang === 'en' ? 'Short bio' : 'Товч намтар'} hint={lang === 'en' ? 'two or three sentences' : ''}>
                <textarea
                  rows={5}
                  value={(w[k('bio')] as string) || ''}
                  onChange={(e) => onChange({ [k('bio')]: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </section>
          );
        })}
      </div>
    </div>
  );
}

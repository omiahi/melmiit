# Dayan Melmiit

Bilingual (English / Mongolian) international-relations site for melmiit.com. React + Vite, hosted on Vercel.

- **Writing and publishing stories:** see [PUBLISHING.md](./PUBLISHING.md). Editors use melmiit.com/admin; no code needed.
- **Stories live in** `public/articles.json`. Photos uploaded from the admin go to `public/uploads/`.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build in dist/
```

The admin panel's API (`api/`) runs on Vercel. To try it locally, use `vercel dev` with the variables from `.env.example`.

## Where things are

| Path | What it is |
| --- | --- |
| `src/app/components/Hero.tsx` | Front-page opening: the emblem above the steppe |
| `src/app/components/Herd.tsx` | The horsemen crossing the horizon (pace follows the pointer and scrolling) |
| `src/app/components/gallop.ts` | Draws a galloping horseman from Muybridge's 1878 photographs (public domain), using `public/brand/horse-gallop.webp` |
| `src/app/pages.tsx` | Front page, section pages, story page, 404 |
| `src/app/data.ts` | Story type, sections (Diplomacy, Geopolitics, Security, Economy & trade, Mongolia & the world, Culture), and all interface text in both languages |
| `src/admin/Admin.tsx` | The newsroom editor at /admin |
| `api/` | Sign-in, photo upload, and publish (commits to GitHub) |
| `public/brand/` | Logo files, favicon and share image |

# How to publish a story on melmiit.com

## Every time you publish

1. Go to **melmiit.com/admin** and sign in with the admin password.
2. Press **New story**.
3. Pick the **type** (News, Analysis, Interview, Brief, Opinion), the **section** (Diplomacy, Geopolitics, Security, Economy & trade, Mongolia & the world, Culture) and the **writer**. The date fills in with today.
   Under **Countries**, tick each country the story is about. It then appears on the "Mongolia and the world" map under those countries.
4. Add a **photo**: press *Choose photo* or drag one into the box. It is resized for you. Landscape photos look best.
5. Fill in the **English** side: headline, a one- or two-sentence summary, and the story. Leave a blank line between paragraphs.
6. Fill in the **Монгол** side the same way. If you skip it, the Mongolian site shows the English text until you add it.
7. Press **Back to all stories**. The story at the top of the list is the big story on the front page; use the arrows to reorder.
8. Press **Publish** in the bar at the bottom. When it says *Published*, the site updates in about a minute.

To fix a typo or change a photo later, open the story from the list, make the change, and press **Publish** again. To remove a story, open it, press **Delete story**, then **Publish**.

## Writers

Open the **Writers** tab and press **New writer**. Add a portrait, their name, title (for example *Senior analyst, Northeast Asia*) and a two- or three-sentence bio, in English and Mongolian. Then choose them under **Writer** on their stories and press **Publish**. Each writer gets a page on the site listing their work. For a one-off contributor, choose **Guest writer…** on the story instead.

## The Brief (newsletter)

The signup box stays hidden until the newsletter is connected:

1. Create a free account at **buttondown.com** and name the newsletter *The Brief*.
2. In Buttondown, open **Settings → API** and copy the API key.
3. In Vercel → **Settings → Environment Variables**, add `BUTTONDOWN_API_KEY` with that key, then redeploy.

Subscribers are collected in Buttondown. You write and send each issue there.

## One-time setup (do this once)

The admin saves stories into the GitHub repository; Vercel then rebuilds the site. It needs three settings in Vercel.

### 1. Make a GitHub token

1. On GitHub, open **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name it `melmiit admin`. Set an expiration you are comfortable with (you will need a new one when it expires).
3. Under **Repository access**, choose **Only select repositories** → `omiahi/melmiit`.
4. Under **Permissions → Repository permissions**, set **Contents** to **Read and write**.
5. Press **Generate token** and copy it (it starts with `github_pat_`). You will not see it again.

### 2. Add the settings in Vercel

Vercel → your melmiit project → **Settings → Environment Variables**. Add these for **Production** (and Preview if you like):

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | A long password only your team knows |
| `GITHUB_TOKEN` | The token from step 1 |
| `GITHUB_REPO` | `omiahi/melmiit` |

If an old `VITE_ADMIN_PASSWORD` setting is there, **delete it**. The old admin put that password inside the public website code where anyone could read it, so choose a **new** `ADMIN_PASSWORD` rather than reusing the old one.

### 3. Redeploy

Vercel → **Deployments** → the latest one → **⋯ → Redeploy**. Settings only take effect after a redeploy.

## If something goes wrong

| Message in the admin | What to do |
| --- | --- |
| *That password is not correct.* | Check `ADMIN_PASSWORD` in Vercel, then redeploy. |
| *ADMIN_PASSWORD is not set…* | Add it in Vercel (step 2) and redeploy. |
| *GitHub: Bad credentials* or *Resource not accessible* | The token expired or lacks *Contents: Read and write*. Make a new one (step 1), update `GITHUB_TOKEN`, redeploy. |
| Published, but the site didn't change | Wait two minutes and refresh. Check Vercel → Deployments for a failed build. |

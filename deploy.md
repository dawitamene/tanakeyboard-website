# Deploying addiyonkeyboard-website to Cloudflare Pages

This guide covers deploying the static site to **Cloudflare Pages** and pointing the
**`addiyonkeyboard.addiyon.com`** subdomain at it.

Your `addiyon.com` domain is already managed in Cloudflare, which makes the subdomain
step trivial — no external DNS provider to touch.

> This site is 100% static (HTML/CSS/JS + images). There is **no build step**, so the
> Cloudflare Pages "build command" is left empty and the output is just this folder.

---

## Overview of what you'll do

1. Get the site into a GitHub repo (recommended) — or deploy the folder directly.
2. Create a Cloudflare Pages project.
3. Deploy — you'll get a free `*.pages.dev` URL.
4. Add `addiyonkeyboard.addiyon.com` as a custom domain (Cloudflare auto-creates the DNS record).
5. Verify HTTPS and the live site.

Pick **Option A (Git)** or **Option B (Direct upload)** for steps 1–3, then everyone
does steps 4–5.

---

## Prerequisites

- A Cloudflare account (the same one that manages `addiyon.com`).
- `addiyon.com` already active as a zone in that Cloudflare account (it is, since you
  bought it there).
- For Option A: a GitHub (or GitLab) account.
- For Option B: [Node.js](https://nodejs.org) installed (for the `wrangler` CLI).

---

## Option A — Deploy from Git (recommended)

Git deploys give you automatic redeploys on every push and a full history of versions.

### A1. Initialize the repo locally

From the project root (`/Users/dev/code/addiyonkeyboard-website`):

```bash
git init
git add .
git commit -m "Initial commit: addiyonkeyboard marketing site"
```

Add a `.gitignore` so macOS junk doesn't get committed:

```bash
printf '.DS_Store\n' > .gitignore
git rm --cached .DS_Store 2>/dev/null || true
git add .gitignore
git commit -m "Ignore .DS_Store"
```

### A2. Push to GitHub

Create an empty repo on GitHub named `addiyonkeyboard-website` (no README/license, so it
stays empty), then:

```bash
git branch -M main
git remote add origin git@github.com:<your-username>/addiyonkeyboard-website.git
git push -u origin main
```

(Use the `https://github.com/...` URL instead of the `git@` one if you don't have SSH
keys set up.)

### A3. Create the Pages project

1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com) → left sidebar
   **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
2. Authorize GitHub and select the `addiyonkeyboard-website` repo.
3. On the **Set up builds and deployments** screen, use these settings:

   | Field | Value |
   |-------|-------|
   | Production branch | `main` |
   | Framework preset | **None** |
   | Build command | *(leave empty)* |
   | Build output directory | `/` |
   | Root directory | *(leave empty / `/`)* |

   > Because the HTML files live at the repo root, the output directory is just `/`.
   > There is no build, so the build command stays blank.

4. Click **Save and Deploy**. Cloudflare uploads the files and, after ~30–60 seconds,
   gives you a live URL like `https://addiyonkeyboard-website.pages.dev`.

Every future `git push` to `main` now redeploys automatically. Pushes to other branches
create preview deployments with their own URLs.

---

## Option B — Direct upload with Wrangler (no Git)

Use this if you don't want a Git repo. You re-run one command whenever you want to
publish changes.

### B1. Install Wrangler and log in

```bash
npm install -g wrangler
wrangler login
```

`wrangler login` opens a browser to authorize the CLI against your Cloudflare account.

### B2. Create the project (first time only)

```bash
wrangler pages project create addiyonkeyboard-website --production-branch main
```

### B3. Deploy the folder

From the project root:

```bash
wrangler pages deploy . --project-name addiyonkeyboard-website
```

This uploads the current directory and returns your `https://addiyonkeyboard-website.pages.dev`
URL. Re-run this same command any time you want to push updates.

> Tip: add a `.assetsignore` or just accept that `.DS_Store` gets uploaded — harmless,
> but you can delete it first with `find . -name .DS_Store -delete`.

---

## Steps 4–5 apply to both options

### 4. Add the `addiyonkeyboard.addiyon.com` custom domain

Because `addiyon.com` is on the **same Cloudflare account**, Cloudflare creates the DNS
record for you automatically — you do **not** manually add a CNAME.

1. In the dashboard: **Workers & Pages** → open your **addiyonkeyboard-website** project.
2. Go to the **Custom domains** tab → **Set up a custom domain**.
3. Enter:

   ```
   addiyonkeyboard.addiyon.com
   ```

4. Click **Continue** → **Activate domain**.

Cloudflare will:
- Detect that `addiyon.com` is a zone you control.
- Automatically create a **CNAME** record: `addiyonkeyboard` → `addiyonkeyboard-website.pages.dev`,
  set to **Proxied** (orange cloud).
- Provision an SSL certificate for the subdomain.

Status moves from **Initializing** → **Active**, usually within a minute or two (can
take up to ~15 min for the cert on first setup).

#### If you'd rather add the DNS record manually

You normally don't need to, but if the auto-record didn't appear:

1. Cloudflare dashboard → select the **addiyon.com** zone → **DNS** → **Records** →
   **Add record**.
2. Set:

   | Field | Value |
   |-------|-------|
   | Type | `CNAME` |
   | Name | `addiyonkeyboard` |
   | Target | `addiyonkeyboard-website.pages.dev` |
   | Proxy status | **Proxied** (orange cloud) |
   | TTL | Auto |

3. Save. Then re-run the **Set up a custom domain** step above so Pages issues the cert.

> ⚠️ Don't point this subdomain at your Kubernetes cluster's ingress. The `addiyonkeyboard`
> record is independent of whatever `addiyon.com` / `www` / app records feed your k8s
> app, so this won't affect Addiyon at all.

### 5. Verify

- Visit **https://addiyonkeyboard.addiyon.com** — you should see the site over HTTPS with a
  valid padlock.
- Also test the sub-pages: `/features.html`, `/privacy.html`.
- Check `https://addiyonkeyboard-website.pages.dev` still works (it always will; it's the
  canonical Pages URL).

If the browser shows a cert warning right after setup, wait a few minutes for the
certificate to finish provisioning, then hard-refresh.

---

## Optional polish

### Clean URLs (drop the `.html`)

Cloudflare Pages automatically serves `/features` for `features.html`. Your internal
links can keep the `.html` — both work. If you want to force clean URLs, update the
`<a href>` values in your HTML to omit `.html`.

### Custom 404 page

Create a `404.html` in the project root. Cloudflare Pages serves it automatically for
unknown paths.

### Redirect the apex or www (not needed here)

Not required for a subdomain deploy. Only relevant if you later want
`www.addiyonkeyboard...` style hosts.

### Cache / headers

To add caching or security headers, create a `_headers` file in the project root, e.g.:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

Cloudflare Pages applies it on the next deploy.

---

## Updating the site later

- **Option A (Git):** edit files → `git commit` → `git push`. Auto-redeploys.
- **Option B (Wrangler):** edit files → `wrangler pages deploy . --project-name addiyonkeyboard-website`.

---

## Quick reference

| Thing | Value |
|-------|-------|
| Pages project name | `addiyonkeyboard-website` |
| Build command | *(none)* |
| Output directory | `/` |
| Free Pages URL | `https://addiyonkeyboard-website.pages.dev` |
| Custom domain | `addiyonkeyboard.addiyon.com` |
| DNS record | CNAME `addiyonkeyboard` → `addiyonkeyboard-website.pages.dev` (Proxied) |

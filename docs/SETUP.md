# Setup & deployment

Everything you need to go from a fresh clone to a running atlas, a production build, or a public
URL. The frontend is a **static site** — no server, no API keys, no environment variables required.

---

## 1. Prerequisites

| Tool | Version | Why |
|---|---|---|
| **Node.js** | 22 LTS or newer | Vite 8 and React 19 |
| **pnpm** | 10+ | The repo ships `pnpm-lock.yaml` |
| **Git LFS** | any recent version | Planet art, mission photos and fonts are stored in Git LFS |

> **Important — the 130-byte image problem**
> This repository tracks images and fonts with **Git LFS**. If you download it as a ZIP, or clone
> without LFS installed, every `.jpg`, `.png` and `.ttf` is replaced by a ~130-byte text pointer and
> the atlas looks empty. Fix it with:
>
> ```bash
> git lfs install
> git lfs pull
> ```

The repository also ships a `.mise.toml`; if you use [mise](https://mise.jdx.dev/) just run `mise install`.

---

## 2. Run the frontend

```bash
pnpm install:frontend   # installs frontend/ dependencies
pnpm dev                # Vite dev server
```

Open **<http://localhost:5173>**.

The root `package.json` is a thin shim that forwards `dev`, `build`, `preview` and `format` into
`frontend/`, so always run commands from the repository root.

### Ports

| Command | Default | Override |
|---|---|---|
| `pnpm dev` | `5173` | `PORT=5180 pnpm dev` (PowerShell: `$env:PORT=5180; pnpm dev`) |
| `pnpm preview` | `4173` | `PORT=5180 pnpm preview` |

The dev server binds `0.0.0.0`, so you can also open it from a phone on the same Wi-Fi.

---

## 3. Production build

```bash
pnpm build      # outputs to ../dist (the repository-root dist/)
pnpm preview    # serves that build locally on :4173
```

`dist/` is completely static. Upload it to Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 or
any nginx host.

### Hosting on a sub-path

If the site will live at `https://example.com/solaris/`, set the public base URL at build time:

```bash
FIGMA_PUBLIC_URL=/solaris pnpm build
```

### Deploy recipes

<details>
<summary><b>Netlify</b></summary>

- Build command: `pnpm build`
- Publish directory: `dist`
- Environment: `NODE_VERSION=22`
</details>

<details>
<summary><b>Vercel</b></summary>

- Framework preset: *Vite*
- Build command: `pnpm --dir frontend build`
- Output directory: `dist`
</details>

<details>
<summary><b>GitHub Pages</b></summary>

```bash
FIGMA_PUBLIC_URL=/<repository-name> pnpm build
# publish dist/ with actions/deploy-pages or the gh-pages branch
```

Remember that SPA routes (`/app`, `/mission/:id`) need a fallback to `index.html`
(add a `404.html` copy of `index.html` on Pages).
</details>

<details>
<summary><b>Docker (static)</b></summary>

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install:frontend && pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```
</details>

---

## 4. Deploy to Firebase Hosting (free Spark plan)

Solaris ships with `firebase.json` and `.github/workflows/firebase-deploy.yml`, so you can deploy
from your laptop in one command or let every push to `main` deploy automatically.

### One-time setup (5 minutes)

```bash
npm i -g firebase-tools
firebase login

# create a project at https://console.firebase.google.com (Spark / free plan, no card)
firebase use --add <your-project-id>     # writes .firebaserc, choose an alias like "default"
```

This repository is already linked to **`solaris-nasa`** (see [`.firebaserc`](../.firebaserc)), so
`pnpm deploy:firebase` works as-is. Live site: **<https://solaris-nasa.web.app>**.

`firebase.json` already points at the right place:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

The rewrite is what keeps `/app` and `/mission/:id` working after a refresh.

### Cache policy

Fresh deploys must show up immediately, so caching is split by file type:

| Files | Cache-Control | Why |
|---|---|---|
| `**/*.html` | `no-cache, no-store, must-revalidate` | The HTML entry point must always be re-checked, so new builds appear at once |
| `**/*.@(js\|css)` | `public, max-age=31536000, immutable` | Vite fingerprints these filenames (`index-B_yr6RAN.js`), so a change means a new URL |
| `**/*.@(woff\|woff2\|ttf\|otf)` | `public, max-age=31536000, immutable` | Fonts almost never change |
| `**/*.@(jpg\|jpeg\|png\|svg\|webp\|gif\|ico)` | `public, max-age=86400, stale-while-revalidate=604800` | Planet art and screenshots keep stable filenames, so they revalidate daily instead of sticking for a year |

Net effect: code changes reach visitors on the next page load, while images stay cheap (important on
the Spark plan's 360 MB/day). If you replace an image and still see the old one, hard-refresh once
(**Ctrl+Shift+R**) or open an incognito window.

### Deploy manually

```bash
pnpm build                    # writes the static site to repo-root dist/
pnpm deploy:firebase          # build + deploy in one step
```

Or the explicit form:

```bash
pnpm build
npx firebase-tools deploy --only hosting
```

Firebase prints the live URLs, typically:

- `https://<project-id>.web.app`
- `https://<project-id>.firebaseapp.com`

Preview a build before promoting it (optional): `npx firebase-tools hosting:channel:deploy preview`.

### Automatic deploys from GitHub

The workflow `.github/workflows/firebase-deploy.yml` builds and deploys on every push to `main`.
Add two settings to the repository:

| Kind | Name | Value |
|---|---|---|
| Variable | `FIREBASE_PROJECT_ID` | your Firebase project id |
| Secret | `FIREBASE_SERVICE_ACCOUNT` | JSON key for a service account with the *Firebase Hosting Admin* role |

Create the service account key:

```bash
# Option A — let the CLI do everything (adds workflow + secrets via the GitHub API)
npx firebase-tools init hosting:github

# Option B — manual
# 1. Google Cloud Console → IAM & Admin → Service Accounts → Create service account
# 2. Grant role: Firebase Hosting Admin
# 3. Keys → Add key → JSON → download
# 4. GitHub repo → Settings → Secrets and variables → Actions → New repository secret
#    Name: FIREBASE_SERVICE_ACCOUNT   Value: paste the whole JSON file
```

### Free-tier limits to know

| Limit | Spark plan |
|---|---|
| Storage | 10 GB |
| Transfer | **360 MB / day** |
| Custom domain | supported (domain must be one you own) |
| URL | `https://<project-id>.web.app` |

Solaris is roughly 3.6 MB, so that is on the order of ~100 first-time visits per day. Visitors who
already have the assets cached cost almost nothing, because the header rules cache images and fonts
for a year. If you expect heavier traffic, move to Blaze (pay-as-you-go) or Cloudflare Pages.

> The backend is **not** deployed — the site is 100 % static. Keep `backend/` for local data work.

---

## 5. Optional backend (NASA cache + voice agent)

The atlas works **without** the backend. The API exists for cached NASA syncs, server-side search
and the voice agent.

```bash
cd backend
pnpm install
cp .env.example .env      # optional keys; everything degrades gracefully
pnpm db:push              # create SQLite tables
pnpm seed                 # import the curated frontend data
pnpm dev                  # http://localhost:3001
```

Useful scripts:

| Script | Purpose |
|---|---|
| `pnpm sync` | Pull NASA media URLs into SQLite |
| `pnpm scrape` | Rebuild `frontend/src/data/generated/*.json` from NASA (optionally `--body=moon --limit=12`) |
| `pnpm export` | Dump generated data for the frontend |
| `pnpm format` | oxfmt |

Environment variables: see [`backend/.env.example`](../backend/.env.example). Only `DATABASE_URL`
matters for the data API; `GEMINI_API_KEY`, `DEEPGRAM_API_KEY` and `ELEVENLABS_API_KEY` enable the
voice agent.

---

## 6. Quality checks

```bash
pnpm build        # must pass before every commit
pnpm format       # oxfmt the frontend
```

CI runs the production build on every push and pull request (`.github/workflows/ci.yml`).

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Planets and photos are blank / tiny files | Git LFS pointers | `git lfs install && git lfs pull` |
| `Port 5173 is already in use` | Another dev server | `$env:PORT=5180; pnpm dev` |
| `pnpm: command not found` | pnpm missing | `corepack enable` or `npm i -g pnpm` |
| Blank page after deploy | Wrong base path | rebuild with `FIGMA_PUBLIC_URL=/<sub-path>` |
| 404 on `/mission/...` after refresh | Static host has no SPA fallback | add an `index.html` fallback rule (`firebase.json` already has it) |
| Old version still showing after deploy | Browser cached the page | hard-refresh once (**Ctrl+Shift+R**); HTML is `no-store`, images revalidate daily |
| Fonts look wrong | LFS fonts missing | `git lfs pull` |
| Build fails on Node 20 | Vite 8 needs Node 22 | switch to Node 22+ |

---

## 8. Repository conventions

- `main` is protected in spirit: every change goes through a pull request.
- Commit messages follow **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`).
- Run `pnpm build` before opening a PR.
- Never commit secrets. `.env*` is ignored; use `.env.example` for documentation.

More: [CONTRIBUTING.md](../CONTRIBUTING.md).

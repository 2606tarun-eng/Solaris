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

## 4. Optional backend (NASA cache + voice agent)

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

## 5. Quality checks

```bash
pnpm build        # must pass before every commit
pnpm format       # oxfmt the frontend
```

CI runs the production build on every push and pull request (`.github/workflows/ci.yml`).

---

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Planets and photos are blank / tiny files | Git LFS pointers | `git lfs install && git lfs pull` |
| `Port 5173 is already in use` | Another dev server | `$env:PORT=5180; pnpm dev` |
| `pnpm: command not found` | pnpm missing | `corepack enable` or `npm i -g pnpm` |
| Blank page after deploy | Wrong base path | rebuild with `FIGMA_PUBLIC_URL=/<sub-path>` |
| 404 on `/mission/...` after refresh | Static host has no SPA fallback | add an `index.html` fallback rule |
| Fonts look wrong | LFS fonts missing | `git lfs pull` |
| Build fails on Node 20 | Vite 8 needs Node 22 | switch to Node 22+ |

---

## 7. Repository conventions

- `main` is protected in spirit: every change goes through a pull request.
- Commit messages follow **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`).
- Run `pnpm build` before opening a PR.
- Never commit secrets. `.env*` is ignored; use `.env.example` for documentation.

More: [CONTRIBUTING.md](../CONTRIBUTING.md).

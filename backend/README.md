# Solaris Backend

Free-tier Node.js + Fastify + SQLite backend for the Solaris atlas. It caches
NASA data locally, serves it through a typed REST API, and powers the voice
agent (STT → LLM → TTS).

## Stack

- **Node.js 22 + TypeScript** (tsx for running)
- **Fastify** — HTTP server
- **SQLite** via `@libsql/client` + **Drizzle ORM**
- **NASA Image and Video Library** — free, no key
- **Gemini 2.5 Flash** — LLM (free tier)
- **Deepgram Nova-2** — STT (`$150` free credit)
- **ElevenLabs** — TTS (`10k` chars/month free)

Every external service is optional. Missing keys degrade gracefully so the app
always works.

## Quick start

```bash
cd backend
pnpm install
cp .env.example .env        # add keys when you have them
pnpm db:push                # create SQLite tables
pnpm seed                   # port frontend curated data into SQLite
pnpm sync                   # enrich with NASA media (optional, network)
pnpm scrape                 # rebuild the mission catalog (see below)
pnpm dev                    # http://localhost:3001
```

## Mission catalog scrape

`pnpm scrape` rebuilds the atlas dataset straight from NASA:

- **science.nasa.gov/wp-json/wp/v2/mission** — the official mission catalog
  (status, target body, type, launch date, hero image, article prose).
- **images-api.nasa.gov** — NASA Image and Video Library, for a *different*
  photo per story chapter.

It writes three files:

| File | Used by |
|------|---------|
| `frontend/src/data/generated/nasaMissions.json` | pages 2–3 (active/retired panels) + page 5 timeline |
| `frontend/src/data/generated/nasaChapters.json` | page 4 story chapters (lazy-loaded) |
| `backend/data/image-gaps.md` | checklist of chapters that fell back to archive art |

Responses are cached in `backend/.cache/nasa-missions`, so re-runs are cheap.
Scope it with `pnpm scrape --body=moon --limit=12`.

NSSDCA (`nssdc.gsfc.nasa.gov`) is read where its pages respond, but its
`robots.txt` blocks the bulk query endpoints and its Oracle backend returns
errors for many display pages, so it cannot back a full sync.


## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/planets` | All planets |
| GET | `/api/planets/:id` | Planet + missions + story + media |
| GET | `/api/missions` | Missions (`?planet=&status=`) |
| GET | `/api/projects` | Projects (`?planet=&status=`) |
| GET | `/api/timeline` | Timeline events (`?year=`) |
| GET | `/api/stories/:planetId` | Kid-friendly story |
| GET | `/api/media` | NASA media (`?planet=&kind=`) |
| GET | `/api/search?q=` | Search planets/missions/projects |
| POST | `/api/voice` | Voice agent (multipart `audio` or JSON `{ text }`) |

## Data flow

```
frontend/src/data/*.ts  ──seed──▶  SQLite
NASA Image API          ──sync──▶  SQLite (media URLs)
                                     │
                            Fastify API (reads SQLite)
                                     │
                         frontend/src/lib/nasa.ts
                  (calls API, falls back to bundled data)
```

The frontend remains the single source of truth for hand-checked mission data.
`pnpm seed` reads those files, rewrites their asset imports, and upserts them
into SQLite — no data is duplicated by hand.

## Voice agent

`POST /api/voice` accepts either a multipart `audio` file or JSON `{ text }`.

- Audio + `DEEPGRAM_API_KEY` → transcript
- `GEMINI_API_KEY` → kid-friendly reply using SQLite context
- `ELEVENLABS_API_KEY` → base64 MP3

Response: `{ transcript, response, audio, capabilities }`. When `audio` is
null, the frontend can fall back to the browser `SpeechSynthesis` API.

## Environment

See `.env.example`. Only `DATABASE_URL` matters for the data API; the AI keys
are optional and gate the voice features.

## Deployment

Render free tier: root directory `backend`, build `pnpm install`, start
`pnpm start`. Render's filesystem is ephemeral, so `pnpm seed` + `pnpm sync`
should run on first boot (or use Turso for persistent SQLite).

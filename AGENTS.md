# Solaris — agent guide

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 5173). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

Workspace layout — the app lives in `frontend/`, the future API in `backend/`:

- `frontend/` - React + Vite + Tailwind CSS v4 app (the Solaris atlas)
- `backend/` - Reserved for the future backend (see `backend/README.md`)
- `package.json` (root) - Shim whose `dev`/`build`/`preview`/`format` scripts proxy into `frontend/` via `pnpm --dir frontend`
- `.figma/` - Figma Make toolchain configuration (stays at workspace root)
- `.mise.toml` - Toolchain versions for Node.js and pnpm

All app paths below and in the build plan are relative to `frontend/`:

- `frontend/src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `frontend/src/App.tsx` - Primary application component and the usual starting point for UI work
- `frontend/src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `frontend/index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `frontend/package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `frontend/vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`; the build outputs to the workspace-root `../dist` for the Figma Make deploy flow

The Figma Make toolchain keeps running pnpm scripts from the workspace root, so the root shim `package.json` must exist with matching script names.

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

Tailwind emits utility classes in `@layer utilities`, and CSS outside any cascade layer overrides every layer regardless of specificity. Put global element styles, such as resets and defaults for `body`, headings, `button`, or `input`, inside `@layer base { ... }` so utility classes on those elements still apply. Tailwind's Preflight already applies `box-sizing: border-box`, removes default margins, and sets `font: inherit` on form controls, so do not repeat those rules.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.

## Solaris build plan (active)

Goal: turn the static atlas into a living, kid-friendly (ages 8–14) solar-system experience for
the NASA Space Apps Challenge. First impression matters: a playful planetarium, not a dashboard.

### Locked decisions

- Lightweight pseudo-3D orbit engine (no Three.js) with depth scaling and sun occlusion.
- Real NASA planet imagery / cutouts, color-graded but realistic.
- Orbit speed slow but noticeable; speed toggle 0.5× / 1× / 2×.
- Guided tour is required (~60 seconds, camera flies planet to planet).
- Keep the full timeline, 1957 → current year, showing mission deployment history.
- Neon project dots: cyan/green = active, orange = retired; shape also differs for accessibility.
- Use free NASA data now; isolate it behind an adapter so official NASA data can replace it later.
- Night-sky canvas background with Milky Way band, twinkles, and occasional shooting stars.

### Visual rules

- Audience is young: body text ≥ 14px, labels ≥ 12px, short sentences, picture-first cards.
- Wording: "Still exploring" / "Retired explorers" instead of "Active Missions" / "Dormant Relics".
- Keep the dark navy + cyan + amber identity; keep star effects low-opacity behind text.
- Every visible control must work. No decorative search, timeline, or nav links.

### Technical architecture

- `src/hooks/useCamera.ts` — pan/zoom/focus/follow; transforms only.
- `src/hooks/useReducedMotion.ts` — disables orbit motion, twinkle, and tour autoplay.
- `src/hooks/usePerformanceTier.ts` — low/high quality selection for weak devices.
- `src/components/OrbitSystem.tsx` — single rAF loop; updates planet DOM transforms via refs
  (no React re-render per frame); writes positions to a shared ref for the camera.
- `src/components/StarfieldCanvas.tsx` — adaptive star count, 3 parallax layers, shooting stars.
- `src/components/PlanetMarker.tsx` and `ProjectDots.tsx` — planet visuals, labels, neon dots.
- `src/components/MissionDrawer.tsx` — data-driven per-planet content (replaces DetailDrawer).
- `src/components/GuidedTour.tsx` — step-by-step camera tour with pause/next/exit.
- `src/components/MissionSearch.tsx` — live results; selecting focuses the planet.
- `src/data/missions.ts` — kid-friendly planet stories and mission stats.
- `src/data/projects.ts` — active/retired project dots (mock/free data for now).
- `src/data/timelineEvents.ts` — mission events from 1957 to today.
- `src/lib/nasa.ts` — `fetchPlanetProjects()` adapter with bundled fallback data.

### Orbit math

- Solar center: (575, 570) in stage coordinates; radii come from `solarSystem.ts` orbits.
- `x = cx + rx·cos(θ)`, `y = cy + ry·sin(θ)`, `depth = sin(θ)`.
- Depth drives scale (0.86–1.08), opacity, and z-index; sun sits at z-index 50.
- Periods at 1×: Mercury 18s, Venus 24s, Earth 30s, Mars 38s, Jupiter 52s, Saturn 66s,
  Uranus 82s, Neptune 100s.
- Focus mode slows to 10% speed; reduced motion parks planets at seeded angles.

### Build phases

1. Phase 1: orbit engine, 3D tilt/depth, sun pulse, starfield, speed toggle, hover states.
2. Phase 2: camera zoom/pan/pinch, click-to-focus, real planet imagery, mission drawer.
3. Phase 3: neon project dots, legend, counts, tooltips, NASA adapter with fallback.
4. Phase 4: guided tour, first-visit hints, entrance animations, working search.
5. Phase 5: 1957 → now timeline with event markers, play mode, year highlighting.
6. Phase 6: low-end performance tuning, accessibility, cross-browser QA, content pass.

### Performance and QA targets

- 60fps on a normal laptop, 30fps minimum on low-end; JS heap under ~150MB.
- Adaptive star count (≈220 low / ≈520 high), DPR cap 1.5–2, pause when hidden.
- No per-frame React state updates; animate transform/opacity only.
- Reduced motion: no orbits/twinkle/parallax, tour uses instant steps.
- Verify 1366×768, 1920×1080, 900×700, and 390×844; Chrome, Edge, Safari.
- Keyboard: Tab reaches planets/dots/controls, Enter selects, Esc exits focus.
- Offline safety: all mission/project content works without any live API call.

### Content sources

- Planet art: existing transparent NASA cutouts in `public/assets`.
- Mission photos: NASA Image and Video Library (public domain), stored in
  `public/assets/missions/`.
- Replace curated project data with official NASA data later via `src/lib/nasa.ts` only.

## Backend build plan (active)

Goal: free-tier backend that fetches NASA data, transforms it to the frontend
schemas, caches it in SQLite, serves it via Fastify, and powers a voice agent.

### Locked decisions

- Runtime: Node.js 22 + TypeScript (same as frontend, shared types).
- Framework: Fastify (fast, great TS support, schema-based).
- ORM: Drizzle ORM (type-safe, SQLite-native).
- Database: SQLite (file-based, zero-config, free).
- LLM: Google Gemini 2.5 Flash (free tier, 1.5M tokens/day).
- STT: Deepgram Nova-2 ($150 free credit for new users).
- TTS: ElevenLabs (10k chars/month free).
- File storage: Cloudflare R2 (10GB free, S3-compatible).
- Hosting: Render free tier (750 hrs/month, always-on).
- Validation: Zod (shared schemas between backend and frontend).
- Images/videos: store URLs in SQLite, serve from NASA CDN (no binary blobs).
- Voice audio: store files in R2, metadata + URL in SQLite `voice_cache`.

### Architecture

```
NASA APIs → sync script (cron 6h) → transform → SQLite (cache + fallback)
                                                        │
                                                        ▼
                                              Fastify API (Render)
                                                        │
                                                        ▼
                                              Frontend (React + Vite)
```

### SQLite schema (tables)

- `planets` — id, name, nickname, tagline, color, hero_image_url
- `missions` — id, planet_id, name, agency, status, launched, ended, headline,
  summary, fun_fact, nasa_url, hero_image_url, stats (JSON)
- `projects` — id, planet_id, name, agency, status, launched, ended, featured
- `timeline_events` — id, year, title, kind, planet_id, detail
- `stories` — planet_id, headline, intro, fun_fact, voice_cache_url
- `media` — id, mission_id, kind, src (URL), caption, href
- `voice_cache` — id (hash), transcript, audio_url, duration_ms
- `sync_log` — id, source, status, records_count, error, synced_at

### API routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/planets` | All planets |
| GET | `/api/planets/:id` | Planet + missions + story |
| GET | `/api/missions` | Missions (filter: planet, status) |
| GET | `/api/missions/:id` | Mission + media |
| GET | `/api/projects` | Projects (filter: planet, status) |
| GET | `/api/timeline` | Timeline (filter: year, from, to) |
| GET | `/api/stories/:planetId` | Kid-friendly story |
| GET | `/api/search?q=` | Full-text search |
| POST | `/api/voice` | Voice agent (audio → audio) |
| POST | `/api/sync` | Trigger NASA sync (admin key) |

### Voice agent flow

```
mic → MediaRecorder → POST /api/voice
  → Deepgram STT → transcript
  → SQLite context (missions, stories, planets)
  → Gemini LLM → response text
  → ElevenLabs TTS → audio file (R2 + SQLite cache)
  → return { transcript, response, audioUrl }
→ frontend plays audio + shows transcript
```

### Build phases

1. Phase 1: backend skeleton, Fastify + SQLite + Drizzle, health check.
2. Phase 2: NASA API clients, transform, sync script.
3. Phase 3: API routes, Gemini story generation, JSON export.
4. Phase 4: voice agent (Deepgram + Gemini + ElevenLabs + R2 cache).
5. Phase 5: polish, error handling, rate limiting, frontend wiring, deploy.

### Cost

| Service | Free tier |
|---------|-----------|
| Render | 750 hrs/month |
| Gemini | 1.5M tokens/day |
| Deepgram | $150 credit |
| ElevenLabs | 10k chars/month |
| Cloudflare R2 | 10GB |
| NASA APIs | Unlimited |
| **Total** | **$0** |

### Risk mitigations

- NASA API down → SQLite serves stale data.
- Render filesystem reset → re-sync on startup if DB empty.
- ElevenLabs/Deepgram exhausted → Web Speech API fallback.
- Gemini rate limit → queue + exponential backoff.
- CORS → Fastify CORS plugin, allow frontend origin.

### Success criteria

- [ ] Backend runs on Render free tier, always-on.
- [ ] SQLite has 100+ missions, 8 planets, 150+ timeline events.
- [ ] API responds < 100ms for data endpoints.
- [ ] Voice agent responds < 3 seconds.
- [ ] Frontend works offline with bundled JSON.
- [ ] NASA sync runs every 6 hours.
- [ ] Zero cost in normal operation.

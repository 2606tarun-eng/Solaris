# Repository guide

A map of the repository for judges, new contributors and future-you.

---

## 1. Start here

| I want to… | Go to |
|---|---|
| See it running | [README → Quick start](../README.md#-quick-start) |
| Install / build / deploy | [docs/SETUP.md](SETUP.md) |
| Understand the engine | [docs/ARCHITECTURE.md](ARCHITECTURE.md) |
| Know where the data comes from | [docs/DATA-SOURCES.md](DATA-SOURCES.md) |
| Read the submission sheet | [docs/SUBMISSION.md](SUBMISSION.md) |
| Run the optional API | [backend/README.md](../backend/README.md) |
| Contribute | [CONTRIBUTING.md](../CONTRIBUTING.md) |

---

## 2. Top-level layout

```text
.
├── frontend/                React 19 + Vite app — the product
│   ├── public/              Static assets served as-is
│   │   ├── assets/          Planet cutouts, mission photos, icons (Git LFS)
│   │   └── fonts/           Inter, Space Grotesk, IBM Plex Mono (Git LFS)
│   ├── src/
│   │   ├── components/      UI: landing, atlas, mission control, story pages
│   │   ├── context/         Theme + passport providers
│   │   ├── data/            All content: planets, missions, stories, timeline, generated JSON
│   │   ├── hooks/           Camera, reduced motion, performance tier
│   │   ├── lib/             Routing, data adapters, flash transitions, audio
│   │   ├── App.tsx          Atlas composition
│   │   ├── Root.tsx         Three-route entry point
│   │   └── index.css        Tailwind v4 import + design system
│   └── vite.config.ts       Vite + Tailwind + Figma Make toolchain plugins
├── backend/                 Optional Fastify + SQLite API and NASA scraper
├── docs/                    Documentation and README screenshots
├── .github/                 CI, issue templates, PR template
├── .figma/                  Figma Make toolchain configuration (kept at root)
├── AGENTS.md                Engineering guide + build plan
├── CONTRIBUTING.md          How to contribute
├── CODE_OF_CONDUCT.md       Community expectations
├── LICENSE                  MIT
└── README.md                Project front page
```

### Why the frontend lives in `frontend/`

The repository started inside **Figma Make**, whose toolchain expects an app folder plus a root
`package.json` shim. The root scripts (`pnpm dev`, `pnpm build`, …) forward into `frontend/`, so you
never have to `cd` manually.

---

## 3. Where to make a change

| Change | File(s) |
|---|---|
| Planet data, colours, orbital period, tagline | `frontend/src/data/planets.ts` |
| Orbit geometry / sun rings | `frontend/src/data/solarSystem.ts` |
| A mission's facts and stats | `frontend/src/data/missions.ts` |
| Mission Control card copy | `frontend/src/data/missionControl.ts` |
| A mission's five story chapters | `frontend/src/data/missionStories.ts` |
| Timeline events (1957 → today) | `frontend/src/data/timelineEvents.ts` |
| Active / retired dots | `frontend/src/data/projects.ts` |
| Landing page | `frontend/src/components/LandingIntro.tsx` |
| The map itself | `frontend/src/components/MissionMap.tsx`, `OrbitSystem.tsx` |
| Mission control drawer | `frontend/src/components/MissionControlDrawer.tsx` |
| Story page | `frontend/src/components/mission-story/` |
| Colours, fonts, spacing | `frontend/src/index.css` |
| Page title / description / favicon | `.figma/make/site.json` (root **and** `frontend/`) |
| NASA catalogue pipeline | `backend/scripts/scrape-missions.ts` |

---

## 4. Adding content

### Add a mission story

1. Open `frontend/src/data/missionStories.ts`.
2. Add a `MissionProfile` following an existing entry (five chapters: beginning, spacecraft, journey,
   discoveries, today).
3. Register it in `curatedStories` under its lowercase id.
4. Use a **different** NASA image per chapter, with an honest caption.
5. Check `http://localhost:5173/mission/<your-id>`.

### Add a mission to Mission Control

Add an entry to `frontend/src/data/missionControl.ts` for the right planet. If you skip this,
`buildFallbackProfile()` still produces a working story from the mission's metadata.

### Refresh the NASA catalogue

```bash
cd backend
pnpm scrape --body=moon --limit=12   # try a small run first
pnpm scrape                          # full run
```

Commit the regenerated `frontend/src/data/generated/*.json` and
`backend/data/image-gaps.md` together.

---

## 5. Git & Git LFS

- **Images and fonts are in Git LFS.** `frontend/.gitattributes` maps `*.png`, `*.jpg`, `*.ttf`, …
  to LFS.
- Fresh clone: `git lfs install && git lfs pull` (see the troubleshooting table in
  [SETUP.md](SETUP.md)).
- `frontend/public/.gitattributes` deliberately excludes `favicon.png` from LFS so preview
  tooling can read it directly.
- `main` is the deployable branch. Work on `feat/…`, `fix/…` or `docs/…` branches.
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).

### Suggested GitHub repository settings

**About → Description** (paste this):

> Solaris — a kid-friendly, interactive NASA mission atlas of the solar system. Real missions, real imagery, orbit engine, timeline and mission stories. Built for the NASA Space Apps Challenge 2026.

**About → Website:** your deployed URL (e.g. `https://solaris.example.com`)

**Topics:**

```text
nasa-space-apps  space  solar-system  react  vite  typescript  tailwindcss
nasa-data  education  kids  interactive-visualization  astronomy  open-data
```

**Social preview:** upload `docs/assets/00-banner.png` under
*Settings → General → Social preview*.

> The canonical repository is **`2606tarun-eng/Solaris`**. Keep it renamed, and archive or delete
> any older duplicate so judges always land on the right project.

---

## 6. Release checklist

Before submitting or tagging a release:

- [ ] `pnpm build` passes
- [ ] `git lfs status` shows no un-pushed objects
- [ ] Screenshots in `docs/assets/` match the current UI
- [ ] README links resolve (Docs table, screenshots, license)
- [ ] No secrets, `node_modules/`, `dist/` or `.cache/` in the commit
- [ ] Team table and submission sheet are filled in
- [ ] GitHub description, topics and social preview are set
- [ ] Tag: `git tag -a v1.0.0 -m "Solaris v1.0.0 — NASA Space Apps 2026" && git push --tags`

---

## 7. Housekeeping

- Build output `dist/` is ignored at the repo root.
- `node_modules/` is ignored at every level.
- Backend responses are cached in `backend/.cache/nasa-missions` to keep scraping cheap; it is
  committed intentionally so a fresh clone can re-sync without hammering NASA.
- Never commit `.env` files; document variables in `.env.example`.

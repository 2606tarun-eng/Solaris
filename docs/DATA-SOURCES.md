# Data sources & attribution

Solaris only uses **free, public, NASA-owned** data. This page records where every fact and image
comes from, so the project can be verified and reused responsibly.

---

## 1. Sources

| Source | What we use | Access |
|---|---|---|
| **NASA Science — mission catalogue** (`science.nasa.gov`) | Mission names, target bodies, launch dates, status, agency, hero images, article prose | Public WordPress JSON: `/wp-json/wp/v2/mission` |
| **NASA Image and Video Library** (`images-api.nasa.gov`) | One distinct photograph per story chapter, mission heroes, planet photography | Public, no key |
| **NSSDCA** (`nssdc.gsfc.nasa.gov`) | Spacecraft identifiers and technical cross-checks | Public pages (robots-limited; used selectively) |
| **NASA public-domain media guidelines** | Legal basis for reusing imagery | <https://www.nasa.gov/nasa-brand-center/images-and-media/> |

The scrape pipeline lives in [`backend/scripts/scrape-missions.ts`](../backend/scripts/scrape-missions.ts)
and writes:

| File | Contents |
|---|---|
| `frontend/src/data/generated/nasaMissions.json` | Normalised mission catalogue |
| `frontend/src/data/generated/nasaChapters.json` | Per-mission chapter copy + image set (lazy-loaded) |
| `backend/data/image-gaps.md` | Checklist of chapters that fell back to archive art |

---

## 2. How content reaches the screen

```text
NASA catalogue ─┐
NASA image API ─┼─▶ scrape-missions.ts ─▶ generated/*.json ─┐
NSSDCA checks  ─┘                                            ├─▶ atlas + story pages
Hand-written kid-friendly stories & captions ────────────────┘
```

- **Curated data wins.** Hand-written profiles in `src/data/missionStories.ts` are used first because
  they were edited for a 8–14 audience.
- **Generated fallbacks fill gaps.** Missions without a curated profile get five honest chapters
  assembled from their real metadata and NASA photography.
- **No live calls at runtime.** Everything is bundled, so the site works offline and demos never
  depend on a network.

---

## 3. Photography rules we follow

1. **Describe what the image actually shows.** If we only have a portrait of Saturn, the caption says
   "Saturn", never "a photo of the Cassini spacecraft".
2. **Credit NASA.** Captions end with `(NASA)` or `(NASA/JPL)` where applicable.
3. **No NASA endorsement implied.** Solaris is a challenge entry, not a NASA product.
4. **Public domain only.** No third-party press images, no copyrighted film stills.
5. **Kids first.** No distressing imagery; every frame is chosen to be understandable at a glance.

---

## 4. Attribution & licences

| Asset | Licence |
|---|---|
| Code in this repository | MIT — see [LICENSE](../LICENSE) |
| NASA mission data, text excerpts and photography | NASA public domain (NASA media guidelines) |
| Planet cutouts / orbit artwork | Derived from NASA imagery, colour-graded for the UI |
| **Inter** | SIL Open Font License 1.1 |
| **Space Grotesk** | SIL Open Font License 1.1 |
| **IBM Plex Mono** | SIL Open Font License 1.1 |
| React, Vite, Tailwind CSS, Framer Motion, three.js, Fastify, Drizzle | MIT / Apache-2.0 as per their own licences |

Fonts are self-hosted in `frontend/public/fonts` (Git LFS), so the site loads no third-party font CDN.

---

## 5. Reproducing the data

```bash
cd backend
pnpm install
pnpm scrape            # full catalogue (network, uses backend/.cache)
pnpm scrape --body=moon --limit=12   # small, fast run
```

NASA's public APIs are rate-limited. The scraper caches every response in
`backend/.cache/nasa-missions`, so re-runs are cheap. A `NASA_API_KEY` from
<https://api.nasa.gov> raises the limits; `DEMO_KEY` works for small runs.

> If you republish this project, keep the NASA attribution and replace the team/author details. Do
> not imply NASA endorsement.

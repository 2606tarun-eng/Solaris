# Submission sheet — NASA Space Apps Challenge 2026

A single page a judge or evaluator can read in two minutes.

---

## Project

| | |
|---|---|
| **Project name** | Solaris |
| **Tagline** | Abandoned but not forgotten — a kid-friendly atlas of every spacecraft we left in the solar system. |
| **Challenge** | NASA Space Apps Challenge 2026 |
| **Team** | Team Asynchronous |
| **Category** | Interactive visualization · Education · Open data |
| **Platform** | Web (desktop, tablet, phone) |
| **Status** | Feature complete for submission (v1.0.0) |
| **Repository** | This repository |
| **Demo** | `http://localhost:5173` after [setup](SETUP.md), or your deployed URL |

---

## The one-paragraph pitch

Space agencies have flown thousands of missions, but that history is hidden in tables and PDFs.
Solaris turns NASA's catalogue into a living planetarium for 8–14 year-olds: real NASA imagery,
slow-moving orbits, and a glowing dot for every spacecraft. Tap a planet to open Mission Control,
then read a five-chapter story — launch, spacecraft, journey, discoveries, and what is still out
there today. A time machine replays the space age from 1957 to now, and a one-minute guided tour
flies from world to world. It runs entirely as a static site, works offline, and needs no API keys.

---

## What makes it different

1. **Storybook, not dashboard.** Every screen is built around one idea and one picture, written for a
   nine-year-old, not a mission planner.
2. **Every dot is real.** No invented spacecraft; names, agencies, years and targets come from NASA's
   catalogue, and each story links back to NASA.
3. **Status is readable by everyone.** Green/amber colour **and** different dot shapes, so it works
   without colour vision.
4. **It survives a bad demo network.** All data and art are bundled; nothing loads from an API at
   runtime.
5. **Craft, not a template.** A custom pseudo-3D orbit engine, bespoke type and a colour-graded space
   design system.

---

## Feature checklist

- [x] Landing page with a cinematic warp transition
- [x] Eight planets + Sun with depth, occlusion and realistic NASA imagery
- [x] Active / retired mission dots with legend and counts
- [x] Mission Control drawer per planet
- [x] Five-chapter mission story pages (curated + generated fallbacks)
- [x] 1957 → today timeline with play mode
- [x] Live search across planets and missions
- [x] ~60-second guided tour with pause / next / exit
- [x] Pan, zoom, pinch and click-to-focus camera
- [x] Reduced-motion support, keyboard navigation, ARIA labels
- [x] Fully responsive from 390 px phones to 1920 px desktops
- [x] Optional Fastify + SQLite backend and voice agent (scaffolded)
- [x] Documentation, CI, LICENSE, contribution guide

---

## How to evaluate it (5 minutes)

1. `pnpm install:frontend && pnpm dev` → open <http://localhost:5173>.
2. Watch the landing page, then click **Explore the void**.
3. Hover the planets; use the mouse wheel to zoom; drag to pan.
4. Click **Saturn** → Mission Control opens with a 3-D planet and its four visitors.
5. Open **Cassini** → read the five chapters.
6. Scrub the **time machine** from 1957 to today; press **Play years**.
7. Press **Tour** and let it run; try **Esc** to exit.
8. Resize to a phone width; reload; confirm the layout adapts.
9. Enable *Reduce motion* in the OS and reload — orbits park, the tour steps instantly.

---

## NASA data used

| Data | Source |
|---|---|
| Mission catalogue (names, targets, dates, status) | `science.nasa.gov` mission API |
| Photography | NASA Image and Video Library (`images-api.nasa.gov`) |
| Cross-checks | NSSDCA |

All NASA content is public domain. Attribution, licences and reuse rules:
[DATA-SOURCES.md](DATA-SOURCES.md).

---

## Tech summary

React 19 · TypeScript 5.9 · Vite 8 · Tailwind CSS v4 · Framer Motion · three.js (planet close-up
only) · Fastify + SQLite/Drizzle (optional backend). No paid services required.

---

## Team & responsibilities

| Name | Contribution |
|---|---|
| Tarun | Concept, design system, frontend, orbit engine, data pipeline, documentation |
| Team Asynchronous | Mission research, story writing, QA |

> Update this table with the final roster (names, roles, links) before submitting.

---

## Assets produced for submission

| Asset | Location |
|---|---|
| README banner | `docs/assets/00-banner.png` |
| Landing screenshot | `docs/assets/01-landing.png` |
| Atlas screenshot | `docs/assets/02-atlas.png` |
| Mission Control screenshot | `docs/assets/03-planet-control.png` |
| Mission story screenshot | `docs/assets/04-mission-story.png` |
| About / guide screenshot | `docs/assets/05-about.png` |

---

## Known limitations

- The map is intentionally not to scale (stated in the UI).
- Mission coverage follows the last committed NASA scrape.
- The voice agent requires API keys and is outside the static demo path.

---

## Licence

Code: MIT. NASA imagery and mission data: public domain, used under NASA's media guidelines.

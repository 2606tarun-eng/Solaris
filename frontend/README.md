# Solaris — frontend app

React 19 + Vite 8 + Tailwind CSS v4 single-page app. This is the product: the landing page, the
mission atlas and the mission story pages.

> Full project documentation lives at the repository root: [README.md](../README.md) ·
> [docs/](../docs/).

## Run it

```bash
pnpm install    # from this folder
pnpm dev        # http://localhost:5173
```

From the repository root you can use `pnpm install:frontend` and `pnpm dev` instead.

## Build

```bash
pnpm build      # static output in ../dist
pnpm preview    # serve the build on :4173
pnpm format     # oxfmt
```

## Structure

```text
src/
  App.tsx                  atlas composition (map + timeline + status bar)
  Root.tsx                 tiny three-route entry ("/", "/app", "/mission/:id")
  assets.ts                single registry for every image used by the UI
  index.css                Tailwind import + design tokens
  components/
    LandingIntro.tsx       cinematic splash
    MissionMap.tsx         atlas surface
    OrbitSystem.tsx        one rAF loop; planets via DOM transforms
    CameraControls.tsx     zoom / reset HUD
    MissionControlDrawer.tsx
    mission-story/         five-chapter story pages
    Timeline.tsx           time machine (1957 → today)
    GuidedTour.tsx         one-minute tour
    MissionSearch.tsx      live search
    StarfieldCanvas.tsx    adaptive star field
  context/                 theme + passport providers (prototype features)
  data/                    planets, missions, stories, timeline, generated NASA JSON
  hooks/                   useCamera, usePerformanceTier, useReducedMotion
  lib/                     routing, NASA adapter, flash bus, kid audio
public/
  assets/                  planet art, mission photos, icons (Git LFS)
  fonts/                   Inter, Space Grotesk, IBM Plex Mono (Git LFS)
```

## Notes

- All images are registered in `src/assets.ts`; never hardcode a path in a component.
- The app is fully offline-capable: no runtime API calls are required.
- Page title, description and favicon come from `.figma/make/site.json`.
- Imagery is stored in Git LFS — run `git lfs pull` if images look blank.

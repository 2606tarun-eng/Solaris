# AstroRelics — Mission Atlas

An interactive NASA Space Apps Challenge concept: a heliocentric map of the machines we
left behind, with a searchable mission atlas, status filters, a launch-year timeline, and a
relic detail panel.

Built with React 19, TypeScript, Vite, and Tailwind CSS v4.

## Run locally

```bash
pnpm install
pnpm dev
```

Open <http://localhost:8443>. The dev server scales the fixed 1600 × 1180 atlas stage down
to the browser width, so it also works in narrow preview panes.

## Build for the web

```bash
pnpm build     # production files in dist/
pnpm preview   # serve the production build locally
```

`dist/` is a completely static site. Upload it to any static host (Netlify, Vercel, Cloudflare
Pages, GitHub Pages, S3, nginx) — no server or environment variables required.

If you host the site on a sub-path (for example `https://example.com/astrorelics/`), set
`FIGMA_PUBLIC_URL` while building so asset and image URLs include the prefix:

```bash
FIGMA_PUBLIC_URL=/astrorelics pnpm build
```

## Project structure

```text
src/
  App.tsx                  page state, viewport scaling, layout composition
  assets.ts                single registry for every image path
  index.css                Tailwind import, self-hosted fonts, atlas styles
  components/
    NavBar.tsx             top navigation
    MissionMap.tsx         heliocentric map, planet markers, search, filters
    Timeline.tsx           launch / landing era slider
    DetailDrawer.tsx       relic detail panel
    StatusBar.tsx          footer credits
  data/
    planets.ts             planet positions, status, captions
    solarSystem.ts         sun flare rings and orbit paths
    starfield.ts           decorative background stars
public/
  assets/                  planet, orbit, and icon artwork
  fonts/                   IBM Plex Mono, Inter, Space Grotesk (self-hosted)
```

## Notes

- Fonts are served from `public/fonts`, so the site has no external font/CDN dependency.
- All artwork lives in `public/assets` and is referenced through `src/assets.ts`.
- Page title, description, and favicon are configured in `.figma/make/site.json`.

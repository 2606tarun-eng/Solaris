# Changelog

All notable changes to Solaris are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-11-14

First submission build for the **NASA Space Apps Challenge 2026**.

### Added

- Landing page with cinematic warp transition into the atlas.
- Pseudo-3D orbit engine: eight planets, depth scaling, sun occlusion, 0.5× / 1× / 2× speed.
- Mission Control drawer with per-planet active/retired counts and mission cards.
- Five-chapter mission story pages with real NASA photography and a generated fallback for every
  mission in the catalogue.
- 1957 → today time machine with play mode and year highlighting.
- Live search across planets and missions.
- ~60-second guided tour with pause / next / exit.
- Camera: pan, wheel/pinch zoom, click-to-focus, reset.
- Adaptive starfield with parallax, twinkles and shooting stars.
- Reduced-motion support, keyboard navigation and ARIA labelling.
- NASA catalogue scrape pipeline and generated JSON data.
- Optional Fastify + SQLite backend with NASA sync and a voice-agent endpoint.
- Full documentation set, CI workflow, issue/PR templates and MIT licence.
- Firebase Hosting configuration (`firebase.json`) and an automatic deploy workflow on push to
  `main`, plus a `pnpm deploy:firebase` script.

### Changed

- Project renamed from its working title to **Solaris** across code, UI copy and documentation.
- Dev server default port moved from 8443 to **5173** (preview 4173).
- Repository imagery and fonts are stored in **Git LFS**; fresh clones must run `git lfs pull`.

### Fixed

- Placeholder LFS pointer files replaced with real planet art, mission photos and fonts.
- Planet labels keep readable contrast while passing behind the Sun.
- Mission story lookup resolves ids that only exist in the NASA catalogue.

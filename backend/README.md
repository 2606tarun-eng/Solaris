# Backend (planned)

Reserved for the future backend of the AstroRelics project. The frontend
(`../frontend`) currently runs entirely on bundled, hand-checked data so it
always works offline.

## Planned responsibilities

- Serve mission and project data through a small REST API (Node + Express or
  equivalent), replacing the bundled fallback data in
  `frontend/src/data/projects.ts`.
- Proxy NASA data sources (NASA Image and Video Library, Photojournal) behind
  one typed adapter. The swap-in point on the frontend is already isolated at
  `frontend/src/lib/nasa.ts` (`fetchPlanetProjects`).
- Optional caching / rate limiting so repeated demo rebuilds never hammer the
  upstream NASA endpoints.

## Status

Empty stub for now — nothing is wired into the frontend yet. When work starts,
run the API on its own port and let the frontend call it through the existing
`src/lib/nasa.ts` adapter so the UI never depends on the transport directly.

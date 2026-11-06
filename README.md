# AstroRelics workspace

NASA Space Apps Challenge project: **AstroRelics** — a kid-friendly solar-system
atlas of the machines we sent out and left behind.

## Layout

```text
frontend/   React 19 + Vite + Tailwind v4 app (the mission atlas)
backend/    Reserved for the future backend (see backend/README.md)
.figma/     Figma Make toolchain configuration (kept at workspace root)
AGENTS.md   Agent instructions and active build plan
```

## Commands (run from the workspace root)

```bash
pnpm install:frontend   # install frontend dependencies
pnpm dev                # dev server on http://localhost:8443
pnpm build              # production build -> dist/ (workspace root)
pnpm preview            # serve the production build
```

The frontend build outputs to the workspace-root `dist/` because the Figma Make
deploy flow publishes that folder. See `frontend/README.md` for app details.

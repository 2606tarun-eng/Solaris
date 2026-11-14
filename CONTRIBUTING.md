# Contributing to Solaris

Thanks for helping make space history feel alive for kids. This guide keeps the repository tidy and
the demos fast.

---

## Ways to help

- **Report a bug** — open an issue with the bug template (steps, browser, screenshot).
- **Fix content** — a caption that describes the wrong image, a fact that drifted, a typo.
- **Add a mission story** — see [docs/REPO-GUIDE.md](docs/REPO-GUIDE.md#add-a-mission-story).
- **Improve accessibility** — keyboard order, contrast, screen-reader labels.
- **Improve performance** — anything that keeps the atlas at 60 fps on a laptop.

Please open an issue before starting large features so we can agree on the approach.

---

## Local workflow

```bash
git clone <repository-url>
cd <repository-folder>
git lfs install && git lfs pull
pnpm install:frontend
pnpm dev
```

Then create a branch:

```bash
git checkout -b feat/mars-story-images
```

---

## Definition of done

- [ ] `pnpm build` passes
- [ ] The feature works at 390 px, 900 px and 1920 px widths
- [ ] Keyboard-only navigation still works
- [ ] `prefers-reduced-motion` still works
- [ ] Images load (not LFS pointers) and have meaningful `alt` text
- [ ] Captions/credits are accurate — see [docs/DATA-SOURCES.md](docs/DATA-SOURCES.md)
- [ ] Documentation updated if behaviour changed

---

## Code style

- **TypeScript, strict.** No `any` unless a comment explains why.
- **Components:** default exports, one component per file, PascalCase filenames.
- **Strings:** double quotes when the text contains an apostrophe; escape otherwise.
- **Styling:** Tailwind utilities in JSX; global tokens and base styles in `frontend/src/index.css`
  inside `@layer base`.
- **Animation:** never set React state from an animation frame; write refs/styles instead.
- **Formatting:** `pnpm format` (oxfmt).

---

## Commit messages

Conventional Commits:

```text
feat: add Europa flyby chapters to the Jupiter story
fix: keep planet labels above the sun at depth 0
docs: document the LFS clone requirement
chore: refresh generated NASA catalogue
```

Small, focused commits. One idea per commit.

---

## Pull requests

1. Fill in the PR template (what, why, screenshots).
2. Link the issue it closes.
3. Keep PRs reviewable — split unrelated work.
4. CI must be green (`pnpm build`).
5. A maintainer merges with **squash and merge**.

---

## Adding imagery

- NASA imagery only, public domain, with a caption ending in `(NASA)` or `(NASA/JPL)`.
- Put files in `frontend/public/assets/missions/` and reference them through `src/assets.ts`.
- Keep files reasonably sized (target < 400 KB per image); they ship in the bundle.
- Images are stored in **Git LFS** — run `git lfs status` before pushing.

---

## Content rules for a young audience

- Short sentences. One idea per paragraph. Present tense where it reads naturally.
- Explain jargon in the same sentence ("orbit — the path around a planet").
- Never describe a spacecraft as "failed" or "dead"; say "retired" or "silent".
- No scary imagery, no political framing.
- Every factual claim must be checkable on the linked NASA page.

---

## Questions

Open a discussion or an issue. Be kind — see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

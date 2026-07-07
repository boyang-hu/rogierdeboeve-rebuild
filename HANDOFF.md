# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-07

## Purpose

This is the current resume sheet. Keep it short and replace stale details instead of appending chronology.

It should answer only:

- where Phase 1 stands now
- what the last committed batch closed
- what to do next
- how to validate the next batch

It is not a timeline. Use git for history.

| Need | Read |
| --- | --- |
| Resume current work | `HANDOFF.md` |
| Check source evidence, blockers, and guarded edges | `PHASE1_AUDIT.md` |
| Decide the next execution order | `REBUILD_PLAN.md` |
| Inspect old document states | `git log --oneline` and `git show <commit>:<file>` |

## Current Snapshot

| Item | Value |
| --- | --- |
| Active phase | Phase 3 in progress; first project-detail shell/media DOM batch is source-aligned |
| Phase 1 status | Closed/guarded on 2026-07-07 |
| Phase 2 status | Closed/guarded on 2026-07-07 |
| Current production priority | Continue Phase 3 with project-detail scroll-state, next-project state, custom scrollbar, and route behavior audit |
| Next secondary priority | Keep Phase 1 and Phase 2 probes as regression gates when shared paths change |
| Last committed source-backed code batch | Phase 3 project-detail shell/media DOM source alignment |
| Last closed evidence batch | Phase 3 project-detail shell/media DOM source alignment |
| Local service | `scripts/serve.mjs` instances were running at `http://localhost:5173/` and `http://localhost:5174/` during validation |
| Expected worktree | Clean after each committed batch; dirty means one scoped batch is in progress |

Closeout state:

| Area | State | Current read |
| --- | --- | --- |
| Architecture/lifecycle | Guarded | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | Guarded | Shader surfaces and pass edges are source-shaped; `kA/Lu/I1` has no active Phase 1 mismatch. |
| Final Home visual parity | Guarded | Canvas-only Home distribution and spotlight/thumb transfer are source-guarded; final probe set is clean. |

## Last Closed Batch

The latest production batch starts Phase 3 by aligning the project-detail shell and media DOM with the source HTML/CSS read.

- `src/pages/[slug].astro` now emits the source-shaped project root, header back link, content/header wrappers, info items, desktop/mobile media roots, next-project wrapper, and scroll CTA grid.
- `src/components/MediaBlock.astro` now matches source project media attributes: desktop tracks use `[data-media]` without `media-block`/`data-media-type`; mobile fallback videos use `autoplay loop muted playsinline` plus the source inline object-fit style.
- `src/styles/global.css` now includes the source responsive utility classes used by project pages and replaces rebuild-only project media shadows/filters with source project header/content/media/next styling.
- `src/client/main.ts` resolves project payloads from local project data when the source-shaped DOM only exposes `data-project` or `data-project-slug`.
- `src/client/webgl.ts` now applies project-detail darkness from `darkenDetail` on project views and keeps `darkenOverview` for Home.
- Removed obsolete `media-block`, `data-mobile-media`, and `data-webgl-project` hooks from the project path.

Phase 1 and Phase 2 remain closed/guarded in `PHASE1_AUDIT.md` and `REBUILD_PLAN.md`.

## Current Evidence

Latest Phase 3 evidence:

- Source project HTML/CSS checked against `legacy-mirror/public/gc-2026/index.html`, `legacy-mirror/public/hashgraph-vc/index.html`, and `legacy-mirror/public/assets/bundle.87ba3613.css`.
- Build output DOM assertion: 30/30 passed for `gc-2026` and `hashgraph-vc` against source-shaped root, header link, content wrappers, media roots, mobile video attributes, next-project wrapper, and absence of rebuild-only project data attributes.
- Project media probe passed with `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`, `REBUILD_URL=http://127.0.0.1:5173`, `PROJECT_SLUGS=gc-2026,hashgraph-vc`, `OUT_DIR=/tmp/rd-phase3-project-media-probe`.
- Output color/state probe passed with `OUT_DIR=/tmp/rd-phase3-output-color-probe`.
- Static renderer audit passed: `node scripts/audit-renderer-output.mjs`.
- Build passed: `ASTRO_TELEMETRY_DISABLED=1 npm run build`.

Phase 2 regression evidence remains available in `/tmp/rd-phase2-home-audit-mobile-final2/home-dom-interaction-audit.json`, `/tmp/rd-output-p2-preloader-desktop`, and `/tmp/rd-output-p2-preloader-mobile`.

Audit method note:

- `/tmp/phase2-home-audit.mjs` launches Chrome with GPU disabled; full WebGL can stall in headless SwiftShader after preloader entry.
- Use `?disable-webgl` for DOM-interaction audits that do not need canvas rendering.
- Use `scripts/probe-output-color.mjs` without `?disable-webgl` for visual/WebGL coverage.

## Source Of Truth

- Final visual acceptance baseline: `https://rogierdeboeve.com/`.
- Implementation source bundle: `legacy-mirror/public/assets/bundle.250f01b7.js`.
- Implementation CSS bundle: `legacy-mirror/public/assets/bundle.87ba3613.css`.
- Local mirror note: online HTML/CSS/service-worker assets matched the mirror during the drift audit; the local JS bundle intentionally differs where `scripts/mirror-site.mjs` rewrites service-worker registration, `detect-gpu` benchmark URLs, and GPU-check fallback behavior for local serving.
- Screenshots and probes are attribution/regression aids only.
- Do not tune horizon, fog, floor color, brightness, or projection by eye.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must continue to use Howler.
- Do not delete `public/` or `legacy-mirror/`.

## Next Action

Phase 1 and Phase 2 are closed. Do not reopen either one unless a concrete source-owned mismatch appears.

Recommended next move:

1. Continue Phase 3 with project-detail scroll-state visuals, source scrollbar behavior, next-project state switching, and project-to-project/Home/About route behavior.
2. Convert only source-backed Phase 3 findings into scoped fixes.
3. Keep Phase 1 WebGL and Phase 2 Home DOM/interaction probes as regression gates when shared render, router, audio, or lifecycle paths change.
4. After Phase 3 is clean or guarded, move to Phase 4 About/auxiliary pages.
5. Leave broad transitions/audio/Lenis lifecycle cleanup for Phase 5 unless a shared bug blocks Phase 3 or Phase 4.

Guarded Phase 1 areas should not be reopened first without new evidence:

- Cubemap `scene.environment` loader defaults and sampling surface.
- `p1.addEnvironment()` fire-and-forget cubemap start order.
- `u1` environment vertex/fragment shader text.
- Sky composite `V1/H1/z1/B1` target chain and `z1` uniform surface.
- Renderer constructor clear color/alpha state.
- `kA/Lu/I1` default visible target transfer.
- Spotlight-map shader, Three light-chunk multiplication, thumb transfer order, and projection sampling.
- `w1.updateGalleryProgress()` centered wrapping.
- `T1/x1/E1/M1` thumb scene surface.
- Mouse/fluid feel, unless the batch touches interaction paths.

## Important Files

- Rebuild WebGL: `src/client/webgl.ts`
- Client logic: `src/client/main.ts`, `src/client/motion.ts`, `src/client/audio.ts`
- Pages/templates: `src/pages/index.astro`, `src/pages/[slug].astro`, `src/components/MediaBlock.astro`
- Data: `src/data/projects.json`, `src/data/site.ts`
- Core validation tools:
  - `scripts/audit-renderer-output.mjs`
  - `scripts/dump-va-shader.mjs`
  - `scripts/probe-output-color.mjs`
  - `scripts/probe-thumb-spotlight.mjs`
  - `scripts/probe-project-media.mjs`
  - `scripts/probe-about-scroll-opacity.mjs`

## Validate A Rendering Batch

```sh
node --check src/client/webgl.ts
node --check scripts/dump-va-shader.mjs
node --check scripts/audit-renderer-output.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-phase1-audit.json
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Known blocked check:

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

## Run Locally

```sh
npm install
npm run build
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
```

Open:

```text
http://127.0.0.1:5173/?skip-preloader
http://127.0.0.1:5173/about/?skip-preloader
http://127.0.0.1:5173/gc-2026/?skip-preloader
```

Stop the server with Ctrl-C after review. If `5173` is busy, use another port.

## Commit Rules

- Work in scoped source-backed batches.
- Update docs and commit code/docs together.
- Use `Boyang Hu <i@boyang.hu>`.
- Do not add an AI co-author.

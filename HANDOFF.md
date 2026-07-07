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
| Active phase | Phase 4 active; About shell/modal, title/intro/footer animation, route leave/entry lifecycle, scroll CTA/scrollbar, mobile CSS, and auxiliary visual lifecycle source alignment are closed and guarded |
| Phase 1 status | Closed/guarded on 2026-07-07 |
| Phase 2 status | Closed/guarded on 2026-07-07 |
| Phase 3 status | Closed/guarded on 2026-07-07 |
| Current production priority | Run a Phase 4 closeout review before moving to Phase 5 |
| Next secondary priority | Keep Phase 1-3 probes as regression gates when shared paths change |
| Last committed source-backed code batch | Phase 4 About auxiliary visual lifecycle source alignment |
| Last closed evidence batch | Phase 4 About auxiliary visual lifecycle source alignment |
| Local service | Dev server was available at `http://localhost:5173/` during validation; an older static service was also listening at `http://127.0.0.1:5174/` |
| Expected worktree | Clean after each committed batch; dirty means one scoped batch is in progress |

Closeout state:

| Area | State | Current read |
| --- | --- | --- |
| Architecture/lifecycle | Guarded | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | Guarded | Shader surfaces and pass edges are source-shaped; `kA/Lu/I1` has no active Phase 1 mismatch. |
| Final Home visual parity | Guarded | Canvas-only Home distribution and spotlight/thumb transfer are source-guarded; final probe set is clean. |

## Last Closed Batch

The latest production batch closes the Phase 4 About auxiliary visual lifecycle audit against source `TD` and `Fg`.

- `animateAboutVisualOut()` now matches source `TD.animateOut()` / `Fg.animateOut()` ownership: it only drives reveal tweens, hides About/floating blocks on tween complete, and sets spotlight intensity to `0`.
- Timer cleanup, RAF shutdown, character rotatable event removal, track clearing, and `spotLightParallax` restoration stay in `destroyAboutVisualState()`, matching source `TD.destroy()` ownership.
- Earlier About shell/footer/credits modal, title/intro/footer animation, route leave/entry lifecycle, scroll CTA/scrollbar, and mobile CSS batches remain closed and guarded.

Earlier Phase 3 batches aligned project-detail shell/media DOM, source `RD`, `wD`, `CD`, `Ug` scroll behavior, and source router behavior. Phase 1 and Phase 2 remain closed/guarded in `PHASE1_AUDIT.md` and `REBUILD_PLAN.md`.

## Current Evidence

Latest Phase 4 evidence:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `OUT_DIR=/tmp/rd-phase4-lifecycle-renderer-audit node scripts/audit-renderer-output.mjs`
- About scroll/auxiliary visual lifecycle probes passed on desktop and mobile:
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase4-lifecycle-about-scroll-probe-localhost-rerun2 CDP_PORT=9475 node scripts/probe-about-scroll-opacity.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase4-lifecycle-about-scroll-mobile-probe-localhost CDP_PORT=9472 VIEWPORT=mobile node scripts/probe-about-scroll-opacity.mjs`
- Shared WebGL regressions passed:
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase4-lifecycle-output-probe-localhost CDP_PORT=9473 node scripts/probe-output-color.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase4-lifecycle-project-media-probe-localhost CDP_PORT=9474 node scripts/probe-project-media.mjs`
- Earlier source CSS audit found source `.ui-about-contact .ts-2{line-height:1;letter-spacing:-.03em;font-size:2rem}` and matching source scroll CTA/scrollbar declarations.
- Earlier focused route CDP probe passed for Home -> About, About -> Work, and Project -> About with `0` runtime exceptions and `0` material network failures.
- Earlier route-batch About scroll, Home output color, and Project media probes passed with `OUT_DIR=/tmp/rd-phase4-route-*`.
- Earlier focused About split/animation CDP probe passed and wrote `/tmp/rd-phase4-about-split-probe/summary.json`.
- Earlier About DOM/modal CDP probe passed and wrote `/tmp/rd-phase4-about-modal-probe/summary.json`.

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

Phase 1, Phase 2, and Phase 3 are closed. Do not reopen them unless a concrete source-owned mismatch appears. The Phase 4 About shell/footer/modal, title/intro/footer animation, route leave/entry lifecycle, scroll CTA/scrollbar, mobile CSS, and auxiliary visual lifecycle batches are also closed.

Recommended next move:

1. Run a cold Phase 4 closeout review across About DOM/CSS, About animation, route lifecycle, and auxiliary WebGL lifecycle.
2. If the closeout review is clean, mark Phase 4 closed and move to Phase 5.
3. Convert only source-backed closeout findings into one scoped fix batch at a time.
4. Keep Phase 1 WebGL, Phase 2 Home interaction, and Phase 3 project route/media probes as regression gates when shared render, router, audio, or lifecycle paths change.
5. Leave broad transitions/audio/Lenis lifecycle cleanup for Phase 5 unless a shared bug blocks Phase 4.

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
- Pages/templates: `src/pages/index.astro`, `src/pages/[slug].astro`, `src/pages/about.astro`, `src/components/Footer.astro`, `src/components/MediaBlock.astro`
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

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
| Active phase | Phase 6 active: final QA/cleanup |
| Phase 1 status | Closed/guarded on 2026-07-07 |
| Phase 2 status | Closed/guarded on 2026-07-07 |
| Phase 3 status | Closed/guarded on 2026-07-07 |
| Phase 4 status | Closed/guarded on 2026-07-07 |
| Current production priority | Run final QA/cleanup on top of closed Phase 1-5 |
| Next secondary priority | Keep Phase 1-5 probes as regression gates when shared paths change |
| Last committed source-backed code batch | Phase 5 audio lifecycle source alignment |
| Last closed evidence batch | Phase 5 audio lifecycle source alignment |
| Local service | Dev server was available at `http://localhost:5173/` during validation; an older static service was also listening at `http://127.0.0.1:5174/` |
| Expected worktree | Clean after each committed batch; dirty means one scoped batch is in progress |

Closeout state:

| Area | State | Current read |
| --- | --- | --- |
| Architecture/lifecycle | Guarded | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | Guarded | Shader surfaces and pass edges are source-shaped; `kA/Lu/I1` has no active Phase 1 mismatch. |
| Final Home visual parity | Guarded | Canvas-only Home distribution and spotlight/thumb transfer are source-guarded; final probe set is clean. |

## Last Closed Batch

The latest production batch closes the Phase 5 audio lifecycle finding.

- Source `lm.addEvents()` binds click and mouseenter from `data-sound-click`; rebuild now gives Home progressbar items the missing `data-sound-click` attribute instead of adding bespoke sound dispatch.
- Source `ln.playHover()`, `playClick()`, `playWoosh()`, `playSoftWoosh()`, and `playPlucks()` only play when `Le.SOUND` is true; rebuild no longer initializes Howler from muted play events.
- Source mobile preloader entry skips `ln.initSounds()`; rebuild mobile entry now produces no audio requests.
- Source `yD.animateIn()` plays plucks once per Home gallery entry; rebuild guards the audio plucks consumer while still allowing the internal Home entry retry needed when WebGL becomes ready after a debug/skip-preloader path.

Earlier Phase 5 batches aligned Lenis/page scroll ownership and transition/nav ownership. Earlier Phase 3 batches aligned project-detail shell/media DOM, source `RD`, `wD`, `CD`, `Ug` scroll behavior, and source router behavior. Phase 1 and Phase 2 remain closed/guarded in `PHASE1_AUDIT.md` and `REBUILD_PLAN.md`.

## Current Evidence

Latest Phase 5 evidence:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `node --check src/client/audio.ts`
- `node --check src/client/main.ts`
- Source audio audit:
  - Source `lm.addEvents()` uses `data-sound-click` to bind both click and mouseenter.
  - Source `ln.initSounds()` owns Howler construction for drones, ambient, hover, click, woosh, plucks, and soft-woosh.
  - Source `iD.onCtaClick()` initializes/toggles/plays click only on non-mobile; `iD.onCta2Click()` only initializes sounds on non-mobile.
  - Source `ln.play*()` methods do not initialize sounds from muted hover/click/woosh/plucks events.
  - Source Home progressbar HTML gives every `.ui-progressbar-item` `data-sound-click`, while source `_D.onListItemClick()` only emits `NAV_CLICK`.
- Static sound role check: generated `dist/index.html` has `10` Home progressbar items and `10` `.ui-progressbar-item[data-sound-click]`.
- Focused audio lifecycle CDP probe on `http://localhost:5173/?disable-webgl`:
  - Desktop sound entry initializes Howler, enables the sound toggle, loads the seven source audio files, and fires one guarded `rd:plucks`.
  - Desktop no-sound entry initializes Howler but leaves sound disabled and fires no `rd:sound-mode`.
  - Mobile entry has pointer coarse, hides the sound toggle, dispatches no `rd:sound-init`/`rd:sound-mode`, and makes `0` audio requests.
  - Runtime exceptions: `0`; console errors: `0`; material loading failures: `0`.
- About/Home/Project regressions passed:
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase5-audio-output-desktop-rerun2 CDP_PORT=9626 node scripts/probe-output-color.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ VIEWPORT=mobile OUT_DIR=/tmp/rd-phase5-audio-output-mobile-rerun2 CDP_PORT=9627 node scripts/probe-output-color.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase5-audio-about-final CDP_PORT=9629 node scripts/probe-about-scroll-opacity.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase5-audio-project-media-final CDP_PORT=9630 node scripts/probe-project-media.mjs`

Previous Phase 5 evidence:

- Source transition/nav audit:
  - Source `BD.onLeave()` emits `WORK_GALLERY_OUT` only when `from[data-view]` is `home`.
  - Source `zD.onLeave()` always emits `WORK_GALLERY_OUT`.
  - Source `HD.onLeave()` only waits `500ms`.
  - Source `OD.init()` calls `Tr.setActive("home")` and `Ar.setActive("home")`.
  - Source desktop nav Work link has `data-slug="home"` in Home, About, and Project HTML.
- Static nav slug check: generated `dist/index.html` and `dist/gc-2026/index.html` Work nav `data-slug` match source `home`.
- Focused transition/nav CDP probe: `/tmp/rd-phase5-transition-nav-probe-rerun/summary.json`
  - Direct Project entry has desktop and mobile Work nav active.
  - About -> Work click does not emit `WORK_GALLERY_OUT`.
  - Browser back from Home -> About emits `WORK_GALLERY_OUT` while current view state is Home.
  - Runtime exceptions: `0`; material network failures: `0`.
- About/Home/Project transition regressions passed:
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase5-transition-about-desktop CDP_PORT=9497 node scripts/probe-about-scroll-opacity.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase5-transition-output CDP_PORT=9498 node scripts/probe-output-color.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase5-transition-project-media CDP_PORT=9499 node scripts/probe-project-media.mjs`
- Source audit:
  - `SD extends sl`
  - `DD extends Ug`
  - `OD extends Ug`
  - `Ug.setScrollSettings(){this.scrollSettings={}}`
  - `Ug.resetScroll(){window.scrollTo(0,0),document.body.scrollTop=0,history.scrollRestoration&&(history.scrollRestoration="manual")}`
  - Source `Ig` defaults include `lerp:.1`, `touchMultiplier:1`, and `wheelMultiplier:1`.
- Focused Lenis ownership CDP probe: `/tmp/rd-phase5-lenis-ownership-probe/summary.json`
  - Home initial: no `window.__rogierPageScroll`.
  - About entry: page scroll controller exists, scroll is `0`, `history.scrollRestoration` is `manual`, and `is-scrolled` is false.
  - About scroll: `is-scrolled` toggles true.
  - Home return: page scroll controller is gone and `is-scrolled` is false.
- `OUT_DIR=/tmp/rd-phase5-lenis-renderer-audit node scripts/audit-renderer-output.mjs`
- About scroll/auxiliary visual lifecycle probes passed on desktop and mobile:
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase5-lenis-about-desktop CDP_PORT=9491 node scripts/probe-about-scroll-opacity.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase5-lenis-about-mobile CDP_PORT=9492 VIEWPORT=mobile node scripts/probe-about-scroll-opacity.mjs`
- Shared WebGL/project regressions passed:
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase5-lenis-output CDP_PORT=9493 node scripts/probe-output-color.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase5-lenis-project-media CDP_PORT=9494 node scripts/probe-project-media.mjs`

Latest Phase 4 closeout evidence remains:

- Parse5 static DOM audit: `.ui-about` subtree diff between source mirror and `dist/about/index.html` returned `diffCount: 0`.
- `OUT_DIR=/tmp/rd-phase4-closeout-renderer-audit node scripts/audit-renderer-output.mjs`
- About scroll/auxiliary visual lifecycle probes passed on desktop and mobile:
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase4-closeout-about-desktop CDP_PORT=9481 node scripts/probe-about-scroll-opacity.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase4-closeout-about-mobile CDP_PORT=9482 VIEWPORT=mobile node scripts/probe-about-scroll-opacity.mjs`
- Shared WebGL regressions passed:
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase4-closeout-output CDP_PORT=9483 node scripts/probe-output-color.mjs`
  - `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase4-closeout-project-media CDP_PORT=9484 node scripts/probe-project-media.mjs`
- Earlier auxiliary lifecycle evidence remains available in `/tmp/rd-phase4-lifecycle-*`.
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

Phase 1, Phase 2, Phase 3, Phase 4, and Phase 5 are closed. Do not reopen them unless a concrete source-owned mismatch appears.

Recommended next move:

1. Run Phase 6 final QA: build, renderer audit, Home desktop/mobile output probes, thumb spotlight, project media, About desktop/mobile, and interactive mouse.
2. Clean up current docs only if they drift from the state above; do not append chronology.
3. Reopen Phase 5 only if focused transition, Lenis, or audio probes expose a concrete source-owned mismatch.
4. Keep Phase 1 WebGL, Phase 2 Home interaction, Phase 3 project route/media, Phase 4 About, and Phase 5 lifecycle probes as regression gates when shared render, router, audio, or lifecycle paths change.

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

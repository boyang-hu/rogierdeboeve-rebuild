# Rebuild Plan

Last updated: 2026-07-07

## Purpose

This file is the forward execution queue. It is ordered by what to do next, not by when discoveries happened.

If a completed item still matters, keep it in a guarded list. Do not preserve old batch notes as a second timeline, and do not copy detailed evidence here from `PHASE1_AUDIT.md`.

| File | Role |
| --- | --- |
| `HANDOFF.md` | Current resume snapshot and immediate next action. |
| `PHASE1_AUDIT.md` | Phase 1 source evidence, guarded edges, blockers, and closeout criteria. |
| `REBUILD_PLAN.md` | Work queue, phase gates, and validation profiles. |

Use git for history. Do not maintain a second timeline here.

## Current Work Order

The current order is intentionally narrow:

1. Keep Phase 1, Phase 2, and Phase 3 closed unless new source-owned evidence requires reopening.
2. Keep Phase 4 closed unless concrete About or auxiliary page evidence requires reopening.
3. Start Phase 5 with a source audit of shared transitions, audio, and Lenis lifecycle behavior.
4. Convert only source-backed Phase 5 findings into one scoped fix batch at a time.
5. Keep Phase 1 WebGL, Phase 2 Home interaction, Phase 3 project-detail, and Phase 4 About probes as regression gates when shared paths change.
6. Move to Phase 6 only after Phase 5 shared lifecycle parity is clean or explicitly guarded.

Everything outside the active phase stays paused unless the audit identifies a shared-path dependency.

## Execution Rules

- Source bundle is the implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Online site is the final visual acceptance baseline: `https://rogierdeboeve.com/`.
- Local mirror is a source oracle with known local-serving rewrites in the JS bundle; do not treat those rewrites as visual product requirements without separate evidence.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- Work in scoped source-backed batches.
- Each completed production batch updates docs, runs validation, and commits code/docs together.
- Commits use `Boyang Hu <i@boyang.hu>` and no AI co-author.

## Phase Gates

| Phase | Status | Gate to advance |
| --- | --- | --- |
| 1. Home WebGL source parity | Closed on 2026-07-07 | Reopen only with concrete source-owned mismatch evidence. |
| 2. Home DOM/interaction parity | Closed on 2026-07-07 | Reopen only with concrete Home DOM, preloader, sound, route, or interaction mismatch evidence. |
| 3. Project detail media/routes | Closed/guarded on 2026-07-07 | Reopen only with concrete project-detail media, scroll, or route mismatch evidence. |
| 4. About and auxiliary pages | Closed/guarded on 2026-07-07 | Reopen only with concrete About DOM, CSS, motion, route lifecycle, or auxiliary visual mismatch evidence. |
| 5. Transitions/audio/Lenis lifecycle | Active | Audit source transitions, Lenis/page scroll lifecycle, and audio lifecycle; patch only source-owned findings. |
| 6. Final QA/cleanup | Pending | Requires Phase 1-5 completion. |

## Phase 1 Closed Record

### Closed: Final Home WebGL closeout audit

Goal: keep the closeout evidence easy to verify and avoid reopening guarded Phase 1 systems without new source-owned evidence.

Current read:

- The prior mid-field brightness residual was source-owned by block color fallback: source uses `colors.blocks || "#000000"`, and rebuild now matches.
- The later page-composite brightness residual was caused by a rebuild-only `.gl::after` dark overlay; source has no matching overlay, and rebuild now removes it.
- Online site is the final visual baseline. Local source mirror remains usable as a source oracle, with known local JS rewrites for service worker, `detect-gpu` benchmark URL, and GPU-check fallback.
- Canvas-only source/rebuild deltas are now close on desktop and mobile after the fallback fix.
- Spotlight/thumb projection transfer is guarded: source-shaped `Lo` raw-to-composite transfer, `SpotLight.map` composite binding, spotlight state, thumb scene state, and active-bounds projection sampling all pass runtime probes.
- Final closeout probes passed for Home desktop/mobile, thumb projection, project media, about desktop/mobile, and interactive mouse.
- The current attribution basis lives in `PHASE1_AUDIT.md`.
- Do not promote a visual tweak into production unless the source path owns it.

Already guarded for this lane:

- Scene and `sceneWrap` hierarchy.
- Home camera surfaces.
- Environment hierarchy/material ownership.
- `u1` environment shader surface: source `l1` fragment and source `c1` vertex.
- Sky composite `V1/H1/z1/B1` target chain, height-based square sizing, post-render `uTime`, delayed repeat `tSky` binding, and source `z1` declared-only uniform behavior.
- Cubemap `scene.environment` loader defaults and sampling fields.
- `p1.addEnvironment()` fire-and-forget cubemap start order before floor/env sceneWrap attachment.
- Renderer constructor clear state: source `qw` has no `setClearColor`, and probes guard default clear color/alpha.
- Floor material inputs, reflection draw-state, reflector camera/renderer state, blur/swap ownership, and target sizing.
- Texture-object await semantics for `nD.animateIn()`.
- Home active CTA desktop visibility as screenshot-noise guard: parent hidden until hover, mobile visible.
- Initial Home entry lifecycle: `SD.init()`-shaped spotlight prep happens before gallery entry, while WebGL active-project reveal waits for gallery entry.
- Active block emissive fallback: `colors.blocks || "#000000"`.
- Spotlight/thumb transfer order, composite map ownership, active-project spotlight state, and 3x3 projection sampling.

Reopen candidates, in order:

1. Home WebGL distribution only if a new capture/probe reveals a source-owned mismatch.
2. Environment/floor or final target distribution only if the evidence points there.
3. Renderer state only if output-color audit guards fail.
4. Spotlight/thumb projection only if transfer, map, or sampling guards fail.

Rules:

- Continue source-backed attribution if Phase 1 is reopened.
- Treat current structural guardrails as closed unless new evidence contradicts them.
- Do not tune horizon, fog, brightness, or floor color by eye.
- Keep detailed findings in `PHASE1_AUDIT.md`; keep this file as the next-action queue.

Closeout validation:

- Build.
- Renderer audit.
- Desktop/mobile output probes.
- Thumb spotlight probe.
- Project media probe.
- About desktop/mobile probes.
- Interactive mouse probe.

### Guarded: Spotlight/thumb projection content and transfer

Goal: keep projected thumb brightness, depth, content transfer, and timing guarded while final closeout proceeds.

Current boundary:

- Shader, light-chunk, and `T1/x1/E1/M1` scene-surface evidence currently looks source-shaped.
- Runtime probe confirms source `Lo` transfer order, `SpotLight.map` composite texture ownership, spotlight state, thumb composite state, and 3x3 projection sampling.
- Do not repeat the already-verified spotlight-map shader/light-chunk path unless new evidence appears.

Required validation:

- Build.
- Renderer audit.
- Desktop/mobile output probes.
- Thumb spotlight probe.
- Project media probe.

## Phase 3 Closed Record

### Closed: Project detail shell/media DOM source alignment

Goal: make project-detail pages structurally source-shaped before deeper scroll and route behavior work.

Current read:

- Source project root is only `div[data-view="project"].ui-project[data-project]`; rebuild no longer adds project-private data attributes or `data-webgl-project`.
- Source `.ui-project-header`, `.c-link` hover shell, `.ui-project-text`, content grid wrappers, info item wrappers, desktop/mobile media roots, next-project wrapper, and scroll CTA grid are now mirrored in the Astro template.
- Source desktop media tracks are empty `[data-media]` elements with `data-media-src`, `data-media-width`, `data-media-height`, and no `data-media-type`.
- Source mobile fallback videos are DOM videos with `autoplay loop muted playsinline` and inline `object-fit: cover; width: 100%; height: 100%;`.
- Source CSS owns the project header/content/media/next geometry and responsive utilities; rebuild-only mobile media shadows, filters, and `data-mobile-media` reveal hooks were removed from the project path.
- Project and next-project WebGL payloads now come from local project data by slug, matching source ownership where DOM exposes only the slug.
- Project-view darkness now uses `darkenDetail`; Home keeps `darkenOverview`.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase3-project-media-probe node scripts/probe-project-media.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173 OUT_DIR=/tmp/rd-phase3-output-color-probe node scripts/probe-output-color.mjs`
- `node scripts/audit-renderer-output.mjs`
- Build-output DOM assertion: 30/30 passed for `gc-2026` and `hashgraph-vc`.

### Closed: Project detail RD/wD/CD scroll-state source alignment

Goal: replace rebuild-only scroll approximations with the source-owned project-detail scroll behavior.

Current read:

- Source `Ug` owns page scroll setup, `html.is-scrolled` at `scroll > 20`, and the page scroll object consumed by project components.
- Source `RD` owns desktop project header fade/translate from page scroll over header height; mobile resets opacity and transform.
- Source `wD` owns the custom scrollbar: fixed-height thumb, source visibility threshold `scroll.limit > innerHeight`, thumb translate from `scroll / limit`, and immediate scroll mapping during pointer drag.
- Source `CD` owns bottom-of-page next-project state switching from `animatedScroll`, `dimensions.scrollHeight`, viewport height, and half the next-project section height.
- Rebuild now sends a source-like Lenis page scroll snapshot through `rd:page-scroll` and exposes immediate page `scrollTo` for source `wD` parity.
- Rebuild no longer uses CSS variables for project header opacity or scrollbar thumb scale/translate.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Temporary CDP runtime probe on `http://127.0.0.1:5173/gc-2026/?skip-preloader&debug-output-probe=1`: `RD` opacity/translate, `wD` thumb translate, and `CD` next/current active state switching all matched source formulas.
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase3-scroll-project-media-probe node scripts/probe-project-media.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173 OUT_DIR=/tmp/rd-phase3-scroll-output-color-probe node scripts/probe-output-color.mjs`
- `node scripts/audit-renderer-output.mjs`

### Closed: Project route behavior source alignment

Goal: close project-detail route behavior against source router transitions before moving to About.

Current read:

- Source router handles same-origin anchors through `ha.onClick`, using `data-transition || false` and not skipping navigation merely because a component called `preventDefault()`.
- Source Home work titles are `div.ui-work-a`; only the CTA anchors own project navigation via `data-transition="project"`.
- Source Home CTA component `gD` calls `preventDefault()` for native click/sound behavior, while the router still navigates the CTA anchor.
- Rebuild now mirrors that split: Home work titles are non-links, CTA click no longer mutates active project state, and global router navigation still runs for source-owned CTA clicks.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Focused CDP route probe: project next/default -> `/following-wildfire/`; project back `data-transition="work"` -> `/`; project nav About/default -> `/about/`; Home CTA `data-transition="project"` -> `/hashgraph-vc/` with `is-work-gallery-leaving` only during Home leave.
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase3-route-project-media-probe CDP_PORT=9420 node scripts/probe-project-media.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173 OUT_DIR=/tmp/rd-phase3-route-output-color-probe CDP_PORT=9421 node scripts/probe-output-color.mjs`
- `node scripts/audit-renderer-output.mjs`

Phase 3 closeout state:

- Project shell/media DOM is source-shaped.
- Project page scroll, scrollbar, header fade, and next-project color/WebGL state are source-shaped.
- Project route behavior is source-shaped for project-to-project, project-to-Home, project-to-About, and Home CTA project entry.
- Reopen Phase 3 only with concrete source-owned mismatch evidence.

## Phase 4 Closed Record

Goal: keep About and auxiliary pages closed at the same source-backed standard as Home and project-detail pages.

### Closed: About shell/footer/credits modal source alignment

Goal: replace the rebuild-only simplified About shell with source-shaped About structure and modal behavior before deeper transition and animation work.

Current read:

- Source About root is `div[data-view="about"].ui-about`; rebuild now matches.
- Source About shell includes source-shaped hero, intro with `data-split-articles`, collaborations, recognition list sections, contact, scroll CTA, scrollbar, footer credits trigger, and credits modal.
- Footer credits are About-only; Home and project footers have no credits trigger and no `.ui-footer-credits`, matching source page ownership.
- Source modal `AD` stops page scroll, creates Lenis on the modal wrapper/content, fades in, then reverses that lifecycle on close; rebuild now mirrors those observable behaviors.
- Source CSS-backed About/footer/list/modal geometry replaced the earlier simplified About spacing and global mobile footer hide rule.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173/about/ OUT_DIR=/tmp/rd-phase4-about-scroll-probe CDP_PORT=9430 node scripts/probe-about-scroll-opacity.mjs`
- Focused About DOM/modal CDP probe: `/tmp/rd-phase4-about-modal-probe/summary.json`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173/ OUT_DIR=/tmp/rd-phase4-output-color-probe CDP_PORT=9433 node scripts/probe-output-color.mjs`
- `OUT_DIR=/tmp/rd-phase4-renderer-audit node scripts/audit-renderer-output.mjs`

### Closed: About title/intro split and footer animation source alignment

Goal: replace rebuild-only generic About content motion with source-shaped split-text and footer reveal behavior.

Current read:

- Source `mD` splits `[data-split-articles]` paragraphs into `.line > .line-inner`; rebuild now does the same for About intro paragraphs and resplits on resize.
- Source `DD.animateIn()` reveals the About title and intro paragraph line inners with `opacity`, `y`, `duration`, `delay`, `stagger`, and `expo.out` timing; rebuild now mirrors those observable animation contracts.
- Source `Rg/Ou` initialize title and footer spans at `translateY(102%)`; rebuild CSS now owns those initial transforms and rebuild no longer applies a generic `.ui-about-intro > *, .c-list-section` reveal.
- The split implementation is intentionally scoped to `.ui-about [data-split-articles]` because it rebuilds paragraphs from `textContent`; do not broaden it without a DOM-preserving splitter.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Focused About split/animation CDP probe: `/tmp/rd-phase4-about-split-probe/summary.json`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173/about/ OUT_DIR=/tmp/rd-phase4-split-about-scroll-probe CDP_PORT=9442 node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173/ OUT_DIR=/tmp/rd-phase4-split-output-probe CDP_PORT=9443 node scripts/probe-output-color.mjs`
- `OUT_DIR=/tmp/rd-phase4-split-renderer-audit node scripts/audit-renderer-output.mjs`

### Closed: About route leave/entry lifecycle source alignment

Goal: close the About route entry/leave queue item against source router and view lifecycle behavior.

Current read:

- Source `Sg.leave()` calls the current view `onLeave()` before transition leave; source `sl.onLeave()` fades the view and calls component `animateOut` hooks.
- Source `BD` default transition emits `WORK_GALLERY_OUT` only when leaving Home, waits `500ms`, then enters the next view after `100ms` and emits `ANIMATE_IN`.
- Source `zD` project transition always emits `WORK_GALLERY_OUT`; source `HD` work transition only waits and enters.
- Rebuild now runs current view component leave from the unified router path, not from page-local link handlers.
- About visual/floating leave is now covered for About header/nav links, page links, and popstate paths.
- Project visual leave is now covered for project header/nav links, project page links, and popstate paths.
- Home work-gallery out remains transition-mode owned for Home/default and project CTA paths.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Focused route CDP probe:
  - Home -> About, About -> Work, and Project -> About all reached the expected path/view/html class.
  - About visual became visible on About entry and false after About -> Work.
  - Runtime exceptions: `0`.
  - Material network failures: `0`; canceled project media loads during navigation were filtered as expected media aborts.
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173/about/ OUT_DIR=/tmp/rd-phase4-route-about-scroll-probe CDP_PORT=9447 node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173/ OUT_DIR=/tmp/rd-phase4-route-output-probe CDP_PORT=9448 node scripts/probe-output-color.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase4-route-project-media-probe CDP_PORT=9449 node scripts/probe-project-media.mjs`

### Closed: About scroll CTA, scrollbar, and mobile CSS source alignment

Goal: close the About scroll CTA, custom scrollbar, and mobile layout queue item against source CSS and source `wD/Ug`.

Current read:

- Source scroll CTA is fixed at the viewport bottom, fades by `html.is-scrolled .c-scroll-cta{opacity:0}`, and is hidden below `1000px`; rebuild CSS already matched.
- Source scrollbar is fixed at `left: var(--px)`, hidden below `1000px`, uses a `0.125rem` track/thumb, and source `wD` maps pointer drag immediately through page scroll; rebuild CSS/JS already matched the observable behavior.
- Source `Ug` toggles `html.is-scrolled` at `scroll > 20`; rebuild already matched through `initScrollState()`.
- Source mobile About contact title uses `.ui-about-contact .ts-2{line-height:1;letter-spacing:-.03em;font-size:2rem}`; rebuild now matches after replacing the rebuild-only `letter-spacing: 0`.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://127.0.0.1:5173/about/ OUT_DIR=/tmp/rd-phase4-mobile-layout-about-probe CDP_PORT=9450 VIEWPORT=mobile node scripts/probe-about-scroll-opacity.mjs`

### Closed: About auxiliary visual lifecycle source alignment

Goal: close the remaining About auxiliary WebGL lifecycle edge against source `TD` and `Fg`.

Current read:

- Source `TD.animateOut()` kills the current out animation, tweens `aboutBlocks.uReveal` to `0`, hides About blocks on complete, tweens `uRevealSpread` to `1`, and sets spotlight intensity to `0`.
- Source `Fg.animateOut()` tweens floating blocks `uReveal` to `0`, hides floating blocks on complete, and tweens `uRevealSpread` to `0`.
- Source `TD.destroy()` owns the heavier cleanup: remove About RAF, clear About track, restore `spotLightParallax`, and remove character rotatable events.
- Rebuild now mirrors that ownership split: `animateAboutVisualOut()` only performs the source animate-out reveal/intensity work, while `destroyAboutVisualState()` keeps timers, RAF, track, rotatable event, and parallax cleanup.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `OUT_DIR=/tmp/rd-phase4-lifecycle-renderer-audit node scripts/audit-renderer-output.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase4-lifecycle-about-scroll-probe-localhost-rerun2 CDP_PORT=9475 node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase4-lifecycle-about-scroll-mobile-probe-localhost CDP_PORT=9472 VIEWPORT=mobile node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase4-lifecycle-output-probe-localhost CDP_PORT=9473 node scripts/probe-output-color.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase4-lifecycle-project-media-probe-localhost CDP_PORT=9474 node scripts/probe-project-media.mjs`

### Closed: Phase 4 closeout DOM/source review

Goal: close the remaining About surface by diffing rebuild DOM against the mirrored source About document and keeping only source-owned fixes.

Current read:

- Static `.ui-about` parser diff against `legacy-mirror/public/about/index.html` is `0`.
- The closeout review removed a rebuild-only `data-about-model` attribute on `.ui-about-hero-visual`.
- The rebuild now preserves the source trailing `<br>` in the brands paragraph.
- Source scroll CTA wrappers are `div.c-scroll-cta-icon` and `div.c-scroll-cta-text`; rebuild now matches.
- Rebuild-only `aria-hidden` attributes were removed from About-local scrollbar and modal icons.
- Source SVG attributes for the checked About-local icons, including `xmlns`, `xml:space`, `ry`, and `stroke-width`, are now mirrored.
- Reopen Phase 4 only with concrete About or auxiliary-page evidence.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Parse5 static DOM audit: `.ui-about` subtree diff between source mirror and `dist/about/index.html` returned `diffCount: 0`.
- `OUT_DIR=/tmp/rd-phase4-closeout-renderer-audit node scripts/audit-renderer-output.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase4-closeout-about-desktop CDP_PORT=9481 node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase4-closeout-about-mobile CDP_PORT=9482 VIEWPORT=mobile node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase4-closeout-output CDP_PORT=9483 node scripts/probe-output-color.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase4-closeout-project-media CDP_PORT=9484 node scripts/probe-project-media.mjs`

## Phase 5 Active Queue

Goal: close shared transition, scroll, and audio lifecycle behavior against the source bundle before final QA.

### Closed: Lenis/page scroll ownership source alignment

Goal: align page Lenis creation, reset, and `is-scrolled` ownership with source `Ug` instead of applying page scroll lifecycle globally.

Current read:

- Source Home `SD extends sl`, not `Ug`; Home has no source-owned page Lenis controller.
- Source About `DD extends Ug` and Project `OD extends Ug`; About/Project own page Lenis, scrollbar state, and `is-scrolled` through `Ug/wD`.
- Source `Ug.setScrollSettings()` returns `{}` and source `new Ig(this.scrollSettings)` therefore uses source Lenis defaults.
- Source `Ig` defaults include `lerp: .1`, `wheelMultiplier: 1`, and `touchMultiplier: 1`; rebuild removed the previous custom `0.09/0.9/1.2` values.
- Source `Ug.resetScroll()` runs before `initScroll()` and sets `history.scrollRestoration = "manual"`; rebuild now mirrors that before creating About/Project page scroll.
- Source `Ug.destroy()` destroys page scroll and removes `is-scrolled`; rebuild now clears the page scroll controller and `is-scrolled` on teardown.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Focused Lenis ownership CDP probe: `/tmp/rd-phase5-lenis-ownership-probe/summary.json`
- `OUT_DIR=/tmp/rd-phase5-lenis-renderer-audit node scripts/audit-renderer-output.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase5-lenis-about-desktop CDP_PORT=9491 node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase5-lenis-about-mobile CDP_PORT=9492 VIEWPORT=mobile node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase5-lenis-output CDP_PORT=9493 node scripts/probe-output-color.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase5-lenis-project-media CDP_PORT=9494 node scripts/probe-project-media.mjs`

### Closed: Transition/nav ownership source alignment

Goal: align remaining shared transition/nav ownership with source `BD`, `zD`, `HD`, `OD`, `Tr`, and `Ar`.

Current read:

- Source desktop Work nav uses `data-slug="home"` in Home, About, and Project HTML; rebuild now matches.
- Source Project view `OD.init()` calls `Tr.setActive("home")` and `Ar.setActive("home")`; rebuild now activates Work nav on direct and routed Project entry.
- Source `BD.onLeave()` emits `WORK_GALLERY_OUT` when the leaving view is Home; rebuild now preserves that behavior for click and popstate default-transition paths.
- Source `zD.onLeave()` always emits `WORK_GALLERY_OUT`; rebuild keeps that project-transition behavior.
- Source `HD.onLeave()` only waits `500ms`; rebuild keeps work transition free of `WORK_GALLERY_OUT`.

Validation passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Static nav slug check against source Home/Project HTML.
- Focused transition/nav CDP probe: `/tmp/rd-phase5-transition-nav-probe-rerun/summary.json`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/about/ OUT_DIR=/tmp/rd-phase5-transition-about-desktop CDP_PORT=9497 node scripts/probe-about-scroll-opacity.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173/ OUT_DIR=/tmp/rd-phase5-transition-output CDP_PORT=9498 node scripts/probe-output-color.mjs`
- `CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc OUT_DIR=/tmp/rd-phase5-transition-project-media CDP_PORT=9499 node scripts/probe-project-media.mjs`

### Next Phase 5 Queue

Patch only source-owned findings:

1. Audit audio lifecycle against source `ln` and `lm`: route rebinding, hover/click/woosh ownership, visibility pause/resume, and sound-enabled state.
2. Reopen transition/nav only if focused route probes expose a concrete source-owned mismatch.
3. Reopen Lenis/page scroll only if focused ownership or About/Project scroll probes expose a concrete source-owned mismatch.
4. Validate each batch with build, route assertions, output state probes, and About/project/Home regression probes for shared paths.

## Watchlist

### Phase 2 Home DOM/interaction parity

This phase is closed and guarded as of 2026-07-07.

Closed boundary:

- Keep Phase 1 WebGL probes as regression gates.
- Home DOM state, interaction affordances, and route-level user-visible behavior are guarded.
- Do not reopen WebGL source parity unless a future finding identifies a concrete shared-path mismatch.

Audit evidence:

- File: `/tmp/rd-phase2-home-audit/home-dom-interaction-audit.json`.
- Latest preloader/mobile DOM audit: `/tmp/rd-phase2-home-audit-mobile-final2/home-dom-interaction-audit.json`.
- Online and rebuild had `0` network failures and `0` runtime exceptions in checked Home desktop/mobile scenarios.
- Wheel input and second work-item click both moved active project from `hashgraph-vc` to `gc-2026` in online and rebuild.
- Therefore the first Phase 2 production batch should not start with gallery scroll algorithm changes.
- The latest DOM audit used `?disable-webgl` because the temporary audit runner disables GPU; use output probes for WebGL/visual coverage.
- Latest WebGL output probes passed for desktop `/tmp/rd-output-p2-preloader-desktop` and mobile `/tmp/rd-output-p2-preloader-mobile`.

Closed source-backed batches:

1. Mobile nav shell.
   - Source owns `.ui-header-mobile lg:hidden`, `.ui-nav-mobile`, and `.ui-nav-mobile-toggle > .wrap > svg`.
   - Done: rebuild now uses the source shell; final audit matched mobile toggle rect `104x56` at `x=286,y=31`, desktop hidden rect `0x0`, and mobile menu content opacity `1` when open.
2. Sound toggle shell.
   - Source owns the `28x28` `.ui-sound-toggle` div/SVG, z-index `200`, opacity `1` after enter, hover ring, and source-shaped rect bars.
   - Done: rebuild now uses the source shell and `.is-active` state; final audit matched `28x28`, z-index `200`, opacity `1`, and source class state after entry.
3. Preloader.
   - Source owns `div.preloader-cta[data-sound]`, `div.preloader-cta-2[data-sound]`, progress opacity/transform animation, delayed pointer activation, and no active work item before enter.
   - Done: rebuild now uses the source-shaped DOM/CTA/data-sound structure, delayed CTA activation, source reveal path, WebGL-ready gate, and no pre-enter active work item.
4. Mobile work list/title CSS.
   - Source keeps `.ui-title` hidden by visibility/pointer behavior on mobile and handles inactive mobile cards mainly through link opacity/pointer state.
   - Done: rebuild now keeps the title in layout but hidden, keeps cards opaque, hides inactive links through opacity/pointer state, and leaves the active CTA interactive.
5. Sound choice and audio lifecycle.
   - Source `ln` starts sound disabled, lazily creates Howler `ambient`, `drones`, `hover`, `click`, `woosh`, `plucks`, and `softWoosh`, fades ambient/drones only after sound opt-in, and animates `.ui-sound-toggle-rects` from runtime intensity.
   - Done: rebuild now uses source-shaped Howler setup, no `Howler` global mute shim, no stored sound preference, source fade volumes/timing, visibility pause/resume, and route re-binding for new `[data-sound-click]` items.
6. Preloader sound choice.
   - Source sound CTA on non-mobile runs `ln.initSounds()`, `ln.toggleSound()`, then `ln.playClick()`; no-sound CTA only initializes sounds; mobile skips sound init/toggle and hides the second CTA.
   - Done: rebuild now follows that event order, keeps `?skip-preloader` only as an explicit audit hook, and never skips the preloader from session state.
7. Route/runtime Home state.
   - Source uses runtime-only `Qe.currentProject` and `Qe.workState`; there is no `sessionStorage` or `localStorage` for preloader entry, sound choice, or work state.
   - Done: rebuild now stores Work state only in module runtime memory during SPA route transitions, restores `gc-2026` after Home -> About -> Home, and resets to a fresh preloader after a full reload.
8. Remaining Home interaction affordances.
   - Source Work CTA click prevents navigation and plays click sound; progress click prevents default; arrow-key handling advances the gallery without source-owned `preventDefault`.
   - Done: rebuild now matches these Home interaction details and keeps sound items rebound after route DOM replacement.

Phase 2 reopen queue:

1. Reopen sound/preloader only if online/source evidence contradicts the guarded `ln`/`iD` behavior.
2. Reopen Home route state only if an SPA transition fails to preserve active Work state or a full reload incorrectly preserves it.
3. Reopen Home interactions only with a concrete source-owned mismatch in Work list, progressbar, keyboard, touch/drag, mobile menu, header, or footer behavior.

Original audit checklist:

- Home DOM structure and text against online/source.
- Header, nav, mobile menu, and footer visible states.
- Preloader and sound-choice flow.
- Work list active state, CTA visibility, progress bar, and pointer affordances.
- Wheel, keyboard, touch, drag, hover, and click behavior.
- Home-to-project/about route behavior and state restoration.
- Howler sound event timing only where source behavior is observable or source-owned.

Latest validation:

- `node --check src/client/main.ts`
- `node --check src/client/audio.ts`
- `node --check src/client/webgl.ts`
- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Desktop CDP state audit on `http://127.0.0.1:5174/?disable-webgl`: fresh preloader present, sound opt-in activates toggle, no-sound entry leaves toggle inactive, full reload shows preloader again, no `rd:has-entered`/`rd:sound-enabled`/`rd:work-state` session keys, Home -> About -> Home restores `gc-2026`, and checked failures/exceptions are `0`.
- Mobile touch-emulated CDP state audit on `http://127.0.0.1:5174/?disable-webgl`: `(pointer: coarse)` true, second CTA hidden, sound toggle hidden, Enter does not activate sound, no session keys.
- Phase 2 shell audit: `/tmp/rd-phase2-home-audit-after-shell-final/home-dom-interaction-audit.json`
- Phase 2 preloader/mobile DOM audit: `/tmp/rd-phase2-home-audit-mobile-final2/home-dom-interaction-audit.json`
- Home output probes after shell batch: desktop `/tmp/rd-output-p2-shell-desktop`, mobile `/tmp/rd-output-p2-shell-mobile`
- Home output probes after preloader/mobile batch: desktop `/tmp/rd-output-p2-preloader-desktop`, mobile `/tmp/rd-output-p2-preloader-mobile`

### `kA/Lu/I1` composite and transfer

Use this only if new evidence contradicts the current audit.

Current boundary:

- Source `I1.renderToScreen=true` renders C1 directly to screen.
- `renderTargetComposite` is unused for the default visible Home path.
- Source `nD` binds C1 `tWork`, `tMedia`, and initial work mouse-simulation texture once after the delayed resize/bind phase.

### Interaction/mouse/fluid

Use this when a batch touches mouse/fluid paths or when a specific interaction regression is isolated.

Current boundary:

- Existing `Ka`, `ag`, and `qT` guardrails remain active.
- Run `scripts/probe-interactive-mouse.mjs` for mouse/fluid path changes.

## Non-Goals For The Active Phase

- Do not make production edits before a source-backed finding is isolated.
- Do not reopen Phase 1 WebGL systems for DOM or interaction differences without a concrete shared-path mismatch.
- Do not introduce screenshot-driven tuning.
- Do not refactor inactive phases unless active-phase evidence points to a shared owner.
- Do not treat local mirror JS rewrites as product behavior without checking the online site or original source ownership.

## Validation Profiles

Docs-only cleanup:

```sh
git diff --check
```

Default rendering batch:

```sh
node --check src/client/webgl.ts
node --check scripts/dump-va-shader.mjs
node --check scripts/audit-renderer-output.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-phase1-audit.json
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Browser probes while a local server is active:

```sh
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
node --check scripts/probe-output-color.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-output CDP_PORT=9301 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-output-color.mjs
node --check scripts/probe-thumb-spotlight.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-thumb CDP_PORT=9302 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-thumb-spotlight.mjs
node --check scripts/probe-project-media.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-media CDP_PORT=9303 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-project-media.mjs
```

Add when relevant:

```sh
node --check scripts/probe-about-scroll-opacity.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-about CDP_PORT=9304 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-about-scroll-opacity.mjs
node --check scripts/probe-interactive-mouse.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-mouse CDP_PORT=9305 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-interactive-mouse.mjs
```

Known blocked check:

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

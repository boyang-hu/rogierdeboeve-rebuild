# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-19

## Purpose

This is the resume sheet for the rebuild. Keep it current-only: replace stale details instead of appending chronology. Use git history for older batch notes.

| Need | Read |
| --- | --- |
| Resume current work | `HANDOFF.md` |
| Check Phase 1 source evidence and guarded WebGL edges | `PHASE1_AUDIT.md` |
| Decide execution order after a new finding | `REBUILD_PLAN.md` |
| Inspect old document states | `git log --oneline` and `git show <commit>:<file>` |

## Current Snapshot

| Item | Value |
| --- | --- |
| Active production phase | None |
| Overall status | Phase 1 through Phase 6 are closed/guarded; latest post-phase source parity batch closed 2026-07-19 |
| Latest closed batch | Open-items closure: character K1 composite pass (contrast 1.65 + saturation .5) and ts-split source CSS |
| Last source-backed code batch | Same batch (2026-07-19); three earlier same-day batches (about backdrop, about parity, preloader) |
| Current priority | Do not patch unless a new source-owned mismatch is isolated |
| Local service | Dev server is listening at `http://localhost:5173/`; older static service is also listening at `http://127.0.0.1:5174/` |
| Expected worktree | Clean after the Phase 6 docs commit |

## Phase Status

| Phase | Status | Reopen only when |
| --- | --- | --- |
| Phase 1: Home WebGL source parity | Closed/guarded | A concrete Home WebGL, renderer, projection, or interaction mismatch is traced to source ownership. |
| Phase 2: Home DOM/interaction parity | Closed/guarded | A concrete Home DOM, preloader, sound, route, or interaction mismatch is found. |
| Phase 3: Project detail media/routes | Closed/guarded | A concrete project-detail media, scroll, route, or next-project mismatch is found. |
| Phase 4: About and auxiliary pages | Closed/guarded | A concrete About DOM, CSS, motion, route, modal, or auxiliary visual mismatch is found. |
| Phase 5: Transitions/audio/Lenis lifecycle | Closed/guarded | A concrete transition, audio, or page-scroll lifecycle mismatch is found. |
| Phase 6: Final QA/cleanup | Closed/guarded | Final regression gates fail or docs drift from current state again. |

## Latest Evidence

### 2026-07-19 Open-items closure batch

- Character `K1` composite restored (`webgl.ts`): the character scene now renders to `characterRawTarget` (depth-buffered — the documented live-baseline divergence moved here) and is composited into `characterTarget` through a new `Y1`-equivalent material (fragment mirrors source `q1`: `contrast(rgb, 1.65)` then `saturation(rgb, .5)`, tonemapping include inert under `toneMapped:false`, unused `tBloom/tFluid/tBlur/tMouseSim` + bool uniforms carried for constructor parity; vertex = source `el` == `sourceMatrixFullscreenVertex`). The spotlight keeps projecting `characterTarget.texture`. Head highlights now read desaturated/high-contrast like live.
- `.ts-split` block copied verbatim into `global.css`. Attribution: the class appears only in the source CSS bundle — zero hits in the JS bundle and mirror HTML — so it is dead code that never renders on live; no runtime trigger exists to reproduce.

### 2026-07-19 Sitewide color audit batch

- Declaration-level diff of `color`/`opacity`/`background` between the bundle CSS and `global.css` (same script approach as the typography audit). Net result: one real divergence — `.ui-nav-a` opacity was 0.45 vs source `var(--opacity-dimmed)` (0.6); fixed. Every other reported gap resolved to equivalent rebuild selectors (`.social-a` vs `.ui-footer-socials a`, `.c-button-bg-hover` vs `.c-button-bg .c-button-bg-hover`, about `.ts-m` section variants) or to selectors absent from the mirror markup (`.ts-m-link-inner`, `.ui-footer-secondary`).
- Horizon check closed: fresh live-vs-local about captures compared by row-luminance profile match within ±3 grey levels; no camera-pitch divergence exists (the earlier seam was the unrendered floor reflection, fixed previously).

### 2026-07-19 Header/floating/route-rebuild batch

- Header colors: invented `color: var(--muted)` on `.ui-header-secondary/.ui-header-version/.ui-header-availability` and `.ui-title` replaced with the source model — `.c-color` inline color (JS `setMainColor`, already implemented) plus `.ui-header-secondary{opacity:var(--opacity-dimmed)}` and `.ui-title{opacity:var(--opacity-dimmed)}`.
- V-004 is no longer clickable: removed invented `.ui-header a/button{pointer-events:auto}`; source re-enables only `.ui-header-name` via JS (already present) and `.ui-nav-mobile-toggle{pointer-events:all}` covers the mobile toggle.
- `CREATIVE DEVELOPER` / `AVAILABLE FOR FREELANCE` now reveal only on the home view (source calls `Ki.animateDescriptionIn/AvailibilityIn` solely from the home view's `animateIn`); on about/project they stay masked, matching live.
- About floating blocks were invisible because the rebuild replaced source's signed modulo (`pz % 250 + 10`, mostly negative z into the scene) with a positive modulo (all z in front of/behind the camera); restored source `ZA.positionOnUpdate` math including its seed indexing (`colors[n]`, `colors[n*2]`).
- Direct about/project loads then routing to home showed no work gallery: `createWorkScene()` only ran in the constructor from `[data-project-card]` DOM. `ensureWorkScene()` now rebuilds it on home entry (`prepareHomeVisualState`/`initHomeSpotlight`) when items are missing — source is data-driven (`is.getProjects()`) and never has this gap.
- Validated: swap capture `/tmp/rd-swap-test` (about direct load -> Work click -> full gallery), about capture with drifting blocks + hidden availability, and the five regression gates (`/tmp/rd-c-*`).

### 2026-07-19 About background/character follow-up batch

- Double-face fix: the character render target now has a depth buffer, so the head occludes its far side when rotated. Documented divergence: the bundle's `Lu` targets are literally `depthBuffer:false`, but the live baseline visibly occludes the back of the head; the live site is the acceptance baseline, so depth stays on (`characterTarget = makeSourceRenderTarget(true)`).
- About background restored: `sceneWrap` (which parents `blocksWrap` + `floorGroup` + `environmentGroup`, matching source `p1.sceneWrap`) was hidden whenever home work items were absent, so about pages had no fog dome/floor at all and the drifting `floatingBlocks` had no lit backdrop. Source never hides `sceneWrap`; the tick now derives `sceneWrap.visible` from `workItems.length > 0 || aboutBlocks/floatingBlocks visible`, which also restores the floor reflection on about (the previous hard floor/dome seam came from the black, never-rendered reflection). Hierarchy stays source-shaped (home output probe asserts it). About lighting config verified to already match source `xt` (`#bcbcbc` main color, darken .2, saturation .35, contrast 1.1, ambient `#000000`@1, directional 5, spotlight 270).
- Sitewide typography audit (declaration-level diff of bundle CSS vs `global.css`): base `html{font-size:min(4.26667vw,16px);font-weight:400}` restored; `.c-list-section-title` letter-spacing `-.03em` (+`-.01em` mobile, later `line-height:1.1rem` override); `.ui-nav-a-title` `-.03em`/weight 400; `.c-button-text` mono typography block (`.75rem`/700/uppercase/`.04em`) restored.
- Validated: build; home desktop output (`/tmp/rd-bg-home2`), about (`/tmp/rd-bg2-about`), project media (`/tmp/rd-bg2-media`), thumb spotlight (`/tmp/rd-bg2-thumb`), preload-state (`/tmp/rd-bg2-preload`) — all failures empty. Live-vs-local captures: `/tmp/rd-about-live` vs `/tmp/rd-about-local8`.

### 2026-07-19 About-page parity batch

Reported symptoms: character block-matrix look/rotation wrong, a background animation missing, fonts inconsistent. All fixes attributed to the source bundle/CSS/origin assets first:

- Typography (`global.css`): base `.ts-1/.ts-2/.ts-3/.ts-p` restored to source (`letter-spacing:-.03em`, `.ts-1` 2rem base + 2.25rem@1000 + 2.625rem@1280, `.ts-p` mobile `1rem/1.625/-.01em`, `.ts-2>span`, `.ts-p br` rules); root `font-size: clamp(...)` scoped to `min-width:1000px` (source top-level uses browser default); invented mobile `html{16px}`/`.ts-*` overrides removed. Font binaries verified byte-identical to origin `/fonts/*` (mirror never captured them). Live/local heading+paragraph line wraps now match.
- Character scene (`webgl.ts`): camera restored to source `Iu` default (FOV 55, pos `(0,0,5)`, near 1 far 2000; was invented FOV 30 @ z=12); lights restored to source `J1` (Ambient `#fff` 5, Directional `#ff9d00` 3 @ `(2,-1,-1)`, Directional `blue` 2 @ `(-1,1,0)`; was white 1.2/2.5); scene background black (linear->sRGB); `me.gltf` used as-is per source `eD` (`gltf.scene.children[0]`, no rotation flip / bounding-box normalize / recenter — origin model ships intrinsic scale 31.17); body group position `(0,-.05,0)`, scale 0.125 initial, resize `>=1000 ? 0.145 : 0.085`. Model/texture files verified byte-identical to origin.
- About direct-load rendering (`webgl.ts` tick): work scene render was gated on `sceneWrap.visible` (home work items exist), so a direct `/about/` load rendered a black canvas (nav-from-home worked, which masked it). Gate now also passes when `aboutBlocks`/`floatingBlocks` groups are visible — source `nD.update` renders all scenes every frame.

Resolved in later same-day batches: about backdrop brightness (sceneWrap visibility), floating-block drift (signed modulo), and the floor/dome horizon (floor reflection gate) — a 2026-07-19 row-luminance comparison of live vs local about (`/tmp/rd-about-live/t2.png` vs `/tmp/rd-about-local9/t2.png`) matches within noise, so the earlier "camera pitch" suspicion is closed. Both remaining open items closed by the open-items batch: the character render now runs the source `K1`/`Y1` composite pass (raw scene target -> `q1` grade: `contrast(rgb, 1.65)` + `saturation(rgb, .5)` + inert tonemapping include, all bool passes false; depth-buffer divergence now lives on the raw target only), and the `.ts-split` CSS block is carried verbatim — attribution showed it is dead code in the source (present only in the CSS bundle; zero references in the JS bundle or mirror HTML, so it never renders live; no JS trigger is reproduced).

Validated with: build; home desktop output probe (`/tmp/rd-ab-home`), about probe (`/tmp/rd-ab-about`), project media probe (`/tmp/rd-ab-media`), thumb spotlight probe (`/tmp/rd-ab-thumb`); side-by-side live-vs-local headless captures (`/tmp/rd-about-live`, `/tmp/rd-about-local4`) via scratchpad `capture-about.mjs` — head now renders with source lighting and auto-rotates ~1 rad/s on direct load.

### 2026-07-19 preloader entry-sequence batch

The preloader batch was validated against `http://127.0.0.1:5173/` (static `serve.mjs` over a fresh `dist/`). Reported symptom: during preload, the whole home UI (work list, INDEX title, nav, footer, header description/availability) was already visible. Source model (attributed before patching): mirror ships `<body style="opacity: 0;">` cleared by the preloader's `init` (`document.body.style=""`); CSS defaults keep everything masked (`.ui-main [data-view]{opacity:0}`, `.ui-header-secondary .ts-m>*` at `102%`, part-inners at `130%`, `.ui-nav-a-inner` at `102%`, `.ui-nav-mobile{opacity:0}`); during preload only `Ki.animateVersionIn()`, `Ki.animateNameIn()`, and the canvas `J.animateIn()` run; everything else waits for the Enter click (`ANIMATE_IN` -> view `animateIn` 0.5s linear fade + `Tr`/`Ar` nav + description/availability + title/footer/work reveals).

Batch changes:

- `BaseLayout.astro`: body ships `style="opacity: 0;"`; `initPreloader` clears it (source `iD.init`).
- `main.ts`: `is-ready` no longer added at boot; `reveal()` adds `is-ready`/`has-entered` and dispatches `rd:animate-in` (source `ANIMATE_IN`); skip-preloader path adds both; header version/name tweens run inside the preloader's 100ms timer (source `initLoader`); mobile-nav fade and `initViewLifecycle` first-load view fade now wait for `rd:animate-in`; `webgl.animateIn()` fires when the instance is created so the canvas fades in during preload (source `J.animateIn` at `LOAD_START`).
- `motion.ts`: invented header-container tween removed; intro animations (nav, description, availability, title, footer, work links, about intro, project header) deferred to `rd:animate-in` on first load, immediate on route swaps; on swaps the replaced header's version/name are `gsap.set` to their post-preload state.
- `Header.astro`: version restored to mirror DOM (`div.ui-header-version.ts-m > a.c-color`); name uses `part-outer/part-inner` pairs; availability column split into mirror's outer grid div + inner `div.ui-header-availability.ts-m.c-color` with a bare `part-inner` (no outer); desktop nav icon moved inside `.ui-nav-a-inner` (mirror) so the mask hides it pre-enter.
- `global.css`: added source rules `.ui-header-secondary .ts-m{overflow:hidden}` + `.ui-header-secondary .ts-m>*{...translateY(102%)}`, nav icon `left:-1.25rem` + staggered `rect` transitions; removed invented `.ui-nav-a-inner{opacity:0}` and icon width/height.

Known intentional divergences kept: nav markup stays `ul/li` (mirror uses `div.ui-nav-items/.ui-nav-item` grid), nav `is-active` is server-baked (source sets it via JS `updateNavActive`), and the mirror's stray empty `<span><span></span></span>` artifacts inside name/description part-inners are not reproduced.

Static/build checks:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` (17 pages; `dist/404.html` still byte-identical to `dist/index.html`)
- `OUT_DIR=/tmp/rd-pre-renderer node scripts/audit-renderer-output.mjs`

Fresh browser probes (all `failures: []`, no exceptions/console messages):

- Home desktop output: `/tmp/rd-pre-home-desktop2/summary.json` (`PROBE_WAIT=25000`)
- Home mobile output: `/tmp/rd-pre-home-mobile2/summary.json` (`VIEWPORT=mobile PROBE_WAIT=45000`)
- About: `/tmp/rd-pre-about/summary.json`; project media: `/tmp/rd-pre-media/summary.json`
- Preload-state probe (session scratchpad `probe-preload-state.mjs`, `/tmp/rd-pre-preload-state/`): pre-enter asserts body style cleared, no `is-ready`, `[data-view]` opacity 0, nav/mobile-nav/description/availability hidden, version+name animated in; post-enter asserts full reveal. Screenshots `before-enter.png`/`after-enter.png` match the source's preload composition (V-004 + name + WebGL backdrop + loader only).

Probe timing note: on a real-GPU machine (tier 3, main fluid enabled) the gallery-entry `mouseFactor` tween has not reached its steady value at the default `PROBE_WAIT=5200`; the same assertion passes with `PROBE_WAIT=25000` (desktop) / `PROBE_WAIT=45000` (mobile emulation). This is probe timing, not a product mismatch. The Phase 6 baseline ran under SwiftShader tier 1.

## Source Of Truth

- Final visual acceptance baseline: `https://rogierdeboeve.com/`.
- Implementation source bundle: `legacy-mirror/public/assets/bundle.250f01b7.js`.
- Implementation CSS bundle: `legacy-mirror/public/assets/bundle.87ba3613.css`.
- Local mirror note: online HTML/CSS/service-worker assets matched the mirror during the drift audit. The local JS bundle intentionally differs where `scripts/mirror-site.mjs` rewrites service-worker registration, `detect-gpu` benchmark URLs, and GPU-check fallback behavior for local serving.
- Screenshots and probes are attribution/regression aids only.
- Do not tune horizon, fog, floor color, brightness, projection, sound, or motion by eye.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Do not delete `public/` or `legacy-mirror/`.

## Next Action

No planned production phase remains.

When a new visual or behavioral mismatch is reported:

1. Reproduce it locally and capture the failing route/viewport.
2. Attribute it to the source bundle/CSS or online baseline before changing code.
3. Patch only the source-owned owner path.
4. Run the smallest focused probe plus the affected regression gates.
5. Update docs and commit code/docs together.

Recommended regression gates by area:

| Area touched | Minimum gates |
| --- | --- |
| Home WebGL/rendering | Build, renderer audit, Home desktop/mobile output, thumb spotlight |
| Home DOM/preloader/sound | Build, Home output or DOM probe, audio lifecycle probe if sound path changes |
| Project detail | Build, project media probe, Home output if shared WebGL changed |
| About/auxiliary | Build, About desktop/mobile probe, Home output if spotlight/shared WebGL changed |
| Router/transition/scroll | Build, focused route probe, About/project/Home gates as affected |
| Mouse/fluid/input | Build, interactive mouse probe, Home output |

## Important Files

- Rebuild WebGL: `src/client/webgl.ts`
- Client logic: `src/client/main.ts`, `src/client/motion.ts`, `src/client/audio.ts`
- Pages/templates: `src/pages/index.astro`, `src/pages/[slug].astro`, `src/pages/about.astro`, `src/components/Footer.astro`, `src/components/MediaBlock.astro`
- Data: `src/data/projects.json`, `src/data/site.ts`
- Core validation tools:
  - `scripts/audit-renderer-output.mjs`
  - `scripts/probe-output-color.mjs`
  - `scripts/probe-thumb-spotlight.mjs`
  - `scripts/probe-project-media.mjs`
  - `scripts/probe-about-scroll-opacity.mjs`
  - `scripts/probe-interactive-mouse.mjs`

## Run Locally

```sh
npm install
npm run build
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
```

Open:

```text
http://localhost:5173/
http://localhost:5173/about/
http://localhost:5173/gc-2026/
```

If `5173` is busy, use another port. Stop the server with Ctrl-C after review.

## Known Blocked Check

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

## Commit Rules

- Work in scoped source-backed batches.
- Update docs and commit code/docs together.
- Use `Boyang Hu <i@boyang.hu>`.
- Do not add an AI co-author.

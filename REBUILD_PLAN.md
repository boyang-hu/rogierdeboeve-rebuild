# Rebuild Plan

Last updated: 2026-06-05

## Execution Rules

- Use the mirrored original bundle as the implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- After each completed small step:
  - update this document,
  - run build and diff checks,
  - run a browser smoke/QA check when relevant,
  - commit the code and this document together.
- Commits use `Boyang Hu <i@boyang.hu>` and no AI co-author.

## Phase Status

1. Home WebGL source parity: in progress.
2. Home DOM and interaction parity: in progress.
3. Project detail media system: stable, monitor for regressions.
4. About and auxiliary pages: pending.
5. Global transitions, state, audio, Lenis lifecycle: pending.
6. Final source/visual QA and cleanup: pending.

## Completed Steps

| Commit | Area | Progress |
| --- | --- | --- |
| `cb499d9` | Home WebGL | Added source-style `wavvesScene/k1` displacement pass for work cubes. |
| `cd1a3a9` | Home WebGL | Aligned main home composite with source `A1/C1` shader behavior using `tNoise`, `tPerlin`, RGB shift, mouse-flow distortion, and blend operations. |
| `1c31149` | Home WebGL | Refined mouse simulation toward source `Ka`: old/new/target pointer state, delta-based lerp, persistence, brush thickness, and flow channels. |
| `d1a8f00` | Home WebGL | Drove work cube displacement with source-style Perlin texture and restored stronger mouse Z displacement. |
| `7f35f97` | Home WebGL | Aligned mouse UV projection with source `uUvOffset/uUvOffsetScale` and enlarged ray plane mapping. |
| `efe5786` | Home WebGL | Added lightweight work-scene bloom compensation based on source `kA/OA` luminosity and bloom settings. |
| `9ff9453` | Home DOM | Added source-style work CTA magnet movement from source `gD`. |
| `ed80a14` | Home DOM | Added source-style temporary `is-dragging` state during gallery wheel/touch navigation to suppress accidental link interaction, matching source `yD` pointer gating. |
| `2eaa8e5` | Home DOM | Added source-compatible progressbar `data-slug` support while preserving existing `data-progress-slug` behavior from the rebuild. |
| `7f41fba` | Home DOM | Aligned homepage title/work/footer intro animation targets with source `Rg/vD/Ou` inner-element structure. |
| `f7531e4` | Home DOM | Aligned work title click behavior with source `vD`: project titles select the active project while the CTA remains the detail-page entry point. |
| `66c6970` | Home DOM | Added source-style `gD` CTA text and opacity animate-in/out when the active work item changes. |
| `71f2403` | Home DOM | Aligned touch gallery movement with source `yD` virtual-scroll deltas by driving project changes during touchmove instead of only on touchend. |
| `a0d4955` | Home DOM | Matched source `Ou` footer contact resize behavior by shortening the mobile contact label to `E-mail`. |
| `f9840d9` | Home WebGL | Moved gallery velocity roll from the rotating project ring to the work scene container to better match source `yD.updateScene`. |
| `e8a811d` | Home DOM | Added source-style header description and availability inner-line animation targets from `Ki/SD.animateIn`. |
| `e7997ec` | Home DOM | Added source-style `.ui-nav-a-inner` targets and nav animate-in timing from source `Tr`. |
| `833594d` | Home DOM | Aligned mobile nav link/state structure with source `Ar` using `.ui-nav-mobile-a`, inner spans, `data-slug`, and `html.is-nav-mobile-open`. |
| `44f341b` | Home DOM | Rebuilt the mobile nav shell closer to source `Ar`, including `.ui-nav-mobile-content`, `.ui-nav-mobile-content-bg`, footer links, toggle-line state, fade-in, and delayed link active/close timing. |
| `3fbf535` | Home WebGL | Matched source `Se.setThumbMouseLightness` propagation by animating `uMouseLightness` on every work block instead of only the active block. |
| `e710154` | Home WebGL | Split source-style overview/detail darken from thumbnail darkness so main composite uses `darkenOverview`/`darkenDetail` while thumb composite and block projection use `thumbnail.darkness`. |
| `1cac355` | Home WebGL | Moved work spotlight parallax closer to source `p1.update` by deriving spotlight x/y from the camera position instead of directly from pointer coordinates. |
| `53e7e31` | Home WebGL | Renamed the work block screen-coordinate uniform to source-compatible `uCoords` while keeping thumb-plane `uResolution` aligned with source `E1`. |
| `cc52ec8` | Home DOM | Kept work gallery pointer gating closer to source `yD` by holding `is-dragging` through the snap window and marking keyboard-driven gallery steps too. |
| `9930ced` | Home DOM/WebGL | Added source-style work gallery event semantics with `rd:nav-click`/`rd:project-active` and carried split darkness payload fields through active project changes. |
| `41bbd7d` | Home DOM | Added source-style `.ui-work-container` around the home work content and aligned fixed container CSS with source `yD`/bundle styles. |
| `0a77fdf` | Home DOM | Aligned work gallery virtual-scroll diff handling with source `yD` so sub-threshold deltas still feed scene inertia while only larger deltas trigger next/prev. |
| `2bdb0ce` | Global DOM | Added source-style button SVG formatting from `gD.formatButton()` so `.c-button` background SVG/rect dimensions match rendered button size on init and resize. |
| `8e65755` | Home DOM | Added source-style mobile `touchstart` selection for work titles and progressbar items from `vD/_D`, with click dedupe to avoid double navigation. |
| `0ba12a7` | Home DOM | Added session-backed work gallery state restoration as a local equivalent of source `Qe.workState` for active slug/index and virtual scroll position. |
| `31e3001` | Home DOM | Added source-style home gallery `mousedown` default suppression from `yD.onMouseDown`, scoped to the home view. |
| `0c3c407` | Home WebGL | Restored source `GA` work-block displacement strength constants: Perlin reveal mix `10.25` and unrevealed wave depth `9.0`. |
| this commit | Home WebGL | Split local cube mouse simulation from source-style screen-space `tMouseSim2`, so work-block fragment light/alpha and main composite sample screen mouse flow separately from vertex displacement. |

## Current Focus

Continue Phase 2, Home DOM and interaction parity, while keeping Phase 1 WebGL improvements stable.

Immediate source targets:

- `yD`: work gallery virtual scroll, pointer/drag state, snap timing, keyboard/mouse/touch behavior.
- `vD`: work nav click behavior and active project event flow.
- `gD`: CTA formatting, magnet, animate in/out, click sound behavior.
- `_D`: progressbar click behavior and active state.
- `SD`: page-level init/animate-in/out and source state wiring.

## Next Candidate Steps

1. Continue comparing source `yD` against `src/client/main.ts` and align snap/transition timing where current behavior differs.
2. Improve home animate-in/animate-out sequencing for nav/title/footer/CTA to better match `SD/vD/gD`.
3. Revisit WebGL spotlight/thumb projection after DOM interaction parity no longer creates obvious mismatches.
4. Start About page source analysis once home first-viewport behavior is closer.

## Verification Baseline

Run after each completed step:

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build
git diff --check
```

For local smoke:

```sh
PORT=5173 SERVE_ROOT=dist FALLBACK_ROOT=public node scripts/serve.mjs
```

Open:

```text
http://127.0.0.1:5173/?skip-preloader
http://127.0.0.1:5173/gc-2026/?skip-preloader
```

Browser smoke should confirm:

- home loads the latest JS bundle,
- project pages keep `.gl-canvas`,
- project pages keep desktop `[data-media][data-media-src]` tracks,
- no WebGL shader/runtime errors in available logs.

# Rogier de Boeve Rebuild Handoff

Last updated: 2026-06-07

This document records the current rebuild state for continuing work on another machine.

## Goal

Rebuild `https://rogierdeboeve.com/` locally with a modern, lighter stack while staying as close as possible to the original site.

The user explicitly corrected the approach: do not rely mainly on visual screenshots. The rebuild should be source-code-driven from the mirrored original bundle, with visual QA only used as verification. Visual improvement is not the goal by itself; production changes need mirrored-bundle evidence even when they appear to improve the result. Known source mismatches must not be closed as "accepted deviations" based on visual review or low perceived visual payoff; they should either be fixed from source evidence, documented as unavoidable technical bridges, or left open.

Latest user clarification: the goal is source-site replication, not visual benefit. Prioritize next work by clear mirrored-source mismatch, 1:1 blocker severity, and controllable implementation risk. Do not use expected visual payoff as a ranking or rejection criterion.

## Chosen Stack

- Astro static output
- TypeScript
- Three.js for WebGL scenes
- GSAP for animation timelines/tweens
- Lenis for smooth scrolling
- Howler for hover/click/ambient audio

Audio must continue to use Howler.

## Important Files

- Original source mirror:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
  - `legacy-mirror/public/assets/bundle.ee0b1c10.css`
- Rebuild WebGL:
  - `src/client/webgl.ts`
- Rebuild page/client logic:
  - `src/client/main.ts`
  - `src/client/motion.ts`
  - `src/client/audio.ts`
- Project/page templates:
  - `src/pages/index.astro`
  - `src/pages/[slug].astro`
  - `src/components/MediaBlock.astro`
- Project data:
  - `src/data/projects.json`
  - `src/data/site.ts`

Do not delete `public/` assets or `legacy-mirror/`; they are required for rebuild and reference work.

## Source-Derived Findings

The original bundle has these relevant classes and behavior:

- App/views/transitions:
  - `Qe.init()`
  - home view: `SD`
  - home gallery/scroll: `yD`
  - work nav/CTA: `vD`, `gD`, `_D`
- WebGL work scene:
  - `p1`
  - project cube grid: `GA`
  - thumb scene/gallery: `T1`, `w1`, `E1`
- Project media:
  - `OD`, `ND`, `FD`, `UD`

Important original constants/logic already reflected in the rebuild:

- `GA.settings = { xNum: 35, yNum: 23, zNum: LOW_RES ? 4 : 7, size: 1.25, spacing: 0.1, scale: 0.09 }`
- Home has one `GA` instanced rounded-cube grid per project, arranged in a circular carousel.
- Home scroll uses virtual values:
  - `step = 1000`
  - `limit = projects.length * 1000`
  - `virtual`, `target`, `animated`, `current`, `progress`
  - active project comes from rounded `current / step`
- CTA hover does not show/hide a DOM preview. It animates the work scene mouse factor:
  - enter: `J.workScene.setMouseFactor(0.25)`
  - leave: `J.workScene.setMouseFactor(1)`
- Active project reveal:
  - active `uReveal -> 1` over 4s with `delay: 0.2`
  - inactive `uReveal -> 0`
  - updates ambient, colors, darken, saturation, contrast, thumb settings, blocks color
- Source alpha formula for work cubes is based on sparse random grid alpha:
  - `random(gridUv) * random(gridUv2) * instanceAlpha`
  - plus reveal vignette and side reveal
- Thumb gallery:
  - plane scale is `2, 2, 2`
  - horizontal wrapping uses `itemWidth`, `totalWidth`, and `progress * totalWidth`
  - thumbs outside roughly `[-1.5, 1.5]` are hidden
- Project desktop media uses empty DOM tracks with WebGL planes.
- Project mobile media uses real DOM media fallback.
- Original project media mapping formula:
  - x: `-viewportW / 2 + bounds.width / 2 + bounds.left`
  - y: `viewportH / 2 - bounds.height / 2 - bounds.top`
  - scale: DOM width/height

## Current Implementation State

The rebuild is not full 1:1 yet, but it is now architecturally source-derived instead of only visually approximated.

Implemented:

- Source-derived home WebGL scene in `src/client/webgl.ts`
  - per-project instanced rounded-cube grids
  - original grid dimensions and scale
  - thumb scene render target
  - source-like reveal/alpha formula
  - active project color/thumb/darken/saturation/contrast updates
  - CTA hover mapped to `mouseFactor`
  - virtual gallery progress controls carousel rotation and thumb gallery
  - lightweight floor/env layers corresponding to source `p1.floor` and `p1.env`
  - source WebP-selected texture/cubemap extension ownership from `Qe`, `Xt`, and `p1.addEnvironment()`
  - support for `ambient < 0 && colors.invert`
- Project media system
  - desktop `[data-media][data-media-src]` empty tracks mapped to WebGL planes
  - image/video loading into Three textures
  - mobile DOM fallback via `data-mobile-media`
- Home/project payload data
  - `data-color`
  - `data-secondary`
  - `data-invert`
  - `data-media-color`
  - `data-blocks`
  - `data-thumb`
  - `data-darkness`
  - `data-darkness-color`
  - `data-saturation`
  - `data-contrast`
  - `data-mouse-lightness`
  - `data-ambient`
- Howler audio is in place in `src/client/audio.ts`.

Known remaining gaps:

- Home is still not 1:1.
- The biggest remaining gap is original postprocessing/composite fidelity:
  - source uses a more complex main composite with bloom, luminosity, RGB shift, fluid/mouse simulation, perlin/noise, and spotlight map behavior.
  - rebuild has source-shaped passes, target clone ownership, and work/main pass-material ownership, but transfer interpretation and exact composite behavior are still not complete.
- The original projects the thumb render target through `SpotLight.map`. The rebuild now guards the source no-explicit-`castShadow` `SpotLight.map` path, but the projected thumb content/transfer feel is still not exact.
- Ordinary `VA-work` now uses direct source-shaped `HA/zA` templates. The remaining ordinary-work source bridge is `uUvOffset` as `vec2`, because the mirrored runtime constructs it from `Vector2` and `GA` writes only `.x/.y`. The old source `SPECULAR` macro is restored in `zA`; runtime probes guard that ordinary work is `MeshStandardMaterial`, not `MeshPhysicalMaterial`, so `PHYSICAL` is inactive.
- `Ka` mouse simulation now uses source `rA/oA` shader surfaces and guarded source comments/placeholders, but interactive mouse/fluid feel is still not verified 1:1.

Latest Phase 1 batch:

- Source `N1/F1`, `o1/s1/r1`, `t1/QA/e1`, and shared `cg/nA` shader source surfaces were aligned without changing formulas, constants, or visual tuning.
- Source `F1` displacement composite now matches the mirrored blank-line, `vec2(0.5, 0.5)`, `uRatio` trailing-space, and `uvOff` trailing-space surface. Runtime source trailing spaces are generated with `SOURCE_TRAILING_SPACE` so the TypeScript file still passes whitespace checks.
- Source floor reflection blur `QA` now keeps the source declaration order: `blur(...)`, `smootherstep(...)`, uniforms, varyings, then `main()`.
- Source floor material `s1/r1` now matches the source floor vertex spacing and source floor fragment macro indentation, dither helper comments, and `1.` literal surface. The shared dither helper now also makes `cg-bloom-composite` source-shaped.
- Shader dump reports `N1-displacement-composite`, `o1-floor-material`, `t1-floor-reflection-blur`, and `cg-bloom-composite` as `source-shaped`, with vertex delta `0` and fragment delta `0`. Existing `M1-thumb-plane` and `x1-thumb-composite` remained `source-shaped`.
- QA passed for `git diff --check`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, thumb spotlight probe, desktop/mobile output probes with `PROBE_WAIT=30000`, shader dump, project-media probe, full capture, and band analysis. Full capture reported no failures/exceptions. Final band deltas were desktop center `+0.0052` and mobile center `+0.0285`, recorded only as regression evidence.
- Project media remained stable: `gc-2026` 5/5 visible media, `hashgraph-vc` 5/5 visible media.
- Phase 1 remains open; this closes the displacement/floor/blur/shared-dither shader text surface residuals, not the remaining spotlight/thumb projection content and transfer parity, `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment distribution parity, or interactive mouse/fluid verification.

## Validation Status

Last verified in the latest session:

```sh
npm run build
git diff --check
node scripts/audit-renderer-output.mjs
node scripts/dump-va-shader.mjs
node scripts/probe-output-color.mjs
node scripts/probe-thumb-spotlight.mjs
node scripts/probe-project-media.mjs
node scripts/capture.mjs
node scripts/analyze-home-bands.mjs
```

All passed in the `N1/o1/t1/cg` shader source-surface batch.

Runtime QA was done with local Chrome CDP scripts.

Verified:

- Home loads with `.gl-canvas`.
- Home can activate `gc-2026`.
- Project page `/gc-2026/?skip-preloader` loads with `.gl-canvas`.
- Project pages detected 5/5 desktop WebGL media tracks for both `gc-2026` and `hashgraph-vc`.
- No runtime/console/WebGL shader errors were reported, excluding normal audio autoplay warnings.

Screenshots from the prior machine were stored under `/tmp/...`; do not rely on them after moving machines.

## Run Locally On A New Machine

From the repo root:

```sh
npm install
npm run build
npm start
```

Open:

```text
http://127.0.0.1:5173/?skip-preloader
http://127.0.0.1:5173/gc-2026/?skip-preloader
```

If port `5173` is busy:

```sh
PORT=5174 npm start
```

For development:

```sh
npm run dev
```

## Suggested Next Work

Continue source-driven implementation in this order:

1. Continue spotlight/thumb projection content and transfer evidence.
   - Original: `SD.init()` assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`.
   - Current rebuild now guards the no-explicit-`castShadow` `SpotLight.map` projection path and has source-shaped `M1/x1` thumb shader text, but the projected thumb content/transfer feel is still not exact.
2. Extract the original main composite/render-manager shader behavior from `bundle.250f01b7.js`.
   - Look near original `A1`, `OA`, `kA`, `Lu`, and main scene render manager code.
   - Port source behavior and values as the 1:1 implementation spec; avoid filtering changes by expected visual payoff.
3. Revisit floor/environment distribution from source evidence.
   - The visible fog-bed/horizon still differs from the source.
   - Do not tune brightness or fog visually without bundle-backed ownership.
4. Improve original mouse/fluid simulation fidelity.
   - Original `GA` uses `Ka` mouse simulation with `tMouseSim`, `tMouseSim2`, and `tDisplacement`.
   - Rebuild has the source-shaped render-target structure and `rA/oA` shader surface, but still needs interactive 1:1 verification.
5. Compare against the original mirror only after source behavior changes.
   - Run mirror server if needed:
     ```sh
     PORT=5175 SERVE_ROOT=legacy-mirror/public FALLBACK_ROOT=public node scripts/serve.mjs
     ```
   - Use visual comparison only to validate source-driven changes.
6. Keep project detail pages stable.
   - They are currently closer than home.
   - Do not regress desktop WebGL media tracks or mobile DOM fallback.

## Prompt For New Computer

Paste this into the next coding agent:

```text
We are in the repo `rogierdeboeve-rebuild`. Read `HANDOFF.md` first and continue from there.

Goal: keep rebuilding `https://rogierdeboeve.com/` 1:1 using the agreed stack: Astro + TypeScript + Three.js + GSAP + Lenis + Howler. Audio must use Howler.

Important instruction: do not use screenshots as the primary implementation method. The user explicitly wants a source-code-driven rebuild. Use the mirrored source bundle as the spec:
- `legacy-mirror/public/assets/bundle.250f01b7.js`
- `legacy-mirror/public/assets/bundle.87ba3613.css`

Priority rule: choose work by source mismatch evidence, 1:1 blocker severity, and controllable risk. Do not rank or reject source-backed mismatches by expected visual payoff.

Do not delete `public/` or `legacy-mirror/`.

Current state:
- Build previously passed with `npm run build`.
- `git diff --check` previously passed.
- Home WebGL is source-derived but not 1:1 yet.
- Project detail media pages are closer and should not regress.

Next focus:
1. Continue analyzing original source classes/shaders, especially `p1`, `GA`, `T1/w1/E1`, `Se`, and main composite/render-manager code around `A1`, `OA`, `kA`.
2. Improve home WebGL fidelity, especially the original spotlight/thumb render-target projection, postprocessing/composite, and mouse/fluid simulation.
3. After each change, run `npm run build`, `git diff --check`, and browser QA on:
   - `/ ?skip-preloader`
   - `/gc-2026/?skip-preloader`

Be honest in status updates: it is not fully 1:1 yet.
```

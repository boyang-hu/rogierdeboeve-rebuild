# Rogier de Boeve Rebuild Handoff

Last updated: 2026-06-07

This document records the current rebuild state for continuing work on another machine.

## Goal

Rebuild `https://rogierdeboeve.com/` locally with a modern, lighter stack while staying as close as possible to the original site.

The user explicitly corrected the approach: do not rely mainly on visual screenshots. The rebuild should be source-code-driven from the mirrored original bundle, with visual QA only used as verification. Visual improvement is not the goal by itself; production changes need mirrored-bundle evidence even when they appear to improve the result.

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
  - rebuild approximates these in a simpler Three shader pipeline.
- The original projects the thumb render target through a spotlight map. The rebuild currently uses a reduced projection helper plus cube shader sampling. This is closer than a flat preview, but still not exact.
- Mouse/fluid simulation is approximated; original `Ka` mouse simulation and render-manager chain are not fully ported.

Latest Phase 1 batch:

- Source `A1/C1` pre-composite shader surface parity was tightened without visual tuning:
  - `homePreCompositeFragment` now places shared color helpers/full blend dispatcher before `luminance(...)` and `coverTexture(...)`, matching source `A1`;
  - pre-composite uniforms now follow the source declaration order;
  - `random(vec2 st)` now sits after `in/out`, like source `A1`;
  - `coverTexture(...)` now keeps the source temporary `vec4 color = texture(tex, uv); return color;`;
  - output probes and shader dump now assert this source declaration order and cover-texture temporary.
- QA passed for `git diff --check`, `npm run build`, renderer audit, desktop/mobile output probes, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis.
- Project media remained stable: `gc-2026` 5/5 visible media, `hashgraph-vc` 5/5 visible media.
- Phase 1 remains open; this was source surface parity, not visual closeout.

## Validation Status

Last verified in the prior session:

```sh
npm run build
git diff --check
```

Both passed.

Runtime QA was done with a local Chrome CDP fallback because the in-app browser `iab` was unavailable in that session.

Verified:

- Home loads with `.gl-canvas`.
- Home can activate `gc-2026`.
- Project page `/gc-2026/?skip-preloader` loads with `.gl-canvas`.
- Project page detected 5 desktop WebGL media tracks.
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

1. Extract the original main composite/render-manager shader behavior from `bundle.250f01b7.js`.
   - Look near original `A1`, `OA`, `kA`, `Lu`, and main scene render manager code.
   - Port only what materially affects the 1:1 home result.
2. Revisit the spotlight/thumb projection path.
   - Original: `SD.init()` assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`.
   - Current rebuild uses a lighter projection helper plus cube shader sampling.
   - A closer port should make the thumb image feel projected into cube volume, not overlaid.
3. Improve original mouse/fluid simulation fidelity.
   - Original `GA` uses `Ka` mouse simulation with `tMouseSim`, `tMouseSim2`, and `tDisplacement`.
   - Rebuild approximates this with pointer/raycaster/noise.
4. Compare against the original mirror only after source behavior changes.
   - Run mirror server if needed:
     ```sh
     PORT=5175 SERVE_ROOT=legacy-mirror/public FALLBACK_ROOT=public node scripts/serve.mjs
     ```
   - Use visual comparison only to validate source-driven changes.
5. Keep project detail pages stable.
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

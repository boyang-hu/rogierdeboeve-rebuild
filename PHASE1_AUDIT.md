# Phase 1 Audit: Home WebGL Source Parity

Last updated: 2026-07-07

## Purpose

This is the canonical active audit for Phase 1. It records current parity, open blockers, closed source edges, and closeout criteria.

It is not an append-only work log. Blockers are ordered by current priority, not by discovery date. The old long-form timelines remain available in git when needed:

```sh
git show 9986590:PHASE1_AUDIT.md
```

## Scope

Phase 1 covers Home WebGL source parity against:

- `legacy-mirror/public/assets/bundle.250f01b7.js`
- `legacy-mirror/public/assets/bundle.87ba3613.css`

Primary source areas:

- `p1`: home work scene, lights, carousel, floor, environment, about/floating blocks
- `GA/VA`: work cube instancing, shader injection, local mouse simulation, reveal/alpha
- `T1/w1/E1/M1/x1`: thumbnail scene, strip, and thumb composite
- `A1/C1`: main pre-composite material
- `OA/kA/Lu`: work render manager and final work composite
- `I1`: main render manager
- `Ka/ag/qT`: mouse and fluid simulation
- `Se`: visual state setter ownership
- `TD/Fg/Q1/eD`: about and auxiliary visual ownership

## Status Snapshot

Phase 1 is open. Earlier closeout language accepted too many visible deviations; current closeout requires source-backed parity or explicit technical bridge documentation.

| Area | Estimate | Confidence | Current read |
| --- | ---: | --- | --- |
| Architecture/lifecycle | 75-80% | Strong | Broad scene, route, state, and probe surfaces are source-derived. |
| Shader/render-manager parity | 65-75% | Medium | Many shader surfaces and pass edges are aligned; `kA/Lu/I1` is narrowed to a guarded follow-up. |
| Final Home visual parity | 55-65% | Medium-low | Home still diverges in projection feel and floor/environment blend. |
| Runtime stability | Good | Strong | Build, renderer audit, and browser probes are currently clean. |

## Active Blockers

1. Floor/environment residuals.
   - Guarded: root scene and `sceneWrap` hierarchy, Home camera surfaces, environment material ownership, floor reflection draw-state, reflector camera/renderer state, blur/swap ownership, and target sizing.
   - Open: hard horizon/fog-bed distribution still differs. Do not tune brightness or fog visually without source ownership evidence.

2. Spotlight/thumb projection transfer feel.
   - Guarded: `SpotLight.map` path, source spotlight constructor defaults, `SD.init()` Home map setup, direct-about previous map, about destroy map retention, active-project spotlight ownership/order, thumb scene settings, thumb shader surfaces, and projection sampling guardrails.
   - Open: projected thumb brightness, depth, content transfer, and timing still do not feel source-exact.

3. `kA/Lu/I1` composite and transfer interpretation.
   - Guarded: many source-shaped shader surfaces, pass settings, optional blur chain, resize ownership, runtime uniform order, GPU/LOW_RES bridge, and main/work camera surfaces.
   - Narrowed: source `I1` default `renderToScreen=true` path renders C1 directly to screen; `renderTargetComposite` is retained but unused for the default visible Home path.
   - Narrowed: source `nD` delayed C1 bindings are one-time `tWork`, `tMedia`, and initial work mouse-simulation output bindings after the `100ms` delay.
   - Open: keep this as a regression guardrail, but do not treat default render-target transfer as the current primary suspect unless new evidence contradicts the audit.

4. Mouse/fluid interaction parity.
   - Guarded: `Ka` mouse simulation constructor/update ownership, raycast hit-UV ownership, main-fluid pointer/diff ownership, bounded pass geometry, and interactive probe coverage.
   - Open: final feel remains a regression concern when touching interaction paths.

## Current Evidence Anchors

Last code-changing source edge: Align `nD.animateIn()` texture-object await semantics.

- Source `Xt.loadTexture()` returns the immediate Three `Texture` object from `TextureLoader.load()`, not a load promise.
- Source `nD.animateIn()` awaits `initPromise`, then awaits `Xt.blueNoise`, `Xt.floorNormal`, `Xt.perlin1`, and `Xt.perlin2`; those texture awaits resolve immediately because the values are `Texture` objects.
- Rebuild now keeps `animateIn()` gated on the delayed init lifecycle and immediate texture-object awaits, while image onload state is tracked separately for probes.
- Renderer audit and output probe guard against reintroducing `sourceTexturePreloadPromise` as an `animateIn()` gate.

Previous code-changing source edge: `9986590 Align about destroy spotlight map ownership`.

- Source `TD.addEvents()` binds `J.workScene.spotLight.map` to `J.characterScene.renderManager.renderTargetComposite.texture` after the `100ms` delay.
- Source `TD.animateOut()` only tweens about reveal uniforms and calls `Se.setSpotLightIntensity(0)`.
- Source `TD.destroy()` removes the about RAF handler, clears about block visibility/tracking, restores `spotLightParallax=true`, and removes character rotatable events.
- Neither source method restores `J.workScene.spotLight.map` to the Home thumb composite; `SD.init()` owns that later Home bind.
- Rebuild about lifecycle probes and renderer audit now guard this ownership edge.

Most recent investigation narrowed `kA/Lu/I1` without changing production code:

- `VA-work` shader dump matched source-shaped vertex and fragment text with zero recorded deltas.
- `OA-work-composite`, `A1-pre-composite`, thumb, floor, environment, media, and fluid shaders were source-shaped.
- Relevant source bundle light chunks and local Three chunks had zero deltas, including the spotlight-map multiplication path.
- Source `I1` default target behavior was traced: `settings.renderToScreen` defaults to `true`, C1 renders straight to the canvas, and `renderTargetComposite` is not written in the default visible path.
- Source `U1.update()` calls `super.update()` before `C1.update()`, so C1 `uTime` updates after the frame render. Rebuild keeps that order.
- Source `nD.init()` binds C1 `tWork`, `tMedia`, and `tMouseSim` once after the `100ms` delayed resize/bind phase. Rebuild keeps those as delayed one-time bindings.
- Full renderer audit has zero recursive false/null findings, and desktop browser output/thumb probes pass on these surfaces.

## Closed Source Edges

Keep this table short and current. It is a lookup table for recently closed edges, not the forward plan. For full historical detail, use the git version noted above.

| Commit | Area | Closed edge |
| --- | --- | --- |
| latest | `nD/Xt` canvas animate-in texture awaits | `animateIn()` awaits immediate `Texture` objects, not image-load promises; load completion remains probe state only. |
| `9986590` | `TD` about destroy spotlight map | About out/destroy keep the current spotlight map; `SD.init()` owns later Home map bind. |
| `a42e975` | `p1/SD/TD` spotlight init lifecycle | Constructor leaves map/target defaults; `SD.init()` owns Home map, target, position, and intensity. |
| `a69ad3a` | `Ir/GT` main-fluid bounded geometry | Bounded passes use source geometry and default culling; force pass stays fullscreen. |
| `fe213c1` | `Lu` luminosity branch | Work luminosity branch runs before and independently of bloom. |
| `f6e84c4` | `Lu/I1` optional blur target resize | Optional blur follows source target chain and direct resize input ownership. |
| `cdbbde7` | `eD/Pe` character camera pan | About character pan consumes shared source `Pe.mouse.normalized`. |
| `dcb3ed6` | `VA/XA` runtime `uCoords` | Work/about coords use direct viewport times capped DPR without rebuild clamp. |
| `c0b2e42` | `IT` camera denominator | Home camera update uses direct `Pe.w/Pe.h`, not rebuild `Math.max` denominators. |
| `0441731` | `VA/XA/KA` cache keys | Block materials use Three default `onBeforeCompile` cache key path, no local override. |
| `02f0b0d` | `h1/u1` cache key | Environment material uses source no-custom-cache-key ownership. |
| `43cf728` | `Lu/I1` bloom mip resize | Bloom mip chain halves directly like source, without per-step round/clamp ownership. |
| `5bb0264` | `Lo` resize inputs | Sky, displacement, thumb, and floor reflection pass direct inputs through `Lo.resize`. |

## Narrowed Non-Primary Suspects

These areas are still guarded, but should not be the first place to spend another batch without new contradictory evidence:

- `I1` default visible target transfer: source renders C1 directly to screen when `renderToScreen=true`; rebuild's unused default `compositeTarget` is expected.
- Spotlight-map shader and Three light chunk multiplication: source and rebuild shader/chunk evidence currently match.
- `w1.updateGalleryProgress()` centered wrapping and `T1/x1/E1/M1` thumb scene surface: current thumb probe passes source-shaped positioning, sizing, image binding, material defaults, and composite transfer.

## Active Guardrails

- Use source bundle evidence for every production behavior change.
- Keep visual captures as regression/attribution only.
- Run project media probes for shared render-manager or media changes.
- Run interactive mouse probe for mouse/fluid changes.
- Keep about lifecycle probes when touching `TD`, `Fg`, `Q1`, `eD`, spotlight map ownership, or auxiliary blocks.
- Do not reintroduce stale accepted-deviation closeout language.

## Completion Criteria

Phase 1 can close only when:

- Floor/environment/fog-bed residuals are source-fixed or explicitly proven to be bridge constraints.
- Remaining spotlight/thumb projection differences are source-fixed or documented as unavoidable technical bridges.
- `kA/Lu/I1` transfer/composite ownership is source-isomorphic enough that no known source mismatch remains in the active graph.
- Home desktop/mobile, about, and project media probes pass.
- Build, renderer audit, recursive false/null extraction, and `git diff --check` pass.
- Documentation records the final source evidence and known bridge boundaries.

## Verification Commands

Default validation for a Phase 1 rendering batch:

```sh
node --check src/client/webgl.ts
node --check scripts/audit-renderer-output.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-phase1-audit.json
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Syntax-check and run browser probes selected by touched area:

```sh
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
node --check scripts/probe-output-color.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-output CDP_PORT=9301 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-output-color.mjs
node --check scripts/probe-thumb-spotlight.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-thumb CDP_PORT=9302 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-thumb-spotlight.mjs
node --check scripts/probe-project-media.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-media CDP_PORT=9303 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-project-media.mjs
node --check scripts/probe-about-scroll-opacity.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-about CDP_PORT=9304 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-about-scroll-opacity.mjs
```

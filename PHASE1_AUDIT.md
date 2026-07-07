# Phase 1 Audit: Home WebGL Source Parity

Last updated: 2026-07-07

## Purpose

This file is the Phase 1 evidence register. It records current source facts, guarded conclusions, open blockers, and closeout criteria.

It is not a chronological work log. Use git for older states:

```sh
git log --oneline
git show <commit>:PHASE1_AUDIT.md
```

| Section | Purpose |
| --- | --- |
| Scope | What Phase 1 is allowed to cover. |
| Current Status | Current parity estimate and closeout state. |
| Open Blockers | Problems that still prevent Phase 1 closeout. |
| Evidence Register | Current source facts and guarded rebuild facts by system. |
| Guarded Edges | Source-backed areas that should not be reopened first without new evidence. |

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

## Current Status

Phase 1 is open. Closeout requires source-backed parity or explicit technical bridge documentation.

| Area | Estimate | Confidence | Current read |
| --- | ---: | --- | --- |
| Architecture/lifecycle | 75-80% | Strong | Broad scene, route, state, and probe surfaces are source-derived. |
| Shader/render-manager parity | 65-75% | Medium | Many shader surfaces and pass edges are aligned; `kA/Lu/I1` is narrowed to a guarded follow-up. |
| Final Home visual parity | 55-65% | Medium-low | Home still diverges in projection feel and floor/environment blend. |
| Runtime stability | Good | Strong | Build, renderer audit, and browser probes are currently clean. |

## Open Blockers

1. Floor/environment residuals.
   - Guarded: root scene and `sceneWrap` hierarchy, Home camera surfaces, environment material ownership, `u1` shader surface, floor reflection draw-state, reflector camera/renderer state, blur/swap ownership, cubemap sampling, and target sizing.
   - Open: hard horizon and fog-bed distribution still differ.
   - Rule: do not tune brightness, fog, or floor color visually without source ownership evidence.

2. Spotlight/thumb projection transfer feel.
   - Guarded: `SpotLight.map` path, source spotlight constructor defaults, `SD.init()` Home map setup, direct-about map state, about destroy map retention, active-project spotlight ownership/order, thumb scene settings, thumb shader surfaces, and projection sampling guardrails.
   - Open: projected thumb brightness, depth, content transfer, and timing still do not feel source-exact.

3. `kA/Lu/I1` composite and transfer interpretation.
   - Guarded: shader surfaces, pass settings, optional blur chain, resize ownership, runtime uniform order, GPU/LOW_RES bridge, and main/work camera surfaces.
   - Narrowed: source `I1` default `renderToScreen=true` renders C1 directly to screen; `renderTargetComposite` is retained but unused for the default visible Home path.
   - Rule: keep this as a regression guardrail, not the first suspect, unless new evidence contradicts the audit.

4. Mouse/fluid interaction parity.
   - Guarded: `Ka` mouse simulation constructor/update ownership, raycast hit-UV ownership, main-fluid pointer/diff ownership, bounded pass geometry, and interactive probe coverage.
   - Open: final feel remains a regression concern when touching interaction paths.

## Evidence Register

### Floor And Environment

Current source read:

- `p1.init()` calls `addEnvironment()` without awaiting the cubemap load, then continues the Home scene setup.
- `addEnvironment()` awaits the cubemap internally and later assigns `scene.environment`.
- Source floor `a1` creates `new i1`, uses `Xt.floorNormal`, sets `repeat` to `45,45`, creates `new Tu(60,32)`, and uses `o1` with `color:"#4a4a4a"`, `uMirror:1`, `reflectivity:.97`, and `uFloorMixStrength:15`.
- Source floor reflection assigns `tReflect` and `uMatrix` from the reflector, rotates the floor to `-PI/2`, hides the floor group during reflection render, updates the reflector, then restores visibility.
- Source environment `h1/u1` uses an icosahedron `Du(300,10)`, `side: BackSide`, `envMapIntensity:1`, `fog:false`, `dithering:true`, and `speed=5e-5`.
- Source environment fragment shader is `l1`; source environment vertex shader is `c1`.

Current guarded rebuild facts:

- Browser output probe reports production debug clean.
- Scene background/fog, floor hierarchy/material, environment hierarchy/material, floor reflection draw-state, reflector target sizing, environment rotation, and low-res SwiftShader branch are source-shaped.
- Cubemap `scene.environment` is guarded beyond load success: source `CubeTextureLoader` creates a `CubeTexture`, assigns `SRGBColorSpace`, fills six images, and uses `CubeTexture` defaults for reflection mapping and `flipY=false`; the browser probe confirms those runtime fields plus default wrap/filter/mipmap/type/format and six loaded images.
- `u1-environment` shader dump coverage now includes both source `l1` fragment and source `c1` vertex extraction.
- The environment vertex shader text in rebuild matches the source `c1` surface, including the source `vViewPosition = - mvPosition.xyz` expression and chunk order.
- Remaining investigation should focus on sky/environment timing, environment target contents, final target distribution, or renderer state not covered by those guards.

### Texture And Animate-In Lifecycle

Current source read:

- `Xt.loadTexture()` returns the immediate Three `Texture` from `TextureLoader.load()`, not a load promise.
- `nD.animateIn()` awaits `initPromise`, then awaits `Xt.blueNoise`, `Xt.floorNormal`, `Xt.perlin1`, and `Xt.perlin2`.
- Those texture awaits resolve immediately because the values are texture objects.

Current guarded rebuild facts:

- Rebuild keeps `animateIn()` gated on delayed init lifecycle and immediate texture-object awaits.
- Image onload state remains separate probe state and is not an `animateIn()` gate.
- Renderer audit and output probe guard against reintroducing `sourceTexturePreloadPromise` as an `animateIn()` dependency.

### Spotlight And Thumb Projection

Current source read:

- `SD.init()` owns Home spotlight map, target, position, and intensity setup.
- `TD.addEvents()` binds about spotlight map after its delayed setup.
- `TD.animateOut()` and `TD.destroy()` do not restore the Home thumb composite; `SD.init()` owns the later Home bind.

Current guarded rebuild facts:

- Spotlight constructor defaults, direct-about map state, about destroy map retention, active-project spotlight ownership/order, thumb scene settings, shader surfaces, and projection sampling are guarded.
- The open issue is projection feel: brightness, depth, content transfer, and timing.

### Render Managers And Composite Transfer

Current source read:

- Source `I1` default `settings.renderToScreen=true` renders C1 directly to the canvas.
- `renderTargetComposite` is retained but unused for the default visible Home path.
- Source `U1.update()` calls `super.update()` before `C1.update()`, so C1 `uTime` updates after the frame render.
- Source `nD.init()` binds C1 `tWork`, `tMedia`, and initial work mouse-simulation output once after the delayed resize/bind phase.

Current guarded rebuild facts:

- `VA-work`, `OA-work-composite`, `A1-pre-composite`, thumb, floor, environment, media, and fluid shaders are source-shaped in the audit.
- Relevant source bundle light chunks and local Three chunks have zero recorded deltas, including spotlight-map multiplication.
- Full renderer audit has zero recursive false/null findings on the guarded surfaces.

### About And Auxiliary Ownership

Current source read:

- `TD.destroy()` removes the about RAF handler, clears about block visibility/tracking, restores `spotLightParallax=true`, and removes character rotatable events.
- It does not restore `J.workScene.spotLight.map` to the Home thumb composite.

Current guarded rebuild facts:

- About lifecycle probes and renderer audit guard this ownership edge.
- Keep about probes in the validation set when touching `TD`, `Fg`, `Q1`, `eD`, spotlight map ownership, or auxiliary blocks.

## Guarded Edges

These are current boundaries, grouped by system instead of discovery time.

| System | Guarded source edge |
| --- | --- |
| Floor/environment | `Lo` resize inputs pass direct source dimensions for sky, displacement, thumb, and floor reflection. |
| Floor/environment | `h1/u1` environment material uses source no-custom-cache-key ownership. |
| Floor/environment | Cubemap loader defaults and `scene.environment` sampling fields are guarded by browser probe. |
| Floor/environment | `u1` environment shader surface is guarded through source `l1` fragment and `c1` vertex extraction. |
| Texture lifecycle | `nD.animateIn()` awaits immediate texture objects, not image-load promises. |
| Render managers | Work luminosity branch runs before and independently of bloom. |
| Render managers | Optional blur follows source target chain and direct resize input ownership. |
| Render managers | Bloom mip chain halves directly like source, without per-step round/clamp ownership. |
| Render managers | Default Home path renders C1 directly to screen; delayed C1 bindings are one-time source-owned inputs. |
| Camera/block materials | Home camera update uses direct `Pe.w/Pe.h`, not rebuild `Math.max` denominators. |
| Camera/block materials | Work/about coords use direct viewport times capped DPR without rebuild clamp. |
| Camera/block materials | Block materials use Three default `onBeforeCompile` cache key path, no local override. |
| Spotlight/thumb | Constructor leaves map/target defaults; `SD.init()` owns Home map, target, position, and intensity. |
| Spotlight/thumb | About out/destroy keep the current spotlight map; `SD.init()` owns later Home map bind. |
| Interaction/about | Bounded fluid passes use source geometry and default culling; force pass stays fullscreen. |
| Interaction/about | About character pan consumes shared source `Pe.mouse.normalized`. |

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
node --check scripts/dump-va-shader.mjs
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

Known blocked check:

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

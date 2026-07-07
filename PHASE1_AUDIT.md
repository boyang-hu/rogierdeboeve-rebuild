# Phase 1 Audit: Home WebGL Source Parity

Last updated: 2026-07-07

## How To Read This

This file is the current Phase 1 audit. The old append-only audit had more than 10,000 lines and mixed active status with historical batch logs, which made the current timeline hard to read.

The last full historical version is preserved in git:

```sh
git show 9986590:PHASE1_AUDIT.md
```

Use that command only when an older S1 entry needs detailed archaeology. The current file below is the canonical active audit.

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

Phase 1 is open. The older closeout standard accepted too many visible deviations; current closeout requires source-backed parity or explicit technical bridge documentation.

Estimated progress:

| Area | Status | Confidence |
| --- | --- | --- |
| Architecture/lifecycle | 75-80% | Strong. Broad scene, route, state, and probe surfaces are source-derived. |
| Shader/render-manager parity | 65-75% | Medium. Many shader surfaces and pass edges are aligned, but full transfer interpretation remains open. |
| Final Home visual parity | 55-65% | Medium-low. Home still visibly diverges in projection feel and floor/environment blend. |
| Runtime stability | Good | Build and probes are currently clean. |

## Current Open Blockers

1. Spotlight/thumb projection transfer feel.
   - Guarded: `SpotLight.map` path, source spotlight constructor defaults, `SD.init()` Home map setup, direct-about previous map, about destroy map retention, active-project spotlight ownership/order, thumb scene settings, thumb shader surfaces, and projection sampling guardrails.
   - Open: projected thumb brightness, depth, content transfer, and timing still do not feel source-exact.

2. `kA/Lu/I1` composite and transfer interpretation.
   - Guarded: many source-shaped shader surfaces, pass settings, optional blur chain, resize ownership, runtime uniform order, GPU/LOW_RES bridge, and main/work camera surfaces.
   - Open: the whole render-target transfer graph is not yet proven source-isomorphic.

3. Floor/environment residuals.
   - Guarded: root scene and `sceneWrap` hierarchy, Home camera surfaces, environment material ownership, floor reflection draw-state, reflector camera/renderer state, blur/swap ownership, and target sizing.
   - Open: hard horizon/fog-bed distribution still differs. Do not tune brightness or fog visually without source ownership evidence.

4. Mouse/fluid interaction parity.
   - Guarded: `Ka` mouse simulation constructor/update ownership, raycast hit-UV ownership, main-fluid pointer/diff ownership, bounded pass geometry, and interactive probe coverage.
   - Open: final feel remains a regression concern when touching interaction paths.

## Recently Closed Source Edges

| Commit | Area | Closed edge |
| --- | --- | --- |
| `9986590` | `TD` about destroy spotlight map | Source `TD.animateOut()` / `TD.destroy()` do not restore Home thumb map; `SD.init()` owns later Home map bind. |
| `a42e975` | `p1/SD/TD` spotlight init lifecycle | Source constructor leaves `spotLight.map=null` and target at default; `SD.init()` owns Home map/target/intensity. |
| `a69ad3a` | `Ir/GT` main-fluid bounded geometry | Bounded passes use source `PlaneGeometry(2-cellScale*2)` and default culling; force pass stays fullscreen. |
| `fe213c1` | `Lu` luminosity branch | Work luminosity branch runs before and independently of bloom, matching source ownership. |
| `f6e84c4` | `Lu/I1` optional blur target resize | Optional blur follows source target chain and direct resize input ownership. |
| `cdbbde7` | `eD/Pe` character camera pan | About character pan consumes shared source `Pe.mouse.normalized`. |
| `dcb3ed6` | `VA/XA` runtime `uCoords` | Work/about coords use direct viewport times capped DPR without rebuild clamp. |
| `c0b2e42` | `IT` camera denominator | Home camera update uses direct `Pe.w/Pe.h`, not rebuild `Math.max` denominators. |
| `0441731` | `VA/XA/KA` cache keys | Block materials use Three default `onBeforeCompile` cache key path, no local override. |
| `02f0b0d` | `h1/u1` cache key | Environment material uses source no-custom-cache-key ownership. |
| `43cf728` | `Lu/I1` bloom mip resize | Bloom mip chain halves directly like source, without per-step round/clamp ownership. |
| `5bb0264` | `Lo` resize inputs | Sky, displacement, thumb, and floor reflection pass direct inputs through `Lo.resize`. |

## Latest Batch Details

Latest accepted batch: `9986590 Align about destroy spotlight map ownership`.

Source evidence:

- `TD.addEvents()` waits `100ms`, then binds `J.workScene.spotLight.map=J.characterScene.renderManager.renderTargetComposite.texture`.
- `TD.animateOut()` only tweens about reveal uniforms and calls `Se.setSpotLightIntensity(0)`.
- `TD.destroy()` removes the about RAF handler, clears about block tracking/visibility, restores `spotLightParallax=true`, and removes character rotatable events.
- Neither `TD.animateOut()` nor `TD.destroy()` writes `J.workScene.spotLight.map`.

Runtime/tooling result:

- About out/destroy keeps the current spotlight map.
- `__rogierAboutLifecycleDestroyProbe()` reports map retention, parallax restore, about visibility, and rotatable event state.
- `scripts/probe-about-scroll-opacity.mjs` normalizes root `REBUILD_URL` to `/about/`, waits for source lifecycle delays, and asserts destroy-time map retention.
- `scripts/audit-renderer-output.mjs` rejects restoring `this.spotLight.map = this.homeSpotlightMap()` in about out/destroy.

Validation:

- Syntax checks passed.
- Renderer audit passed with recursive false/null count `0`.
- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Browser probes passed before commit: direct about lifecycle, desktop output, mobile output, thumb spotlight, and project media. Project media retained only known non-blocking promise noise with zero failures and zero console messages.

## Active Guardrails

Keep these guardrails when continuing Phase 1:

- Use source bundle evidence for every production behavior change.
- Keep visual captures as regression/attribution only.
- Run project media probes for shared render-manager or media changes.
- Run interactive mouse probe for mouse/fluid changes.
- Keep about lifecycle probes when touching `TD`, `Fg`, `Q1`, `eD`, spotlight map ownership, or auxiliary blocks.
- Do not reintroduce stale accepted-deviation closeout language.

## Completion Criteria

Phase 1 can close only when:

- Remaining spotlight/thumb projection differences are source-fixed or documented as unavoidable technical bridges.
- `kA/Lu/I1` transfer/composite ownership is source-isomorphic enough that no known source mismatch remains in the active graph.
- Floor/environment/fog-bed residuals are source-fixed or explicitly proven to be bridge constraints.
- Home desktop/mobile, about, and project media probes pass.
- Build, renderer audit, recursive false/null extraction, and `git diff --check` pass.
- Documentation records the final source evidence and known bridge boundaries.

## Verification Commands

Default validation for a Phase 1 rendering batch:

```sh
node --check src/client/webgl.ts
node --check scripts/probe-output-color.mjs
node --check scripts/probe-thumb-spotlight.mjs
node --check scripts/probe-about-scroll-opacity.mjs
node --check scripts/audit-renderer-output.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-phase1-audit.json
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Browser probes should be selected by touched area:

```sh
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-output CDP_PORT=9301 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-output-color.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-thumb CDP_PORT=9302 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-thumb-spotlight.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-about CDP_PORT=9303 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-about-scroll-opacity.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-media CDP_PORT=9304 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-project-media.mjs
```

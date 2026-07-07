# Phase 1 Audit: Home WebGL Source Parity

Last updated: 2026-07-07

## Purpose

This file is the Phase 1 evidence register. It records current source facts, guarded conclusions, closeout evidence, and reopen criteria.

Keep it current-only: when a source fact is guarded, place it in the relevant system section and remove stale "latest batch" wording. It is not a chronological work log. Use git for older states:

```sh
git log --oneline
git show <commit>:PHASE1_AUDIT.md
```

| Section | Purpose |
| --- | --- |
| Scope | What Phase 1 is allowed to cover. |
| Current Status | Current closeout state. |
| Open Blockers | Current Phase 1 blockers, if any. |
| Evidence Register | Current source facts and guarded rebuild facts by system. |
| Guarded Edges | Source-backed areas that should not be reopened first without new evidence. |

## Scope

Phase 1 covers Home WebGL source parity against:

- `legacy-mirror/public/assets/bundle.250f01b7.js`
- `legacy-mirror/public/assets/bundle.87ba3613.css`

The online site, `https://rogierdeboeve.com/`, is the final visual acceptance baseline. The local mirror remains the implementation source oracle, with known local-serving JS rewrites recorded below.

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

Phase 1 is closed. Closeout is based on source-backed parity evidence plus explicit guarded boundaries for areas that should only be reopened with new source-owned mismatch evidence.

| Area | State | Confidence | Current read |
| --- | --- | --- | --- |
| Architecture/lifecycle | Closed/guarded | Strong | Broad scene, route, state, and probe surfaces are source-derived. |
| Shader/render-manager parity | Closed/guarded | Strong | Shader surfaces and pass edges are aligned; `kA/Lu/I1` has no active Phase 1 mismatch. |
| Final Home visual parity | Closed/guarded | Strong | Canvas-only Home distribution and spotlight/thumb projection transfer are guarded by the final probe set. |
| Runtime stability | Clean | Strong | Build, renderer audit, and browser probes passed during final closeout. |

Current baseline policy:

- Use the online site as the final visual acceptance baseline.
- Use the local mirror bundle as the implementation source oracle.
- Account for known mirror JS rewrites before treating online/local differences as product differences.

Current decision map:

| Lane | State | Next useful move |
| --- | --- | --- |
| Home WebGL distribution | Closed/guarded | Reopen only if a new source-owned mismatch is isolated. |
| Spotlight/thumb projection | Guarded | Reopen only if final probes reveal a concrete source-owned transfer or sampling mismatch. |
| `kA/Lu/I1` transfer | Guarded | Reopen only if environment/floor evidence points into final work distribution. |
| Interaction/mouse/fluid | Guarded | Reopen only when touching interaction paths or when a specific regression is isolated. |

## Open Blockers

None for Phase 1.

## Guarded Closeout Boundaries

1. Final Home WebGL distribution.
   - Guarded: root scene and `sceneWrap` hierarchy, Home camera surfaces, environment material ownership, `u1` shader surface, `p1.addEnvironment()` cubemap start order, renderer constructor clear state, floor reflection draw-state, reflector camera/renderer state, blur/swap ownership, cubemap sampling, and target sizing.
   - Closed attribution: the mid-field block/projection brightness residual was caused by a source-owned block color fallback mismatch.
   - Guarded fix: source `yD.onProjectActive()` uses `colors.blocks || "#000000"`; rebuild now matches this fallback and probes guard active emissive.
   - Closed attribution: the later page-composite brightness residual was caused by a rebuild-only `.gl::after` dark overlay, not by Home WebGL source behavior.
   - Guarded fix: rebuild removed the non-source overlay; debug-only C1 target and band probes remain available for attribution.
   - Rule: do not tune brightness, fog, or floor color visually without source ownership evidence.

2. Spotlight/thumb projection transfer feel.
   - Guarded: `SpotLight.map` path, source spotlight constructor defaults, `SD.init()` Home map setup, direct-about map state, about destroy map retention, active-project spotlight ownership/order, thumb scene settings, thumb shader surfaces, and projection sampling guardrails.
   - Closeout evidence: `scripts/probe-thumb-spotlight.mjs` confirms raw target render, composite transfer, map ownership, spotlight position/target/intensity, active-project state, thumb scene state, and 3x3 projection sampling.
   - Rule: reopen only with a concrete source-owned transfer, map, timing, or sampling mismatch.

3. `kA/Lu/I1` composite and transfer interpretation.
   - Guarded: shader surfaces, pass settings, optional blur chain, resize ownership, runtime uniform order, GPU/LOW_RES bridge, and main/work camera surfaces.
   - Narrowed: source `I1` default `renderToScreen=true` renders C1 directly to screen; `renderTargetComposite` is retained but unused for the default visible Home path.
   - Rule: keep this as a regression guardrail, not the first suspect, unless new evidence contradicts the audit.

4. Mouse/fluid interaction parity.
   - Guarded: `Ka` mouse simulation constructor/update ownership, raycast hit-UV ownership, main-fluid pointer/diff ownership, bounded pass geometry, and interactive probe coverage.
   - Rule: keep it guarded; rerun `scripts/probe-interactive-mouse.mjs` when touching interaction paths.

## Evidence Register

### Home WebGL Distribution

Current attribution read:

- Earlier variant attribution pointed at environment/floor reflection, but later canvas-only evidence isolated the largest practical residual to active block/projection brightness.
- Desktop band deltas after the Home CTA visibility cleanup: center `-0.0066`, bands `0.35 +0.0155`, `0.45 +0.0214`, `0.55 +0.0102`, `0.75 -0.0299`.
- Mobile band deltas after the Home CTA visibility cleanup: center `+0.0188`, bands `0.35 +0.0635`, `0.45 +0.0590`, `0.55 +0.0557`, `0.75 -0.0218`, `0.85 +0.0629`.
- Canvas-only source/rebuild captures still show the residual with DOM hidden. Desktop canvas-only deltas: center `-0.0013`, bands `0.15 -0.0086`, `0.25 +0.0041`, `0.35 +0.0200`, `0.45 +0.0181`, `0.55 +0.0146`, `0.65 -0.0019`, `0.75 -0.0302`, `0.85 -0.0128`.
- Mobile canvas-only deltas: center `+0.0158`, bands `0.15 -0.0110`, `0.25 +0.0298`, `0.35 +0.0691`, `0.45 +0.0524`, `0.55 +0.0508`, `0.65 +0.0076`, `0.75 -0.0208`, `0.85 +0.0024`.
- After fixing the source blocks-color fallback, canvas-only desktop deltas are now center `+0.0027`, bands `0.15 +0.0040`, `0.25 +0.0037`, `0.35 -0.0017`, `0.45 +0.0007`, `0.55 +0.0035`, `0.65 +0.0028`, `0.75 -0.0005`, `0.85 +0.0026`.
- After fixing the source blocks-color fallback, canvas-only mobile deltas are now center `-0.0042`, bands `0.15 -0.0079`, `0.25 -0.0089`, `0.35 -0.0011`, `0.45 -0.0043`, `0.55 +0.0012`, `0.65 -0.0031`, `0.75 -0.0016`, `0.85 -0.0025`.
- Online site versus local source mirror after the mirror drift audit was visually close in the checked center luma samples: desktop `-0.0012`, mobile `-0.0005`.
- Online site versus rebuild after removing the rebuild-only Home overlay was visually close in the checked center luma samples: desktop `-0.0047`, mobile `-0.0027`.
- Interpretation: the prior desktop CTA visibility mismatch was screenshot noise, not the cause of the WebGL distribution residual.
- Interpretation: the block/projection brightness residual was source-owned by active block material color fallback, not by visual tuning.
- Interpretation: the final page-composite brightness residual was source-owned by absence of a source overlay, not by visual tuning.
- Interpretation: no active Phase 1 source-owned distribution mismatch remains after final closeout validation.

Current source read:

- Source `yD.animateIn()` sets all block `uReveal=0`, tweens all `uRevealProject -> 1` over `.5`, then calls `onProjectActive(current || first)` and activates scroll.
- Source `yD.onProjectActive()` sets spotlight intensity, clears reveal spread, hides non-active blocks with `uReveal -> 0`, reveals the active block with `uReveal -> 1` after `.2` seconds over `4` seconds, then applies ambient/main/darken/saturation/contrast/thumb/block color/directional-light state.
- Source `yD.onProjectActive()` applies block color with `t.data.colors.blocks || "#000000"`. Projects without `colors.blocks`, including Hashgraph, use black emissive.
- Source `SD.init()` prepares the Home spotlight map from `workThumbScene.renderManager.renderTargetComposite.texture`, sets spotlight position/target/intensity, and emits resize before `SD.animateIn()`.
- Source `SD.animateIn()` emits `PROJECT_ACTIVE` for DOM components after `super.animateIn()`, but source `yD` does not listen to `PROJECT_ACTIVE`; WebGL reveal remains owned by `yD.animateIn()` and later `setProjectActive()`.
- `p1.init()` calls `addEnvironment()` without awaiting the cubemap load, then continues the Home scene setup.
- `addEnvironment()` awaits the cubemap internally and later assigns `scene.environment`.
- In source order, `p1.init()` calls `addEnvironment()` after blocks/about/floating setup and `sceneWrap.add(blocksWrap)`, before `a1` floor and `h1` environment are attached to `sceneWrap`.
- Source floor `a1` creates `new i1`, uses `Xt.floorNormal`, sets `repeat` to `45,45`, creates `new Tu(60,32)`, and uses `o1` with `color:"#4a4a4a"`, `uMirror:1`, `reflectivity:.97`, and `uFloorMixStrength:15`.
- Source floor reflection assigns `tReflect` and `uMatrix` from the reflector, rotates the floor to `-PI/2`, hides the floor group during reflection render, updates the reflector, then restores visibility.
- Source environment `h1/u1` uses an icosahedron `Du(300,10)`, `side: BackSide`, `envMapIntensity:1`, `fog:false`, `dithering:true`, and `speed=5e-5`.
- Source environment fragment shader is `l1`; source environment vertex shader is `c1`.
- Source sky composite `V1/H1/z1/B1` renders a height `*.75` square raw target through `Lo`, then a cloned composite target, with no explicit clear.
- Source `z1` shader declares `uShader1Mix3`, `uShader3Scale`, and `uShaderMix`, but the constructor only binds `uShaderMix` from missing `Zs.SHADER_1_MIX_3`; `Zs` defines `SHADER_MIX`, so that runtime value is undefined.
- Source `p1.update()` calls the work render before camera/components update; environment `uTime` is written for the next frame.
- Source `p1.setLights()` adds ambient, spot, spot target, and `directionalLight1` to the scene. `directionalLight2` exists but is not added.

Current guarded rebuild facts:

- Browser output probe reports production debug clean.
- Rebuild no longer applies a non-source `.gl::after` dark overlay over the Home WebGL canvas.
- Debug-only C1 render-target and Home band probe data are exposed for attribution checks without changing production rendering.
- Scene background/fog, floor hierarchy/material, environment hierarchy/material, floor reflection draw-state, reflector target sizing, environment rotation, and low-res SwiftShader branch are source-shaped.
- Cubemap `scene.environment` is guarded beyond load success: source `CubeTextureLoader` creates a `CubeTexture`, assigns `SRGBColorSpace`, fills six images, and uses `CubeTexture` defaults for reflection mapping and `flipY=false`; the browser probe confirms those runtime fields plus default wrap/filter/mipmap/type/format and six loaded images.
- `p1.addEnvironment()` cubemap loading now starts as a source-shaped fire-and-forget call before floor/env sceneWrap attachment. The texture preload binder no longer owns cubemap startup, and browser output probes guard `sceneEnvironmentStartOrder`.
- `u1-environment` shader dump coverage now includes both source `l1` fragment and source `c1` vertex extraction.
- The environment vertex shader text in rebuild matches the source `c1` surface, including the source `vViewPosition = - mvPosition.xyz` expression and chunk order.
- Sky composite target contents are guarded for source `V1/H1/z1/B1` render-manager shape, height-based square sizing, no explicit clear, post-render `uTime` write, delayed `tSky` repeat binding, and source `z1` declared-only uniform oddities.
- Work-render-before-environment-update order is guarded by runtime probe.
- Light ownership is guarded: rebuild keeps `directionalLight2` out of the scene like source.
- Initial Home entry now matches source ownership: rebuild prepares the Home spotlight before gallery entry, does not call full active-project reveal before gallery entry, and lets `enterWorkGallery()` own active reveal/look application. Browser output probe guards `homeEntryLifecycle`.
- Active block color fallback is guarded: rebuild uses source `colors.blocks || "#000000"` fallback, and browser output probes guard active emissive against expected source value.
- Final Phase 1 closeout probes passed on Home desktop and mobile.

### Home DOM Screenshot Noise

Current source read:

- Source desktop CSS keeps `.ui-work-cta` at `opacity:0`; `.ui-work-cta:hover` reveals it.
- Source active state enables CTA interaction through `.ui-work-ul li.is-active a{pointer-events:all}` but does not set active CTA parent opacity.
- Source `gD.animateIn()` animates the inner `.c-button` opacity and text for the active item, so the button content can be ready while the parent link remains hidden until hover.
- Mobile source CSS sets `.ui-work-cta{opacity:1}`, so the mobile active CTA remains visible.

Current guarded rebuild facts:

- Rebuild desktop active CTA parent remains `opacity:0` by default and uses source-shaped active pointer events.
- Browser output probe now records and guards Home CTA parent opacity, pointer events, inner button opacity, and nonzero layout rect.
- The current desktop screenshot no longer shows the default "View project" CTA; remaining band deltas still point back to the WebGL floor/environment lane.

### Online Baseline And Mirror Drift

Current source read:

- Online `https://rogierdeboeve.com/` is the final visual acceptance baseline.
- The local mirror is still the source oracle for implementation attribution.
- Online HTML/CSS/service-worker assets matched the mirror during the drift audit.
- Online `/assets/bundle.250f01b7.js` differs from `legacy-mirror/public/assets/bundle.250f01b7.js` because the mirror script rewrites local-serving behavior.

Known local JS rewrites:

- Service-worker registration is disabled locally.
- `detect-gpu` benchmark URLs are rewritten from the remote unpkg path to `/vendor/detect-gpu/benchmarks`.
- The local mirror wraps GPU check failure with a tier-3 fallback for local robustness.

Current guarded rebuild facts:

- Local `public/vendor/detect-gpu/benchmarks` matched the remote benchmark JSON during the drift audit.
- The known rewrites did not produce meaningful visual drift in the checked Home desktop/mobile brightness probes.
- Future visual acceptance should compare against the online site first, then use the source bundle to attribute and implement any supported differences.

### Renderer State

Current source read:

- Source `qw` creates `WebGLRenderer` with `alpha:true`, `antialias:false`, `preserveDrawingBuffer:false`, `powerPreference:"high-performance"`, `stencil:false`, and `depth:false`.
- Source `qw` sets `autoClear=false`, assigns `outputColorSpace=Gt`, and appends the canvas.
- Source `qw` does not call `setClearColor` in the constructor.

Current guarded rebuild facts:

- Rebuild no longer sets `SOURCE_WORK_BG` as the renderer clear color in the constructor.
- Runtime output probes publish `clearColorMode`, `clearColor`, and `clearAlpha`.
- Browser output probes guard the source-shaped clear state: no constructor clear-color override, default clear color `[0,0,0]`, and clear alpha `0`.
- Renderer audit rejects reintroducing constructor-time `this.renderer.setClearColor(...)`.

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
- Source `SD.init()` binds `J.workScene.spotLight.map` to `J.workThumbScene.renderManager.renderTargetComposite.texture`, sets position `(0, 0, 3.7)`, target `(0, 0, -8)`, intensity `220`, and emits resize before gallery entry.
- Source thumb render manager `Lo.update()` renders the thumb scene into `renderTargetA`, binds that texture to the composite screen material, renders into `renderTargetComposite`, then resets the renderer target to the canvas.
- Source `x1` uses one composite screen material for the thumb scene and keeps `renderToScreen=false`.
- `TD.addEvents()` binds about spotlight map after its delayed setup.
- `TD.animateOut()` and `TD.destroy()` do not restore the Home thumb composite; `SD.init()` owns the later Home bind.

Current guarded rebuild facts:

- Spotlight constructor defaults, direct-about map state, about destroy map retention, active-project spotlight ownership/order, thumb scene settings, shader surfaces, and projection sampling are guarded.
- `scripts/probe-thumb-spotlight.mjs` currently confirms `thumbRenderTransfer.stepsMatchExpected=true`, `spotlightMapReceivesCompositeTexture=true`, `thumbComposite.stateUniformsMatch=true`, and source-shaped thumb target/composite state.
- The same probe confirms Home spotlight intensity `220`, position `[0,0,3.7]`, target `[0,0,-8]`, shadow camera FOV `90`, map projection through Three r164 `spotLightMap`, and no `castShadow` dependency.
- Active-bounds projection sampling is guarded with `sampleCount=9`, `inMapCoverage=0.3333`, and `mapLumaMean=0.1441`; the thumb and composite target luma both read `0.5015` in the current desktop run.
- Interpretation: no current source-owned projection transfer mismatch is identified; keep this lane guarded and move Phase 1 to final closeout audit.

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

## Final Closeout Evidence

Final closeout was run against the current build on 2026-07-07.

Static/build checks:

- `node --check src/client/webgl.ts`
- `node --check scripts/dump-va-shader.mjs`
- `node --check scripts/audit-renderer-output.mjs`
- `node --check scripts/probe-output-color.mjs`
- `node --check scripts/probe-thumb-spotlight.mjs`
- `node --check scripts/probe-project-media.mjs`
- `node --check scripts/probe-about-scroll-opacity.mjs`
- `node --check scripts/probe-interactive-mouse.mjs`
- `node scripts/audit-renderer-output.mjs > /tmp/rd-final-phase1-audit.json`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`

Browser probes:

- Home desktop output probe: `0` failures, `0` exceptions, `0` shader console messages; renderer clear state, Home entry lifecycle, and active block emissive fallback are guarded.
- Home mobile output probe: `0` failures, `0` exceptions, `0` shader console messages; renderer clear state, Home entry lifecycle, and active block emissive fallback are guarded.
- Thumb spotlight probe: `0` failures, `0` exceptions; raw-to-composite transfer order, composite map ownership, spotlight state, thumb composite state, and 3x3 projection sampling are guarded.
- Project media probe: final serial run has `0` failures, `0` exceptions, and `0` shader console messages for `gc-2026` and `hashgraph-vc`; both report `5` visible media planes with source-shaped shader surfaces, constructor defaults, and background state.
- About desktop probe: `0` failures, `0` exceptions, `0` shader console messages; scroll opacity matches source `1`, and destroy keeps the current spotlight map.
- About mobile probe: `0` failures, `0` exceptions, `0` shader console messages; scroll opacity matches source `0.3507`, and destroy keeps the current spotlight map.
- Interactive mouse probe: `0` failures, `0` exceptions, `0` shader console messages; mouse simulation, active raycast target ownership, and main-fluid pointer response are guarded.

Post-close online baseline evidence:

- Online site versus local source mirror: desktop center luma delta `-0.0012`, mobile center luma delta `-0.0005`.
- Online site versus rebuild after overlay removal: desktop center luma delta `-0.0047`, mobile center luma delta `-0.0027`.
- This closed the user-visible Home brightness gap without parameter tuning.

Renderer audit evidence:

- Three revision is `164`.
- Composite-transfer debug rejection guards are clean: no rejected composite transfer, spotlight map off, or thumb colorspace shortcuts.
- Recursive false/null constructor and runtime sampler surfaces are covered by audit paths for `Lo`, `C1`, helper materials, fluid, spotlight defaults, environment, floor, thumb, sky, and auxiliary materials.

## Guarded Edges

These are current boundaries, grouped by system instead of discovery time.

| System | Guarded source edge |
| --- | --- |
| Home WebGL distribution | `Lo` resize inputs pass direct source dimensions for sky, displacement, thumb, and floor reflection. |
| Home WebGL distribution | `h1/u1` environment material uses source no-custom-cache-key ownership. |
| Home WebGL distribution | Cubemap loader defaults and `scene.environment` sampling fields are guarded by browser probe. |
| Home WebGL distribution | `p1.addEnvironment()` starts cubemap loading fire-and-forget before floor/env sceneWrap attachment. |
| Home WebGL distribution | `u1` environment shader surface is guarded through source `l1` fragment and `c1` vertex extraction. |
| Home WebGL distribution | Sky composite `V1/H1/z1/B1` target chain and source `z1` missing-uniform behavior are guarded by audit and browser probe. |
| Home WebGL distribution | Initial Home entry does not run WebGL active-project reveal before gallery entry; source-shaped spotlight prep is guarded by browser probe. |
| Home WebGL distribution | Active block emissive uses source `colors.blocks || "#000000"` fallback and is guarded by browser probe. |
| Home WebGL distribution | Rebuild has no non-source `.gl::after` Home dark overlay; online site remains the final visual baseline. |
| Home DOM screenshot noise | Desktop active CTA parent remains hidden until hover while its inner button animation can complete; mobile CTA remains visible. |
| Renderer state | Renderer constructor has no source `setClearColor`; probes guard default clear color `[0,0,0]` and clear alpha `0`. |
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
| Spotlight/thumb | Thumb render manager transfer follows source `Lo` raw target to composite target order. |
| Spotlight/thumb | Home `SpotLight.map` receives the thumb composite texture and projection samples the active bounds through the Three r164 spotlight-map path. |
| Interaction/about | Bounded fluid passes use source geometry and default culling; force pass stays fullscreen. |
| Interaction/about | About character pan consumes shared source `Pe.mouse.normalized`. |

## Completion Criteria

Phase 1 is closed because:

- Final Home desktop/mobile distribution residuals are source-fixed or guarded by source evidence.
- Spotlight/thumb projection transfer remains guarded by current runtime probes.
- `kA/Lu/I1` transfer/composite ownership is source-isomorphic enough that no known source mismatch remains in the active graph.
- Home desktop/mobile, about, project media, and interactive mouse probes pass.
- Build, renderer audit, recursive false/null extraction, and `git diff --check` pass.
- Documentation records the final source evidence and guarded reopen boundaries.

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

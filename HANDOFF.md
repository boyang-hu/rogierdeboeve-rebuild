# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-06

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
  - source `Xt.loadTexture()` immediate texture-object binding for blue-noise, perlin-1, perlin-2, and floor-normal
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
  - rebuild has source-shaped passes, target clone ownership, work/main pass-material ownership, and source `Lu/kA/I1` settings ownership, but transfer interpretation and exact composite behavior are still not complete.
- The original projects the thumb render target through `SpotLight.map`. The rebuild now guards the source no-explicit-`castShadow` `SpotLight.map` path, source `Qm/Iw` spotlight default/shadow projection state, source `SD.init()` fixed Home entry intensity `220`, source `yD.onProjectActive()` active-project spotlight payload-or-max ownership, source `yD.onProjectActive()` active-project application order, source `yD -> w1` negative-progress thumb wrapping at nonzero progress, source `yD.updateScene()` gallery-progress update order, source `yD.updateScene()` gallery roll/zoom `bo/Yi` dynamics, source `T1/x1` thumb scene background/camera/settings ownership, source `Lo/x1` raw-to-composite target transfer order, and source spotlight projection sampling through the Three spotlight-map matrix/chunk path, but the projected thumb transfer feel is still not exact.
- Source `p1` floor/environment hierarchy is guarded for root scene direct child order, `sceneWrap -> blocksWrap/floor/env` child order, `demorgen`-derived environment rotation, source `setBlocks()` carousel radius/position/lookAt/`sceneWrap.z`/`lightRadius` scalar distribution, source `setLights()` max spotlight scalar ownership, source `SD.init()` Home spotlight intensity ownership, and source `yD.onProjectActive()` active-project spotlight fallback/application-order ownership, but the visible fog-bed/horizon still is not 1:1.
- Ordinary `VA-work` now uses direct source-shaped `HA/zA` templates, and the generated residual report shows vertex/fragment deltas `0`. The raw `uUvOffset` shader declaration is source-aligned as `vec3`; the documented bridge is runtime-only because mirrored source `VA.customUniforms` constructs `uUvOffset` from `Vector2`, source `GA` writes only `.x/.y`, and the source shader reads `uUvOffset.xy`. The old source `SPECULAR` macro is restored in `zA`; runtime probes guard that ordinary work is `MeshStandardMaterial`, not `MeshPhysicalMaterial`, so `PHYSICAL` is inactive.
- Source `lA/aA` main composite shader text now dumps as source-shaped, including helper surface, vignette local, uniform order, and the source unused `tMouseSim` material uniform. This is shader/material surface parity, not proof that the whole `kA/Lu/I1` transfer chain is complete.
- Source `Lu/kA/I1` composite material construction attribution is now guarded: `Lu.initRenderer()` creates `lA`, `kA` immediately replaces it with `OA`, and `I1` directly constructs `C1`, so the rebuild `mainCompositeMaterial` is retained `lA/aA` source-surface evidence and not the active default Home `I1/C1` screen material.
- Source `ag` main-fluid pass shader text now dumps as source-shaped for advection, bounds, force, viscosity, divergence, poisson, and pressure. The source seven-FBO topology including default-disabled `eA` viscosity is now guarded, but this is pass/topology parity, not proof that the whole Home fluid/composite feel is complete.
- Source `$1/j1/W1/G1` project-media composite shader text now dumps as source-shaped, including helper surface, `luminance(...)`, source uniform order, and the inert `mixed` pass-through body. This is shader-surface parity, not proof that the whole project-media or `kA/Lu/I1` transfer chain is complete.
- Source `$1/j1/Lo` project-media clear ownership is now guarded: `j1.settings.clear` is source-present but unused by `Lo.update()`, while source `$1.update()` owns the temporary `renderer.autoClear=true` branch around `super.update(...)` and restores `false`.
- Source `k1/O1/Lo` displacement target sizing is now guarded: source `k1.resize()` passes `height/10` into `O1/Lo.resize(...)`, and source `Lo.resize()` multiplies by DPR before rounding, so displacement raw/composite targets are `round((height / 10) * dpr)`.
- Source `p1` root scene direct-child order is now guarded: lights are added first, `setAboutBlocks()`/`setFloatingBlocks()` add their direct scene groups next, and `sceneWrap` is added last after it owns `blocksWrap/floor/env`.
- Source `i1/a1` floor reflection normal constructor/runtime ownership is now guarded: `i1` constructs the reflection normal as a zero vector, while `i1.update()` owns the later `(0,0,1)` write and reflector-rotation application.
- Source `i1/a1` floor reflection screen-triangle ownership is now guarded: `i1` constructs `screenTriangle` with `n1()`, creates the blur screen from that owned geometry and blur material, disables frustum culling on the screen, and disposes `screenTriangle` directly in `destroy()`.
- Source `i1/a1` floor reflection blur target field-swap ownership is now guarded: the normal blur loop reads/writes `renderTargetRead/renderTargetWrite` fields directly, swaps those fields inside the loop, and updates the reflection uniform from the swapped read field after each pass.
- Source `i1` floor reflection renderer-state ownership is now guarded: `i1.update()` captures previous render target/XR/shadow state, disables XR and shadow auto-update during raw/blur reflection, conditionally clears the raw target under `autoClear=false`, and restores XR/shadow/previous target afterward.
- Source `i1` floor reflection camera/texture-matrix/clip-plane update order is now guarded: the reflector update records the source `lookAt -> far -> updateMatrixWorld -> projection copy` order, texture matrix bias/projection/camera-inverse/reflector-matrix multiplication order, and oblique projection-row writes `[2,6,10,14]`.
- Source `XA/KA` auxiliary material constructor state and shader ownership are now guarded: about keeps `XA` depth-disabled `renderOrder=10` state and direct `jA/WA` shader surfaces, floating keeps `KA` default depth state, no material `renderOrder`, and direct `YA/qA` shader surfaces; both auxiliary materials use source `uMouse` plus `uUvOffsetScale=1` constructor defaults.
- Source `VA/XA/KA` block material constructor defaults are now guarded: ordinary work and auxiliary materials construct source-owned `uReveal`, `uMouseLightness`, `uMouseSpeed`, `tMouseSim`, `tMouseSim2`, and `tDisplacement` defaults, while source `yD`, `Se`, `GA`, `p1`, and `$A` own the later runtime writes. About `$A` now has local `Ka` writeback for `tMouseSim/uMouseSpeed/tDisplacement`; floating `ZA/KA` sampler uniforms stay constructor-null because source `ZA.update()` does not write them.
- Source `Fg` about floating-block lifecycle is now guarded: setup keeps floating hidden, `animateIn` flips visibility in the `uReveal` tween `onStart`, `animateOut` hides on `onComplete`, and `translationZ` receives `.005 * abs(page scroll velocity)` from the Lenis page-scroll state.
- Source `TD` about visual lifecycle is now guarded: setup keeps the previous spotlight map during the initial source `100ms` delay, then enables the about visual RAF path, binds the character composite texture as `spotLight.map`, forces resize, waits the source nested `200ms`, and only then applies the initial about scroll/spotlight state.
- Source `Q1/eD/TD` about character rotatable lifecycle is now guarded: character content is wrapped as `cameraPanGroup -> rotatableMesh -> character`, TD enables passive mouse/touch rotatable events after the delayed character spotlight-map bind, TD removes those events on out/destroy, and the character target render path applies source horizontal damping, camera pan clamp, and auto-rotation.
- `Ka` mouse simulation now uses source `rA/oA` shader surfaces and guarded source comments/placeholders; the interactive probe verifies source-shaped screen/local mouse response and `ag/qT` fluid pointer/center response. Active screen/local mouse-simulation resize ownership is also guarded: source `Lu` passes render size divided by `10`, source `GA` passes plane scale, and source `Ka` forwards those values without rebuild clamps or post-rounding. Source `Ka.raycast()` direct hit-UV target writes are now guarded without a rebuild-owned clamp. Exact final Home visual/feel parity is still open.
- Source `yD` gallery scroll runtime rounding is now guarded: source `onRaf()` uses `Yi(...)` for `scroll.diff` and `scroll.animated`, and source `updateScene()` persists roll `sceneRotation` through `bo(...)` plus `Yi(...)`; the rebuild uses source-rounded helpers for those paths instead of an unrounded local `lerp`.
- Source `yD/Qe.workState` gallery scroll persistence is now guarded: the session-backed rebuild state carries source runtime scroll fields including `diff`, `velocity`, and `targetPlusDiff`, plus index/hooks/active project/scene rotation.
- Renderer audit render-target default diagnostics now distinguish expected false values from failed checks: `generateMipmaps`, `depthBuffer`, and `stencilBuffer` defaults are reported as `actual` / `expected` / `matchesExpected`, and the Node-only renderer probe reports `status:"unavailable"` when `OffscreenCanvas` is absent instead of `null`.
- Helper pass shader text for `ig` FXAA, `sg` luminosity, `rg` bloom blur, `Na` standard blur, `cg` bloom composite, and `Ka/rA/oA` mouse simulation now dumps source-shaped with vertex/fragment deltas `0`. The `rg/Na/ig` helper constructor surface is also guarded: source zero-vector `uResolution` defaults are preserved, and `rg` keeps source unused null samplers plus constructor direction `[0.5,0.5]`. Source `Lu/I1` runtime ownership of `rg.uDirection` is guarded as shared direction-vector assignment, while standard blur `Na.uDirection` remains constructor-owned.
- Source `p1.setMouseFactor()` ownership of ordinary work `VA.uMouseFactor` is now guarded for constructor default `0`, gallery entry `0 -> 1`, preview hover `.25 -> 1`, active uniform parity, and all-work uniform fan-out.
- Source `Se.setAmbientLight()` ownership is now guarded as a delegate to source-shaped `setAmbientColor()` and `setAmbientIntensity()`: ambient color tweens `J.workScene.ambientLight.color`, env `uDarkenColor` follows that ambient light color on update, ambient intensity tweens `J.workScene.ambientLight.intensity`, and rebuild-only background material uniforms are not source `Se` ambient targets.
- Source `Se.setBlocksColor()` ownership is now guarded as a no-kill fan-out setter for every ordinary work material emissive color. It no longer keeps rebuild-only block-color tween registry state, retargets only the active block, or writes custom uniforms from this setter.
- Source thumb state setter ownership is now guarded as no-kill state tween ownership: `Se.setThumbDarknessIntensity()`, `setThumbDarknessColor()`, `setThumbSaturation()`, and `setThumbMouseLightness()` keep their source `t===0` direct branches, otherwise tween `settings.thumb` state and fan out to thumb composite uniforms or work material `uMouseLightness` on update, without rebuild-owned tween registries.
- Source `Se.settings` scalar/media setter ownership is now guarded for the source no-kill boundary: `setDarken()`, `setSaturation()`, `setContrast()`, `showScene()`, `setFluidStrength()`, and `setMediaOpacity()` do not keep rebuild-owned tween registries or pre-emptive kills, while source kill-owned `setRevealSpread()` and `setEnvRotation()` retain their kill behavior.
- Source `p1/Ya` home camera construction and resize projection ownership is now guarded: home camera stays `Ya(55, innerWidth / innerHeight, 1, 2e3)`, initial z `5.5`, and resize projection stays on the `Ya.resize()` plus `Iu.resize()` aspect/update path.
- Source `yg/U1/I1` main raw camera construction and resize projection ownership is now guarded: main raw camera stays `Ya(Ef(...), Pe.aspect, 1, distance*2)` with distance `1000`, and resize projection stays on the source `yg.resize()` `Ef(...)` FOV/aspect/update path.
- Source `I1/C1` main composite runtime uniform order is now guarded: source `I1.update()` runs optional fluid, then writes `C1.tScene`, the four bool uniforms, and `tLensflare` immediately before assigning/rendering the `C1` screen path, while `U1.update()` still owns the later `C1.uTime` write.
- Source `Xt.loadTexture()` immediate texture-object binding is now guarded for blue-noise, perlin-1, perlin-2, and floor-normal: uniforms receive the immediate `Texture` object before image onload, and probes verify onload does not replace that object.
- Source `u1` environment shader constants are now guarded against the misleading nearby `BA/Z1` constant groups: active `u1` reads `Qn`, so `uShader1Speed` remains `0.5`, `uShader1Mix3` remains `1.5`, and declared-only `uShader1Mix2` stays unbound at runtime.
- Source `u1` environment material dithering ownership is now guarded: source `h1` constructs `new u1({side:hn,envMapIntensity:Qn.ENVMAP_INTENSITY,fog:!1})` without a `dithering` constructor param, and source `u1` sets `this.dithering=true` after `super(e)`.
- Source `Qm/Iw` spotlight defaults and shadow projection ownership are now guarded: source `Qm` keeps distance `0`, decay `2`, `map=null`, and `shadow=new Iw`; source `Iw` keeps focus `1`, camera `50/1/.5/500`, shadow map size `512x512`, and updates projection FOV/far from angle/focus and `distance || camera.far`.
- Source `yD.onProjectActive()` active-project spotlight, application-order, and woosh ownership are now guarded: `SD.init()` keeps the fixed Home entry `220` baseline, then active-project order runs spotlight payload-or-max, reveal spread, source-owned woosh, active `uReveal` tweens, project look setters, and final directional light `1.5`; current local project data has no spotlight payloads, so the expected runtime spotlight value remains `220`.
- Source `nD/u1` sky composite binding lifecycle is now guarded: source `u1` constructs `customUniforms.tSky` as `null`; source `nD.init()` performs first resize, waits `100ms`, binds `C1.tWork/tMedia/tMouseSim`, sets sky composite repeat wrapping, binds env `tSky`, resizes again, then starts RAF.
- Source `ag/eA` main-fluid viscosity topology is now guarded: source `ag` constructs seven FloatType/depthless FBOs including `viscosity_0/1`, always constructs `eA`, and keeps the viscosity branch default-disabled with intensity `30` and iterations `5`.
- Source `I1/ag` raw main-fluid resize ownership is now guarded: source `I1.resize()` passes `Fa(renderSize) / 2 / 3` into `ag.onResize(...)`, and source `ag.calcSizes(e,t)` preserves raw incoming `e,t` for `fboSize`, `cellScale`, and target `setSize(...)` while rounding only internal simulation fields through `resolution`.
- Source `a1/i1` floor-reflection draw-state and `i1` renderer-state are now guarded: floor `onBeforeRender` hides only the floor component group while reflecting the full Home scene, `sceneWrap`/blocks/environment remain visible in the reflected scene, the reflector raw/blur pass disables source-owned renderer state, and visibility plus renderer state restore after the reflector update.

Latest Phase 1 batch:

- Aligned source `Ka.raycast()` direct hit-UV target writes in the work/local mouse simulation path without changing shader text, render targets, pass behavior, project data, route behavior, visual constants, or target sizing.
- Source evidence: `Ka.raycast({x,y})` normalizes with `Pe.w/Pe.h`, intersects `[this.rayCastMesh]`, and when a hit exists writes `targetPos.x/y` directly from `this.intersects[0].uv.x/y`; source does not clamp the hit UV before `Ka.update()` lerps toward `targetPos`.
- The rebuild now writes `item.mouseTarget.set(hit.uv.x, hit.uv.y)` directly instead of using `MathUtils.clamp(...)`.
- Output and interactive probes expose/assert `raycastUvWriteMode=source-Ka-raycast-hit-uv-direct-targetPos-no-clamp`.
- Renderer audit checks source `Ka.raycast()` direct-write anchors, rebuild direct-write coverage, absence of the old clamp path, and output/interactive probe coverage.
- Previous committed batch was `4d7f34f Guard thumb render transfer order`.
- Phase 1 remains open for spotlight/thumb projection transfer feel, broader `kA/Lu/I1` transfer/composite interpretation, and floor/environment residuals.

## Validation Status

Last verified in the latest session:

```sh
git diff --check
node --check scripts/audit-renderer-output.mjs
node --check scripts/probe-output-color.mjs
node --check scripts/probe-thumb-spotlight.mjs
node --check scripts/probe-project-media.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-thumb-transfer-audit.json
node -e 'const fs=require("fs"); const o=JSON.parse(fs.readFileSync("/tmp/rd-thumb-transfer-audit.json","utf8")); const bad=[]; function walk(v,p=[]){ if(v===false||v===null) bad.push([p.join("."),v]); else if(Array.isArray(v)) v.forEach((x,i)=>walk(x,p.concat(i))); else if(v&&typeof v==="object") for(const [k,x] of Object.entries(v)) walk(x,p.concat(k)); } walk(o); console.log(`false/null entries ${bad.length}`); for (const [p,v] of bad) console.log(p,v); if (bad.length) process.exit(1);'
ASTRO_TELEMETRY_DISABLED=1 npm run build
CHROME_PATH=/usr/bin/google-chrome-stable REBUILD_URL=http://127.0.0.1:5173 OUT_DIR=/tmp/rd-thumb-transfer-output-desktop VIEWPORT=desktop CDP_PORT=9360 node scripts/probe-output-color.mjs
CHROME_PATH=/usr/bin/google-chrome-stable REBUILD_URL=http://127.0.0.1:5173 OUT_DIR=/tmp/rd-thumb-transfer-output-mobile VIEWPORT=mobile CDP_PORT=9361 node scripts/probe-output-color.mjs
CHROME_PATH=/usr/bin/google-chrome-stable REBUILD_URL=http://127.0.0.1:5173 OUT_DIR=/tmp/rd-thumb-transfer-thumb-desktop VIEWPORT=desktop CDP_PORT=9362 node scripts/probe-thumb-spotlight.mjs
CHROME_PATH=/usr/bin/google-chrome-stable REBUILD_URL=http://127.0.0.1:5173 OUT_DIR=/tmp/rd-thumb-transfer-thumb-mobile VIEWPORT=mobile CDP_PORT=9363 node scripts/probe-thumb-spotlight.mjs
CHROME_PATH=/usr/bin/google-chrome-stable REBUILD_URL=http://127.0.0.1:5173 OUT_DIR=/tmp/rd-thumb-transfer-media CDP_PORT=9364 node scripts/probe-project-media.mjs
```

All relevant checks passed in the `Lo/x1/T1` thumb render-transfer guardrail batch. Renderer audit wrote `/tmp/rd-thumb-transfer-audit.json`; recursive false/null extraction printed `false/null entries 0`. Desktop/mobile thumb spotlight probes passed and confirmed `thumbRenderTransfer.stepsMatchExpected=true`, `renderToScreen=false`, `tSceneRole=renderTargetA.texture`, `finalRenderTargetRole=canvas`, and `spotlightMapRole=renderTargetComposite.texture`. Desktop/mobile output probes passed with no failures/exceptions/console messages and retained the prior floor-reflection camera guardrail. Project-media probe passed, and project media retained `5/5` visible media tracks on `/gc-2026/` and `/hashgraph-vc/`.

`npm exec tsc -- --noEmit --pretty false` remains a known blocked check because the existing TypeScript config deprecation for `baseUrl` requires `ignoreDeprecations: "6.0"` under TS7. This is pre-existing and not caused by this thumb render-transfer batch.

Runtime QA was run because the batch touched Home WebGL thumb render-transfer probe instrumentation and spotlight-map input attribution.

Verified:

- Renderer audit passed for the thumb render-transfer batch: `/tmp/rd-thumb-transfer-audit.json`.
- Recursive false/null audit output is empty.
- Desktop and mobile output probes passed: `/tmp/rd-thumb-transfer-output-desktop`, `/tmp/rd-thumb-transfer-output-mobile`.
- Desktop and mobile thumb spotlight probes passed: `/tmp/rd-thumb-transfer-thumb-desktop`, `/tmp/rd-thumb-transfer-thumb-mobile`.
- Project-media probe passed for `/gc-2026/` and `/hashgraph-vc/`, both retaining `5/5` visible media tracks: `/tmp/rd-thumb-transfer-media`.
- Project media remains a regression gate, not proof of Home parity.
- Existing source render-manager, active reveal, spotlight map, color-state, carousel/environment hierarchy, floor reflection, and project-media guardrails remain in the audit/probe surface.

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
   - Current rebuild now guards the no-explicit-`castShadow` `SpotLight.map` projection path, source `SD.init()` Home entry intensity `220`, source `yD.onProjectActive()` active-project spotlight payload-or-max ownership and application order, source `p1` desktop/mobile spotlight parallax branch, source `yD.updateScene()` gallery-progress order and roll/zoom `bo/Yi` dynamics, source `T1/x1` thumb scene background/camera/settings ownership, and source-shaped `M1/x1` thumb shader text, but the projected thumb content/transfer feel is still not exact.
2. Continue remaining composite/render-manager transfer evidence from `bundle.250f01b7.js`.
   - `A1-pre-composite` and `OA-work-composite` shader fragments are now source-shaped.
   - `u1-environment` and `z1-sky-composite` shader fragments are now source-shaped.
   - `ag/eA` main-fluid pass shaders and seven-target topology are now source-shaped; do not reformat them away from the source literal surface or drop the default-disabled viscosity branch.
   - `$1/j1/W1/G1` media composite shader text is now source-shaped; do not remove its inert helper/luminance surface just because the active body is pass-through.
   - `I1` optional blur now follows `renderTargetA -> renderTargetBlurA -> renderTargetBlurB`; do not restore the old `compositeTarget` blur bridge.
   - Source `Lu/kA/I1` init settings, `I1` lensflare defaults, `Qe.gpuCheck()/Le.GPU_TIER/Le.LOW_RES`, and `yg/U1/I1` main raw camera surface are now guarded; next source work should look at remaining `kA`, `Lu`, and `I1` transfer/target/composite interpretation rather than repeating settings, GPU bridge, or camera-surface ownership.
   - Port only source behavior and values as the 1:1 implementation spec; avoid filtering changes by expected visual payoff.
3. Revisit floor/environment distribution from source evidence.
   - Current rebuild now guards source `p1` root scene direct-child order, `sceneWrap` child order, `p1/Ya` home camera surface ownership, `yg/U1/I1` main raw camera surface ownership, `demorgen`-derived environment rotation, `p1.init()` scene background/fog ownership, `p1.setBlocks()` carousel/lightRadius scalar ownership, `p1.setLights()` max spotlight scalar ownership, `Se.setAmbientLight()` ambient/env color ownership, `Se.setBlocksColor()` all-work emissive fan-out ownership, `Se` thumb state no-kill setter ownership, `Se.settings` scalar/media no-kill versus kill-owned setter ownership, source `a1/i1` floor-reflection draw-state, and source `i1` reflection renderer-state save/disable/raw/blur/restore ownership.
   - The visible fog-bed/horizon still differs from the source.
   - Do not tune brightness or fog visually without bundle-backed ownership.
4. Keep and extend the mouse/fluid regression guardrail when touching interaction paths.
   - Original `GA` uses `Ka` mouse simulation with `tMouseSim`, `tMouseSim2`, and `tDisplacement`.
   - Rebuild now has the source-shaped render-target structure, `rA/oA` shader surface, and `scripts/probe-interactive-mouse.mjs` for source-shaped screen/local/main-fluid response.
   - Future mouse/fluid changes should run the interactive probe, but the current next implementation work should stay on clearer remaining source mismatches unless new mouse/fluid source evidence appears.
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
1. Continue analyzing original source classes/shaders, especially `p1`, `GA`, `T1/w1/E1`, `Se`, and main composite/render-manager code around `A1`, `OA`, `kA`, `Lu`, and `I1`.
2. Improve home WebGL fidelity, especially the original spotlight/thumb render-target projection, postprocessing/composite, and mouse/fluid simulation.
3. After each change, run `npm run build`, `git diff --check`, and browser QA on:
   - `/ ?skip-preloader`
   - `/gc-2026/?skip-preloader`

Be honest in status updates: it is not fully 1:1 yet.
```

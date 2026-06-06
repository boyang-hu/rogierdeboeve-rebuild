# Phase 1 Audit: Home WebGL Source Parity

Last updated: 2026-06-06

## Scope

Phase 1 covers Home WebGL parity against the mirrored original bundle, not screenshot matching:

- `legacy-mirror/public/assets/bundle.250f01b7.js`
- `legacy-mirror/public/assets/bundle.87ba3613.css`

Primary source areas:

- `p1`: home work scene composition, lights, carousel, floor, environment, about/floating blocks
- `GA` / `VA`: project block instancing, standard material shader injection, local mouse simulation, reveal/alpha tail
- `T1` / `w1` / `E1`: thumbnail scene and strip render target
- `A1` / `C1`: main pre-composite material
- `OA` / `kA` / `Lu`: work render manager and final composite
- `Ka`: mouse simulation
- `Se`: visual state setter ownership
- `TD` / `Fg`: route-specific about/floating visual ownership

## Current Phase 1 Status

Phase 1 is reopened and not complete as of 2026-06-06. The previous S1-53 closeout accepted too many visible deviations for the current 1:1 rebuild goal. Treat the older "complete with accepted deviations" sections below as historical evidence, not the active execution standard.

Estimated status:

- Architecture parity: 75-80%
- Shader/render-manager parity: 60-70%
- Final home visual parity: 55-65%
- Runtime stability: currently good based on build, marker checks, and Chrome CDP smoke across home, about, and two project pages

The rebuild now has the correct broad shape: `sceneWrap -> blocksWrap -> GA`, source-sized grids, MeshStandardMaterial with source-style shader patching, real `SpotLight.map`, thumb render target, A1/OA split composite passes, bloom mip chains, Ka-style ping-pong mouse simulation, per-work-item local mouse simulation, source-shaped floor/environment bridges, and about/floating auxiliary blocks. That is implementation progress, not completion.

Current visible blockers for Phase 1:

- Home background/floor/environment still has a hard horizontal horizon instead of the source's softer fog/floor blend.
- Home work cubes and thumb projection still do not match the source's brightness, depth, and projection feel.
- `VA/GA` still use a stable Three 0.184 shader bridge, not a byte-for-byte source `HA/zA` replacement.
- `A1/OA/kA/Lu` are source-shaped in pieces but not a fully source-isomorphic render-manager graph.
- Mouse/fluid simulation is structurally present but not yet interactively verified 1:1.
- Project pages are regression gates; they are stable but not proof that Home WebGL Phase 1 is complete.

Phase 2 should remain paused until these Phase 1 blockers are either source-fixed or explicitly reviewed against the live source by the user.

Current production reference after S1-42:

| Measurement | Current result | Meaning |
| --- | ---: | --- |
| Home default luma | `~0.225` | Major improvement from the early `~0.019-0.031` baseline; ordinary texture color-space was the largest fixed contributor. |
| Old sRGB texture rollback | `~0.157` | Confirms S1-40 is a real source-proven production fix. |
| Scene transfer debug | `~0.333` | Final `OA/CA` transfer interpretation still has measurable headroom, but is not source-proven for production. |
| Source-shaped work composite debug | `~0.144-0.150` | Broad pass-order/source-ownership rewiring is still negative in the current bridge. |

## Decision Checkpoint

The previous goal was directionally right, but too broad for the current state. "Rebuild the whole site 1:1" is useful as the overall goal; for execution, Phase 1 should now be treated as the active goal until closed. Project detail pages are closer and should remain regression checks, not the main target of new risky rendering changes.

Recommended cadence:

- Do not attempt the rest of Phase 1 in one pass. The remaining work is coupled enough that a large shader/render-manager pass can pass build while making visual attribution worse.
- Do 6-10 differences per batch only when they are low-risk constants, ownership, documentation, or route-state corrections in one chain.
- Do 3-5 differences per batch for shader, render-target, render-order, or material-replacement changes.
- Run full QA and commit once per batch, not once per tiny sub-step.

Current next batch: continue Phase 1 Home WebGL. Prioritize source-backed work in this order: `VA/GA` output and spotlight/thumb projection, then `A1/OA/kA/Lu` render-manager graph parity, while keeping project pages as regression gates. Phase 2 should not start yet.

## Phase 1 Remaining Execution Audit

This table is the current working board for completing Phase 1. It supersedes the older scattered "next batch" notes below without deleting their evidence history.

| Priority | ID | Chain | Source evidence summary | Rebuild status | Risk | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | S1-43 | Ordinary `VA` vertex/body residual diff | Source `VA` still fully assigns `HA/zA`; rebuild uses a stable chunk bridge. Recent evidence says fragment light chunks, physical response variants, world-position unclamp, and source-like early vertex `screenUv` attribution are low-impact. | Stable bridge is close and production-safe; full `HA` replacement was rejected by console-aware QA. | Medium-high | Stop chasing single `HA` UV/world-position deltas as the main brightness gap. Continue only with residual generated-vs-source body/vertex diagnostics if a specific visible mismatch appears; otherwise prioritize proven transfer/projection contributors. |
| 2 | S1-44 | `OA/CA` final `tScene` transfer | Source `CA` darken formula, blend table, `uDarken=.2`, renderer output `srgb`, and render-target defaults are confirmed. `debug-composite-transfer=1` still moves final home luma strongly, but no source evidence supports promoting it. | Rebuild has source-shaped darken, saturation, bloom and stage probes. Transfer debug is useful as attribution only. | Medium-high | Keep open for source-backed evidence. Do not close Phase 1 by accepting this deviation unless the user explicitly approves that visual gap. Do not promote gamma-like transfer or tune darken constants. |
| 3 | S1-45 | Spotlight map content/projection after texture fix | Source assigns thumb composite target as `SpotLight.map`; S1-40 made ordinary loaded textures source-default and raised thumb/composite luma substantially. S1-49 confirms the active block projects into the expected center region of the thumb map. | Map ownership, position, intensity, target size, thumb visibility, and active-block map coverage are source-shaped. Remaining risk is map transfer/light multiplication, not gross projection miss. | Medium | Do not change intensity, map assignment, target, or thumb darkness constants. Keep transfer/projection diagnostics; prioritize `OA/CA` input transfer and accepted-deviation decision next. |
| 4 | S1-46 | Shared project composite/media brightness | Source `C1/A1` mixes `tWork`, `tMedia`, noise, contrast, background, and media reveal; source media scene renders offscreen into `C1.tMedia`. S1-46B confirms the home `A1` main execution flow is source-equivalent except inert/relocated computations. | Project detail pages are stable but darker than source. A source-shaped offscreen media experiment regressed luma and was reverted. `A1` formula order is no longer a likely blocker. | High | Keep project pages as regression gates. Treat current direct media path as stability baseline; only retry offscreen routing in Phase 2 or a dedicated post-closeout batch with narrower target ownership evidence. |
| 5 | S1-47 | `Ka/GA` mouse/fluid feel | Source per-`GA` `Ka` simulation and render-manager mousesim are broadly ported. Static capture shows mouse term is not the main brightness culprit. S1-50 confirms target sizing, `uCoords`, local UV offset/scale, and active pointer state are source-shaped at rest. | Runtime structure exists and debug probe now covers exact sizing/UV state. Fluid/mouse feel still needs interactive visual QA, but it is not a static brightness blocker. | Low-medium | Treat as structurally attributed. Revisit only for interactive feel QA, not Phase 1 brightness tuning. |
| 6 | S1-48 | Floor/environment/about bridge depth | Source floor reflector, environment shader, and about character manager have source-shaped bridges but not full byte-for-byte ports. | Prior probes show sky/floor are not the main brightness lever; about route is stable. | Medium | Keep as an open bridge-depth item until visual QA confirms it is indistinguishable enough or the user explicitly accepts the remaining difference. |

### Phase 1 Open Blocker Board

This board reflects the current active state after S1-46B through S1-50. Older rows below may use closeout or accepted-deviation language, but that language is historical only. For the current 1:1 goal, Phase 1 remains open until source-backed implementation or user-approved visual acceptance resolves the remaining gaps.

| Chain | Closeout status | Evidence | Blocks Phase 1? | Remaining action |
| --- | --- | --- | --- | --- |
| `p1` hierarchy/lights/route state | Source-shaped | Scene hierarchy, active project, work count, light constants, about/floating toggles, and full-canvas QA are stable. | No | Keep as regression gate only. |
| `T1/w1/E1` thumb target | Source-shaped | Thumb target size, visible thumb count, composite uniforms, texture color-space fix, and S1-49 projection coverage are attributed. | No | Do not tune thumb darkness/intensity. |
| `GA/VA` ordinary blocks | Stable bridge, still not full source shader | Material defaults, alpha tail, physical-response probes, vertex world/UV probes, and projection coverage are attributed; full `HA/zA` replacement was rejected as unsafe in the current bridge. | Yes for strict 1:1 | Keep stable bridge for runtime safety, but do not mark it accepted without user visual review or narrower source-safe shader evidence. |
| `Ka` mouse simulation | Structurally attributed | S1-50 verifies target sizing, `uCoords`, UV offset/scale, persistence/thickness shape, and negligible static darken contribution. | No | Interactive feel QA only if visibly off. |
| `A1/C1` pre-composite | Source-equivalent for home flow | S1-46B semantic flow order matches source except inert/relocated computations. | No for home brightness | Keep project pages as regression gates. |
| `OA/CA` final transfer | Open transfer/color interpretation gap | Source formulas, blend table, renderer output, and darken inputs are confirmed. Gamma-like transfer debug moves luma but lacks source proof. | Yes | Needs source-backed transfer fix, narrower source evidence, or explicit user acceptance after visual review. |
| Project detail composite/media | Stable but darker | Full QA passes and previous offscreen-media attempt regressed luma. | Yes for strict 1:1 | Keep as regression gate; do not rewire without narrower source evidence. |
| Floor/environment/about | Source-shaped bridge, not final parity | Prior probes show low brightness impact; about route passes full-canvas QA. | Maybe | Visual QA must decide whether these bridges are materially off before Phase 1 is closed. |

### Current Recommendation

Finish Phase 1 before opening Phase 2 work. The next implementation batch should not be a broad rendering rewrite. It should either find source evidence for `OA/CA` transfer that can be safely applied, or produce a focused visual QA package for the user to decide whether any remaining differences are acceptable. The agent should not independently mark the remaining brightness/projection gaps as accepted.

### S1-54 Source Non-Fix Audit

This batch rechecked several plausible Phase 1 suspects against the mirrored source bundle and found no safe runtime change to promote. Normal rendering is unchanged.

Source-checked non-fixes:

- `p1.setLights()` creates `directionalLight2` but does not add it to the scene. The rebuild also creates the second directional light for setter/state parity but does not add it, matching source behavior.
- Source environment shader `l1` really uses `skyMask2 = max(skyMask, step(0.6, skyMaskUv.y));`. The rebuild environment shader matches this line; it is not a typo to "fix".
- Source has two similarly named shader constant groups: work `BA.SHADER_1_MIX_3 = 1`, environment `Qn.SHADER_1_MIX_3 = 1.5`, and sky composite `Zs.SHADER_MIX = 1.5`. The rebuild sky composite already uses `uShaderMix = 1.5`. The older audit row that described environment `SHADER_1_MIX_3` as `1` was incomplete and should not drive a code change.
- Source renderer DPR can reach `2` through `Pe.dpr`, but `p1.resize()` still passes `Math.min(Pe.dpr, 1.5)` into the work scene. The rebuild's source DPR cap of `1.5` remains consistent with the current Phase 1 work-scene target sizing.
- Source `Le.LOW_RES` starts false and is later set by GPU tier. The rebuild's `sourceLowRes()` is a local approximation and remains an open bridge-depth difference, but changing it without a source-equivalent GPU-tier implementation would be another unsupported heuristic.

Decision: keep runtime unchanged and continue Phase 1 from source-backed transfer/render-manager evidence. Do not spend another implementation batch on these five suspects unless new source evidence appears.

### S1-55 Pass-Order Diagnostic Correction

This batch fixed a stale QA label around the work/main composite pass order and added a debug-only pass-order field to `window.__rogierOutputProbe`.

Source/runtime evidence:

- Current production rendering already uses the source-shaped work pass order: `workRawTarget -> OA/CA workCompositeTarget -> A1/C1 tWork`.
- The old `scripts/compare-home-brightness-attribution.mjs` variant named `source-work-composite-pass` still sent `debug-pass-order=source-work-composite`, but the runtime only recognizes `debug-pass-order=raw-work-composite` as the alternative. The old variant was therefore a no-op.
- The output probe now reports `settings.passOrder` as either `source-work-composite` or `raw-work-composite`, making this visible in future diagnostics.

Current matrix at `/tmp/rogier-phase1-passorder-s55`:

| Variant | Pass order | Work raw 9x9 | Work composite 9x9 | Pre-composite 9x9 | Bloom 9x9 | Errors |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| default | `source-work-composite` | `0.3048` | `0.2378` | `0.3476` | `0.0522` | `0` |
| `raw-work-composite-pass` | `raw-work-composite` | `0.3126` | `0.0000` | `0.5712` | `0.1581` | `0` |
| `scene-transfer` | `source-work-composite` | `0.2943` | `0.4098` | `0.8376` | `0.3336` | `0` |

Decision: keep source-shaped production pass order. The raw-work fallback is a useful diagnostic because it brightens the intermediate A1 input, but it is explicitly not source-shaped and should not be used as a visual fix. Continue Phase 1 with the remaining source-backed transfer/color interpretation gap rather than reverting the pass graph.

### S1-56 Current Brightness Matrix / Non-Fix Batch

This batch expanded the Phase 1 step size to cover up to ten related `GA/VA` and `OA/CA` attribution points in one verification cycle. Normal rendering is unchanged.

Runtime/tooling change:

- `scripts/compare-home-brightness-attribution.mjs` now still writes the full `summary.json`, but also writes `compact-summary.json` and prints only the compact matrix to stdout. This keeps future QA runs usable without flooding the working context.

Source/runtime evidence from the current build:

- Source `VA` still fully assigns `HA/zA`; the rebuild remains a Three 0.184 chunk bridge. The source `zA` fragment confirms the ordinary work-block mouse alpha term is `uMouseFactor * 0.5`, while the older auxiliary-style `0.15` factor should not be applied to ordinary work blocks. The current rebuild already follows this split through `mix(0.5, 0.15, uAuxiliaryMaterial)`.
- Source `HA` uses `spread = 3.` and `tPerlin = Xt.perlin1`; the current rebuild already has both after S1-53/S1-54-era fixes.
- Source `CA` final composite still uses `rgbshift(tScene, -1., .0015)`, source bloom addition, `length(fluid.xy) * .015`, `blend(15, ..., vec3(0.095), uDarken * 2. + mouseSim.r * .25 * uDarken)`, `blend(11, ..., vec3(0.095), 1.)`, and final saturation. The rebuild's current `homeCompositeFragment` matches these confirmed operations.
- Source `Lu.update()` sets `compositeMaterial.uniforms.tScene` from the main render target or blur target, and writes bloom from the bloom-composite target. The current rebuild's final composite target ownership remains source-shaped; the brighter `raw-work-composite-pass` fallback is still diagnostic-only.
- Source and local Three light chunks both contain the same `SpotLight.map` multiplication branch. The current light-chunk comparison again rules out a missing spotlight-map branch.

Current compact matrix at `/tmp/rogier-phase1-current-brightness`:

| Variant | Work raw 9x9 | Work composite 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| default | `0.2954` | `0.2379` | `0.3533` | `0.0551` | `0.1850` | Baseline; keep. |
| `spotlight-map-off` | `0.3452` | `0.2868` | `0.4922` | `0.1254` | `0.1786` | Brighter but not source; do not promote. |
| `spotlight-transfer` | `0.3290` | `0.2811` | `0.4645` | `0.1077` | `0.1853` | Partial attribution only; do not promote gamma map transfer. |
| `scene-transfer` | `0.2797` | `0.4327` | `0.8503` | `0.3413` | `0.1955` | Strong attribution only; no source proof for production transfer. |
| `raw-work-composite-pass` | `0.2838` | `0.0000` | `0.4623` | `0.0997` | `0.1955` | Diagnostic-only non-source pass order. |
| `va-physical-direct` | `0.3105` | `0.2366` | `0.3471` | `0.0543` | `0.1777` | Low impact; do not promote. |
| `va-physical-source-fields` | `0.2966` | `0.2398` | `0.3564` | `0.0558` | `0.1853` | Low impact; do not promote. |
| `sky-off` | `0.4085` | `0.3380` | `0.6297` | `0.1896` | `0.1840` | Confirms environment target strongly affects output, but disabling it is not source. |
| `texture-srgb-colorspace` | `0.2551` | `0.1973` | `0.2198` | `0.0137` | `0.0630` | Worse; keep ordinary source-default texture color space. |
| `darken-off` | `0.3002` | `0.3536` | `0.6499` | `0.1996` | `0.1839` | Confirms final darken ownership; source formula requires keeping it. |

Decision: no production visual patch is safe from this batch. The useful outcome is narrower: the remaining Phase 1 gap is not solved by `VA` physical-response bridge tweaks, output-tail order, renderer output metadata, or pass-order fallback. The next source-backed work should target exact source/local interpretation of the `tScene` entering `OA/CA` and the environment/floor contribution to that texture, preferably with an original-side comparable render-target or pixel probe rather than more rebuild-only brightness toggles.

### S1-57 Floor / Environment Render-State Alignment

This batch continued the `OA/CA` input and floor/environment contribution chain without changing final brightness constants.

Source-backed runtime changes:

- `renderFloorReflection()` now mirrors source `i1.update()` render-state ownership more closely: before rendering the reflection target, it saves `renderer.xr.enabled` and `renderer.shadowMap.autoUpdate`, disables both for the reflection pass, forces the depth buffer mask to writable, then restores the previous renderer target and state in a `finally` block.
- `window.__rogierOutputProbe` now reports floor/environment uniforms and target state: floor reflectivity, mirror, mix strength, normal scale, reflection target sizes, blur resolution, environment darken color/value, `tSky` ownership, environment `envMapIntensity`, rotation, and y position.

Source-checked non-fixes in the same chain:

- Source `u1/l1` declares `uTime`, and `h1.update()` writes it, but the active source `l1` environment fragment does not use `uTime` in the visible shader path. Adding time-driven environment motion would be unsupported.
- Source `i1.setSize()` uses `0.75 * renderSize` for reflection targets while keeping full render-size blur `uResolution`; the rebuild already follows this after the earlier floor retest.
- Source `a1` keeps `uMirror=1`, `reflectivity=.97`, `uFloorMixStrength=15`, `uNormalDistortionStrength=2.5`, and normal repeat `45x45`; the rebuild already follows these values.
- Source `p1` adds only `directionalLight`, not `directionalLight2`; this remains unchanged.

Decision: keep the reflector render-state fix and the expanded probe. This is a small source-correct stability/parity improvement, not a claimed visual closeout. The next floor/environment pass should use the expanded probe and source-vs-rebuild captures to decide whether the remaining hard horizon is caused by reflection target content, environment `tSky` interpretation, or final `OA/CA` transfer.

### S1-58 Cubemap Color-Space / Horizon Attribution

This batch used source-vs-rebuild home captures plus screenshot band analysis to quantify the remaining floor/environment mismatch.

Source-backed runtime/tooling changes:

- Source `p1.addEnvironment()` loads `/images/cubemaps/01` through `CubeTextureLoader` and assigns the returned texture directly to `scene.environment`; the source loader itself sets cube textures to `srgb`. The rebuild no longer performs a separate explicit cubemap color-space assignment and instead leaves the loader-owned value visible in probes.
- The output probe now reports `homeScene.environment` texture metadata under `uniforms.environment.sceneEnvironment` and also samples `floorReflection` / `floorReflectionRead` render targets.
- Added `scripts/analyze-home-bands.mjs`, which reads a capture output directory and reports center-band luma plus strongest horizontal brightness deltas for original/rebuild home desktop/mobile screenshots.

Screenshot band evidence:

| Capture | Full center-band luma | Strongest horizontal delta | Key read |
| --- | ---: | ---: | --- |
| Original desktop | `0.2292` | `0.0541` at `12.4%` height | Source has a soft fog/floor distribution without the rebuild's mid-page hard jump. |
| Rebuild desktop after cubemap cleanup | `0.2617` | `0.0921` at `63.3%` height | Still has a stronger mid/lower horizontal boundary. |
| Original mobile | `0.2165` | `0.1359` at `95.7%` height | Mobile source boundary is near the bottom. |
| Rebuild mobile after cubemap cleanup | `0.3649` | `0.1385` at `60.9%` height | Mobile rebuild remains much too bright through the middle. |

Source-checked non-fixes in this batch:

- Source `u1/l1` declares `uTime`, `uMultiplier`, and `uShader*` uniforms, but the active `l1` environment shader path sampled in the bundle does not use them for the visible color calculation. Do not add time/noise animation or tune these uniforms as a visual fix.
- Source `l1` comments out `tonemapping_fragment` and `colorspace_fragment`, so the current environment material's local no-tonemap/no-colorspace behavior remains source-shaped.

Decision: keep the cubemap loader-ownership cleanup, reflection-target probe, and reusable band analyzer, but do not treat this as solving the horizon gap. The band analysis shows the remaining issue is structural: rebuild desktop/mobile still contain a strong mid/lower horizontal boundary. The next batch should inspect reflection target content and environment/floor composition around the `63%` desktop and `61%` mobile bands, not global brightness constants.

### S1-59 Main / Work Render-Manager Split

This batch source-checked the render-manager ownership around source `Lu`, `kA/OA`, and `I1/C1/A1`.

Source-backed runtime changes:

- Split the rebuild's work and main render-manager settings. Work keeps source `kA/OA` settings: mousesim on, luminosity on, bloom on with `strength=.15` and `radius=1.5`.
- Added a separate source-shaped main settings object matching default `I1/Lu`: mousesim off, luminosity off, bloom off, blur off, fluid off.
- Stopped reusing the work `OA` darken/saturation composite as the final screen pass. The main `A1`/pre-composite path now renders directly to screen, which matches source `U1` using `I1` with `C1/A1` as its composite material.
- Stopped running the unused extra preBloom production pass. The old preBloom probe targets remain visible as zeroed diagnostics, while the active work bloom targets stay live.
- Bloom target sizing is now consistently source-shaped at `floorPowerOfTwo(renderSize) / 4` for render-manager bloom chains.
- The output probe now reports `settings.work` and `settings.main`, plus `mainBloomBright` / `mainBloom` target state.

Verification:

- `npm run build` passed.
- `git diff --check` passed.
- `scripts/probe-output-color.mjs` passed with no network/runtime/WebGL errors.
- Full capture smoke passed for home, about, `/gc-2026/`, and `/hashgraph-vc/`.

Visual result:

| Capture | Original | Rebuild after split | Key read |
| --- | ---: | ---: | --- |
| Desktop center-band luma | `0.2277` | `0.2662` | Still too bright through the middle. |
| Desktop strongest horizontal delta | `0.0541` at `12.4%` | `0.1406` at `63.3%` | The hard mid/lower boundary remains and is more exposed without the non-source final `OA` pass. |
| Mobile center-band luma | `0.2161` | `0.3597` | Mobile remains much too bright through the middle. |
| Mobile strongest horizontal delta | `0.1367` at `95.6%` | `0.2557` at `49.8%` | The mobile hard edge is still structurally wrong. |

Decision: keep this source-structure correction even though it does not visually close the horizon gap. The removed final `OA` pass was a non-source mask over the underlying floor/environment/A1 mismatch. The next batch should continue from the now source-shaped render-manager split and diagnose the actual mid-screen boundary, likely in floor/environment projection or A1 input composition, not by reintroducing final darkening.

### S1-60 Camera Controller / Home Gallery Entry Attribution

This batch corrected the source attribution around `p1`, `IT`, and `yD.animateIn()` after the render-manager split exposed more home-scene differences.

Source evidence:

- Base `p1.setCameraControllerSettings()` defaults to `lookAt=(0,0,0)`, `targetXY=(.25,.25)`, and `rotateAngle=10`.
- Home work-gallery entry is different: source `yD.animateIn()` explicitly calls `Se.setCameraControllerSettings(new L(0,0,0), new Q(1,.5), 20)` immediately before animating `mouseF` from `0` to `1`.
- Source `yD.updateScene()` owns `sceneWrap.rotation.y`, `mainScene.renderManager.compositeMaterial.uniforms.uTransformX`, `workThumbScene.thumbs.updateGalleryProgress(-progress)`, `workScene.scene.rotation.z`, and `workScene.scene.position.z = rotation.z - zoom`. The rebuild's corresponding `setGalleryProgress()` transform shape is source-backed and should not be removed as a speculative horizon fix.

Runtime changes:

- Restored the base `p1` camera-controller defaults in the rebuild to `targetXY=(.25,.25)` and `rotateAngle=10`.
- Kept route visual preparation on the base `p1` defaults, matching source non-gallery state.
- Moved the source work-gallery camera override to `enterWorkGallery()`, where the rebuild now applies `targetXY=(1,.5)` and `rotateAngle=20` like `yD.animateIn()`.
- Fixed the home gallery entry lifecycle so the gallery is not marked active before WebGL exists. This prevents the source `yD.animateIn()` WebGL state from being skipped on first load.
- Added camera controller state to `window.__rogierOutputProbe` so future captures can distinguish base `p1` state from entered work-gallery state.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe at `/tmp/rogier-camera-probe-2` passed with no network/runtime/WebGL errors and reported the entered home gallery camera as `targetXY=[1,.5]`, `rotateAngle=20`.
- Full source-vs-rebuild capture at `/tmp/rogier-camera-gallery-entry-full` passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed network requests or runtime exceptions.

Decision: keep this as a source-correct lifecycle/camera fix. It is not a claimed hard-horizon solution. The next Phase 1 batch should continue with floor/environment/A1 input attribution now that the home gallery camera state is no longer ambiguous.

### Phase 1 Final Difference Audit Matrix

This matrix is the working closeout audit for Phase 1. It converts the remaining source-analysis threads into implementation decisions so Phase 1 can finish without open-ended brightness tuning.

| ID | Chain | Source target | Current rebuild state | Phase 1 decision | Phase 2 carryover |
| --- | --- | --- | --- | --- | --- |
| F1 | `p1` hierarchy / scene ownership | Source home scene owns `sceneWrap`, `blocksWrap`, work blocks, thumb scene, floor, environment, about/floating blocks, route-specific toggles, and shared render manager wiring. | Broad ownership is ported and stable. Work count, active slug, full-canvas entry, route classes, and page-level state pass repeated source-vs-rebuild captures. | Close as source-shaped. Keep as regression gate only. | None unless a route-state mismatch appears during Phase 2 page work. |
| F2 | `T1/w1/E1` thumb target and strip | Source renders a square thumb scene target, composites it through `_1/v1`, and assigns the composite target as the home `SpotLight.map`. | Target sizing, visible thumb count, composite uniforms, texture color-space fix, map assignment, and active-block projection coverage are attributed. | Close as source-shaped for Phase 1. Do not tune thumb darkness, saturation, target size, map assignment, or spotlight intensity. | Only revisit if Phase 2 interaction QA shows thumb strip motion or transition timing mismatch. |
| F3 | `GA/VA` ordinary work blocks | Source `VA` replaces the standard material shaders with bundled `HA/zA` and relies on the source Three light chunks and spotlight-map semantics. | Rebuild uses a stable Three 0.184 shader bridge with source-aligned material flags, alpha tail, diffuse defaults, selected chunk cleanup, and diagnostics. Full `HA/zA` replacement was rejected after console-aware QA. | Keep open for visual/source review. Do not retry broad `HA/zA` replacement without a narrower failing subsection and browser proof. | Dedicated shader-port research should start from generated shader section diffs rather than wholesale replacement. |
| F4 | `Se` visual state setter / project payloads | Source state setter pushes per-work visual values into block materials, thumb uniforms, darkness colors, active project ownership, and route transitions. | Rebuild payload extraction and visual state propagation are stable for home and project markers; source constants are preserved where attributed. | Close as source-shaped. Keep marker and active-slug checks in final QA. | Phase 2 may need deeper transition timing parity, not new state ownership. |
| F5 | `Ka/GA` mouse and local fluid simulation | Source uses a screen mouse simulation and per-work local simulations with source-shaped UV offsets, persistence, thickness, and ping-pong targets. | Rebuild target sizes, active local UV, `uCoords`, offset/scale, and static contribution are source-shaped. At-rest brightness is not blocked by mouse simulation. | Close structurally. Do not tune brightness through mouse/fluid parameters. | Interactive feel QA remains useful after Phase 1, especially pointer velocity, inertia, and local wake/fade timing. |
| F6 | `A1/C1` pre-composite formula | Source mixes work, media, noise, contrast, background, and reveal values through the main pre-composite path. | Home `A1` execution flow is semantically equivalent after excluding inert or relocated computations. Project detail pages use a stable direct media path after source-like offscreen routing regressed luma. | Close home `A1` flow. Accept current project media routing as a Phase 1 stability deviation. | Revisit project offscreen media routing only after transfer/color ownership is solved in a dedicated Phase 2 batch. |
| F7 | `OA/kA/Lu` final composite / transfer | Source uses the current darken/lighten formulas, `uDarken=.2`, black constant `0.095`, bloom/luminosity chain, target defaults, and `srgb` renderer output. | Rebuild matches confirmed formulas and pass ownership. Gamma-like `debug-composite-transfer=1` brightens the result but has no source proof. | Open Phase 1 issue. Do not promote unsupported transfer changes, but do not mark lower brightness accepted without user review. | Highest-value future rendering research: identify exact source/local Three color-transfer mismatch without changing constants. |
| F8 | Spotlight-map transfer / multiplication | Source spotlight map is the thumb composite texture and local/source Three chunks both multiply direct light by sampled `spotColor.rgb`. | Projection is centered and in-map; target is non-empty. Gamma-like spotlight-map debug brightens partially but is not source-backed. | Open Phase 1 issue. Keep diagnostic switches only. | Pair with F7 in any future color-transfer investigation. |
| F9 | Floor / environment / about auxiliary visuals | Source includes reflector, environment shader, character/about scene, and floating auxiliary blocks. | Rebuild has source-shaped bridges and stable route QA, but not byte-for-byte source ports. Prior probes show these are not the main home brightness lever. | Open until visual QA confirms these bridges are not visibly blocking 1:1. | Phase 2 should compare about interaction, character spotlight projection, and reflector/environment motion if those pages become active targets. |
| F10 | Project detail composite / media stability | Source project pages share composite/media concepts and use offscreen media ownership. | Current pages are closer visually and stable in repeated browser QA; previous source-like media routing regressed project brightness. | Treat project pages as regression gates during Phase 1 closeout. Do not change them to chase home brightness. | Phase 2 can improve project media 1:1 once home transfer risk is isolated. |

Closeout read:

- Must-fix before Phase 1 completion: no new safe runtime change is currently source-proven, but the visible `VA`/spotlight/composite gap remains open.
- Agent-accepted Phase 1 deviations: none. Any acceptance of the stable Three 0.184 `VA` bridge, final brightness/transfer gap, current direct project-media path, or floor/environment/about bridge depth requires user visual review.
- Explicitly rejected for Phase 1 production: `debug-composite-transfer=1`, `debug-spotlight-map-transfer=srgb`, `debug-spotlight-map=off`, broad full-`HA/zA` replacement, broad source work-composite pass rewiring, and source offscreen project-media routing.
- Required next batch: continue source-backed transfer/shader evidence or prepare a focused source-vs-rebuild visual QA package for user review; do not mark Phase 1 complete automatically.

### Detailed Difference Audit: Spotlight / Thumb / Output Chain

This is the current source-driven audit board for the remaining Phase 1 visual gap. It is intentionally narrower than "make the whole home brighter": S1-23 proved the home `SpotLight.map` is assigned and materially contributing, so the remaining work should identify why the source thumb-map projection is interpreted much darker in the rebuild.

| ID | Area | Source evidence | Rebuild observation | Likely impact | Decision / next action |
| --- | --- | --- | --- | --- | --- |
| D1 | Thumb composite shader `_1` / `v1` | Source `_1` is `toneMapped:false`, transparent, no depth, and samples `tScene`, then `blendMultiply(..., uDarkenColor, uDarkenIntensity)`, then `saturation`, then alpha `1`. | Rebuild `thumbCompositeFragment` matches the broad operations and uses `toneMapped:false`. Uniform names differ only locally. | Low as a direct bug, but high as an input to the spotlight map. | Do not tune darkness constants yet. Add render-target pixel diagnostics before changing shader math. |
| D2 | Thumb scene `T1` target sizing | Source `T1.resize(e,t,n)` renders the thumb scene to a square `t x t` target with pixel ratio forced to `1`. | Rebuild resizes `thumbTarget` / `thumbCompositeTarget` to a square based on viewport height and target budget. | Medium. Small size differences can alter map softness but should not explain a 5x luma gap alone. | Verify exact target size at runtime in diagnostics; only align if measured mismatch is source-proven. |
| D3 | Thumb background color | Source `T1` sets scene background `new Color("#222222").convertLinearToSRGB()`. | Rebuild uses a thumb clear/background path, but the exact color-space treatment should be measured from the target, not inferred. | Medium-high. The map-on run is much darker than map-off, so a dark background or wrong transfer curve can dominate projection. | Capture mean/min/max of `thumbTarget` and `thumbCompositeTarget` on the active project. |
| D4 | Thumb strip material `S1` | Source `E1/M1/S1` uses cover texture, transition-to-UV fallback, plane scale `(2,2,2)`, and visibility outside `[-1.5, 1.5]`. | Rebuild broadly follows these rules. Active thumb payload mapping from Astro to `payloadFromElement()` is correct for `data-thumb-darkness`, `data-darkness-color`, and `data-thumb-saturation`. | Medium. If active thumb progress differs, the spotlight map could be mostly fallback/background. | Add diagnostic fields for active slug, thumb progress, visible thumb count, and composite uniforms. |
| D5 | Spotlight map assignment | Source `SD.init()` assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`. | Rebuild assigns `thumbCompositeTarget.texture`; S1-23 map-on/off test shows the map is strong and darkening. S1-49 projection probe confirms the same target has healthy sampled luma at the active block projection points. | High, but not missing. | Keep assignment. Do not disable map as a fix; remaining issue is transfer/light interpretation or an accepted deviation. |
| D6 | Spotlight position/intensity/parallax | Source `p1.setLights()` uses intensity `220`; update only parallax-adjusts `x/y`, target remains source-shaped. | Rebuild follows position, target, intensity, angle/penumbra ownership, and parallax. S1-49 shows active block center projects to thumb UV `0.5,0.5`, and left/right/top/bottom samples all remain in-map. | Low-medium. Projection framing is no longer a strong suspect for the main brightness gap. | Leave constants unchanged. Do not tune spotlight framing unless a future visual QA finds a specific non-brightness mismatch. |
| D7 | `VA/zA` light body | Source `VA.onBeforeCompile` fully replaces vertex and fragment shader with bundled `HA/zA`, relying on source Three light chunks and `SpotLight.map` semantics. | Rebuild uses a stable Three 0.184 shader bridge. Full `HA`/`zA`, fragment-tail, old physical-response, vertex world-position, and early-UV attribution paths were either unsafe or low-impact. | Medium as accepted deviation, low as next edit target. | Do not attempt another broad `HA/zA` port in Phase 1. Keep as documented bridge unless a concrete visible defect has a source-safe fix. |
| D8 | Render target color space | Source `Lu/Lo` create default `WebGLRenderTarget` clones; screen/composite materials are often `toneMapped:false`; selected colors call `.convertLinearToSRGB()`. | Rebuild render-target defaults and renderer output are source-shaped; ordinary loaded texture color-space fix was promoted in S1-40. Renderer output linear debug was low-impact. | Medium as transfer contributor, low as renderer-level fix. | Do not broadly change renderer output or render-target metadata. Keep texture color-space fix and diagnostic switches. |
| D9 | Main composite `kA/OA` | Source work render manager enables mousesim, luminosity, bloom with `strength:.15`, `radius:1.5`, and composite darken/saturation uniforms. S1-46B confirms source `A1` and rebuild `homePreCompositeFragment` have matching main flow order after excluding inert source computations and a relocated `tNoise` sample declaration. | Rebuild has source-shaped A1/OA split and bloom/luminosity, but home luma remains lower and project pages are darker too. Gamma-like transfer debug improves luma but lacks source proof. | High as accepted-deviation decision, high risk as live edit. | Do not promote `debug-composite-transfer=1` or broad pass rewiring. Record accepted deviation unless new source evidence appears. |
| D10 | Mouse simulation `Ka` | Source `Ka` lerps target UV, ping-pongs a sim target, applies persistence as `pow(persistance, dt*10)`, and per-`GA` raycasts against source-scaled planes. | Rebuild has a Ka-style simulation and per-item targets. S1-50 verifies screen sim `144x90`, active local sim `46x30`, source-equivalent plane/ray sizes, centered active UV, and negligible static composite-darken mouse contribution. | Low-medium. Affects motion/fluid feel more than static dark luma. | Keep probe. Do not tune brightness through mouse sim. Revisit only with pointer interaction QA if motion feel visibly differs. |

Immediate next batch recommendation: close Phase 1 by recording accepted deviations for the remaining brightness/transfer gaps, or reopen only if new source evidence identifies a safe one-chain fix. Do not continue broad thumb, spotlight, `VA`, `A1`, or mouse-simulation tuning in Phase 1; those paths now have sufficient attribution evidence.

### S1-24 Thumb / Spotlight Probe Result

A QA-only thumb-map probe is now available for the spotlight attribution chain:

- Added `?debug-thumb-probe=1`, which samples `thumbTarget` and `thumbCompositeTarget` after the thumb render pass and writes the result to `window.__rogierThumbProbe`.
- Added `scripts/probe-thumb-spotlight.mjs`, which opens rebuild home through CDP, waits for the probe, captures a screenshot, and writes `summary.json`.
- Normal rendering is unchanged unless the query flag is present.

The diagnostic run at `/tmp/rogier-thumb-probe-s124` captured the active home state:

| Field | Value | Interpretation |
| --- | ---: | --- |
| Active project | `hashgraph-vc` | Matches the expected initial active card. |
| Visible thumbs | `1` | Matches source strip visibility rules for the centered thumbnail. |
| Thumb target size | `900 x 900` | Matches source-shaped square `T1` target for a 1440x900 viewport. |
| `thumbTarget` center luma | `0.166` | The raw thumb render target is not black or near-empty. |
| `thumbCompositeTarget` center luma | `0.132` | Composite darkening is present but still bright enough to project. |
| Thumb composite uniforms | darkness `0.2`, color `[0,0,0]`, saturation `1` | Matches initial `hashgraph-vc` payload path and source-shaped defaults. |
| Spotlight map | `hasMap: true`, intensity `220` | The source-shaped map assignment is live. |
| Map color space | empty / `NoColorSpace`-style render target texture | This is a remaining D8 attribution point, not a proven bug yet. |
| Renderer output color space | `srgb` | Confirms the rebuild is running through modern Three output color management. |

Decision: D1-D4 are no longer the primary suspect for the large home darkening gap. The map input is visibly non-empty and the composite target center luma is far above the final rebuild-home luma baseline (`~0.019`). This points the next Phase 1 implementation batch toward D7/D8: ordinary `VA/zA` spotlight-map light semantics and render-target color-space interpretation under Three 0.184. Do not tune thumb darkness, saturation, spotlight intensity, or disable `SpotLight.map` as a fix.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-thumb-probe-s124 CDP_PORT=9261 PROBE_WAIT=5200 node scripts/probe-thumb-spotlight.mjs`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s124-thumb-probe` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured normal-path luma stayed stable:

| Capture | Original luma | Rebuild luma after S1-24 probe batch | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.019` | Stable; probe is diagnostic only and does not change normal rendering. |
| Home mobile | `0.056` | `0.016` | Stable. |
| About desktop | `0.026` | `0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

### S1-25 Spotlight Transfer / ColorSpace Attribution Result

Two QA-only attribution paths are now available for D7/D8:

- Added `?debug-thumb-colorspace=composite-srgb` and `?debug-thumb-colorspace=both-srgb`, which only alter thumb render-target texture `colorSpace` metadata for diagnosis.
- Added `scripts/compare-thumb-colorspace.mjs`, which captures default, composite-srgb, and both-srgb home variants with `?debug-thumb-probe=1`.
- Added `?debug-spotlight-map-transfer=srgb`, which replaces the ordinary work-block `lights_fragment_begin` include with a debug-only variant that samples `SpotLight.map` through `pow(spotColor.rgb, vec3(1.0 / 2.2))`.
- Added `scripts/compare-spotlight-transfer.mjs`, which captures default vs debug transfer variants and records console/shader errors.
- Normal rendering is unchanged unless one of these query flags is present.

Source/Three evidence:

- The mirrored bundle's `lights_fragment_begin` and local Three 0.184 both multiply `directLight.color` by `spotColor.rgb` when `SpotLight.map` is in bounds.
- Three 0.184 wires `light.map` into `uniforms.spotLightMap.value` and updates the spotlight matrix even without shadow casting.
- Therefore the remaining gap is not a missing `SpotLight.map` branch. It is transfer/color interpretation, projection coordinates, or the surrounding `VA/zA` lighting/material body.

Diagnostic results:

| Variant | Thumb probe effect | Final home luma | Interpretation |
| --- | ---: | ---: | --- |
| Default | composite target center luma `0.132`, map colorSpace empty | `0.0186` | Current baseline. |
| `debug-thumb-colorspace=composite-srgb` | probe readback composite luma rises to `0.381` | `0.0186` | Texture metadata changes readback/composite interpretation, but does not materially change final spotlight projection. Not a direct fix. |
| `debug-thumb-colorspace=both-srgb` | raw thumb luma `0.423`, composite luma `0.380` | `0.0186` | Same final result; target metadata alone is insufficient. |
| `debug-spotlight-map-transfer=srgb` | shader samples the spotlight map through a gamma-like transfer | `0.0253` | Confirms map transfer contributes to darkness, but it only closes a small part of the `0.106` original-home luma gap. |

Decision: keep these as diagnostic switches, not production behavior. The next implementation batch should not convert all thumb targets to sRGB or permanently gamma-correct the spotlight map. D7/D8 remain active, but S1-25 shows transfer is only a partial cause. The next source-driven target should be deeper `VA/zA` light/material-body parity: projection coordinates from `worldPosition`, old-vs-new `RE_Direct` material response, standard/physical specular interface drift, and any source `zA` chunks still bridged through Three 0.184.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-thumb-colorspace-s125 CDP_PORT=9263 CAPTURE_WAIT=5200 node scripts/compare-thumb-colorspace.mjs`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-spotlight-transfer-s125b CDP_PORT=9265 CAPTURE_WAIT=5200 node scripts/compare-spotlight-transfer.mjs`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s125-transfer` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured normal-path luma stayed stable:

| Capture | Original luma | Rebuild luma after S1-25 attribution |
| --- | ---: | ---: |
| Home desktop | `0.106` | `0.019` |
| Home mobile | `0.056` | `0.016` |
| About desktop | `0.027` | `0.015` |
| `/gc-2026/` desktop | `0.140` | `0.039` |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` |

### S1-26 VA Metalness Source Fix Result

A source-proven material flag mismatch was fixed:

- Source `VA extends MeshStandardMaterial` explicitly sets `envMapIntensity = .75`, `roughness = 1`, `dithering = true`, `transparent = true`, `depthTest = false`, and `depthWrite = false`.
- Source `VA` does not set `metalness`; the bundled `MeshStandardMaterial` default is `metalness = 0`.
- Rebuild had `SOURCE_WORK_METALNESS = 1`, which pushed ordinary work blocks and auxiliary blocks into a fully metallic material response that source `VA` does not use.
- Rebuild now sets `SOURCE_WORK_METALNESS = 0`.

This is the first recent D7 fix that materially moved normal-path home brightness while preserving project-page stability:

| Capture | Original luma | Rebuild luma after S1-26 | Previous rebuild baseline | Decision |
| --- | ---: | ---: | ---: | --- |
| Home desktop | `0.106` | `0.027` | `~0.019` | Improved in the correct direction; still below source. |
| Home mobile | `0.056` | `0.032` | `~0.016` | Improved substantially. |
| About desktop | `0.026` | `0.015` | `~0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | `~0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | `~0.023` | Project stability retained. |

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-va-shader-s126-metalness CDP_PORT=9268 DUMP_WAIT=5200 node scripts/dump-va-shader.mjs`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s126-metalness` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Decision: keep the metalness fix. Continue D7 attribution next, especially source `VA` light/material-body differences that remain after metalness is corrected: old `SPECULAR` macro naming, Three 0.184 physical interface drift, and whether `MeshStandardMaterial` constructor defaults around emissive/specular differ from source bundle defaults.

### S1-27 VA Emissive Intensity Source Fix Result

A second source-proven `VA` material default mismatch was fixed:

- Source `VA` does not set `emissiveIntensity`; the bundled `MeshStandardMaterial` default is `emissiveIntensity = 1`.
- Source `Se.setBlocksColor()` animates only `J.workScene.blocks[*].instance.material.emissive`; it does not compensate with a lower emissive intensity.
- Rebuild had `SOURCE_WORK_EMISSIVE_INTENSITY = 0.5`, which halved the block-color emissive contribution after `setBlocksColor()`.
- Rebuild now sets `SOURCE_WORK_EMISSIVE_INTENSITY = 1`.

Measured normal-path luma moved again in the correct direction:

| Capture | Original luma | Rebuild luma after S1-27 | Previous rebuild after S1-26 | Decision |
| --- | ---: | ---: | ---: | --- |
| Home desktop | `0.106` | `0.031` | `0.027` | Improved; remaining gap is still large. |
| Home mobile | `0.056` | `0.038` | `0.032` | Improved and now closer to source mobile. |
| About desktop | `0.027` | `0.015` | `0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | `0.023` | Project stability retained. |

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-va-shader-s127-emissive CDP_PORT=9270 DUMP_WAIT=5200 node scripts/dump-va-shader.mjs`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s127-emissive` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Decision: keep the emissive-intensity fix. The next D7 pass should continue with source `VA` material/program defaults, but be more cautious: `color`, `roughness`, `metalness`, `emissiveIntensity`, `envMapIntensity`, transparency, and depth flags are now source-aligned. Remaining likely deltas are shader-body compatibility (`SPECULAR` macro drift, Three 0.184 physical chunks) and composite/output coupling.

### Phase 1 Progress Checkpoint

The current Phase 1 target is no longer a broad implementation pass. It is a focused attribution pass for a small number of source/rendering chains that still produce a large visible gap. The useful way to measure progress is now by chain status, not by total site completion:

| Chain | Current state | Confidence | Remaining risk |
| --- | --- | ---: | --- |
| `p1` scene hierarchy, lights, carousel, visibility | Source-shaped hierarchy, carousel placement, active reveal ownership, light defaults, spotlight ownership, about/floating block toggles, and side visibility are implemented. | High | Low. Only revisit if a new source capture ties a visible mismatch directly to this chain. |
| `T1/w1/E1` thumb render target | Camera, square target sizing, strip wrapping, material flags, background, darkness color path, and spotlight-map ownership are source-shaped. | Medium-high | Medium. The target exists, but exact contribution through `VA` lighting is still unresolved. |
| `Ka` mouse simulation | Ping-pong targets, source uniforms, source timing, screen-space simulation, and per-work-item local simulations are implemented. | Medium-high | Medium. Remaining audit should compare source `uCoords`, target sizes, and pointer raycast UV mapping only if full `VA` does not explain the dark blocks. |
| `A1/OA/Lu` composite | A1/OA split, bloom chain, luminosity pass, source vignette, background default, and render-target defaults are source-shaped enough to be stable. | Medium | Medium-high. Project pages are still darker than original, so shared composite/media flow remains a later isolated risk. |
| `VA/GA` ordinary work blocks | Grid, instances, material flags, raw diffuse semantics, fragment tail cleanup, and many source-omitted standard chunks are aligned. | Medium | High. Source `VA` fully replaces `HA/zA`; the rebuild still uses a patched Three 0.184 standard shader bridge. This is now the highest-value unresolved Phase 1 chain. |
| Project detail media | Markers and runtime smoke are stable; current direct media rendering is intentionally preserved after the source offscreen-media experiment regressed luma. | High for stability | Medium for 1:1. Keep as regression gate during Phase 1; do not optimize project pages separately yet. |

Conclusion: Phase 1 is roughly two thirds visually complete but much further along architecturally. The blocker is not missing page coverage; it is unresolved rendering semantics in `VA`/spotlight/light output and, secondarily, shared composite/media color output. Phase 2 should wait until the `VA` chain is either source-ported or explicitly accepted as a controlled deviation.

### Next Source Difference Audit

This table is the immediate execution board after the S1-26/S1-27 source-default fixes. The important adjustment is cadence: do not attempt another broad `HA/zA` replacement first. The next batches should identify one measurable source delta, prove it with a diagnostic or generated-shader diff, then keep only small runtime changes that pass browser QA.

| Priority | ID | Chain | Source evidence | Current rebuild evidence | Proposed batch | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | S1-28 | Generated `VA/zA` light-body diff | Source `VA.onBeforeCompile` assigns full `zA`. `zA` keeps a small standard-material body: `roughnessmap`, `metalnessmap`, normals, `lights_physical_fragment`, `lights_fragment_begin`, `lights_fragment_end`, then `totalDiffuse + totalSpecular + totalEmissiveRadiance`. | Rebuild now strips many source-omitted chunks and fixed `metalness`/`emissiveIntensity`, but still depends on Three 0.184 generated light structs/functions. Home desktop improved from `~0.019` to `0.031`, so `VA` defaults are confirmed as a live brightness lever. | Extend `scripts/dump-va-shader.mjs` or add a small analyzer that compares dumped fragment sections around `lights_physical_fragment`, `lights_fragment_begin`, `RE_Direct`, spotlight-map uniforms, and final reflected-light accumulation. Commit diagnostics only unless the diff exposes a one-line source-proven patch. | Medium |
| 2 | S1-29 | Source renderer/output color management | Source `Lu/I1` render targets are default `WebGLRenderTarget` clones; composites are `toneMapped:false`; selected background colors use `.convertLinearToSRGB()`. | Rebuild runs on Three 0.184 with `renderer.outputColorSpace = SRGBColorSpace`, `toneMapped:false` composites, and render-target textures with modern color-space metadata. Project pages remain darker too, suggesting shared output/target coupling may still exist. | Audit source renderer initialization and local Three target defaults. Add a debug report for renderer output color space, target texture color spaces, and representative target luma before changing production color management. | Medium-high |
| 3 | S1-30 | `A1/C1` pre-composite parity | Source `A1` uses `tWork`, `tBloom`, `tMouseSim`, `tFluid`, `tNoise`, `tPerlin`, `uBgColor`, contrast, saturation `1.15`, lighten blend mode `11` at `.85`, media mix by `media.a * uMediaReveal`, and two noise mixes. | Rebuild `homePreCompositeFragment` is currently formula-close to source. This makes `A1` less likely than `VA` as the first cause of the remaining home luma gap, but it still owns shared final brightness. | Keep this as a line-by-line audit item after S1-28/S1-29. If touched, change only proven formula mismatches and run project-page luma gates immediately. | Medium |
| 4 | S1-31 | Spotlight-map projection semantics | Source assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`; `p1.update()` parallax-adjusts only spotlight `x/y`. | Rebuild map assignment, position `(0,0,3.7)`, target `(0,0,-8)`, intensity `220`, and parallax are source-shaped. Map-off debug gets much brighter, and thumb probe proves the map is not black, so the gap is interpretation/projection, not missing ownership. | Keep constants unchanged. Use S1-28 diagnostics to inspect spotlight-map sampling/light multiplication first; only add projection diagnostics if light-body diff does not explain the gap. | Medium-high |
| 5 | S1-32 | `Ka` mouse/fluid simulation sizing | Source `GA.createPlane()` uses plane scale `(35*1.3, 23*1.3, 1)`, ray plane `* 1.5`, `uUvOffset`, `uUvOffsetScale = 1.5`, and `mouseSim.onResize(plane.scale.x, plane.scale.y)`. Source main render manager has mousesim enabled and fluid disabled for work. | Rebuild has screen and per-item ping-pong mouse simulations plus source-shaped uniforms, but exact `uCoords`, pointer UV, and target-size parity are not fully measured. Static luma gap is probably not primarily mouse sim. | Defer until `VA`/output attribution is narrower. Then add a debug probe for target size, `uCoords`, brush UV, speed, and sampled center/range. | Medium |
| 6 | S1-33 | Shared media/composite offscreen path | Source routes media through `$1/Lo/W1` into `C1.tMedia` and uses `C1.uMediaReveal`; project media has its own render-manager path. | A previous source-shaped offscreen experiment regressed project luma and was reverted. Project detail pages are currently stability gates, not the next risky target. | Do not retry until S1-28/S1-30 are resolved. Next attempt must isolate blank `tWork`, alpha, `C1` background blend, and target color assumptions before production routing. | High |

Immediate recommendation: execute S1-28 first as an analysis/diagnostic batch. The batch should produce a source-vs-generated shader section report and update this audit with a concrete decision: either a small `VA` compatibility patch, or move to S1-29 renderer/output attribution. This is better than "Phase 1 in one pass" because previous full-`HA` and fragment-tail experiments passed static build but failed or hung under console-aware browser QA.

### S1-28 Difference Audit Refresh

This audit refresh re-scoped the next Phase 1 work after the successful `VA` default fixes:

- `A1/C1` pre-composite was rechecked against source and remains formula-close enough to not be the first live-edit target.
- Source `zA` confirms the active risk is the light/material body around `lights_physical_fragment`, `lights_fragment_begin`, and the final reflected-light accumulation, not thumb target emptiness or missing spotlight ownership.
- Source `HA` full replacement remains rejected as a direct next step because the prior browser QA failures were runtime/shader stability failures, not missing source evidence.
- Next implementation should start with generated-shader section diffing and only keep small source-proven changes.

### S1-28 Generated Shader Section Diff Result

The shader dump tool now writes a richer section report for ordinary `VA` attribution:

- `scripts/dump-va-shader.mjs` still captures source `HA/zA` and the rebuild's patched work shader under `?dump-va-shader=1`.
- It now also writes `fragment-analysis.json` with active include differences, uniform-only differences, key anchor lines around `lights_physical_fragment` / `lights_fragment_begin` / reflected-light accumulation, and tail ownership.
- It now writes `three-chunk-analysis.json` with local Three chunk checks for `lights_fragment_begin`, `lights_physical_fragment`, and `opaque_fragment`.
- Normal rendering remains unchanged unless the debug query flag is present.

The diagnostic run at `/tmp/rogier-va-shader-s128-diff2` produced these useful findings:

| Finding | Result | Decision |
| --- | --- | --- |
| Active include delta | After ignoring commented source includes, source-only active includes are `packing`, `bsdfs`, and `opaque_fragment`; rebuild has no active include that source lacks in this section. | The bridge is closer than the raw length delta suggests. Do not attempt another full fragment replacement from this alone. |
| Light-body anchors | Both source and rebuild keep the same core sequence: `roughnessmap`, `metalnessmap`, normal chunks, `lights_physical_fragment`, `lights_fragment_begin`, `lights_fragment_end`, then reflected-light accumulation. | The remaining gap is not a missing light-body include. |
| Spotlight map chunk | Local Three `lights_fragment_begin` contains `spotLightMap`, `inSpotLightMap`, `RE_Direct`, and the same direct-light multiplication shape: `directLight.color * spotColor.rgb`. The mirrored source bundle contains the same branch. | `SpotLight.map` branch absence is ruled out again. Keep map ownership and constants unchanged. |
| Material interface delta | Rebuild still has newer uniforms/interface names such as `dispersion`, `anisotropyVector`, `anisotropyMap`, plus rebuild-only local uniforms `uMouseSpeed`, `uAuxiliaryMaterial`, and `uScrollOpacity`. Source has old specular map macro spelling (`USE_SPECULARCOLORMAP`, `USE_SPECULARINTENSITYMAP`), while rebuild has modern underscore spelling. | This is mostly interface drift, but no one-line safe production patch is proven yet. |
| Fragment output tail | Source uses active `#include <opaque_fragment>`, then modifies `gl_FragColor.rgb` and `gl_FragColor.a`. Rebuild avoids `opaque_fragment` and writes a bridge-local `vec4(sourceColor, alpha)`. | This remains the most concrete source/rebuild difference, but a prior live tail-order experiment hung browser QA. Any retry must be debug-gated and smaller than the rejected experiment. |

Decision: keep the expanded diagnostic tooling. Do not make a production shader patch yet. The next implementation batch should either:

- run a debug-gated, work-only output-tail attribution variant that compares source `opaque_fragment` tail behavior against the stable bridge without committing the live behavior, or
- move to S1-29 renderer/output color diagnostics if the tail experiment again fails or does not move luma.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-va-shader-s128-diff2 CDP_PORT=9273 DUMP_WAIT=5200 node scripts/dump-va-shader.mjs`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`

### S1-29 VA Output Tail Attribution Result

A debug-only ordinary `VA` output-tail attribution path is now available:

- Added `?debug-va-output-tail=source`, work-block only.
- Default rendering keeps the stable bridge path: compute `sourceColor`, then write `gl_FragColor = vec4(sourceColor, alpha * diffuseColor.a)`.
- The debug path writes `gl_FragColor = vec4(outgoingLight, diffuseColor.a)`, then mutates `gl_FragColor.rgb` and `gl_FragColor.a`, matching the source `zA` tail order more closely.
- Added `scripts/compare-va-output-tail.mjs` to capture default vs source-tail home variants with console/shader/runtime checks.
- `scripts/dump-va-shader.mjs` now accepts `EXTRA_QUERY` so debug shader variants can be dumped without changing the base URL.

Diagnostic results:

| Variant | Home luma | Runtime result | Interpretation |
| --- | ---: | --- | --- |
| Default stable bridge | `0.031294` | Ready, one full viewport canvas, no shader/console/runtime errors. | Current baseline after S1-27. |
| `debug-va-output-tail=source` | `0.031327` | Ready, one full viewport canvas, no shader/console/runtime errors. | Source-tail order compiles and runs, but moves luma by only `~0.00003`. |

The debug shader dump confirmed the variant was actually active:

- `gl_FragColor = vec4(sourceColor...)` is absent in the source-tail dump.
- `gl_FragColor.rgb` and `gl_FragColor.a` anchors are present at rebuild lines `158` and `177`.

Decision: do not promote the source-tail path to production. The tail-order mismatch is real but not a material cause of the remaining home brightness gap. Move the next batch to S1-29 renderer/output color diagnostics, because home and project pages are both still darker than original after the source-proven `VA` defaults were fixed.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-va-output-tail-s129 CDP_PORT=9274 CAPTURE_WAIT=5200 node scripts/compare-va-output-tail.mjs`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-va-output-tail-dump-source2 CDP_PORT=9277 DUMP_WAIT=5200 EXTRA_QUERY='&debug-va-output-tail=source' node scripts/dump-va-shader.mjs`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`

### S1-30 Renderer / Output Color Probe Result

A debug-only renderer/output probe is now available:

- Added `?debug-output-probe=1`.
- Added `scripts/probe-output-color.mjs`.
- The probe writes `window.__rogierOutputProbe` with renderer output settings, key composite uniforms, render-target texture metadata, center stats, and 9x9 grid stats for home render targets.
- Normal rendering is unchanged unless the debug query flag is present.

The diagnostic run at `/tmp/rogier-output-probe-s129b` produced these key numbers on home desktop:

| Target / output | Center luma | 9x9 grid luma | Texture colorSpace | Interpretation |
| --- | ---: | ---: | --- | --- |
| `workRawTarget` | `0.526` | `0.184` | empty / `NoColorSpace` | Work scene target is not globally black; center is bright and grid is already above original final home luma. |
| `compositeTarget` / A1 pre-composite | `0.862` | `0.231` | empty / `NoColorSpace` | A1 pre-composite is bright, especially near center; it is not the cause of the final dark output. |
| `preBloomTarget` | `0.035` | `0.009` | empty / `NoColorSpace` | Pre-bloom composite is small and dark as expected from bloom blur/composite, not the main scene. |
| `bloomTarget` | `0.040` | `0.022` | empty / `NoColorSpace` | Bloom contribution is modest. |
| `thumbCompositeTarget` | `0.132` | `0.060` | empty / `NoColorSpace` | Thumb map remains non-empty and source-shaped enough for projection attribution. |
| final screenshot | n/a | `0.031` full-image luma | renderer output `srgb` | Final visible output is far darker than A1 `compositeTarget`, so the next suspect is the final `OA/CA` composite pass rather than upstream render targets. |

Renderer/output metadata:

- `renderer.outputColorSpace = "srgb"`
- `renderer.toneMapping = 0`
- `renderer.autoClear = false`
- all sampled render-target textures report empty colorSpace / `NoColorSpace`-style metadata
- `preComposite.uBgColor = [0.1216, 0.1216, 0.1216]`
- final `OA` composite uniforms at capture: `uDarken = 0.2`, `uSaturation = 1`, bloom/luminosity enabled

Decision: keep the output probe. Do not broadly change renderer output color space yet. The current evidence narrows the next batch to final `OA/CA` composite parity: source `CA` blend modes, darken color value, `uDarken` ownership for the active project, and whether the rebuild samples the correct `tScene`/`tBloom` target in `renderHomeCompositePass()`. A1/pre-composite and render-target color metadata are no longer the first live-edit target.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-output-probe-s129b CDP_PORT=9279 PROBE_WAIT=5200 node scripts/probe-output-color.mjs`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`

### S1-31 OA/A1 Pass-Order Attribution Result

A production-path experiment tested whether the home pass order should be rewired to match the source ownership suggested by `nD.init()`:

- Source evidence: `mainScene.renderManager.compositeMaterial.uniforms.tWork.value = workScene.renderManager.renderTargetComposite.texture`, meaning the work scene render manager's `OA/CA` composite feeds the main scene `A1/C1` composite.
- Experiment: render home work raw to `workRawTarget`, run the `OA/CA` home composite into `compositeTarget`, then feed that texture into `A1/C1` for the final screen pass with A1 bloom/luminosity disabled.
- The experiment compiled and reached the ready state with no reported shader/runtime errors, but it moved the final home output in the wrong direction.

Measured result from `/tmp/rogier-output-probe-s131-order`:

| Target / output | Luma | Interpretation |
| --- | ---: | --- |
| `workRawTarget` 9x9 grid | `0.1855` | Upstream work scene remained bright enough. |
| `compositeTarget` after `OA/CA` 9x9 grid | `0.1395` | The intermediate work composite was not black. |
| final screenshot | `0.0225` | Worse than the current stable normal-path home baseline of about `0.031`. |

Decision: reject this pass-order change for production and keep the stable current order while continuing source attribution. The result is useful because it proves that a broad structural rewiring can reduce visible parity even when the intermediate targets are healthy. The next `OA/CA` batch should be smaller: compare source `CA` formula, `uDarken` active value, bloom texture ownership, and target sampling one at a time instead of swapping the whole pass chain.

### S1-32 OA/CA Stage Attribution Result

A debug-only final-composite stage probe is now available:

- Added `?debug-composite-stage=1..5`, active only when explicitly requested.
- Added `scripts/compare-composite-stages.mjs`, which captures stages `0..5` with `?debug-output-probe=1`.
- Normal rendering remains unchanged at stage `0`.

Stage meanings:

| Stage | Output point |
| --- | --- |
| `0` | Normal `OA/CA` output. |
| `1` | `rgbshift(tScene)` only. |
| `2` | scene plus bloom. |
| `3` | scene plus bloom plus fluid contribution. |
| `4` | after source multiply darken: `blend(15, ..., black, uDarken * 2. + mouseSim.r * .25 * uDarken)`. |
| `5` | after source lighten against black, before final saturation. |

Diagnostic run at `/tmp/rogier-composite-stages-s132`:

| Stage | Screenshot luma | Interpretation |
| --- | ---: | --- |
| `0` normal | `0.0314` | Stable current baseline. |
| `1` scene only | `0.0530` | Final input is visibly brighter before bloom/darken. |
| `2` + bloom | `0.0674` | Bloom raises output substantially. |
| `3` + fluid | `0.0673` | Fluid is disabled/neutral for home static capture. |
| `4` + multiply darken | `0.0307` | This is the main final-composite luma drop. |
| `5` + lighten black | `0.0313` | Lighten barely changes the result after multiply darken. |

Decision: keep the debug stage probe. Do not remove or weaken the multiply-darken formula, because the source `CA` uses the same operation and `uDarken = .2` is source default. The next attribution target is why source can tolerate this darken step while the rebuild cannot: active `uDarken` route ownership, `tMouseSim.r` range, `tScene` transfer/linear interpretation at the `OA/CA` input, and source `blendMultiply` implementation details. This narrows the next batch to measured inputs around the multiply stage, not broad composite rewiring.

### S1-33 OA/CA Darken Input Attribution Result

The final-composite probe now records multiply-darken inputs and supports debug-only darken isolation:

- Added `?debug-composite-darken=1` to use only the source base term `uDarken * 2`.
- Added `?debug-composite-darken=2` to use only the mouse term `mouseSim.r * .25 * uDarken`.
- Added `?debug-composite-darken=3` to bypass the multiply-darken opacity.
- `scripts/compare-composite-stages.mjs` now captures these variants in addition to stages `0..5`.
- Output probe now reports `estimatedDarkenOpacityFromMouseGrid`, `estimatedDarkenOpacityWithoutMouse`, and `estimatedDarkenOpacityMouseOnly`.

Source/rebuild blend check:

- Source `blendMultiply(base, blend, opacity)` is `(base * blend) * opacity + base * (1.0 - opacity)`.
- Rebuild `blendMultiply(base, blend, opacity)` is algebraically equivalent.
- Therefore the live luma drop is not caused by a local blend function formula mismatch.

Diagnostic run at `/tmp/rogier-composite-stages-s133`:

| Variant | Screenshot luma | Estimated opacity | Interpretation |
| --- | ---: | ---: | --- |
| default darken | `0.0313` | `0.4008` | Current normal-path baseline. |
| base-only darken | `0.0317` | `0.4000` | Nearly identical to default. |
| mouse-only darken | `0.0671` | `0.00085` mouse term | Mouse term is not the static brightness culprit. |
| darken off | `0.0672` | `0` debug override | Matches the pre-darken stage, confirming multiply darken ownership. |

Mouse simulation readback during the static capture:

- `screenMouseSim` 9x9 mean red/luma: about `0.017`.
- `screenMouseSim` 9x9 max red: about `0.26`.
- The estimated mouse contribution to multiply opacity is only about `0.00085`, compared with the base `uDarken * 2 = 0.4`.

Decision: keep the darken input probe and do not tune `uDarken` downward as a production fix. Source `xt.darken = .2`, source `CA` multiplies by `uDarken * 2.`, and source home/about/error route state sets this value. The remaining question is not mouse/fluid corruption; it is why the source `tScene` entering this same darken formula has enough perceived brightness afterward. Continue with `tScene` transfer/color interpretation and source-vs-rebuild capture timing/active-project state before touching production darken constants.

### S1-34 Source/Rebuild Home State Timing Check

The source-vs-rebuild capture harness now records a more reliable home active state:

- `active` checks `[data-project-card].is-active`, `.ui-work-ul [data-slug].is-active`, and `.ui-progressbar-item.is-active`.
- `firstWorkSlug` records the first work item slug even when the original HTML does not use rebuild-only `data-project-card`.
- `workSlugCount` records the home work item count.
- `scripts/capture.mjs` now writes `summary.json` into the capture output directory.

This fixed a misleading earlier observation where original captures reported `active:null` only because the mirrored source HTML does not contain `data-project-card`.

Source/rebuild data-state evidence:

- Mirrored source `_astro/hashgraph-vc...js`: `darkenOverview:.2`, `ambient:.75`, `contrast:1.4`.
- Rebuild `src/data/projects.json`: `hashgraph-vc` has the same `darkenOverview`, `ambient`, and `contrast` values.
- Capture at `/tmp/rogier-compare-s134-state`: original and rebuild both report `active:"hashgraph-vc"`, `firstWorkSlug:"hashgraph-vc"`, and `workSlugCount:10`.

Timing evidence:

| Capture wait | Original desktop luma | Rebuild desktop luma | Original mobile luma | Rebuild mobile luma |
| --- | ---: | ---: | ---: | ---: |
| `4200ms` | `0.1057` | `0.0313` | `0.0549` | `0.0371` |
| `8000ms` | `0.0999` | `0.0315` | `0.0548` | `0.0384` |
| state-enhanced `4200ms` | `0.1050` | `0.0313` | `0.0548` | `0.0376` |

Decision: the remaining desktop home brightness gap is not explained by active project mismatch, work-item count mismatch, or short capture timing. Since source and rebuild are both on `hashgraph-vc` with source-matching `uDarken` inputs, the next attribution target remains the color/transfer interpretation of the `tScene` input before `OA/CA` multiply darken, plus any upstream `VA`/spotlight response that determines that input's perceived brightness.

### S1-35 OA/CA `tScene` Transfer Attribution Result

The final-composite probe now includes debug-only `tScene` transfer variants:

- Added `?debug-composite-transfer=1`, which applies `pow(tScene.rgb, 1.0 / 2.2)` after `rgbshift(tScene)` and before bloom/darken.
- Added `?debug-composite-transfer=2`, which applies `pow(tScene.rgb, 2.2)` at the same point.
- `scripts/compare-composite-stages.mjs` now captures `transfer-default`, `transfer-scene-gamma`, and `transfer-scene-linearize`.
- Normal rendering remains unchanged unless the query flag is present.

Diagnostic run at `/tmp/rogier-composite-transfer-s135`:

| Variant | Screenshot luma | Interpretation |
| --- | ---: | --- |
| default transfer | `0.0314` | Current stable normal-path baseline. |
| `scene-gamma` | `0.0679` | A gamma-like lift of `tScene` explains part of the dark final output. |
| `scene-linearize` | `0.0193` | Treating `tScene` as needing linearization makes the mismatch worse. |

Context from the same run:

- Stage `1` (`rgbshift(tScene)` only) luma stayed around `0.0533`.
- Stage `2` (scene plus bloom) luma stayed around `0.0672`.
- Pre-composite render target 9x9 luma stayed stable around `0.234` across transfer variants, so the debug transfer only changes the final `OA/CA` interpretation, not upstream target generation.

Decision: keep the transfer probe, but do not promote `scene-gamma` to production. It improves final home luma from `~0.031` to `~0.068`, but still falls well short of the source desktop luma (`~0.100-0.106`) and would be a broad color-space compensation without source proof. The result shows transfer interpretation is a real partial factor; the remaining gap still requires upstream `VA`/spotlight/tScene content attribution, especially why the source scene survives the same `uDarken * 2` multiply with higher perceived brightness.

### S1-36 Home Brightness Attribution Matrix Result

Added `scripts/compare-home-brightness-attribution.mjs`, a QA-only CDP harness that captures the rebuild home page across the current brightness debug switches:

- `?debug-spotlight-map=off`
- `?debug-spotlight-map-transfer=srgb`
- `?debug-composite-transfer=1`
- `?debug-composite-darken=3`

Normal rendering remains unchanged unless one of those debug flags is present.

Diagnostic run at `/tmp/rogier-home-brightness-s136`:

| Variant | Screenshot luma | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 |
| --- | ---: | ---: | ---: | ---: | ---: |
| default | `0.0312` | `0.1864` | `0.2332` | `0.0214` | `0.0603` |
| spotlight map off | `0.1122` | `0.2619` | `0.3720` | `0.0762` | `0.0603` |
| spotlight transfer | `0.0755` | `0.2227` | `0.3075` | `0.0534` | `0.0603` |
| scene transfer | `0.0678` | `0.1864` | `0.2337` | `0.0219` | `0.0603` |
| spotlight + scene transfer | `0.1153` | `0.2273` | `0.3126` | `0.0535` | `0.0603` |
| darken off | `0.0673` | `0.1854` | `0.2346` | `0.0221` | `0.0603` |
| spotlight map off + darken off | `0.2034` | `0.2506` | `0.3623` | `0.0764` | `0.0603` |

Important attribution:

- `spotlight map off` reaches `0.1122`, which is already close to or above the measured source desktop home luma range (`~0.100-0.106`).
- `spotlight + scene transfer` reaches `0.1153`, also in the source range.
- `scene transfer` alone reaches only `0.0678`, so final `OA/CA` transfer explains a real but incomplete part of the gap.
- `darken off` reaches only `0.0673`, and S1-33 already proved source-shaped static darken is expected. This remains a diagnostic, not a production fix.
- The thumb composite probe stayed stable at `~0.0603` across variants, so the matrix points less at active thumb payload/timing and more at how the spotlight map is interpreted by the ordinary work material and light shader.

Decision: keep the attribution script and debug switches, but do not disable the spotlight map or promote either gamma-like transfer path to production. The largest remaining home desktop gap is now concentrated in `VA/zA` spotlight-map light semantics and source-vs-Three-0.184 material response, with `tScene` transfer as a secondary factor. The next batch should compare source `lights_fragment_begin` / `RE_Direct` / reflected-light accumulation against the generated rebuild shader before any broad render-target or visual tuning change.

### S1-37 Source Light Chunk Audit Result

Added `scripts/compare-source-light-chunks.mjs`, a static source-vs-rebuild shader chunk attribution tool. It extracts source bundle chunks from `legacy-mirror/public/assets/bundle.250f01b7.js` and compares them with local Three 0.184 `ShaderChunk` output:

- Source `MS`: `lights_pars_begin`
- Source `CS`: `lights_physical_fragment`
- Source `RS`: `lights_physical_pars_fragment`
- Source `PS`: `lights_fragment_begin`
- Source `IS`: `lights_fragment_end`

Diagnostic run at `/tmp/rogier-source-light-chunks-s137`:

| Chunk | Source length | Rebuild length | Delta | Key result |
| --- | ---: | ---: | ---: | --- |
| `lights_pars_begin` | `4560` | `4389` | `-171` | No direct spotlight-map loop. |
| `lights_physical_fragment` | `3818` | `4021` | `+203` | Material field ownership differs. |
| `lights_physical_pars_fragment` | `14683` | `18001` | `+3318` | Current Three adds multiscatter and newer material fields. |
| `lights_fragment_begin` | `5411` | `6184` | `+773` | Spotlight-map core lines are present and source-equivalent. |
| `lights_fragment_end` | `389` | `472` | `+83` | No direct spotlight-map loop. |

Critical finding: the source and rebuild spotlight-map projection/multiplication lines are equivalent in the active chunk:

- `spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w`
- `inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) )`
- `spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy )`
- `directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color`
- `RE_Direct( directLight, ... material, reflectedLight )`

The stronger source-vs-rebuild difference is downstream physical response:

- Source `CS` writes `material.diffuseColor = diffuseColor.rgb * (1.0 - metalnessFactor)`.
- Rebuild Three 0.184 writes `material.diffuseColor = diffuseColor.rgb`, `material.diffuseContribution = diffuseColor.rgb * (1.0 - metalnessFactor)`, and `material.metalness = metalnessFactor`.
- Source specular uses `material.specularColor` directly.
- Rebuild splits `material.specularColor` and `material.specularColorBlended`.
- Source `RS` direct light uses single `BRDF_GGX(...)`.
- Rebuild `RS` direct light uses `BRDF_GGX_Multiscatter(...)` and the newer diffuse/specular field names.

Source `VA` material constants were rechecked from the bundle: `dithering=true`, `transparent=true`, `envMapIntensity=.75`, `roughness=1`, `depthTest=false`, `depthWrite=false`, and no explicit metalness override, so default metalness remains `0`. The rebuild ordinary work material is already aligned on those constants.

Decision: stop treating the spotlight projection formula as the primary suspect. The next safe experiment should be debug-gated attribution of old physical-material response inside ordinary `VA` only, not a production change and not a light/intensity tweak. If that debug path does not materially close the luma gap, return to thumb render-target transfer/content and final `OA/CA` transfer as the remaining proven contributors.

### S1-38 `VA` Physical Response Attribution Result

Added a QA-only `?debug-va-physical-response=` switch for ordinary home `VA` work blocks:

- `direct`: expands `lights_physical_pars_fragment` and changes direct light from Three 0.184 `BRDF_GGX_Multiscatter(...)` back to a source-shaped single `BRDF_GGX(...)`; direct diffuse also reads `material.diffuseColor`.
- `source-fields`: includes `direct` and expands `lights_physical_fragment` so `material.diffuseColor`, `material.diffuseContribution`, `material.specularColor`, and `material.specularColorBlended` follow source-compatible ownership.

Normal rendering remains unchanged unless the query flag is present. `dump-va-shader` against the built `dist` confirmed both debug variants expand the intended chunks and produced no shader/runtime console errors.

Diagnostic run at `/tmp/rogier-home-brightness-s138`:

| Variant | Screenshot luma | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 |
| --- | ---: | ---: | ---: | ---: | ---: |
| default | `0.1572` | `0.1864` | `0.2336` | `0.0216` | `0.0603` |
| `va-physical-direct` | `0.1571` | `0.1857` | `0.2342` | `0.0223` | `0.0603` |
| `va-physical-source-fields` | `0.1571` | `0.1855` | `0.2349` | `0.0223` | `0.0603` |
| spotlight transfer | `0.2278` | `0.2277` | `0.3126` | `0.0532` | `0.0603` |
| scene transfer | `0.2667` | `0.1847` | `0.2326` | `0.0219` | `0.0603` |
| spotlight + scene transfer | `0.3286` | `0.2242` | `0.3071` | `0.0533` | `0.0603` |
| spotlight map off | `0.2774` | `0.2589` | `0.3650` | `0.0763` | `0.0603` |

Important attribution:

- Old direct `BRDF_GGX` does not increase the visible output; it is effectively identical to default in this setup.
- Source-compatible material fields also do not materially increase output.
- The same matrix still shows large movement from spotlight-map transfer, scene transfer, and map-off diagnostics.
- Because ordinary work metalness is source/default `0`, the current Three 0.184 `diffuseContribution/specularColorBlended` split is not the main luma gap for home work blocks.

Decision: keep the debug switch as attribution tooling, but do not promote old physical response to production. This closes the S1-37 suspect path as low-impact. The remaining proven contributors are now narrower: thumb/spotlight map transfer/content and final `OA/CA` `tScene` transfer. The next Phase 1 batch should target render-target texture transfer/color-space around `T1/_1` and `OA/CA` rather than light intensity, spotlight projection formula, or physical BRDF constants.

### S1-39 Sky Target Attribution Result

Added sky target attribution to the output probe and brightness matrix:

- `window.__rogierOutputProbe.targets.skyRaw`
- `window.__rogierOutputProbe.targets.skyComposite`
- `?debug-sky-target=off`, which feeds the environment material a placeholder texture instead of the sky composite target.
- `?debug-sky-target=raw`, which feeds the environment material the raw sky target instead of the composite target.

Normal rendering still uses `skyCompositeTarget.texture`.

Diagnostic run at `/tmp/rogier-home-brightness-s139-sky`:

| Variant | Screenshot luma | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Sky raw 9x9 | Sky composite 9x9 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| default | `0.1570` | `0.1865` | `0.2348` | `0.0215` | `0.4000` | `0.4397` |
| sky off | `0.1572` | `0.1865` | `0.2343` | `0.0223` | `0.4000` | `0.4397` |
| sky raw | `0.1573` | `0.1859` | `0.2345` | `0.0221` | `0.4000` | `0.4397` |
| spotlight transfer | `0.2281` | `0.2228` | `0.3127` | `0.0535` | `0.4000` | `0.4397` |
| scene transfer | `0.2669` | `0.1881` | `0.2366` | `0.0220` | `0.4000` | `0.4397` |
| spotlight + scene transfer | `0.3281` | `0.2223` | `0.3044` | `0.0532` | `0.4000` | `0.4396` |

Important attribution:

- The sky targets are alive, correctly sized (`675 x 675` at a `900px` viewport height), and non-black.
- Feeding the environment a placeholder or raw sky target barely changes final/home work luma.
- The already-implemented sky bridge is therefore not the remaining large home brightness lever.
- The same run again shows the dominant measured movement comes from spotlight-map transfer and final scene transfer diagnostics.

Decision: keep the sky probe and debug switch. Treat S1-10 as implemented and stop prioritizing sky target work for the main Phase 1 brightness gap. The next batch should return to the two remaining proven contributors: spotlight-map transfer/content and `OA/CA` `tScene` transfer.

### S1-40 Loaded Texture ColorSpace Attribution Result

Source evidence:

- Source `Xt.loadTexture` and `Xt.loadImage` call the bundled Three r164 texture loader directly.
- The bundled `Texture` default constructor uses empty `colorSpace` (`Gi = ""`), and the ordinary `Xt` image/texture path does not override it to sRGB.
- Cube/environment textures and the floor normal map use separate paths and are not covered by this change.

Rebuild change:

- Ordinary loaded image/video textures now default to empty colorSpace, matching the source loader path.
- `?debug-texture-colorspace=srgb` restores the previous rebuild behavior for attribution and rollback.
- The floor normal map still forces `NoColorSpace`; cube/environment textures still explicitly use `SRGBColorSpace`.

Diagnostic run before promoting the fix at `/tmp/rogier-home-brightness-s140-texture-colorspace`:

| Variant | Screenshot luma | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb 9x9 | Thumb composite 9x9 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| previous default | `0.1572` | `0.1835` | `0.2292` | `0.0217` | `0.0752` | `0.0603` |
| spotlight transfer | `0.2274` | `0.2199` | `0.3054` | `0.0528` | `0.0752` | `0.0603` |
| source texture colorSpace | `0.2285` | `0.2160` | `0.3134` | `0.0543` | `0.2210` | `0.1767` |

Decision: promote ordinary loaded texture colorSpace to the source default. This is the strongest source-proven contributor found in the current brightness audit: it materially raises the thumb and thumb-composite targets without changing source constants, spotlight intensity, sky target ownership, or BRDF code. The next Phase 1 batch should re-run the production matrix and then continue with `OA/CA` `tScene` transfer and final composite attribution.

Production verification after promotion at `/tmp/rogier-home-brightness-s140-production`:

| Variant | Screenshot luma | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb 9x9 | Thumb composite 9x9 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| default | `0.2253` | `0.2178` | `0.3162` | `0.0519` | `0.2210` | `0.1767` |
| old sRGB texture behavior | `0.1533` | `0.1862` | `0.2365` | `0.0207` | `0.0752` | `0.0619` |
| spotlight + scene transfer diagnostics | `0.3669` | `0.2459` | `0.3602` | `0.0731` | `0.2210` | `0.1772` |

Verification passed:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-s140-texture-colorspace` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Next: continue with `OA/CA` `tScene` transfer and final composite attribution. The texture colorSpace fix removes a major thumb-map content error, but the remaining transfer diagnostics still show material headroom.

### S1-41 Work/Main Pass Ownership Attribution Result

Source evidence:

- Source `workScene` uses `kA/OA/CA` as its own render manager and writes `workScene.renderManager.renderTargetComposite`.
- Source init then assigns `mainScene.renderManager.compositeMaterial.uniforms.tWork.value = workScene.renderManager.renderTargetComposite.texture`.
- Source `A1/C1` therefore consumes already-composited work output, while the rebuild currently keeps a stable bridge where `A1` consumes `workRawTarget` and the final screen pass applies `OA/CA`.

Added a debug-only attribution path:

- `?debug-pass-order=source-work-composite` renders `workRawTarget` through the `OA/CA` composite into a new `workCompositeTarget`, then feeds that target to `A1.tWork`.
- Normal rendering still uses `workRawTarget` as `A1.tWork`.
- The output probe now reports `targets.workComposite`; it is expected to be black in normal rendering because the target is only populated by the debug path.
- The brightness attribution matrix now includes `source-work-composite-pass`.

Diagnostic run at `/tmp/rogier-home-brightness-s141-pass-order`:

| Variant | Screenshot luma | Work raw 9x9 | Work composite 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| default | `0.2284` | `0.2170` | `0.0000` | `0.3113` | `0.0531` | `0.1767` |
| source work-composite pass | `0.1440` | `0.2217` | `0.1690` | `0.2168` | `0.0194` | `0.1773` |
| scene transfer | `0.3313` | `0.2144` | `0.0000` | `0.3086` | `0.0528` | `0.1767` |
| spotlight + scene transfer | `0.3693` | `0.2479` | `0.0000` | `0.3632` | `0.0731` | `0.1767` |

Decision: keep this as attribution tooling and do not promote the source-shaped work/main pass ownership to production yet. After the S1-40 texture colorSpace fix, the two-level ownership experiment is still strongly negative in the current bridge: it darkens the intermediate work composite and then reduces `A1` input luma. This confirms the earlier S1-31 result under the new brighter texture baseline. The remaining productive path is not a broad pass-order rewrite; continue with smaller `OA/CA` `tScene` transfer/content attribution and the upstream `VA` work output that feeds it.

Verification passed:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-s141-pass-order` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

### S1-42 Ordinary `VA` Tail Alpha Cleanup Result

Source evidence:

- Source `zA` runs `#include <opaque_fragment>`, then owns the final alpha with `gl_FragColor.a = mixedAlpha`.
- The source ordinary `VA` tail does not keep the generated Three `OPAQUE` / `USE_TRANSMISSION` alpha multiplication after the custom reveal/mouse alpha is computed.
- Rebuild ordinary work `VA` still ended with `gl_FragColor = vec4(sourceColor, alpha * diffuseColor.a)`, plus the generated `OPAQUE` and `USE_TRANSMISSION` alpha branches.

Change:

- Ordinary work `VA` now writes `gl_FragColor = vec4(sourceColor, alpha)` in its custom tail, matching source ownership of reveal alpha.
- The auxiliary block path keeps its previous bridge tail in a separate `auxiliaryBlockOpaqueFragmentChunk`; source `WA/XA` is a different shader family and was not changed by this ordinary `VA` cleanup.

Shader diagnostic at `/tmp/rogier-va-shader-s142-tail-alpha`:

| Metric | Before | After |
| --- | ---: | ---: |
| Rebuild ordinary work fragment length | `6297` | `6158` |
| Delta vs source `zA` length | `+1209` | `+1070` |
| Shader/console errors | `0` | `0` |

Brightness matrix at `/tmp/rogier-home-brightness-s142-tail-alpha`:

| Variant | Screenshot luma | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 |
| --- | ---: | ---: | ---: | ---: | ---: |
| default | `0.2254` | `0.2226` | `0.3163` | `0.0524` | `0.1777` |
| scene transfer | `0.3326` | `0.2232` | `0.3237` | `0.0550` | `0.1767` |
| texture sRGB rollback | `0.1568` | `0.1849` | `0.2318` | `0.0219` | `0.0603` |

Decision: keep the ordinary `VA` tail alpha cleanup because it removes a source-proven generated-tail deviation and does not regress browser QA. It is not a material brightness fix: default luma remains in the S1-40 range (`~0.225`). The remaining ordinary `VA` work should continue with generated-vs-source light/body interface differences that still show in the shader dump: modern physical-material uniforms (`dispersion`, `anisotropy*`) and the source `HA`/rebuild vertex-body delta around transformed/world position.

Verification passed:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-s142-tail-alpha` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

### S1-43 Phase 1 Difference Audit Refresh

This batch is an analysis-only checkpoint requested before the next implementation pass. No runtime code changed.

Current Phase 1 readout:

| Chain | Progress | Evidence | Decision |
| --- | ---: | --- | --- |
| `p1/GA/T1` structure | High | Source-sized grids, carousel placement, thumb square target, visible thumb count, spotlight ownership, and route visual state are source-shaped. | Do not spend the next batch on broad hierarchy rewrites. |
| Ordinary texture/color input | High | S1-40 promoted source-default loaded texture color space and moved home default luma to `~0.225`; rollback to old sRGB path falls to `~0.157`. | Keep. This was the largest proven brightness fix. |
| `VA/zA` fragment light body | Medium-high | Source and local Three spotlight-map chunk formulas match; old physical-response debug variants were near-identical to default. Tail alpha cleanup is source-correct but low-impact. | Stop chasing spotlight intensity or physical BRDF as the first suspect. Continue only with residual generated-vs-source body/vertex deltas. |
| `HA` vertex/world position | Medium | Full `HA` replacement was source-proven but unstable under console-aware QA. Current bridge is close, but still differs around source `screenUv`, `mouseSim.r`, and unclamped `transformed / (1. - mouseSim.r * .2)` world-position ownership. | Next diagnostic target. Use debug-gated attribution rather than replacing full `HA`. |
| `OA/CA` final transfer | Medium | Source-shaped darken formula and `uDarken=.2` are confirmed. `debug-composite-transfer=1` still raises output from `~0.225` to `~0.333`, proving transfer interpretation matters. | Keep as a proven contributor, but do not promote gamma-like transfer without source renderer evidence. |
| Source-shaped work/main pass order | Low for production | S1-31 and S1-41 both showed source-work-composite pass ownership darkens the rebuild in the current bridge. | Keep only as diagnostic; do not rewire production pass order next. |
| `Ka` mouse/fluid | Medium-high structurally | Ping-pong simulations and per-item targets exist; static mouse term is not the brightness culprit. | Defer until interaction QA, unless vertex/world-position diagnostics implicate `tMouseSim` sizing. |
| Project detail media | Stable, not complete | Marker/browser smoke passes; project pages remain darker than source. Prior offscreen-media experiment regressed luma. | Keep as regression gate during home Phase 1; do not optimize project pages separately yet. |

Batch-size decision:

- Five tiny differences is too conservative now when they are all diagnostics or documentation; it wastes repeated build/QA cycles.
- Ten differences is reasonable only when they are in one chain and mostly non-runtime, such as shader report fields, probe outputs, comments, source extraction helpers, or documented accepted deviations.
- A whole-Phase-1 pass is still too risky. Previous full `HA`, fragment-tail, and source-work-composite ownership experiments either failed console-aware QA or moved luma in the wrong direction despite passing build.

Recommended next implementation batch:

1. Extend generated shader diagnostics for ordinary `VA` vertex sections: source `HA` block, rebuild `begin_vertex`, rebuild `worldpos_vertex`, active varyings, and world-position formulas.
2. Add a debug-only `?debug-va-world-undo=source` path that removes the local `max(...)` clamp in `workBlockWorldPositionChunk`, then measure whether spotlight projection/luma changes.
3. Add output-probe fields for ordinary work spotlight/world-position attribution if it can be done without changing normal rendering.
4. Re-run `dump-va-shader`, home brightness attribution, full source-vs-rebuild capture, build, diff check, and marker checks.
5. Keep production code unchanged unless the debug path gives a source-proven positive result with no project-page regression.

This is a 6-8 point batch in one chain, not five isolated micro-steps and not a Phase 1 all-at-once rewrite.

### S1-44 `VA` Vertex / World-Position Attribution Result

This batch added diagnostics and one debug-only vertex attribution path. Normal production rendering remains on the stable `VA` chunk bridge.

Changes:

- `scripts/dump-va-shader.mjs` now writes `vertex-analysis.json` and includes vertex section summaries in `summary.json`.
- The vertex report compares source `HA` with the generated rebuild work vertex shader around `begin_vertex`, `project_vertex`, `worldpos_vertex`, mouse sampling, varyings, and world-position formulas.
- Added `?debug-va-world-undo=source`, work-block only, which changes the rebuild world-position helper from `transformed / max(1.0 - vMouseSim * 0.2, 0.0001)` to `transformed / (1.0 - vMouseSim * 0.2)`.
- Added `va-world-undo-source` to `scripts/compare-home-brightness-attribution.mjs`.

Shader dump results:

| Dump | Vertex length | Key formula | Shader/console errors |
| --- | ---: | --- | ---: |
| Default `/tmp/rogier-va-shader-s143-vertex` | `4302` vs source `4482` | `transformed / max(1.0 - vMouseSim * 0.2, 0.0001)` | `0` |
| `debug-va-world-undo=source` `/tmp/rogier-va-shader-s143-world-source` | `4291` vs source `4482` | `transformed / (1.0 - vMouseSim * 0.2)` | `0` |

The vertex analyzer confirms these residual source-vs-rebuild differences:

- Source `HA` uses `gl_Position.xy / uCoords.xy` to derive an early `screenUv`; rebuild does not currently mirror that exact early projection path.
- Source `HA` performs the world-position mouse undo as `transformed /= 1. - mouseSim.r * .2`; the default rebuild bridge keeps a clamp for numerical safety.
- The rebuild still carries Three 0.184 generated vertex includes such as batching/morph/skinning/project/logdepth/clipping wrappers. These are mostly compatibility wrappers, not proven visual defects.

Brightness attribution at `/tmp/rogier-home-brightness-s143-world`:

| Variant | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: |
| default | `0.2165` | `0.3103` | `0.0525` | `0.1775` | `0` |
| `va-world-undo-source` | `0.2224` | `0.3216` | `0.0549` | `0.1767` | `0` |
| spotlight transfer | `0.2473` | `0.3536` | `0.0745` | `0.1767` | `0` |
| scene transfer | `0.2189` | `0.3167` | `0.0548` | `0.1767` | `0` |
| source work-composite pass | `0.2226` | `0.2179` | `0.0211` | `0.1767` | `0` |
| texture sRGB rollback | `0.1869` | `0.2347` | `0.0214` | `0.0603` | `0` |

Decision:

- Keep the vertex analyzer and `debug-va-world-undo=source` attribution switch.
- Do not promote the unclamped source world-position formula to production. It is source-shaped and stable in the debug path, but it only creates a small positive movement compared with the already-kept texture color-space fix and does not close the remaining Phase 1 gap.
- Stop treating the `max(...)` clamp as the main spotlight/thumb projection defect.
- Continue next with source renderer/output and `OA/CA` input-transfer attribution, plus the source `HA` early `screenUv` path only if a smaller diagnostic can isolate it safely. Do not attempt full `HA` replacement again.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5231 OUT_DIR=/tmp/rogier-va-shader-s143-vertex CDP_PORT=9291 DUMP_WAIT=5200 node scripts/dump-va-shader.mjs`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5231 OUT_DIR=/tmp/rogier-home-brightness-s143-world CDP_PORT=9292 CAPTURE_WAIT=5200 node scripts/compare-home-brightness-attribution.mjs`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5231 OUT_DIR=/tmp/rogier-va-shader-s143-world-source CDP_PORT=9293 DUMP_WAIT=5200 EXTRA_QUERY='&debug-va-world-undo=source' node scripts/dump-va-shader.mjs`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-s143-world-undo` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

### S1-45 Renderer Output / `OA/CA` Transfer Attribution Result

This batch audited the source renderer/output chain and added a debug-only renderer output-color attribution path. Normal production rendering remains source-shaped with `renderer.outputColorSpace = "srgb"`.

Source/static evidence:

- Added `scripts/audit-renderer-output.mjs`.
- Source bundle Three revision is `164`.
- Source custom renderer `qw` calls the bundled `WebGLRenderer` with `alpha:true`, `antialias:false`, `preserveDrawingBuffer:false`, `powerPreference:"high-performance"`, `stencil:false`, `depth:false`, then sets `autoClear=false` and `outputColorSpace=Gt`; the bundle constant `Gt` is `"srgb"`.
- Source `Lu` render manager creates `renderTargetA = new WebGLRenderTarget(1,1,{ depthBuffer:false, stencilBuffer:false })`, clones the rest, and then sets `renderTargetA.depthBuffer = true`.
- Source `Lo` uses the same default render-target clone pattern for simple render managers.
- Source `OA` uses `fragmentShader: CA`, `toneMapped:false`, `NormalBlending`, `transparent:true`, `depthWrite:false`, and `depthTest:false`.
- Source `CA` contains `#include <tonemapping_fragment>`, but because `OA.toneMapped` is false this is not evidence for enabling tone mapping in production.
- Local Three 0.184 source-like render targets have empty texture `colorSpace`, unsigned-byte RGBA, linear min/mag filters, and `generateMipmaps:false`, matching the source default render-target assumptions closely enough for now.

Debug attribution:

- Added `?debug-renderer-output=linear`, which changes only `renderer.outputColorSpace` from `srgb` to `srgb-linear`.
- Added `renderer-output-linear` to `scripts/compare-home-brightness-attribution.mjs`.
- A more destructive `NoColorSpace` renderer-output trial failed to produce `__rogierOutputProbe` and was not kept in the standard matrix. It is not source-shaped anyway because source explicitly uses `srgb`.

Brightness attribution at `/tmp/rogier-home-brightness-s145-renderer-output2`:

| Variant | Renderer output | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 | Errors |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| default | `srgb` | `0.2204` | `0.3189` | `0.0540` | `0.1767` | `0` |
| renderer output linear | `srgb-linear` | `0.2199` | `0.3184` | `0.0548` | `0.1767` | `0` |
| scene transfer | `srgb` | `0.2205` | `0.3188` | `0.0549` | `0.1767` | `0` |
| spotlight transfer | `srgb` | `0.2445` | `0.3594` | `0.0748` | `0.1767` | `0` |
| source work-composite pass | `srgb` | `0.2167` | `0.2117` | `0.0211` | `0.1767` | `0` |
| texture sRGB rollback | `srgb` | `0.1861` | `0.2347` | `0.0214` | `0.0603` | `0` |

Decision:

- Keep `scripts/audit-renderer-output.mjs` and the `debug-renderer-output=linear` attribution switch.
- Do not change production `renderer.outputColorSpace`; source and rebuild both use `srgb`, and `srgb-linear` barely changes the measured internal targets.
- Do not promote the existing `debug-composite-transfer=1` gamma-like `tScene` lift. It still proves transfer interpretation can move the final visual, but S1-45 rules out renderer outputColorSpace as the source-backed explanation.
- Continue Phase 1 with a narrower `CA`/blend-table and screen-pass shader audit: compare source blend mode implementations, `CA` final black blend constants, and screen material GLSL/output semantics rather than renderer-level output settings.

Verification passed:

- `OUT_DIR=/tmp/rogier-renderer-output-s145 node scripts/audit-renderer-output.mjs`
- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5233 OUT_DIR=/tmp/rogier-home-brightness-s145-renderer-output2 CDP_PORT=9296 CAPTURE_WAIT=5200 node scripts/compare-home-brightness-attribution.mjs`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-s145-renderer-output` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

### S1-46 `CA` Blend Table / Final Lighten Attribution Result

This batch audited source `CA` blend-mode ownership and added a debug-only final-lighten attribution path. Normal production rendering remains source-shaped.

Source/static evidence:

- `scripts/audit-renderer-output.mjs` now also extracts `source-Po-blend.glsl`, `source-fg-blend-lighten.glsl`, and `source-hg-blend-multiply.glsl`.
- Source `Po` maps mode `11 -> blendLighten` and mode `15 -> blendMultiply`.
- Source `blendLighten(base, blend, opacity)` is `blendLighten(base, blend) * opacity + base * (1.0 - opacity)`, where `blendLighten` is per-channel `max(blend, base)`.
- Source `blendMultiply(base, blend, opacity)` is `base * blend * opacity + base * (1.0 - opacity)`.
- Rebuild `homeCompositeFragment` uses equivalent formulas for the only `CA` modes used by the source final composite.
- Source `CA` final black constant is `vec3(0.095,0.095,0.095)`, matching rebuild `vec3(0.095)`.

Debug attribution:

- Added `?debug-composite-lighten=off`, which skips the source final `blend(11, color, black, 1.)` step only when explicitly requested.
- Added `composite-lighten-off` to `scripts/compare-home-brightness-attribution.mjs`.

Brightness attribution at `/tmp/rogier-home-brightness-s146-ca-blend`:

| Variant | Final lighten mode | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| default | `0` | `0.2189` | `0.3157` | `0.0539` | `0.1767` | `0` |
| composite lighten off | `1` | `0.2173` | `0.3130` | `0.0548` | `0.1767` | `0` |
| darken off | `0` | `0.1908` | `0.2519` | `0.0201` | `0.1906` | `0` |
| scene transfer | `0` | `0.2191` | `0.3172` | `0.0548` | `0.1767` | `0` |
| spotlight transfer | `0` | `0.2387` | `0.3496` | `0.0753` | `0.1767` | `0` |
| source work-composite pass | `0` | `0.2204` | `0.2170` | `0.0216` | `0.1767` | `0` |
| texture sRGB rollback | `0` | `0.1603` | `0.2022` | `0.0115` | `0.0745` | `0` |

Decision:

- Keep the blend-table static audit and `debug-composite-lighten=off` switch.
- Do not change source `CA` blend mode mapping, black constant, final lighten, or multiply darken. They are source-confirmed and the final-lighten attribution barely moves the measured output.
- Stop treating `CA` blend-table implementation as the remaining Phase 1 brightness culprit.
- Continue with `A1/C1` and screen-pass GLSL semantics that are still less directly attributed: source GLSL300 `FragColor` vs rebuild WebGL1 `gl_FragColor`, exact `A1` formula ordering against the extracted source shader, and shared project media/composite brightness.

Verification passed:

- `OUT_DIR=/tmp/rogier-renderer-output-s146b node scripts/audit-renderer-output.mjs`
- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5235 OUT_DIR=/tmp/rogier-home-brightness-s146-ca-blend CDP_PORT=9298 CAPTURE_WAIT=5200 node scripts/compare-home-brightness-attribution.mjs`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-s146-ca-blend` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

### S1-46B `A1/C1` Flow-Order Attribution Result

This batch extended the renderer-output audit to compare extracted source `A1` against the rebuild `homePreCompositeFragment` with semantic GLSL anchors instead of brittle variable-name string matching. Normal production rendering is unchanged.

Source/static evidence:

- `scripts/audit-renderer-output.mjs` now extracts the rebuild `homePreCompositeFragment` alongside source `A1`, writes it to the audit output, and reports semantic anchor line numbers for both shaders.
- The source `A1` shader and rebuild `homePreCompositeFragment` both contain the expected `tWork`, `tMedia`, `uMediaReveal`, `uContrast`, add blend mode `1`, lighten blend mode `11`, contrast multiply, media alpha reveal mix, and two post-media noise mixes.
- `flowOrderMatchesSource` is `true` at `/tmp/rogier-renderer-output-s147d` after excluding only the `noise sample` declaration location. The actual noise application order remains source-shaped: media mix first, then `.75` and `1.5` noise mixes.
- The only source computations absent from rebuild are inert in the extracted source shader:
  - `displacementUv` is computed and transformed, but never used by source `A1`.
  - `vignetteF` is computed, but never used by source `A1`.
- Source uses GLSL300 `FragColor`; rebuild uses WebGL1-compatible `gl_FragColor`. This is a syntax/runtime compatibility difference, not current evidence of formula mismatch.

Decision:

- Keep the expanded static audit.
- Do not change production `homePreCompositeFragment` formula order, vignette constants, media mix, noise mix, or `A1` blend modes in this batch.
- Stop treating `A1` statement order as a primary cause of the remaining home luma gap. The next high-value Phase 1 target returns to ordinary `VA/zA` light/material semantics, especially spotlight-map projection/body differences under Three 0.184.
- Keep shared project pages as regression gates because `C1/A1` still owns shared media/composite behavior, but do not retry offscreen media routing without a narrower source-backed probe.

Verification passed:

- `OUT_DIR=/tmp/rogier-renderer-output-s147d node scripts/audit-renderer-output.mjs`

### S1-48 `VA` Early Vertex UV Attribution Result

This batch isolated the remaining source `HA` early-`screenUv` difference without changing default rendering.

Source/static evidence:

- Source `HA` computes `vec2 screenUv = gl_Position.xy / uCoords.xy`, then uses `newUv = screenUv`, adds `instanceOffset`, and samples `tMouseSim`, `tPerlin`, and `tDisplacement` from that path.
- The stable rebuild bridge samples those vertex textures from local mesh UV divided by grid size plus `instanceOffset`.
- Added `?debug-va-vertex-uv=source-zero`, work-block only, which replaces the local-UV seed with a source-shaped `screenUv` seed for attribution while keeping the rest of the stable bridge.
- `scripts/dump-va-shader.mjs` now reports `vec2 screenUv = vec2(0.0)` and `vec2 newUv = screenUv` checks so the debug path can be verified in generated shader dumps.
- `scripts/compare-home-brightness-attribution.mjs` now includes `va-vertex-uv-source-zero`.

Shader dump results:

| Dump | Vertex length | Key UV seed | Shader/console errors |
| --- | ---: | --- | ---: |
| Default `/tmp/rogier-va-shader-s148-default` | `4302` vs source `4482` | `vec2 newUv = uv` | `0` |
| `debug-va-vertex-uv=source-zero` `/tmp/rogier-va-shader-s148-source-zero` | `4335` vs source `4482` | `vec2 screenUv = vec2(0.0)` then `vec2 newUv = screenUv` | `0` |

Brightness attribution at `/tmp/rogier-home-brightness-s148-vertex-uv-retry`:

| Variant | Work raw 9x9 | Pre-composite 9x9 | Bloom 9x9 | Thumb composite 9x9 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: |
| default | `0.2200` | `0.3189` | `0.0551` | `0.1767` | `0` |
| `va-world-undo-source` | `0.2214` | `0.3196` | `0.0550` | `0.1767` | `0` |
| `va-vertex-uv-source-zero` | `0.2196` | `0.3164` | `0.0550` | `0.1767` | `0` |
| spotlight transfer | `0.2587` | `0.3632` | `0.0753` | `0.1767` | `0` |
| scene transfer | `0.2177` | `0.3182` | `0.0551` | `0.1767` | `0` |
| spotlight map off | `0.2609` | `0.3820` | `0.0820` | `0.1767` | `0` |
| texture sRGB rollback | `0.1852` | `0.2347` | `0.0224` | `0.0603` | `0` |

Decision:

- Keep the debug-only `debug-va-vertex-uv=source-zero` attribution switch and analyzer checks.
- Do not promote this vertex UV path to production. It is source-motivated and stable, but it slightly lowers measured pre-composite luma and does not close the remaining Phase 1 gap.
- Stop treating source `HA` early `screenUv` ownership as a primary brightness culprit in the current bridge.
- The highest-value remaining evidence is still outside single-vertex deltas: spotlight map transfer/projection as a contributor, final `OA/CA` transfer as a contributor, and project shared media/composite as a regression-gated later chain.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5237 OUT_DIR=/tmp/rogier-va-shader-s148-default CDP_PORT=9301 DUMP_WAIT=5200 node scripts/dump-va-shader.mjs`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5237 OUT_DIR=/tmp/rogier-va-shader-s148-source-zero CDP_PORT=9302 DUMP_WAIT=5200 EXTRA_QUERY='&debug-va-vertex-uv=source-zero' node scripts/dump-va-shader.mjs`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5237 OUT_DIR=/tmp/rogier-home-brightness-s148-vertex-uv-retry CDP_PORT=9304 CAPTURE_WAIT=8000 node scripts/compare-home-brightness-attribution.mjs`

### S1-49 Spotlight Projection Coverage Attribution Result

This batch added a projection/content probe to `?debug-output-probe=1`. Normal rendering remains unchanged unless the debug probe flag is present.

Changes:

- Added `spotlightProjection` to `window.__rogierOutputProbe`.
- The probe updates the Three `SpotLight.shadow.matrix`, samples the active work block bounds at center/left/right/top/bottom, projects those world points through the same matrix family used by `vSpotLightCoord`, and reads the corresponding `thumbCompositeTarget` pixels.
- It reports active slug, spotlight map ownership, active block bounds, projected UVs, in-map count, and sampled map luma.

Projection results at `/tmp/rogier-home-brightness-s149-spotlight-projection`:

| Variant | Has map | In-map samples | Center UV | Center map luma | Mean sampled map luma | Work raw 9x9 | Pre-composite 9x9 | Errors |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| default | `true` | `5/5` | `0.500,0.500` | `0.2764` | `0.2718` | `0.2210` | `0.3195` | `0` |
| spotlight map off | `false` | `5/5` | `0.500,0.500` | `0.2764` | `0.2718` | `0.2640` | `0.3782` | `0` |
| spotlight transfer | `true` | `5/5` | `0.500,0.500` | `0.2764` | `0.2718` | `0.2408` | `0.3524` | `0` |
| scene transfer | `true` | `5/5` | `0.500,0.500` | `0.2764` | `0.2718` | `0.2220` | `0.3215` | `0` |
| texture sRGB rollback | `true` | `5/5` | `0.500,0.500` | `0.0833` | `0.0837` | `0.1872` | `0.2392` | `0` |

Interpretation:

- The active `hashgraph-vc` block is not projecting outside the spotlight map.
- The active block center lands exactly on the thumb map center, and all sampled active-block bounds stay in-map.
- The sampled map luma is healthy on the current source-default texture path (`~0.272` mean) and collapses only under the intentional old texture color-space rollback (`~0.084`), which reconfirms S1-40.
- The `spotlight-map-off` variant still brightens work/pre-composite while the sampled target remains healthy; this points to the source-shaped map multiplication/transfer being inherently dark in the rebuild bridge, not a missing map, empty map, or gross projection-framing error.

Decision:

- Keep the projection probe.
- Do not change spotlight intensity, target, parallax, map assignment, thumb darkness, or thumb target size.
- Stop treating active-block spotlight projection coverage as the main remaining Phase 1 brightness culprit.
- The remaining Phase 1 closeout should focus on either source-backed `OA/CA` transfer evidence or an explicit accepted deviation for the map-transfer/composite brightness gap, while keeping project pages as regression gates.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5238 OUT_DIR=/tmp/rogier-home-brightness-s149-spotlight-projection CDP_PORT=9305 CAPTURE_WAIT=6500 node scripts/compare-home-brightness-attribution.mjs`

### S1-50 `Ka/GA` Mouse Simulation Probe Result

This batch extended `?debug-output-probe=1` with mouse-simulation sizing and UV state. Normal rendering remains unchanged unless the debug probe flag is present.

Changes:

- Added `mouseSimulation` to `window.__rogierOutputProbe`.
- The probe reports shared screen mouse-sim target size, `uCoords`, old/new/target positions, speed, persistence, thickness, and target stats.
- The probe reports the active work item's local `Ka` target size, `uCoords`, pointer UV state, speed, persistence, thickness, `uUvOffset`, `uUvOffsetScale`, source-equivalent plane/ray sizes, and target stats.

Source/static evidence:

- Source `Ka` defaults to `persistance:.75`, `thickness:.25`, and updates `uPersistance` as `pow(persistance, dt*10)`.
- Source `GA` constructs local `Ka` with `persistance:.85`, `thickness:.1`, `mesh:this.plane`, `rayCastMesh:this.rayPlane`.
- Source `GA.createPlane()` uses plane size `35*1.3 x 23*1.3`, then ray-plane scale `* 1.5`, and sets `uUvOffsetScale = 1.5`.
- Source `GA.resize()` calls `mouseSim.onResize(this.plane.scale.x, this.plane.scale.y)`.

Probe result at `/tmp/rogier-mouse-sim-s150b` on `1440x900` home desktop:

| Field | Value | Interpretation |
| --- | ---: | --- |
| Screen sim target / `uCoords` | `144 x 90` / `[144,90]` | Matches rebuild's source-shaped screen sim resolution scale. |
| Screen persistence / thickness | `0.8660` / `0.25` | Runtime persistence is the expected frame-adjusted `pow(.75, dt*10)` shape; thickness matches source default. |
| Active local target / `uCoords` | `46 x 30` / `[46,30]` | Matches source plane `35*1.3 x 23*1.3 = 45.5 x 29.9`, rounded for target allocation. |
| Active UV target | `[0.5,0.5]` | Active `hashgraph-vc` starts centered at rest. |
| Active local persistence / thickness | `0.9220` / `0.1` | Runtime persistence follows `pow(.85, dt*10)`; thickness matches source `GA` local `Ka`. |
| `uUvOffset` / `uUvOffsetScale` | `[0.25,0.25,0]` / `1.5` | Matches source ray-plane enlargement and shader UV compensation. |
| Source plane / ray-plane size | `45.5 x 29.9` / `68.25 x 44.85` | Rebuild geometry encodes the source ray-plane scale through `GRID_SCALE`; object scale remains `[1,1,1]` by design. |
| Composite mouse darken term | `0.00087` | Static mouse sim is not the home brightness culprit. |
| Runtime errors | `0` | Probe is stable under Chrome/SwiftShader. |

Decision:

- Keep the mouse-simulation probe.
- Treat `Ka/GA` target sizing, `uCoords`, UV offset/scale, and at-rest pointer state as source-attributed.
- Do not tune home brightness via mouse simulation. The measured static contribution to `CA` darken is negligible.
- Leave fluid/mouse feel for later interactive visual QA only if it is visibly off; it should not block the remaining static Phase 1 brightness attribution.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome` CDP probe at `/tmp/rogier-mouse-sim-s150b` against `http://127.0.0.1:5239/?skip-preloader&debug-output-probe=1`

### S1-51 Phase 1 Closeout QA Baseline

This batch did not change runtime behavior. It refreshed the Phase 1 closeout board and ran a full source-vs-rebuild QA pass after the recent attribution probes.

Full capture at `/tmp/rogier-compare-phase1-s151-closeout`:

| Route | Original state | Rebuild state | Result |
| --- | --- | --- | --- |
| Home desktop | Full `1440x900` canvas, active `hashgraph-vc`, `10` work slugs | Full `1440x900` canvas, active `hashgraph-vc`, `10` project cards | Pass |
| Home mobile | Full `390x844` canvas, active `hashgraph-vc`, `10` work slugs | Full `390x844` canvas, active `hashgraph-vc`, `10` project cards | Pass |
| About desktop | Full `1440x900` canvas, post-preloader | Full `1440x900` canvas, `is-about is-ready has-entered has-webgl` | Pass |
| `/gc-2026/` desktop | Full `1440x900` canvas, post-preloader | Full `1440x900` canvas, `is-project is-ready has-entered has-webgl` | Pass |
| `/hashgraph-vc/` desktop | Full `1440x900` canvas, post-preloader | Full `1440x900` canvas, `is-project is-ready has-entered has-webgl` | Pass |

Runtime result:

- No failed network requests after filtering canceled lifecycle requests.
- No runtime exceptions.
- Rebuild dist markers remain stable for home and `/gc-2026/`.

Closeout decision:

- Do not restart broad `VA`, spotlight projection, `A1`, or mouse-simulation rewrites. Those chains now have enough attribution evidence for Phase 1 closeout.
- Phase 1 still needs one final decision pass: either a source-backed `OA/CA` / project-composite transfer fix, or explicit accepted-deviation language for the remaining brightness gaps.
- Phase 2 remains blocked until that final decision is recorded.

Verification passed:

- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5240 ORIGINAL_URL=http://127.0.0.1:5241 OUT_DIR=/tmp/rogier-compare-phase1-s151-closeout CDP_PORT=9308 CAPTURE_WAIT=5200 node scripts/capture.mjs`

### S1-52 Transfer / Project Composite Accepted-Deviation Audit

This batch records the remaining Phase 1 closeout decision. It does not change runtime behavior.

Source-backed facts already established:

- Source renderer output is `srgb`; changing rebuild renderer output to linear is not source-backed and had negligible target impact.
- Source `CA` uses the current darken/lighten blend formulas, black constant `0.095`, `uDarken=.2`, and `toneMapped:false` material ownership.
- Source `A1` / rebuild `homePreCompositeFragment` main flow order is semantically equivalent for home.
- Source `SpotLight.map` assignment, target contents, active-block projection coverage, and thumb target sizing are source-shaped in the rebuild.
- Source-like full `HA/zA`, output-tail, source work-composite pass order, and source offscreen project-media routing have all either failed console-aware QA, moved luma in the wrong direction, or regressed project pages in the current bridge.

Remaining non-promoted diagnostics:

| Diagnostic | Effect | Why it is not production |
| --- | --- | --- |
| `debug-composite-transfer=1` | Raises final home luma meaningfully. | No source evidence for gamma-lifting `CA.tScene`; source renderer/output audit points to `srgb`, not this shader-level transfer. |
| `debug-spotlight-map-transfer=srgb` | Raises work/pre-composite luma partially. | Confirms map transfer contributes, but source and local Three spotlight-map chunk both multiply by sampled `spotColor.rgb`; permanent gamma correction is not source-proven. |
| `debug-spotlight-map=off` | Brightens work/pre-composite strongly. | Source explicitly assigns the thumb composite target as `SpotLight.map`; disabling it removes a source-owned effect. |
| Source work-composite pass ownership | Darkens the current bridge. | Broad pass rewiring is negative despite being source-shaped in isolation. |
| Source offscreen project-media routing | Regressed project-page luma. | Likely correct final architecture, but not safe without solving target/color ownership first. |

Accepted-deviation candidate:

- Keep the stable production path for Phase 1: source-shaped constants, stable Three 0.184 `VA` bridge, source-default ordinary texture color space, current direct project media path, and diagnostic-only transfer switches.
- Accept for Phase 1 that home/project brightness remains lower than source in the current bridge, with the reason documented as unresolved transfer/color interpretation across spotlight-map multiplication and `OA/CA` final composite.
- Do not block Phase 2 on more Phase 1 shader/transfer experiments unless new source evidence appears.

Final closeout requirement:

- One final full QA pass after this accepted-deviation record, including home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.
- If that pass remains stable, Phase 1 can be marked complete with accepted deviations rather than continuing open-ended brightness tuning.

### S1-53 Phase 1 Final Closeout Result

Phase 1 is now marked complete with accepted deviations. This batch did not change runtime rendering behavior; it verified the stable production path after S1-52 and updated the closeout status.

Accepted deviations carried out of Phase 1:

- Stable Three 0.184 `VA` bridge remains in production instead of a byte-for-byte source `HA/zA` shader replacement.
- Home and project brightness remain lower than the mirrored source because the exact transfer/color interpretation across spotlight-map multiplication and `OA/CA` final composite is still unresolved.
- Project detail pages keep the current direct media path; the source-shaped offscreen media routing is deferred because the previous attempt regressed project luma.
- Floor, environment, and about auxiliary visuals remain source-shaped bridges rather than complete byte-for-byte ports.

Final full capture at `/tmp/rogier-compare-phase1-final`:

| Route | Original state | Rebuild state | Result |
| --- | --- | --- | --- |
| Home desktop | Full `1440x900` canvas, active `hashgraph-vc`, `10` work slugs | Full `1440x900` canvas, active `hashgraph-vc`, `10` project cards | Pass |
| Home mobile | Full `390x844` canvas, active `hashgraph-vc`, `10` work slugs | Full `390x844` canvas, active `hashgraph-vc`, `10` project cards | Pass |
| About desktop | Full `1440x900` canvas, post-preloader | Full `1440x900` canvas, `is-about is-ready has-entered has-webgl` | Pass |
| `/gc-2026/` desktop | Full `1440x900` canvas, post-preloader | Full `1440x900` canvas, `is-project is-ready has-entered has-webgl` | Pass |
| `/hashgraph-vc/` desktop | Full `1440x900` canvas, post-preloader | Full `1440x900` canvas, `is-project is-ready has-entered has-webgl` | Pass |

Runtime result:

- No failed network requests after filtering canceled lifecycle requests.
- No runtime exceptions.
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`.
- `/gc-2026/` dist markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`.

Verification passed:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5242 ORIGINAL_URL=http://127.0.0.1:5243 OUT_DIR=/tmp/rogier-compare-phase1-final CDP_PORT=9309 CAPTURE_WAIT=5200 node scripts/capture.mjs`
- `grep -oE 'data-webgl-root|data-project-card|ui-work-container|data-sound-click' dist/index.html | sort | uniq -c`
- `grep -oE 'data-webgl-project|data-media-src|data-mobile-media' dist/gc-2026/index.html | sort | uniq -c`
- `git diff --check`

Closeout decision:

- Do not continue open-ended Phase 1 brightness tuning.
- Do not promote diagnostic transfer switches without new source evidence.
- Phase 2 can begin from the documented carryovers: transfer/color ownership, project offscreen media routing, interactive mouse/fluid feel, and auxiliary about/environment polish.

### S1-22 Generated Shader Diagnostic Result

A controlled generated-shader diagnostic path is now available for ordinary `VA` attribution:

- Added a QA-only `?dump-va-shader=1` hook that records patched work/auxiliary shader strings from `onBeforeCompile` into `window.__rogierVaShaderDump`.
- Added `scripts/dump-va-shader.mjs`, which opens rebuild home through CDP, captures the ordinary work shader dump, extracts source `HA/zA` from `legacy-mirror/public/assets/bundle.250f01b7.js`, writes both shader pairs to disk, and prints a compact summary.
- Normal rendering does not enable the dump path.

The diagnostic run at `/tmp/rogier-va-shader-s122-alphahash` produced these useful findings:

- Current generated work vertex length is `4302` vs source `HA` `4482`; the bridge is close in size but keeps Three 0.184 wrapper chunks around the source-shaped transform block.
- Current generated work fragment length is `6297` vs source `zA` `5088`; most remaining difference is Three 0.184 physical-material interface text rather than the already-stripped standard tails.
- The generated fragment still contained Three 0.184 `alphahash_pars_fragment`, which source `zA` does not include. Ordinary work `VA` now strips that include.
- The generated fragment still differs in macro/interface naming around `USE_SPECULAR`, `USE_SPECULAR_COLORMAP`, `USE_SPECULAR_INTENSITYMAP`, plus newer `dispersion` and `anisotropy` declarations. These are currently diagnostic findings only; do not patch them live until a smaller source-safe compatibility change is identified.
- The source `zA` tail writes through `gl_FragColor.rgb`, while the current stable bridge writes `vec4(sourceColor, alpha)`. A live tail-order experiment was already rejected, so this remains a known delta rather than a kept fix.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-va-shader-s122-alphahash CDP_PORT=9257 node scripts/dump-va-shader.mjs`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s122-shader-dump` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed stable:

| Capture | Original luma | Rebuild luma after shader diagnostic batch | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.019` | Stable; diagnostic tooling and `alphahash_pars_fragment` cleanup are not the brightness fix. |
| Home mobile | `0.056` | `0.016` | Stable. |
| About desktop | `0.026` | `0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: keep the dump tooling and work-only `alphahash_pars_fragment` cleanup. The next S1-22 step should use the dumped shader files to isolate one smaller compatibility patch around either specular macro/interface drift or spotlight-map light contribution, not another full `HA/zA` replacement.

### S1-23 Spotlight Map Attribution Result

A QA-only spotlight-map attribution path is now available:

- Added `?debug-spotlight-map=off`, which disables the home `SpotLight.map` assignment while preserving source-shaped spotlight position, target, angle, penumbra, and intensity.
- Added `scripts/compare-spotlight-map.mjs`, which captures rebuild home with the map on and off and records failures, runtime exceptions, shader console messages, and screenshots.
- About/character spotlight ownership is not changed by this debug switch.
- Normal rendering keeps the source-shaped `thumbCompositeTarget.texture` spotlight map.

The attribution run at `/tmp/rogier-spotlight-map-s123` showed the map is strongly contributing:

| Variant | Rebuild home luma | Interpretation |
| --- | ---: | --- |
| Spotlight map on | `0.019` | Current normal path; still much darker than original home. |
| Spotlight map off | `0.085` | Disabling the map makes the rebuild dramatically brighter and much closer to original luma, but this is not source-correct behavior. |
| Difference image | `0.042` mean-luma delta, `0.381` max channel delta | The map is not missing; it is a dominant darkening/projection input. |

Decision: do not remove the spotlight map or lower source intensity as a tuning fix. This confirms the remaining gap is likely upstream of the map contribution: thumb composite contents, texture/color-space interpretation of `SpotLight.map`, or the bundled-Three light projection math around `zA`/`lights_fragment_begin`. The next implementation work should inspect the thumb composite texture and map sampling/color assumptions, not whether the map is assigned.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `CHROME_PATH=/usr/bin/google-chrome OUT_DIR=/tmp/rogier-spotlight-map-s123 CDP_PORT=9259 CAPTURE_WAIT=4200 node scripts/compare-spotlight-map.mjs`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s123-spotlight-map` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured normal-path luma stayed stable:

| Capture | Original luma | Rebuild luma after S1-23 attribution | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.019` | Stable; debug switch does not change normal rendering. |
| Home mobile | `0.057` | `0.016` | Stable. |
| About desktop | `0.026` | `0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

### S1-22 VA Fragment Tail Experiment Result

A narrow ordinary-`VA` fragment-tail experiment was attempted and rejected before commit:

- The experiment made the current fragment tail closer to source `zA` by letting `opaque_fragment` write `gl_FragColor = vec4(outgoingLight, diffuseColor.a)` first, then applying the mouse-lightness tail through `gl_FragColor.rgb`, and assigning alpha through `gl_FragColor.a`.
- It also removed the rebuild-only `max(uCoords, vec2(1.0))` guard from screen UVs and stripped Three 0.184's `alphahash_pars_fragment`, which source `zA` does not include.
- `git diff --check`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, and dist marker checks passed.
- Browser QA failed: both full capture and home-only capture timed out at `Runtime.evaluate`, and a minimal CDP probe on rebuild home also timed out after navigation and load. This indicates the live fragment-tail experiment can hang the runtime under the local SwiftShader QA path even though the static build passes.

Decision: revert the runtime shader changes and keep only this audit record. This failure does not invalidate S1-22, but it proves that the next S1-22 step should be diagnostic rather than another broad tail rewrite. The next useful batch is to capture/diff the generated ordinary-`VA` fragment shader after `onBeforeCompile`, compare it against source `zA`, and isolate spotlight-map/light-body deltas with a debug-only attribution path before committing live shader changes.

### S1-21 Full HA Vertex Experiment Result

The ordinary home work-block material briefly used a source-compatible full `HA` vertex shader path instead of relying on Three 0.184 standard vertex chunk injection, but that runtime change has been reverted:

- Source `VA.onBeforeCompile` assigns complete `HA` and `zA`; this batch implemented the `HA` half only.
- The attempted work-only vertex path kept source `HA` ownership of perlin displacement, reveal fade, mouse scaling, displacement-wave z offset, instance spread, `vViewPosition`, and source-shaped `worldPosition` for spotlight-map coordinates.
- Compatibility varyings needed by the current fragment bridge (`vLocalUv`, `vOffset`, `vMouseSim`, `vAlpha`) were assigned inside the full vertex path.
- Auxiliary `WA/XA` blocks were not changed.
- Later console-aware browser probing showed the experiment was not stable: the first failure was a shader compile error from the source `vUv` declaration/chunk mismatch under Three 0.184; after patching that, rebuild home still timed out at CDP `Runtime.evaluate`.
- The live code now restores the previous chunk-injection bridge and removes the unused full-`HA` shader string.

Verification before rejection:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s121-full-ha` had no failed network requests or runtime exceptions, but this harness did not collect shader console errors.

Measured luma stayed in the established range:

| Capture | Original luma | Rebuild luma after S1-21 | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.104` | `0.018` | Did not improve brightness. |
| Home mobile | `0.055` | `0.015` | Did not improve brightness. |
| About desktop | `0.026` | `0.015` | Stable; auxiliary path was not changed. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: reject and revert the live full-`HA` path. It is source-proven but not safely portable as a direct full replacement under current Three 0.184. Future work should use generated-shader diffing and smaller compatibility patches instead of another full vertex replacement.

Post-revert verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Console-aware rebuild-home CDP probe returned `ready:"complete"`, `has-webgl`, one full-viewport canvas, active `hashgraph-vc`, and no shader/`WebGLProgram` console errors.
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s122-diagnostics` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Post-revert luma baseline:

| Capture | Original luma | Rebuild luma |
| --- | ---: | ---: |
| Home desktop | `0.106` | `0.019` |
| Home mobile | `0.056` | `0.016` |
| About desktop | `0.026` | `0.015` |
| `/gc-2026/` desktop | `0.140` | `0.039` |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` |

### S1-08A VA Initial Diffuse Color Result

The ordinary home `VA` material now follows the same raw-color semantics already used by source runtime setters:

- Source `GA.createCube()` creates ordinary work blocks with `new VA({ color: new Color("#808080") })`.
- Source `Se` color setters parse hex with `sr()` into raw channel values (`channel / 255`), which already required `sourceRgbColor()` in the rebuild.
- Local Three 0.184 converts `new Color("#808080")` to linear `~0.216`; source raw channel semantics for `#808080` are `~0.502`.
- Rebuild ordinary work-block diffuse color now uses `sourceRgbColor(SOURCE_WORK_DIFFUSE)`.
- Auxiliary `XA/WA` blocks were intentionally left unchanged in this batch because they are a separate source material path and about/floating visuals should not be moved without a focused auxiliary audit.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s108a-raw-diffuse` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma moved slightly in the correct direction on home while project pages stayed stable:

| Capture | Original luma | Rebuild luma after S1-08A | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.104` | `0.019` | Slight improvement from the previous `~0.018`; still not the main brightness fix. |
| Home mobile | `0.055` | `0.020` | Slight improvement from the previous `~0.019`; still low. |
| About desktop | `0.027` | `0.015` | Stable; auxiliary path was not changed. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: keep the ordinary-`VA` raw diffuse change because it is source-proven, moves home luma in the right direction, and does not regress project or about captures. The remaining Phase 1 visual gap still points to deeper `VA` light/shader semantics or render-target/color-output assumptions, not only initial diffuse color.

### S1-08B VA Fragment Pars Cleanup Result

The ordinary home `VA` shader patch now removes more source-commented fragment paths before the standard light body:

- Source `zA` explicitly comments out `color_pars_fragment`, `map_pars_fragment`, `alphamap_pars_fragment`, `alphatest_pars_fragment`, `aomap_pars_fragment`, `lightmap_pars_fragment`, `emissivemap_pars_fragment`, `iridescence_fragment`, `cube_uv_reflection_fragment`, `envmap_common_pars_fragment`, `envmap_physical_pars_fragment`, `fog_pars_fragment`, `bumpmap_pars_fragment`, `normalmap_pars_fragment`, `clearcoat_pars_fragment`, `iridescence_pars_fragment`, `roughnessmap_pars_fragment`, `metalnessmap_pars_fragment`, `logdepthbuf_pars_fragment`, `clipping_planes_pars_fragment`, and `clipping_planes_fragment`.
- Rebuild previously removed several source-absent fragment body paths, but many of those fragment pars still entered Three 0.184's generated ordinary work shader.
- `stripSourceVaFragmentPaths()` now removes those source-commented pars for ordinary work `VA` only.
- Auxiliary `WA/XA` is still left on the auxiliary variant because source `WA` keeps many of the standard material pars and body paths that ordinary `VA` comments out.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s108b-va-pars` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed essentially unchanged:

| Capture | Original luma | Rebuild luma after S1-08B | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.105` | `0.019` | Stable; removing source-commented pars did not explain the main brightness gap. |
| Home mobile | `0.055` | `0.020` | Stable. |
| About desktop | `0.027` | `0.015` | Stable; auxiliary path was not changed. |
| `/gc-2026/` desktop | `0.139` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: keep the ordinary-`VA` fragment-pars cleanup because it removes a source-proven Three 0.184 shader deviation without destabilizing runtime or project pages. Since brightness did not materially move, the next Phase 1 attribution should inspect either the remaining generated `VA` light definitions against source `zA` or shared render-target/output assumptions around `Lu/C1/OA`.

### S1-09 A1 Vignette Formula Cleanup Result

The home pre-composite `A1` vignette helper now matches the source helper shape used for perlin/displacement masks:

- Source shared `vignette(coords, vignin, vignout, vignfade, fstop)` offsets the inner and outer thresholds by `fstop / vignfade` before `smoothstep()`.
- Source `A1` calls `vignette(perlinCoords.xy, 0.1, .35, 2.0, .5)` and `vignette(uv.xy, 0.1, .5, 2.0, .5)`.
- Rebuild previously used a simplified two-argument helper with no `fstop / vignfade` offset.
- Rebuild `homePreCompositeFragment` now uses the source five-argument formula and call constants.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s109-a1-vignette` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma decreased on home while project pages stayed stable:

| Capture | Original luma | Rebuild luma after S1-09 A1 vignette | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.104` | `0.019` | Slightly lower than previous `~0.019`; source-correct but not a brightness fix. |
| Home mobile | `0.055` | `0.016` | Lower than previous `~0.020`; this exposes other missing brightening/source contributions rather than justifying the old approximation. |
| About desktop | `0.026` | `0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: keep the source `A1` vignette formula despite lower home luma because it removes a local approximation in the shared composite path and did not regress runtime or project captures. The old simplified vignette was compensating for another missing source contribution. Continue attribution in remaining `A1/OA/Lu` output flow or ordinary `VA` light definitions; do not reintroduce the simplified vignette as a visual tuning fix.

### S1-09 Lu Luminosity/Bloom Output Result

The final `Lu/kA/OA` bloom path now follows source luminosity and render-pass ownership more closely:

- Source `sg` luminosity material uses Rec.601 luma weights `vec3(0.299, 0.587, 0.114)` and outputs `mix(vec4(0), texel, alpha)`.
- Rebuild luminosity material used Rec.709-ish weights and forced alpha to `1.0`; it now uses the source weights and `mix(vec4(0.0), texel, alpha)`.
- Source `Lu.update()` renders the luminosity pass into `renderTargetBright` before the bloom chain whenever `settings.luminosity.enabled`.
- Rebuild `renderPreCompositeBloomPass()` already did that for the A1 pre-composite bloom, but `renderHomeBloomPass()` passed `bloomBrightTarget` without rendering it in the same frame. `renderHomeBloomPass()` now renders the source-shaped bright pass first.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s109-lum-bloom` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed essentially unchanged:

| Capture | Original luma | Rebuild luma after S1-09 Lu bloom | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.105` | `0.019` | Stable; final bloom pass was source-wrong before, but not the main brightness source. |
| Home mobile | `0.056` | `0.016` | Stable relative to the source `A1` vignette batch. |
| About desktop | `0.027` | `0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: keep the luminosity shader and final bloom bright-pass fix because they close a real source `Lu` output-chain gap without runtime or project regressions. Since luma did not move materially, continue attribution in the remaining ordinary `VA` light definitions, spotlight-map contribution, or deeper project/shared media composite ownership.

### S1-06 T1/w1/E1 Thumb Closeout Result

The remaining thumbnail-strip audit is now closed:

- Source `M1/E1` explicitly constructs the thumb plane material with `toneMapped:false`, `transparent:false`, `depthWrite:false`, and `depthTest:false`; the rebuild thumb plane material now explicitly sets `toneMapped:false`.
- Source `T1.init()` sets the thumb scene background to `new Color("#222222").convertLinearToSRGB()`; the rebuild now uses the same source-shaped conversion.
- Source search found `w1.isTransitioning` initialized and guarded inside `w1.updateGalleryProgress()`, but no external writes to `J.workThumbScene.thumbs.isTransitioning`. The rebuild keeps the local transition guard and resets it on gallery restore/enter, but no new leave/enter writes were added because there is no source evidence for them.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s106` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed in the established range, which is expected for a low-risk thumb scene closeout:

| Capture | Original luma | Rebuild luma after S1-06 | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.105` | `0.011` | Stable; main darkness remains in ordinary `VA`/spotlight/composite. |
| Home mobile | `0.056` | `0.012` | Stable. |
| About desktop | `0.026` | `0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: keep the `T1/w1/E1` closeout and remove `S1-06` from active implementation risk. The next Phase 1 implementation target is `S1-08/S1-17`, focused on ordinary `VA` shader parity and spotlight-map contribution.

### S1-08 VA Fragment Path Cleanup Result

The first ordinary-`VA` shader batch is implemented without attempting the high-risk full `HA/zA` replacement:

- Source `zA` computes `totalDiffuse`, `totalSpecular`, and `outgoingLight`, then enters its custom alpha/reveal tail immediately after `opaque_fragment`.
- Three 0.184 `MeshStandardMaterial` continues through additional standard fragment paths after the equivalent light body: `lights_fragment_maps`, `aomap_fragment`, `transmission_fragment`, clearcoat/sheen outgoing-light tails, plus several map/logdepth/alpha helper fragments that source `zA` comments out or omits.
- Added a `work` vs `auxiliary` variant to the shared block shader patch so the cleanup only applies to ordinary home `VA` work blocks.
- For ordinary work blocks, stripped the source-absent standard fragment paths listed above while keeping the existing chunk-injection bridge, physical light body, source alpha/reveal/mouse-lightness tail, and source output-tail removals.
- Auxiliary `WA/XA` blocks keep the previous shader path because source `WA` retains more standard material includes than `VA`.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-va-fragpaths` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed stable:

| Capture | Original luma | Rebuild luma after VA fragment cleanup | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.104` | `0.011` | Stable; this cleanup did not explain the main brightness gap. |
| Home mobile | `0.055` | `0.012` | Stable. |
| About desktop | `0.026` | `0.015` | Stable; auxiliary shader path was not regressed. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: keep the work-only `VA` fragment cleanup because it removes source-proven Three 0.184 standard-tail behavior without destabilizing project or about pages. Since luma did not move, the next `S1-08/S1-17` batch should focus on the deeper full-`VA` light definitions, renderer legacy-light/color-output assumptions, or spotlight-map coordinate contribution rather than more standard-tail cleanup.

### S1-17 p1 Light/Background Defaults Result

The spotlight-map audit found that the main home `SpotLight.map` path is already source-shaped:

- Source `SD.init()` assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`, sets spotlight position `(0,0,3.7)`, target `(0,0,-8)`, and intensity `220`.
- Source `p1.update()` only applies camera parallax to spotlight `x/y`; it does not retarget the spotlight to the active project item.
- Three 0.184 confirms `SpotLight.map` contributes through `spotLightMap` whenever `light.map` exists; `castShadow` is not required for the map path.
- Rebuild already follows those spotlight-map ownership, position, target, intensity, and parallax rules. `updateAboutSpotlight()` remains scoped to about visual state.

The same audit found three source-proven initial light/background defaults that were still local approximations:

- Source `p1` sets `scene.background` to `new Color(BA.BACKGROUND_COLOR).convertLinearToSRGB()`; rebuild now does the same for `#1a1a1a`.
- Source initial `xt.colors.secondary` is `#464646`; rebuild initial ambient/background/floor/environment uniforms now use this instead of local `#414652`.
- Source initial `xt.ambient` is `1`; rebuild initial ambient intensity and matching background/floor uniforms now use `1` instead of local `0.5`.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s117-light-defaults` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma improved on home while project pages stayed stable:

| Capture | Original luma | Rebuild luma after p1 light defaults | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.104` | `0.018` | Improved from the previous `~0.011`; still not close to source. |
| Home mobile | `0.056` | `0.019` | Improved from the previous `~0.012`; still low. |
| About desktop | `0.026` | `0.015` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |
| `/hashgraph-vc/` desktop | `0.043` | `0.023` | Project stability retained. |

Decision: keep the `p1` light/background default cleanup because it is source-proven and finally moves home luma in the correct direction without project regression. The remaining brightness gap still points to full `VA` light/color semantics, renderer legacy-light/color-output assumptions, or additional source defaults around initial/project activation timing.

## Latest Source Audit Snapshot

This checkpoint narrows Phase 1 from a broad rebuild target into a short source-difference list.

| Area | Source evidence | Rebuild state | Current decision |
| --- | --- | --- | --- |
| `TD` about scroll opacity | `TD.onScroll()` updates spotlight every RAF and sets mobile `uScrollOpacity = Cs(scroll, 0, Pe.h * .25, 1, 0, true)`, while desktop stays `1`. | `updateAuxiliaryBlocks()` updates the about spotlight while visible and applies the same desktop/mobile opacity shape from `window.scrollY`. | Treat as implemented, pending real route/WebGL QA. |
| `TD` about spotlight ownership | Source switches `spotLight.map` to `J.characterScene.renderManager.renderTargetComposite.texture`, disables work spotlight parallax, and positions spotlight relative to `aboutBlocks`. | Rebuild switches to an offscreen character target, disables parallax, and positions/targets spotlight relative to about blocks. | Ownership is source-shaped; remaining gap is the target content itself. |
| `Fg` floating scroll velocity | `Fg.onRaf(e)` calls `floatingBlocks.update(e)` and then adds `.005 * abs(this.page.scroll.velocity)` to `floatingBlocks.translationZ`. | Floating z positions use time, source-shaped `translationZ`, and now accumulate `.005 * abs(scrollVelocity)` while the about floating blocks are visible. | Implemented, pending real route/WebGL QA. |
| `ZA` floating block z/hole behavior | `positionOnUpdate(e)` subtracts `translationZ`, wraps z into a 250-unit band plus `10`, and hides the center hole when `x > -3.5 && x < 3.5 && y < 5`. | Rebuild follows the same z wrapping, `translationZ` subtraction, scroll-velocity feed, and center-hole hide logic. | Implemented, pending real route/WebGL QA. |
| `P1-07` character scene | Source about spotlight map is rendered by the real character scene/render manager and rotatable character mesh. | Rebuild now renders `public/models/me/me.gltf` into the about spotlight target with a dedicated character camera and lights, while keeping the previous `model_T.jpg` composite plane as a fallback. | Implemented as a controlled source-aligned bridge; full source rotatable-character event handling/render-manager parity still needs real visual QA before deciding whether to expand scope. |
| `A1/C1` scene reveal ownership | Source `C1` pre-composite owns `uReveal` and blends `mixed.rgb` toward `uBgColor`; source `OA` final composite does not define `uReveal`. | Rebuild remains aligned with `uReveal` on the pre-composite material. A short-lived local experiment moving reveal into final `OA` was rejected because it conflicts with the source shader. | Keep source `C1/A1` ownership; do not treat final-composite reveal as a fix candidate. |
| `VA` material constants | Source `VA` sets `envMapIntensity = .75`, `roughness = 1`, `transparent = true`, `depthTest = false`, and `depthWrite = false`. | Rebuild work/auxiliary block materials use the same `.75` env-map intensity and source-shaped material flags. | Treat `.75` as the source value; do not brighten blocks by changing env-map intensity without new source evidence. |
| `Se` runtime color setters | Source `sr()` parses hex colors to raw `r/g/b = channel / 255`, and `Se.setBlocksColor`, `setAmbientLight`, `setMainColor`, `setThumbDarknessColor`, and `setMediaBackground` tween those raw channel values. | Rebuild now uses a `sourceRgbColor()` path for those runtime setters instead of `new Color(hex)` under current Three color management, which was converting e.g. `#3d2717` from `0.239/0.153/0.090` to `0.047/0.020/0.009`. | Implemented as a source-semantics fix. It did not resolve the main home brightness gap by itself, so the next source target remains `VA` shader/lighting/composite behavior. |
| Thumb composite material flags | Source `_1` thumb composite material is `toneMapped:false`, `transparent:true`, `depthWrite:false`, and `depthTest:false`. | Rebuild thumb composite now explicitly sets `toneMapped:false`, and its darkness color uses the source RGB color path. | Implemented; spotlight-map brightness remains under review. |

## Next Difference Attribution Audit

This audit table records the next source-proven differences to address after the first valid source-vs-rebuild luma pass. The main observed issue is not isolated to cube color: original home desktop luma is about `0.106` while rebuild is about `0.010`, and the original sky/floor/environment field is visibly brighter before considering individual work-block thumbnails.

| ID | Source area | Source evidence | Rebuild state | Likely impact | Decision |
| --- | --- | --- | --- | --- | --- |
| S1-10 | `V1/H1/z1/B1` sky render target | Source creates `skyScene = new V1`, renders it through `H1` with a `z1` composite material, uses `#666666.convertLinearToSRGB()` as the sky scene background, sizes the target to `height * .75`, and assigns `skyScene.renderManager.renderTargetComposite.texture` to `workScene.env.material.customUniforms.tSky`. | Rebuild now has an offscreen `skyScene`, `skyRawTarget`, `skyCompositeTarget`, source-shaped `#666666.convertLinearToSRGB()` background, `height * .75` sizing, pre-home render ordering, and `environmentMaterial.uniforms.tSky = skyCompositeTarget.texture`. | Low as the main luma cause. S1-39 shows disabling or bypassing the sky composite barely changes home luma. | Treat source bridge as implemented. Keep shader-level `z1/H1` parity as a lower-priority environment visual refinement, not the next brightness target. |
| S1-11 | `h1/u1/l1/c1` environment material | Source environment is `MeshStandardMaterial`-derived with full shader replacement, `envMapIntensity = Qn.ENVMAP_INTENSITY`, and a large standard-lighting fragment body sampling `tSky`. Constants include `ENVMAP_INTENSITY=1`, `SHADER_1_ALPHA=.5`, `SHADER_1_SCALE=5.5`, `SHADER_2_ALPHA=0`, `SHADER_2_SCALE=13`, `SHADER_3_ALPHA=0`, `SHADER_1_MIX_3=1`. | Rebuild uses a simplified `ShaderMaterial` around the same broad constants and samples the sky composite target. | Medium. It may affect horizon texture detail, but S1-39 shows `tSky` source selection is not the large home brightness lever. | Defer full `l1` material port until the remaining spotlight/composite transfer gap is narrowed. |
| S1-12 | `VA` full shader and material tonemapping | Source `VA` extends the standard material class but replaces the complete vertex and fragment shader through `onBeforeCompile`; its fragment comments out `tonemapping_fragment`. Material flags include `dithering=true`, `transparent=true`, `envMapIntensity=.75`, `roughness=1`, `depthTest=false`, and `depthWrite=false`. | Rebuild uses `MeshStandardMaterial` with chunk injection. Work and auxiliary materials now have source flags, and a local source-supported experiment adds `toneMapped:false` plus raw initial emissive colors, but luma did not materially improve by itself. | Medium-high. Still likely affects cube/thumb brightness and spotlight-map interpretation, but the environment target gap is broader and safer to test first. | Keep the source-supported `toneMapped:false`/initial emissive correction if no regression appears, but do not treat it as the main brightness fix. Full `VA` replacement remains a dedicated high-risk batch. |
| S1-13 | `Lu/I1` render-target and color-space assumptions | Source creates default `WebGLRenderTarget` clones throughout `Lu`, then applies many `toneMapped:false` screen materials. Source colors often call `.convertLinearToSRGB()` explicitly and run under the bundled Three color-management defaults. | Rebuild explicitly sets many target textures to non-mipmapped linear/clamped and runs Three 0.184 with `renderer.outputColorSpace = SRGBColorSpace`; runtime project colors are now parsed with source `sr()` semantics. | Medium-high. Color-space/tone-map mismatch could explain why source-shaped colors and lights still produce low luma. | Audit after S1-10 because the sky-target absence is a concrete missing source pass; avoid broad color-space changes until that pass is measured. |
| S1-14 | Source scene update/render ordering | Source manager updates scenes in order `sky`, `media`, `work`, `main`, `workthumb`, `wavves`, `character`; it assigns `skyScene.renderTargetComposite` to env once during init. Earlier audit showed work blocks consume previous-frame thumb/displacement outputs. | Rebuild renders the sky target before the home scene render, and intentionally keeps previous-frame thumb/displacement behavior for source-shaped work-block inputs. | Low-medium. Remaining ordering gaps may still affect animation timing, but not the static home luma issue shown by S1-39. | Keep as implemented unless a route/animation QA pass shows a concrete timing mismatch. |
| S1-15 | `a1/o1/i1` floor material | Source floor is a dedicated material chain and participates in the same environment/reflection feel beneath the cubes. | Rebuild floor is an approximation using a reflection target and local scan/reflection math. | Medium. It may contribute to lower-viewport darkness but is less likely than missing `V1` to explain the full-screen luma gap. | Defer until after sky/environment measurement. Keep as an isolated batch. |
| S1-16 | Shared project composite/background darkness | Source project luma is also higher (`/gc-2026/` about `0.140` original vs `0.039` rebuild), suggesting part of the issue may be shared `A1/C1` or media-background handling, not only home cubes. | Project media markers and WebGL planes remain stable, but background/composite appears darker. | Medium. Project pages are closer and should stay regression checks; changing shared composite can regress them. | Keep project pages in every full QA pass. Do not tune project visuals separately until home `V1/tSky` and render-target assumptions are narrowed. |

### S1-10/S1-11 Implementation Result

The source-shaped sky/environment bridge is now implemented:

- Added a dedicated offscreen `skyScene` with `#666666.convertLinearToSRGB()` background.
- Added a `z1/B1`-shaped sky composite pass and `height * .75` square render targets.
- Set the sky composite texture to repeat wrapping and feed it to `environmentMaterial.uniforms.tSky`.
- Stopped assigning raw `/images/textures/blue-noise.png` directly to the environment `tSky`; blue-noise remains scoped to pre-composite and mouse simulation.
- Moved the environment fragment closer to source `l1` by removing the rebuild-only low-alpha transparent band and outputting the source-style full environment color path.
- S1-39 later added `skyRaw`/`skyComposite` output probes plus `?debug-sky-target=off|raw`, proving the sky bridge is alive but not the main remaining brightness lever.

Verification passed:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-sky-env-full` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma shows this source gap was real but not the main brightness fix:

| Capture | Original luma | Rebuild luma after S1-10/S1-11 | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.011` | Slight improvement from `~0.010`, still far too dark. |
| Home mobile | `0.056` | `0.012` | Essentially unchanged. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project composite remains in the previous range. |

Decision: keep the sky/environment bridge and treat S1-10 as implemented. S1-39 confirms sky target source selection is low-impact, so the next target remains spotlight-map transfer/content and `OA/CA` transfer/color-space attribution rather than further guessing at sky constants.

### S1-12 VA Tail Bridge Result

The `VA` chunk-injection bridge is now closer to the source full shader without taking the high-risk full replacement step:

- Work and auxiliary block materials now share one `patchWorkBlockShader()` path, reducing divergence between ordinary `VA` blocks and about/floating auxiliary blocks.
- The fragment interface now declares and samples `tDisplacement` like source `zA`, keeping the source fragment surface aligned even though the displacement sample remains non-mutating in the current bridge.
- The source `opaque_fragment` replacement is followed by explicit removal of Three 0.184 `tonemapping_fragment`, `colorspace_fragment`, `fog_fragment`, `premultiplied_alpha_fragment`, and `dithering_fragment`, matching the source `VA` tail where `tonemapping_fragment` is commented out and no color-space/fog/premultiply tail follows.
- The source alpha/reveal/mouse-lightness tail remains the owner of final `gl_FragColor.a` and RGB mouse darkening.

Verification passed:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`
- Home/project dist markers stayed stable.
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-va-tail-full` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma again shows this is a source-correct cleanup, not the main brightness fix:

| Capture | Original luma | Rebuild luma after VA tail bridge | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.011` | Essentially unchanged from the sky/environment batch. |
| Home mobile | `0.055` | `0.012` | Essentially unchanged. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project composite remains stable. |

Decision: keep the `VA` tail bridge because it removes a source-proven Three 0.184 output-tail deviation. The next batch should audit `S1-13` render-target/color-space assumptions before attempting the riskier full `VA` shader replacement.

### S1-13 Render-Target Defaults Result

The first focused render-target/color-space audit is now implemented:

- `makeSourceRenderTarget()` now uses the source-shaped `new WebGLRenderTarget(1, 1, { depthBuffer, stencilBuffer:false })` default path instead of restating clone defaults locally.
- Placeholder `DataTexture` objects no longer force `SRGBColorSpace`, matching the source render-target/default-texture assumptions more closely.
- Loaded image textures and cube textures still keep explicit `SRGBColorSpace` for now because those assets are external color images under Three 0.184; broad removal needs stronger source evidence and visual QA.

Verification passed:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-s113` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma confirms this cleanup is not the main brightness fix:

| Capture | Original luma | Rebuild luma after S1-13 | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.011` | Essentially unchanged from the sky/VA-tail batches. |
| Home mobile | `0.056` | `0.012` | Essentially unchanged. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project composite remains stable. |

Decision: keep the render-target default cleanup because it removes a rebuild-only assumption and did not regress project pages. The next high-value path is either a tightly isolated full `VA` shader replacement or a shared `A1/C1/OA` color/composite audit, because luma remains low across both home and project captures.

### S1-16 A1/C1 Shared Composite Cleanup Result

The first focused shared-composite audit found two source-proven differences in the rebuild `A1/C1` bridge:

- Source `A1` declares `uReveal` and `Se.showScene()` tweens it, but the source fragment output remains `FragColor = vec4(mixed.rgb, 1.)`. The rebuild had an extra final `mix(uBgColor, color, uReveal)` that is not present in the source fragment; it has been removed.
- Source `C1` initializes `uBgColor` with `new Color("#1F1F1F").convertLinearToSRGB()`. The rebuild pre-composite default now uses the same `sourceLinearToSrgbColor(SOURCE_COMPOSITE_BG)` path.

Verification passed:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-a1-shared` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma again shows this cleanup is source-correct but not the main brightness fix:

| Capture | Original luma | Rebuild luma after A1/C1 cleanup | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.104` | `0.011` | Essentially unchanged. |
| Home mobile | `0.055` | `0.012` | Essentially unchanged. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project composite remains stable. |

Decision: keep the `A1/C1` cleanup because it removes rebuild-only shader behavior and aligns the pre-composite background default. Since the shared cleanup did not move luma, the next high-risk batch should inspect the source `Lu` render order/output target flow around `mainScene`, `workScene`, and project media, or isolate the full `VA` shader replacement with immediate shader smoke testing.

### S1-16 Lu/$1 Media Flow Audit Result

A focused audit of source `Lu`, `$1`, `Lo/W1`, `I1/C1`, and `Se.setMediaOpacity()` found a real source-vs-rebuild architecture difference:

- Source initializes scene updates in order `sky`, `media`, `work`, `main`, `workthumb`, `wavves`, `character`.
- Source `$1` media scene renders through a `Lo/W1`-style render manager with `renderToScreen:false`.
- Source `Lo/W1` media composite is a pass-through material whose fragment samples `tScene` and outputs `FragColor = vec4(mixed.rgb, 1.)`.
- Source connects `mainScene.renderManager.compositeMaterial.uniforms.tMedia` to `mediaScene.renderManager.renderTargetComposite.texture`.
- Source project media plane material `UD/FD` has no global `uSceneOpacity`; individual plane alpha comes from its rounded mask and per-plane `uReveal`, while global media reveal is owned by `C1.uMediaReveal` through `Se.setMediaOpacity()`.

A local implementation experiment mirrored that flow by adding media raw/composite render targets, routing project media through `C1.tMedia`, and removing the rebuild-only per-plane `uSceneOpacity`. It passed `git diff --check`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, marker checks, and full Chrome capture with no network failures or runtime exceptions. However, it materially regressed project-page brightness:

| Capture | Stable rebuild luma before experiment | Rebuild luma with media offscreen experiment | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `~0.011` | `0.011` | Unchanged. |
| `/gc-2026/` desktop | `~0.039` | `0.0146` | Regression; do not keep. |
| `/hashgraph-vc/` desktop | higher than experiment range | `0.010` | Regression; do not keep. |

The experiment was reverted before commit. The important conclusion is that the source offscreen media path is still likely the correct final architecture, but current rebuild `C1/work/main` ownership is not ready for it. The next attempt should first isolate why project media becomes darker when mixed through `C1`: likely candidates are blank `tWork` ownership on project routes, `C1` background/darken interaction, or render-target color/alpha assumptions. Until that is solved, keep the current direct project media render path as the project-page stability baseline.

### S1-07 XA/WA Auxiliary Block Shader Cleanup Result

The about/floating auxiliary block path is now closer to source `XA/WA` without touching ordinary home `VA` work blocks:

- Added the source `uScrollOpacity` fragment uniform to the shared block shader bridge.
- Added an `uAuxiliaryMaterial` branch so only auxiliary blocks use source `WA` fragment semantics.
- Auxiliary fragment reveal now follows source `WA` with `revealCombined = 1.` instead of using ordinary work-block `uReveal * uRevealProject`.
- Auxiliary mouse alpha contribution now uses source `uMouseFactor * 0.15` instead of ordinary work-block `0.5`.
- Auxiliary final alpha now multiplies by `uScrollOpacity`, matching source `gl_FragColor.a = mixedAlpha * uScrollOpacity`.
- Auxiliary block material now sets `renderOrder = 10`, matching source `XA`.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-aux-wa` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed stable, as expected for an about/floating auxiliary cleanup:

| Capture | Original luma | Rebuild luma after XA/WA cleanup | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.011` | Stable; ordinary `VA` darkness remains. |
| Home mobile | `0.056` | `0.012` | Stable. |
| About desktop | `0.026` | `0.015` | Runtime stable; visual acceptance still needs review. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |

Decision: keep this cleanup because it removes four source-proven auxiliary block differences without regressing home or project pages. It does not address the main dark home work-block issue, so the next high-value batch remains ordinary `VA`/spotlight lighting or a narrowly isolated full-`VA` shader experiment.

### S1-03 k1 Displacement Shader Cleanup Result

The wavves/displacement target used by `VA.tDisplacement` is now closer to source `k1/O1/N1/F1`:

- Confirmed the rebuild already uses the source-shaped square render target size `height / 10`.
- Replaced the local two-argument vignette mask with the source `Ro.vignette(coords, vignin, vignout, vignfade, fstop)` shape.
- Matched source `F1` constants: `vignin = 0.01`, `vignout = 0.5`, `vignfade = 2.0`, `fstop = 0.4`.
- Matched source output ownership by rendering `strength * (1.0 - vignetteF)` directly instead of the rebuild-only `clamp(strength * mask, 0.0, 1.0)` path.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-k1-displacement` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed stable:

| Capture | Original luma | Rebuild luma after k1 cleanup | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.105` | `0.011` | Stable; ordinary `VA`/lighting darkness remains. |
| Home mobile | `0.056` | `0.012` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |

Decision: keep this cleanup because it removes a source-proven displacement shader approximation without destabilizing project media pages. The main Phase 1 visual gap still points to ordinary `VA`/spotlight lighting or a narrowly isolated full-`VA` shader experiment.

### S1-04 a1/o1/i1 Floor Normal Cleanup Result

The floor path is now closer to source `a1/o1/i1` without replacing the whole reflector implementation:

- Confirmed source `a1` loads `Xt.floorNormal`, sets `repeat = (45, 45)`, and passes it to `o1` as `normalMap`.
- Confirmed source floor material constants are `uMirror = 1`, `reflectivity = .97`, `uFloorMixStrength = 15`, and `uNormalDistortionStrength = 2.5`; the rebuild already used those values.
- Added `/images/textures/floor-normal.webp` to the rebuild floor pipeline and set it to `RepeatWrapping`.
- Treated the normal map as non-color data with `NoColorSpace`.
- Replaced the rebuild-only procedural noise normal perturbation with the source `o1` normal-map vector shape: `normalColor.r/b/g`, `uNormalDistortionStrength`, and `normal.xz * 0.05`.
- Removed the rebuild-only ambient-color scanline mix from the floor fragment so floor color ownership is closer to source `o1`.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-floor-normal` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed stable:

| Capture | Original luma | Rebuild luma after floor-normal cleanup | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.011` | Stable; main darkness remains in ordinary `VA`/lighting/composite. |
| Home mobile | `0.056` | `0.012` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |

Decision: keep this cleanup because it removes source-proven floor material approximations and brings the reflector distortion closer to source without destabilizing project pages. Full `i1` projection-matrix reflector parity remains a possible later isolated batch, but the main Phase 1 visual gap still points to ordinary `VA`/spotlight lighting or render-target/color-space output.

### S1-05 h1/u1/l1 Environment Blend Cleanup Result

The environment shader is now closer to source `h1/u1/l1/c1` blend semantics:

- Confirmed source `u1` owns `uMultiplier = 2`, `uShader1Alpha = .5`, `uShader1Speed = .5`, `uShader1Scale = 5.5`, `uShader1Mix3 = 1.5`, and samples `tSky` from the offscreen sky composite target.
- Replaced the rebuild environment's first noise blend from Reflect to source `blend(4)` ColorDodge.
- Matched source opacity for the first environment noise blend at `0.5`; the rebuild had effectively reduced it through `0.5 * uShader1Alpha`.
- Replaced the second noise blend from Screen to source `blend(16)` Negation.
- Matched source ownership of the second noise blend opacity as `skyMask`; `uShader1Mix3` remains used only in the later `skyMask2 * 1.5` mix.
- Replaced final darken-color blend from Reflect to source `blend(4)` ColorDodge.

Verification passed:

- `git diff --check`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project `/gc-2026/` markers: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Full source-vs-rebuild capture at `/tmp/rogier-compare-phase1-env-blends` had no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Measured luma stayed stable:

| Capture | Original luma | Rebuild luma after environment blend cleanup | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.105` | `0.011` | Stable; main darkness remains in ordinary `VA`/spotlight/composite. |
| Home mobile | `0.056` | `0.012` | Stable. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project stability retained. |

Decision: keep this cleanup because it removes source-proven environment blend deviations without destabilizing project pages. Since it did not materially improve home luma, the remaining Phase 1 visual gap still points to ordinary `VA`/spotlight lighting or render-target/color-space output.

## Completed Source-Aligned Areas

| Area | Current state | Confidence |
| --- | --- | --- |
| `p1` scene hierarchy | Source-shaped `homeScene`, `sceneWrap`, `blocksWrap`, floor, environment, about blocks, floating blocks. | High |
| `GA` grid structure | Source dimensions `35x23xLOW_RES?4:7`, cube size, spacing, scale, circular carousel placement. | High |
| `VA` material type | Rebuild now uses `MeshStandardMaterial + onBeforeCompile` instead of a full local shader. | Medium-high |
| Spotlight map ownership | Home uses thumb composite target; about switches to character target; parallax ownership is source-shaped. | Medium-high |
| Thumb scene | Source camera shape, square render target sizing, scale `(2,2,2)`, wrapping and visibility bounds. | Medium-high |
| Render manager shape | A1 pre-composite and OA final composite are separated; bloom uses five source kernels. | Medium |
| `Ka` simulation | Ping-pong render targets, source uniforms, source timing, shared screen-space simulation, and per-work-item local `GA` simulation targets. | Medium-high |
| About/floating blocks | Source-shaped block grids and route activation are present. | Medium |
| Project detail media stability | Smoke checks continue to pass; should not be changed during Phase 1 unless required. | High |

## Remaining Difference Audit

### Must Fix

No source-proven Phase 1 implementation gaps are currently classified as Must Fix. Phase 1 still needs source-vs-rebuild visual QA before it can be declared complete.

### Latest Browser QA

Chrome headless with SwiftShader enabled was used as the available local WebGL QA environment:

- Home `/?skip-preloader`: WebGL initialized, `.gl-canvas` covered `1440x900`, screenshot pixels were nonblank, 10 project cards remained present, and no failed network requests were reported.
- About `/about/?skip-preloader`: WebGL initialized, `.gl-canvas` covered `1440x900`, screenshot pixels were nonblank, `me.gltf` loaded, and no runtime errors were reported.
- Project `/gc-2026/?skip-preloader`: WebGL initialized, `.gl-canvas` covered `1440x900`, screenshot pixels were nonblank, desktop/mobile media markers remained `5/5`, and no failed network requests were reported.
- Project `/hashgraph-vc/?skip-preloader`: WebGL initialized, `.gl-canvas` covered `1440x900`, screenshot pixels were nonblank, desktop/mobile media markers remained `5/5`, and no failed network requests were reported.

This proves the local runtime smoke gate, not exact source visual parity. Remaining Phase 1 evidence should come from comparing the rendered home/about/project visuals against the mirrored source behavior.

### Source Comparison QA Harness

A local source-vs-rebuild screenshot pass is now possible with a controlled QA-only content fallback:

- original: `legacy-mirror/public` served on port `5175`
- rebuild: `dist` served on port `5173`
- fallback assets: `public/`
- content fallback: `ENABLE_CONTENT_JSON_FALLBACK=1` on `scripts/serve.mjs`

The fallback synthesizes Astro-style collection JSON for the original bundle's missing baked content requests, including `/src/content/projects/*.json`, `/src/content/awards/*.json`, `/opt/build/repo/src/content/projects/*.json`, and `/opt/build/repo/src/content/awards/*.json`. It reads from the rebuild's existing `src/data/projects.json` and `src/data/awards.json`, and it is disabled unless the environment variable is explicitly set.

After enabling the fallback and using Chrome SwiftShader, the mirrored original can naturally reach the post-preloader state on home and `/gc-2026/` by waiting for the source preloader CTA and clicking it. The diagnostic run reported:

- original home: preloader removed, full-viewport canvas present, no failed network requests, no runtime exceptions.
- original `/gc-2026/`: preloader removed, full-viewport canvas present, no runtime exceptions, only canceled media requests from video/image lifecycle cleanup.

This unblocks real source-vs-rebuild visual auditing. It does not complete Phase 1 by itself, because the first valid contact sheet still shows review-worthy differences:

- Home desktop: rebuild has a stronger centered WebGL vignette/scene glow and visible CTA while original is flatter/darker at the same capture time.
- Home mobile: rebuild shows a stronger central WebGL field than original.
- Project desktop: original and rebuild can now both be captured post-preloader, but media/composite timing still needs a longer page-specific pass before declaring parity.

Decision: continue with source visual QA before more WebGL tuning. Changes should target only differences that can be tied back to source code paths in `p1`, `GA/VA`, `T1/w1/E1`, `A1/OA/kA/Lu`, `Ka`, or `Se`.

A longer full comparison pass was then run with `CAPTURE_WAIT=4200` over home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`. Both original and rebuild reached post-preloader full-canvas states with no runtime exceptions. The contact sheet at `/tmp/rogier-compare-phase1-full/contact.png` showed the clearest remaining Phase 1 issues:

| Route/view | Observed difference | Current classification | Next source path |
| --- | --- | --- | --- |
| Home desktop/mobile | Original WebGL cubes/thumb media read substantially brighter and more present; rebuild blocks remain very dark. An 8s home-only wait did not remove the difference, so this is not only entry timing. | WebGL/render-manager difference, not a timing-only issue. | Audit `VA` fragment tail, real `SpotLight.map` contribution, `p1` lighting/environment, and source-vs-rebuild color-space assumptions. |
| Project pages | Media planes are present, but original background/composite reads brighter and more integrated; rebuild composite/background remains darker. | Shared composite/media-background difference. | Audit `A1/C1` pre-composite media/background path and `Se.setMediaBackground`/`setMediaOpacity` order. |
| About page | Runtime loads and character spotlight target exists, but source character spotlight projection/interaction has not been visually accepted. | Accepted temporary bridge until visual review proves otherwise. | Compare source `characterScene.renderManager` and `rotatableMesh` behavior only if about visual mismatch is material. |

Rejected non-source fixes from this audit:

- Do not change `SOURCE_WORK_ENVMAP_INTENSITY` from `.75` to `1`; source `VA` uses `.75`.
- Do not move `uReveal` from `C1/A1` pre-composite to final `OA`; source `OA` has only `uDarken/uSaturation` among those visual-state uniforms.

The capture harness now supports `CAPTURE_WAIT` and `CAPTURE_SET=home|full`. A follow-up home-only audit run at `/tmp/rogier-compare-phase1-audit-home` passed with both original and rebuild reaching post-preloader full-canvas desktop/mobile states and reporting no failed network requests or runtime exceptions.

After the runtime color setter and thumb-composite flag fixes, a full source-vs-rebuild pass at `/tmp/rogier-compare-phase1-source-rgb-full` again passed with no failed network requests or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`. Marker counts stayed stable. Objective screenshot luma still shows the major visual gap:

| Capture | Original luma | Rebuild luma | Decision |
| --- | ---: | ---: | --- |
| Home desktop | `0.106` | `0.010` | Runtime color setter fix is not the main brightness fix. |
| Home mobile | `0.056` | `0.012` | Same issue as desktop. |
| `/gc-2026/` desktop | `0.140` | `0.039` | Project composite/background remains darker; keep project pages as regression checks. |

This narrows the next batch toward source `VA` full shader/lighting differences and/or render-target color-space/tone-mapping behavior rather than color payload parsing.

### Implemented, Needs Real WebGL QA

| ID | Source area | Implemented state | Remaining evidence needed |
| --- | --- | --- | --- |
| P1-01 | `p1.update` / `GA.update` | Each `WorkItem` now owns local mouse simulation material, scene, ping-pong targets, UV target state, speed state, and visible-item update. | Real WebGL browser QA should confirm mouse interaction/performance, because the current headless Chrome environment failed WebGL probe creation. |
| P1-02 | `GA.createPlane` / `Ka` | Per-block ray-plane hits now update the matching work item's local `Ka` target, while shared screen-space `tMouseSim2` remains render-manager owned. | Same real WebGL QA as P1-01. |
| P1-03 | `VA` shader injection | Source `VA` fully replaces MeshStandardMaterial shaders. Rebuild intentionally keeps chunk injection to preserve the current Three lighting, color-space, fog, env-map, spotlight-map, and WebGL2 compatibility path while injecting source displacement, world-position correction, alpha, reveal, mouse-lightness, and mouse-simulation behavior. The remaining proven material flag gap (`dithering=true`) is now aligned on work and auxiliary block materials. | Full shader replacement remains a documented high-risk deviation and should only be attempted if real WebGL QA shows a specific visual/runtime mismatch that chunk injection cannot resolve. |
| P1-04 | `A1` / `OA` blend functions | A1 perlin/background blend and OA darken/lighten now call a source-shaped `sourceBlend(mode, ...)` dispatcher for modes `1`, `11`, and `15` instead of direct local helper calls. | Output should be equivalent, but real WebGL QA should confirm no shader/runtime differences and future work may still port the full source blend-mode table if needed. |
| P1-05 | `OA` final composite | Source audit confirmed final `OA` owns `uDarken/uSaturation`, so those final-pass visual states remain in place. `OA` final composite now carries source-shaped `toneMapped:false`, `transparent:true`, and `NormalBlending`; the A1/C1 pre-composite, luminosity, bloom composite, and FXAA screen materials now explicitly use source-shaped tone/blending flags where proven. | Browser QA should confirm no shader/runtime/color-management regressions; deeper shader math audit is still only needed if visual evidence shows remaining OA mismatch. |
| P1-06 | `Se` setter ownership | `showScene()` now follows source state tween behavior without a forced local reset; `setDarken`, `setSaturation`, `setContrast`, `setMediaBackground`, and `setDirectionalLight2Intensity` now tween local source-shaped state before writing uniforms/lights; composite uniform defaults are initialized from those state fields. Project entry is closer to source `OD`: visual init sets media opacity to `0` and media reveal is deferred to the page-enter boundary instead of running during WebGL visual-state setup. Home `SD.animateIn`-style scene reveal/gallery entry and about `TD/Fg.animateIn`-style auxiliary reveals are also deferred to the page-enter boundary instead of running during WebGL boot. About leave separates `TD/Fg.animateOut`-style reveal animation from `TD.destroy`-style immediate cleanup. Home route links outside the work gallery now route through the same work-gallery-out path as source `BD/zD` transitions. | Browser QA should confirm no cross-route visual regressions and no duplicate navigation/leave events. |
| P1-07 | Character scene | About spotlight map now comes from a rendered GLTF character target instead of only a flat `model_T.jpg` texture composite. The target uses the existing `public/models/me/me.gltf`, dedicated camera/lights, automatic framing, and fallback plane if GLTF loading fails. | Real visual QA should compare about spotlight projection and decide whether the remaining source `characterScene.renderManager` and `rotatableMesh` event behavior must be ported or can remain an accepted Phase 1 deviation. |
| S1-07 | `TD/Fg` scroll lifecycle | About `TD` opacity/spotlight lifecycle is source-shaped. Floating `ZA` z update now receives the source `Fg` scroll-velocity feed by accumulating `.005 * abs(scrollVelocity)` into `translationZ` only while the about floating blocks are visible, with entry/destroy resets to avoid cross-route carryover. | Real WebGL browser QA should confirm about scroll, resize, and route leave behavior because the local Chrome/SwiftShader WebGL probe is not reliable on this machine. |

### Should Fix If Source-Proven

| ID | Source area | Difference | Impact | Risk | Suggested batch |
| --- | --- | --- | --- | --- | --- |
| S1-01 | `Lu` / `I1` render target options | Source render targets are default Three `WebGLRenderTarget` clones. Rebuild manually sets non-mipmapped linear/clamped on many targets. | Usually stable, but some filtering/wrap assumptions may differ. | Medium | Include only where source explicitly requires |
| S1-02 | `I1` lensflare/media/portal | Rebuild exposes no-op uniforms, but lensflare/portal paths are not fully implemented. | Home likely unaffected unless source enables these settings on target views. | Low-medium | Defer unless source settings show enabled |
| S1-03 | `k1` displacement scene | Rebuild has a source-shaped wavves/displacement target, but not a verified full source shader copy. | Work cube z motion and unrevealed wave depth may still differ. | Medium | 5-8 shader audit batch |
| S1-04 | `a1/o1/i1` floor | Floor reflection is approximated around source constants but not a full source material port. | Lower-viewport reflection may be visually different. | Medium | Nice isolated batch |
| S1-05 | `h1/u1/l1/c1` environment | Environment shader is source-shaped but simplified. | Background horizon/sky texture movement may be off. | Medium | Nice isolated batch |
| S1-06 | `T1/w1/E1` transition state | Strip wrapping and sizing are source-shaped; transition ownership may still differ during gallery leave/enter. | Thumb projection may flicker or lag differently around transitions. | Medium | Pair with gallery transition QA |
| S1-08 | `VA` full shader vs chunk injection | Source `VA` replaces both full vertex and fragment shaders. Rebuild keeps Three 0.184 chunk injection, preserving newer env/spotlight/color-space code that the source shader comments out or bypasses. | Likely contributor to the remaining dark cubes/thumb projection gap. | High | Dedicated shader batch, 3-5 changes with browser QA |
| S1-09 | Render-target/color-space output | Source uses bundled Three color management and many explicit `toneMapped:false` screen materials. Rebuild uses Three 0.184 and `renderer.outputColorSpace = SRGBColorSpace`; runtime colors are now source-shaped, but render-target interpretation may still differ. | Could explain low luma after otherwise source-shaped colors and lights. | Medium-high | Audit before any visual tuning |

### Risky Or Needs Visual QA

| ID | Source area | Issue | Why risky |
| --- | --- | --- | --- |
| R1-01 | Full `VA` shader replacement | Replacing chunk injection with source full shader could improve parity but may break current Three 0.184 color-space/light/fog assumptions. |
| R1-02 | Per-block `Ka` simulation | More source-accurate but increases render targets and per-frame passes for 10 work items; must watch performance and memory. |
| R1-03 | Full character scene | Requires confirming original assets/GLTF path and render manager; could expand scope beyond home spotlight parity. |
| R1-04 | Full fluid sim | Source work scene has fluid disabled in `kA`; main/project managers may use fluid differently. Enabling more fluid without source proof can create non-source behavior. |
| R1-05 | Visual tuning after source fixes | Screenshot tuning before source checklist completion can hide real source differences. Visual QA should verify, not drive, the implementation. |

## Recommended Execution Strategy

Do not do Phase 1 in one large unverified pass. The remaining work is highly coupled and shader/render-target failures can pass build while breaking runtime or visual parity.

Recommended cadence:

- Low-risk ownership/constants/state changes: 8-10 source-proven differences per batch.
- Medium-risk shader changes: 5-8 differences per batch.
- High-risk render order, render target, or material replacement changes: 3-5 differences per batch.
- Per-block `Ka` simulation or full `VA` replacement: isolate into a dedicated batch with browser smoke and visual inspection.

Current recommendation: do not attempt the rest of Phase 1 in one unverified pass. The next batch should be a focused 5-8 point audit/implementation pass around one rendering chain, preferably `VA`/spotlight lighting first because that maps directly to the dark home cubes/thumb projection difference. If the changes stay in constants/ownership/documentation, 8-10 points is acceptable; if shader code changes, keep it closer to 5.

## Next Batches

### Current GA/VA Texture And Spread Alignment

Source evidence from `bundle.250f01b7.js`:

- `HA` uses `float spread = 3.;` in the work-block vertex displacement tail.
- `VA.customUniforms.tPerlin` initializes from `Xt.perlin1`.
- `Xt.preloadTextures()` loads `perlin1` from `/images/textures/perlin-1.${webpOrJpg}` with `wrapS/wrapT = vo` (`ClampToEdgeWrapping` in the bundled Three constants), while `perlin2` uses `ci` (`RepeatWrapping`).

Rebuild status:

- Ordinary and auxiliary work-block materials now use a separate `workPerlinTexture` loaded from `/images/textures/perlin-1.webp` with `ClampToEdgeWrapping`.
- The A1/C1 pre-composite material keeps `perlinTexture` loaded from `/images/textures/perlin-2.webp` with `RepeatWrapping`.
- Work-block spread is restored from the rebuild-only `5.0` to source `3.0`.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Full capture at `/tmp/rogier-phase1-ga-va-perlin` passed with no network failures or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Decision: keep this as a source-correct `GA/VA/Xt` fix. It should make gallery collapse/spread and perlin displacement closer to source without changing project media or shared composite behavior. Visual review still needs to decide whether the visible home transition/cube-depth mismatch is materially improved or whether the next batch must move deeper into full `HA/zA` shader parity.

### Batch A: `Ka/GA` Local Simulation Ownership

Status: implemented in code, pending real WebGL visual/performance QA.

Goal: decide whether to implement source per-`GA` local mouse simulation.

Tasks:

1. Prototype per-work-item local simulation targets behind the existing `WorkItem` structure.
2. Feed each visible item its own `tMouseSim` texture.
3. Keep screen-space `tMouseSim2` shared from render manager.
4. Preserve current per-block ray-plane UV projection.
5. Add a fallback path or guard if target allocation is too expensive.

This was the highest source-parity gain left for `GA/Ka`, but it remains one of the highest runtime-risk changes until tested in a browser with a working WebGL context.

### Batch B: `A1/OA` Shader Blend Audit

Status: partially implemented. The currently used source modes are routed through a source-shaped dispatcher; final OA visual-state ownership and material flags are source-shaped; full unused blend-mode table is not ported.

Goal: reduce remaining composite shader approximations.

Tasks:

1. Port or exactly map source `blend(1, ...)` and `blend(11, ...)` used by A1.
2. Compare source A1 final color order against rebuild order after recent split bloom changes.
3. Audit whether final OA should keep darken/saturation or move that responsibility elsewhere.
4. Keep bloom chain separation intact. This remains intact after the OA/C1/Lu material flag pass.
5. Browser smoke after every shader pass change if compilation risk appears.

### Batch C: `Se` Route/Setter Ownership

Status: implemented in code, pending browser/WebGL route QA. Core setter ownership, project/home/about entry timing, about leave/destroy cleanup, and home route leave dispatch are source-shaped.

Goal: make visual state setters source-owned instead of rebuild-compensated.

Tasks:

1. Audit `Se.setProject()` against rebuild `setProject()`.
2. Audit `Se.showScene()` / `hideWorkScene()`. `showScene()` source-state tween ownership and page-enter timing are implemented; `hideWorkScene()` and route-link dispatch now follow the source `yD.onWorkGalleryOut()` / transition path shape.
3. Audit about route entry/leave setter order. `TD/Fg`-style entry reveal is now separated from setup and deferred to page-enter; animated leave and immediate destroy cleanup are now split.
4. Audit project route entry/leave setter order without regressing media pages. Initial `OD.init`-style media opacity reset and deferred `OD.animateIn`-style media reveal are implemented; project leave still follows the source `setMediaOpacity(0,.5)` / `setFluidStrength(.5)` shape.
5. Remove or document any remaining rebuild-only side effects. Core `darken/saturation/contrast/media background/directionalLight2` setter state ownership is implemented.

### Batch D: Auxiliary Visuals

Goal: improve source parity for about/floating visual scene without destabilizing home.

Tasks:

1. Implement source `Fg` scroll velocity feed for floating blocks, scoped to the about route.
2. Keep `$A`/`ZA` material and z-position behavior as implemented unless browser QA shows a mismatch.
3. Browser QA about entry, scroll, resize, and leave when a real WebGL context is available.
4. Decide whether full character scene work is required for Phase 1 or can remain a documented acceptance gap.

## Phase 1 Completion Criteria

Phase 1 should be considered complete only when:

- `p1`, `GA`, `VA`, `T1/w1/E1`, `A1/C1`, `OA/kA/Lu`, `Ka`, and `Se` each have either source-aligned implementation or documented accepted deviation.
- Build and `git diff --check` pass.
- Dist markers remain stable.
- Browser smoke passes home, about, and at least two project pages. Current local Chrome/SwiftShader smoke passes this gate.
- Project media pages retain desktop WebGL tracks and mobile media fallback.
- A final source-vs-rebuild visual QA pass confirms no obvious regressions in home WebGL, thumb projection, mouse interaction, about visual, and project media pages. Current forced-entry source screenshots are not sufficient evidence for this gate.

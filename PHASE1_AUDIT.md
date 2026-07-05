# Phase 1 Audit: Home WebGL Source Parity

Last updated: 2026-07-05

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
- Shader/render-manager parity: 65-75%
- Final home visual parity: 55-65%
- Runtime stability: currently good based on build, marker checks, and Chrome CDP smoke across home, about, and two project pages

The rebuild now has the correct broad shape: `sceneWrap -> blocksWrap -> GA`, source-sized grids, MeshStandardMaterial with source-style shader patching, real `SpotLight.map`, thumb render target, A1/OA split composite passes, bloom mip chains, Ka-style ping-pong mouse simulation, per-work-item local mouse simulation, source-shaped floor/environment bridges, source WebP-selected texture/cubemap extension ownership, and about/floating auxiliary blocks. That is implementation progress, not completion.

Current visible blockers for Phase 1:

- Home background/floor/environment still has a hard horizontal horizon instead of the source's softer fog/floor blend.
- Home work cubes and thumb projection still do not match the source's brightness, depth, and projection feel. The thumb/spotlight chain now has a nonzero-progress guardrail for source `yD -> w1` wrapping and map binding, but that is not a final transfer/feel closeout.
- Ordinary `VA-work` now uses direct source-shaped `HA/zA` templates and the generated residual report shows vertex/fragment deltas `0`. The documented `uUvOffset` technical bridge remains in the raw vertex text: source text declares `vec3`, while mirrored runtime evidence constructs `uUvOffset` from `Vector2` and `GA` writes only `.x/.y`. The old source `SPECULAR` macro is restored in `zA`; runtime probes guard that ordinary work is `MeshStandardMaterial`, not `MeshPhysicalMaterial`, so the `PHYSICAL` branch is inactive. Auxiliary block shaders remain on the safer r164 bridge because they are not ordinary source `VA-work`.
- `A1/OA/kA/Lu/I1` are source-shaped in pieces and now have source-shaped `A1/OA/lA` composite shader fragments, source-shaped `u1/z1` sky/environment shader fragments, source-shaped `nD/Iu/Lu/I1/Lo` update sequencing, `Lo/Lu/I1` render-target clone ownership, source-shaped `I1` optional blur target chaining, `a1/i1` floor-reflection uniform ownership, and pass-material ownership, but transfer interpretation and composite behavior across the whole chain are still not byte-for-byte source-isomorphic.
- Mouse/fluid simulation now has a source-shaped interactive guardrail for window mousemove -> `Ka` screen/local simulation and `ag/qT` fluid pointer/center response, but final Home visual/feel parity is still open.
- Project pages are regression gates; they are stable but not proof that Home WebGL Phase 1 is complete.

Phase 2 should remain paused until these Phase 1 blockers are source-fixed or explicitly documented as unavoidable technical bridges. User visual review can identify differences, but it does not convert a known source mismatch into an accepted Phase 1 closeout item.

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

- Do not attempt the rest of Phase 1 in one pass. The remaining work is coupled enough that a large shader/render-manager pass can pass build while making source attribution worse.
- Do 6-10 differences per batch only when they are low-risk constants, ownership, documentation, or route-state corrections in one chain.
- Do 3-5 differences per batch for shader, render-target, render-order, or material-replacement changes.
- Run full QA and commit once per batch, not once per tiny sub-step.
- Per the 2026-06-06 cadence update, expand each implementation step from one tiny diff to a coherent batch of up to ten source-proven differences. Stop below ten when the chain is shader/render-target risky or when an early probe shows regression.
- Phase 1 must close through source-backed implementation and source evidence. Visual QA is a regression and attribution tool only; do not promote changes because they are visually beneficial without source support, and do not close Phase 1 by accepting visual deviations.
- Prioritize source-structure, source-value, and source-behavior parity over any visual-payoff scoring. Visual improvement is not an implementation goal by itself; production changes need mirrored-bundle evidence even when they look better. Low perceived visual payoff is not a reason to stop while a source mismatch remains open.
- The latest accepted priority criteria are: clear mirrored-source mismatch, 1:1 blocker severity, and controllable implementation risk. Expected visual payoff is rejected as a priority criterion for Phase 1 planning.

Current next batch: continue Phase 1 Home WebGL. Prioritize source-backed work by clear mirrored-source mismatch, 1:1 blocker severity, and controllable implementation risk. Current candidate chains remain spotlight/thumb projection content and transfer evidence, remaining `kA/Lu/I1` material/transfer/composite evidence after the now source-shaped shader surfaces, `$1/j1/W1` project-media render-manager transfer/target evidence only where source residuals remain, and floor/environment distribution evidence beyond the source-shaped `u1/z1/o1/t1/N1` shader text surfaces, while keeping the interactive mouse/fluid probe and project pages as regression gates. Do not rank next work by visual gain; use visual QA only to locate source mismatches and regressions. Phase 2 should not start yet.

Batch cadence update: each commit can contain up to ten related source-proven differences when they belong to one rendering chain. Shader/render-target work should still stop early if QA shows a regression, but isolated one-line fixes should be grouped with nearby source-alignment work before the build/capture/document/commit cycle. Per the latest user instruction, use "up to ten" as the default upper bound for a coherent batch, not one diff per commit.

## Phase 1 Remaining Execution Audit

This table is the current working board for completing Phase 1. It supersedes the older scattered "next batch" notes below without deleting their evidence history.

| Priority | ID | Chain | Source evidence summary | Rebuild status | Risk | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| 179 | S1-252 | `Se` settings scalar/media state tween ownership | Source `Se.init()` initializes scalar/media state on `this.settings`: `darken`, `saturation`, `contrast`, `sceneReveal`, `envRotation`, `revealSpread`, `fluidStrength`, and `media.opacity`. Source `setDarken`, `setSaturation`, `setContrast`, `showScene`, `setEnvRotation`, `setRevealSpread`, `setFluidStrength`, and `setMediaOpacity` tween `this.settings` or `this.settings.media`, then write work/main uniforms, work-item `uRevealSpread`, or `sceneWrap.rotation.x` from state in `onUpdate`. | The rebuild now keeps a source-shaped `settingsState`, tweens that object or `settingsState.media` in the matching setters, and writes uniforms/rotation/work-item fan-out from state update callbacks. Output probes expose/assert `settingsStateOwnership.mode=source-Se-settings-scalar-media-state-onUpdate`, state/uniform parity, `uRevealSpread` fan-out parity, and env rotation parity. Renderer audit extracts the eight rebuild setters, checks source `Se.settings` anchors, and rejects old scalar fields / `gsap.to(this, ...)` paths for this chain. `git diff --check`, syntax checks, build, renderer audit, desktop/mobile output probes, thumb spotlight probe, and project-media probe passed; project media retained `5/5` visible tracks. | Low-medium | Keep these `Se` scalar/media setters state-owned through `settingsState` / source `settings` semantics. Continue Phase 1 from actual spotlight/thumb projection transfer feel, broader `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution parity; this closes another state tween ownership slice only. |
| 178 | S1-251 | `Se` light intensity state tween ownership | Source `Se.init()` initializes `settings.directionalLight={intensity:0}`, `settings.directionalLight2={intensity:0}`, and `settings.spotLight={intensity:0}`. Source `Se.setDirectionalLightIntensity`, `setDirectionalLight2Intensity`, and `setSpotLightIntensity` tween those nested `settings` objects and write `J.workScene.directionalLight.intensity`, `directionalLight2.intensity`, and `spotLight.intensity` from state in `onUpdate`. The source does not keep separate scalar fields such as `spotLightIntensity`, `directionalLightIntensity`, or `directionalLight2Intensity`. | The rebuild now keeps a source-shaped `lightState` object, tweens `lightState.directionalLight`, `lightState.directionalLight2`, and `lightState.spotLight`, and writes the Three light intensities from those state update callbacks. Output and thumb probes expose/assert `stateOwnership=source-Se-settings-light-state-onUpdate-intensities`, state intensity values, and state/light parity. Renderer audit extracts the three rebuild light setters, checks the source `Se.settings` ownership anchors, and rejects the old scalar mirror fields / `gsap.to(this, ...)` paths. `git diff --check`, syntax checks, build, renderer audit, desktop/mobile output probes, thumb spotlight probe, and project-media probe passed; project media retained `5/5` visible tracks. | Low-medium | Keep `Se` light intensity setters state-owned through `lightState` / source `settings` semantics. Continue Phase 1 from actual spotlight/thumb projection transfer feel, broader `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution parity; this closes state tween ownership only. |
| 177 | S1-250 | `Se` thumb state tween ownership | Source `Se.init()` initializes `settings.thumb={darknessIntensity:0,darknessColor:{r:0,g:0,b:0},saturation:1,mouseLightness:1}`. Source `Se.setThumbDarknessIntensity`, `setThumbDarknessColor`, `setThumbSaturation`, and `setThumbMouseLightness` tween `this.settings.thumb` and write `J.workThumbScene.renderManager.compositeMaterial` / work-item `uMouseLightness` uniforms in `onUpdate`. The source does not tween `uDarkenIntensity`, `uSaturation`, or `uDarkenColor` uniforms directly, and does not create one mouse-lightness tween per block. | The rebuild now keeps a source-shaped `thumbState` with the source defaults, tweens that state in all four thumb setters, and writes `uDarkenIntensity`, `uDarkenColor`, `uSaturation`, and all work-item `uMouseLightness` uniforms from state update callbacks. Thumb probe exposes/asserts `stateOwnership=source-Se-settings-thumb-state-onUpdate-uniforms`, `stateUniformsMatch`, and `mouseLightnessUniformsMatchState`. Renderer audit extracts the four rebuild thumb setter blocks, checks the source `Se.settings.thumb` ownership anchors, and rejects old direct-uniform/per-block tween paths. `git diff --check`, syntax checks, build, renderer audit, thumb spotlight probe, desktop/mobile output probes, and project-media probe passed; project media retained `5/5` visible tracks. | Low-medium | Keep `Se` thumb setters state-owned through `thumbState` / source `settings.thumb` semantics. Continue Phase 1 from actual spotlight/thumb projection transfer feel, broader `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution parity; this closes state tween ownership only. |
| 176 | S1-249 | `yD/onProjectActive` active project reveal ownership | Source `yD.onProjectActive(e)` uses `this.inAnimation` to tween inactive `J.workScene.blocks` `a.instance.material.customUniforms.uReveal` to `0` with `duration:1.6` and `ease:"power4.out"`, then tweens the active block `customUniforms.uReveal` to `1` with `delay:.2`, `duration:4`, and the same ease. The same active-project path calls `Se.setRevealSpread(0)`. The source excerpt does not mention `uRevealProject`; that uniform is owned by the gallery enter/out reveal path, not the active-project reveal path. | The rebuild `setProjectBlockReveal(active)` now only kills/recreates `uReveal` tweens for the work items and no longer kills, clears, or creates `projectRevealProjectTweens` / `uRevealProject` tweens in that active-project path. Output probes expose `activeProjectRevealOwnership=source-yD-onProjectActive-uReveal-only-uRevealProject-owned-by-gallery-enter-out`, `activeProjectRevealTweenCount`, and informational `revealProjectTweenCount`; `scripts/probe-output-color.mjs` asserts ownership and that the `uReveal` tween count matches `p1UpdateCulling.total`. Renderer audit now extracts source `yD.onProjectActive()` plus rebuild `setProjectBlockReveal()` and checks source/rebuild `uReveal` ownership while rejecting active-reveal `uRevealProject` writes. `git diff --check`, syntax checks, build, renderer audit, desktop/mobile output probes, thumb spotlight probe, and project-media probe passed; desktop/mobile output probes confirmed `activeProjectRevealTweenCount=10` and project media retained `5/5` visible tracks. | Low | Keep `uRevealProject` out of `setProjectBlockReveal()` unless bundle evidence shows source active-project ownership changing. Continue Phase 1 from spotlight/thumb projection transfer feel, broader `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution parity; this closes a narrow reveal-ownership mismatch only. |
| 175 | S1-248 | `Lu/Ka` screen mouse simulation sizing | Source `Lu.resize(e,t,n)` rounds the work render size for DPR and, when `settings.mousesim.enabled`, calls `this.mouseSimulation.onResize(e/10,t/10)` with no post-division `Math.round`. Source `Ka.onResize(e,t)` directly forwards the received values to `bufferSim.onResize(e,t)` and `simulationMaterial.uniforms.uCoords.value.set(e,t)`. | Work screen mouse-sim targets now use `workRenderWidth / SCREEN_MOUSE_SIM_SCALE` and `workRenderHeight / SCREEN_MOUSE_SIM_SCALE`, with only the existing minimum size clamp, preserving source-shaped non-integer target sizes such as mobile `844 / 10 = 84.4`. Runtime probes expose/assert `targetSizingMode=source-Lu-mousesim-render-size-div-10-no-post-rounding`, expected target size, target-size parity, and `uCoords` parity. Renderer audit checks the source `Lu` and `Ka` anchors and rejects the old rebuild post-rounding path. `git diff --check`, syntax checks, build, renderer audit, desktop/mobile output probes, interactive mouse probe, thumb spotlight probe, and project-media probe passed; project media retained `5/5` visible tracks. | Low-medium | Keep source `Lu/Ka` screen mouse-simulation target sizing on render-size divided by `10` with no post-rounding. Continue Phase 1 from broader `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this target-sizing parity is not a closeout. |
| 174 | S1-247 | `Lu/I1` optional `Na` blur update ownership | Source `Lu.update()` renders the optional work blur chain from raw `renderTargetA` to `renderTargetBlurA` to `renderTargetBlurB`, then uses `renderTargetBlurB` as the source for luminosity and final `OA.tScene` when blur is enabled. Source work bloom still starts from raw `renderTargetA` unless the luminosity branch produced `renderTargetBright`. Source `Na` initializes `uBluriness` to `0`, and the mirrored bundle has no `settings.blur.strength` runtime update in `Lu.update()` or `I1.update()`. | The rebuild now adds a source-shaped `renderWorkBlurPass()` through `workPostScreen`, feeds work luminosity from `workBlurTargetB` only when blur is enabled while keeping bloom's raw source as `workRawTarget`, and uses the same blur-or-raw target for `OA.tScene`. The rebuild also removes the non-source main blur `uBluriness` writes from `renderHomeBlurPass()`. Output probes expose/assert work pass-input markers and `blurinessUpdateMode=source-Na-uBluriness-init-zero-no-update-write`; renderer audit checks source/rebuild work blur branch anchors, source init-only `Na.uBluriness` evidence for `Lu/I1`, and the updated work bloom/luminosity input shape. `git diff --check`, syntax checks, build, renderer audit, desktop/mobile output probes, thumb spotlight probe, and project-media probe passed; project media retained `5/5` visible tracks with no failures/exceptions/console messages. | Low-medium | Keep optional `Na` blur update ownership source-shaped and do not reintroduce runtime `blur.strength` writes without bundle evidence. Continue Phase 1 from broader `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this optional branch parity is not a closeout. |
| 173 | S1-246 | `p1` spotlight parallax branch guardrail | Source `p1.update()` keeps spotlight projection on the direct `SpotLight` object, with `this.spotLight.position.x=this.camera.position.x*.175` and a viewport branch for y: `Pe.w>=Le.BREAKPOINTS.MD ? this.spotLight.position.y=this.camera.position.y*.175 : this.spotLight.position.y=.3+this.camera.position.y*.175`. This branch matters to the thumb-map projection chain because mobile source y includes the same `.3` scene offset used by the mobile work-scene layout. | Production rendering is unchanged because the rebuild already used `(window.innerWidth >= BREAKPOINT_MD ? 0 : 0.3) + this.homeCamera.position.y * 0.175`. Runtime probes now expose `parallaxMode=source-p1-spotLight-x-camera-y-desktop-or-0_3-mobile`, desktop/mobile y-offset mode, `mobileBreakpoint=800`, and the active source y offset on both `__rogierOutputProbe.spotlightProjection.spotlight` and `__rogierThumbProbe.spotlight`. `scripts/probe-output-color.mjs` asserts the desktop and mobile branches, `scripts/probe-thumb-spotlight.mjs` asserts the desktop thumb branch, and renderer audit now checks the exact source ternary plus rebuild branch markers. `git diff --check`, syntax checks, build, renderer audit, desktop/mobile output probes, thumb spotlight probe, and project-media probe passed; project media retained `5/5` visible tracks with no failures/exceptions/console messages. | Low | Keep the `.3` mobile spotlight y offset as source `p1` parallax ownership, not as a visual tuning knob. Continue Phase 1 from actual spotlight/thumb projection transfer feel, remaining `kA/Lu/I1` transfer interpretation, and floor/environment distribution parity; this is guardrail/evidence hardening, not a Phase 1 closeout. |
| 172 | S1-245 | `Lu` work composite final target reset | Source `Lu.update()` default `renderToScreen:false` branch renders the final work composite screen to `renderTargetComposite` with `o.setRenderTarget(h),o.render(this.screen,this.screenCamera)`, then immediately calls `o.setRenderTarget(null)` before returning to `Iu.update()` and the source post-render camera/component update chain. This reset is part of source render-manager target ownership, independent of visual output. | The rebuild now calls `this.renderer.setRenderTarget(null)` immediately after rendering `workPostScreen` into `workCompositeTarget` in the production work composite branch. The debug raw-work composite branch and no-home project-page placeholder path are left unchanged because they are explicit rebuild diagnostics/route guards rather than the source `Lu.update()` production branch. Output probes expose `sourceFinalTargetReset=source-Lu-renderToScreen-false-renderTargetComposite-then-null`; `scripts/probe-output-color.mjs` asserts it. Renderer audit checks the exact source ternary final-render branch and the rebuild `workCompositeTarget` render followed by `setRenderTarget(null)`. | Low | Keep source `Lu` production work composite output resetting the renderer target to `null` after `renderTargetComposite`. Continue Phase 1 from deeper `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this is target ownership parity, not visual closeout. |
| 171 | S1-244 | `Lu/I1` bloom blur resize-owned `uResolution` | Source `Lu.resize(e,t,n)` and `I1.resize(e,t,n)` enter their bloom resize loops after `e=Fa(renderWidth)/4` for work and `e=Fa(renderWidth)/2` for main, then for each mip call `renderTargetsHorizontal[i].setSize(e,t)`, `renderTargetsVertical[i].setSize(e,t)`, and `blurMaterials[i].uniforms.uResolution.value.set(e,t)` before halving `e,t`. Source `Lu.update()` and `I1.update()` do not write `rg.uResolution` in the bloom branch; they only bind `tMap`, swap `uDirection`, set the shared screen material, and render horizontal/vertical targets. | The rebuild now passes the relevant work/main `rg` material arrays into `resizeBloomMipChain()` and writes each material `uResolution` at the same time as the mip targets are resized. `renderBloomChain()` no longer writes `blurMaterial.uniforms.uResolution` during the frame update. Output probes expose `resolutionResizeMode=source-Lu-I1-rg-uResolution-resize-loop`, `resolutionUpdateMode=source-Lu-I1-rg-update-keeps-resize-resolution`, and all five work/main mip resolution vectors; `scripts/probe-output-color.mjs` asserts the arrays against the source mip starts. Renderer audit checks the source resize-loop anchors, absence of source/rebuild update-loop resolution writes, and both rebuild work/main call sites. | Low-medium | Keep bloom blur `rg.uResolution` resize-owned by `Lu/I1.resize()` and do not reintroduce per-frame update writes. Continue Phase 1 from actual `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this is runtime ownership parity, not visual closeout. |
| 170 | S1-243 | `Lu/I1` helper pass source-null input samplers and `Lu` FXAA branch | Source `ig`, `sg`, `Na`, `rg`, `cg`, `L1`, and floor-reflection `t1` construct their input sampler uniforms with `new I(null)` or `{value:null}`. Source `Lu/I1.initRenderer()` then binds `cg.tBlur1..5` and `uBloomFactors` after construction. Source `Lu.resize()` writes `renderTargetFXAA.setSize(e*n,t*n)` and `FxaaMaterial.uniforms.uResolution.value.set(e*n,t*n)` only when FXAA is enabled, and source `Lu.update()` renders the composite screen into `renderTargetFXAA`, binds `FxaaMaterial.tMap` to that target texture, swaps the screen material, then renders to `renderTargetComposite`. | The rebuild now initializes helper pass input samplers to `null` for `L1`, `sg`, `rg`, `Na`, `ig`, floor `t1`, and `cg` `tBlur1..5/uBloomFactors`, while preserving post-constructor `cg` blur/factor bindings. The work `Lu` FXAA resize/update branch now mirrors source ownership for target sizing, `uResolution`, intermediate render, `tMap` binding, and screen material swap. Output probes assert source constructor markers for `sg/Na/rg/cg/ig/t1` and source FXAA screen/resize modes; renderer audit checks source `ig/sg/Na/rg/cg/L1/t1` constructor-null anchors, rebuild factory ownership, old constructor prebind absence, and `Lu` FXAA branch anchors. | Low-medium | Keep helper pass input samplers constructor-null and runtime-bound by the owning branch or `initRenderer()` step. Continue Phase 1 from actual `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this is constructor/input ownership plus optional-branch parity, not visual closeout. |
| 169 | S1-242 | `Lo/g1/z1/N1` source-null `tScene` constructors | Source `g1` constructs `uniforms:{tScene:new I(null)}`. Source `z1` constructs `uniforms:{tScene:new I(null),uTime:new I(0),...}`. Source `N1` constructs `uniforms:{tScene:new I(null),uRatio:new I(1),uTime:new I(0)}`. Source `Lo.update()` then renders the raw scene into `renderTargetA` and binds `this.compositeMaterial.uniforms.tScene.value=c.texture` before rendering the composite screen pass. | The rebuild now initializes the sky `z1` and displacement `N1` `tScene` uniforms to `null` at material construction time, while preserving runtime raw-target binding to `skyRawTarget.texture` and `displacementRawTarget.texture` immediately before their composite screen renders. Output probes assert `source-z1-tScene-construct-null-Lo-update-binds-raw` and `source-N1-tScene-construct-null-Lo-update-binds-raw`; renderer audit checks source `g1/z1/N1` constructor anchors plus rebuild raw-target binding markers. | Low | Keep `Lo`-derived simple composite `tScene` uniforms constructor-null and runtime-bound to the raw target. Continue Phase 1 from actual `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this is constructor/input ownership parity, not visual closeout. |
| 168 | S1-241 | Source-null composite sampler ownership | Source `C1`, `OA`, `lA`, `W1`, and `_1` construct sampler uniforms with `new I(null)`. Source `Lu.update()` writes `OA.tBloom` only inside the bloom branch, and source `I1.update()` writes `C1.tBloom` only inside its bloom branch. Default source `I1.bloom.enabled=false`, so `C1.tBloom` remains constructor-null unless that optional branch is enabled. | The rebuild now initializes those pass-material sampler uniforms to `null`, while keeping source runtime bindings where they exist: one-time `nD.init()` ownership for `C1.tWork/tMedia/tMouseSim`, frame-owned `tScene`/`tLensflare`, work `OA.tBloom` inside the source-enabled work bloom branch, and main `C1.tBloom` only inside the source main bloom branch. Output probes now assert `samplerConstructorMode=source-C1-sampler-uniforms-construct-null-branch-owned-bindings`, `tBloomBindingMode=source-I1-bloom-branch-only`, source-null `tPortal/tBlur`, and source fluid branch ownership; renderer audit checks the source `new I(null)` constructor surfaces and branch-owned bloom markers. | Low-medium | Keep source-null sampler constructor ownership and branch-owned bloom bindings. Continue Phase 1 from the remaining `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this is input-ownership parity, not visual closeout. |
| 167 | S1-240 | Renderer audit `C1` frame-loop rebind scope | Source `nD.init()` performs the one-time `C1.tWork`, `C1.tMedia`, and `C1.tMouseSim` bindings after the initial resize delay, while source `C1.update(e,t,n)` only writes `uTime`. After S1-239 the rebuild correctly moved those production bindings into `bindSourceMainCompositeInputs()`, but the static audit still searched the whole `src/client/webgl.ts` file for `this.preCompositeMaterial.uniforms.tMedia.value = this.mediaTarget.texture`, so it misreported the one-time binder as a per-frame rebind. | `scripts/audit-renderer-output.mjs` now extracts the rebuild `private tick` block and scopes no-per-frame `C1` rebind checks to that frame loop. It still rejects production frame-loop `tWork` composite rebinds, `tMedia` rebinds, and current-ping-pong `tMouseSim` rebinds, while allowing the source one-time binder and the explicit `debug-pass-order=raw-work-composite` diagnostic. Recursive audit false/null review now drops the stale `sourceManagers.C1.rebuildChecks.noPerFrameTMediaRebind=false` entry and only reports expected source-negative/default evidence. | Low | Keep renderer audit per-frame checks scoped to the actual frame loop. Continue production Phase 1 from real `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity. |
| 166 | S1-239 | `nD/C1` main cross-scene input bindings | Source `nD.init()` performs three one-time cross-scene bindings after the initial resize delay: `C1.tWork` receives `workScene.renderManager.renderTargetComposite.texture`, `C1.tMedia` receives `mediaScene.renderManager.renderTargetComposite.texture`, and `C1.tMouseSim` receives `workScene.renderManager.mouseSimulation.bufferSim.output.texture`. Source `C1.update(e,t,n)` only writes `uTime`, so these inputs are not production frame-loop rebindings. The rebuild had already fixed `tMouseSim`, but still rebound `C1.tWork` and `C1.tMedia` in the frame loop. | The rebuild now calls `bindSourceMainCompositeInputs()` after resize, binding `tWork` to `workCompositeTarget.texture`, `tMedia` to `mediaTarget.texture`, and `tMouseSim` to the initial screen mouse-sim target. Production no longer reassigns `preCompositeMaterial.uniforms.tWork` or `tMedia` each frame; the raw-work target remains available only behind the explicit `debug-pass-order=raw-work-composite` diagnostic. Output probe now asserts source binding markers and target identities for `tWork`, `tMedia`, and `tMouseSim`; renderer audit checks source `nD.init()` anchors and absence of the old production rebind bridges. | Low-medium | Keep `C1/A1` cross-scene inputs on source one-time `nD.init()` ownership. Continue Phase 1 from remaining `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity. |
| 165 | S1-238 | `nD/C1` main mouse-sim binding timing | Source `nD.init()` binds `J.mainScene.renderManager.compositeMaterial.uniforms.tMouseSim.value` once, after the initial resize delay, to `J.workScene.renderManager.mouseSimulation.bufferSim.output.texture`. Source `C1.update(e,t,n)` only writes `uTime`, so the main pre-composite `A1` mouse-sim input does not chase the current ping-pong output every frame. The rebuild had been rebinding `preCompositeMaterial.uniforms.tMouseSim` to the current screen mouse-sim texture in the frame loop. | The rebuild now calls `bindSourceMainMouseSimulationTexture()` once after creating the screen mouse-sim targets, binding `C1/A1.tMouseSim` to the initial target texture. The frame loop no longer reassigns `preCompositeMaterial.uniforms.tMouseSim`. Output probe exposes `tMouseSimBindingMode=source-nD-init-one-time-C1-tMouseSim-initial-work-mousesim-output` and asserts the initial-target binding; renderer audit checks the source `nD.init()` assignment, rebuild one-time binder, and absence of the per-frame C1 mouse-sim rebind. | Low-medium | Keep main `C1/A1.tMouseSim` on the source one-time binding unless new bundle evidence shows a later source reassignment. Continue Phase 1 from remaining `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity. |
| 164 | S1-237 | `yD/w1` thumb progress update order | Source `yD.updateScene(e)` updates `workScene.sceneWrap.rotation.y`, writes `mainScene.renderManager.compositeMaterial.uniforms.uTransformX`, then calls `J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)` before computing and applying work-scene roll/zoom. The rebuild had the same formulas but called `updateThumbGallery(-progress)` after roll/zoom. This is source-order parity for the thumb projection content path, not a visual tuning change. | `setGalleryProgress()` now applies `sceneWrap.rotation.y`, then `updateThumbGallery(-progress)`, then the source roll/zoom smoothing and work-scene transforms. Thumb probe exposes `sourceProgressUpdateOrder=source-yD-sceneWrap-uTransformX-thumbProgress-before-roll-zoom`; `scripts/probe-thumb-spotlight.mjs` asserts it. Renderer audit now checks both source and rebuild relative order for sceneWrap/uTransformX/thumb progress before roll/zoom. | Low | Keep source `yD` progress order so thumb target content is updated at the source point in the gallery transform chain. Continue Phase 1 from actual spotlight/thumb transfer feel, `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution parity. |
| 163 | S1-236 | `Lu/Na` work blur resize resolution | Source `Lu.resize(e,t,n)` writes CSS viewport dimensions into both optional work blur materials when `settings.blur.enabled`: `this.hBlurMaterial.uniforms.uResolution.value.set(e,t)` and `this.vBlurMaterial.uniforms.uResolution.value.set(e,t)`. The rebuild resized the work blur targets but did not mirror those `Na.uResolution` writes for the source `Lu` path. Source `kA.initSettings()` keeps `blur.enabled=false`, so this is a low-risk source-surface correction rather than visual tuning. | The rebuild now writes `width,height` into `workBlurHorizontalMaterial.uniforms.uResolution` and `workBlurVerticalMaterial.uniforms.uResolution` inside the work blur-enabled branch. Output probes expose `source-Lu-Na-resize-css-width-height-when-blur-enabled` for work standard blur materials and keep the existing source `I1` resize mode for main standard blur. Static renderer audit checks the source `Lu.resize` anchors and rebuild work blur writes. | Low | Keep work `Na` blur resolution on CSS dimensions when the optional source `Lu` blur branch is enabled. Continue Phase 1 from real `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity. |
| 162 | S1-235 | Renderer audit source-window cleanup | Current shader dump shows the focused Phase 1 shader surfaces are source-shaped, so the next trustworthy completion audit depends on renderer/source-manager checks not reporting stale false negatives. Fresh renderer audit showed false checks caused by too-narrow source excerpts for `p1` and `Xt.preloadThumbs`, shader-helper anchors checked against class excerpts instead of raw shader templates, and a stale negative check that rejected the now source-gated optional `mainLensflareMaterial` creation call. | `scripts/audit-renderer-output.mjs` now widens the `p1` and texture-manager source excerpts, extracts raw `l1` and `B1` shader templates for environment/sky helper-surface checks, keeps `u1/z1` class checks focused on constructor/material bindings, relaxes thumb lifecycle rebuild matching to the stable async method name/behavior, and removes the stale optional-lensflare creation negative check while still rejecting old shared pass-material fields. `node --check scripts/audit-renderer-output.mjs` and `node scripts/audit-renderer-output.mjs` passed. Recursive audit false output now contains only expected negative/default state evidence such as source `A1` lacking tonemapping, rebuild source-negative legacy A1 checks, and render-target defaults with `depthBuffer/stencilBuffer/generateMipmaps=false`. | Low | Keep audit checks tied to the source surface they actually inspect: class constructors for ownership and raw shader templates for helper surfaces. Continue production Phase 1 from `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity. |
| 161 | S1-234 | `rt` Object3D container surface | Source `p1` constructs `blocksWrap` and `sceneWrap` with `new rt`; source `IT` constructs `group`, `rotateGroup`, and `innerGroup` with `new rt`; source `a1`, `i1`, `h1`, `w1`, and `GA` all extend `rt` or construct child wraps with `new rt`. In the mirrored Three r164 bundle, `rt` is the base `Object3D`, not `Group`, so these containers should not carry rebuild-only `Group` identity. | The rebuild now uses `Object3D` for the source `rt` container surface: home `sceneWrap`/`blocksWrap`, thumb `thumbWrap`/`thumbScrollWrap`, floor group/reflector, environment group, camera controller chain, per-work `group`/`rotationWrap`, and auxiliary block wraps. `characterModelRoot` remains `Group` because this batch did not establish source evidence for that model-root surface. Output/thumb probes now assert `controllerObjectMode=source-IT-rt-object3d-containers`, camera controller object types, `thumbObjectMode=source-w1-rt-object3d-scrollWrap`, floor/environment `Object3D` group types, reflection `sceneWrap.type`, and `Object3D` reflector type. Renderer audit records the matching source `rt` anchors in `p1`, `IT`, `a1/i1`, `h1`, `w1`, and `GA`. `git diff --check`, script syntax checks, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, desktop/mobile output probes with `PROBE_WAIT=30000`, thumb spotlight probe, and project-media probe passed; project media retained `5/5` visible tracks, with no failures/exceptions/console messages. | Low | Keep source `rt` containers on `Object3D` unless a specific source subclass proves otherwise. Continue Phase 1 from actual `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this is structural source parity, not a final visual closeout. |
| 160 | S1-233 | `C1/A1` resize vector runtime surface | Source `U1.resize(e,t,n)` calls `this.renderManager.compositeMaterial.resize(e,t)`, source `C1.resize(e,t)` writes only `this.uniforms.uContainerSize.value.set(e,t)`, and source `C1` constructs `uDisplacementSize:new I(new Q)` with no mirrored runtime write. Source `A1` declares `uDisplacementSize` but does not sample it, while source `O1/k1` separately resizes the displacement render manager to `height/10`. | The rebuild now initializes `C1.uDisplacementSize` and `C1.uContainerSize` to `[0,0]`, writes `C1.uContainerSize` from CSS viewport width/height instead of DPR render size, leaves the source `O1/k1` displacement target sizing at `height/10`, and removes the rebuild-only runtime `C1.uDisplacementSize` write. Output probes now assert `resizeMode=source-U1-C1-resize-css-width-height`, desktop `uContainerSize=[1440,900]`, mobile `uContainerSize=[390,844]`, `uDisplacementSizeMode=source-C1-constructor-default-new-Vector2-no-runtime-write`, and `uDisplacementSize=[0,0]`. Renderer audit records source `C1.resize`, source vector defaults, the rebuild CSS-size write, and `noRuntimeUDisplacementSizeWrite=true`. `git diff --check`, script syntax checks, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, desktop/mobile output probes with `PROBE_WAIT=30000`, and project-media probe passed; project media retained `5/5` visible tracks on `gc-2026` and `hashgraph-vc`, with no failures/exceptions/console messages. | Low | Keep `C1.resize` on CSS viewport dimensions and leave `C1.uDisplacementSize` at the source constructor default unless new mirrored-bundle evidence appears. Continue Phase 1 from actual `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this is not a final visual closeout. |
| 159 | S1-232 | `C1/A1` material uniform constructor surface | Source `C1` constructs its material uniforms in the order `tScene`, `tWork`, `tMedia`, `tBloom`, `tBlur`, `tFluid`, `tPortal`, `tMouseSim`, the four bools, `uTime`, `tNoise`, `tLensflare`, `uRatio`, `tPerlin`, displacement/container fields, background/reveal/contrast/transform/fluid fields. It also declares `tPortal:new I(null)` even though source `A1` does not sample it, and initializes all four bool uniforms to `false`. | The rebuild now records `SOURCE_C1_UNIFORM_KEYS`, orders `createPreCompositeMaterial()` uniforms to match the source constructor surface, initializes the four source bool uniforms as `false` before the runtime `I1.update()` writes source settings, and exposes `materialUniformSurface` in the output probe. `scripts/probe-output-color.mjs` now hard-checks the exact `C1` uniform key order, the unused `tPortal` material-uniform binding, placeholder `tPortal/tBlur`, and source `uDisplacement=.1` / `uPerlin=.1` / displacement-container vector surfaces. `scripts/audit-renderer-output.mjs` records the corresponding source `C1` anchors and rebuild markers. Production formulas, target wiring, visual constants, and the default `I1/C1` screen path are unchanged. `git diff --check`, script syntax checks, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, desktop/mobile output probes with `PROBE_WAIT=30000`, and project-media probe passed; project media retained `5/5` visible tracks on `gc-2026` and `hashgraph-vc`, with no failures/exceptions/console messages. | Low | Keep `C1` constructor uniform order and unused source material uniforms guarded. Continue Phase 1 from actual `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; this is not a final visual closeout. |
| 158 | S1-231 | `VA/HA/zA` source trailing-space shader surface | Fresh shader residuals after S1-230 showed `VA-work` still had avoidable text deltas even though all anchors, includes, uniforms, and core checks matched. Raw diff proved the fragment delta was only source trailing-space surface, and the vertex delta was source trailing-space surface plus the already documented equal-length `uUvOffset vec3`/`vec2` runtime bridge. | The rebuild now emits those source trailing spaces at runtime through `SOURCE_TRAILING_SPACE` in the direct `HA/zA` work shader templates, while keeping the repository whitespace-clean and leaving formulas, uniforms, material ownership, projection, and the `uUvOffset` runtime bridge unchanged. `git diff --check`, `node --check scripts/probe-output-color.mjs`, `node --check scripts/audit-renderer-output.mjs`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, thumb spotlight probe, project-media probe, and interactive mouse probe passed. Shader dump reports every focused Phase 1 shader row as `source-shaped`; `VA-work` now has vertex delta `0`, fragment delta `0`, no include/uniform residuals, and the same documented `uUvOffset` bridge evidence. Project media retained `5/5` visible tracks for `gc-2026` and `hashgraph-vc`; output/thumb/interactive probes had no failures, exceptions, or console messages. | Low | Keep the source trailing-space runtime emission for `VA-work`. Continue Phase 1 from actual `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; do not treat shader-surface parity as final projection/material or visual closeout. |
| 157 | S1-230 | `$1/j1/W1/G1` media composite shader source surface | Source `G1` expands the shared helper templates before its declarations, keeps `luminance(...)`, orders uniforms as `tScene`, `tBloom`, `tFluid`, `tBlur`, and `tMouseSim`, and still uses a pass-through body with `vec4 mixed = texture(tScene, vUv); FragColor = mixed;`. Source `W1` uses that `G1` fragment surface for the project-media composite material even though the active formula is inert. | The rebuild `mediaCompositeFragment` now mirrors the source helper surface, `luminance(...)`, uniform order, and `mixed` pass-through body without changing project-media target wiring, material ownership, formulas, or visual constants. `git diff --check`, `node --check scripts/probe-output-color.mjs`, `node --check scripts/audit-renderer-output.mjs`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, and project-media probe passed. Shader dump reports `j1-media-composite` as `source-shaped` with vertex delta `0`, fragment delta `0`, and no include/uniform residuals; `A1-pre-composite`, `OA-work-composite`, and `ag-advection` stayed source-shaped. Project media retained `5/5` visible tracks for `gc-2026` and `hashgraph-vc`; desktop/mobile output probes had no failures, exceptions, or console messages. | Low | Keep `$1/j1/W1/G1` shader text source-shaped. Continue Phase 1 from actual `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, floor/environment distribution parity, and any remaining source-proven project-media render-manager target evidence; do not treat media-composite shader-surface parity as final Home or project visual closeout. |
| 156 | S1-229 | `ag` main fluid shader source surface | Source main-fluid pass templates `Co`, `VT`, `Sf`, `XT`, `$T`, `WT`, `YT`, and `ZT` are compact GLSL3 strings. Source `GT` owns the bounded/advection uniform surface (`bounds`, `px`, `fboSize`, `velocity`, `dt`), source `qT` owns the additive force pass with `center`, `scale`, `px`, and `force`, and the divergence/poisson/pressure passes keep compact source literal surfaces. | The rebuild now mirrors those source one-line shader surfaces in `fluidBoundedVertex`, `fluidBoundsVertex`, `fluidForceVertex`, `fluidAdvectionFragment`, `fluidForceFragment`, `fluidDivergenceFragment`, `fluidPoissonFragment`, and `fluidPressureFragment` without changing formulas, uniforms, blending, FBO ownership, or visual constants. `git diff --check`, `node --check scripts/probe-output-color.mjs`, `node --check scripts/audit-renderer-output.mjs`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, thumb spotlight probe, project-media probe, and interactive mouse probe passed. Shader dump reports `ag-advection`, `ag-advection-bounds`, `ag-force`, `ag-divergence`, `ag-poisson`, and `ag-pressure` as `source-shaped` with vertex delta `0` and fragment delta `0`; the interactive probe retained source `ag/qT` pointer/center response and no failures/exceptions/console messages; project media retained `5/5` visible tracks for `gc-2026` and `hashgraph-vc`. | Low | Keep `ag` pass shader text source-shaped. Continue Phase 1 from actual `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; do not treat main-fluid shader-surface parity as final Home visual/feel closeout. |
| 155 | S1-228 | `lA/aA` main composite shader surface | Source `aA` expands helper templates `Ur/Ro/Za/Fr/Ja/Qa`, declares `luminance(...)`, orders uniforms as `tScene`, `tBloom`, `tFluid`, `tBlur`, keeps vignette globals, computes source-inert `float vignetteF = vignette(...,.25)`, and uses compact source literal surfaces in the fluid/rgbshift/bloom body. Source `lA` also constructs a `tMouseSim:new I(null)` material uniform even though `aA` does not declare or sample `tMouseSim`. | The rebuild `mainCompositeFragment` now mirrors source `aA` through `sourceCompositeColorHelper`, source uniform order, vignette globals/local, compact literal/formula surface, and source `FragColor = vec4(mixed.rgb, 1.)`. `createMainCompositeMaterial()` now restores the source unused `tMouseSim` material-uniform object. Runtime output probes expose/assert `mainComposite.shaderSurface.formulaMode=source-aA-helper-surface-and-vignette-local`, helper/vignette/uniform-order markers, and `hasSourceUnusedMouseSimUniform=true`; `probe-output-color.mjs` fails on drift. `scripts/audit-renderer-output.mjs` now checks source `lA` `tMouseSim` and rebuild `aA`/uniform markers. `git diff --check`, `node --check scripts/probe-output-color.mjs`, `node --check scripts/audit-renderer-output.mjs`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, thumb spotlight probe, project-media probe, and interactive mouse probe passed. Shader dump reports `Lu-main-composite` vertex delta `0`, fragment delta `0`, and no fragment uniform residuals; project media retained `5/5` visible tracks for `gc-2026` and `hashgraph-vc`. | Low | Keep `lA/aA` source-shaped, including the unused source material uniform. Continue Phase 1 from actual `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity; do not treat shader-surface parity as final composite/output parity. |
| 154 | S1-227 | `T1/w1/yD` nonzero thumb progress projection guardrail | Source `yD.updateScene()` passes `J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)` while also updating `sceneWrap.rotation.y`, `A1/C1.uTransformX`, scene roll, and zoom. Source `w1.updateGalleryProgress(e)` sets `this.progress=e*totalWidth`, assigns each thumb `xHook=itemWidth*index`, wraps `x=(xHook+progress+totalWidth*67890)%totalWidth`, recenters with `x>totalWidth/2`, and owns visibility through `[-1.5,1.5]`. | Production visuals are unchanged. The rebuild now exposes debug-only `debug-thumb-progress` only under `debug-thumb-probe`, applies it through `setGalleryProgress()` before rendering thumb targets, and reports `debugProgress` plus `sourceProgressSignMode=source-yD-updateScene-workThumbScene-thumbs-updateGalleryProgress-negative-scroll-progress` in `__rogierThumbProbe`. `scripts/probe-thumb-spotlight.mjs` now navigates with `debug-thumb-progress=0.27` and hard-checks `galleryProgress=0.27`, `thumbProgress=-5.4`, each thumb `xHook` and wrapped x position, source visibility bounds, `visibleThumbs=2`, source spotlight map/position/target/intensity/parallax, non-empty thumb/composite luma, and the existing `Xt/E1/M1/x1/T1` ownership state. `scripts/audit-renderer-output.mjs` now records the source `yD.updateScene()` negative-progress call and rebuild markers. `git diff --check`, `node --check scripts/probe-thumb-spotlight.mjs`, `node --check scripts/audit-renderer-output.mjs`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, updated thumb spotlight probe, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, project-media probe, and interactive mouse probe passed. The updated thumb probe reported source WebP thumbs ready, `visibleThumbs=2`, luma `0.5015`, spotlight map present, and no failures/exceptions/console messages; project media retained `5/5` visible tracks for `gc-2026` and `hashgraph-vc`. | Low | Keep this as a guardrail for the thumb-map content path at nonzero progress. Continue Phase 1 from actual spotlight/thumb transfer feel, remaining `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution parity; do not treat this debug probe as visual completion. |
| 153 | S1-226 | `Ka/ag` interactive mouse and fluid guardrail | Source `Ka.onMouseMove({x:e,y:t})` writes screen target coordinates as `e/Pe.w, 1-t/Pe.h`; source `Ka.raycast()` normalizes the same mouse point to `e/Pe.w*2-1` and `-(t/Pe.h)*2+1`, raycasts immediately during mousemove, and updates local `targetPos` from the hit UV. Source `ag/qT` listens to `MOUSE_MOVE`, stores normalized coordinates, computes a transient diff in `updateMouseDiff()`, writes `force`, `center`, and `scale` into the force material, then copies old coords so delayed force sampling can naturally read zero. | The rebuild now exposes `mainFluid.interaction` with `source-ag-qT-window-mousemove-force-pass`, `force`, `center`, and `scale` from `forceMaterial.uniforms`. New `scripts/probe-interactive-mouse.mjs` drives CDP mouse moves under `?debug-output-probe=1`, asserts the screen `Ka` target matches the final source-normalized mouse position, active `GA/Ka` pointer ray matches source normalization, active local mouse target and simulation speed respond, all active source-shape flags remain true, and main fluid pointer/old pointer/center/scale respond at the same normalized coordinate. The probe no longer requires whole-target luma changes for local brush buffers and does not require delayed nonzero `force`. `git diff --check`, `node --check scripts/probe-interactive-mouse.mjs`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, interactive mouse probe, renderer audit, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, thumb spotlight probe, and project-media probe passed. The interactive probe reported screen target `[0.5798611111111112,0.54]`, active pointer ray `[0.15972222222222232,0.07999999999999996]`, moved local target, main-fluid pointer/center at the same coordinate, and no failures/exceptions/console messages. | Low | Keep `scripts/probe-interactive-mouse.mjs` in the regression matrix for mouse/fluid changes. Continue Phase 1 from spotlight/thumb projection content and transfer parity, remaining `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution parity; do not treat this guardrail as final visual/feel closeout. |
| 152 | S1-225 | `I1` optional blur target chain | Current bundle evidence maps source `I1.update()` locals as `l=renderTargetComposite`, `h=renderTargetBlurA`, and `f=renderTargetBlurB`. The optional blur branch writes horizontal blur from `renderTargetA` into `renderTargetBlurA`, then vertical blur from `renderTargetBlurA.texture` into `renderTargetBlurB`. Source `renderTargetComposite` is not the first blur target in that branch; it is reserved for the non-default `renderToScreen:false` final composite output. | The rebuild now renders `mainBlurHorizontalMaterial` into `mainBlurTargetA`, feeds `mainBlurVerticalMaterial` from `mainBlurTargetA.texture`, and records `renderManagerPassInputs.blurSource=source-I1-renderTargetA-to-renderTargetBlurA-then-renderTargetBlurB`. `scripts/audit-renderer-output.mjs` now confirms the source local mapping and rejects the old `compositeTarget` blur bridge; `scripts/probe-output-color.mjs` asserts the updated runtime marker. Default source `I1.blur.enabled=false`, so this closes an optional-path source mismatch without changing the default screen-output path or using visual tuning. `git diff --check`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, thumb spotlight probe, and project-media probe passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. | Low-medium | Keep `I1` optional blur on `renderTargetA -> renderTargetBlurA -> renderTargetBlurB`, and keep `renderTargetComposite` reserved for the non-default output branch. Continue Phase 1 from remaining `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb projection content and transfer parity, floor/environment distribution parity, and interactive mouse/fluid verification. |
| 151 | S1-224 | `u1/z1` sky/environment shader source surface | Source `l1/u1` and `B1/z1` keep the shared simplex/noise/oil helper comments, blank lines, indentation, compact numeric literals, source trailing spaces, source sky blend helper order, `u1` uniform/declaration order, commented include indentation, and body literal/comment surfaces directly in the fragment text. The latest shader dump before this batch had all core anchors matched but still reported `u1-environment` fragment delta `-967` and `z1-sky-composite` fragment delta `-828`, mostly from rebuilt helper formatting, literal spelling, source-inert comments, and equivalent body formatting. | The rebuild now restores the mirrored helper surfaces, source `z1/B1` sky blend/body surface, and source `u1/l1` environment declaration/body surface without changing formulas, constants, uniforms, material ownership, or target wiring. Runtime-only source trailing spaces are emitted through `SOURCE_TRAILING_SPACE`. Shader dump reports `u1-environment` as `source-shaped` with fragment delta `0`, and `z1-sky-composite` with vertex delta `0` and fragment delta `0`; `A1-pre-composite`, `OA-work-composite`, `N1`, `M1`, `x1`, `o1`, and `t1` stayed source-shaped. `ASTRO_TELEMETRY_DISABLED=1 npm run build`, `git diff --check`, renderer audit, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, thumb spotlight probe, and project-media probe passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. | Low-medium | Keep `u1-environment` and `z1-sky-composite` source-shaped. Continue Phase 1 from remaining `kA/Lu/I1` transfer/composite evidence, spotlight/thumb projection content and transfer parity, floor/environment distribution parity beyond shader text, and interactive mouse/fluid verification; do not treat shader-surface closeout as final visual/environment parity. |
| 150 | S1-223 | `A1/OA` composite shader source surface | Source `A1` and `CA` expand the shared color helpers, full `Po` blend dispatcher, `luminance(...)`, A1 `coverTexture(...)`, source uniform/declaration order, source comments, compact numeric literal surface, and A1 body variable names directly in the fragment text. The latest shader dump before this batch had all core anchors matched but still reported `A1-pre-composite` fragment delta `-162` and `OA-work-composite` fragment delta `+6`, mostly from rebuilt helper formatting, source-inert comments, literal spelling, and equivalent-but-renamed A1 body text. | The rebuild now restores the source color helper surface, full blend dispatcher surface, `OA/CA` declaration/body surface, and `A1/C1` body surface without changing formulas, constants, uniforms, or target wiring. Runtime-only source trailing spaces are emitted through `SOURCE_TRAILING_SPACE`. Shader dump reports `A1-pre-composite` and `OA-work-composite` as `source-shaped` with vertex delta `0` and fragment delta `0`; `N1`, `M1`, `x1`, `o1`, and `t1` stayed source-shaped. Later S1-224 separately closes the `u1/z1` sky/environment text residuals. `ASTRO_TELEMETRY_DISABLED=1 npm run build`, `git diff --check`, renderer audit, shader dump, desktop/mobile output probes with `PROBE_WAIT=30000`, thumb spotlight probe, and project-media probe passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. | Low-medium | Keep `A1-pre-composite` and `OA-work-composite` source-shaped. Continue Phase 1 from remaining `kA/Lu/I1` transfer/composite evidence, spotlight/thumb projection content and transfer parity, floor/environment distribution parity, and interactive mouse/fluid verification; do not treat this shader-surface closeout as final transfer parity. |
| 149 | S1-222 | `a1/i1` floor reflection uniform ownership | Source `a1` assigns the floor material uniforms directly from the reflector instance with `n.uniforms.tReflect=this.reflector.renderTargetUniform` and `n.uniforms.uMatrix=this.reflector.textureMatrixUniform`. Source `i1` owns `textureMatrixUniform=new I(this.textureMatrix)` and `renderTargetUniform=new I(this.blurIterations>0?this.renderTargetRead.texture:this.renderTarget.texture)`, then updates `this.renderTargetUniform.value=this.renderTargetRead.texture` after blur swaps. Source `i1.setSize()` also uses CSS viewport scale `.75` before DPR multiplication, so expected CSS sizing should stay unrounded at the probe layer. | The rebuild now creates shared `floorReflectionTextureMatrixUniform` and `floorReflectionRenderTargetUniform` objects, binds `o1-floor-material` `uMatrix`/`tReflect` directly to those objects, and updates only the shared render-target uniform value through `updateFloorReflectionRenderTargetUniform(...)` during raw/debug and blur paths. Runtime probes expose/assert `reflectionUniformOwnership=source-a1-uses-i1-renderTargetUniform-and-textureMatrixUniform`, `tReflectUniformShared:true`, `uMatrixUniformShared:true`, and unrounded source CSS reflection sizing; `probe-output-color.mjs` fails on ownership drift, and `audit-renderer-output.mjs` checks the source/rebuild anchors. `ASTRO_TELEMETRY_DISABLED=1 npm run build`, `git diff --check`, renderer audit, desktop and mobile output probes with `PROBE_WAIT=30000`, and project-media probe passed after the code change. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. | Low-medium | Keep `a1` floor material uniforms object-shared with source-shaped `i1` reflector uniforms. Continue Phase 1 from actual spotlight/thumb projection content and transfer parity, remaining `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment distribution parity beyond this uniform ownership fix, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 148 | S1-221 | `N1/o1/t1/cg` displacement/floor shader source surface | Source `F1/N1` uses `vec2(0.5, 0.5)` in `vignette`, keeps blank lines around the helper and tonemapping pars include, and carries source trailing spaces after `uRatio;`, `vec2 uvOff = vUv;`, and `vec2 uvVignette = uvOff;`. Source `QA/t1` orders the floor-reflection blur surface as `blur(...)`, `smootherstep(...)`, uniforms/varyings, then `main()`. Source `s1/o1/r1` keeps compact vertex declarations, source macro indentation inside `main()`, the Fresnel comment indentation, `1.` literal surface, and the shared source `lg/tA` dither helper comments/indentation; the same dither helper is also used by source `cg/nA`. | The rebuild now matches the source surfaces for `N1-displacement-composite`, `o1-floor-material`, `t1-floor-reflection-blur`, and `cg-bloom-composite`. `displacementFragment` uses `SOURCE_TRAILING_SPACE` for runtime-only source trailing spaces while keeping the repository clean. `floorReflectionBlurFragment` restores the source function/declaration order. `sourceDitherHelper` restores the mirrored `lg/tA` comments/indentation and makes both floor material and bloom composite source-shaped. `floorVertex` and `floorFragment` now match source spacing, macro indentation, and literal surfaces. Shader dump reports all four shaders as `source-shaped` with vertex delta `0` and fragment delta `0`, while `M1-thumb-plane` and `x1-thumb-composite` remain source-shaped. `git diff --check`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, thumb spotlight probe, desktop and mobile output probes with `PROBE_WAIT=30000`, shader dump, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0052` and mobile center `+0.0285`, recorded only as regression evidence. | Low | Keep these displacement/floor/reflection-blur/shared-dither shader surfaces byte-shaped where local TypeScript formatting allows, using runtime string construction only for source trailing spaces. Continue Phase 1 from remaining source mismatches: actual spotlight/thumb projection content and transfer parity, `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment distribution parity beyond shader text surfaces, and interactive mouse/fluid verification. |
| 147 | S1-220 | `M1/x1` thumb shader source surface | Source `M1/S1` expands `${y1}` and keeps two source blank-line positions plus trailing spaces after `uniform float uProgress;` and `uniform float uTransitionCount;`; source `b1` has no blank line before `void main()`. Source `x1/_1/v1` expands `${hg}` with tab-indented `return base*blend;`, expands `${Ur}` with four-space indentation, and source `tl` has no blank line before `void main()`. These are source-surface differences in the thumb shader chain even though their visual behavior is unchanged. | The rebuild now matches the source thumb shader surfaces for `M1-thumb-plane` and `x1-thumb-composite`. `sourceBlendMultiplyHelper` uses the mirrored `${hg}` tab/`base*blend` surface, `sourceSaturationHelper` uses the mirrored `${Ur}` indentation, `thumbFragment` restores the source blank-line and uniform trailing-space text through `SOURCE_TRAILING_SPACE` so the runtime shader matches the bundle while the repository file passes whitespace checks, and both thumb fullscreen vertices remove the rebuild-only blank line before `void main()`. Shader dump reports `M1-thumb-plane` and `x1-thumb-composite` as `source-shaped` with vertex delta `0` and fragment delta `0`. `git diff --check`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, thumb spotlight probe, desktop and mobile output probes with `PROBE_WAIT=30000`, shader dump, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0045` and mobile center `+0.0308`, recorded only as regression evidence. | Low | Keep `M1/S1`, `x1/v1`, `b1`, and `tl` thumb shader source surfaces byte-shaped where local TypeScript formatting allows, using runtime string construction only for source trailing spaces. Continue Phase 1 from actual spotlight/thumb projection content and transfer parity, remaining `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 146 | S1-219 | `SD/p1/TD` direct `SpotLight` state ownership | Source `SD.init()` directly assigns `J.workScene.spotLight.map=J.workThumbScene.renderManager.renderTargetComposite.texture`, `J.workScene.spotLight.position.set(0,0,3.7)`, `J.workScene.spotLight.target.position.set(0,0,-8)`, and `J.workScene.spotLight.intensity=220`. Source `p1.update()` directly mutates `this.spotLight.position.x=this.camera.position.x*.175` and `this.spotLight.position.y=...` when `spotLightParallax` is true. Source `TD.updateSpotLight()` directly writes `J.workScene.spotLight.position.set(...)` and `J.workScene.spotLight.target.position.set(...)` from `aboutBlocks`. Source does not keep a separate spotlight position/target/right/up mirror layer. | The rebuild now writes directly to `this.spotLight.position` and `this.spotLight.target.position` for home init, home parallax, and about spotlight updates. It removes rebuild-only `spotLightPosition`, `spotLightTarget`, `spotLightRight`, `spotLightUp`, and `updateSpotLightBasis()`. Runtime probes expose/assert `positionOwnershipMode=source-direct-SpotLight-position-target-no-local-mirror`; `probe-output-color.mjs` and `probe-thumb-spotlight.mjs` hard-check that ownership marker. Static renderer audit now checks the source direct-state anchors, rebuild direct writes, and absence of the mirror fields/method. `git diff --check`, `ASTRO_TELEMETRY_DISABLED=1 npm run build`, renderer audit, thumb spotlight probe, desktop and mobile output probes with `PROBE_WAIT=30000`, shader dump, project-media probe, full capture, and band analysis passed. The first desktop output probe hit the existing texture-preload timing guard at 20s; the 30s rerun passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0059` and mobile center `+0.0299`, recorded only as regression evidence. | Low | Keep `SpotLight` position/target/intensity/map owned directly by the Three `SpotLight` and its target object, matching `SD`, `p1`, and `TD`. Continue Phase 1 from actual spotlight/thumb projection content and transfer parity, remaining `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 145 | S1-218 | `Xt/preloadThumbs -> E1.setImage` thumb image lifecycle | Source `Xt` owns `thumbsReady`, `thumbsReadyResolve`, `projectThumbs`, `preloadThumbs()`, and `getProjectThumbById(e)`. Source `Xt.preloadThumbs()` builds `this.projectThumbs.push({ id:t.id, src:this[t.data.thumbnail.type==="mp4"?"loadVideo":"loadImage"](...) })` and resolves `thumbsReady`; source `E1` constructor calls `this.setImage(e)`, and `E1.setImage(e)` awaits `Xt.thumbsReady`, awaits `Xt.getProjectThumbById(e).src`, binds the result to `this.material.uniforms.tMap.value`, and sets `uMapSize` / `uResolution` to `1,1`. | The rebuild now creates source-shaped `sourceProjectThumbs` entries with promise-backed `src`, resolves `sourceThumbsReady`, selects thumb URLs through the same WebP/jpg source asset extension ownership, supports image/video loaders, creates each thumb plane by id, and binds textures through `setSourceThumbImage(id, mesh)` instead of the old direct `payload.thumb` load inside `createWorkScene()`. Runtime probes expose/assert `thumbImageOwnership=source-Xt-preloadThumbs-projectThumbs-thumbsReady-E1-setImage`, `allProjectThumbsUseSourcePromise:true`, project thumb count matching total items, source URL extension/loader state, and per-thumb id/ready/bound/material binding metadata. Static renderer audit checks the source `Xt/E1` lifecycle anchors, the rebuild `sourceProjectThumbs/sourceThumbsReady/preloadSourceThumbsFromCards/getSourceProjectThumbById/setSourceThumbImage` path, and absence of direct `payload.thumb` loading inside `createWorkScene()`. `ASTRO_TELEMETRY_DISABLED=1 npm run build`, `git diff --check`, renderer audit, thumb spotlight probe, desktop output probe rerun with `PROBE_WAIT=30000`, mobile output probe, shader dump, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0046` and mobile center `+0.0306`, recorded only as regression evidence. | Low-medium | Keep thumb images owned by source-shaped `Xt.projectThumbs` promise lifecycle and `E1.setImage()` binding. Continue Phase 1 from actual spotlight/thumb projection content and transfer parity, remaining `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 144 | S1-217 | `h1/u1` environment `customUniforms` ownership | Source `u1` extends `MeshStandardMaterial`, creates `this.customUniforms={...}` in the constructor, and injects individual uniforms into the compiled shader inside `onBeforeCompile` with assignments such as `t.uniforms.uMultiplier=this.customUniforms.uMultiplier` and `t.uniforms.tSky=this.customUniforms.tSky`. Source does not expose a rebuild-style `material.uniforms = uniforms` alias on the `u1` material instance. | The rebuild now removes the non-source `EnvironmentMaterial.uniforms` alias, assigns only `material.customUniforms = uniforms`, and updates all environment animation, update, sky binding, and runtime-probe paths to read/write `environmentMaterial.customUniforms`. Runtime probes now report `customUniformsMode=source-u1-customUniforms-injected-onBeforeCompile-no-material-uniforms-alias` and `hasMaterialUniformsAlias:false`. `probe-output-color.mjs` asserts the no-alias path for both direct environment uniforms and reflection-state material metadata. `audit-renderer-output.mjs` now checks the source `u1` injection anchors and scopes the negative `material.uniforms = uniforms` check to `createEnvironmentMaterial()` so ordinary work-block materials with source-local uniform aliases are not false positives. `ASTRO_TELEMETRY_DISABLED=1 npm run build`, `git diff --check`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. The first concurrent 9s output probes hit the existing texture-preload timing guard; reruns with `PROBE_WAIT=20000` passed for desktop and mobile. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0046` and mobile center `+0.0300`, recorded only as regression evidence. | Low | Keep environment runtime ownership on `customUniforms` plus `onBeforeCompile` injection, without adding a material-level uniforms alias. Continue Phase 1 from spotlight/thumb projection content and transfer parity, remaining `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 143 | S1-216 | `I1` optional `L1` lensflare material ownership | Source `I1.initRenderer()` always creates `renderTargetLensflare=this.renderTargetA.clone()`, but only constructs `this.lensflareMaterial=new L1` inside `this.settings.lensflare.enabled&&(this.lensflareMaterial=new L1,...)`. Source `I1.resize()` and `I1.update()` likewise touch `lensflareMaterial` only behind `settings.lensflare.enabled`, while the default `I1.initSettings()` sets `lensflare.enabled:false`. | The rebuild now keeps `mainLensflareTarget` on the source `I1` clone graph but makes `mainLensflareMaterial` optional and creates it only when `SOURCE_MAIN_LENSFLARE_SETTINGS.enabled` is true. Dispose, resize, render, and runtime probe paths are guarded so the default path reports `enabled:false`, `materialCreated:false`, `materialMode:null`, and `ownership=source-I1-lensflareMaterial-created-only-when-enabled`, while the full-size lensflare target still exists. `probe-output-color.mjs` now asserts that default disabled path instead of requiring an uncreated `L1` shader surface, and `audit-renderer-output.mjs` checks the source optional creation anchor plus absence of the old unconditional constructor call. `ASTRO_TELEMETRY_DISABLED=1 npm run build`, `git diff --check`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. The desktop/mobile output probes confirmed `materialCreated:false` and target sizes `1440x900` / `390x844`. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0044` and mobile center `+0.0313`, recorded only as regression evidence. | Low | Keep `I1` lensflare target allocation and optional `L1` material creation split exactly as source default settings dictate. Continue Phase 1 from spotlight/thumb projection content and transfer parity, remaining `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 142 | S1-215 | `Lu/I1` pass material ownership | Source `Lu.initRenderer()` creates its own `hBlurMaterial=new Na(bf)`, `vBlurMaterial=new Na(Mf)`, `FxaaMaterial=new ig`, `luminosityMaterial=new sg`, `blurMaterials=[new rg(3),new rg(5),new rg(7),new rg(9),new rg(11)]`, and `BloomMaterial=new cg` inside the work render manager before `kA` replaces only the composite material with `OA`. Source `I1.initRenderer()` separately creates its own `hBlurMaterial=new Na(wf)`, `vBlurMaterial=new Na(Tf)`, `FxaaMaterial=new ig`, `luminosityMaterial=new sg`, optional `lensflareMaterial=new L1` behind `settings.lensflare.enabled`, its own `blurMaterials`, and its own `BloomMaterial`. Source does not share the `sg`, `Na`, `ig`, `rg`, or `cg` material instances between `Lu/kA` and `I1`. | The rebuild now splits the old shared/generic pass-material fields into work-owned `workLuminosityMaterial`, `workBlurHorizontalMaterial`, `workBlurVerticalMaterial`, `workFxaaMaterial`, work bloom blur/composite materials, and main-owned `mainLuminosityMaterial`, `mainBlurHorizontalMaterial`, `mainBlurVerticalMaterial`, `mainFxaaMaterial`, `mainBloomBlurMaterials`, and `mainBloomCompositeMaterial`. Work luminosity now renders through `workLuminosityMaterial`, main luminosity/blur/fxaa now render through their main-owned materials, and runtime probes expose/assert `source-Lu-pass-materials-owned-by-work-render-manager`, `source-I1-pass-materials-owned-by-main-render-manager`, and all work/main material sharing flags as false. Static renderer audit now checks source `Lu/I1` owned material construction anchors, rebuild owned fields/constructors, and absence of old shared pass-material fields. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0051` and mobile center `+0.0316`, recorded only as regression evidence. | Low-medium | Keep `Lu/kA` and `I1` pass materials object-owned by their source render managers. Continue Phase 1 from spotlight/thumb projection content and transfer parity, remaining `A1/OA/kA/Lu/I1` transfer/composite evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 141 | S1-214 | `Lu/I1/kA` render target clone graph ownership | Source `Lu.initRenderer()` constructs `renderTargetA=new WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false})`, derives `renderTargetB`, `renderTargetBright`, `renderTargetComposite`, all bloom horizontal/vertical targets, `renderTargetBlurA`, `renderTargetBlurB`, and `renderTargetFXAA` from `renderTargetA.clone()`, then toggles only `renderTargetA.depthBuffer=true` after the clone graph exists. Source `kA` extends `Lu`, keeps that target ownership, and replaces the work composite material with `OA`. Source `I1.initRenderer()` uses the same depthless `renderTargetA.clone()` graph, additionally derives `renderTargetLensflare`, and does not apply the `renderTargetA.depthBuffer=true` toggle. Current bundle evidence maps source `I1.update()` locals as `l=renderTargetComposite`, `h=renderTargetBlurA`, and `f=renderTargetBlurB`; optional blur writes `renderTargetA -> renderTargetBlurA -> renderTargetBlurB`, while `renderTargetComposite` remains reserved for the non-default `renderToScreen:false` composite output branch. | The rebuild now starts `workRawTarget` depthless, derives `workTargetB`, `workCompositeTarget`, work bright/mip/blur/fxaa targets from `workRawTarget.clone()`, and toggles `workRawTarget.depthBuffer=true` only after the clones exist. Main `I1` targets now derive `backgroundTarget`, `compositeTarget`, `mainLensflareTarget`, main bright/mip/blur/fxaa targets from `mainRawTarget.clone()` while leaving `mainRawTarget.depthBuffer=false`. The old shared independent work/main bloom, blur, and fxaa targets were removed, work/main bloom mip arrays now clone from their manager raw target, and the main optional blur pass now follows source `renderTargetA -> renderTargetBlurA -> renderTargetBlurB`. Runtime probes expose/assert `source-Lu-target-state-renderTargetA-depthBuffer-true-derived-clones`, `source-Lu-renderTargetA-clone-graph-depth-toggle-after-clones`, `source-I1-target-state-renderTargetA-depthBuffer-false-derived-clones`, `source-I1-renderTargetA-clone-graph-depthless-raw`, and the source `renderTargetB` unused 1x1 state. Static renderer audit now checks source/rebuild clone graph anchors, absence of old independent targets, and source `I1` optional blur target-A reuse. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0060` and mobile center `+0.0311`, recorded only as regression evidence. | Medium | Keep `Lu/I1/kA` target ownership on the source raw-target clone graph. Continue Phase 1 from spotlight/thumb projection content and transfer parity, remaining `A1/OA/kA/Lu` material/transfer/composite evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 140 | S1-213 | `Lo/H1/O1/x1` derived target clone ownership | Source `Lo.initRenderer()` creates `this.renderTargetA=new WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false})`, then immediately derives `this.renderTargetComposite=this.renderTargetA.clone()`. Source `H1`, `O1`, and `x1` extend `Lo` and only replace `compositeMaterial` with `z1`, `N1`, or `_1`; source `T1.resize()` then resizes the `x1` render manager to `height,height,1`. Source does not create independent thumb `1024x1024` targets and does not manually override thumb render-target texture defaults after construction. | The rebuild now derives `skyCompositeTarget` via `skyRawTarget.clone()`, `displacementTarget` via `displacementRawTarget.clone()`, and `thumbCompositeTarget` via `thumbTarget.clone()`. It also removes the rebuild-only independent `new WebGLRenderTarget(1024,1024,...)` thumb targets and the manual thumb-target `generateMipmaps/minFilter/magFilter/wrapS/wrapT` overrides, leaving Three/WebGLRenderTarget constructor and clone defaults like source. Runtime probes expose/assert raw and composite target construction modes for sky, displacement, and thumb; `probe-output-color` hard-checks sky/displacement `source-Lo-renderTargetComposite-renderTargetA-clone`, and `probe-thumb-spotlight` hard-checks the same ownership for the spotlight thumb map path. Static renderer audit now verifies source `Lo` clone anchors, rebuild clone ownership for all three derived managers, absence of independent thumb 1024 targets, and absence of manual thumb target texture defaults. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0048` and mobile center `+0.0295`, recorded only as regression evidence. | Low-medium | Keep `Lo` derived render managers on source raw-target plus cloned-composite-target ownership. Continue Phase 1 from spotlight/thumb projection content and transfer parity, unresolved `A1/OA/kA/Lu` target/transfer graph evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by expected visual payoff. |
| 139 | S1-212 | `a1/i1` floor reflector target clone ownership | Source `i1 extends rt`, constructs `this.renderTarget=new WebGLRenderTarget(width,height,{depthBuffer:false})`, then immediately assigns `this.renderTargetRead=this.renderTarget.clone()` and `this.renderTargetWrite=this.renderTarget.clone()` before toggling `this.renderTarget.depthBuffer=true`. Source `i1` relies on target constructor/clone defaults and does not manually override reflection target texture `generateMipmaps`, `minFilter`, or `magFilter` after construction. S1-234 later resolves source `rt` to `Object3D`; this row covers the target clone ownership. | The rebuild now constructs the raw reflection target with only `{ depthBuffer:false }`, derives read/write targets via `floorReflectionTarget.clone()`, removes manual texture-default overrides on raw/read/write reflection targets, and keeps the source post-construction raw depth toggle. S1-234 later moved the reflector object identity to `Object3D`. Runtime probes expose/assert read/write clone construction modes, read/write depth staying `false`, raw construction/runtime depth state, existing source blur-swap/render-target-uniform ownership, and now `reflectorType=Object3D`. Static renderer audit now checks source `i1` clone anchors, rebuild clone ownership, and absence of manual reflection target texture default overrides. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0046` and mobile center `+0.0291`, recorded only as regression evidence. | Low-medium | Keep `i1/a1` reflector target construction on source clone ownership and `rt` object identity on `Object3D`. Continue Phase 1 from spotlight/thumb projection content and transfer parity, unresolved `A1/OA/kA/Lu` target/transfer evidence, floor/environment residuals beyond target construction, and interactive mouse/fluid verification; do not rank or reject source mismatches by visual payoff. |
| 138 | S1-211 | `Qe/Xt/p1` WebP-selected texture and cubemap extension ownership | Source `Qe.init()` runs `await k0("lossy").then(()=>{Le.WEBP=!0}).catch(()=>{Le.WEBP=!1})` before initializing texture and scene systems. Source `Xt.preloadTextures()` derives one extension with `const e=Le.WEBP?"webp":"jpg"` and uses it for `floor-normal`, `perlin-1`, and `perlin-2`; source `p1.addEnvironment()` derives the same extension with `Le.WEBP?"webp":"jpg"`, loads `/images/cubemaps/01/[px,nx,ny,py,pz,nz].${e}`, then assigns `this.scene.environment=t`. Source does not hardcode webp or load webp first with a runtime jpg fallback in `p1.addEnvironment()`. | The rebuild now detects lossy WebP support once through a source-shaped cached image probe, stores `sourceWebpSupport`, derives one `sourceAssetExt`, uses that extension for `floor-normal`, `perlin-1`, `perlin-2`, and the six home cubemap faces, and removes the hardcoded `const cubeExt = "webp"` plus unconditional cubemap jpg fallback. Runtime probes expose/assert `sourceWebpDetectionMode`, support/ext consistency, `sceneEnvironmentLoadMode=source-p1-addEnvironment-Le-WEBP-selected-extension-no-runtime-fallback`, cubemap URL extension consistency, and loaded/failed state. Static renderer audit now extracts source `Qe` WebP detection, `Xt.preloadTextures()`, and `p1.addEnvironment()` anchors, and verifies rebuild source-ext ownership plus no hardcoded cubemap webp/fallback bridge. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0045` and mobile center `+0.0299`, recorded only as regression evidence. | Low-medium | Keep `Qe/Xt/p1` asset extension ownership tied to source WebP detection. Continue Phase 1 from spotlight/thumb projection content and transfer parity, unresolved `A1/OA/kA/Lu` target/transfer evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by visual payoff. |
| 137 | S1-210 | `U1/yg/I1/C1` main raw camera and C1 update order | Source `yg` owns the main-scene perspective camera with `distance=1e3`, `fov=Ef(innerWidth,innerWidth/innerHeight,this.distance)`, `new Ya(this.fov,Pe.aspect,1,this.distance*2)`, camera z position at `distance`, and an empty `setCameraController(){}`. Source `U1` then constructs `I1(this.renderer,this.scene,this.camera)` and its update order is `super.update(e,t,n)` first, then `this.renderManager.compositeMaterial.update(e,t,n)`, so `I1` renders the raw/main/composite pass before `C1/A1` receives its per-frame material update. | The rebuild now owns a separate source-shaped `mainCamera` for the source `U1/yg` main raw scene instead of rendering `mainScene` through the home work camera. Resize recomputes `mainCamera.fov` through `sourceYgFov(width,width/height,1000)`, keeps aspect `width/height`, far `2000`, and z position `1000`, and `mainRawTarget` is rendered with `this.mainCamera`. The `C1/A1.uTime` write now happens after `renderHomeCompositePass()`, matching source `U1.update()` where `super.update()` renders `I1` before `C1.update(...)`. Runtime probes expose/assert `mainRawCameraMode=source-yg-perspective-distance-1000-no-camera-controller`, `mainRawRenderCamera=source-U1-I1-renderTargetA-uses-yg-camera`, `mainCompositeUpdateOrder=source-U1-super-update-renders-I1-before-C1-update`, and `preComposite.uTimeUpdateOrder=source-U1-C1-update-after-I1-render`. Static renderer audit now extracts `yg` and `U1` anchors and checks the rebuild camera/render/update-order ownership. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0060` and mobile center `+0.0300`, recorded only as regression evidence. | Low-medium | Keep the source `yg` camera separate from the home work camera and keep `C1/A1` material updates after the source `I1` render pass. Continue Phase 1 from spotlight/thumb projection content and transfer parity, unresolved `A1/OA/kA/Lu` target/transfer evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank or reject source mismatches by visual payoff. |
| 136 | S1-209 | `Lu/I1` remaining screen-pass ownership cleanup | Source `Lu.update()` and `I1.update()` render optional blur, lensflare, luminosity, bloom blur/composite, work/main composite, and FXAA through one fullscreen `screen` mesh by repeatedly assigning `this.screen.material=...` and rendering `this.screen` with `screenCamera`. After earlier screen-swap work, the rebuild production path used `workPostScreen/mainPostScreen` for the central passes, but still kept old dedicated pass scenes and still rendered main optional blur and lensflare through dedicated scene meshes. Those scene objects are a source-structure mismatch even when default blur/lensflare are disabled. | The rebuild now removes the old dedicated pass-scene fields/initializers for work/main composite, pre-composite, bloom/luminosity/fxaa helpers, and main optional blur/lensflare. `renderHomeBlurPass()` now assigns `mainPostScreen.material` to `Na` horizontal/vertical blur materials before rendering, and `renderMainLensflarePass()` assigns `mainPostScreen.material` to `L1` before the source explicit lensflare clear/render. Runtime output probes expose/assert `optionalBlurScreenMode=source-I1-mainPostScreen-material-swap`, `lensflareScreenMode=source-I1-mainPostScreen-material-swap`, and per-material `standardBlur.*.screenMode`/`lensflare.screenMode`. Static renderer audit now checks the source `I1` material-swap anchors, the rebuild `mainPostScreen` blur/lensflare assignments, and `rebuildNoDedicatedPassScenes=true` for the removed scene bridge. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0065` and mobile center `+0.0301`, recorded only as regression evidence. | Low-medium | Keep `Lu/I1` optional helper passes on source single-screen material-swap ownership. Continue Phase 1 from spotlight/thumb projection content and transfer parity, unresolved `A1/OA/kA/Lu` target/transfer evidence, floor/environment residuals, and interactive mouse/fluid verification; prioritize source mismatches rather than visual payoff. |
| 135 | S1-208 | `Lo/H1/O1/x1` single-screen composite ownership | Source `Lo.update()` renders the raw scene into `renderTargetA`, assigns `this.compositeMaterial.uniforms.tScene.value=c.texture`, swaps `this.screen.material=this.compositeMaterial`, and renders that same `screen` through `screenCamera` into `renderTargetComposite` when `renderToScreen=false`. Source subclasses reuse this ownership: `H1 extends Lo` installs `new z1`, `O1 extends Lo` installs `new N1` and resizes the wavves manager to `height/10` with `uRatio=e/t`, and `x1 extends Lo` installs `new _1`. Source `k1` raw displacement scene background is `red`, so `N1/F1.tScene` should read the raw wavves scene target instead of self-binding to the composite output. | The rebuild now gives sky, displacement, and thumb their own `makeSourcePassScreen()` meshes and renders their composites by swapping those screen materials, removing the independent composite scenes that bypassed `Lo` ownership. Displacement is split into `displacementRawScene`/`displacementRawTarget` and `displacementTarget`, with raw scene background set to source red and `N1/F1.tScene` bound to the raw target. Runtime probes expose/assert `source-H1-Lo-single-screen-material-swap`, `source-O1-Lo-single-screen-material-swap`, `source-x1-Lo-single-screen-material-swap`, `screenMode=source-Lo-screen-material-composite`, sky/displacement raw target bindings, and displacement raw/composite target sizes. Renderer audit now extracts `O1` and checks `Lo.update()` plus `H1/O1/x1` subclass ownership. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. A prior project-media run showed a transient `Uncaught (in promise)`, but the final rerun passed with `gc-2026` and `hashgraph-vc` both 5/5 visible and empty exceptions/console messages. Final band deltas were desktop center `+0.0041` and mobile center `+0.0295`, recorded only as regression evidence. | Medium | Keep sky, displacement, and thumb composites on the source `Lo` single-screen material-swap path. Continue Phase 1 from spotlight/thumb projection content and transfer parity, unresolved `A1/OA/kA/Lu` target/transfer graph evidence, floor/environment residuals, and interactive mouse/fluid verification; prioritize source mismatches, not perceived visual payoff. |
| 134 | S1-207 | `Ka/rA/oA` mouse simulation shader surface | Source `Ka` mouse simulation binds fragment `rA` and vertex `oA`. Source `oA` is the modelView/projection vertex with `uniform float uTime`, `vUv = uv`, `modelViewMatrix * vec4(position, 1.0)`, and `projectionMatrix * modelViewPosition`. Source `rA` keeps the noise-driven direction path, commented `lineSegment(...)` helper, commented `blur(...)` helper, inert diffusion placeholders `float br = 1. - + (...)` and `float p2 = (uDiffusion)/4.0`, a commented line-segment brush assignment, and the active `circle(newUv, posOld, th)` brush path. These surfaces are source mismatches even if their immediate visual contribution is small; they should be restored for 1:1 parity, not filtered by visual payoff. | The rebuild now uses a dedicated `mouseSimulationVertex` matching source `oA` instead of the generic background vertex, dumps it as `Ka-mouse-simulation`, and restores the source `rA` shader surface comments/placeholders around the existing active formulas. Runtime probes expose/assert `shaderSurface.mode=source-Ka-rA-oA-shader-surface`, source `oA` vertex mode, source noise path, diffusion placeholders, commented helpers, and circle brush path. Static renderer audit extracts source `rA/oA` and checks rebuild anchors. Shader dump now maps `Ka-mouse-simulation` against source `rA/oA` and records focused `mouseSimulationCoreChecks`; output probe hard-fails on drift. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0048` and mobile center `+0.0304`, recorded only as regression evidence. | Low-medium | Keep `Ka` on source `rA/oA` shader surfaces. Continue Phase 1 from spotlight/thumb projection content/transfer parity, unresolved `A1/OA/kA/Lu` target/transfer graph evidence, floor/environment residuals, and interactive mouse/fluid verification; do not rank remaining source mismatches by expected visual benefit. |
| 133 | S1-206 | `E1/M1/w1` thumb-plane creation and visibility ownership | Source `E1` constructs each thumb as `geometry=new PlaneGeometry(1,1)`, `material=new M1`, `mesh=new Mesh(...)`, and `mesh.scale.set(2,2,2)` without setting `mesh.visible=false`. Source `w1.updateGalleryProgress()` then owns visibility with the x-wrap rule `c<-1.5||c>1.5 ? visible=false : visible=true`. Source `M1` does not specify `blending`, so it keeps Three's default `NormalBlending=1`, while `x1/_1` thumb composite remains `NoBlending=0`. | The rebuild removed the rebuild-only initial `mesh.visible = false` from `createThumbPlane()`, leaving visible ownership to `updateThumbGallery()` and the existing source x-wrap rule. Thumb probe now records/asserts `sourceInitialVisibleMode=source-E1-no-initial-hidden-state-w1-updateGalleryProgress-owns-visible` for every thumb, and asserts `M1` material `blending=1` alongside existing raw GLSL3/tone/depth/uniform checks. Static audit now extracts source `E1`, verifies the source has no initial hidden state, and verifies the rebuild no longer contains that hidden-state bridge. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Thumb probe reports active thumb target/composite luma `0.4226` with one visible thumb under source x-wrap ownership. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0053` and mobile center `+0.0295`, recorded only as regression evidence. | Low-medium | Keep thumb creation on source `E1` no-initial-hidden ownership and let `w1.updateGalleryProgress()` control visibility. Continue Phase 1 from spotlight/thumb projection content/transfer parity, unresolved `A1/OA/kA/Lu` target/transfer graph evidence, floor/environment residuals, and interactive mouse/fluid verification. |
| 132 | S1-205 | `C1/OA/lA/W1` source matrix fullscreen vertex surface | Source `C1/A1` binds `vertexShader:D1`; source `OA/CA`, `lA/Lu`, and `W1/j1` bind `vertexShader:el`. The mirrored `tl`, `D1`, and `el` templates are byte-equivalent matrix fullscreen vertices: they declare `modelMatrix`, `projectionMatrix`, and `viewMatrix`, compute `worldPosition = modelMatrix * vec4(position, 1.0)`, `mvPosition = viewMatrix * worldPosition`, and `gl_Position = projectionMatrix * mvPosition`. Source helper passes such as `sg/rg/cg/Na/L1/FXAA` remain on direct clip-space vertex surfaces and are not part of this change. | The rebuild now routes `A1-pre-composite`, `OA-work-composite`, `Lu-main-composite`, and `j1-media-composite` through `sourceMatrixFullscreenVertex`, an alias to the already source-equivalent `tl` matrix fullscreen vertex. Runtime probes assert `preComposite.vertexMode=source-D1-matrix-fullscreen` and `composite/mainComposite/mediaComposite.vertexMode=source-el-matrix-fullscreen`. Static audit now records source `vertexShader:D1/el` anchors, proves `D1==el`, `tl==D1`, and `tl==el`, and verifies all four rebuild material bindings. Shader dump compares those four material vertices against source `D1/el`; latest dump reports vertex delta `+1` for each, i.e. newline/formatting only, with source anchors matched. Renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Full capture reported no failures/exceptions. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0052` and mobile center `+0.0297`, recorded only as regression evidence. | Low-medium | Keep these four composite materials on source matrix fullscreen vertex surfaces. Do not move `sg/rg/cg/Na/L1/FXAA` to matrix vertices without direct source evidence. Continue Phase 1 from thumb projection content/transfer parity, unresolved `A1/OA/kA/Lu` target/transfer graph evidence, floor/environment residuals, and interactive mouse/fluid verification. |
| 131 | S1-204 | `Xt/TextureLoader` loaded texture sampling defaults | Source `Xt.preloadTextures()` only applies wrap overrides after `TextureLoader` returns textures: `blueNoise.wrapS/T=ci`, `floorNormal.wrapS/T=ci`, `perlin1.wrapS/T=vo`, and `perlin2.wrapS/T=ci`. Source `Xt.loadImage/loadTexture` does not set `minFilter`, `magFilter`, `generateMipmaps`, or `anisotropy`. Local Three r164 defaults are `Texture.minFilter=LinearMipmapLinearFilter`, `Texture.magFilter=LinearFilter`, `Texture.generateMipmaps=true`, `Texture.DEFAULT_ANISOTROPY=1`; `VideoTexture` separately defaults to linear filters and no mipmaps. | The rebuild replaced the loaded-texture `setTextureQuality(...)` override with `applySourceLoadedTextureState(...)`, which only sets `colorSpace` and leaves loaded image/video sampling state to Three defaults. Runtime probes now expose `sourceLoadedTextureMode=source-Xt-TextureLoader-default-sampling-wrap-only-overrides` plus `sourceTextureProbe(...)` state for noise/perlin/floor-normal/thumb map textures, and assert image-loaded textures use `minFilter=1008`, `magFilter=1006`, `generateMipmaps=true`, `anisotropy=1` while preserving source wrap overrides. Static audit records source `Xt` anchors, Three `Texture`/`VideoTexture` defaults, and verifies the helper does not override loaded texture filters/anisotropy. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0049` and mobile center `+0.0294`, recorded only as regression evidence. | Low-medium | Keep source default loaded-texture sampling. Do not reintroduce global `LinearFilter`/anisotropy overrides for loaded images unless a specific source path proves it. Continue Phase 1 from thumb projection content/transfer parity, unresolved `A1/OA/kA/Lu` target/transfer graph evidence, floor/environment residuals, and interactive mouse/fluid verification. |
| 130 | S1-203 | `T1/w1/SD` `SpotLight.map` projection guardrails | Source `w1` extends `Object3D` and sets `frustumCulled=false` in its constructor before adding the thumb scroll group. Source `SD.init()` assigns `J.workScene.spotLight.map=J.workThumbScene.renderManager.renderTargetComposite.texture` and source spotlight setup does not explicitly enable `.castShadow`. Local Three r164 `WebGLLights.js` shows `if ( light.map )` writes `state.spotLightMap[...]`, `shadow.updateMatrices(light)` still updates the matrix used by `shadowmap_vertex`, and `if ( light.castShadow ) numSpotShadowsWithMaps++` only gates the shadow-count branch. Source `VA/HA/zA` keeps the spotlight-map shader path through `shadowmap_pars_vertex`, `shadowmap_vertex`, and `lights_fragment_begin`. | The rebuild now sets `thumbWrap.frustumCulled=false`, exposes/asserts `thumbWrapFrustumCulled=false`, and records spotlight projection metadata as `projectionPath=source-SpotLight.map-without-castShadow`, `shadowPathMode=source-map-projection-not-shadow-cast`, and `castShadow=false`. `scripts/audit-renderer-output.mjs` statically checks source no-explicit-`castShadow`, the Three r164 `WebGLLights.js` map/projection path, and rebuild guard markers. `scripts/dump-va-shader.mjs` now checks source/rebuild spotlight-map vertex and fragment anchors. `git diff --check`, `npm run build`, renderer audit, desktop output probe with `PROBE_WAIT=9000` after one async texture-preload retry, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0042` and mobile center `+0.0313`, recorded only as regression evidence. | Low-medium | Keep the source `SpotLight.map` projection-path guardrails. Continue from actual thumb projection content/transfer parity and unresolved `A1/OA/kA/Lu` target/transfer graph evidence; do not promote shadow-casting or visual spotlight tuning without mirrored-bundle evidence. |
| 129 | S1-202 | `I1/C1` default `renderToScreen` output target | Source `I1.initSettings()` defaults `renderToScreen:true`. In the default branch of source `I1.update()`, the render manager runs the `C1/A1` screen material and then calls `setRenderTarget(null)` followed by `render(this.screen,this.screenCamera)`. Source `renderTargetComposite` exists on `I1`, but the default `renderToScreen` path does not write the `C1/A1` result into `renderTargetComposite` before presenting to the canvas. | The rebuild now removes the extra default-path write of `mainPostScreen` into `compositeTarget` and lets `renderHomeCompositePass()` be the direct screen output path. Runtime metadata now records `preCompositeTargetRole=source-I1-renderTargetComposite-unused-in-default-renderToScreen`, `defaultRenderToScreenWritesCompositeTarget=false`, and `productionOutputChanged=false`. `scripts/probe-output-color.mjs` asserts those runtime fields, while `scripts/audit-renderer-output.mjs` statically checks that the old default composite-target write sequence is absent. `git diff --check`, `npm run build`, renderer audit, desktop/mobile output probes, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0058` and mobile center `+0.0311`, recorded only as regression evidence. | Low-medium | Keep the source default `I1/C1` screen-output path. Continue Phase 1 from source-backed spotlight/thumb projection, unresolved `A1/OA/kA/Lu` target/transfer graph evidence, mobile/fog-bed/floor/environment residuals, and interactive mouse/fluid verification; do not use visual brightness deltas as implementation goals. |
| 128 | S1-201 | `zA` source `SPECULAR` macro and inactive `PHYSICAL` branch | Source `zA` keeps the old physical-material surface `#ifdef PHYSICAL`, `#define IOR`, and `#define SPECULAR`. The source ordinary work material is a `VA`/`MeshStandardMaterial` path, not a `MeshPhysicalMaterial` path; local runtime probes now also prove the active rebuild work material is `MeshStandardMaterial`, `isMeshPhysicalMaterial=false`, and has no `PHYSICAL` define. Therefore the old `SPECULAR` branch is part of the source shader surface but inactive for ordinary `VA-work`; it does not require the temporary `USE_SPECULAR` bridge. | The direct ordinary-work `zA` template now restores source `#define SPECULAR` and `#ifdef SPECULAR`. `scripts/probe-output-color.mjs` hard-checks active material type, standard/physical flags, absence of `PHYSICAL`, and `physicalBranchMode=source-VA-standard-material-PHYSICAL-inactive`. `scripts/dump-va-shader.mjs` now classifies `VA-work` as `source-old-specular-macro-standard-material-physical-branch-inactive`, and `scripts/summarize-phase1-shader-gaps.mjs` reports that restored source macro classification instead of stale `SPECULAR/USE_SPECULAR` bridge wording. `git diff --check`, `npm run build`, renderer audit, desktop/mobile output probes, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0041` and mobile center `+0.0288`, recorded only as regression evidence. | Low-medium | Keep ordinary work on source `SPECULAR` macro plus the runtime `MeshStandardMaterial`/inactive-`PHYSICAL` guardrails. Continue Phase 1 from spotlight/thumb projection, `A1/OA/kA/Lu` target/transfer graph evidence, mobile/fog-bed/floor/environment residuals, and interactive mouse/fluid verification. |
| 127 | S1-200 | `zA` direct work fragment shader template | Source `zA` is a complete ordinary work-block fragment shader surface, not a Three r164 `meshphysical` fragment template with source-absent paths patched and stripped after generation. After S1-197/S1-199 the rebuild still generated the ordinary `VA-work` fragment through the r164 template and then removed paths with strip comments, leaving avoidable generated-surface drift even though include/uniform anchors matched. | The ordinary work `VA` variant now assigns a direct source-shaped `zA` fragment shader template instead of patching and stripping the Three r164 fragment template. The source custom declarations, material surface order, fragment include order, random grid alpha tail, mouse-simulation sampling, reveal/vignette alpha logic, and final source tail are preserved. Auxiliary block fragments keep the safer r164 bridge because they are not ordinary source `VA-work`. Shader dump asserts `noR164StripCommentsInWorkFragment`. The temporary `SPECULAR -> USE_SPECULAR` bridge recorded in this row has been superseded by S1-201, which restores source `SPECULAR` for ordinary work and proves the `PHYSICAL` branch inactive. | Medium | Keep the direct source `zA` work-fragment template. Do not reopen the old `SPECULAR/USE_SPECULAR` bridge for ordinary work; follow S1-201. Phase 1 remains open for source-backed spotlight/thumb projection, `OA/CA/kA/Lu` transfer evidence, mobile/fog-bed residuals, and mouse/fluid verification. |
| 126 | S1-199 | `HA` direct work vertex shader template | Source `HA` is a complete work-block vertex shader surface, not a Three r164 `meshphysical` vertex template with many omitted chunks commented out after patching. After S1-198 the rebuild still generated `VA-work` vertex through the r164 template plus strip comments, leaving avoidable generated-surface drift even though core anchors matched. Runtime bundle evidence still proves the rebuild must retain the `uUvOffset` `vec2` bridge because source `VA.customUniforms.uUvOffset` is constructed from a `Vector2` and `GA` writes only `.x/.y`. | The ordinary work `VA` variant now assigns a direct source-shaped `HA` vertex shader template instead of patching and stripping the Three r164 vertex template. The source formulas, constants, include order, main body, world-position path, varying assignment order, and `uUvOffset` placement are preserved; the only intentional source-text bridge left in the work vertex is `uUvOffset` as `vec2` instead of source text `vec3`. Auxiliary blocks keep the safer r164 bridge because they are not the ordinary source `VA-work` shader. Shader dump now asserts `noR164StripCommentsInWorkVertex`; `VA-work` vertex text delta narrowed from `+275` to `-28`, with the final diff limited to the `uUvOffset` bridge plus whitespace normalization. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0036` and mobile center `+0.0289`, recorded only as regression evidence. | Medium | Keep as source `HA` work-vertex template parity while preserving the documented `uUvOffset` Vector2 technical bridge. `zA` direct fragment template parity is tracked in S1-200; Phase 1 remains open for `SPECULAR`/`USE_SPECULAR` compile bridge review, `OA/CA` transfer evidence, and mobile/fog-bed residuals. |
| 125 | S1-198 | `HA` main varying assignment order | Source `HA` assigns `vUv = uv;` immediately after `void main() {` and before `#include <uv_vertex>`. Source then runs the work-block body, source world-position path, `#include <shadowmap_vertex>`, `#include <fog_vertex>`, and only then assigns `vInstanceIndex`, `vInstanceAlpha`, `vOffset`, `vWorldPosition` under `USE_TRANSMISSION`, `vPosition`, and `vInstanceColor`. Local Three r164's `meshphysical` vertex template also appends its own `USE_TRANSMISSION` `vWorldPosition` tail after fog, so the source-shaped replacement must remove that tail to avoid a duplicate assignment. | The rebuild now moves `vUv = uv;` out of the work-block begin chunk and injects it at the start of `main()`, moves the instance varying assignments out of the begin chunk and into a source-shaped shadowmap/fog chunk, places `vWorldPosition` between `vOffset` and `vPosition`, and strips the r164 transmission tail so `vWorldPosition = worldPosition.xyz` appears exactly once. Shader dump now asserts `sourceUvAssignedBeforeUvChunk`, `sourceInstanceVaryingsAfterFog`, and `singleTransmissionWorldPositionAssignment`; all are source/rebuild true. `VA-work` vertex text delta narrowed from `339` to `275` in the final dump, with no shader console errors. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed across the batch. Final post-cleanup smoke also passed for desktop output and project media. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Final band deltas were desktop center `+0.0044` and mobile center `+0.0308`, recorded only as regression evidence. | Low-medium | Keep as source `HA` main assignment-order parity and guardrail coverage. Phase 1 remains open for source-backed render-target/transfer evidence, mobile/fog-bed residuals, and safe deeper generated-material bridge work. |
| 124 | S1-197 | `VA/HA/zA` declaration and helper surface order | Source `HA` declares the work-block custom attributes, varyings, and uniforms before `#define STANDARD`; `uUvOffset/uUvOffsetScale` sit before reveal uniforms in the source text, while runtime source evidence still proves `uUvOffset` is Vector2 and only `.x/.y` are written. Source `HA` declares `vNoise` with `vViewPosition` after `#define STANDARD`. Source `zA` declares custom varyings/uniforms before `#define STANDARD`, then places `random(...)` and `vignette(...)` after the fragment pars/include surface and before `main()`. | The rebuild now prepends `VA` custom vertex declarations before the Three material header, keeps the source-proven `vec2 uUvOffset` bridge while ordering it before reveal uniforms, inserts `vNoise` next to `vViewPosition`, prepends `zA` custom declarations before `#define STANDARD`, and moves `random(...)` / `vignette(...)` after the source fragment pars surface. Formulas, constants, `uUvOffset` Vector2 bridge, and the r164 `SPECULAR`/`USE_SPECULAR` compile bridge are unchanged. Shader dump now records `vaVertexCoreChecks` and `vaFragmentCoreChecks` and asserts `sourceDeclarationBeforeStandard`, `sourceUvOffsetBeforeRevealUniforms`, `sourceVNoiseAfterViewPosition`, `sourceDeclarationsBeforeStandard`, `sourceHelpersAfterPars`, and `sourceHelpersBeforeMain`; all are source/rebuild true. `VA-work` still has no live include or uniform residuals, with the remaining compile bridge classified as `r164-compile-bridge`. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Desktop center-band delta is `+0.0047`; mobile center-band delta is `+0.0314`, recorded only as regression evidence. | Low-medium | Keep as source `VA/HA/zA` declaration-surface parity and guardrail coverage. Phase 1 remains open for source-backed render-target/transfer evidence, mobile/fog-bed residuals, and any safe deeper generated-material bridge work. |
| 123 | S1-196 | `A1/C1` pre-composite shader declaration surface | Source `A1` places shared color helpers and full blend dispatcher before `luminance(...)` and `coverTexture(...)`, then declares the pre-composite uniforms in source order, and only after `in/out` declares `random(vec2 st)`. The source `coverTexture(...)` helper stores `vec4 color = texture(tex, uv); return color;`. | The rebuild now follows that source `A1` surface order without changing formulas, constants, uniforms, or render-manager inputs: helpers and `coverTexture(...)` come before uniforms, uniforms keep source order, `random(...)` comes after `in/out`, and `coverTexture(...)` carries the source temporary. Runtime probes now expose/assert `helperOrderMode=source-A1-helpers-coverTexture-before-uniforms-random-after-uniforms` and `hasSourceCoverTextureTemporary=true`; shader dump now checks `a1SourceDeclarationOrder` and the cover-texture temporary. `A1-pre-composite` fragment text delta narrowed from `-174` to `-168`, with source/rebuild core anchors matched. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Desktop center-band delta is `+0.0033`; mobile center-band delta is `+0.0299`, recorded only as regression evidence. | Low-medium | Keep as source `A1/C1` surface parity. Phase 1 remains open for source-backed `VA/GA` projection/material evidence, floor/environment distribution, and unresolved `OA/CA/I1` transfer or target interpretation. |
| 122 | S1-195 | `a1/o1/s1` floor material surface and guardrails | Source `s1` declares `tNormalMap` before `uNormalScale`, uses the normal distortion literal `(uNormalDistortionStrength / 2.)`, `theta=max(...,.0)`, and `mix(vec4(0), reflectColor, reflectance)`. Source `o1` constructs a Raw GLSL3 material with explicit `blending: NoBlending`, while inherited material defaults keep `transparent=false`, `depthWrite=true`, `depthTest=true`, and `toneMapped=true`. Source `a1` creates `Tu(60,32)`, rotates the plane `-PI/2`, adds the reflector as a child of the plane, and offsets the containing floor group to `y=-1.65`. | The rebuild now matches the source `s1` normal-map uniform order and literal surface without changing formulas or visual constants. Runtime output probes now expose/assert floor material defaults, `CircleGeometry(60,32)`, `floorGroup -> floorPlane -> reflector` hierarchy, floor group y offset, plane rotation, and matching reflection-state fields on desktop and mobile. Shader residual summaries now include `o1-floor-material` and `t1-floor-reflection-blur`; both report source/rebuild core anchors matched. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Desktop center-band delta is `+0.0051`; mobile center-band delta is `+0.0291`, recorded only as regression evidence. | Low | Keep as source floor-chain surface/guardrail parity. This does not close the visible floor/environment distribution blocker; continue Phase 1 from source-backed `VA/GA` projection/material evidence, environment/floor distribution evidence, and unresolved `OA/CA/I1` transfer or target interpretation. |
| 121 | S1-194 | `x1/M1/N1/ag` GLSL source surface | Source `x1/_1` places the thumb composite `blendMultiply` and `saturation` helper surfaces before `#include <tonemapping_pars_fragment>` and then declares `tScene`, `uDarkenIntensity`, `uDarkenColor`, and `uSaturation`. Source `M1/S1` places `coverTexture(...)` before uniforms and keeps the `transition (...)` source surface. Source `N1/F1` places `vignette(...)` before tonemapping pars, declares uniforms as `tScene`, `uTime`, `uRatio`, keeps `vignout/vignin/vignfade` globals with source comments, and uses source literal surfaces such as `.5`, `5.`, `.4`, and `1.`. Source `ag` helpers (`Co/VT/Sf/XT/$T/WT/YT/ZT`) all carry `#define GLSLIFY 1`; source `Co` declares `px` and `bounds`, source `GT` includes `px` in its shared advection uniforms, and source `Sf` uses `spot_new`, `vel_old`, `spot_old`, `vel_new1`, `spot_new2`, `spot_new3`, `vel_2`, `spot_old2`, and `newVel2`. | The rebuild now aligns those shader surfaces without changing formulas or visual constants: thumb composite helper order, thumb plane declaration order, displacement helper/uniform/global/literal surface, and main-fluid GLSLIFY/source variable naming are source-shaped. `GT` advection uniforms now include source `px`, and runtime output asserts both `px` and `bounds` on the advection material. Shader dump now includes focused `mainFluidCoreChecks` and `displacementCoreChecks`; the residual summary reports `N1-displacement-composite`, `x1-thumb-composite`, `M1-thumb-plane`, and all `ag-*` helpers with source/rebuild anchors matched. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Desktop center-band delta is `+0.0042`; mobile center-band delta is `+0.0302`, recorded only as regression evidence. | Low-medium | Keep as source GLSL-surface parity. Continue Phase 1 from source-backed `VA/GA` projection/material evidence, floor/environment distribution, and unresolved `OA/CA/I1` transfer or target interpretation; do not rank work by visual payoff. |
| 120 | S1-193 | `tA/lg/cg/s1/nA` shared dither and bloom-composite define surface | Source `tA` defines `random(vec2 co)` through local `a/b/c/dt/sn` variables with `sn = mod(dt, 3.14)`, source `lg` wraps that helper into `dither(vec3 color)`, and source `s1` floor plus `nA` bloom composite both inject `${lg}`. Source `cg` is constructed as `constructor({dithering:e}={})` and passes `defines:{NUM_MIPS:5,DITHERING:e}`, so the default path keeps the `DITHERING` define key present with `undefined` value; Three r164 emits that as `#define DITHERING undefined`. | The rebuild now uses the source `tA/lg` dither random formula in the shared helper and applies source `cg` define ownership to both work and main bloom composite materials with `DITHERING: undefined`. Runtime probes expose/assert `ditheringDefinePresent=true`, JSON value `null`, string value `"undefined"`, and `ditheringDefineMode=source-cg-defines-DITHERING-undefined`. Shader dump now hard-checks the source dither random formula, and renderer audit extracts source `tA`, `lg`, `s1`, and `cg` anchors instead of treating missing template expansion as a source miss. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Desktop center-band delta is `+0.0049`; mobile center-band delta is `+0.0305`, recorded as regression evidence only. | Low-medium | Keep as source shader-surface parity. Continue from remaining source-backed `VA/GA` projection/material evidence, floor/environment distribution, and unresolved `OA/CA/I1` transfer or target interpretation; do not rank work by visual payoff. |
| 119 | S1-192 | `I1/C1` main optional pass input/order | Source `I1.update(e,t,n,i)` renders the main scene into `renderTargetA`, then runs optional blur from `renderTargetA`, optional lensflare from `renderTargetBlurB` when blur is enabled or `renderTargetA` otherwise, optional luminosity from the same blur/raw source, optional bloom from `renderTargetBright` when luminosity is enabled or `renderTargetA` otherwise, then fluid, then binds `C1/A1.tScene` to `renderTargetBlurB` when blur is enabled or `renderTargetA` otherwise and renders `C1` directly to screen by default. The source does not run a second main bloom pass after `C1`, and does not use the work composite target as the main bloom source. | The rebuild now follows that source input/order chain: main blur reads `mainRawTarget`, lensflare/luminosity/bloom are scheduled before `C1`, main bloom receives `mainRawTarget` with optional bright target ownership, `C1/A1.tScene` reads blur/raw main source, and the final screen render keeps `C1/A1` as the production material with only the source FXAA tail behind the source flag. Removed the rebuild-only pre-`C1` main bloom from `preCompositeWorkTarget` and the post-`C1` bloom/lensflare pass from `compositeTarget`. Runtime probes now assert `renderManagerPassInputs`, `noPostC1Bloom=true`, `defaultScreenMaterialMode=source-I1-default-direct-C1-screen-render-fxaa-tail-only`, and the expanded main update order `raw -> optional blur -> optional lensflare -> optional luminosity -> optional bloom -> fluid -> C1`. Renderer audit records the corresponding source/rebuild pass-input anchors. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Desktop/mobile output probes report no failures/exceptions and the source pass order. Project media retained five visible tracks on both `gc-2026` and `hashgraph-vc`. Desktop center-band delta is `+0.0034`; mobile center-band delta is `+0.0298`, recorded as regression evidence only. | Medium | Keep as source `I1/C1` pass-input/order parity. Continue from remaining source-backed `VA/GA` projection/material evidence, floor/environment distribution, and unresolved final transfer/target interpretation; do not use visual brightness deltas as implementation goals. |
| 118 | S1-191 | `GA.update` per-item local simulation/writeback order | Source `GA.update(e,t,n,i)` runs the whole item update in one method: `material.update(e,t,n,i)` writes `VA` time/coords, then `mouseSim.update(e,t,n,i)`, then local `tMouseSim` is rebound from `mouseSim.bufferSim.output.texture`, `mouseSpeed` is damped with `Yi(...,10,t)`, `uMouseSpeed` is written, `planeMaterial.uniforms.uTime.value=e`, and `tDisplacement` is rebound from `J.wavvesScene.renderManager.renderTargetComposite.texture`. Source `p1.update()` then writes visibility, side reveal, side spread, and `tMouseSim2`. | The rebuild now performs the source `GA.update` writeback chain per visible work item inside the item update instead of splitting local mouse simulation and uniform sync into separate global helper passes. For each visible item it writes `uTime/uCoords`, runs the local `Ka` brush, rebinds local `tMouseSim`, damps and writes `uMouseSpeed`, updates the source mouse-plane time, and rebinds displacement before applying source `p1.update` side reveal and screen `tMouseSim2`. Removed the unused split `updateWorkMouseSimulation()` and `syncWorkMouseSimulationUniforms()` helpers. Runtime probes assert `sourceGAUpdateMode=source-GA-update-material-then-local-Ka-then-bindings-before-p1-side-reveal`, `uCoordsMatchesWorkTarget`, `mousePlaneTimeMatchesMaterialTime`, `tDisplacementIsWavves`, and `uMouseSpeedMatchesLocal`. Renderer audit records source `GA.update` anchors, rebuild update checks, and `rebuildNoSplitLocalMouseUpdate=true`. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Desktop/mobile probes report no failures/exceptions and the source `GA.update` mode. Desktop center-band delta is `+0.0030`; mobile center-band delta is `+0.0296`, recorded as regression evidence only. | Medium | Keep as source `GA.update` per-item sequencing parity. Continue from remaining source-backed `VA/GA` projection/material evidence, floor/environment distribution, and unresolved `OA/CA/I1` transfer or target interpretation. |
| 117 | S1-190 | `Pe/Ka/GA` mousemove event timing and normalization | Source `Pe.addListeners()` registers `window` `mousemove` only, stores `mouse.x/y`, computes `mouse.normalized` from `Pe.w/Pe.h`, and emits `xe.MOUSE_MOVE`. Source `Ka.addEvents()` listens to that event; source `Ka.onMouseMove({x,y})` immediately calls `raycast({x,y})` in mesh mode, while `Ka.update()` only lerps toward the stored `targetPos` and renders the simulation buffer. | The rebuild now listens to `mousemove` instead of pointer down/move/up, derives pointer/raycast/screen mouse coordinates from the `.gl` root size, calls per-item `updatePointerProjection()` inside the mouse event handler, and removes the rebuild-only RAF-tail raycast call from `updateWorkSceneForNextFrame()`. Runtime probes assert `mouseEventMode=source-Pe-window-mousemove-only`, `mouseNormalizationMode=source-Pe-gl-root-width-height`, `raycastMode=source-Ka-onMouseMove-per-item-raycast-immediate-pointer`, `raycastEventMode=source-Ka-raycast-during-mousemove-not-raf-tail`, and `raycastNormalizationMode=source-Pe-width-height`. Renderer audit records source `Pe`/`Ka` anchors and rebuild checks, including `rebuildNoRafRaycast=true`. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Desktop/mobile output probes report no failures/exceptions and source mouse/raycast modes. Project pages retained visible media. Desktop center-band delta is `+0.0036`; mobile center-band delta is `+0.0299`, recorded as regression evidence only. | Low-medium | Keep as source `Pe -> Ka -> GA` mouse event/raycast timing parity. Continue from remaining source-backed `VA/GA` projection/material evidence, floor/environment distribution, and unresolved `OA/CA/I1` transfer or target interpretation. |
| 116 | S1-189 | `GA/Ka` per-item raycast ownership | Source `GA` constructs one `Ka` per work block with `camera`, `mesh:this.plane`, and `rayCastMesh:this.rayPlane`. Source `Ka.onMouseMove({x,y})` uses immediate pointer pixels in mesh mode, converts them to NDC with `x / Pe.w * 2 - 1` and `-(y / Pe.h) * 2 + 1`, calls `raycaster.setFromCamera(this.mouse,this.camera)`, intersects only `[this.rayCastMesh]`, and writes that instance's `targetPos.x/y` from the hit UV. | The rebuild now keeps a separate immediate `pointerRay` NDC value, runs `raycaster.setFromCamera(pointerRay, homeCamera)`, and raycasts each visible work item's own `rayPlane` independently instead of using the smoothed pointer to find one global hit. Runtime probe output records/asserts `raycastMode=source-Ka-per-item-raycast-immediate-pointer`, pointer vs smoothed pointer state, visible work item count, independent visible targets, and per-item ray-plane parent/visibility state. Renderer audit now records source `Ka` raycast anchors and rebuild raycast checks. `git diff --check`, `npm run build`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed before this documentation update. Desktop center-band delta is `+0.0044`; mobile center-band delta is `+0.0299`, recorded as regression evidence only, not an implementation target. | Low-medium | Keep as source `GA/Ka` input/raycast ownership parity. Continue from remaining source-backed `VA/GA` projection/material evidence, floor/environment distribution, and unresolved `OA/CA/I1` transfer or target interpretation. |
| 115 | S1-188 | `nD/Iu/Lu/I1/Lo` source update and render-manager sequencing | Source `nD.update()` loops scenes in registration order `sky`, `media`, `work`, `main`, `workthumb`, `wavves`, `character`. Source `Iu.update()` runs `renderManager.update(...)`, then camera-controller update, then component updates. Source `Lu.update()` renders raw scene, optional blur/luminosity/bloom, then `Ka` mouse simulation, then the composite screen. Source main `I1.update()` runs optional bloom before fluid and final `C1` screen output. Source `V1` and `k1` update composite `uTime` after their `Lo` render-manager update. | The rebuild now follows the source frame chain: media positioning, `sky`, `media`, work raw/bloom/mouse-sim/composite, `p1` post-render update, main raw/optional bloom/fluid/pre-composite/final screen, `workthumb`, `wavves`, and character when about is visible. Screen mouse simulation moved to the source `Lu` slot after work raw/bloom and before `OA` composite; `p1` camera/components now update before main; media renders before work/main; main fluid updates after optional main bloom and before `C1`; sky and displacement `uTime` writes now happen after their render-manager pass. Output probes strictly assert `rebuildSceneOrder`, `rebuildFrameOrder`, `workUpdateOrder`, `mainUpdateOrder`, and `mouseSimulationOrder`; renderer audit records source and rebuild order anchors. `npm run build`, `git diff --check`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Desktop/mobile probes report the source-shaped scene/order boards, `targetXY=[1,.5]`, no failures/exceptions, active thumb map present, and project media retained five visible tracks. Desktop center-band delta is `+0.0046`; mobile center-band delta is `+0.0302`, so Phase 1 remains open. | Medium | Keep as source update-order/render-manager sequencing parity. Continue from remaining source-backed `VA/GA` projection/material evidence, floor/environment distribution, and unresolved `OA/CA/I1` transfer or target interpretation; do not use visual brightness deltas as implementation goals. |
| 114 | S1-187 | `nD/Xt` texture preload and canvas animate-in lifecycle | Source `Xt.init()` creates the texture loader and preloads `blueNoise`, `floorNormal`, `perlin1`, and `perlin2`; source `nD.animateIn()` waits for `initPromise` and then awaits all four texture promises before starting the canvas opacity fade. The home gallery entry remains a separate `yD/SD` flow, so the texture/canvas gate should not delay `targetXY=(1,.5)` or the gallery-in event. | The rebuild now owns a source-shaped preload promise for the four `Xt` textures, records per-texture completion, and exposes `animateIn()` on `WebGLBackdrop` to await those textures before scheduling the 0.5s canvas fade. Main page entry now calls `webgl.animateIn()` separately from the home gallery entry, preserving the existing source `IT` entry settings. Runtime probes assert `animateInMode=source-nD-animateIn-awaits-init-and-four-preloaded-textures`, `animateInResolvedMode=source-nD-animateIn-resolves-after-fade-scheduled`, all four texture states, and completion of the resource gate; renderer audit records source and rebuild anchors. `npm run build`, `git diff --check`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Desktop/mobile probes report all four preload states true, `targetXY=[1,.5]`, `rotateAngle=20`, and no failures/exceptions. Project media retained visible tracks. Desktop center-band delta is `+0.0045`; mobile center-band delta is `+0.0285`, so Phase 1 remains open. | Low-medium | Keep as source `nD/Xt` lifecycle parity. Continue Phase 1 from remaining source-backed render-manager graph parity, floor/environment distribution, strict `VA/GA` projection/material feel, and `OA/CA/Lu` transfer evidence. |
| 113 | S1-186 | `IT/p1` camera-controller guardrails | Source `IT` initializes mouse/last at `documentElement` center, owns `group -> rotateGroup -> innerGroup` with manual matrices, starts `targetXY=(1,.5)` and `rotateAngle=20`, computes lerp as `Math.min(Fn(2/(fps/60),0),2)*.01`, couples camera z to `targetXY.y*(mouseY*1.25)`, and decomposes `innerGroup.matrixWorld` into the camera. Source `p1.resize()` keeps the mobile branch at camera origin z `5` and `sceneWrap.position.y=.3`; source `yD/SD` entry applies `targetXY=(1,.5)` and `rotateAngle=20`. | Production rendering is unchanged. Runtime output now exposes/asserts the source `IT` camera-controller mode, mouse-center ownership, entry settings, lerp mode, target z coupling, three-group matrix path, latest lerp, pointer pixels, controller target/position, and rotate-group state. Renderer audit now records the source `IT` anchors alongside existing `p1.resize`, `p1.setCameraControllerSettings`, `Iu.update`, and `yD.animateIn` evidence. `npm run build`, `git diff --check`, renderer audit, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Desktop/mobile probes report `targetXY=[1,.5]`, `rotateAngle=20`, `lastLerp=.02`, and no failures/exceptions. Project media retained visible tracks. Desktop center-band delta is `+0.0041`; mobile center-band delta is `+0.0286`, so Phase 1 remains open. | Low | Keep as source `IT/p1` camera-chain guardrail. Continue from source-backed parity work in reflected scene content/camera visibility, mobile fog-bed distribution, strict `VA/GA` projection/material feel, and `OA/CA/Lu` transfer evidence. |
| 112 | S1-185 | `sA/Ka` mouse simulation target state and update semantics | Source `sA` constructs its ping-pong FBO with clamp wrapping, linear filters, `RGBAFormat`, `FloatType`, `stencilBuffer:false`, `depthBuffer:false`, and `generateMipmaps=false`. Source `rA` writes `gl_FragColor = vec4(col)`, preserving the accumulated alpha from the input texture rather than forcing alpha to `1.0`. Source `Ka.update()` calls `this.newPos.lerp(this.targetPos,t*7.5)` without a rebuild-side clamp before computing speed and rendering the buffer. | The rebuild now constructs screen and local mouse simulation targets with the source FBO state, preserves the source `vec4(col)` output surface in `mouseSimulationFragment`, and removes the rebuild-only clamp from the local/screen mouse brush lerp factor. Runtime probes expose/assert target state for screen and active local simulations and record `updateLerpMode=source-Ka-newPos-lerp-targetPos-delta-times-7_5-no-clamp`. `npm run build`, `git diff --check`, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, renderer audit, full capture, and band analysis passed. Desktop/mobile probes report active local target type `FloatType(1015)`, format `RGBAFormat(1023)`, target/`uCoords` `45.5x29.9`, and no failures/exceptions. Project capture and project media retained visible canvas/media. Desktop center-band delta is `+0.0048`; mobile center-band delta is `+0.0288`, so Phase 1 remains open. | Low-medium | Keep as source `sA/Ka` target/update parity. Continue from remaining source-backed mouse coordinate/timing evidence, strict `VA/GA` projection/material feel, reflected scene content/camera visibility, and mobile fog-bed distribution. |
| 111 | S1-184 | `GA/Ka` local mouse simulation target sizing | Source `GA.resize(e,t,n)` calls `this.mouseSim.onResize(this.plane.scale.x,this.plane.scale.y)`, and source `Ka.onResize(e,t)` passes those same values into the ping-pong buffer and `simulationMaterial.uniforms.uCoords`. Source `GA.createPlane()` sets the work block plane to `35*1.3` by `23*1.3`, so the local mouse simulation size is `45.5x29.9` without rebuild-side integer pre-rounding. | The rebuild now passes each work item's raw `mousePlane.scale.x/y` into local mouse simulation render targets and `uCoords`, and runtime output asserts `targetSizingMode=source-GA-resize-plane-scale-no-pre-rounding`. `npm run build`, `git diff --check`, desktop output probe, mobile output probe, shader dump, thumb spotlight probe, project-media probe, renderer audit, full capture, and band analysis passed. Desktop and mobile probes report the active local mouse simulation target and `uCoords` as `45.5x29.900000000000002` with no failures/exceptions. Project pages retained visible media targets. Desktop center-band delta is `+0.0052`; mobile center-band delta is `+0.0290`, so Phase 1 remains open. | Low-medium | Keep as source `GA/Ka` target-state parity. Continue from source-backed local mouse coordinate/update semantics, strict `VA/GA` projection/material feel, reflected scene content/camera visibility, and mobile fog-bed distribution; do not treat this as a visual closeout. |
| 110 | S1-183 | `i1` reflector target sizing | Source `i1.setSize(e,t,n)` assigns reflection target sizes as `e * .75` and `t * .75` directly, while keeping `t1/QA.uResolution` at the full CSS render size. The rebuild had preserved the `0.75` scale but rounded the reflection target dimensions before `WebGLRenderTarget.setSize()`, which changed non-integer mobile target state such as `390 * .75 = 292.5`. | The rebuild now passes the unrounded source `width * 0.75` / `height * 0.75` values to raw/read/write floor-reflection targets and updates the output probe to assert source CSS sizing without the rebuild-only pre-rounding. `npm run build`, `git diff --check`, renderer audit, shader dump, desktop output probe, mobile output probe, thumb spotlight probe, project-media probe, full capture, and band analysis passed. The mobile probe now reports floor reflection targets at `292.5x633`, matching source `i1.setSize()` semantics. Project pages retained visible media targets and no runtime failures. Desktop center-band delta is `+0.0036`; mobile center-band delta is `+0.0287`, so Phase 1 remains open. | Low-medium | Keep as source reflector target-state parity. Continue from reflected scene content/camera visibility, mobile fog-bed distribution, and strict `VA/GA` projection/material feel; do not treat this as a visual closeout. |
| 109 | S1-182 | `Ka/sA/GA` mouse simulation uniform surface guardrails | Source `Ka` constructs a `simulationMaterial` with `uTexture`, `uNoiseTexture`, `uCoords`, `uPersistance`, `uThickness`, `uDiffusion`, `uDiffusionSize`, `uTime`, `uPosOld`, `uPosNew`, `uSpeed`, and `uColor`, with default `diffusion=0`, `diffusionSize=0`, and white brush color. The rebuild already used the matching shader/uniform path, but runtime probes did not lock the full source uniform surface for both screen and local `GA` mouse simulations. | Production rendering is unchanged. Runtime output now exposes/asserts `uniformSurfaceMode=source-Ka-simulationMaterial-uniform-surface`, blue-noise binding, `diffusion=0`, `diffusionSize=0`, and white `uColor` for both screen and active local mouse simulation paths. `npm run build`, `git diff --check`, shader dump, desktop output probe, mobile output probe, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta is `+0.0046`; mobile center-band delta is `+0.0291`, so Phase 1 remains open. | Low | Keep as interaction/mouse-simulation guardrail. Continue from source-backed parity work in `VA/GA` projection/material feel, thumb-map transfer/content, floor/environment distribution, or `OA/CA` transfer evidence. |
| 108 | S1-181 | `I1` default screen-output guardrail | Source `I1.initSettings()` defaults `renderToScreen=true` while main bloom/luminosity/blur/fxaa are disabled, and source `I1.update()` sets `this.screen.material=this.compositeMaterial` then renders directly to `setRenderTarget(null)` in that default branch. The rebuild still keeps `renderTargetComposite` populated as a QA/probe mirror, which should not be mistaken for the default production screen-output path. | Production rendering is unchanged. Runtime output now exposes/asserts `defaultScreenMaterialMode=source-I1-default-direct-C1-screen-render` and `preCompositeTargetRole=qa-mirror-of-source-renderTargetComposite-not-default-screen-output` under main render-manager ownership, so future work does not reintroduce a non-source extra main composite pass or misclassify the probe mirror as the source final output. `npm run build`, `git diff --check`, renderer audit, shader dump, desktop output probe, mobile output probe, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta is `+0.0055`; mobile center-band delta is `+0.0289`, so Phase 1 remains open. | Low | Keep as render-manager attribution/guardrail. Continue from source-backed `I1/OA/kA` transfer evidence, mobile background/floor distribution, and strict `VA/GA` projection/material feel. |
| 107 | S1-180 | `U1/I1` main raw scene background ownership | Source `U1.init()` calls `this.scene.background = new Color("#D9D9D9").convertLinearToSRGB()` before `I1.update()` renders that main scene into `renderTargetA`. After S1-179, the rebuild had the separate `mainRawTarget`, but it still rendered the rebuild-only procedural `backgroundScene` shader into that raw target instead of the source empty main scene/background. | The rebuild now owns a dedicated `mainScene` with source `#D9D9D9` linear-to-sRGB background and renders it into `mainRawTarget` before `C1/A1.tScene` binding. Output probe exposes/asserts `mainRawSceneMode=source-U1-empty-main-scene-background-D9D9D9-linear-to-srgb` and the converted background RGB values. `npm run build`, `git diff --check`, shader dump, desktop output probe, mobile output probe, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta is `+0.0045`; mobile center-band delta is `+0.0293`, so Phase 1 remains open. | Medium | Keep as source main-scene ownership parity, not a visual closeout. Continue from remaining `I1/OA/kA` render-order and transfer evidence, mobile background/floor distribution, and strict `VA/GA` projection/material feel. |
| 106 | S1-179 | `I1/C1` main raw/composite target split | Source `I1.update()` first renders the main scene into `renderTargetA`, then binds `C1/A1.tScene` to that raw target texture, and finally renders the pre-composite screen into the separate `renderTargetComposite`. Source construction also clones `renderTargetComposite` from `renderTargetA`, so the raw scene target and composite output are distinct objects. The rebuild previously used `compositeTarget` as both the raw `tScene` source and the pre-composite output, creating a source-incorrect self-binding/read-write target shape. | The rebuild now owns a separate `mainRawTarget` for source `I1.renderTargetA`; `C1/A1.tScene` is initialized and updated from `mainRawTarget.texture`, while `compositeTarget` remains the pre-composite output. Runtime probes expose/assert `tSceneSourceMode=source-I1-renderTargetA-raw-main-scene`, `tSceneIsMainRawTarget=true`, and `tSceneIsCompositeTarget=false`, and output target probes now include both `mainRaw` and `preComposite`. `npm run build`, `git diff --check`, shader dump, desktop output probe, mobile output probe, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta is `+0.0044`; mobile center-band delta is `+0.0282`, so Phase 1 remains open. | Medium-high | Keep as source render-manager graph parity, not a visual closeout. Continue from remaining `I1/OA/kA` render-order and transfer evidence, real mobile background/floor distribution, and strict `VA/GA` projection/material feel. |
| 105 | S1-178 | `a1/o1` floor dither helper surface | Source floor fragment `s1` injects shared `${lg}` at the top of the shader, so the `random(vec2 co)` and `dither(vec3 color)` helper surfaces exist even when source `a1` constructs `o1` without `dithering:true` and the `DITHERING` branch is inactive. The rebuild had the active floor formula, normal-distorted reflection, Fresnel, and branch shape, but omitted the inert source dither helper surface from `floorFragment`. | Production formulas, floor constants, target sizes, material flags, and active branches are unchanged. The rebuild now shares a source-shaped `sourceDitherHelper` between bloom composite and `o1-floor-material`; shader dump now hard-checks `sourceDitherRandomHelper` and `sourceDitherHelper`, with source/rebuild true. `npm run build`, `git diff --check`, renderer audit, desktop output probe with isolated CDP port/wait, mobile output probe with isolated CDP port/wait, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta is `+0.0044`; mobile center-band delta is `+0.0281`, so Phase 1 remains open. | Low | Keep as source floor shader-surface parity, not visual closeout. Continue from real mobile background/floor distribution, remaining environment/sky target attribution, strict `VA/GA` bridge depth, and source-backed `OA/CA/Lu` graph evidence. |
| 104 | S1-177 | `T1/w1/E1` thumb hierarchy and scrollWrap ownership | Source `T1.init()` adds a `w1` group to the thumb scene; source `w1` owns a separate `scrollWrap` group and adds every `E1.mesh` to that `scrollWrap`. The rebuild had the same x-wrap math and mesh state but flattened the hierarchy by adding thumb planes directly under the thumb scene group, leaving the source `T1 -> w1 -> scrollWrap -> E1.mesh` ownership unguarded. | Production formulas, target sizes, materials, and visual constants are unchanged. The rebuild now has a `thumbScrollWrap` child under `thumbWrap`, and all thumb planes are added to `thumbScrollWrap`, matching the source hierarchy. Thumb probe now exposes/asserts `thumbHierarchyMode=source-T1-w1-scrollWrap-E1-mesh`, `thumbWrapParentIsScene=true`, and `thumbScrollWrapParentIsThumbWrap=true`. `npm run build`, `git diff --check`, renderer audit, desktop output probe, mobile output probe after one transient retry, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. `x1-thumb-composite` remains source anchors matched with fragment delta `-5`. Desktop center-band delta is `+0.0051`; mobile center-band delta is `+0.0275`, so Phase 1 remains open. | Low | Keep as source thumb-chain structure parity and regression guardrail. Continue Phase 1 from actual thumb-map transfer/content feel, mobile background/floor distribution, remaining ordinary `VA/zA` bridge depth, and source-backed `OA/CA/Lu` graph evidence. |
| 103 | S1-176 | `T1/x1` thumb composite helper surface | Source `_1/x1/v1` injects the shared multiply helper `${hg}` and saturation helper `${Ur}` before sampling `tScene`; `hg` defines both `blendMultiply(base, blend)` and the opacity overload, while `Ur` defines `saturation(vec3 rgb, float adjustment)` with the source `W` luminance vector. The rebuild still used local simplified `float gray = dot(...)` saturation and inline multiply-opacity helper bodies inside `thumbCompositeFragment`. | Production formulas and constants are unchanged. `thumbCompositeFragment` now injects source-shaped `sourceBlendMultiplyHelper` and `sourceSaturationHelper`; `sourceCompositeColorHelper` reuses that same saturation helper so `A1/CA/x1` share the source `Ur` surface. Shader dump now hard-checks `sourceThumbBlendMultiplyHelper`, `sourceThumbBlendMultiplyOpacityHelper`, `sourceThumbSaturationHelper`, `noThumbLocalGraySaturationBridge`, and `noThumbInlineMultiplyOpacityBridge`; source/rebuild are true. `x1-thumb-composite` fragment delta is now `-5`. `npm run build`, `git diff --check`, renderer audit, desktop output probe, mobile output probe after one transient retry, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta is `+0.0028`; mobile center-band delta is `+0.0293`, so Phase 1 remains open. | Low-medium | Keep as source `v1` helper-surface parity, not visual closeout. Continue from actual thumb-map transfer/content feel, mobile background/floor distribution, remaining ordinary `VA/zA` bridge depth, and source-backed `OA/CA/Lu` graph evidence. |
| 102 | S1-175 | `VA/HA` ordinary work vertex begin surface | Source `HA` keeps the standard `#include <begin_vertex>` chunk before the custom work-cube transform and declares the ordinary work vertex attributes/uniforms in the source order. The rebuild had expanded the begin chunk into a local `vec3 transformed = vec3(position);`, which was formula-equivalent but left a source-only `begin_vertex` include in the generated `VA-work` vertex residual. | Production formulas and constants are unchanged. `workBlockBeginVertexChunk` now preserves source `#include <begin_vertex>` before the source custom transform, and `workBlockVertexPars` declaration order is closer to source `HA` while keeping the existing `uUvOffset` vec2 bridge. Shader dump now checks the `sourceBeginVertexInclude` core anchor. `VA-work` vertex include residuals are now empty in the generated summary; vertex text delta is `270`, with remaining differences mostly ordering/comments and the existing r164 bridge. `npm run build`, `git diff --check`, renderer audit, desktop/mobile output probes, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta is `+0.0056`; mobile center-band delta is `+0.0283`, so Phase 1 remains open. | Low-medium | Keep as source `HA` vertex-surface parity. Continue Phase 1 from remaining ordinary `VA/zA` bridge depth, thumb-map transfer/content feel, and mobile background/floor distribution. |
| 101 | S1-174 | `p1/h1/u1` environment constructor and light ownership guardrails | Source `h1.initMesh()` constructs the work environment as `new u1({side:BackSide, envMapIntensity:Qn.ENVMAP_INTENSITY, fog:false})` and does not pass the nearby `Qn.ROUGHNESS_INTENSITY`, `Qn.METALNESS_INTENSITY`, or `Qn.EMISSIVE_INTENSITY` constants into the `MeshStandardMaterial` constructor. Source `p1.setLights()` creates `directionalLight2` and positions it, but only adds `directionalLight` to the scene. | Production rendering is unchanged. Runtime output now exposes/asserts `constructorParamsMode=source-h1-passes-side-envMapIntensity-fog-only`, default MeshStandard environment values (`roughness=1`, `metalness=0`, `emissiveIntensity=1`), and `source-p1-adds-ambient-spot-target-directionalLight-only` light ownership with `directionalLight2InScene=false`. Renderer audit now records the source `p1.setLights()` direction-light ownership anchors and the `u1/Qn/h1` constructor evidence so future work does not promote unused `Qn` constants or the second direction light as visual fixes. `npm run build`, `git diff --check`, renderer audit, desktop/mobile output probes, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta is `+0.0042`; mobile center-band delta is `+0.0295`, so Phase 1 remains open for actual mobile background/floor distribution, thumb-map transfer/content feel, and remaining `VA/GA` bridge depth. | Low | Keep as source guardrail and negative-evidence attribution. Continue Phase 1 from source-backed differences that can affect the mobile residual: environment/floor distribution, mobile scene/camera geometry, thumb projection/content transfer, and remaining ordinary `VA/GA` bridge depth. |
| 100 | S1-173 | `p1` mobile spotlight guardrail and mobile attribution probes | Source `p1.update()` applies the mobile spotlight branch as `spotLight.position.y=.3+camera.position.y*.175` below `Le.BREAKPOINTS.MD`, while desktop uses `camera.position.y*.175`. Previous output probe asserted the desktop `(0,0,3.7)` spotlight position for mobile too, blocking direct mobile output attribution. | Production rendering is unchanged. `probe-output-color.mjs` now asserts the source mobile spotlight y offset (`0.3`) together with the existing mobile camera origin/sceneWrap branch. `compare-home-brightness-attribution.mjs` and `compare-composite-stages.mjs` now accept `VIEWPORT=mobile`, so mobile residuals can be attributed without relying only on full capture. `VIEWPORT=mobile` output probe passed. Mobile attribution shows default `workRaw~0.346`, `workComposite~0.254`, `preComposite~0.296`; environment/floor-reflection debug switches are high-impact, but are diagnostic only. Composite stage debug did not identify a new source-backed A1/OA production fix. | Low | Keep as mobile attribution guardrail. Continue Phase 1 from source-backed mobile floor/environment distribution, mobile scene/camera geometry, thumb-map transfer/content feel, and remaining `VA/GA` bridge depth. |
| 99 | S1-172 | `A1/CA` shared color helper surface and A1 vignette | Source `A1` and `CA` include shared helper surfaces `${Ur}${Ro}${Za}${Fr}${Ja}${Qa}${Po}` before their composite bodies: saturation, vignette, circle, contrast, hue, rgbshift, and the full blend dispatcher. Source `Ro` vignette is a raw `distance(coords.xy, vec2(.5))` helper; the rebuild's A1 helper had a ratio-scaled bridge (`p.x *= uRatio`) that was not source-owned. | Production now uses a shared `sourceCompositeColorHelper` plus `sourceBlendHelper` for both `A1-pre-composite` and `OA-work-composite`. This adds the six source color/helper surfaces, removes local duplicate helper definitions, and changes A1 vignette back to the source non-ratio helper. Shader dump hard-checks all six helper surfaces and `noA1RatioVignetteBridge`; source/rebuild are true. `OA-work-composite` fragment text delta narrowed from roughly `-489` to `-1`; `A1-pre-composite` narrowed from roughly `-563` to `-175`. `npm run build`, `git diff --check`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed. Project pages retained five visible media tracks. Desktop center-band delta improved materially to `+0.0034`; mobile center-band delta is still `+0.0284`, so Phase 1 remains open. | Medium | Keep as source-backed composite helper/formula fix. Continue from remaining mobile/background distribution, floor/environment residuals, thumb-map transfer/content feel, remaining `VA/GA` bridge depth, and any remaining source-backed `OA/CA` transfer evidence. |
| 98 | S1-171 | `A1/CA/OA` composite blend helper surface | Source `A1` and `CA` both include the shared full blend dispatcher through `${Po}` before their composite bodies. Previous rebuild composite fragments used local reduced helper definitions for only the blend modes they called, which made the central pre/final composite shader surface less source-shaped even when formulas were equivalent. | Production formulas and visual constants are unchanged. `homePreCompositeFragment` and `homeCompositeFragment` now inject the shared `sourceBlendHelper` instead of local reduced `blend(...)` helpers. Shader dump now hard-checks full dispatcher mode `25` plus `blendAdd`, `blendMultiply`, and `blendLighten` surfaces for both `A1-pre-composite` and `OA-work-composite`; the latest dump reports all four source/rebuild checks true for both shaders. `npm run build`, `git diff --check`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. Desktop center-band delta is `+0.0205`; mobile center-band delta is `+0.0243`, so this is source-surface parity, not visual closeout. | Low-medium | Keep as `A1/CA/OA` helper-surface parity. Continue Phase 1 from actual visual residuals: floor/environment distribution, thumb-map transfer/content feel, remaining `VA/GA` bridge depth, and source-backed `OA/CA` transfer evidence. |
| 97 | S1-170 | `V1/z1/h1/u1/i1` roughness helper and reflector target-state guardrails | Source sky/environment helper expansion includes inert `randomF(...)` and `customRoughness(...)` surfaces in the shared shader block used by `B1/l1`. Source floor reflector `i1` constructs `renderTarget=new Dn(e,t,{depthBuffer:!1})`, clones read/write targets from it, then sets the raw render target `depthBuffer=!0`; this explains why source construction and runtime target states differ. | Production rendering is effectively unchanged. Rebuild sky/environment shader helper surface now includes source `randomF/customRoughness`, reducing `u1-environment` fragment text delta from roughly `-1400` to `-793` while keeping core anchors matched. Runtime output now exposes/asserts floor reflection raw target construction depth `false` and runtime depth `true`; renderer audit checks the source `i1` target-state anchors and `z1/u1` roughness helper anchors. `npm run build`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, full capture, band analysis, and `git diff --check` passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0217`; mobile center-band delta is `+0.0239`, so this is attribution/source-surface work, not visual closeout. | Low | Keep as sky/environment helper-surface and reflector target-state attribution. Continue Phase 1 from actual visual residuals: environment/floor distribution, thumb-map transfer/content feel, remaining `VA/GA` bridge depth, and source-backed `OA/CA` transfer evidence. |
| 96 | S1-169 | `nD/a1/Xt` scene order and floor-normal preload guardrails | Source `nD.init()` adds scenes in this order: `sky`, `media`, `work`, `main`, `workthumb`, `wavves`, `character`. The same init gate awaits `Xt.blueNoise`, `Xt.floorNormal`, `Xt.perlin1`, and `Xt.perlin2` before the animation-in path continues. Source `a1.init()` awaits `Xt.floorNormal` and applies `repeat.set(45,45)` before the floor material uses it. | Production rendering is unchanged. Runtime output now exposes/asserts source scene order, current rebuild frame order, source preload gate marker, and floor normal binding state: loaded texture, repeat `[45,45]`, 3x3 transform matrix, empty texture color space, and source binding mode. Renderer audit now checks all `nD.addScene(...)` anchors, the four-texture preload gate, and the source `floorNormal.repeat.set(45,45)` anchor. `npm run build`, `git diff --check`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0216`; mobile center-band delta is `+0.0239`, so this is source guardrail work, not visual closeout. | Low | Keep as source order/preload/floor-normal attribution. Continue Phase 1 from actual visual residuals: environment/floor distribution, thumb-map transfer/content feel, remaining `VA/GA` bridge depth, and source-backed `OA/CA` transfer evidence. |
| 95 | S1-168 | `nD/V1/h1/u1` sky/environment binding guardrails | Source `V1.init()` sets `backgroundColor=new Color("#666666").convertLinearToSRGB()`, assigns it to `scene.background`, and resizes the sky render manager to `height*.75` square. Source `nD.init()` emits resize, waits `100ms`, then takes `skyScene.renderManager.renderTargetComposite.texture`, sets `wrapS/wrapT=RepeatWrapping`, and binds that composite texture into `workScene.env.material.customUniforms.tSky.value`. Recent attribution showed environment-off and floor-reflection-off are high-impact residual probes, while sky background/wrapping are now source-confirmed guardrails rather than tuning levers. | Production rendering is unchanged. Runtime output now exposes/asserts `backgroundMode=source-V1-background-666666-linear-to-srgb`, sky raw/composite `height*.75` sizing, `bindingMode=source-nD-after-init-resize-delay-bind-repeat-composite`, environment `tSky` composite identity, and `tSky` repeat wrapping. Renderer audit now checks the source `V1` background anchors and the `nD` resize-delay-before-bind anchor. `npm run build`, `git diff --check`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0216`; mobile center-band delta is `+0.0241`, so this is source guardrail work, not visual closeout. | Low | Keep as sky/environment binding attribution. Continue Phase 1 from actual rendering residuals: environment/floor distribution, thumb-map transfer/content feel, remaining `VA/GA` bridge depth, and source-backed `OA/CA` transfer evidence. |
| 94 | S1-167 | Phase 1 batch cadence and floor-reflection clear marker hygiene | Source `i1.update()` conditionally calls `renderer.clear()` for the raw reflection target only when `renderer.autoClear === false`; this is a source-owned exception to the broader `Lu/Lo` no-explicit-clear pass pattern. The previous probe label `source-autoClear-false-only` was terse enough to be misread as a no-clear target during later attribution. The user also requested fewer one-line cycles and larger source-backed batches. | Production rendering is unchanged. Runtime marker/QA wording now reports `rawClearMode=source-i1-conditional-clear-when-autoClear-false`, and `probe-output-color.mjs` asserts that explicit source exception. The cadence note now states that a coherent batch can contain up to ten related source-proven differences, with shader/render-target batches still allowed to stop early when risk or QA demands it. `npm run build`, `git diff --check`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0222`; mobile center-band delta is `+0.0250`, so Phase 1 remains open for actual rendering residuals. | Low | Keep as audit/probe hygiene. Continue Phase 1 from actual visual blockers: floor/environment distribution, thumb-map transfer/content feel, remaining `VA/GA` bridge depth, and source-backed `OA/CA` transfer evidence. |
| 93 | S1-166 | Phase 1 shader residual source-template expansion | Source `A1`, `CA`, `l1`, `B1`, and multiple helper/pass shaders embed shared helpers through template placeholders such as `${Ur}`, `${Po}`, `${xg}`, `${vg}`, `${Fr}`, `${dg}`, `${ug}`, `${pg}`, and `${_g}`. Previous dump comparisons wrote those placeholders literally, which could create false source/rebuild length residuals, make `u1` helper checks show `source:false rebuild:true`, and let generic composite checks misclassify non-composite shaders such as `j1-media-composite`. | Production rendering is unchanged. `scripts/dump-va-shader.mjs` now recursively expands mirrored source shader template placeholders before writing/comparing source shader files, and limits composite-core checks to `A1-pre-composite`, `OA-work-composite`, `Lu-main-composite`, and `x1-thumb-composite`. The updated dump reports `u1-environment` source/rebuild helper checks as true for full blend dispatcher, oil helper, and simplex noise, and `j1-media-composite` is no longer a false open residual. `npm run build`, `git diff --check`, expanded shader dump, output probe, thumb spotlight probe, project-media probe, full capture, and band analysis passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0211`; mobile center-band delta is `+0.0235`, so this is QA attribution improvement rather than a visual closeout. | Low | Keep as source-comparison hygiene. Continue Phase 1 from actual visual blockers: floor/environment distribution, thumb-map transfer/content feel, remaining `VA/GA` bridge depth, and source-backed `OA/CA` transfer evidence. |
| 92 | S1-165 | `V1/z1` sky composite and `h1/u1` environment helper surfaces | Source environment `l1` injects shared helper surfaces `${xg}${gg}${vg}${Po}${_g}` before the MeshStandard body, covering simplex noise, procedural noise shader helpers, the full blend dispatcher, and oil helper surface. Source sky composite `B1` injects `${Fr}${xg}${gg}${vg}${dg}${ug}${pg}${_g}`, covering contrast, simplex/procedural noise helpers, the limited sky blend helper surface, and oil helper surface. | Production formulas, constants, floor/environment darken values, and transfer paths are unchanged. `src/client/webgl.ts` now shares source-shaped helper strings for contrast, simplex noise, procedural noise shader, full environment blend dispatcher, limited sky blend helpers, and oil, then injects them into the `u1-environment` and `z1-sky-composite` fragments according to source ownership. Shader dump now hard-checks environment full blend dispatcher/simplex/oil surfaces and sky blend/simplex/oil surfaces. `npm run build`, `git diff --check`, shader dump, output probe, thumb spotlight probe, project-media probe, full capture, and band analysis passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0219`; mobile center-band delta is `+0.0249`, so this is source helper-surface parity rather than a sky/environment visual closeout. | Low-medium | Keep as source `V1/z1/h1/u1` helper-surface parity. Continue Phase 1 from actual floor/environment distribution residuals, thumb-map transfer/content feel, remaining `VA/GA` bridge depth, or source-backed `OA/CA` transfer evidence. |
| 91 | S1-164 | `SD/p1/SpotLight` spotlight-map projection guardrails | Source `SD.init()` binds `J.workScene.spotLight.map=J.workThumbScene.renderManager.renderTargetComposite.texture`, positions the spotlight at `(0,0,3.7)`, targets `(0,0,-8)`, and sets intensity `220`. Source `p1.setLights()` owns `maxSpotLightIntensity=220`, `spotLight.position.set(0,0,3.7)`, `spotLight.angle=Math.PI/4`, and `spotLight.penumbra=.95`. Three r164 owns the actual projected map path through `vSpotLightCoord`, `spotLightMatrix`, and `lights_fragment_begin` multiplying `directLight.color` by `spotColor.rgb`. | Production rendering formulas and constants are unchanged. Runtime output probe now exposes/asserts `mapProjectionMode=three-r164-spotLightMap-vSpotLightCoord`, `projectionMatrixMode=source-SD-SpotLight-map-through-three-shadow-matrix`, `threeChunkMode=r164-lights_fragment_begin-multiplies-directLight-by-spotLightMap`, spotlight intensity/angle/penumbra/position/target, a 16-value shadow matrix, and existing 3x3 active-block in-map coverage/luma. Renderer audit now records the source `SD.init()` spotlight-map binding, `p1.setLights()` constants, and local Three r164 chunk anchors for fragment and vertex projection. `npm run build`, `git diff --check`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, full capture, and band analysis passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0207`; mobile center-band delta is `+0.0230`, so this is projection-path guardrail work rather than a spotlight/thumb visual closeout. | Low | Keep as strict spotlight-map projection attribution. Continue Phase 1 from actual thumb-map transfer/content feel, remaining `VA/GA` bridge depth, environment/floor distribution residuals, or source-backed `OA/CA` transfer evidence. |
| 90 | S1-163 | `p1/h1/u1/a1` environment/floor production guardrails | Source `p1.init()` creates `this.env=this.add(h1)`, positions it at `y=-12.65`, applies only the initial demorgen rotation adjustment through `this.env.rotation.y=-Xc(this.rotationAdjustment)`, and adds it under `sceneWrap`. Source `h1` owns `speed=5e-5`, `Du(300,10)`, `u1({side:BackSide,envMapIntensity:1,fog:false})`, and `update(e,t,n){this.material.update(e,t,n)}`. Source production flow does not depend on local debug `floor/environment` switches. | Production rendering formulas and constants are unchanged. Runtime output probe now exposes and asserts `productionDebugClean=true`, `environment.updateMode=source-h1-material-update-only`, `rotationMode=source-p1-demorgen-initial-adjustment-only`, and `speed=0.00005`; renderer audit now checks the source `h1.update()` anchor. `npm run build`, `git diff --check`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, home capture, and band analysis passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0207`; mobile center-band delta is `+0.0228`, so this is source guardrail/attribution work rather than a floor/environment visual closeout. | Low | Keep as floor/environment production-path guardrail. Continue Phase 1 from actual environment/floor distribution residuals, strict spotlight/thumb projection feel, remaining `VA/GA` bridge depth, or source-backed `OA/CA` transfer evidence. |
| 89 | S1-162 | `VA/HA` ordinary work vertex variable-step surface | Source `HA` spells the ordinary work-cube vertex transform as a sequence of named local steps: `newOffset`, two-step `mouseUv`, `perlinUv`/`perlin`, `revealCombined`, `perlinDisplacementHeight`, `perlinScaleDisplacement`, misspelled source `fadeDiplacement`, `mouseTransform`, `displacementF`, `waveDisplacement`, and `spread / 2.0`. These are formula-equivalent to the previous bridge but are part of the source shader surface used for strict attribution. | Production now mirrors those source variable names and step ordering in the ordinary `VA-work` vertex chunk while preserving formulas, constants, material state, and the source manual projection/world-position path from S1-161. The `screenUv` replacement was updated to match the new `newOffset` step, so generated `VA-work` still reports `screenUvFromClip=true` and `newUvFromScreenUv=true`. Shader dump now hard-checks the new source variable-step anchors. `npm run build`, renderer audit, shader dump, output probe, thumb spotlight probe, project-media probe, home capture, band analysis, and `git diff --check` passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0198`; mobile center-band delta is `+0.0249`, so this is source shader-surface parity rather than Phase 1 visual closeout. | Medium | Keep as source `HA` vertex-step parity and guardrail. Continue Phase 1 from remaining ordinary `VA/zA` fragment bridge depth, strict spotlight/thumb projection feel, floor/environment distribution, or deeper `OA/CA` transfer evidence. |
| 88 | S1-161 | `VA/HA` ordinary work vertex shader surface | Source `HA` does not use the modern Three r164 vertex chunk path for ordinary work cubes. After the custom transform it writes `vec4 mvPosition = vec4(transformed, 1.0)`, conditionally applies `instanceMatrix`, applies `modelViewMatrix`, writes `gl_Position = projectionMatrix * mvPosition`, sets `vViewPosition`, then computes `worldPosition` through the source mouse divide plus `instanceMatrix` and `modelMatrix`. Source `HA` omits batching, morph target, skinning, displacement map, logdepthbuf, clipping-plane, and `project_vertex`/`worldpos_vertex` runtime chunk ownership. | Production ordinary `VA-work` now strips the source-absent r164 vertex pars/runtime chunks and replaces `#include <project_vertex>` with the source manual projection block. The auxiliary block bridge is intentionally unchanged because it is not the ordinary source `VA` object. Shader dump guardrails now assert the absence of the r164 vertex chunk surface and presence of manual `mvPosition/gl_Position`. `npm run build`, renderer audit, shader dump, output probe, thumb spotlight probe, project-media probe, home capture, band analysis, and `git diff --check` passed; project pages retained visible media tracks. `VA-work` vertex `includesOnlyRebuild` is now empty; desktop center-band delta is `+0.0212`, mobile center-band delta is `+0.0255`, so this is source shader-surface parity rather than a visual closeout. | Medium | Keep as source `HA` vertex-surface parity and guardrail. Continue Phase 1 from remaining ordinary `VA/zA` fragment bridge depth, strict spotlight/thumb projection feel, floor/environment distribution, or deeper `OA/CA` transfer evidence. |
| 87 | S1-160 | `Iu/p1/GA/k1` frame-tail update order and screen mouse binding | Source `Iu.update()` renders each scene manager first, then updates the camera controller and scene components. Source `p1.update()` runs after `workScene.renderManager.update()`, culls visible `GA` blocks, calls `GA.update()`, and binds each visible block's `tMouseSim2` to `this.renderManager.mouseSimulation.bufferSim.output.texture`; source scene order runs `work` before `wavves`, so `GA.update()` samples the previous wavves/displacement composite for the current work render. | Production now samples output probes after the source-shaped `p1` post-render update and renders the displacement target after that update, so active work-block state reports `tMouseSim2IsScreen=true` and `tMouseSimIsLocal=true` at the same source point. Output probe now exposes `frameTail=source-main/work-render-then-p1-update-before-wavves-displacement` and hard-fails if visible blocks lose their source screen/local mouse bindings. `npm run build`, renderer audit, shader dump, output probe, thumb spotlight probe, project-media probe, home capture, band analysis, and `git diff --check` passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0213`; mobile center-band delta is `+0.0244`, so this fixes a real mouse/displacement update-order mismatch but does not close the floor/environment visual residual. | Medium | Keep as source frame-order and mouse-binding parity. Continue Phase 1 from strict `VA/GA` generated shader/Three bridge depth, floor/environment render-target interpretation, thumb-map transfer/content, or deeper `OA/CA` transfer evidence. |
| 86 | S1-159 | `nD/V1/p1` sky composite wrap ownership | Source `nD.init()` takes `this.skyScene.renderManager.renderTargetComposite.texture`, sets `e.wrapS=e.wrapT=ci`, then binds that texture into `this.workScene.env.material.customUniforms.tSky.value=e`; source `ci` is `RepeatWrapping=1000`. This supersedes the older assumption that the sky composite target should stay clamp-wrapped when used by the work environment. | Production now sets `skyCompositeTarget.texture.wrapS/wrapT` to `RepeatWrapping` before the texture is used by the environment material, exposes `wrapMode=source-nD-sky-composite-repeat-for-work-env`, and updates output/audit checks to require source repeat wrapping. `npm run build`, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, home capture, band analysis, and `git diff --check` passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0220`; mobile center-band delta is `+0.0248`, so this is source texture-ownership parity rather than a visual closeout. | Low-medium | Keep as source `nD` sky/environment ownership parity and guardrail. Continue Phase 1 from source-backed environment/floor distribution, strict `VA/GA` projection/material feel, thumb-map transfer/content, or deeper `OA/CA` transfer evidence. |
| 85 | S1-158 | `a1/i1/t1` floor reflector blur-loop ownership | Source `i1.update()` stores `clipBias` from the constructor default `0`, applies `projection.elements[10] = clipPlane.z + 1 - clipBias`, renders the raw reflection target, then loops over `blurIterations` by writing to `renderTargetWrite`, swapping `renderTargetRead/renderTargetWrite`, and updating `renderTargetUniform.value` after each blur pass. Source does not pre-bind `renderTargetRead` before the blur loop. | Production floor reflection now carries an explicit source `clipBias=0`, uses the source projection-row formula, writes no-blur/debug and normal blur passes through the write target before swapping, and updates the floor reflection texture after each source-style swap. Output probe now exposes/asserts `clipBias`, `blurSwapMode=source-i1-write-target-loop-swap`, and `renderTargetUniformMode=source-i1-update-after-each-blur-swap`; renderer audit records source blur-loop anchors and order. `git diff --check`, build, renderer audit, output probe, shader dump, thumb spotlight probe, project-media probe, home capture, and band analysis passed; project pages retained visible media tracks. Desktop center-band delta is `+0.0147`; mobile center-band delta is `+0.0207`, so the remaining middle-band brightness residual is not closed by reflector pass-order parity. | Medium | Keep as source floor-reflector pass parity and guardrail, not a visual closeout. Continue Phase 1 from remaining environment/floor distribution, strict `VA/GA` projection/material feel, thumb-map transfer/content, or deeper source-backed `OA/CA` transfer evidence. |
| 84 | S1-157 | `p1/OA` update culling and production composite guardrails | Source `p1.update()` runs after the work render-manager update, projects spotlight parallax from the camera, then culls each `GA` block by world position with bounds `x > 5.5 || x < -5.5 || z > 5`; only visible blocks run `GA.update()`, receive source `uRevealSides` / `uRevealSpreadSides` ranges, and bind screen mouse simulation. Source `OA/CA` production composite is the non-debug Raw GLSL3 surface; debug branch uniforms are not part of the production shader. | Production rendering is unchanged. Runtime output probe now exposes and asserts a `p1UpdateCulling` board for the source world-position cull bounds, item count, visibility agreement, and reveal range shape on the home route. It also asserts the default work composite is `source-OA-raw-glsl3` with `debugShaderActive=false` and no debug uniforms in the production surface. Renderer audit records the source `p1.update()` cull/update anchors. `git diff --check`, build, renderer audit, output probe, shader dump, thumb spotlight probe, and project-media probe passed; project pages retained visible media tracks. | Low | Keep as source update/composite guardrail, not a visual closeout. This proves the remaining projection/brightness/fog residual is not due to a missing `p1.update()` cull branch or debug `OA` shader leakage. Continue Phase 1 from strict `VA/GA` projection/material feel, thumb-map transfer/content, floor/environment distribution, or deeper source-backed `OA/CA` transfer evidence. |
| 83 | S1-156 | `GA/Ka` interaction plane material and visibility ownership | Source `GA.createPlane()` creates a separate `planeMaterial` with `transparent`, `depthTest:false`, `depthWrite:false`, `uRatio=35/23`, and source `S1/y1` shader surface; it keeps the `plane` object visible but uses it for mouse simulation/raycast sizing rather than adding it to the work scene. Source `rayPlaneMaterial` is also transparent with `opacity=0`, `depthTest:false`, and `depthWrite:false`, while the ray plane remains visible inside `rotationWrap`. | Production now uses a dedicated source-shaped work mouse-plane `ShaderMaterial` instead of reusing the simulation material, keeps `mousePlane.visible=true` while leaving it detached from the scene, and uses a transparent zero-opacity `MeshBasicMaterial` for `rayPlane` instead of hiding the object. Runtime output probe exposes and asserts `mousePlaneMaterial`, `rayPlaneMaterial`, visibility, parentage, `uRatio`, and existing source scale/position checks. Renderer audit records the source `planeMaterial` and `rayPlaneMaterial` anchors. `git diff --check`, build, renderer audit, shader dump, output probe, thumb spotlight probe, and project-media probe passed; project pages retained visible media tracks. | Low-medium | Keep as `GA.createPlane()` structure parity and ray/mouse-interaction guardrail. This is not final projection/brightness or interactive-feel closeout; continue Phase 1 from strict `VA/GA` projection/material feel, thumb-map transfer/content, floor/environment distribution, or source-backed `OA/CA` transfer evidence. |
| 82 | S1-155 | `Ka/sA/GA` mouse-simulation ping-pong clear ownership | Source `sA.render()` sets the output render target, renders the ortho simulation scene, then restores `null`; it does not call `renderer.clear()` inside the ping-pong mouse simulation pass. Source `GA` feeds that `Ka.bufferSim.output.texture` into ordinary work `VA`. | Production now removes the rebuild-only explicit clear before mouse-simulation target rendering, matching source `sA` pass ownership. Runtime output probe exposes `renderClearMode=source-sA-no-explicit-clear` and asserts it through the existing `GA` mouse/ray source-shape board. Renderer audit records source `sA` anchors and `noExplicitClear=true`. `git diff --check`, build, renderer audit, shader dump, output probe, thumb spotlight probe, and project-media probe passed; project pages retained five visible media tracks. | Medium | Keep as source mouse-simulation pass parity. This may affect interactive trail accumulation, but it is not a final visual closeout. Continue Phase 1 from remaining `VA/GA` material/projection feel, thumb-map transfer/content, floor/environment distribution, or source-backed `OA/CA` transfer evidence. |
| 81 | S1-154 | `GA/VA` ordinary work UV offset type | Source ordinary `VA` binds `uUvOffset:new I(new Q)` where `Q` is a Vector2, and source `GA.createPlane()` only writes `.x`/`.y` plus `uUvOffsetScale=t`; this is separate from auxiliary block shader surfaces that contain `uniform vec3 uUvOffset`. | Production ordinary work block shader/uniforms now use `uniform vec2 uUvOffset` and `Vector2` runtime values for the source mouse/ray-plane offset. The auxiliary material initialization follows the shared shader pars with a `Vector2`. Mouse-simulation probes expose `uvOffsetType=Vector2` and assert source value/type/scale. Shader dump now records explicit bundle-source evidence for `VA/GA` Vector2 ownership and confirms the runtime work shader uses vec2 and avoids vec3. `git diff --check`, build, shader dump, output probe, thumb spotlight probe, and project-media probe passed; project pages retained five visible media tracks. | Low-medium | Keep as source `GA/VA` type parity and attribution. This is not a final projection/brightness closeout; continue Phase 1 from remaining ordinary work material/projection feel, thumb-map transfer/content, floor/environment distribution, or source-backed `OA/CA` transfer evidence. |
| 80 | S1-153 | `T1/x1/_1/Lo` thumb composite target and material guardrails | Source `T1` renders a square `height x height` thumb scene through `x1`, which extends `Lo`; `Lo` owns depthless `renderTargetA` and `renderTargetComposite` clone targets, and `_1` is Raw GLSL3 with `toneMapped:false`, `transparent:true`, `blending:NoBlending`, `depthWrite:false`, `depthTest:false`, uniforms `tScene/uDarkenIntensity/uDarkenColor/uSaturation`, source `tl` vertex, and `v1` fragment. | Production rendering is unchanged. Runtime thumb probe now exposes and asserts `_1/x1` material state, `tScene` binding to the thumb target, source `Lo` depthless target mode, thumb/composite target texture defaults, and existing `T1` square sizing. Renderer audit now records source `x1/_1` and `T1` anchors. `git diff --check`, build, renderer audit, shader dump, output probe, thumb spotlight probe, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Low | Treat as thumb-chain guardrail, not a projection/brightness fix. Desktop center-band delta is `+0.0110`; mobile center-band delta is `+0.0182`. Continue Phase 1 from actual thumb-map transfer/content interpretation, strict `VA/GA` projection/material feel, floor/environment distribution, or source-backed `OA/CA` transfer evidence. |
| 79 | S1-152 | `Se/yD` home overview and thumbnail fallback state | Source `yD.onProjectActive()` keeps overview and thumbnail fallback state separate: `Se.setDarken(t.data.darkenOverview || .1)`, `Se.setSaturation(t.data.saturation || 1)`, and `Se.setThumbDarknessIntensity(t.data.thumbnail.darkness || 0)`. The rebuild had already split DOM fields but still let home `payload.darkness` (`darkenOverview`) fall through as thumb darkness when `thumbnail.darkness` was absent. | Production now uses source home fallbacks: overview darken `.1`, overview saturation `1`, and home thumb darkness `0`; project/detail fallback semantics remain separate. Home thumb darkness no longer falls back to overview darkness, so `hashgraph-vc` now reports `thumbComposite.darkness=0` instead of the previous `0.2` leak. Output and thumb probes expose/assert the new source defaults. `git diff --check`, build, renderer audit, shader dump, output probe, thumb spotlight probe, brightness attribution, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Low | Keep as source state-ownership parity, not a visual closeout. Desktop center-band delta is `+0.0143`; mobile center-band delta is `+0.0182`. Continue Phase 1 from remaining floor/environment distribution, strict `VA/GA` projection/material feel, thumb-map transfer/content, or source-backed `OA/CA` transfer evidence. |
| 78 | S1-151 | `V1/H1/z1` sky composite and `a1/i1/o1` floor shader surface | Source `B1` keeps an inert `vec2 uv = vUv`, names the procedural sample `vec4 noise`, calls `contrast(...)`, and multiplies with `diffuseColor.rgb = diffuseColor.rgb * 2.;`. Source `s1` floor fragment names the normal-distorted reflection coordinate `uv` and samples `texture(tReflect, uv)`. | Production now mirrors those source shader-surface anchors without changing formulas, constants, pass order, material state, or render targets. Shader dump now exposes `z1-sky-composite` core checks for source `uv/noise/contrast/* 2.` anchors and `o1-floor-material` checks for the distorted `uv` reflection sample plus absence of the rebuild-only `reflectUv` name. `git diff --check`, build, renderer audit, shader dump, output probe, brightness attribution, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Low | Keep as source-surface parity and guardrail, not a fog-bed visual closeout. Desktop center-band delta is `-0.0095`; mobile center-band delta is `-0.0212`. Continue Phase 1 from remaining mobile fog distribution, strict `VA/GA` projection/material feel, thumb-map transfer/content, or source-backed `OA/CA` transfer evidence. |
| 77 | S1-150 | `T1/w1/E1/M1` thumb target and shader guardrails | Source `M1` is Raw GLSL3 with `toneMapped:false`, `transparent:false`, `depthWrite:false`, `depthTest:false`, uniforms `tMap/uResolution/uMapSize/uProgress/uTransitionCount/uTransitionSmoothness`, defaults `uProgress=1`, `uTransitionCount=150`, `uTransitionSmoothness=.2`, vertex `b1`, fragment `S1`; source `E1` uses `PlaneGeometry(1,1)` scaled `(2,2,2)` and sets thumb map size/resolution to `(1,1)` after loading; source `w1` uses centered x-wrap and visibility `[-1.5,1.5]`; source `T1.resize()` renders square thumb targets at `height x height` DPR 1. | Production now restores the source `S1/y1` helper surface by keeping the `vec4 color = texture(tex, uv); return color;` temporary. Shader dump now has `M1-thumb-plane` core checks for vertex matrix path, coverTexture helper, transition function, transition step shape, progress inversion, and output. Runtime thumb probe now exposes/asserts `M1/E1/w1/T1` material defaults, per-thumb scale, map binding, map/resolution values, centered wrap, target sizing, and spotlight map ownership. Build, thumb probe, shader dump, output probe, brightness attribution, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Low | Keep as thumb-chain source guardrail, not a brightness/projection closeout. Desktop center-band delta is `-0.0096`; mobile center-band delta is `-0.0204`. Continue from thumb-map transfer/content interpretation, strict `VA/GA` projection/material feel, or source-backed `OA/CA` transfer evidence. |
| 76 | S1-149 | `GA/VA` source fragment-tail step surface | Source `zA` ordinary work fragment expands the alpha/mouse-lightness tail as `newUv = vUv`, `newOffset = vOffset.xy`, separate x/y grid division and offset adds, `vec4 mouseSim = texture2D(tMouseSim2, screenUv)`, source vignette temporaries (`vignin`, `vignout`, `vignfade`, `fstop`, `center`), and `v`/`v2` vignette variables before the alpha tail. The rebuild had the same formulas in a more compact local expression surface. | Production now mirrors that source step surface while preserving the existing formulas, material state, pass order, render targets, and r164 compile bridge. Shader dump now asserts `sourceNewUvStepSurface`, `sourceMouseSimVec4`, source vignette temporaries/variables, source mouse-lightness, and mouse-alpha anchors; `VA-work` now reports source anchors match with no include/uniform residuals. Build, renderer audit, output probe, shader dump, brightness attribution, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Medium | Keep as source shader-surface parity, not visual closeout. Desktop center-band delta is `-0.0095`; mobile center-band delta is `-0.0201`. Continue Phase 1 from remaining `VA/GA` r164 bridge/projection feel, thumb-map transfer/content, or source-backed `OA/CA` transfer evidence. |
| 75 | S1-148 | `GA/VA` source inert varying surface | Source `HA/zA` ordinary work shaders keep additional varying declarations beyond the currently mutating output path: `vInstanceIndex`, `vInstanceColor`, `vPosition`, and vertex `vNoise`, with assignments for instance index/color and source position. The rebuild still had the formula-equivalent active path but omitted part of this inert source shader surface. | Production now restores those source varying declarations and assignments for ordinary work blocks while preserving existing formulas, material state, render order, and r164 compile bridge. Shader dump now asserts the source varying/assignment anchors on the vertex and fragment surfaces. Build, renderer audit, output probe, shader dump, brightness attribution, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Medium | Keep as source shader-surface parity, not visual closeout. Desktop center-band delta is `-0.0092`; mobile center-band delta is `-0.0175`. Continue from remaining `VA/GA` bridge/projection residuals, thumb/material interpretation, or source-backed `OA/CA` transfer evidence. |
| 74 | S1-147 | `Lu/I1` render-target state attribution | Source `Lu.initRenderer()` creates `renderTargetA=new Dn(1,1,{depthBuffer:!1,stencilBuffer:!1})`, clones bloom/composite/blur/fxaa targets from it, then sets only `renderTargetA.depthBuffer=!0`; source main `I1.initRenderer()` creates `renderTargetA` with `depthBuffer:false, stencilBuffer:false` and clones `renderTargetB`, `renderTargetLensflare`, bloom, composite, blur, and fxaa targets without flipping depth. | Production rendering is unchanged. Runtime output probe now exposes a source render-target state board for work `Lu` and main `I1`, including depth/stencil, colorSpace, type, format, filters, mipmaps, and wrapping for raw/composite/bloom/blur/fxaa/lensflare roles. `probe-output-color.mjs` now hard-asserts the source target defaults. Build, renderer audit, output probe, shader dump, brightness attribution, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Low | Keep as source target-state guardrail, not a visual fix. Desktop center-band delta is `-0.0093`; mobile center-band delta is `-0.0188`. The target defaults are not the missing transfer/fog-bed fix; continue from source-backed `OA/CA` transfer interpretation, strict `VA/GA` projection/material feel, or floor/environment residuals. |
| 73 | S1-146 | `GA/VA` source varying and alpha-tail surface | Source `HA/zA` uses `vUv`, `vInstanceAlpha`, and `vec3 vOffset`, assigns `vUv = uv`, names helper functions `random(...)` and `vignette(...)`, and keeps the ordinary fragment alpha tail in `mixedAlpha = alpha * alpha2 * vInstanceAlpha` form. The rebuild still had equivalent but rebuild-only names such as `vLocalUv`, `vAlpha`, `sourceRandom`, and `sourceVignette`. | Production now restores those source shader-surface names and tail structure while preserving the existing formulas, material state, and r164 compile bridge. Shader dump now asserts source varying names, `vUv` assignment, helper names, absence of rebuild-only names, source alpha-grid shape, and the existing world-position anchors. Build, output probe, shader dump, brightness attribution, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Medium | Keep as source shader-surface parity, not Phase 1 completion. Desktop center-band delta is `-0.0089`; mobile center-band delta is `-0.0192`. Continue Phase 1 from remaining `VA/GA` bridge residuals, thumb/material interpretation, or source-backed `OA/CA` transfer evidence. |
| 72 | S1-145 | `GA/VA` source `HA` world-position path | Source `HA` ordinary block vertex path applies `transformed /= 1. - mouseSim.r * .2`, then creates `vec4 worldPosition = vec4(transformed, 1.0)`, multiplies by `instanceMatrix`, then `modelMatrix`. It is not wrapped in the local Three r164 `NUM_SPOT_LIGHT_COORDS` / env / shadow condition and does not include a batching matrix branch. | Production now restores the source-style unconditional `instanceMatrix -> modelMatrix` world-position path for work blocks and records `vertexWorldPositionMode=source-HA-unconditional-instance-world`. Shader dump now asserts the source `instanceMatrix` anchor and absence of `batchingMatrix` in the world-position path; output probe hard-checks the metadata. Build, output probe, shader dump, brightness attribution, full capture, band analysis, and project-media probe passed; project pages retained five visible media tracks. | Medium | Keep as source shader-surface / spotlight-world attribution, not Phase 1 completion. Desktop center-band delta is `-0.0089`; mobile center-band delta is `-0.0182`. Continue Phase 1 from remaining `VA/GA` bridge residuals, thumb/material interpretation, or `OA/CA` transfer evidence only when source-backed. |
| 71 | S1-144 | `GA/VA` material state default tonemapping | Source `VA extends MeshStandardMaterial` constructs `new VA({ color: new Color("#808080") })`, then sets `dithering=true`, `transparent=true`, `envMapIntensity=.75`, `roughness=1`, `depthTest=false`, and `depthWrite=false`; it does not explicitly set `toneMapped=false`. The source `zA` shader comments out the tonemapping include, but the material state itself remains the MeshStandard default path. | Production removed the rebuild-only `toneMapped:false` override from ordinary work and auxiliary block materials while preserving source `transparent`, depth, dithering, env map, roughness, and metalness state. Output probe now exposes/asserts `materialStateMode=source-VA-meshstandard-default-toneMapped`, active material flags, and auxiliary material flags. Shader dump passed with no WebGL errors; `VA-work` fragment text delta narrowed from the earlier `+902` class of residual to `+549`, with live include/uniform deltas still empty. Full capture and band analysis passed; project pages retained five visible media tracks. | Medium | Keep as source material-state parity, not a claimed brightness fix. Desktop center-band delta is `-0.0086`; mobile center-band delta is `-0.0197`. Continue Phase 1 from remaining `VA/GA` bridge residuals, thumb/material interpretation, or `OA/CA` transfer evidence only when source-backed. |
| 70 | S1-143 | `T1/w1/E1` spotlight/thumb projection coverage | Source `SD.init()` assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`, so the active work block should project against the thumb composite target rather than a rebuild-only overlay. Previous probes only sampled a narrow five-point cross, which could miss active-block edge/corner coverage issues. | Production rendering is unchanged. Runtime spotlight projection probe now samples a 3x3 grid across the active block bounds, exposes `mapMode`, `sampleGridMode`, `sampleCount`, `inMapCoverage`, `uvBounds`, and asserts all nine active-bound samples land inside the source thumb composite map with non-empty luma. Build, output probe, project-media probe, and brightness attribution passed; project pages retained five visible media tracks. | Low | Treat projection coverage as guarded, not visually solved. The active block's 3x3 bounds all project into the thumb composite map, so the remaining projection/brightness residual is more likely thumb-map transfer/content or `VA` material interpretation than missing spotlight coverage. |
| 69 | S1-142 | `OA/CA` transfer and renderer-output re-audit | Source `qw` sets `autoClear=false` and `outputColorSpace=Gt` (`srgb`), while source `OA/CA` and `C1/A1` keep `toneMapped:false`, Raw GLSL3, source blend/darken formulas, and no shader-level gamma lift. Existing source evidence still supports the default `CA` formula, not `debug-composite-transfer`. | Production rendering is unchanged. Fresh composite-stage and brightness-attribution matrices confirm `debug-composite-transfer=1` still strongly raises `workComposite/preComposite`, but `debug-renderer-output=linear` barely changes internal target luma. Query-only debug probes now run with zero shader/runtime errors after S1-138. This re-confirms transfer as a contributor but not a promotable source fix. | Low | Keep `OA/CA` transfer open, but do not promote `debug-composite-transfer=1`, `debug-renderer-output=linear`, spotlight-map-off, or darken-off as visual shortcuts. Next useful work is either deeper source/local Three target encoding evidence or a narrower upstream `VA/GA`/spotlight-map material interpretation difference. |
| 68 | S1-141 | `p1.resize` mobile origin/sceneWrap attribution | Source `p1.resize(e,t,n)` keeps the home work scene active on mobile, caps nested work DPR with `Math.min(n,1.5)`, uses `MD=800` as the mobile branch, and switches `cameraController.origin.z` from desktop `5.5` to mobile `5` while moving `sceneWrap.position.y` from `0` to `.3`. | Production rendering is unchanged. Runtime output probe now supports `VIEWPORT=desktop|mobile` and exposes/asserts `resizeMode`, `breakpointMd`, `mobileResizeBranch`, camera origin z, and sceneWrap y. Renderer audit records both desktop and mobile source anchors. Desktop/mobile probes, build, project-media probe, full capture, and band analysis passed; project pages retained five visible media tracks. | Low | Keep as attribution/guardrail. This proves the remaining mobile fog-bed/horizon residual is not caused by a missed `p1.resize` mobile branch; continue from `V1/H1/z1`, `h1/u1/l1`, floor/reflection camera/clip/target state, or source-backed `OA/CA` transfer evidence. |
| 67 | S1-140 | `Lu/I1` source screen-pass material swap | Source `Lu.update()` and `I1.update()` render post passes through a single fullscreen mesh by swapping `this.screen.material`, including luminosity, bloom blur/composite, work `OA`, main `C1/lA`, and FXAA branches. S1-139 recorded that the rebuild still used dedicated pass scenes/meshes for this chain. | Production now introduces source-style `workPostScreen` and `mainPostScreen` fullscreen meshes and renders work bloom/luminosity, work `OA`, main bloom/luminosity, pre-composite, final main composite, and FXAA via material swap on those screens. Shader formulas, uniforms, render targets, pass order, and visual constants are unchanged. Output probe and renderer audit now report `source-single-screen-material-swap`. | Medium | Keep as source-structure parity. QA shows no material luma movement, so this does not solve `OA/CA` transfer or mobile/fog-bed residuals; continue from source-backed transfer/target evidence rather than brightness tuning. |
| 66 | S1-139 | `Lu/I1` screen-pass ownership attribution | Source `Lu` and main `I1` both create one fullscreen `screen` mesh, keep it frustum-unculled, and run post passes by assigning `this.screen.material` before rendering `this.screen` with `this.screenCamera`. The rebuild currently uses dedicated pass scenes/meshes for equivalent Raw GLSL3 materials. This is a structural residual around the same `OA/CA` and `A1/C1` transfer chain, but not source proof for a gamma/brightness change. | Production rendering is unchanged. Runtime output probe now exposes work/main render-manager ownership as source single-screen material-swap versus rebuild dedicated-pass-scene bridge, and the renderer audit records source `Lu`/`I1` screen ownership anchors plus local bridge anchors. Output probe asserts this attribution so future render-manager rewrites cannot hide the bridge. | Low | Treat as source-structure evidence, not a visual fix. A future batch may consolidate pass rendering toward the source single-screen mesh if it can be done safely, but do not use this to promote `debug-composite-transfer` or tune final brightness. |
| 65 | S1-138 | `OA/CA` debug composite attribution surface | After the production `OA/CA` composite moved to `RawShaderMaterial`/GLSL3, the query-only debug composite path still used the old bridge vertex/material and injected `gl_FragColor` early returns. That made `debug-composite-stage`, `debug-composite-darken`, `debug-composite-transfer`, and `debug-composite-lighten` unreliable for final-transfer attribution. | Query-only debug composite now uses `RawShaderMaterial` with `GLSL3`, the source fullscreen vertex, and `FragColor` early-return outputs. The default production path remains `source-OA-raw-glsl3`; `probe-output-color.mjs` now accepts `debug-OA-raw-glsl3` only when a debug composite query is present. Brightness attribution and composite-stage matrices now run with zero probe errors. | Low | Keep this as QA/debug infrastructure only. It does not promote `debug-composite-transfer` or solve the open `OA/CA` transfer interpretation; use the repaired probes to find source-backed evidence before changing production output. |
| 64 | S1-137 | Source `VA/zA` commented include surface | Source ordinary `zA` keeps a source-authored commented include surface around the MeshStandard fragment path (`// #include <...>` for color/map/alpha/ao/light/env/fog/normal/clearcoat/roughness/metalness/logdepth/clipping/tonemapping chunks). The rebuild previously replaced those with explanatory `source VA omits ...` comments, so shader behavior matched but the generated surface was less source-isomorphic and the residual summary did not expose commented include parity. | Production now restores the source-style commented include lines for ordinary `VA-work`, including the source commented `tonemapping_fragment`, while leaving r164-only compile bridge comments in place. Shader residual reporting now exposes commented include source/rebuild columns and confirms `VA-work` commented include lists match with core anchors still matched. | Low | Keep as source-surface parity only. This does not close the remaining strict `GA/VA` bridge, `OA/CA` transfer interpretation, or mobile/fog-bed blockers; continue only from source-backed deltas. |
| 63 | S1-136 | Source `A1/C1` pre-composite helper surface | Source `A1` keeps helper surfaces from shared shader chunks inside the pre-composite fragment, including `luminance`, `coverTexture`, `random`, and the shared `blend(...)` dispatcher naming, even where some helpers are inert in the current formula. The rebuild's generated `A1-pre-composite` core formula matched but used a smaller local helper surface and `sourceBlend(...)` naming. | Production now restores the inert `luminance`, `coverTexture`, and `random` helper surfaces in `A1-pre-composite`, and renames the local blend dispatcher/calls to source `blend(...)` while preserving the same modes, formulas, constants, and output. Shader dump now reports these helper/name anchors through composite core checks. | Low-medium | Keep as source-surface parity only. This does not resolve the open `OA/CA` transfer or mobile/fog-bed visual blockers; continue Phase 1 from source-backed output interpretation, projection/material feel, and environment/floor residuals. |
| 62 | S1-135 | Source `VA/zA` inert displacement fragment sample | Source `zA` ordinary work fragment computes `newUv`, derives grid alpha from that coordinate, samples `vec4 displacement = texture2D(tDisplacement, newUv)`, then leaves that sample non-mutating while continuing into reveal/alpha ownership. The rebuild had equivalent alpha math but used `sourceUv` naming and omitted the inert displacement sample from the ordinary `VA-work` tail. | Production now mirrors the source `newUv` fragment-tail surface and restores the non-mutating `tDisplacement` sample in ordinary `VA-work`. Shader dump core checks now assert the source displacement-sample anchor so future `VA/zA` work cannot silently drop it again. | Low-medium | Keep as source-surface parity only. This should not be treated as a visual fix; Phase 1 remains open for mobile/fog-bed residual, strict projection/material feel, and final transfer/source-output interpretation. |
| 61 | S1-134 | Phase 1 false-target audit after `Lo/H1/V1` clamp | Source review confirms five same-stage anchors are already source-equivalent or not promotable as fixes: `p1.setCameraControllerSettings()` defaults to `targetXY=(.25,.25), rotateAngle=10`; home gallery `yD.animateIn()` overrides that to `targetXY=(1,.5), rotateAngle=20`; `Se.setAmbientColor()` goes through `formatColor()/sr()` raw RGB and writes both ambient light color and `env.material.customUniforms.uDarkenColor`; `C1.uBgColor` initializes with `new Color("#1F1F1F").convertLinearToSRGB()`; and the rebuild-only `backgroundMaterial/backgroundScene` is present but has no current production render call in the default output path. | Production rendering is unchanged. Renderer audit now records hard source anchors for `Se`, `p1` camera settings, home gallery animate-in camera override, and `C1.uBgColor`. This batch explicitly rejects camera-default, ambient-conversion, composite-bg, and unused-background-surface tweaks as unsupported Phase 1 fixes. | Low | Keep as an attribution closeout, not visual completion. Continue Phase 1 from remaining mobile/fog-bed residual, strict `VA/GA` projection/material feel, and final transfer/source-output interpretation only when a narrower source-backed runtime difference is found. |
| 60 | S1-133 | Source `Lo/H1/V1` sky composite target wrapping | Source `Lo.initRenderer()` creates `renderTargetA=new WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false})` and then `renderTargetComposite=this.renderTargetA.clone()` with no wrap override. Because `h1/u1` samples `tSky` with shifted/scaled UVs (`skyUv.x += 0.5`, `texture2D(tSky, skyUv * 2.0)`), the target texture wrapping is part of the environment/fog-bed interpretation. | Production removed the rebuild-only `RepeatWrapping` override from `skyCompositeTarget`, returning the sky composite texture to source/default clamp wrapping. Output probe now hard-asserts `ClampToEdgeWrapping` for `skyComposite`, and renderer audit records source `Lo` clone target defaults. QA passed with project media stable. Desktop center-band delta is `-0.0073`; mobile center-band delta is `-0.0199`, so this is source parity progress rather than a visual closeout. | Low-medium | Keep as source-correct `Lo/H1/V1` target-state parity. Continue Phase 1 from remaining mobile/fog-bed residual, strict projection/material feel, and final transfer interpretation; do not reintroduce repeat wrapping unless source evidence appears. |
| 59 | S1-132 | Source `w1/T1` thumb strip centered wrap QA | Source `w1.updateGalleryProgress(e)` computes `progress=e*totalWidth`, assigns `xHook=itemWidth*index`, wraps `x=(xHook+progress+totalWidth*67890)%totalWidth`, then recenters with `x>totalWidth/2 && (x-=totalWidth)` before using source visibility bounds `[-1.5,1.5]`. This controls the thumb composite map that feeds `SpotLight.map`. | Production logic already matched this source path. The thumb probe now labels the mode as `source-w1-centered-x-wrap` and hard-asserts centered x wrapping plus source visibility bounds; renderer audit now extracts `w1` and checks the source centered-wrap anchors. Static light-chunk comparison also confirms source bundle and local Three r164 `lights_fragment_begin` spotlight-map sampling are identical, so this batch prevents false projection rewrites rather than changing constants. | Low | Keep as attribution/guardrail. Continue Phase 1 from remaining visual transfer/fog-bed/projection feel only when a narrower source-backed runtime difference is found. |
| 58 | S1-131 | Source `i1/t1` floor-reflection blur pass screen ownership | Source `i1` owns a private `screenCamera=new OrthographicCamera(-1,1,1,-1,0,1)`, creates its own fullscreen triangle mesh with `n1()`, and renders the `t1` blur material through `renderer.render(this.screen,this.screenCamera)`. The rebuild still routed floor-reflection blur through the shared background fullscreen scene/camera. | Production now gives floor reflection its own private fullscreen mesh and orthographic camera for the blur loop, matching source `i1` pass ownership. Output probe hard-asserts `blurPassScreenMode=source-i1-private-screen-camera`. | Low-medium | Keep as source-correct reflector target-content attribution. This narrows the reflection chain but does not close Phase 1; mobile/fog-bed and projection/transfer residuals remain open. |
| 57 | S1-130 | Source `h1/u1/l1` environment and `V1/H1/z1` sky shader surface | Source `l1` carries a broad commented include surface around the environment MeshStandard shader, and source `z1` binds `uShaderMix` from missing constant `Zs.SHADER_1_MIX_3`, leaving the runtime value effectively undefined even though the shader declares `uShaderMix`. | Production now mirrors the commented include anchors in `u1-environment`, keeps `uShaderMix` as null/undefined with explicit probe attribution, and hard-fails if the sky uniform binding drifts back to a rebuild-only runtime value. Shader dump confirms `u1-environment` source/rebuild commented include lists now match. | Low | Keep as source-surface attribution only. This batch intentionally does not tune environment color or transfer; Phase 1 remains open for mobile/fog-bed distribution, spotlight/projection feel, and final transfer interpretation. |
| 56 | S1-129 | Source `GA.createPlane()` / local `Ka` mesh ownership | Source `GA.createPlane()` creates a simulation `plane` scaled `35*1.3` by `23*1.3`, creates a separate `rayPlane`, scales the ray plane by `1.5`, attaches only `rayPlane` to `rotationWrap`, and resizes local `Ka` from `this.plane.scale.x/y`. | Production now keeps an explicit per-work `mousePlane` with the source unscaled size/z, leaves it out of the scene graph like source, keeps `rayPlane` parented under `rotationWrap`, and derives local mouse-simulation target sizing/`uCoords` from `mousePlane.scale`. Output probe hard-asserts plane/ray parentage, scale, z, target sizing, UV offset/scale, persistence, and thickness. | Low-medium | Keep as source-correct `GA/Ka` ownership. This improves structural parity and attribution only; Phase 1 remains open for mobile/fog-bed distribution, strict projection/material feel, and transfer interpretation. |
| 1 | S1-43 | Ordinary `VA` vertex/body residual diff | Source `VA` still fully assigns `HA/zA`; rebuild uses a stable chunk bridge. Recent evidence says fragment light chunks, physical response variants, world-position unclamp, and source-like early vertex `screenUv` attribution are low-impact. | Stable bridge is close and production-safe; full `HA` replacement was rejected by console-aware QA. | Medium-high | Stop chasing single `HA` UV/world-position deltas as the main brightness gap. Continue only with residual generated-vs-source body/vertex diagnostics if a specific visible mismatch appears; otherwise prioritize proven transfer/projection contributors. |
| 2 | S1-44 | `OA/CA` final `tScene` transfer | Source `CA` darken formula, blend table, `uDarken=.2`, renderer output `srgb`, and render-target defaults are confirmed. `debug-composite-transfer=1` still moves final home luma strongly, but no source evidence supports promoting it. | Rebuild has source-shaped darken, saturation, bloom and stage probes. Transfer debug is useful as attribution only. | Medium-high | Keep open for source-backed evidence. Do not close Phase 1 by accepting this deviation through visual review. Do not promote gamma-like transfer or tune darken constants. |
| 3 | S1-45 | Spotlight map content/projection after texture fix | Source assigns thumb composite target as `SpotLight.map`; S1-40 made ordinary loaded textures source-default and raised thumb/composite luma substantially. S1-49 confirms the active block projects into the expected center region of the thumb map. | Map ownership, position, intensity, target size, thumb visibility, and active-block map coverage are source-shaped. Remaining risk is map transfer/light multiplication, not gross projection miss. | Medium | Do not change intensity, map assignment, target, or thumb darkness constants. Keep transfer/projection diagnostics; prioritize source-backed `OA/CA` input transfer evidence or a documented technical bridge. |
| 4 | S1-46 | Shared project composite/media brightness | Source `C1/A1` mixes `tWork`, `tMedia`, noise, contrast, background, and media reveal; source `nD` wires `C1.tMedia` to `mediaScene.renderManager.renderTargetComposite.texture`, and source `$1/j1/W1` renders media through a raw target plus transparent composite material. | Current production restores the media raw/composite target path, keeps `C1.tMedia` permanently wired to the media composite texture, and runs A1/main composite even when the home work scene is hidden. Project detail pages are stable but still darker than source. | Medium-high | Keep project pages as regression gates. Media ownership is now source-shaped; remaining project brightness should be treated as shared composite/transfer or media material parity, not as missing media content. |
| 5 | S1-47 | `Ka/GA` mouse/fluid feel | Source per-`GA` `Ka` simulation and render-manager mousesim are broadly ported. Static capture shows mouse term is not the main brightness culprit. S1-50 confirms target sizing, `uCoords`, local UV offset/scale, and active pointer state are source-shaped at rest. | Runtime structure exists and debug probe now covers exact sizing/UV state. Fluid/mouse feel still needs interactive visual QA, but it is not a static brightness blocker. | Low-medium | Treat as structurally attributed. Revisit only for interactive feel QA, not Phase 1 brightness tuning. |
| 6 | S1-48 | Floor/environment/about bridge depth | Source floor reflector, environment shader, and about character manager have source-shaped bridges but not full byte-for-byte ports. | Prior probes show sky/floor are not the main brightness lever; about route is stable. | Medium | Keep as an open bridge-depth item until it is source-fixed, scoped out, or documented as an unavoidable technical bridge. |
| 7 | S1-68 | `VA/HA` vertex mouse projection under Three r164 | Source `HA` computes early vertex `screenUv = gl_Position.xy / uCoords.xy`, assigns `newUv = screenUv`, and applies the mouse displacement as `transformed / (1. - mouseSim.r * .2)`. | Production now uses those two source vertex paths by default, with query-only fallbacks `debug-va-vertex-uv=uv` and `debug-va-world=compat` for attribution. | Medium | Keep as source-correct. It improves shader-body parity but does not close Phase 1 because band analysis still shows the hard horizon/overbright mid-field gap. |
| 8 | S1-69 | `VA/zA` fragment tail and ordinary material surface | Source `zA` writes `gl_FragColor` through `opaque_fragment`, then mutates `gl_FragColor.rgb` and `.a`; ordinary `VA` has no auxiliary reveal/scroll opacity branch and declares `uTime` in the fragment surface. | Production now defaults to the source-style fragment tail, keeps `debug-va-output-tail=compat` as a query-only fallback, restores ordinary alpha/reveal/mouse formulas, splits auxiliary-only fragment uniforms out of ordinary `VA`, and includes `uTime` in ordinary fragment pars. | Medium | Keep as source-correct. Remaining ordinary fragment residuals are r164 shader-lib physical macro declarations (`dispersion/anisotropy*`) and the broader hard horizon/overbright mid-field gap, so the next batch should move to `OA/CA` transfer or render-target attribution rather than more unsupported VA tuning. |
| 9 | S1-70 | Source `a1` floor geometry | Source `class Tu extends Vt` is Three `CircleGeometry`; `a1.init()` creates `new Tu(60,32)`, rotates it by `-PI/2`, and attaches the reflector. The rebuild had incorrectly used `PlaneGeometry(60,32)`, creating a rectangular floor/reflection surface. | Production now uses `CircleGeometry(60,32)` for the floor mesh and the output probe reports floor/reflection scene state for future attribution. Desktop center-band delta moved to roughly `+0.001` against source and the previous mid-page floor/reflection collapse is gone. | Low-medium | Keep as source-correct. Continue Phase 1 from remaining mobile/background and cube/thumb projection deltas; do not reintroduce plane floor geometry. |
| 10 | S1-71 | Home spotlight target / thumb projection depth | Source `SD.init()` assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`, then sets spotlight position `(0,0,3.7)`, target `(0,0,-8)`, and intensity `220`. The rebuild had the map and position right but reset the home target to `(0,0,0)`. | Production now keeps the home spotlight target at `(0,0,-8)` in constructor/default state and `initHomeSpotlight()`. Thumb spotlight probe confirms `hasMap=true`, target `[-8 z]`, intensity `220`, and no runtime errors. | Low-medium | Keep as source-correct. Continue projection parity from remaining `SpotLight.map` transfer/light multiplication and `VA` shader bridge, not by changing source spotlight position/intensity constants. |
| 11 | S1-72 | Main `I1/Lu` default screen path | Source `I1.initSettings()` defaults main `renderToScreen=true` with bloom/luminosity/blur/fxaa disabled, and `I1.update()` renders its `C1/A1` `compositeMaterial` directly to screen in that default branch. The rebuild still sent the completed `A1/C1` target through an additional generic `mainCompositeFragment`, adding a non-source rgbshift/fluid-light tail even when all main post passes were disabled. | Production now short-circuits the default main path and renders `preCompositeScene` directly to the canvas when source main blur/bloom/fxaa are all disabled. The optional main-composite path remains available only for enabled source main post passes. | Low-medium | Keep as source-correct. QA shows stable home/project captures and center-band parity remains close; remaining Phase 1 work should target the hard horizontal boundary and residual `VA`/projection feel, not reintroduce the extra main composite pass. |
| 12 | S1-73 | Source `IT` camera controller matrix path | Source `IT` drives the real camera through `group -> rotateGroup -> innerGroup`, keeps all three groups `matrixAutoUpdate=false`, sets `rotateGroup.rotation.y=Math.PI`, lerps `group.position`, applies roll to `rotateGroup.rotation.z`, then decomposes `innerGroup.matrixWorld` into the camera. | Production now uses the same controller group structure instead of directly calling `camera.lookAt()` and mutating `camera.rotation.z`. Output probe exposes camera quaternion/controller/rotate-group state. | Low-medium | Keep as source-correct. This fixes camera matrix ownership for spotlight/floor-reflection projection attribution; remaining visual gaps should continue from `VA`/projection and render-target transfer, not from direct camera rotation tweaks. |
| 13 | S1-74 | Source `IT` pointer sampling lifecycle | Source `IT.addListeners()` registers `pointerdown`, `pointermove`, and `pointerup`; down/up both call `onPointerMove`, so camera mouse state updates immediately on press/release as well as move. | Production now binds/removes all three pointer events to the shared pointer handler instead of only listening to `pointermove`. | Low | Keep as source-correct interaction sampling. This does not claim a static visual fix; it keeps camera/mouse/fluid input lifecycle aligned for interactive QA. |
| 14 | S1-75 | `OA/CA` core formula audit tooling | Source `OA` uses `CA` for the work render-manager composite. Manual diff showed the remaining `OA` shader delta is helper expansion / unused variable surface, while the live formula anchors are the same: scene rgbshift, bloom rgbshift/addition, fluid luminance add, darken opacity, multiply-darken, lighten-black, saturation, and tonemapping. | `scripts/dump-va-shader.mjs` now reports `compositeCoreChecks` for dumped shaders. Current `OA-work-composite` reports all core anchors present in both source and rebuild. | Low | Treat `OA/CA` formula edits and gamma-like transfer promotion as unsupported. Continue Phase 1 from upstream `VA`/spotlight-map content/transfer or source renderer/target interpretation evidence. |
| 15 | S1-76 | `VA/HA` vertex core audit tooling | Source `HA` and the rebuild work vertex shader both include the core screen-UV, local mouse, perlin-height, pre-perlin mouse scale, reveal mix, mouse-z, spread, and source-world divide anchors after normalization. The older text-level key check could misread formatting/spelling differences such as `fadeDiplacement`/`fadeDisplacement` and `.05`/`0.05` as a production mismatch. | `scripts/dump-va-shader.mjs` now reports `vertexAnalysis.coreChecks` separately from broader residual diffs. Current checks show every core anchor present in both source and rebuild. | Low | Treat the old `transformed *= 1.0 - mouse` key-check mismatch as a diagnostic false positive. Do not tune the vertex path without a narrower source-backed residual tied to visible output. |
| 16 | S1-77 | `T1/x1/Lo` thumb render pass clearing | Source `Lo.update()` renders the thumb raw target and composite target with `setRenderTarget(...); render(...)` and does not explicitly call `renderer.clear()` between those passes. The rebuild still cleared both thumb targets every frame before rendering. | Production now removes the rebuild-only explicit clears from `renderThumbTargets()`, keeping source `Lo/x1` pass ownership for the spotlight map target. | Low-medium | Keep as source-correct after QA. Do not generalize this to `Lu/kA` work render-manager clears without porting the full source render-manager structure. |
| 17 | S1-81 | Source `i1` reflection target/camera initialization | Source `i1` creates the raw reflection target with `depthBuffer:false`, clones read/write targets, then toggles only the raw target to `depthBuffer=true`; it also uses a default `PerspectiveCamera` for the virtual reflector camera before copying the real projection each update. | Production now follows that create-clone-toggle sequence, keeps read/write targets depthless, uses the default reflector camera surface, and exposes reflector target/camera state in `reflectionStateProbe()`. | Low-medium | Keep as source-correct. Phase 1 remains open because this is reflector ownership parity, not a visual closeout for the remaining mobile/fog-bed and projection residuals. |
| 18 | S1-82 | Source `V1/H1/Lo` sky render pass clearing | Source sky scene uses `H1 extends Lo`; source `Lo.update()` renders `renderTargetA` and `renderTargetComposite` directly without explicit `renderer.clear()` calls. The rebuild still cleared both sky raw and sky composite targets every frame. | Production now removes those rebuild-only sky target clears and reports `skyPassClearing=source-Lo-no-explicit-clear` in the output probe. | Low-medium | Keep as source-correct. The sky target remains non-empty and project pages remain stable, but Phase 1 remains open for mobile/fog-bed and projection residuals. |
| 19 | S1-83 | Source `A1/C1` pre-composite shader flow | Source `A1` keeps the inert `displacementUv` and `vignetteF` computations and samples `tNoise` before contrast/saturation/media, then applies the two noise mixes after media. The rebuild had removed those two computations and relocated the noise sample to the tail. | Production now restores those source flow details without changing constants or final formula, and `scripts/audit-renderer-output.mjs` now reports `A1` order and inert-computation residuals accurately. | Low-medium | Keep as source-correct. This closes an audit residual in `A1/C1`; Phase 1 remains open because mobile/fog-bed and projection residuals still require source-backed attribution. |
| 20 | S1-93 | Source `Lu` mip/fluid resize ownership | Source `Lu.resize()` sizes work render-manager targets at CSS DPR size, then switches to `Fa(renderSize)/4` for luminosity/bloom and `Fa(renderSize)/4/3` for fluid. | Work `Lu/kA` quarter-POT ownership remains source-correct. The earlier extension of that conclusion to main `I1` was a historical misread and is corrected by S1-101. | Low-medium | Keep only the work `Lu/kA` part as source-correct. Main render-manager sizing must follow source `I1`, not `Lu`. |
| 21 | S1-94 | Source `Pe/p1` DPR ownership split | Source `Pe` caps global DPR at `2` normally and `1.5` in low-res, while source `p1.resize()` passes `Math.min(n,1.5)` to the work scene, each `GA`, and about blocks. The rebuild had globally capped every render path at `1.5`. | Production now keeps global/main/media/canvas DPR on source `Pe.dpr`, while work raw/composite, work bloom, screen mouse simulation, and work item `uCoords` use source `p1` work DPR capped at `1.5`. Output probes expose `dprPolicy` and work/main target sizes. | Low-medium | Keep as source-correct. High-DPR QA confirms global/canvas/main at DPR `2` while work stays DPR `1.5`; Phase 1 remains open for mobile/fog-bed and strict projection/material residuals. |
| 22 | S1-95 | Source `GA/Ka` mouse plane attribution | Source `GA.createPlane()` uses plane scale `35*1.3` by `23*1.3`, ray plane scaled again by `1.5`, `uUvOffset=(.25,.25)`, `uUvOffsetScale=1.5`, and `resize()` calls `mouseSim.onResize(plane.scale.x, plane.scale.y)`. | Production behavior was already source-shaped; this batch adds renderer-audit anchors and hard output-probe assertions for local target size, `uCoords`, UV offset/scale, ray-plane geometry/z, persistence, and thickness. | Low | Treat `GA/Ka` plane sizing as verified. Do not tune brightness through local mouse sim; remaining Phase 1 work should move to exact `VA` material/projection or mobile fog-bed evidence. |
| 23 | S1-96 | Shader/WebGL QA gate and `VA` sheen attribution | A rejected test edit showed that changing r164 physical-material sheen chunks can compile-fail even when text-level shader residuals look plausible. Source `zA` declares `USE_SHEEN` through the material surface, but does not have the modern r164 outgoing-light sheen tail in the captured source body. | Production rendering is unchanged. Shader dump now splits `USE_SHEEN` declaration evidence from the r164 `sheenEnergyComp` outgoing-light tail, and the output probe now fails hard on shader/WebGL console errors instead of only reporting them. | Low | Keep as QA guardrail. Do not edit physical-material sheen chunks unless the dump/probe pair proves the exact source-safe replacement and project media probes remain green. |
| 24 | S1-97 | Source `VA/zA` r164 sheen outgoing tail | Source `zA` has the ordinary `USE_SHEEN` declaration/uniform surface but its captured outgoing-light body does not include the modern r164 `sheenEnergyComp` compensation tail. After S1-96, the shader dump can distinguish declaration parity from body residuals. | Production now strips only the r164 `sheenEnergyComp` outgoing-light tail from ordinary work-block `VA`, preserving the `USE_SHEEN` declaration surface and all existing material uniforms. Shader dump reports `r164SheenOutgoingTail` source false / rebuild false with no WebGL console errors. | Low-medium | Keep as a narrow source-correct material-body alignment. It does not close Phase 1; mobile/fog-bed and broader projection/material feel remain open. |
| 25 | S1-98 | Source `i1` reflector update ordering | Source `i1.update()` calls `virtualCamera.updateMatrixWorld()` before copying the source camera projection matrix, and clears the raw reflection target only through `renderer.autoClear===false && renderer.clear()`. | Production now follows that reflector camera/projection order and conditional raw-target clear. Renderer audit records the source anchors, and output probe fails if the reflection probe no longer reports the source clear/order modes. | Low-medium | Keep as source-correct reflector ownership. It is not expected to close Phase 1 alone; continue floor/environment target-content attribution and projection/material residual work. |
| 26 | S1-99 | Source `VA/zA` material macro surface | Source `zA` uses old physical-material macro spellings such as `USE_SPECULARCOLORMAP`, `USE_SPECULARINTENSITYMAP`, `USE_SHEENCOLORMAP`, and `USE_SHEENROUGHNESSMAP`; the rebuild bridge still carried modern underscore spellings after prior material-body fixes. | Ordinary work-block `VA` now rewrites those four macro names to the source surface, and shader dump reports source-style specular and sheen-map macro checks true while modern underscore checks are false in both source and rebuild. | Low-medium | Keep as a source-correct material-surface alignment. This narrows shader residuals but does not close Phase 1; mobile/fog-bed, strict projection feel, and remaining source `bsdfs`/`opaque_fragment` bridge depth remain open. |
| 27 | S1-100 | Source `Lu/kA` bloom pass clearing | Source `Lu.update()` renders luminosity, horizontal blur, vertical blur, and bloom-composite fullscreen passes directly after `setRenderTarget(...)` without explicit `renderer.clear()` calls. The rebuild still cleared those fullscreen pass targets before rendering. | Production now removes explicit clears from the shared `renderBloomChain()` passes and both work/main luminosity bright passes. Output probe reports `bloomPassClearing=source-Lu-no-explicit-clear` for work and main render managers, and fails if either drifts. | Low-medium | Keep as source-correct render-manager pass ownership. This does not close Phase 1; remaining gaps are still mobile/fog-bed distribution, projection/material feel, and deeper source-isomorphic render-manager structure. |
| 28 | S1-101 | Source `I1` main render-manager sizing | Source `I1.resize()` uses `Fa(renderSize)/2` for main luminosity/bloom and then resizes main fluid with that half-POT size divided by `3`; this differs from work `Lu/kA`, which uses `/4`. | Production now restores main `I1` half-POT bloom/luminosity/fluid sizing while leaving work `Lu/kA` on quarter-POT. Output probe and renderer audit now assert the split so `I1` cannot be accidentally collapsed back into `Lu`. | Low-medium | Keep as source-correct sizing ownership. This is a structural correction, not a Phase 1 visual closeout. |
| 29 | S1-102 | Source `Iu/p1/h1` update ordering | Source `Iu.update()` renders the render-manager first, then updates the camera controller and components; source `p1.update()` calls `super.update()` before work items/about blocks, so environment `h1.update()` is a component update after the current frame render. | Production now writes environment `uTime` in the post-render next-frame update path instead of the pre-render tick path. Renderer audit checks source `Iu.update()` and `p1.update()` anchors, and output probe asserts `environmentUpdateOrder=source-p1-component-post-render`. | Low-medium | Keep as source-correct frame-order ownership. This is a one-frame environment timing alignment, not a Phase 1 visual closeout; mobile/fog-bed and projection/material residuals remain open. |
| 30 | S1-103 | Source `V1/H1/z1` sky composite uniform surface | Source `z1` declares shader text for `uShader1Mix3` and `uShader3Scale` in `B1`, but its runtime uniform object binds only `tScene`, `uTime`, `uShader1Alpha`, `uShader1Speed`, `uShader2Speed`, `uShader1Scale`, `uShader2Scale`, and `uShaderMix`. | Production now removes the rebuild-only runtime bindings for `uShader1Mix3` and `uShader3Scale`, while keeping them shader-declared. Output probe reports both as `source-declared-only`, and renderer audit checks source `V1/H1/z1` sizing/update/material anchors. | Low | Keep as source-correct sky composite surface cleanup. This narrows environment/sky ownership but does not close Phase 1; mobile/fog-bed distribution and projection/material residuals remain open. |
| 31 | S1-104 | Source `GA` rotation-wrap scale ownership | Source `GA.createInstancedMesh()` attaches the instanced mesh to `rotationWrap` and applies `settings.scale=.09` to `rotationWrap`; source `GA.createPlane()` attaches `rayPlane` to the same `rotationWrap` with unscaled geometry/position, then local mouse simulation resizes from the unscaled plane size. | Production now restores that object hierarchy: each work item has `group -> rotationWrap(scale=.09) -> mesh + rayPlane`, mesh scale stays identity, and ray-plane geometry/z are no longer pre-multiplied by grid scale. Output probe asserts the hierarchy/scale shape and renderer audit records source anchors. | Low-medium | Keep as source-correct `GA` matrix/projection ownership. World dimensions remain stable, but Phase 1 is still open for mobile/fog-bed distribution and strict projection/material residuals. |
| 32 | S1-105 | Source `Lu/I1` render-manager clearing ownership | Source renderer `qw` sets `autoClear=false`; source `Lu.update()` and `I1.update()` render raw, blur, FXAA, and composite targets directly with `setRenderTarget(...); render(...)` except for explicitly source-owned special cases such as reflector raw clear and media scene `autoClear=true`. | Production now removes rebuild-only explicit clears from the work raw/composite pass, main pre-composite pass, main blur pass, main FXAA pass, frame start, and hidden-home work fallback. Output probe reports work/main render-manager clear modes and hard-fails on drift; renderer audit records source `qw`, `nD`, `Lu`, and `I1` anchors. | Medium | Keep as source-correct render-manager ownership after QA. Project media remains stable, but Phase 1 stays open for mobile/fog-bed distribution and strict projection/material residuals. |
| 33 | S1-106 | Source `Xt.preloadTextures()` wrapping ownership | Source preloads blue-noise, floor-normal, and `perlin2` with `ci=RepeatWrapping=1000`; `perlin1` uses `vo=MirroredRepeatWrapping=1002`. | Production now loads work-block `perlin1` with `MirroredRepeatWrapping` while keeping A1/C1 `perlin2`, blue-noise, and floor-normal on `RepeatWrapping`. Output probe exposes and hard-fails on wrapping drift; renderer audit records the source `Xt.preloadTextures()` anchors. | Low-medium | Keep as source-correct texture ownership. This fixes a concrete earlier misread where `vo` had been documented as clamp; Phase 1 remains open for fog-bed and projection/material parity. |
| 34 | S1-107 | Source `h1/p1` environment hierarchy ownership | Source constructs `env=this.add(h1)`, where `h1` is a group that owns position `y=-12.65` and rotation `-rotationAdjustment`; the environment mesh is a local child at origin. | Production now wraps the environment mesh in `environmentGroup`, moves y/rotation ownership to the group, keeps the mesh local at origin, and hard-fails output probe if the hierarchy drifts. Renderer audit records source `h1` and `p1` environment hierarchy anchors. | Low-medium | Keep as source-correct hierarchy ownership. World transform is equivalent, so this is not a visual closeout; Phase 1 remains open for fog-bed distribution and projection/material parity. |
| 35 | S1-108 | Source `u1/a1` environment and reflector ownership surface | Source `u1` extends `MeshStandardMaterial`, stores runtime bindings on `customUniforms`, patches `c1/l1` in `onBeforeCompile`, sets `dithering=true`, and is constructed by `h1` with `side=BackSide`, `envMapIntensity=1`, `fog=false`. Source `a1` hides its component group during `onBeforeRender` before calling `reflector.update()`. | Production now exposes the source `u1` `customUniforms` alias, adds hard output-probe assertions for material mode, fog/dithering/env intensity, and records source `a1` reflection visibility ownership. Renderer audit now records source `u1` and `a1` anchors. | Low | Keep as source-correct interface and QA hardening. This prevents future background/fog-bed work from misattributing the floor hidden-state or environment material surface, but does not close the mobile/fog-bed visual residual. |
| 36 | S1-109 | Source `o1/t1` floor material and reflection blur shader surface | Source floor material `o1` and reflection blur material `t1` use raw shader surfaces; source blur fragment `QA` is GLSL3-shaped with `in vUv`, `out FragColor`, `texture(...)`, and `mix(tMapped, blurred, 1.25)`. | Production now reports the floor material as `source-o1-raw-glsl3`, uses `RawShaderMaterial`/`GLSL3` for the reflection blur material, dumps both `o1-floor-material` and `t1-floor-reflection-blur`, and hard-fails output probes if the floor/blur material modes drift. | Low-medium | Keep as source-correct floor shader-surface alignment. This narrows the floor/reflector bridge, but Phase 1 remains open for mobile fog-bed distribution, strict projection/material feel, and transfer interpretation. |
| 37 | S1-110 | Source `o1` floor fragment branch surface | Source `o1` keeps conditional `USE_MAP`, `USE_NORMALMAP`, `USE_FOG`, and `DITHERING` branches in the raw fragment shader; runtime `a1` constructs it with `normalMap` only. | Production now restores the full conditional fragment branch surface while preserving source runtime branch state: `USE_NORMALMAP=true`, `USE_MAP=false`, `USE_FOG=false`, `DITHERING=false`. Shader dump hardens floor core checks and output probe asserts the branch state. | Low-medium | Keep as source-correct floor shader-body alignment. Do not enable floor fog/map/dithering as a visual tweak; Phase 1 remains open for the mobile fog-bed residual and projection/material parity. |
| 38 | S1-111 | Source `h1/V1/Du` environment geometry and sky target QA surface | Source `h1` creates `new Du(300,10)` with `speed=5e-5`; `Du` is an `IcosahedronGeometry` with radius/detail parameters. Source `V1` sizes its sky render targets as a square `height*.75`, and low-res mode freezes sky `uTime` at `0`. | Production rendering is unchanged, but output probes now report and assert the source `Du` geometry metadata, sky target sizing mode, expected target size, and source low-res/live sky time mode. Renderer audit now extracts and checks `h1`, `V1`, and `Du` anchors. | Low | Keep as source-correct environment/sky QA hardening. This prevents future fog-bed work from drifting geometry or sky target ownership, but Phase 1 remains open for mobile fog-bed distribution, strict projection/material feel, and transfer interpretation. |
| 39 | S1-112 | Source `z1` sky composite raw GLSL3 surface | Source `z1` extends the raw material surface with `glslVersion:lt`, `fragmentShader:B1`, `blending:ot`, `transparent:true`, `depthWrite:false`, and `depthTest:false`. The rebuild still used a regular `ShaderMaterial` bridge for the sky composite. | Production now uses `RawShaderMaterial`/`GLSL3` for the sky composite, converts the shader to the source-style `in/out` and `texture(...)` surface, dumps `z1-sky-composite` against source `B1/tl`, and hard-fails output probes on material-mode or GLSL version drift. | Low-medium | Keep as source-correct sky render-manager surface alignment. This narrows the `V1/H1/z1` bridge, but Phase 1 remains open for mobile fog-bed distribution, strict projection/material feel, and transfer interpretation. |
| 40 | S1-113 | Source `OA/C1` composite raw GLSL3 surface | Source `OA` and `C1` both extend the raw material surface with `glslVersion:lt`; `OA` uses `fragmentShader:CA`, and `C1` uses `fragmentShader:A1`. The rebuild formulas were source-shaped but still ran through regular `ShaderMaterial` bridge surfaces. | Production now uses `RawShaderMaterial`/`GLSL3` for default work `OA` and pre-composite `C1/A1`, converts both shader surfaces to `in/out`, `texture(...)`, and `FragColor`, dumps them with the raw fullscreen vertex, and hard-fails output probes on material-mode or GLSL-version drift. Debug composite keeps the old bridge path for query-only diagnostics. | Low-medium | Keep as source-correct core composite surface alignment. This narrows the most central `OA/C1` bridge without tuning color constants, but Phase 1 remains open for mobile fog-bed distribution, strict projection/material feel, and transfer interpretation. |
| 41 | S1-114 | Source `lA/W1/sg/rg/cg/ig` helper pass raw GLSL3 surface | Source main/media/helper pass materials extend the raw material surface with `glslVersion:lt`: `lA` uses `aA`, `W1` uses `G1`, `sg` uses `NT`, `rg` uses `kT`, `cg` uses `nA`, and `ig` uses `UT`; source `sg/NT` binds its input as `tMap`. | Production now uses `RawShaderMaterial`/`GLSL3` and source fullscreen vertex surface for main composite, media composite, luminosity, bloom blur, bloom composite, and FXAA helper passes. Shader surfaces use `in/out`, `texture(...)`, and `FragColor`; `sg` now uses source `tMap`; output probes hard-fail on material mode or GLSL drift; shader dump compares all helper fragments/vertices against source. | Low-medium | Keep as source-correct helper render-manager surface alignment. This removes another bridge layer without tuning constants. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 42 | S1-115 | Source `rg/ig` blur and FXAA shader body surface | Source `Lu.initRenderer()` creates five blur materials with `new rg(e[t])` for `[3,5,7,9,11]`; source `rg/kT` uses compile-time `defines:{KERNEL_RADIUS:e,SIGMA:e}` rather than runtime kernel uniforms. Source `ig` binds vertex shader `FT`, which computes `v_rgbNW/NE/SW/SE/M` neighbor UVs for fragment `UT`. | Production now creates one `rg` material/scene per mip for work and main bloom chains, moves kernel radius/sigma into material defines, removes runtime `uKernelRadius/uSigma`, and switches FXAA to the source `FT/UT` neighbor-UV surface. Output probe and shader dump now hard-check blur material count/defines/no runtime kernel uniforms and FXAA neighbor-UV macros/call shape. | Low-medium | Keep as source-correct helper shader-body alignment. This narrows the helper pass bridge without tuning constants. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 43 | S1-116 | Source `Na/HT/zT` standard blur pass surface | Source `Lu/I1` ordinary blur pass uses `hBlurMaterial=new Na(...)` and `vBlurMaterial=new Na(...)`; source `Na` is a raw GLSL3 material with `uBluriness`, `uDirection`, `uResolution`, vertex `HT`, and fragment `zT` using the shared 9-tap `og` blur helper. This is separate from bloom `rg/kT`. | Production now uses a dedicated `Na-standard-blur` raw GLSL3 material for the horizontal/vertical ordinary blur pass instead of reusing bloom `rg`. Output probe asserts `source-Na-raw-glsl3`, `uBluriness`, no bloom kernel defines, and source directions. Shader dump expands `og` into `zT` and hard-checks the 9-tap blur body. | Low-medium | Keep as source-correct render-manager branch alignment. The branch is source-disabled by default, so this is not a visual closeout. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 44 | S1-117 | Source `L1/R1/P1` lensflare pass surface | Source `I1.initSettings()` defines `lensflare:{scale:(1.5,1.5), exposure:1, clamp:1, enabled:false}`; source `I1.initRenderer()` owns `renderTargetLensflare`; source `L1` is a raw GLSL3 material using vertex `R1`, fragment `P1`, uniforms `tMap/uLightPosition/uScale/uExposure/uClamp/uResolution`, and `depthTest/depthWrite:false`. | Production now has a source-shaped `L1-lensflare` raw GLSL3 material/scene, keeps the full-resolution lensflare target wired into `C1/A1.tLensflare`, gates rendering behind the source default `enabled:false`, and records the source explicit-clear pass shape. Output probe and shader dump hard-check `L1` uniforms/defaults, GLSL surface, clear mode, and core `P1` fragment anchors. | Low | Keep as source-correct default-disabled render-manager surface alignment. This should not alter the current visual output; it closes the missing lensflare branch surface but Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 45 | S1-118 | Source `ag/GT/qT/jT/KT/JT` main-fluid pass surface | Source `ag` owns float FBOs with `depthBuffer:false`, `stencilBuffer:false`, `type:FloatType`; source `GT/qT/jT/KT/JT` use raw GLSL3 materials, source advection/divergence/poisson/pressure use `blending:ot`, and source force uses `blending:Uc`. | Production main-fluid passes now use `RawShaderMaterial`/`GLSL3`, source-style `in/out`, `texture(...)`, and `FragColor`, with `NoBlending` for advection/divergence/poisson/pressure and `AdditiveBlending` for force. Output probe now hard-checks material modes, GLSL versions, depth flags, blending, and float target ownership; shader dump maps the five `ag-*` pass shaders to source `Co/XT/Sf/$T/WT/YT/ZT`; renderer audit records source `ag` and pass material anchors. | Low-medium | Keep as source-correct main-fluid render-manager surface alignment. This removes a real source pass-surface mismatch without tuning visual constants. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 46 | S1-119 | Source `GT.createBounds()` advection boundary pass | Source `GT.init()` calls `createBounds()`, which adds a line segment geometry around the fluid domain with vertex shader `VT`, fragment `Sf`, `glslVersion:lt`, `blending:ot`, and the same advection uniforms as the main `Co/Sf` material. | Production now adds the source `VT/Sf` `ag-advection-bounds` line pass to the advection scene, using `LineSegments`, the source boundary vertex coordinates, shared advection uniforms, and raw GLSL3/no-blending material state. Output probe asserts the boundary material, shared uniforms, and two-child advection scene; shader dump maps `ag-advection-bounds` to source `VT/Sf`; renderer audit checks the source geometry and line-add anchors. | Low-medium | Keep as source-correct advection boundary ownership. This completes the missing source `GT` boundary surface but does not close Phase 1; remaining blockers are still mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 47 | S1-120 | Phase 1 shader residual audit and source `$T` force surface | Source `$T` force fragment declares `force`, `center`, `scale`, and `px`; the rebuild's `ag-force` vertex had the placement uniforms but the fragment only declared `force`. Current shader dumps also needed a compact source-vs-rebuild residual board so the next 5-10 point batches are based on current generated shaders rather than memory. | Production now declares `center`, `scale`, and `px` in the `ag-force` fragment surface without changing the formula. `scripts/summarize-phase1-shader-gaps.mjs` now generates `phase1-shader-residuals.md/json` from a dump directory, and `dump-va-shader.mjs` automatically writes that report after each shader dump. | Low | Keep as source-correct pass-surface and QA attribution work. S1-121 supersedes the older `VA-work` include-surface note. Phase 1 remains open. |
| 48 | S1-121 | Source `VA/zA` include surface | Source `zA` keeps `#include <bsdfs>` before lights parsing and `#include <opaque_fragment>` before the source `gl_FragColor.rgb/a` tail mutations. The rebuild had manually expanded the opaque output tail, leaving an avoidable include-surface residual even though core checks matched. | Ordinary work-block `VA` now restores the source include surface by inserting `bsdfs` in the work variant and using `#include <opaque_fragment>` before the existing source-style tail mutations. The shader residual report text is now conditional so it cannot keep reporting a stale `VA-work` include residual after the generated dump clears it. | Low-medium | Keep as source-correct `VA/zA` surface alignment. Shader dump now reports no `VA-work` source/rebuild include or uniform residuals, but Phase 1 remains open for generated shader text/bridge depth, mobile fog-bed distribution, strict projection/material feel, and transfer interpretation. |
| 49 | S1-122 | `VA/zA` r164 bridge attribution | Source `zA` uses the old `SPECULAR` define surface under `PHYSICAL`, but the local Three r164 `lights_physical_fragment` chunk requires `USE_SPECULAR` and does not accept `SPECULAR`. The remaining `VA-work` text diff therefore needed to be classified so it is not mistaken for a safe source-constant or visual tweak. | Production rendering is unchanged. Shader dump now records `vaBridgeCompatibility`, reports the Three r164 `lights_physical_fragment` chunk surface, and `phase1-shader-residuals.md` adds a Bridge Notes column that classifies `VA-work` as an `r164 compile bridge` while still showing include/uniform/core anchors matched. | Low | Keep as QA attribution. Do not replace `USE_SPECULAR` with `SPECULAR` unless the entire `lights_physical_fragment` dependency is source-ported and WebGL-verified. Phase 1 remains open for visual parity, but this removes one false implementation target. |
| 50 | S1-123 | Source `xt/Se` visual defaults | Source `xt` defines `darken=.2`, `saturation=.35`, `contrast=1.1`, `thumbDarknessIntensity=.5`, `thumbDarknessColor="#000000"`, while `Se.init()` seeds those settings before route payloads take over. The rebuild still had pre-route/fallback state at `darken=.1`, `saturation=1.15`, and thumb darkness fallback `0`. | Production now names and uses source visual defaults for WebGL initial state, home fallback darken/saturation, about defaults, thumb fallback darkness/color/saturation/mouse-lightness, and separate project-detail fallback constants. Output and thumb probes expose and assert the source defaults. | Low | Keep as source-correct visual-state ownership. This removes a route-boundary/fallback mismatch without tuning projection or shader formulas. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 51 | S1-124 | Source `k1/O1/N1/F1` displacement pass | Source `k1` owns a wavves/displacement scene through `O1 extends Lo`; source `N1` is a raw GLSL3 material using fragment `F1`, source fullscreen vertex `tl`, tonemapping includes, direct `Lo.update()` render calls, and a square target sized at `height/10`. The rebuild still used a bridge `ShaderMaterial`, bridge vertex, `gl_FragColor` surface, and an explicit clear before rendering the displacement target. | Production now uses `RawShaderMaterial`/`GLSL3` for the displacement composite, source fullscreen vertex surface, source-style `in/out` and `FragColor` fragment output, tonemapping include surface, transparent/no-blending material state, target resize metadata, and source `Lo` no-explicit-clear ownership. Output probe and shader dump expose and assert the new pass surface. | Low-medium | Keep as source-correct displacement render-manager alignment. The source-only `tScene` uniform remains an unused source surface residual to revisit only if a narrower `N1/F1` evidence pass requires it. Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 52 | S1-125 | Source `N1/F1/tl` displacement residual cleanup | After S1-124, source `N1/F1` still had three avoidable same-chain residuals: `uniform sampler2D tScene`, source global vignette constants `vignout/vignin/vignfade`, and source `tl` matrix fullscreen vertex path. The residual summary also omitted `N1-displacement-composite` from its focused table. | Production now binds source `tScene`, uses source `F1` global vignette constants, renders the displacement pass with an isolated source `tl` matrix fullscreen vertex/mesh path, and includes `N1-displacement-composite` in `phase1-shader-residuals.md`. Output probe hard-asserts `vertexMode`, `tSceneBound`, and source vignette constant mode. | Low-medium | Keep as source-correct `N1/F1/tl` cleanup. Do not generalize the matrix fullscreen vertex to other stable pass materials without a dedicated source/QA batch. Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 53 | S1-126 | Source `Lo/tl` sky/thumb composite vertex surface | Source `Lo` composite screen meshes use fullscreen-triangle geometry plus matrix fullscreen vertex `tl`; source `z1` and `_1/x1` both bind `vertexShader:tl`. The rebuild still used the direct clip-space bridge vertex for sky and thumb composites, and `z1/B1` was missing the source `tonemapping_pars_fragment` include surface. | Production now renders `z1-sky-composite` and `x1-thumb-composite` through the isolated source `tl` fullscreen vertex/mesh path, adds the missing `z1` tonemapping pars include, maps `x1-thumb-composite` to source `tl` in shader dump, and hard-asserts sky composite vertex mode in output probe. | Low-medium | Keep as source-correct `Lo/tl` composite alignment. Do not apply `tl` to `OA/lA/W1/sg/rg/cg/Na`, which source maps to other vertex shaders. Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 54 | S1-127 | Source `cg/nA` bloom composite uniform surface | Source `cg` binds `defines:{NUM_MIPS:5,DITHERING:e}`, fragment `nA`, vertex `iA`, uniforms `tBlur1..tBlur5` and `uBloomFactors[NUM_MIPS]`, and applies the shared dither helper behind `#ifdef DITHERING`. The rebuild still used rebuild-only `tBloom1..5` and `uFactor1..5` uniforms with `highp` precision and no source dither branch. | Production now uses source `tBlur*`, `uBloomFactors`, `NUM_MIPS=5`, `mediump` precision, and the source dither helper/branch surface for both work and main bloom composite materials. Output probe hard-asserts source uniform mode, array factors, define ownership, and absence of rebuild-only uniforms. | Low-medium | Keep as source-correct `cg/nA` surface alignment. This changes interface and shader surface only, not bloom strength/radius constants. Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation. |
| 55 | S1-128 | Source `OA/CA` mixed/blend shader surface | Source `CA` keeps the final work composite in a `mixed` variable, calls the shared `blend(...)` dispatcher for modes `15` and `11`, declares `luminance`, `vignette`, vignette globals, and inert `green`/`greenLight` locals. The rebuild had an equivalent but simplified `color/sourceBlend` surface that made this central shader less source-shaped. | Production now uses the source-style `mixed` variable, source `blend(...)` entry, `luminance` and `vignette` helper surfaces, source vignette globals, and inert color locals while preserving the same output formula and constants. Output probe hard-asserts `source-CA-mixed-blend-surface` and absence of rebuild-only `sourceBlend` calls. | Low-medium | Keep as source-correct `OA/CA` shader-surface alignment. This does not solve the open transfer/color interpretation gap; it removes a central source-surface residual without promoting debug transfer or tuning constants. Phase 1 remains open. |

### Phase 1 Open Blocker Board

This board reflects the current active state after S1-46B through S1-50. Older rows below may use closeout or accepted-deviation language, but that language is historical only. For the current 1:1 goal, Phase 1 remains open until source-backed implementation resolves the remaining gaps or a remaining mismatch is documented as an unavoidable technical bridge with bundle evidence.

| Chain | Closeout status | Evidence | Blocks Phase 1? | Remaining action |
| --- | --- | --- | --- | --- |
| `p1` hierarchy/lights/route state | Source-shaped | Scene hierarchy, active project, work count, light constants, about/floating toggles, and full-canvas QA are stable. | No | Keep as regression gate only. |
| `T1/w1/E1` thumb target | Source-shaped | Thumb target size, visible thumb count, composite uniforms, texture color-space fix, and S1-49 projection coverage are attributed. | No | Do not tune thumb darkness/intensity. |
| `GA/VA` ordinary blocks | Direct source-shaped `HA/zA` with documented runtime bridge | Ordinary work now uses direct source-shaped `HA/zA` templates, source material defaults, source alpha/reveal tail, source world/UV paths, spotlight-map projection guardrails, and source `SPECULAR` macro with inactive `PHYSICAL` proof. The remaining ordinary-work source bridge is `uUvOffset vec2`; projection/material feel still differs. | Yes for strict 1:1 | Keep the `uUvOffset` bridge documented and continue from source-backed projection/material feel, thumb-map transfer/content, floor/environment distribution, and `OA/CA` transfer evidence. |
| `Ka` mouse simulation | Structurally attributed | S1-50 verifies target sizing, `uCoords`, UV offset/scale, persistence/thickness shape, and negligible static darken contribution. | No | Interactive feel QA only if visibly off. |
| `A1/C1` pre-composite | Source-equivalent for home flow | S1-83 confirms semantic flow order matches source, including the formerly inert/relocated computations. | No for home brightness | Keep project pages as regression gates. |
| `OA/CA` final transfer | Open transfer/color interpretation gap | Source formulas, blend table, renderer output, and darken inputs are confirmed. Gamma-like transfer debug moves luma but lacks source proof. | Yes | Needs source-backed transfer fix, narrower source evidence, or documented technical-bridge evidence. |
| Project detail composite/media | Stable but darker | Full QA passes and previous offscreen-media attempt regressed luma. | Yes for strict 1:1 | Keep as regression gate; do not rewire without narrower source evidence. |
| Floor/environment/about | Source-shaped bridge, not final parity | Prior probes show low brightness impact; about route passes full-canvas QA. | Maybe | Continue source comparison only where Phase 1 scope requires it; visual QA may reveal mismatches but cannot close known source gaps. |

### Current Recommendation

Finish Phase 1 before opening Phase 2 work. The next implementation batch should not be a broad rendering rewrite. It should find source evidence for `OA/CA` transfer, `VA/GA` shader/projection, or floor/environment target-content differences that can be safely applied, or keep the mismatch open with evidence. The agent should not mark the remaining brightness/projection gaps as accepted based on visual review.

### S1-94 Source Pe/p1 DPR Ownership

This batch corrected a source-confirmed DPR ownership mismatch between the global renderer and the home work scene.

Source/runtime evidence:

- Source `Pe.init()` sets `maxDpr` to `Le.LOW_RES ? 1.5 : 2`, then computes `dpr = Math.min(maxDpr, window.devicePixelRatio)`.
- Source `p1.resize(e,t,n)` calls `super.resize(e,t,Math.min(n,1.5))`; each work `GA` resize and `aboutBlocks.resize()` use the same `Math.min(n,1.5)` cap.
- The rebuild previously applied a global `1.5` cap, which made main/media/canvas DPR ownership differ from source on high-DPR devices.

Production now splits DPR ownership:

- Global renderer, main composite, media targets, and canvas drawing buffer use source `Pe.dpr`.
- Home work raw/composite targets, work bloom start size, work mouse simulation sizing, and work item `uCoords` use source `p1` work DPR capped at `1.5`.
- `scripts/probe-output-color.mjs` can now run high-DPR runtime probes with `DEVICE_SCALE_FACTOR=2`; `SKIP_SCREENSHOT=1` avoids large SwiftShader screenshot timeouts without changing default probe behavior.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source `Pe` and `p1.resize` anchors all present |
| DPR 1 output probe | No failures/exceptions; global and work DPR both `1`, work/main targets `1440x900` |
| DPR 2 output probe | No failures/exceptions; canvas/main `2880x1800`, work target `2160x1350`, work bloom start `512x256`, main fluid `171x85` |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Full source-vs-rebuild capture | Home/about/project pages captured without failures/exceptions |
| Desktop center-band delta | `+0.0014` against source |
| Mobile center-band delta | `-0.0140` against source |

Decision: keep the `Pe/p1` DPR ownership split. This closes a high-DPR source-structure mismatch, but Phase 1 remains open because the mobile/fog-bed residual and strict `VA/GA`/projection feel are still unresolved.

### S1-95 Source GA/Ka Mouse Plane Attribution

This batch did not change the visual formula. It added hard evidence and QA gates around the source `GA.createPlane()` / local `Ka` shape so future projection work does not drift into guesswork.

Source/runtime evidence:

- Source `GA.createPlane()` sets the local mouse plane to `35 * 1.3` by `23 * 1.3`.
- Source ray plane starts at the same size, then multiplies by `1.5`; this yields `uUvOffset` of roughly `(0.25, 0.25)` and `uUvOffsetScale = 1.5`.
- Source `GA.resize()` calls `mouseSim.onResize(this.plane.scale.x,this.plane.scale.y)`.
- Source `GA.update()` writes local `tMouseSim`, damps mouse speed through `Yi(...,10,delta)`, and keeps `persistance:.85`, `thickness:.1`.

Production now exposes and asserts:

- active local target size `46x30`,
- active `uCoords = [46,30]`,
- active `uUvOffset = [0.25,0.25,0]`,
- active `uUvOffsetScale = 1.5`,
- ray-plane geometry/z matching source scale after `GRID_SCALE`,
- persistence/thickness source shape.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source `GA` anchors all present |
| Output probe | New `GA` source-shape assertions passed |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Full source-vs-rebuild capture | Home/about/project pages captured without failures/exceptions |
| Desktop center-band delta | `+0.0005` against source |
| Mobile center-band delta | `-0.0144` against source |

Decision: keep this as a QA/attribution closeout for `GA/Ka` mouse-plane sizing. Phase 1 remains open; the remaining visual work should not tune local mouse sim constants without new source evidence.

### S1-96 Shader/WebGL QA Gate and VA Sheen Attribution

This batch did not change production rendering. It hardens the QA harness after a rejected local shader experiment proved that small-looking r164 physical-material edits can produce WebGL shader compile failures.

Source/runtime evidence:

- The source `zA`/ordinary `VA` material surface carries `USE_SHEEN` declaration evidence through the standard material shader path.
- The captured source body does not include the modern r164 `sheenEnergyComp` outgoing-light tail that Three can inject around sheen lighting.
- A local attempt to remove that tail without preserving the declaration surface caused a shader compile error, so future material-body work needs a hard runtime gate, not only text diffing.

QA now enforces:

- `scripts/dump-va-shader.mjs` reports `sheenDeclaration` separately from `r164SheenOutgoingTail`.
- `scripts/probe-output-color.mjs` throws when Chrome console output contains shader/WebGL error markers instead of only listing those messages in the JSON output.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Shader dump | No shader/WebGL console errors; `sheenDeclaration` present in source and rebuild; r164 outgoing sheen tail is now reported separately as source false / rebuild true |
| Output probe | No shader/WebGL console errors |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain visible media tracks |

Decision: keep this as a QA guardrail before the next `VA/GA` or render-manager implementation batch. Phase 1 remains open; this does not resolve the remaining mobile/fog-bed or strict material/projection visual residuals.

### S1-97 Source VA/zA r164 Sheen Outgoing Tail

This batch made one narrow production shader-body alignment in ordinary work-block `VA`.

Source/runtime evidence:

- Source `zA` carries `USE_SHEEN` declaration and uniform evidence in the material surface.
- The captured source outgoing-light body does not include the modern r164 tail `sheenEnergyComp` and the `outgoingLight * sheenEnergyComp + sheenSpecular...` expression.
- S1-96 made shader/WebGL console errors a hard probe failure, so this change is now runtime-gated instead of relying on text diffing alone.

Production change:

- `stripSourceVaFragmentPaths()` now strips the r164 `sheenEnergyComp` outgoing-light tail only.
- The `USE_SHEEN` declaration surface remains intact, preserving the standard material compile path.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Shader dump | No shader/WebGL console errors; `r164SheenOutgoingTail` is source false / rebuild false; fragment delta narrowed from `+902` to `+761` |
| Output probe | No failures, exceptions, or shader/WebGL console errors |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `-0.0007` against source |
| Mobile center-band delta | `-0.0129` against source |

Decision: keep this narrow source-correct shader-body fix. Phase 1 remains open because it does not resolve the mobile/fog-bed residual or strict projection/material feel.

### S1-98 Source `i1` Reflector Camera/Clear Ordering

This batch stayed on the `a1/i1` floor-reflection chain and corrected two remaining source-confirmed reflector update details.

Source/runtime evidence:

- Source `i1.update()` calls `virtualCamera.lookAt(target)`, assigns `virtualCamera.far = camera.far`, calls `virtualCamera.updateMatrixWorld()`, then copies `camera.projectionMatrix`.
- Source clears the raw reflection target only when `renderer.autoClear === false`; the blur read/write passes still render without extra clears.

Production change:

- `renderFloorReflection()` now updates the virtual reflection camera matrix before copying the home camera projection matrix.
- The raw reflection target clear now follows the source conditional `!renderer.autoClear` branch instead of unconditionally clearing.
- `scripts/audit-renderer-output.mjs` now records source `i1` order and raw-target clear anchors.
- `scripts/probe-output-color.mjs` now fails if the reflector probe stops reporting the source projection-copy order, raw clear mode, or CSS-sized reflection target shape.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source `i1` camera/projection order and conditional raw clear anchors present |
| Output probe | Passed; reflection probe reports `rawClearMode=source-autoClear-false-only`, `cameraProjectionCopyOrder=source-updateMatrixWorld-before-projection-copy`, and `sourceCssSized=true` |
| Thumb spotlight probe | Passed; source thumb strip and spotlight map state retained |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Home source-vs-rebuild capture | Passed without failed requests or runtime exceptions |
| Desktop center-band delta | `0.0000` against source |
| Mobile center-band delta | `-0.0130` against source |

Decision: keep this as source-correct reflector lifecycle parity. Phase 1 remains open because this is a narrow reflector ownership fix, not a visual closeout for the remaining mobile/fog-bed and spotlight/projection residuals.

### S1-99 Source `VA/zA` Material Macro Surface

This batch stayed on the ordinary work-block `VA/zA` material surface and aligned four source-confirmed physical-material macro spellings.

Source/runtime evidence:

- Source `zA` uses `USE_SPECULARCOLORMAP` and `USE_SPECULARINTENSITYMAP` rather than the modern Three underscore spellings.
- Source `zA` also uses `USE_SHEENCOLORMAP` and `USE_SHEENROUGHNESSMAP`.
- S1-96 and S1-97 already made shader/WebGL console errors a hard gate before promoting physical-material body changes.

Production change:

- `patchWorkBlockShader()` now applies `alignSourceVaMaterialMacroSurface()` only for ordinary work-block `VA`, not auxiliary blocks.
- The helper rewrites the four modern underscore macro spellings to the source spellings.
- `scripts/dump-va-shader.mjs` now reports separate `sourceSheenMapMacro` and `modernSheenMapMacro` checks alongside the existing specular macro checks.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Passed; current source render-manager and reflector anchors remain present |
| Shader dump | No shader/WebGL console errors; `sourceSpecularMacro` and `sourceSheenMapMacro` are source/rebuild true; modern underscore checks are source/rebuild false |
| Output probe | Passed without failures, exceptions, or shader/WebGL console errors |
| Thumb spotlight probe | Passed; source thumb strip and spotlight state retained |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Home source-vs-rebuild capture | Desktop/mobile home captures passed without failures or runtime exceptions |
| Desktop center-band delta | `+0.0006` against source |
| Mobile center-band delta | `-0.0118` against source |

Decision: keep this source-correct macro-surface alignment. It improves `VA/zA` shader surface parity but does not close Phase 1; the remaining strict 1:1 work is still mobile/fog-bed distribution, projection/material feel, and the deeper source `bsdfs`/`opaque_fragment` bridge gap.

### S1-100 Source `Lu/kA` Bloom Pass Clearing

This batch stayed on the `Lu/kA` render-manager pass ownership chain and removed rebuild-only clears from fullscreen luminosity/bloom passes.

Source/runtime evidence:

- Source `Lu.update()` renders the luminosity bright target with `setRenderTarget(u); render(screen, screenCamera)` and no explicit clear.
- Source bloom mip passes render horizontal targets `d[p]`, vertical targets `l[p]`, and the final bloom composite target `d[0]` directly.
- The current rebuild already matched this no-explicit-clear pattern for `Lo` thumb/sky passes and `i1` blur passes; bloom still had rebuild-only clears.

Production change:

- Removed explicit `renderer.clear()` before horizontal bloom blur passes.
- Removed explicit `renderer.clear()` before vertical bloom blur passes.
- Removed explicit `renderer.clear()` before the bloom composite pass.
- Removed explicit `renderer.clear()` before the work luminosity bright pass.
- Removed explicit `renderer.clear()` before the main luminosity bright pass.
- `__rogierOutputProbe` now reports `bloomPassClearing=source-Lu-no-explicit-clear` for work and main render-manager sizing.
- `scripts/probe-output-color.mjs` now fails if either work or main bloom clearing mode drifts.
- `scripts/audit-renderer-output.mjs` now extracts enough of source `Lu.update()` to verify the luminosity, horizontal, vertical, and composite set-render-target/render anchors.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source `Lu` luminosity/bloom fullscreen pass anchors present |
| Shader dump | No shader/WebGL console errors; `VA` core checks unchanged |
| Output probe | Passed; work/main report `bloomPassClearing=source-Lu-no-explicit-clear` |
| Thumb spotlight probe | Passed; source thumb strip and spotlight state retained |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Home source-vs-rebuild capture | Desktop/mobile home captures passed without failures or runtime exceptions |
| Desktop center-band delta | `-0.0001` against source |
| Mobile center-band delta | `-0.0134` against source |

Decision: keep this source-correct render-manager pass clearing alignment. It is a low-level source ownership fix, not a Phase 1 closeout; mobile/fog-bed and strict projection/material residuals remain open.

### S1-101 Source `I1` Main Render-Manager Sizing

This batch corrected a prior overgeneralization from source `Lu` to source `I1`.

Source/runtime evidence:

- Source `kA extends Lu` inherits `Lu.resize()`, which uses `Fa(renderSize)/4` for work luminosity/bloom and work fluid sizing.
- Source `I1.resize()` is a separate main render manager and uses `Fa(renderSize)/2`, then calls `fluidSimulation.onResize(e/3,t/3)` from that half-POT size.
- Older plan history already recorded the `I1` half-POT split; S1-93 later collapsed main sizing back to `Lu` quarter-POT and is now treated as a historical misread for main only.

Production change:

- Main bloom bright target now sizes from `Fa(renderSize)/2`.
- Main bloom mip chain now starts from `Fa(renderSize)/2`.
- Main fluid pass now resizes from `Fa(renderSize)/2/3`; at `1440x900` this is `171x85`, matching source `I1`.
- Work bloom/fluid sizing remains on source `Lu/kA` `Fa(workRenderSize)/4`.
- `__rogierOutputProbe` now reports `source-I1-Fa-render-size-div-2` and `source-I1-Fa-render-size-div-2-then-div-3` for main.
- `scripts/probe-output-color.mjs` now fails if work and main render-manager sizing are collapsed into the same mode.
- `scripts/audit-renderer-output.mjs` now extracts source `I1` and checks the half-POT, lensflare target, main-fluid resize, and `tLensflare` anchors.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source `Lu` quarter-POT and source `I1` half-POT anchors present |
| Output probe | Passed; work reports `source-Lu-Fa-render-size-div-4`, main reports `source-I1-Fa-render-size-div-2`, main fluid targets are `171x85` |
| Thumb spotlight probe | Passed; source thumb strip and spotlight state retained |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors; `VA` core checks unchanged |
| Home source-vs-rebuild capture | Desktop/mobile home captures passed without failures or runtime exceptions |
| Desktop center-band delta | `-0.0001` against source |
| Mobile center-band delta | `-0.0121` against source |

Decision: keep the source `I1` half-POT correction. It fixes a real render-manager ownership regression from S1-93; Phase 1 remains open for mobile/fog-bed distribution, projection/material feel, and deeper source-isomorphic renderer structure.

### S1-102 Source `Iu/p1/h1` Environment Update Order

This batch corrected environment time ownership to match the source frame order rather than updating every environment uniform before the current render.

Source/runtime evidence:

- Source `Iu.update(e,t,n,i)` calls `this.renderManager.update(e,t,n,i)` first, then updates the camera controller and iterates component `update()` calls.
- Source `p1.update(e,t,n,i)` calls `super.update(e,t,n,i)` before spotlight parallax, work-item updates, and about-block updates.
- `h1` environment is one of the `p1` components, so its `uTime` update happens after the current render-manager frame and prepares state for the next frame.

Production change:

- Environment material `uTime` is no longer written in the pre-render `tick()` path.
- `uTime` is now written inside `updateWorkSceneForNextFrame()`, matching the source post-render component-update ordering.
- `__rogierOutputProbe` reports `environmentUpdateOrder=source-p1-component-post-render`.
- `scripts/probe-output-color.mjs` fails if the update-order marker drifts.
- `scripts/audit-renderer-output.mjs` now extracts and checks source `Iu.update()` and `p1.update()` anchors.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source `Iu.update()` and `p1.update()` update-order anchors present |
| Output probe | Passed; `environmentUpdateOrder=source-p1-component-post-render` |
| Thumb spotlight probe | Passed; source thumb strip and spotlight state retained |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors |
| Home source-vs-rebuild capture | Desktop/mobile home captures passed without failures or runtime exceptions |
| Desktop center-band delta | `+0.0006` against source |
| Mobile center-band delta | `-0.0124` against source |

Decision: keep the source post-render environment timing. It aligns frame ownership with `Iu/p1` but does not close Phase 1; mobile/fog-bed distribution, projection/material feel, and deeper source-isomorphic renderer structure remain open.

### S1-103 Source `V1/H1/z1` Sky Composite Uniform Surface

This batch stayed on the sky/environment chain and removed rebuild-only runtime uniform bindings that the source `z1` material does not create.

Source/runtime evidence:

- Source `B1` shader text declares `uShader1Mix3` and `uShader3Scale`.
- Source `z1` runtime uniforms bind `tScene`, `uTime`, `uShader1Alpha`, `uShader1Speed`, `uShader2Speed`, `uShader1Scale`, `uShader2Scale`, and `uShaderMix`; it does not bind `uShader1Mix3` or `uShader3Scale`.
- Source `V1.resize()` keeps the sky render target at `height * .75` with DPR `1`, and `V1.update()` writes `uTime` after render-manager update with low-res time pinned to `0`.

Production change:

- Removed rebuild-only runtime `uShader1Mix3` binding from the sky composite material.
- Removed rebuild-only runtime `uShader3Scale` binding from the sky composite material.
- Kept both names shader-declared, matching source shader surface.
- `__rogierOutputProbe` now reports sky `uShader1Mix3Binding` and `uShader3ScaleBinding`.
- `scripts/probe-output-color.mjs` fails if those bindings are not `source-declared-only`.
- `scripts/audit-renderer-output.mjs` now checks source `V1` and `z1` anchors for target sizing, update timing, material uniforms, shader ownership, and draw state.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source `V1/H1/z1` anchors present |
| Output probe | Passed; sky `uShader1Mix3Binding` and `uShader3ScaleBinding` are `source-declared-only` |
| Thumb spotlight probe | Passed; source thumb strip and spotlight state retained |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors; environment core checks remain source/rebuild true |
| Home source-vs-rebuild capture | Desktop/mobile home captures passed without failures or runtime exceptions |
| Desktop center-band delta | `+0.0004` against source |
| Mobile center-band delta | `-0.0116` against source |

Decision: keep the source-declared-only sky uniform cleanup. It is a low-risk ownership alignment and slightly improves the mobile center-band residual, but Phase 1 remains open for mobile/fog-bed distribution, strict projection/material feel, and deeper source-isomorphic renderer structure.

### S1-104 Source `GA` Rotation-Wrap Scale Ownership

This batch corrected `GA` object hierarchy and matrix ownership for the work-block mesh and local ray plane.

Source/runtime evidence:

- Source `GA.createInstancedMesh()` creates `rotationWrap`, adds the instanced mesh to it, and applies `rotationWrap.scale.set(settings.scale, settings.scale, settings.scale)` where `settings.scale=.09`.
- Source `GA.createPlane()` creates an unscaled local plane and ray plane, scales the ray plane by `1.5`, then adds `rayPlane` to the same `rotationWrap`.
- Source `GA.resize()` calls `mouseSim.onResize(this.plane.scale.x, this.plane.scale.y)`, so local mouse simulation target sizing is based on the unscaled source plane dimensions.

Production change:

- Added a per-work-item `rotationWrap` group.
- Moved the work instanced mesh and ray plane under `rotationWrap`.
- Moved `GRID_SCALE` from `mesh.scale` to `rotationWrap.scale`.
- Restored ray-plane geometry width/height to the unscaled source ray-plane dimensions.
- Restored ray-plane local z position to the unscaled source position before parent scaling.
- Output probe now reports `rotationWrapScale`, `meshScale`, and unscaled ray-plane geometry/position checks.
- Renderer audit now checks source `GA` anchors for `rotationWrap.add(mesh)`, `rotationWrap.scale.set(i,i,i)`, and `rotationWrap.add(rayPlane)`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source `GA` rotation-wrap, mesh, ray-plane, and local mouse anchors present |
| Output probe | Passed; rotation wrap scale, mesh identity scale, ray-plane geometry/z, UV offset, and local mouse target assertions passed |
| Thumb spotlight probe | Passed; source thumb strip and spotlight state retained |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors; `VA` core checks unchanged |
| Home source-vs-rebuild capture | Desktop/mobile home captures passed without failures or runtime exceptions |
| Desktop center-band delta | `+0.0002` against source |
| Mobile center-band delta | `-0.0129` against source |

Decision: keep the source `GA` hierarchy correction. It improves matrix/projection ownership without tuning visual constants, but Phase 1 remains open for mobile/fog-bed distribution, strict projection/material feel, and deeper source-isomorphic renderer structure.

### S1-105 Source `Lu/I1` Render-Manager Clearing Ownership

This batch aligned another render-manager ownership layer without changing visual constants.

Source/runtime evidence:

- Source `qw` creates the renderer with `autoClear=false`.
- Source `Lu.update()` renders the work raw target, optional blur targets, optional FXAA target, and final composite target through direct `setRenderTarget(...); render(...)` calls.
- Source `I1.update()` follows the same no-explicit-clear pattern for main raw, blur, FXAA, and composite targets, while keeping its own lensflare clear when that source feature is enabled.
- Source `$1.update()` is a special media-scene exception that temporarily sets `renderer.autoClear=true`; that path was left unchanged.
- Source `i1.update()` is a reflector exception that conditionally clears only when `autoClear===false`; that path was left unchanged.

Production change:

- Removed rebuild-only frame-start canvas clear.
- Removed rebuild-only clear before the home work raw pass.
- Removed rebuild-only clear before the home work composite pass.
- Removed rebuild-only clears from the hidden-home work raw/composite fallback.
- Removed rebuild-only clear before the main pre-composite pass.
- Removed rebuild-only clears from the main blur pass.
- Removed rebuild-only clear before the main FXAA pass.
- Added output-probe clear-mode markers for work `Lu/kA` and main `I1`.
- Added hard probe assertions for those clear-mode markers.
- Expanded renderer audit anchors for source `qw`, `nD`, `Lu`, and `I1` render-manager clear/pass ownership.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Renderer audit | Source renderer, canvas-manager, `Lu`, and `I1` clear/pass anchors present |
| Output probe | Passed; work/main clear-mode assertions passed |
| Thumb spotlight probe | Passed; source thumb strip and spotlight state retained |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors; `VA`, `OA`, `A1`, and environment core checks unchanged |
| Home source-vs-rebuild capture | Desktop/mobile home captures passed without failures or runtime exceptions |
| Desktop center-band delta | `+0.0006` against source |
| Mobile center-band delta | `-0.0125` against source |

Decision: keep the source render-manager clearing alignment. It removes a real source-structure divergence and keeps project media stable, but Phase 1 remains open for mobile/fog-bed distribution, strict projection/material feel, and deeper source-isomorphic renderer structure.

### S1-106 Source `Xt.preloadTextures()` Wrapping Ownership

This batch corrected texture wrapping ownership against source `Xt.preloadTextures()`.

Source/runtime evidence:

- Source constants resolve to `ci=RepeatWrapping=1000` and `vo=MirroredRepeatWrapping=1002`.
- Source `Xt.preloadTextures()` sets blue-noise, floor-normal, and `perlin2` to `ci`.
- Source `Xt.preloadTextures()` sets `perlin1` to `vo`.
- The rebuild previously kept work-block `perlin1` on clamp wrapping and did not update the runtime `noiseTexture` pointer after loading blue-noise, so probes still saw the placeholder object.

Production now:

- Loads work-block `perlin1` with `MirroredRepeatWrapping`.
- Keeps A1/C1 `perlin2`, blue-noise, and floor-normal with `RepeatWrapping`.
- Updates the runtime `noiseTexture` pointer to the loaded blue-noise texture.
- Exposes all four wrapping modes in `__rogierOutputProbe.textures`.
- Hard-fails `scripts/probe-output-color.mjs` if those wrapping modes drift.
- Adds source `Xt.preloadTextures()` anchors to `scripts/audit-renderer-output.mjs`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Source `Xt.preloadTextures()` anchors all true; `ci=RepeatWrapping=1000`, `vo=MirroredRepeatWrapping=1002` |
| Output probe | Passed; blue-noise/floor-normal/perlin2 `wrapS/wrapT=1000`, work `perlin1` `wrapS/wrapT=1002` |
| Thumb spotlight probe | Passed; map present, target `(0,0,-8)`, intensity `220` |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | Passed with no shader/WebGL console errors |
| Full home source-vs-rebuild capture | Passed without failures/exceptions |
| Desktop center-band delta | `-0.0003` against source |
| Mobile center-band delta | `-0.0128` against source |

Decision: keep as source-correct texture preload/wrapping ownership. This corrects a concrete earlier documentation/implementation misread; Phase 1 remains open for mobile fog-bed distribution and strict projection/material parity.

### S1-107 Source `h1/p1` Environment Hierarchy Ownership

This batch corrected environment object ownership without changing environment shader constants.

Source/runtime evidence:

- Source `h1 extends rt` and creates an environment mesh child with `new Mesh(new IcosahedronGeometry(300,10), new u1(...))`; S1-234 later resolves source `rt` to `Object3D`.
- Source `p1.init()` assigns `this.env=this.add(h1)`, then sets `this.env.position.y=-12.65` and `this.env.rotation.y=-Xc(this.rotationAdjustment)`.
- The rebuild previously applied y/rotation directly to the environment mesh, which made the world transform equivalent but did not match source ownership.

Production now:

- Adds `environmentGroup` as the source `h1`-style transform owner.
- Keeps `environmentPlane` as a child at local position/rotation zero.
- Applies `-12.65` y and `-rotationAdjustment` to the group.
- Hides/restores the group for `debug-environment=off`.
- Exposes hierarchy fields in `__rogierOutputProbe.uniforms.environment` and `reflectionState.environment`.
- Adds hard output-probe assertions for group-owned transform.
- Adds renderer-audit anchors for source `h1` and `p1` environment hierarchy.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Source `h1` and `p1` environment hierarchy anchors all true |
| Output probe | Passed; group owns y/rotation, mesh local y/rotation are zero |
| Thumb spotlight probe | Passed; map present, target `(0,0,-8)`, intensity `220` |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | Passed with no shader/WebGL console errors |
| Full home source-vs-rebuild capture | Passed without failures/exceptions |
| Desktop center-band delta | `+0.0005` against source |
| Mobile center-band delta | `-0.0117` against source |

Decision: keep as source-correct environment hierarchy ownership. This removes another `p1/h1` structure mismatch but does not close Phase 1; remaining blockers are still mobile fog-bed distribution, strict projection/material feel, and transfer interpretation.

### S1-108 Source `u1/a1` Environment and Reflector Ownership Surface

This batch stayed on the home background/fog-bed chain and added source-backed interface parity plus hard QA gates without changing visual constants.

Source/runtime evidence:

- Source `u1` extends the standard material path, stores its bindings in `customUniforms`, sets `dithering=true`, and patches `c1/l1` through `onBeforeCompile`.
- Source `h1` constructs `u1` with `side=BackSide`, `envMapIntensity=1`, and `fog=false`.
- Source `a1` floor reflection hides the `a1` component group during the floor mesh `onBeforeRender` reflector update, then restores it.

Production now exposes and asserts:

- `environmentMaterial.customUniforms` aliases the runtime uniform surface used by the shader patch,
- environment material mode, fog, dithering, and env-map intensity match the source `u1/h1` surface,
- floor reflection visibility ownership is recorded as `source-a1-onBeforeRender-hide-component-group`,
- renderer audit extracts source `u1` and `a1` anchors so future background work does not misread these as open visual-tuning levers.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Source `u1`, `h1`, and `a1` anchors present |
| Output probe | New material/visibility assertions passed after restarting rebuild server |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors; `u1-environment` core checks remain source/rebuild true |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `+0.0007` against source |
| Mobile center-band delta | `-0.0128` against source |

Decision: keep this as source-correct environment/floor ownership hardening. Phase 1 remains open because this batch proves interface ownership and prevents wrong future changes; it does not resolve the remaining mobile/fog-bed and projection/material residuals.

### S1-109 Source `o1/t1` Floor Material and Reflection Blur Shader Surface

This batch stayed on the home floor/reflection chain and aligned the shader material surface without tuning visual constants.

Source/runtime evidence:

- Source `o1` owns the floor material shader path, and the renderer audit now tracks that source floor material anchor directly.
- Source `t1` uses the blur shader pair `e1/QA`; the fragment surface is GLSL3-shaped with `in vec2 vUv`, `out vec4 FragColor`, `texture(...)`, and `FragColor = mix(tMapped, blurred, 1.25)`.
- The rebuild previously rendered the reflection blur through a regular `ShaderMaterial` surface, which was a bridge mismatch even when the visible floor result was stable.

Production now exposes and asserts:

- `createFloorReflectionBlurMaterial()` uses `RawShaderMaterial` with `GLSL3`,
- shader dump includes `o1-floor-material` and `t1-floor-reflection-blur`,
- renderer audit extracts source `o1` and `t1` anchors,
- output probe reports and hard-fails on `floor.materialMode=source-o1-raw-glsl3` and `floor.reflectionBlurMode=source-t1-raw-glsl3`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Source `o1` and `t1` anchors present |
| Output probe | New floor and reflection-blur material mode assertions passed after restarting rebuild server |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors; floor and blur shader dumps include the new source IDs |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `+0.0003` against source |
| Mobile center-band delta | `-0.0125` against source |

Decision: keep this source-correct floor/reflection shader-surface alignment. Phase 1 remains open because the remaining residual is still mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation, not this material surface.

### S1-110 Source `o1` Floor Fragment Branch Surface

This batch stayed on the floor/reflection shader chain and restored source fragment branch structure without turning it into a visual tuning pass.

Source/runtime evidence:

- Source `o1` declares conditional `USE_MAP`, `USE_NORMALMAP`, `USE_FOG`, and `DITHERING` branches in the raw fragment shader.
- Source `a1.init()` constructs `new o1({ color:"#4a4a4a", normalMap:e, uMirror:1, reflectivity:.97, uFloorMixStrength:15 })`, so runtime floor rendering enables `USE_NORMALMAP` only.
- The previous rebuild formula matched the active normal-map path, but had trimmed the inactive source branch surface, which made shader residuals noisier and left room for misreading floor fog/map as open tuning levers.

Production now exposes and asserts:

- floor fragment includes the source conditional branch surface for map, normal map, fog, and dithering,
- runtime probe reports `USE_NORMALMAP=true`, `USE_MAP=false`, `USE_FOG=false`, and `DITHERING=false`,
- output probe hard-fails on branch drift in both `uniforms.floor.shaderBranches` and `reflectionState.floor.material.branches`,
- shader dump floor core checks now include `ditheringBranch` and `ditherCall`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source floor/reflection anchors still present |
| Output probe | Passed after restarting rebuild server; floor branches match source runtime state |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors; `o1-floor-material` fragment delta narrowed to `-35` and source/rebuild floor core checks align |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `-0.0004` against source |
| Mobile center-band delta | `-0.0122` against source |

Decision: keep this source-correct `o1` floor fragment branch alignment. It narrows the floor shader bridge and prevents unsupported fog/map/dithering tuning, but it does not close Phase 1; the mobile fog-bed distribution and strict projection/material residuals remain open.

### S1-111 Source `h1/V1/Du` Environment Geometry and Sky Target QA Surface

This batch hardened the source environment/sky attribution surface without changing visual constants or shader formulas.

Source/runtime evidence:

- Source `h1` sets `speed=5e-5` and creates its environment geometry with `const e=new Du(300,10)`.
- Source `Du` extends `IcosahedronGeometry` and stores `parameters={radius:e,detail:t}`.
- Source `V1` sky targets are square and sized from viewport height at `.75`.
- Source `V1.update()` freezes sky time at `0` in low-res mode and otherwise feeds the live time value.

Production now exposes and asserts:

- environment geometry mode `source-Du-icosahedron`,
- geometry type `IcosahedronGeometry`, radius `300`, and detail `10`,
- sky composite sizing mode `source-V1-height-0.75-square`,
- sky target width/height equal to the expected `height*.75` square size,
- sky time mode `source-V1-low-res-time-0` or `source-V1-live-time` according to the source low-res policy,
- renderer audit anchors for `h1`, `V1`, and `Du`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `h1`, `V1`, and `Du` anchors present |
| Output probe | Passed after rebuild server restart; environment geometry and sky target/time assertions passed |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Shader dump | No shader/WebGL console errors |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `+0.0001` against source |
| Mobile center-band delta | `-0.0116` against source |

Decision: keep this as source-correct environment/sky QA hardening. It reduces the chance that later fog-bed work misattributes geometry, target sizing, or low-res time behavior, but it does not close Phase 1; the remaining visual residuals are still mobile fog-bed distribution, strict projection/material feel, and transfer interpretation.

### S1-112 Source `z1` Sky Composite Raw GLSL3 Surface

This batch stayed on the environment/sky render chain and aligned the `z1` sky composite material surface with the source raw GLSL3 path.

Source/runtime evidence:

- Source `z1` extends `mt` and is constructed with `glslVersion:lt`.
- Source `z1` uses `fragmentShader:B1`, `blending:ot`, `transparent:true`, `depthWrite:false`, and `depthTest:false`.
- Source `B1` is GLSL3-shaped: `in vec2 vUv`, `out vec4 FragColor`, `texture(...)`, and `FragColor = vec4(.9 - diffuseColor.rgb, 1.)`.
- Source `V1/H1` sizing and low-res time ownership remain the S1-111 source shape.

Production now exposes and asserts:

- `createSkyCompositeMaterial()` uses `RawShaderMaterial` with `GLSL3`,
- the sky composite shader uses `in/out` and `texture(...)` instead of the bridge `varying/gl_FragColor/texture2D` surface,
- output probe reports `materialMode=source-z1-raw-glsl3` and `glslVersion=300 es`,
- output probe hard-fails if sky material mode or GLSL version drifts,
- shader dump includes `z1-sky-composite` and writes source `B1` plus vertex `tl` files for future residual audits,
- renderer audit now asserts source `class z1 extends mt` and `glslVersion:lt`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `z1` raw GLSL3 anchors present |
| Output probe | Passed after rebuild server restart; sky material mode and GLSL3 assertions passed |
| Shader dump | Passed with no shader/WebGL console errors; `z1-sky-composite` dump present |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `+0.0004` against source |
| Mobile center-band delta | `-0.0129` against source |

Decision: keep this source-correct `z1` sky composite surface alignment. It closes a concrete material-surface bridge mismatch in `V1/H1/z1`, but it does not close Phase 1; the remaining blockers are still mobile fog-bed distribution, strict projection/material feel, and transfer interpretation.

### S1-113 Source `OA/C1` Composite Raw GLSL3 Surface

This batch stayed on the core composite chain and aligned the default work composite and pre-composite material surfaces with the source raw GLSL3 path. It did not change darken, saturation, bloom, texture color-space, spotlight, floor, or environment constants.

Source/runtime evidence:

- Source `OA` extends `mt` with `glslVersion:lt`, `fragmentShader:CA`, `blending:ot`, `transparent:true`, `depthWrite:false`, and `depthTest:false`.
- Source `C1` extends `mt` with `glslVersion:lt`, `fragmentShader:A1`, `blending:ot`, `depthWrite:false`, and `depthTest:false`.
- Source `CA/A1` shader surfaces use GLSL3-style `in vec2 vUv`, `out vec4 FragColor`, and `texture(...)`.
- Previous audits already showed the core `OA/CA` formula anchors and `A1/C1` flow order matched source; this batch narrows the bridge surface rather than changing those formulas.

Production now exposes and asserts:

- default `OA-work-composite` uses `RawShaderMaterial` with `GLSL3`,
- default `A1-pre-composite` uses `RawShaderMaterial` with `GLSL3`,
- both fragments use `in/out`, `texture(...)`, and `FragColor`,
- debug composite query mode remains on the old `ShaderMaterial` path so diagnostic string rewrites still work,
- output probe reports `source-OA-raw-glsl3` and `source-C1-raw-glsl3`,
- output probe hard-fails if either material mode or GLSL version drifts,
- renderer audit now records source `OA` and `C1` raw-surface anchors.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `OA` and `C1` raw GLSL3 anchors present |
| Output probe | Passed after rebuild server restart; `OA` and `C1` material mode / GLSL3 assertions passed |
| Shader dump | Passed with no shader/WebGL console errors; `OA-work-composite` and `A1-pre-composite` still retain core checks |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `+0.0009` against source |
| Mobile center-band delta | `-0.0132` against source |

Decision: keep this source-correct `OA/C1` composite surface alignment. It removes a concrete bridge mismatch in the most central composite materials, but it does not close Phase 1; the remaining blockers are still mobile fog-bed distribution, strict projection/material feel, and transfer interpretation.

### S1-114 Source Helper/Main/Media Pass Raw GLSL3 Surface

This batch stayed on the render-manager helper pass chain and aligned `lA/W1/sg/rg/cg/ig` material surfaces with the source raw GLSL3 path. It did not change visual constants.

Source/runtime evidence:

- Source `lA` extends `mt` with `glslVersion:lt`, `fragmentShader:aA`, `blending:ot`, `depthWrite:false`, and `depthTest:false`.
- Source `W1` extends `mt` with `glslVersion:lt`, `fragmentShader:G1`, `transparent:true`, `depthWrite:false`, and `depthTest:false`.
- Source `sg`, `rg`, `cg`, and `ig` extend `mt` with `glslVersion:lt` and fragments `NT`, `kT`, `nA`, and `UT`.
- Source `sg/NT` binds the luminosity input as `tMap`, not `tScene`.

Production now exposes and asserts:

- main composite, media composite, luminosity, bloom blur, bloom composite, and FXAA helper passes use `RawShaderMaterial` with `GLSL3`,
- the affected helper fragments use GLSL3-style `in/out`, `texture(...)`, and `FragColor`,
- luminosity now uses source `tMap` naming for both construction and runtime updates,
- shader dump includes `sg-luminosity`, `rg-bloom-blur`, `cg-bloom-composite`, and `ig-fxaa` against source fragment/vertex shaders,
- output probe reports and hard-fails on helper material mode or GLSL version drift,
- renderer audit now records source `lA/W1/sg/rg/cg/ig` raw-surface anchors.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `lA/W1/sg/rg/cg/ig` raw GLSL3 anchors present |
| Output probe | Passed after rebuild server restart; helper material mode / GLSL3 assertions passed |
| Shader dump | Passed with no shader/WebGL console errors; `sg` uniform residual cleared |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` retain 5 visible media tracks |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `+0.0005` against source |
| Mobile center-band delta | `-0.0123` against source |

Decision: keep this source-correct helper/main/media pass surface alignment. It removes another concrete bridge mismatch in the render-manager graph, but it does not close Phase 1; the remaining blockers are still mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-115 Source `rg/ig` Blur and FXAA Shader Body Surface

This batch stayed within the source helper-pass chain and aligned the `rg` bloom blur and `ig` FXAA shader bodies. It did not tune visual constants or route/project media behavior.

Source/runtime evidence:

- Source `Lu.initRenderer()` creates `this.blurMaterials=[]`, defines `const e=[3,5,7,9,11]`, then pushes `new rg(e[t])` once per mip.
- Source `rg` constructs its material with `defines:{KERNEL_RADIUS:e,SIGMA:e}` and shader `kT`; the kernel radius and sigma are compile-time defines, not uniforms updated while rendering.
- Source `ig` constructs its material with vertex shader `FT` and fragment shader `UT`; `FT` computes `v_rgbNW`, `v_rgbNE`, `v_rgbSW`, `v_rgbSE`, and `v_rgbM` from `uResolution`.
- Source `UT` consumes those neighbor UV varyings and uses the `FXAA_REDUCE_MIN`, `FXAA_REDUCE_MUL`, and `FXAA_SPAN_MAX` macro surface.

Production now exposes and asserts:

- work and main bloom chains each own five `rg` material instances and five fullscreen scenes,
- each blur material carries `KERNEL_RADIUS/SIGMA` defines `[3,5,7,9,11]`,
- bloom rendering no longer writes runtime `uKernelRadius` or `uSigma`,
- FXAA now uses a source-shaped `FT` vertex shader and `UT` fragment body with neighbor UV varyings,
- output probe reports blur material counts/defines/no-runtime-uniform state and `fxaa.vertexMode="source-FT-neighbor-uv"`,
- shader dump reports `rgBlurCoreChecks` and `igFxaaCoreChecks` so these body surfaces are guarded by source/rebuild true checks.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `rg` define and `ig` `vertexShader:FT` anchors recorded |
| Output probe | Passed; work/main blur material count is `5`, defines are `[3,5,7,9,11]`, runtime kernel uniforms are absent, and FXAA vertex mode is source-shaped |
| Shader dump | Passed with no shader/WebGL console errors; `rgBlurCoreChecks` and `igFxaaCoreChecks` are source/rebuild true |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | Project detail pages retain 5 visible media tracks |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `+0.0016` against source |
| Mobile center-band delta | `-0.0120` against source |

Decision: keep this source-correct `rg/ig` helper shader-body alignment. It removes a real source implementation mismatch in bloom/FXAA without changing constants. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-116 Source `Na/HT/zT` Standard Blur Pass Surface

This batch aligned the ordinary render-manager blur pass with source `Na`. It did not change source constants or the default home visual path, because source and rebuild both keep ordinary blur disabled by default.

Source/runtime evidence:

- Source `Lu.initRenderer()` creates `hBlurMaterial=new Na(bf)` and `vBlurMaterial=new Na(Mf)`, then sets both `uBluriness` values to `0`.
- Source `I1.initRenderer()` creates the same ordinary blur pair with `new Na(wf)` and `new Na(Tf)`.
- Source `Na` is separate from bloom `rg`: `Na` uses vertex `HT`, fragment `zT`, uniform `uBluriness`, and shared 9-tap helper `og`; `rg` uses gaussian `kT` with compile-time kernel defines.
- Source `zT` calls `blur(tMap, vUv, uResolution, uBluriness * uDirection)`.

Production now exposes and asserts:

- horizontal and vertical ordinary blur use dedicated `Na-standard-blur` `RawShaderMaterial`/`GLSL3` instances,
- the ordinary blur shader carries the source 9-tap `og` helper and `uBluriness` uniform,
- ordinary blur no longer reuses the bloom `rg` gaussian blur material or its `KERNEL_RADIUS/SIGMA` defines,
- output probe reports `standardBlur.horizontal/vertical` material mode, GLSL version, `uBluriness`, no kernel defines, and directions `[1,0]` / `[0,1]`,
- renderer audit records source `Na` anchors,
- shader dump expands source `${og}` into `zT` and checks the 9-tap body against the rebuild.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `Na` raw GLSL3 anchors recorded |
| Output probe | Passed; ordinary blur reports `source-Na-raw-glsl3`, `uBluriness`, no kernel defines, and source directions |
| Shader dump | Passed with no shader/WebGL console errors; `standardBlurCoreChecks` are source/rebuild true |
| Thumb spotlight probe | Passed; spotlight map, target, position, and intensity stayed source-shaped |
| Project media probe | Project detail pages retain 5 visible media tracks |
| Home source-vs-rebuild capture | Home desktop/mobile captured without failures/exceptions |
| Desktop center-band delta | `+0.0008` against source |
| Mobile center-band delta | `-0.0120` against source |

Decision: keep this source-correct `Na` standard blur alignment. It removes a real implementation mismatch in the render-manager disabled branch without tuning output. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-117 Source `L1/R1/P1` Lensflare Pass Surface

This batch aligned the source `I1` lensflare branch surface without enabling it. It is a render-manager parity fix, not a visual tune.

Source evidence:

- Source `I1.initSettings()` declares `lensflare:{scale:new Q(1.5,1.5),exposure:1,clamp:1,enabled:!1}`.
- Source `I1.initRenderer()` creates `renderTargetLensflare=this.renderTargetA.clone()` and wires `C1.tLensflare` from that target in `I1.update()`.
- Source `L1` extends the raw material surface with `glslVersion:lt`, vertex `R1`, fragment `P1`, uniforms `tMap`, `uLightPosition`, `uScale`, `uExposure`, `uClamp`, and `uResolution`, plus `depthTest:false` and `depthWrite:false`.
- Source `I1.resize()` sets lensflare `uResolution` to `(width/8,height/8)` only when the source lensflare branch is enabled.
- Source `I1.update()` explicitly clears `renderTargetLensflare` when the branch is enabled, then always assigns `compositeMaterial.uniforms.tLensflare.value` to that target.

Runtime and tooling changes:

- Added a source-shaped `L1-lensflare` `RawShaderMaterial` using the source fullscreen vertex surface and source `P1` lensflare formula.
- Added a dedicated lensflare scene and render pass, gated by `SOURCE_MAIN_LENSFLARE_SETTINGS.enabled=false`.
- Kept the existing full-resolution `mainLensflareTarget` wired into `C1/A1.tLensflare`.
- Added output-probe metadata and assertions for default `enabled=false`, clear mode, target size, light position `(0.5,0.5)`, scale `(1.5,1.5)`, exposure `1`, clamp `1`, material mode, and GLSL version.
- Added renderer-audit extraction for source `L1` and shader-dump source/rebuild checks for the `P1` core anchors.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `L1` raw GLSL3 anchors recorded |
| Output probe | Passed with `PROBE_WAIT=9000`; shorter default wait exposed async texture-wrap timing unrelated to this change |
| Shader dump | Passed; `L1-lensflare` core checks are source/rebuild true |
| Thumb spotlight probe | Passed; source thumb strip and spotlight map retained |
| Project media probe | Passed; project detail pages retain five visible media tracks |
| Full source-vs-rebuild capture | Passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/` |
| Desktop center-band delta | `+0.0009` against source |
| Mobile center-band delta | `-0.0133` against source |

Decision: keep the source `L1/I1` lensflare pass surface. It closes a default-disabled branch that was missing from the rebuild render manager, while preserving current visual output and project media. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-118 Source `ag/GT/qT/jT/KT/JT` Main-Fluid Pass Surface

This batch aligned the source main-fluid simulation pass surface. It is a render-manager/material parity fix, not a visual constant tune.

Source evidence:

- Source `ag` creates `main`, `velocity_1`, `viscosity_0`, `viscosity_1`, `divergence`, `pressure_0`, and `pressure_1` FBOs with `depthBuffer:false`, `stencilBuffer:false`, and `type:FloatType`.
- Source `GT` advection uses raw GLSL3 material `Co/Sf`, `blending:ot`, `depthWrite:false`, and `depthTest:false`.
- Source `qT` force uses raw GLSL3 material `XT/$T`, `blending:Uc`, `depthWrite:false`, and `depthTest:false`.
- Source `jT`, `KT`, and `JT` use raw GLSL3 materials `Co/WT`, `Co/YT`, and `Co/ZT` with `blending:ot`, `depthWrite:false`, and `depthTest:false`.
- Source `I1.initFluid()` already drives the current main-fluid settings: `mouseForce:5`, `cursorSize:6`, `delta:.125`, `poissonIterations:1`, `bounce:false`, and the half-POT `/3` resize path from S1-101.

Runtime and tooling changes:

- Converted main-fluid advection, force, divergence, poisson, and pressure passes to `RawShaderMaterial` with `GLSL3`.
- Converted fluid shader surfaces to source-style `in/out`, `texture(...)`, and `FragColor`.
- Set source blending states: `NoBlending` for advection/divergence/poisson/pressure and `AdditiveBlending` for force.
- Added `ag-advection`, `ag-force`, `ag-divergence`, `ag-poisson`, and `ag-pressure` shader dumps mapped to source `Co/XT/Sf/$T/WT/YT/ZT`.
- Expanded output probes to assert main-fluid material modes, GLSL versions, blending/depth flags, and float/depthless target ownership.
- Expanded renderer audit coverage for source `ag`, `GT`, `qT`, `jT`, `KT`, and `JT`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `ag/GT/qT/jT/KT/JT` anchors recorded |
| Output probe | Passed with `PROBE_WAIT=9000`; main-fluid pass surfaces and float FBOs asserted |
| Shader dump | Passed; five `ag-*` rebuild shaders were dumped with source mappings |
| Thumb spotlight probe | Passed; source thumb strip and spotlight map retained |
| Project media probe | Passed; project detail pages retain five visible media tracks |
| Full source-vs-rebuild capture | Passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/` |
| Desktop center-band delta | `+0.0013` against source |
| Mobile center-band delta | `-0.0138` against source |

Decision: keep the source main-fluid pass surface. It removes a real source material/GLSL/FBO mismatch while preserving project media. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-119 Source `GT.createBounds()` Advection Boundary Pass

This batch completed the source `GT` advection pass shape by adding the missing boundary line pass. It is a source structure fix, not a visual constant tune.

Source evidence:

- Source `GT.init()` calls `createBounds()` immediately after the base `Ir.init()` plane setup.
- Source `GT.createBounds()` creates a `Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0])` boundary geometry.
- Source boundary material is raw GLSL3 with vertex `VT`, fragment `Sf`, `blending:ot`, `depthWrite:false`, `depthTest:false`, and the same `uniforms` object as the main advection material.
- Source `VT` offsets edge positions inward by `px` while preserving boundary UVs, so it is not equivalent to the main `Co` fullscreen/plane vertex.

Runtime and tooling changes:

- Added `fluidBoundsVertex` from source `VT`.
- Added an `ag-advection-bounds` `RawShaderMaterial` using the same uniforms object as the main advection material.
- Added a `LineSegments` boundary geometry to the advection scene, so the scene now mirrors source `GT` as main plane plus boundary line pass.
- Added output-probe assertions for `source-GT-bounds-raw-glsl3`, shared uniforms, no blending, and two advection scene children.
- Added shader-dump mapping for `ag-advection-bounds` to source `VT/Sf`.
- Expanded renderer audit checks for the source `GT.createBounds()` geometry and line-add anchors.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Passed |
| Renderer audit | Passed; source `GT.createBounds()` geometry and line-add anchors recorded |
| Output probe | Passed with `PROBE_WAIT=9000`; boundary pass material/shared-uniform/scene-child assertions passed |
| Shader dump | Passed; `ag-advection-bounds` was dumped against source `VT/Sf` |
| Thumb spotlight probe | Passed; source thumb strip and spotlight map retained |
| Project media probe | Passed; project detail pages retain five visible media tracks |
| Full source-vs-rebuild capture | Passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/` |
| Desktop center-band delta | `+0.0013` against source |
| Mobile center-band delta | `-0.0135` against source |

Decision: keep the source `GT.createBounds()` boundary pass. It closes a concrete main-fluid pass-shape residual and preserves project media. Phase 1 remains open for mobile fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-120 Phase 1 Shader Residual Audit and `$T` Force Surface

This batch expanded the implementation step size without changing visual constants. It grouped one source pass-surface fix with a reusable shader residual report so the next batches can target multiple current deltas without relying on stale notes.

Source/runtime evidence:

- Source `$T` declares `uniform vec2 force; uniform vec2 center; uniform vec2 scale; uniform vec2 px;` in the force fragment surface.
- The rebuild already used `center`, `scale`, and `px` in the source `XT`-shaped force vertex, but the fragment declaration surface only exposed `force`.
- Current generated shader dumps show matched core anchors for `OA-work-composite`, `A1-pre-composite`, `x1-thumb-composite`, `M1-thumb-plane`, `u1-environment`, `j1-media-composite`, and main-fluid helper passes after the force uniform surface fix.
- The remaining high-value shader residual is still `VA-work`: source keeps `bsdfs` and `opaque_fragment` include surface, while the rebuild currently expands the opaque tail manually. Core `VA/zA` checks still match, so this is an include-surface/bridge residual, not proof of a visual constant mismatch.

Runtime and tooling changes:

- Added `center`, `scale`, and `px` declarations to `fluidForceFragment`.
- Added `scripts/summarize-phase1-shader-gaps.mjs`, which reads `shader-dump-summary.json` and writes `phase1-shader-residuals.md/json`.
- `scripts/dump-va-shader.mjs` now automatically runs the residual summary after writing the shader dump.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Renderer audit passed.
- Shader dump passed and wrote `/tmp/rd-s120-shader/phase1-shader-residuals.md`; `ag-force` no longer reports source-only fragment uniforms.
- Output probe passed with no failures, exceptions, or shader/WebGL console errors.
- Thumb spotlight probe passed; source map/target/intensity stayed intact.
- Project media probe passed; `/gc-2026/` and `/hashgraph-vc/` retain five visible media tracks.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`.
- Band analysis: desktop center-band delta `+0.0013`; mobile center-band delta `-0.0137`.
- This is intentionally not a visual closeout. It should make the next production batch safer by showing which residuals are source-surface gaps versus already-matched core anchors.
- Phase 1 remains open for the `VA` include-surface residual, strict projection/material feel, mobile/fog-bed distribution, and transfer interpretation.

### S1-121 Source `VA/zA` Include Surface

This batch closed the specific `VA-work` include-surface residual identified by S1-120 without tuning lighting, color, or projection constants.

Source/runtime evidence:

- Source `zA` keeps `#include <bsdfs>` in the fragment shader before lights parsing.
- Source `zA` keeps `#include <opaque_fragment>` before the source tail mutates `gl_FragColor.rgb` and `gl_FragColor.a`.
- The rebuild's ordinary work-block `VA` already had matching core tail checks, but it had expanded the opaque output logic manually and therefore still differed at the include surface.
- The current generated residual report now shows `VA-work` with no source-only or rebuild-only fragment includes and no source-only or rebuild-only fragment uniforms.

Runtime and tooling changes:

- Ordinary work-block `VA` now inserts `#include <bsdfs>` before `#include <lights_pars_begin>` in the work variant.
- The work-block source tail chunk now keeps `#include <opaque_fragment>` before the existing source-style `gl_FragColor.rgb/a` mutations.
- `scripts/summarize-phase1-shader-gaps.mjs` now generates the `VA-work` reading from the current row data instead of hardcoding the older `bsdfs`/`opaque_fragment` residual.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Renderer audit passed.
- Shader dump passed and wrote `/tmp/rd-s121-shader/phase1-shader-residuals.md`; `VA-work` reports `source anchors match; text differs`, with no fragment include or uniform residuals.
- Output probe passed with no failures, exceptions, or shader/WebGL console errors.
- Thumb spotlight probe passed; source map/target/intensity stayed intact.
- Project media probe passed; project pages retain five visible media tracks.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`.
- Band analysis: desktop center-band delta `+0.0008`; mobile center-band delta `-0.0125`.
- Phase 1 remains open for generated shader text/bridge depth, strict projection/material feel, mobile/fog-bed distribution, and transfer interpretation.

### S1-123 Source `xt/Se` Visual Defaults

This batch aligned visual-state defaults and fallbacks with source `xt` / `Se.init()`. It did not change shader formulas, spotlight constants, projection strength, or project media mapping.

Source evidence:

- Source `xt` defines `darken=.2`, `saturation=.35`, `contrast=1.1`, `thumbDarknessIntensity=.5`, and `thumbDarknessColor="#000000"`.
- Source `OA` seeds `uDarken=xt.darken` and `uSaturation=xt.saturation`.
- Source `Se.init()` seeds `settings.darken`, `settings.saturation`, `settings.contrast`, and thumb defaults before route/page payloads override them.
- Source project detail routes still use detail fallbacks such as `darkenDetail || .25`, `saturation || 1`, and `contrast || 1.15`, so those are now named separately instead of being conflated with home/default state.

Runtime and tooling changes:

- WebGL initial `darken`, `saturation`, and `contrast` now start at source `.2`, `.35`, and `1.1`.
- Home visual fallback darken/saturation and about visual defaults now use the same source constants.
- Thumb fallback darkness/color/saturation/mouse-lightness now use the source default values.
- Project/detail fallback constants are named independently as `SOURCE_PROJECT_DETAIL_DARKEN`, `SOURCE_PROJECT_SATURATION_FALLBACK`, and `SOURCE_PROJECT_CONTRAST_FALLBACK`.
- Output and thumb probes now expose and hard-assert the source defaults so future route-state work cannot silently drift them.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed and wrote `/tmp/rd-s123-shader/phase1-shader-residuals.md`; `VA-work` remains classified as an r164 compile bridge with no include/uniform residuals.
- Output probe passed and reported source defaults `.2/.35/1.1`, project fallbacks `.25/1/1.15`, and thumb defaults `.5/#000000/1/1`.
- Thumb spotlight probe passed and retained source thumb strip shape, spotlight map, target `(0,0,-8)`, and intensity `220`.
- Project media probe passed; `/gc-2026/` and `/hashgraph-vc/` retain five visible media tracks.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`.
- Band analysis: desktop center-band delta `-0.0010`; mobile center-band delta `-0.0136`.
- Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-124 Source `k1/O1/N1/F1` Displacement Pass

This batch aligned the work-scene wavves/displacement render pass surface with source. It did not tune visual constants, spotlight values, cube material brightness, or project media mapping.

Source evidence:

- Source `k1` constructs its displacement scene with `renderManager = new O1(J.renderer, J.debug, "wavves")`.
- Source `O1 extends Lo` and source `Lo.update()` renders raw/composite targets through `setRenderTarget(...); render(...)` without a rebuild-only explicit clear.
- Source `N1 extends mt` binds fragment `F1`, source fullscreen vertex `tl`, and `glslVersion:lt`.
- Source `F1` uses the raw GLSL3 surface with `in vec2 vUv`, `out vec4 FragColor`, and `#include <tonemapping_pars_fragment>` / `#include <tonemapping_fragment>`.
- Source `k1.resize()` calls `renderManager.resize(t / 10, t / 10, n)` and sets `uRatio = e / t`.

Runtime and tooling changes:

- The displacement composite now uses `RawShaderMaterial` with `GLSL3`, `NoBlending`, `transparent:true`, and `toneMapped:false`.
- The displacement fragment now uses source-style `in/out`, `FragColor`, and tonemapping includes.
- The displacement pass now uses the same fullscreen vertex surface as other source `tl` fullscreen passes.
- The rebuild-only explicit `renderer.clear()` before the displacement render was removed.
- Shader dump now maps `N1-displacement-composite` to source `F1/tl`.
- Output probe now reports and hard-asserts displacement material mode, GLSL version, no-blending state, no-explicit-clear mode, target size, ratio, transparency, and tone-mapping state.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed and wrote `/tmp/rd-s124-shader/`; `N1-displacement-composite` source/rebuild files were generated, with fragment includes matched and the remaining source-only `tScene` uniform recorded.
- Output probe passed and reported `source-N1-raw-glsl3`, `glslVersion="300 es"`, `clearMode=source-Lo-no-explicit-clear`, target size `90x90` at `1440x900`, and ratio `1.6`.
- Thumb spotlight probe passed and retained source thumb strip shape, spotlight map, target `(0,0,-8)`, and intensity `220`.
- Project media probe passed; `/gc-2026/` and `/hashgraph-vc/` retain five visible media tracks.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`.
- Band analysis: desktop center-band delta `-0.0005`; mobile center-band delta `-0.0161`.
- Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-125 Source `N1/F1/tl` Displacement Residual Cleanup

This batch finished the next same-chain displacement cleanup after S1-124. It did not change brightness constants, spotlight constants, project transition code, or project media wiring.

Source evidence:

- Source `N1` binds uniforms `{ tScene, uRatio, uTime }`, vertex shader `tl`, fragment shader `F1`, `glslVersion:lt`, `blending:ot`, `transparent:true`, `depthWrite:false`, and `depthTest:false`.
- Source `F1` declares global vignette constants `vignout=.5`, `vignin=.01`, and `vignfade=2.0`, then calls `vignette(uvVignette.xy, vignin, vignout, vignfade, .4)`.
- Source `tl` computes `gl_Position` through `modelMatrix`, `viewMatrix`, and `projectionMatrix`; source `Lo` still uses fullscreen-triangle geometry, so this is a vertex-path alignment rather than a geometry replacement.
- The generated residual summary had dumped `N1-displacement-composite` files but did not list that shader in the focused Phase 1 residual table.

Runtime and tooling changes:

- The displacement material now declares and binds source `tScene` to the displacement target texture.
- The displacement fragment now uses source global vignette constants instead of inline literal arguments.
- The displacement pass now uses an isolated `sourceTlFullscreenVertex` and `makeSourceFullscreenTriangle()` path, leaving other stable post passes on their existing fullscreen vertex bridge.
- Output probe now hard-asserts `vertexMode=source-tl-matrix-fullscreen`, `tSceneBound=true`, and `vignetteConstantsMode=source-F1-globals`.
- `scripts/summarize-phase1-shader-gaps.mjs` now includes `N1-displacement-composite` in the focused residual table.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed and wrote `/tmp/rd-s125-shader/phase1-shader-residuals.md`; `N1-displacement-composite` is now listed with no source-only/rebuild-only fragment includes or uniforms.
- Output probe passed and reported `source-N1-raw-glsl3`, `vertexMode=source-tl-matrix-fullscreen`, `tSceneBound=true`, `vignetteConstantsMode=source-F1-globals`, target size `90x90`, and ratio `1.6`.
- Thumb spotlight probe passed and retained source thumb strip shape, spotlight map, target `(0,0,-8)`, and intensity `220`.
- Project media probe passed; `/gc-2026/` and `/hashgraph-vc/` retain five visible media tracks.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`.
- Band analysis: desktop center-band delta `-0.0014`; mobile center-band delta `-0.0158`.
- Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-126 Source `Lo/tl` Sky/Thumb Composite Vertex Surface

This batch aligned the remaining same-family `Lo` composite vertex surfaces for sky and thumb composites. It did not change `OA/CA`, `A1/C1`, bloom helper passes, lighting constants, texture color spaces, or project media wiring.

Source evidence:

- Source `Lo.initRenderer()` creates a fullscreen-triangle geometry and renders its `screen` mesh through a screen orthographic camera.
- Source `tl` computes fullscreen `gl_Position` through `modelMatrix`, `viewMatrix`, and `projectionMatrix`.
- Source `_1/x1` binds `vertexShader:tl` for the thumb composite fragment `v1`.
- Source `z1/H1` binds `vertexShader:tl` for the sky composite fragment `B1`.
- Source `B1` includes `#include <tonemapping_pars_fragment>` before its uniforms and `#include <tonemapping_fragment>` at the tail.
- Source `OA/lA/W1/sg/rg/cg/Na` use other vertex shaders (`el`, `OT`, `BT`, `iA`, `HT`), so those are deliberately not part of this batch.

Runtime and tooling changes:

- `z1-sky-composite` now uses the isolated source `tl` matrix fullscreen vertex and source fullscreen mesh helper.
- `x1-thumb-composite` now uses the same isolated source `tl` matrix fullscreen vertex and source fullscreen mesh helper.
- `skyCompositeFragment` now carries the missing `tonemapping_pars_fragment` include.
- Shader dump now maps `x1-thumb-composite` to source `tl` so its vertex surface is compared.
- Output probe now reports and hard-asserts `skyComposite.vertexMode=source-tl-matrix-fullscreen`.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed and wrote `/tmp/rd-s126-shader/phase1-shader-residuals.md`; `z1-sky-composite` no longer has source-only fragment includes, and `x1-thumb-composite` now has source/rebuild vertex comparison.
- Output probe passed and reported `skyComposite.vertexMode=source-tl-matrix-fullscreen` with no failures, exceptions, or console messages.
- Thumb spotlight probe passed and retained source thumb strip shape, spotlight map, target `(0,0,-8)`, and intensity `220`.
- Project media probe passed; `/gc-2026/` and `/hashgraph-vc/` retain five visible media tracks.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`.
- Band analysis: desktop center-band delta `-0.0005`; mobile center-band delta `-0.0163`.
- Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-127 Source `cg/nA` Bloom Composite Uniform Surface

This batch aligned the source bloom composite material interface and fragment surface. It did not change bloom strength/radius constants, render-target ownership, route transitions, or project media wiring.

Source evidence:

- Source `cg` is a raw GLSL3 material with `defines:{NUM_MIPS:5,DITHERING:e}`, vertex `iA`, fragment `nA`, and uniforms `tBlur1..tBlur5` plus `uBloomFactors`.
- Source `nA` uses `precision mediump float`, samples `tBlur1..5`, weights them with `uBloomFactors[NUM_MIPS]`, and keeps the shared `random`/`dither` helper behind `#ifdef DITHERING`.
- Source `cg` does not expose rebuild-only `tBloom1..5` or `uFactor1..5` uniforms.

Runtime and tooling changes:

- `homeBloomCompositeFragment` now follows the source `nA` uniform surface, precision, weighted texture sum, and dither helper/branch surface.
- Work and main bloom composite materials now bind `tBlur1..5`, `uBloomFactors`, and `NUM_MIPS=5`.
- Output probe now reports and hard-asserts `source-cg-tBlur-uBloomFactors`, `NUM_MIPS=5`, array factors, source blur uniforms, and absence of rebuild-only bloom/factor uniforms for both work and main bloom composites.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s127-shader`.
- Output probe passed and reported source `cg` uniform mode for work and main bloom composites: `/tmp/rd-s127-output`.
- Thumb spotlight probe passed: `/tmp/rd-s127-thumb`.
- Project media probe passed; `/gc-2026/` and `/hashgraph-vc/` retain five visible media tracks: `/tmp/rd-s127-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`: `/tmp/rd-s127-capture`.
- Band analysis: desktop center-band delta `-0.0017`; mobile center-band delta `-0.0159`.
- Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-128 Source `OA/CA` Mixed/Blend Shader Surface

This batch narrowed the central work composite shader surface toward source `CA`. It did not change `uDarken`, `uSaturation`, bloom strength/radius, render-target ownership, renderer output color space, or route transitions.

Source evidence:

- Source `CA` stores the composite color in `vec4 mixed`, not the rebuild-only `vec3 color` path.
- Source `CA` calls the shared `blend(...)` dispatcher for `blend(15, ...)` multiply-darken and `blend(11, ...)` lighten-black.
- Source `CA` keeps `float luminance(...)`, the `vignette(...)` helper surface, vignette globals `vignout/vignin/vignfade`, and inert `green` / `greenLight` locals.
- Source `CA` computes `vignetteF` but leaves `mixed.rgb *= vignetteF` commented out, so this batch preserves the inert computation without applying it.

Runtime and tooling changes:

- `homeCompositeFragment` now uses source-style `mixed`, `blend(...)`, `luminance`, `vignette`, vignette globals, and inert color locals.
- Query-only debug composite replacements were updated to follow the new `mixed`/`blend(...)` surface.
- Output probe now reports and hard-asserts `shaderSurface.formulaMode="source-CA-mixed-blend-surface"` plus source helper/local markers and absence of rebuild-only `sourceBlend(...)` calls.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s128-shader`.
- Output probe passed and reported the new `OA/CA` shader-surface markers: `/tmp/rd-s128-output`.
- Thumb spotlight probe passed: `/tmp/rd-s128-thumb`.
- Project media probe passed; `/gc-2026/` and `/hashgraph-vc/` retain five visible media tracks: `/tmp/rd-s128-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`: `/tmp/rd-s128-capture`.
- Band analysis: desktop center-band delta `-0.0015`; mobile center-band delta `-0.0153`.
- Phase 1 remains open for mobile/fog-bed distribution, strict `VA/GA` projection/material feel, and transfer interpretation.

### S1-129 Source `GA.createPlane()` / Local `Ka` Mesh Ownership

This batch narrowed per-work `GA/Ka` object ownership toward source `GA.createPlane()`. It did not change visual constants, shader formulas, spotlight intensity, thumb darkness, or render-target transfer.

Source evidence:

- Source `GA.createPlane()` creates `this.plane` and `this.rayPlane` separately.
- Source simulation plane is scaled to `35*1.3` by `23*1.3` and positioned at `23*1.3/2`.
- Source ray plane starts at the same size, is positioned at `23*1.3/2+.01`, then is multiplied by `1.5`.
- Source attaches only `rayPlane` to `rotationWrap`; the simulation `plane` is passed to `new Ka({ mesh:this.plane, rayCastMesh:this.rayPlane })`.
- Source `GA.resize()` calls `this.mouseSim.onResize(this.plane.scale.x,this.plane.scale.y)`.

Runtime and tooling changes:

- Each work item now keeps an explicit invisible `mousePlane` with source scale and z position.
- `rayPlane` now uses source-style unit geometry plus source scale instead of baking the size into geometry.
- Per-work mouse simulation targets and `uCoords` are resized from `mousePlane.scale`, mirroring source `mouseSim.onResize(this.plane.scale.x,this.plane.scale.y)`.
- Output probe now reports and hard-asserts `mousePlane` scale/z/parentage, `rayPlane` scale/z/parentage, target sizing, `uCoords`, UV offset/scale, persistence, and thickness.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s129-shader`.
- Output probe passed with the expanded `GA/Ka` source-shape assertions: `/tmp/rd-s129-output`.
- Thumb spotlight probe passed: `/tmp/rd-s129-thumb`.
- Project media probe passed; `/gc-2026/` and `/hashgraph-vc/` retain five visible media tracks: `/tmp/rd-s129-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`: `/tmp/rd-s129-capture`.
- Band analysis: desktop center-band delta `-0.0003`; mobile center-band delta `-0.0159`.
- Phase 1 remains open for mobile/fog-bed distribution, strict projection/material feel, and transfer interpretation.

### S1-122 `VA/zA` r164 Bridge Attribution

This batch did not change rendering. It prevents a known unsafe follow-up by classifying the remaining `VA-work` shader text residual that looked source-different after S1-121.

Source/runtime evidence:

- Source `zA` uses the old physical-material define surface `#define SPECULAR` under `PHYSICAL`.
- The local Three r164 `lights_physical_fragment` chunk gates specular setup behind `#ifdef USE_SPECULAR`, and does not include an `#ifdef SPECULAR` path.
- The rebuild has already aligned old source map macro spellings such as `USE_SPECULARCOLORMAP` / `USE_SPECULARINTENSITYMAP`, and has stripped r164-only dispersion, anisotropy, and sheen outgoing-light branches.
- Therefore the remaining `SPECULAR` versus `USE_SPECULAR` difference is a compile bridge for the Three r164 chunk dependency, not a safe standalone source-text replacement.

Runtime and tooling changes:

- `scripts/dump-va-shader.mjs` now records `vaBridgeCompatibility` for `VA-work`.
- The dump summary now exposes `lightsPhysicalFragment` chunk checks alongside `lightsFragmentBegin` and `opaqueFragment`.
- `scripts/summarize-phase1-shader-gaps.mjs` adds a Bridge Notes column and classifies `VA-work` as an `r164 compile bridge` when the source/rebuild/chunk evidence matches this shape.

Verification notes:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed and wrote `/tmp/rd-s122-shader/phase1-shader-residuals.md`; `VA-work` reports no include/uniform residuals and Bridge Notes says the remaining specular define delta is an r164 compile bridge.
- Output probe passed with no failures, exceptions, or shader/WebGL console errors.
- Thumb spotlight probe passed.
- Project media probe passed; project pages retain five visible media tracks.
- Full source-vs-rebuild capture passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`.
- Band analysis: desktop center-band delta `+0.0018`; mobile center-band delta `-0.0139`.
- Phase 1 remains open. This is attribution hardening so the next implementation batch can focus on visual parity blockers instead of a false `VA` macro target.

### S1-70 Source Floor Circle Geometry

This batch corrected a source-confirmed `a1` floor geometry mismatch rather than tuning brightness.

Source/runtime evidence:

- Source `Tu` is `CircleGeometry`; source `a1.init()` creates `new Tu(60,32)`, rotates the mesh by `-Math.PI/2`, attaches the reflector, and updates the reflector through the floor mesh render lifecycle.
- The rebuild had used `PlaneGeometry(60,32)`, which made the floor/reflection surface rectangular and produced a non-source mid-field reflection boundary.
- Production now uses `CircleGeometry(60,32)` and the debug probe exposes `reflectionState` for scene/floor/environment/camera/clip-state attribution.

Verification from the source-vs-rebuild capture:

| Measurement | Result | Meaning |
| --- | ---: | --- |
| Desktop center-band source/rebuild delta | `~+0.001` | The main desktop center brightness now lines up closely after the geometry correction. |
| Desktop strongest horizontal delta difference | `~+0.0068` | The earlier hard collapse around mid-height is materially reduced. |
| Project media probe | 5 visible tracks on `/gc-2026/` and `/hashgraph-vc/` | Project detail media did not regress. |

Decision: keep the circle geometry correction. Phase 1 remains open because mobile background distribution and cube/thumb projection still need source-driven alignment.

### S1-71 Home Spotlight Target Alignment

This batch corrected one source-confirmed `SD/p1/T1` spotlight projection mismatch.

Source/runtime evidence:

- Source `SD.init()` wires the home spotlight map from `J.workThumbScene.renderManager.renderTargetComposite.texture`.
- The same source block sets `J.workScene.spotLight.position` to `(0,0,3.7)`, `target.position` to `(0,0,-8)`, and intensity to `220`.
- The rebuild already used the thumb composite map, position, and intensity, but `initHomeSpotlight()` reset the target to `(0,0,0)`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Thumb spotlight probe | `hasMap=true`, target `[0,0,-8]`, intensity `220`, no failures/exceptions |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` keep 5 visible media tracks |
| Full source-vs-rebuild capture | Home/about/project pages captured without failures/exceptions |
| Desktop center-band delta | `-0.0014` against source |
| Mobile center-band delta | `-0.0141` against source |

Decision: keep the source target. This is a projection/depth correction, not a visual brightness tune. Phase 1 remains open for remaining cube/thumb projection transfer and render-manager/color interpretation gaps.

### S1-72 Main I1 Default Screen Path

This batch removed one non-source main output layer from the default Phase 1 home path.

Source/runtime evidence:

- Source `I1.initSettings()` sets the main render manager to `renderToScreen=true` with `bloom`, `luminosity`, `blur`, and `fxaa` disabled by default.
- Source `I1.update()` uses `C1/A1` as the main `compositeMaterial`; in the default branch it renders that screen material directly to the canvas.
- The rebuild still rendered `A1/C1` into `compositeTarget`, then passed it through an additional generic `mainCompositeFragment` that adds rgb shift and fluid luminance even when all source main post passes are disabled.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Output probe | No failures/exceptions; default main post flags remain disabled except source GPU-tier fluid input to `A1/C1` |
| Thumb spotlight probe | `hasMap=true`, target `[0,0,-8]`, intensity `220`, no runtime errors |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` keep 5 visible media tracks |
| Full source-vs-rebuild capture | Home/about/project pages captured without failures/exceptions |
| Desktop center-band delta | `-0.0015` against source |
| Mobile center-band delta | `-0.0168` against source |

Decision: keep the direct `A1/C1` default screen path. This is a source-structure fix, not a global brightness tune. Phase 1 remains open because the screenshot band analysis still shows a residual horizontal boundary distribution mismatch and cube/thumb projection feel is not yet fully 1:1.

### S1-73 Source IT Camera Controller Matrix Path

This batch corrected one source-confirmed camera-controller structure mismatch without changing visual constants.

Source/runtime evidence:

- Source `IT` owns three nested groups: `group -> rotateGroup -> innerGroup`.
- Source disables matrix auto-update on all three groups, sets `rotateGroup.rotation.y = Math.PI`, lerps `group.position` toward the pointer target, applies camera roll to `rotateGroup.rotation.z`, then decomposes `innerGroup.matrixWorld` into the camera position/quaternion/scale.
- The rebuild previously approximated this by lerping `homeCamera.position`, calling `homeCamera.lookAt()`, then mutating `homeCamera.rotation.z`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Output probe | Camera quaternion/controller/rotate-group fields present; no failures/exceptions |
| Shader dump | No console or shader runtime errors |
| Thumb spotlight probe | `hasMap=true`, target `[0,0,-8]`, intensity `220`, no runtime errors |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` keep 5 visible media tracks |
| Full source-vs-rebuild capture | Home/about/project pages captured without failures/exceptions |
| Desktop center-band delta | `-0.0009` against source |
| Mobile center-band delta | `-0.0129` against source |

Decision: keep the source-shaped `IT` matrix path. This is an attribution and projection-ownership fix; Phase 1 remains open for the remaining mobile/background distribution and cube/thumb projection feel.

### S1-74 Source IT Pointer Sampling Lifecycle

This batch corrected one source-confirmed camera/mouse input lifecycle mismatch.

Source/runtime evidence:

- Source `IT.addListeners()` registers `pointerdown`, `pointermove`, and `pointerup`.
- Source `onPointerDown` and `onPointerUp` both delegate to `onPointerMove`, so the same mouse state used by camera parallax/roll updates on press, movement, and release.
- The rebuild previously updated `pointerPixels`, `targetPointer`, and screen mouse simulation target only on `pointermove`.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Output probe | No failures/exceptions |
| Thumb spotlight probe | `hasMap=true`, target `[0,0,-8]`, intensity `220`, no runtime errors |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` keep 5 visible media tracks |
| Full source-vs-rebuild capture | Home/about/project pages captured without failures/exceptions |
| Desktop center-band delta | `-0.0008` against source |
| Mobile center-band delta | `-0.0133` against source |

Decision: keep the source pointer lifecycle. This is an interactive input parity fix, not a static brightness fix. Phase 1 remains open for the remaining mobile/background distribution, hard band attribution, and cube/thumb projection feel.

### S1-75 OA/CA Core Formula Audit Tooling

This batch added a focused shader-audit guard instead of changing production rendering.

Source/runtime evidence:

- Source `OA` uses source shader `CA` as the work render-manager composite.
- A source-vs-rebuild diff of `OA-work-composite` shows the remaining text delta is mainly helper expansion, GLSL surface differences, and unused source variables.
- The core formula anchors are now checked automatically by `scripts/dump-va-shader.mjs`: scene rgbshift, bloom rgbshift/addition, bloom distortion angle/amount, fluid luminance add, darken opacity, multiply-darken, lighten-black, saturation, and tonemapping tail.
- The current dump at `/tmp/rd-composite-core-checks` reports every `OA-work-composite` core anchor as present in both source and rebuild.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Shader dump | `OA-work-composite.compositeCoreChecks` all true for source and rebuild |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` keep 5 visible media tracks |

Decision: do not chase Phase 1 by rewriting the `OA/CA` formula or promoting `debug-composite-transfer` to production. The remaining transfer/brightness gap needs source evidence in upstream `VA`/spotlight-map content/transfer or renderer/render-target interpretation, not visual tuning in the already matched `OA` formula.

### S1-76 VA/HA Vertex Core Formula Audit Tooling

This batch added a focused vertex-shader audit guard instead of changing production rendering.

Source/runtime evidence:

- Source `HA` and rebuild `VA` both compute screen UV from clip position and `uCoords`, assign `newUv` from that screen UV, sample `tMouseSim` through local mouse UVs, use source `spread = 3`, apply the pre-perlin `mouseSim.r * .05` scale, mix toward the perlin-displaced position, apply the `uMouseFactor` z transform, and divide by the source world-position mouse term.
- The previous broad `keyChecks` line for `transformed *= 1.0 - mouse` was too brittle because source and rebuild formatting differ while the formula is present in both shaders.
- `scripts/dump-va-shader.mjs` now reports `vertexAnalysis.coreChecks` so future generated shader dumps can distinguish real formula gaps from formatting or compatibility residuals.

Verification:

| Check | Result |
| --- | --- |
| Shader dump | `VA.vertexAnalysis.coreChecks` all true for source and rebuild |

Decision: keep this as audit tooling only. The remaining Phase 1 cube/projection gap should not be chased by reordering or retuning the already matched `HA` vertex core unless a narrower source difference is found.

### S1-77 T1/x1/Lo Thumb Render Pass Clear Alignment

This batch corrected one source-confirmed thumb render-manager pass-order detail.

Source/runtime evidence:

- Source `Lo.update()` renders to `renderTargetA`, wires that texture into the composite material, then renders to `renderTargetComposite` without explicit `renderer.clear()` calls.
- Source `x1` extends `Lo` for the work-thumb scene, and `T1.resize()` sizes the render manager to a square `height x height` target with DPR `1`.
- The rebuild already had the source square target, orthographic camera, thumb scale, visible range, and spotlight map ownership, but still cleared both thumb targets in the custom `renderThumbTargets()` implementation.

Verification:

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run build` | Passed |
| Thumb spotlight probe | `hasMap=true`, target `[0,0,-8]`, intensity `220`, no failures/exceptions |
| Project media probe | `/gc-2026/` and `/hashgraph-vc/` keep 5 visible media tracks |
| Full source-vs-rebuild capture | Home/about/project pages captured without failures/exceptions |
| Desktop center-band delta | `-0.0009` against source |
| Mobile center-band delta | `-0.0129` against source |

Decision: keep the no-clear thumb pass alignment. This applies only to the `T1/x1/Lo` thumb render-manager path; it does not justify a partial no-clear rewrite of the more complex `Lu/kA` work render manager.

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

### S1-62 `VA` / Spotlight / Composite Attribution Batch

This batch expanded the step size across one coherent Phase 1 chain: generated `VA` shader residuals, spotlight/thumb transfer, and composite-stage attribution. Production rendering is unchanged.

Tooling changes:

- `scripts/compare-home-brightness-attribution.mjs` now accepts `VARIANTS=label,label` so focused shader/transfer matrices can run without the full diagnostic set.
- `scripts/compare-composite-stages.mjs` now writes `compact-summary.json` and prints a compact matrix while preserving the full `summary.json` on disk.

Source/runtime evidence:

- `scripts/dump-va-shader.mjs` still shows a real source residual in `HA`: source derives the local mouse UV from `screenUv = gl_Position.xy / uCoords.xy`, while the stable rebuild bridge derives it from geometry UV. The existing `debug-va-vertex-uv=source-zero` and `debug-va-world-undo=source` trials compile cleanly but only move current luma slightly; this is source evidence for a future bridge-depth pass, not a current visual fix.
- `VARIANTS=default,va-world-undo-source,va-vertex-uv-source-zero` at `/tmp/rogier-va-attribution` showed no shader/runtime errors and only small changes in `workRaw`, `workComposite`, and `preComposite` luma. Promoting either debug switch would not address the visible hard horizon.
- Spotlight/thumb color-space diagnostics again show that sRGB-style transfer strongly brightens the thumb map/composite, but the mirrored source still assigns `SpotLight.map` from the render target texture directly. No source-backed texture color-space promotion was found.
- Composite-stage diagnostics at `/tmp/rogier-composite-current` confirm the stage/darken/transfer variants remain useful attribution tools, but not production fixes. Scene-gamma/linearize remains a transfer hypothesis without source proof.

Decision: keep normal rendering unchanged. The next production code change should be source-backed in the actual render-target/color interpretation path or a narrower `VA` shader bridge change that preserves Three r184 lighting/spotlight compatibility. Do not promote `debug-va-*`, `debug-spotlight-map-transfer=srgb`, or `debug-composite-transfer=*` as visual shortcuts.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe at `/tmp/rogier-camera-probe-2` passed with no network/runtime/WebGL errors and reported the entered home gallery camera as `targetXY=[1,.5]`, `rotateAngle=20`.
- Full source-vs-rebuild capture at `/tmp/rogier-camera-gallery-entry-full` passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed network requests or runtime exceptions.

Decision: keep this as a source-correct lifecycle/camera fix. It is not a claimed hard-horizon solution. The next Phase 1 batch should continue with floor/environment/A1 input attribution now that the home gallery camera state is no longer ambiguous.

### S1-61 Environment / A1 / Floor Non-Fix Audit

This batch audited the remaining hard-horizon suspects after S1-60 corrected the gallery camera entry state.

Source-checked runtime change:

- Source `u1` environment material is constructed from `MeshStandardMaterial` with `side=BackSide`, `envMapIntensity=1`, `fog=false`, and `dithering=true`; it does not explicitly set `toneMapped=false`. The rebuild removed its extra `toneMapped:false` flag from the environment material.

Source-checked non-fixes:

- Source `l1/u1/h1` visible environment shader math matches the current rebuild bridge in the active path: `tSky` double sampling, seam mask, `blend(4)`, `blend(16)`, `skyMask2 = max(skyMask, step(...))`, `* 1.15`, clamp multiplication, lighting includes, and final darken-color blend are all already represented.
- Source `V1/H1/z1/B1` sky target renders a `#666666` scene background into a `0.75 * height` square target, then applies the source `noiseShader -> blendReflect -> contrast(2) -> *2 -> .9 - color` composite. The rebuild's sky raw/composite target structure remains source-shaped.
- Source `A1/C1` home flow still uses the same primary `tWork`, fluid UV, perlin, mouseSim, contrast, saturation, background-lighten, media reveal, and noise tail order that the rebuild already carries. No source evidence supports changing `uReveal` ownership or promoting a transfer/debug variant.
- Source `a1/o1/i1` floor/reflection path matches the current accepted bridge: plane geometry `60x32`, color `#4a4a4a`, normal repeat `45x45`, `uMirror=1`, `reflectivity=.97`, `uFloorMixStrength=15`, reflector target size `0.75 * renderSize`, two blur iterations with directions `15,0` then `0,0`, oblique clip plane, and floor `onBeforeRender` ownership.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe at `/tmp/rogier-env-tonemapped-probe` passed with no network/runtime/WebGL errors.
- Home source-vs-rebuild capture at `/tmp/rogier-env-tonemapped-home` passed with no failed network requests or runtime exceptions.
- Correct band analysis for `/tmp/rogier-env-tonemapped-home` shows the hard boundary is still open: desktop rebuild center-band luma `0.2867` vs source `0.2281`, strongest rebuild delta `0.1272` at `63.3%`; mobile rebuild center-band luma `0.3707` vs source `0.2167`, strongest rebuild delta `0.2694` at `49.8%`.

Decision: keep the environment material flag correction as source parity, but do not treat it as a visual fix. The next Phase 1 batch should move away from broad shader formula checks and toward exact render-target/color-transfer interpretation or generated shader diffing for `VA`/environment under the local Three version.

### S1-63 Main `I1/ag` Fluid Alignment

This batch restored the source main-render-manager fluid setting and added a minimal source-shaped `ag` fluid pass for the main `A1/C1` pre-composite input. Source `I1.initSettings()` enables `fluid` on high GPU tier with `{ mouseForce: 5, cursorSize: 6, delta: .125, poissonIterations: 1, bounce: false }`; the rebuild had the same constants but left the main fluid disabled.

Source-backed runtime changes:

- `SOURCE_MAIN_RENDER_SETTINGS.fluid.enabled` is now true for the normal rebuild path.
- Added a dedicated main fluid ping-pong pass with advection, additive force, divergence, Poisson pressure solve, and pressure subtraction stages.
- Fluid targets use float render targets with clamp/linear sampling.
- `resizeMainFluidPass()` follows source sizing: half floor-power-of-two render size, divided by 3, then `ag.resolution = .005`. At 1440x900 this intentionally rounds to a `1x1` simulation target.
- `A1/C1` pre-composite now samples the main fluid texture instead of the placeholder when fluid strength is active.
- `?debug-main-fluid=off` disables the pass for attribution without changing normal production settings.
- `window.__rogierOutputProbe.mainFluid` now reports enabled/debug state, fbo size, cell scale, bounds, pointer state, target metadata, and target stats.
- `scripts/probe-output-color.mjs` now merges probe query parameters into `REBUILD_URL` instead of appending a second malformed query string, so debug variants such as `?debug-main-fluid=off` are measurable.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Default output probe at `/tmp/rogier-main-fluid-probe-default-2` passed with no network failures, runtime exceptions, or WebGL console errors. It reported `mainFluid.enabled=true`, `fboSize=[170.6667,85.3333]`, `cellScale=[0.005859375,0.01171875]`, `FloatType`, and target size `1x1`.
- Fluid-off output probe at `/tmp/rogier-main-fluid-probe-off-2` passed with no failures/errors and correctly reported `mainFluid.enabled=false`.
- Brightness attribution default at `/tmp/rogier-main-fluid-attribution` passed with errors `0`; default luma stayed in the current range (`workComposite=0.2404`, `preComposite=0.3135`, `bloom=0.0287`, `thumbComposite=0.1831`).
- Home source-vs-rebuild capture at `/tmp/rogier-main-fluid-home` passed, and band analysis confirmed the existing center/horizon brightness gap remains open rather than solved by main fluid.
- Full capture at `/tmp/rogier-main-fluid-full` passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`; all rebuild pages reached full-canvas states with no failed requests or runtime exceptions.

Decision: keep this as a source-correct render-manager input alignment. It closes the explicit `I1` fluid-enabled divergence but does not close Phase 1 visual parity. The hard horizon/fog-bed mismatch, cube/thumb brightness/projection gap, and final transfer/color interpretation remain active blockers.

### S1-64 Render-Manager Fullscreen Triangle Alignment

This batch aligned the rebuild's postprocess/simulation screen-pass geometry with the source render managers. Source `Lu`, `I1`, and related render managers build a single fullscreen triangle using positions `[-1,3,0], [-1,-1,0], [3,-1,0]` and UVs `[0,2], [0,0], [2,0]`; the rebuild still used `PlaneGeometry(2,2)` for many screen passes.

Source-backed runtime changes:

- Added `makeFullscreenTriangle()` with the source position/UV layout and `frustumCulled=false`.
- Replaced postprocess full-screen quads with the source fullscreen triangle for sky composite, background, `A1/C1` pre-composite, `OA/CA` composite, luminosity, bloom blur/composite, optional blur, FXAA, displacement, floor-reflection blur, screen mouse simulation, thumb composite, per-work local mouse simulation, and bounded main-fluid passes.
- Kept real scene planes unchanged where the geometry has non-screen semantic meaning: thumbnail planes, character fallback plane, and the main-fluid force brush still use plane geometry.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe at `/tmp/rogier-fullscreen-triangle-probe` passed with no failed requests, runtime exceptions, or WebGL console errors. Default luma remained stable (`workComposite=0.2349`, `preComposite=0.3040`, `bloom=0.0289`, `thumbComposite=0.1825`).
- Brightness attribution default at `/tmp/rogier-fullscreen-triangle-attribution` passed with errors `0`.
- Home source-vs-rebuild capture at `/tmp/rogier-fullscreen-triangle-home` passed, and band analysis confirmed the existing hard horizon/fog-bed gap remains open.
- Full capture at `/tmp/rogier-fullscreen-triangle-full` passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`; all rebuild pages reached full-canvas states with no failed requests or runtime exceptions.

Decision: keep this as source-correct render-manager structure. It reduces another implementation-level divergence without claiming a visual closeout. The next source-backed batch still needs to target the remaining hard horizon/fog-bed and final transfer/color interpretation gaps.

### S1-65 Floor Normal Matrix Alignment

This batch aligned the floor normal-map UV ownership with source `a1/o1/i1`. Source applies `Xt.floorNormal.repeat.set(45,45)` on the texture matrix, then leaves the material's `uNormalScale` at its default `vec2(1.)`; the rebuild previously encoded the same tiling in `uNormalScale`, which was visually similar but structurally different from the source shader path.

Source-backed runtime changes:

- The loaded floor normal texture now sets `repeat=(45,45)`, updates its texture matrix, and passes that matrix into `uMapTransform`.
- `uNormalScale` is restored to source default `(1,1)`, so the shader samples `tNormalMap` through the source matrix path instead of a rebuild-only scale uniform.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe at `/tmp/rd-floor-probe` passed with no failed requests, runtime exceptions, or WebGL console errors. It confirmed `floor.uNormalScale=[1,1]`, reflection targets `1080x675`, and stable source-shaped floor uniforms.
- Home source-vs-rebuild capture at `/tmp/rd-floor-home` passed; band analysis confirms the existing hard horizon/fog-bed gap remains open.
- Full capture at `/tmp/rd-floor-full` passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`; all rebuild pages reached full-canvas states with no failed requests or runtime exceptions, and project page content remained present.

Decision: keep this as a source-correct floor structure fix. It does not close Phase 1 visual parity. The next Phase 1 batch should group up to ten related source-backed differences around floor/environment output, `VA` generated shader deltas, and `OA/CA` transfer attribution before the next full verification/commit cycle.

### S1-66 Home Spotlight Target / Probe Alignment

This batch audited source `p1.setLights()` and about visual `TD.updateSpotLight()` to separate home spotlight ownership from about spotlight ownership. Source home creates the spotlight at `(0,0,3.7)` and adds its target without moving it, so the home target remains the Three default origin. Source about visual later moves the same spotlight target to `aboutBlocks.position + (1.5, 0, -8)` only while the about visual is active. The rebuild had incorrectly initialized the home target to `(0,0,-8)`.

Source-backed runtime changes:

- Restored the home spotlight target to `(0,0,0)` during initialization and `initHomeSpotlight()`.
- Kept the about visual spotlight target path at `z - 8`, matching source `TD.updateSpotLight()`.
- Expanded thumb/output probes with spotlight `position`, `target`, and `parallax` fields so future projection QA can verify actual runtime state instead of inferring it from screenshots.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe at `/tmp/rd-home-spot-target-probe-2` passed with no failed requests, runtime exceptions, or WebGL console errors. It confirmed home spotlight `position=[0,0,3.7]`, `target=[0,0,0]`, `parallax=true`, `hasMap=true`, and five in-map projection samples.
- Home source-vs-rebuild capture at `/tmp/rd-home-spot-target-home` passed. Band analysis still shows the hard horizon/fog-bed gap remains open.
- Full capture at `/tmp/rd-home-spot-target-full` passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`; all rebuild pages reached full-canvas states with no failed requests or runtime exceptions, and project page content remained present.

Decision: keep this as source-correct home spotlight ownership. It is not a Phase 1 visual closeout because centered static projection is mostly unchanged; the benefit is correct parallax/projection state and better future attribution.

### S1-67 Three Runtime Version Alignment

This batch aligned the rebuild's Three.js runtime generation with the mirrored source bundle. The original bundle identifies as Three r164, while the rebuild had been running Three `0.184.0` with `@types/three` `0.184.1`. That version gap was a structural source of shader chunk, lighting, spotlight-map, render-target, and color-transfer differences, especially for the `VA/GA` material bridge and `OA/CA` attribution work.

Source-backed runtime changes:

- Pinned `three` to `0.164.1`, matching the source bundle generation.
- Pinned `@types/three` to `0.164.1` so runtime and type surface remain in the same Three generation.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with Three `0.164.1`.
- `git diff --check` passed.
- Output probe at `/tmp/rd-three-r164-probe` passed with no failed requests, runtime exceptions, or WebGL console errors. It showed a material shift in work/light targets (`workRaw` and `workComposite` brighter), confirming that Three version semantics are part of the remaining rendering gap.
- Home source-vs-rebuild capture at `/tmp/rd-three-r164-home` passed. Band analysis still shows the hard horizon/fog-bed gap remains open and the middle bands remain brighter than source.
- Full capture at `/tmp/rd-three-r164-full` passed for home desktop/mobile, about, `/gc-2026/`, and `/hashgraph-vc/`; all rebuild pages reached full-canvas states with no failed requests or runtime exceptions, and project page content remained present.
- Final output probe at `/tmp/rd-three-r164-final-probe` passed after also locking `@types/three`.

Decision: keep the r164 dependency alignment. This is not a visual closeout by itself, but it removes a major non-source variable before further `VA/HA/zA`, spotlight-map, and final transfer work. The next Phase 1 batch should re-audit the remaining shader bridge and output-transfer gaps under r164 rather than continuing to compensate for Three 0.184 behavior.

### Phase 1 Final Difference Audit Matrix

This matrix is the working closeout audit for Phase 1. It converts the remaining source-analysis threads into implementation decisions so Phase 1 can finish without open-ended brightness tuning.

| ID | Chain | Source target | Current rebuild state | Phase 1 decision | Phase 2 carryover |
| --- | --- | --- | --- | --- | --- |
| F1 | `p1` hierarchy / scene ownership | Source home scene owns `sceneWrap`, `blocksWrap`, work blocks, thumb scene, floor, environment, about/floating blocks, route-specific toggles, and shared render manager wiring. | Broad ownership is ported and stable. Work count, active slug, full-canvas entry, route classes, and page-level state pass repeated source-vs-rebuild captures. | Close as source-shaped. Keep as regression gate only. | None unless a route-state mismatch appears during Phase 2 page work. |
| F2 | `T1/w1/E1` thumb target and strip | Source renders a square thumb scene target, composites it through `_1/v1`, and assigns the composite target as the home `SpotLight.map`. | Target sizing, visible thumb count, composite uniforms, texture color-space fix, map assignment, and active-block projection coverage are attributed. | Close as source-shaped for Phase 1. Do not tune thumb darkness, saturation, target size, map assignment, or spotlight intensity. | Only revisit if Phase 2 interaction QA shows thumb strip motion or transition timing mismatch. |
| F3 | `GA/VA` ordinary work blocks | Source `VA` replaces the standard material shaders with bundled `HA/zA` and relies on the source Three r164 light chunks and spotlight-map semantics. | Rebuild now runs Three r164, but still uses a stable shader bridge with source-aligned material flags, alpha tail, diffuse defaults, selected chunk cleanup, and diagnostics. Full `HA/zA` replacement was previously rejected before the runtime version was aligned. | Keep open for visual/source review. Re-audit generated shader deltas under r164 before retrying any broader `HA/zA` replacement. | Dedicated shader-port research should start from generated shader section diffs under r164 rather than wholesale replacement. |
| F4 | `Se` visual state setter / project payloads | Source state setter pushes per-work visual values into block materials, thumb uniforms, darkness colors, active project ownership, and route transitions. | Rebuild payload extraction and visual state propagation are stable for home and project markers; source constants are preserved where attributed. | Close as source-shaped. Keep marker and active-slug checks in final QA. | Phase 2 may need deeper transition timing parity, not new state ownership. |
| F5 | `Ka/GA` mouse and local fluid simulation | Source uses a screen mouse simulation and per-work local simulations with source-shaped UV offsets, persistence, thickness, and ping-pong targets. | Rebuild target sizes, active local UV, `uCoords`, offset/scale, and static contribution are source-shaped. At-rest brightness is not blocked by mouse simulation. | Close structurally. Do not tune brightness through mouse/fluid parameters. | Interactive feel QA remains useful after Phase 1, especially pointer velocity, inertia, and local wake/fade timing. |
| F6 | `A1/C1` pre-composite formula | Source mixes work, media, noise, contrast, background, and reveal values through the main pre-composite path. | Home `A1` execution flow is semantically equivalent after excluding inert or relocated computations. Project detail pages use a stable direct media path after source-like offscreen routing regressed luma. | Close home `A1` flow only where source flow is proven. Keep current project media routing as a documented stability bridge, not a 1:1 closeout. | Revisit project offscreen media routing only after transfer/color ownership is solved in a dedicated batch. |
| F7 | `OA/kA/Lu` final composite / transfer | Source uses the current darken/lighten formulas, `uDarken=.2`, black constant `0.095`, bloom/luminosity chain, target defaults, and `srgb` renderer output. | Rebuild matches confirmed formulas and pass ownership. Gamma-like `debug-composite-transfer=1` brightens the result but has no source proof. | Open Phase 1 issue. Do not promote unsupported transfer changes, and do not mark lower brightness accepted by visual review. | Highest-value rendering research: identify exact source/local Three color-transfer mismatch without changing constants. |
| F8 | Spotlight-map transfer / multiplication | Source spotlight map is the thumb composite texture and local/source Three chunks both multiply direct light by sampled `spotColor.rgb`. | Projection is centered and in-map; target is non-empty. Gamma-like spotlight-map debug brightens partially but is not source-backed. | Open Phase 1 issue. Keep diagnostic switches only. | Pair with F7 in any future color-transfer investigation. |
| F9 | Floor / environment / about auxiliary visuals | Source includes reflector, environment shader, character/about scene, and floating auxiliary blocks. | Rebuild has source-shaped bridges and stable route QA, but not byte-for-byte source ports. Prior probes show these are not the main home brightness lever. | Open until source-backed parity or a documented technical bridge exists. | Later work should compare about interaction, character spotlight projection, and reflector/environment motion if those pages become active targets. |
| F10 | Project detail composite / media stability | Source project pages share composite/media concepts and use offscreen media ownership. | Current pages are closer visually and stable in repeated browser QA; previous source-like media routing regressed project brightness. | Treat project pages as regression gates during Phase 1 closeout. Do not change them to chase home brightness. | Phase 2 can improve project media 1:1 once home transfer risk is isolated. |

Closeout read:

- Must-fix before Phase 1 completion: no new safe runtime change is currently source-proven, but the visible `VA`/spotlight/composite gap remains open.
- Agent-accepted Phase 1 deviations: none. Stable `VA` bridges, final brightness/transfer gaps, current direct project-media routing, or floor/environment/about bridge depth remain open unless they are fixed from bundle evidence or documented as unavoidable technical bridges.
- Explicitly rejected for Phase 1 production: `debug-composite-transfer=1`, `debug-spotlight-map-transfer=srgb`, `debug-spotlight-map=off`, broad full-`HA/zA` replacement, broad source work-composite pass rewiring, and source offscreen project-media routing.
- Required next batch: continue source-backed transfer/shader evidence; use source-vs-rebuild visual QA only to locate mismatches and verify regressions.

### Detailed Difference Audit: Spotlight / Thumb / Output Chain

This is the current source-driven audit board for the remaining Phase 1 visual gap. It is intentionally narrower than "make the whole home brighter": S1-23 proved the home `SpotLight.map` is assigned and materially contributing, so the remaining work should identify why the source thumb-map projection is interpreted much darker in the rebuild.

| ID | Area | Source evidence | Rebuild observation | Likely impact | Decision / next action |
| --- | --- | --- | --- | --- | --- |
| D1 | Thumb composite shader `_1` / `v1` | Source `_1` is `toneMapped:false`, transparent, no depth, and samples `tScene`, then `blendMultiply(..., uDarkenColor, uDarkenIntensity)`, then `saturation`, then alpha `1`. | Rebuild `thumbCompositeFragment` matches the broad operations and uses `toneMapped:false`. Uniform names differ only locally. | Low as a direct bug, but high as an input to the spotlight map. | Do not tune darkness constants yet. Add render-target pixel diagnostics before changing shader math. |
| D2 | Thumb scene `T1` target sizing | Source `T1.resize(e,t,n)` renders the thumb scene to a square `t x t` target with pixel ratio forced to `1`. | Rebuild resizes `thumbTarget` / `thumbCompositeTarget` to a square based on viewport height and target budget. | Medium. Small size differences can alter map softness but should not explain a 5x luma gap alone. | Verify exact target size at runtime in diagnostics; only align if measured mismatch is source-proven. |
| D3 | Thumb background color | Source `T1` sets scene background `new Color("#222222").convertLinearToSRGB()`. | Rebuild uses a thumb clear/background path, but the exact color-space treatment should be measured from the target, not inferred. | Medium-high. The map-on run is much darker than map-off, so a dark background or wrong transfer curve can dominate projection. | Capture mean/min/max of `thumbTarget` and `thumbCompositeTarget` on the active project. |
| D4 | Thumb strip material `S1` | Source `E1/M1/S1` uses cover texture, transition-to-UV fallback, plane scale `(2,2,2)`, and visibility outside `[-1.5, 1.5]`. | Rebuild broadly follows these rules. Active thumb payload mapping from Astro to `payloadFromElement()` is correct for `data-thumb-darkness`, `data-darkness-color`, and `data-thumb-saturation`. | Medium. If active thumb progress differs, the spotlight map could be mostly fallback/background. | Add diagnostic fields for active slug, thumb progress, visible thumb count, and composite uniforms. |
| D5 | Spotlight map assignment | Source `SD.init()` assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`. | Rebuild assigns `thumbCompositeTarget.texture`; S1-23 map-on/off test shows the map is strong and darkening. S1-49 projection probe confirms the same target has healthy sampled luma at the active block projection points. | High, but not missing. | Keep assignment. Do not disable map as a fix; remaining issue is transfer/light interpretation or a documented technical bridge. |
| D6 | Spotlight position/intensity/parallax | Source `p1.setLights()` uses intensity `220`; update only parallax-adjusts `x/y`, target remains source-shaped. | Rebuild follows position, target, intensity, angle/penumbra ownership, and parallax. S1-49 shows active block center projects to thumb UV `0.5,0.5`, and left/right/top/bottom samples all remain in-map. | Low-medium. Projection framing is no longer a strong suspect for the main brightness gap. | Leave constants unchanged. Do not tune spotlight framing unless a future visual QA finds a specific non-brightness mismatch. |
| D7 | `VA/zA` light body | Source `VA.onBeforeCompile` fully replaces vertex and fragment shader with bundled `HA/zA`, relying on source Three light chunks and `SpotLight.map` semantics. | Rebuild uses a stable Three shader bridge. Full `HA`/`zA`, fragment-tail, old physical-response, vertex world-position, and early-UV attribution paths were either unsafe or low-impact. | Medium source mismatch, low as next edit target unless a safe port path is found. | Do not attempt another broad `HA/zA` port without source-backed WebGL-safe boundaries. Keep open as a documented bridge unless a concrete defect has a source-safe fix. |
| D8 | Render target color space | Source `Lu/Lo` create default `WebGLRenderTarget` clones; screen/composite materials are often `toneMapped:false`; selected colors call `.convertLinearToSRGB()`. | Rebuild render-target defaults and renderer output are source-shaped; ordinary loaded texture color-space fix was promoted in S1-40. Renderer output linear debug was low-impact. | Medium as transfer contributor, low as renderer-level fix. | Do not broadly change renderer output or render-target metadata. Keep texture color-space fix and diagnostic switches. |
| D9 | Main composite `kA/OA` | Source work render manager enables mousesim, luminosity, bloom with `strength:.15`, `radius:1.5`, and composite darken/saturation uniforms. S1-46B confirms source `A1` and rebuild `homePreCompositeFragment` have matching main flow order after excluding inert source computations and a relocated `tNoise` sample declaration. | Rebuild has source-shaped A1/OA split and bloom/luminosity, but home luma remains lower and project pages are darker too. Gamma-like transfer debug improves luma but lacks source proof. | High source mismatch, high risk as live edit. | Do not promote `debug-composite-transfer=1` or broad pass rewiring. Keep open unless new source evidence appears. |
| D10 | Mouse simulation `Ka` | Source `Ka` lerps target UV, ping-pongs a sim target, applies persistence as `pow(persistance, dt*10)`, and per-`GA` raycasts against source-scaled planes. | Rebuild has a Ka-style simulation and per-item targets. S1-50 verifies screen sim `144x90`, active local sim `46x30`, source-equivalent plane/ray sizes, centered active UV, and negligible static composite-darken mouse contribution. | Low-medium. Affects motion/fluid feel more than static dark luma. | Keep probe. Do not tune brightness through mouse sim. Revisit only with pointer interaction QA if motion feel visibly differs. |

Immediate next batch recommendation: keep Phase 1 open and continue only from source-backed evidence for the remaining brightness/transfer/projection gaps. Do not continue broad thumb, spotlight, `VA`, `A1`, or mouse-simulation tuning without a concrete bundle-backed mismatch.

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

Conclusion: Phase 1 is roughly two thirds visually complete but much further along architecturally. The blocker is not missing page coverage; it is unresolved rendering semantics in `VA`/spotlight/light output and, secondarily, shared composite/media color output. Phase 2 should wait until the `VA` chain is either source-ported or documented as an unavoidable technical bridge with bundle evidence.

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
- Ten differences is reasonable only when they are in one chain and mostly non-runtime, such as shader report fields, probe outputs, comments, source extraction helpers, or documented technical bridges.
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
- The remaining Phase 1 closeout should focus on source-backed `OA/CA` transfer evidence or a documented unavoidable technical bridge for the map-transfer/composite brightness gap, while keeping project pages as regression gates.

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
- Phase 1 still needs source-backed `OA/CA` / project-composite transfer evidence, or a documented unavoidable technical bridge for any remaining brightness gaps.
- Phase 2 remains blocked until that final decision is recorded.

Verification passed:

- `CHROME_PATH=/usr/bin/google-chrome REBUILD_URL=http://127.0.0.1:5240 ORIGINAL_URL=http://127.0.0.1:5241 OUT_DIR=/tmp/rogier-compare-phase1-s151-closeout CDP_PORT=9308 CAPTURE_WAIT=5200 node scripts/capture.mjs`

### S1-52 Transfer / Project Composite Historical Accepted-Deviation Audit

This historical batch recorded a Phase 1 closeout decision that is now superseded by the current source-parity standard. It does not change runtime behavior, and its accepted-deviation language must not be used as the active Phase 1 closeout rule.

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

Superseded accepted-deviation candidate:

- Keep the stable production path for Phase 1: source-shaped constants, stable Three 0.184 `VA` bridge, source-default ordinary texture color space, current direct project media path, and diagnostic-only transfer switches.
- Historical note only: the prior closeout proposed accepting that home/project brightness remains lower than source in the current bridge, with the reason documented as unresolved transfer/color interpretation across spotlight-map multiplication and `OA/CA` final composite.
- Current rule: keep Phase 1 open for source-backed fixes or documented unavoidable technical bridges; do not unblock Phase 2 by visually accepting unresolved source mismatches.

Historical final closeout requirement, superseded:

- The prior requirement was one final full QA pass after this accepted-deviation record, including home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.
- Current rule: full QA verifies source-backed changes and regressions only; it does not close known source mismatches.

### S1-53 Historical Phase 1 Final Closeout Result

This historical closeout is superseded. Phase 1 is not complete under the current 1:1 source-rebuild target. This batch did not change runtime rendering behavior; it verified the stable production path after S1-52 and updated the old closeout status.

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
| About page | Runtime loads and character spotlight target exists, but source character spotlight projection/interaction is not proven 1:1. | Temporary implementation bridge, not an accepted Phase 1 deviation. | Compare source `characterScene.renderManager` and `rotatableMesh` behavior if this remains inside the Phase 1 WebGL parity boundary. |

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
| P1-07 | Character scene | About spotlight map now comes from a rendered GLTF character target instead of only a flat `model_T.jpg` texture composite. The target uses the existing `public/models/me/me.gltf`, dedicated camera/lights, automatic framing, and fallback plane if GLTF loading fails. | Real visual QA should compare about spotlight projection to identify differences; remaining source `characterScene.renderManager` and `rotatableMesh` event behavior must be ported or documented as out of Phase 1 scope/technical bridge. |
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
| R1-05 | Visual tuning after source fixes | Screenshot tuning before source checklist completion can hide real source differences. Visual QA should find and verify differences, not drive production implementation. |

## Recommended Execution Strategy

Do not do Phase 1 in one large unverified pass. The remaining work is highly coupled and shader/render-target failures can pass build while breaking runtime or visual parity.

Recommended cadence:

- Low-risk ownership/constants/state changes: 8-10 source-proven differences per batch.
- Medium-risk shader changes: 5-8 differences per batch.
- High-risk render order, render target, or material replacement changes: 3-5 differences per batch.
- Per-block `Ka` simulation or full `VA` replacement: isolate into a dedicated batch with browser smoke and visual inspection.

Current recommendation: do not attempt the rest of Phase 1 in one unverified pass. The next batch should be a focused 5-8 point audit/implementation pass around one rendering chain, preferably `VA`/spotlight lighting first because it remains one of the largest source-structure gaps. If the changes stay in constants/ownership/documentation, 8-10 points is acceptable; if shader code changes, keep it closer to 5.

## Next Batches

### Current GA/VA Texture And Spread Alignment

Source evidence from `bundle.250f01b7.js`:

- `HA` uses `float spread = 3.;` in the work-block vertex displacement tail.
- `VA.customUniforms.tPerlin` initializes from `Xt.perlin1`.
- `Xt.preloadTextures()` loads `perlin1` from `/images/textures/perlin-1.${webpOrJpg}` with `wrapS/wrapT = vo` (`MirroredRepeatWrapping=1002` in the bundled Three constants), while `perlin2` uses `ci` (`RepeatWrapping=1000`).

Rebuild status:

- Ordinary and auxiliary work-block materials now use a separate `workPerlinTexture` loaded from `/images/textures/perlin-1.webp` with `MirroredRepeatWrapping`.
- The A1/C1 pre-composite material keeps `perlinTexture` loaded from `/images/textures/perlin-2.webp` with `RepeatWrapping`.
- Work-block spread is restored from the rebuild-only `5.0` to source `3.0`.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Full capture at `/tmp/rogier-phase1-ga-va-perlin` passed with no network failures or runtime exceptions across home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/`.

Decision: keep this as a source-correct `GA/VA/Xt` fix. It should make gallery collapse/spread and perlin displacement closer to source without changing project media or shared composite behavior. The remaining home transition/cube-depth mismatch still requires source-backed `HA/zA` shader parity evidence or a documented technical bridge.

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
4. Decide whether full character scene work is required for Phase 1 or should be moved out of Phase 1 scope as a documented non-home bridge.

## Phase 1 Completion Criteria

Phase 1 should be considered complete only when:

- `p1`, `GA`, `VA`, `T1/w1/E1`, `A1/C1`, `OA/kA/Lu`, `Ka`, and `Se` each have source-aligned implementation, or the remaining mismatch is documented as an unavoidable technical bridge with bundle evidence and runtime QA.
- Build and `git diff --check` pass.
- Dist markers remain stable.
- Browser smoke passes home, about, and at least two project pages. Current local Chrome/SwiftShader smoke passes this gate.
- Project media pages retain desktop WebGL tracks and mobile media fallback.
- A final source-vs-rebuild visual QA pass is used only to verify that the source-backed implementation has not regressed home WebGL, thumb projection, mouse interaction, about visual, or project media pages. Current forced-entry source screenshots are not sufficient evidence to close a source mismatch.

### S1-10 Main `Lu/lA/aA` Composite Pass Result

This batch corrected a source-level render-manager structure gap without treating it as a brightness tuning pass.

Source facts:

- Source `kA` extends `Lu` and replaces the work-scene composite material with `OA/CA`; that path renders the work scene to `renderTargetComposite`.
- Source main scene uses default `Lu` with `lA/aA`, `renderToScreen=true`, `bloom/luminosity/fxaa=false`, and `fluid.enabled=true`.
- Source default `aA` samples `tScene`, offsets UVs with `fluid.rg * -0.15`, applies a small RGB shift, conditionally adds bloom, adds `length(fluid.xy) * .015`, and outputs opaque color.

Rebuild changes:

- Added a separate `mainCompositeFragment` and `mainCompositeMaterial` matching the source default `lA/aA` role.
- Routed `A1/C1` output through `compositeTarget -> mainCompositeMaterial.tScene -> screen`.
- Fed the existing source-shaped main fluid texture into the final pass and kept main bloom/luminosity/fxaa flags at their source-disabled defaults.
- Kept work-scene `OA/CA` ownership unchanged so darken/saturation remains scoped to the work render-manager.
- Preserved project-page media routing and used full capture as the regression gate.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe at `/tmp/rd-main-composite-probe` passed with no console/runtime errors.
- Home capture and band analysis at `/tmp/rd-main-composite-home` passed. Static luma stayed effectively unchanged because source main bloom is disabled and fluid is almost zero at rest.
- Full capture at `/tmp/rd-main-composite-full` passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions.

Decision: keep this source-structure fix. Phase 1 remains open; the visible hard horizon/fog-bed and transfer/color gaps are not solved by the default main composite pass.

### S1-11 Shader Dump / Setter Color Audit

This batch expanded Phase 1 attribution without promoting unsupported visual tuning.

Source-checked non-fixes:

- Source `Se.formatColor()` parses project colors as raw RGB channels through `sr()`. The rebuild's `sourceRgbColor()` path for `setMainColor`, `setAmbientLight`, `setBlocksColor`, `setThumbDarknessColor`, and `setMediaBackground` matches that ownership shape.
- Source `C1.uBgColor` is the special case initialized with `new Color("#1F1F1F").convertLinearToSRGB()`. The rebuild still uses `sourceLinearToSrgbColor(SOURCE_COMPOSITE_BG)` for `A1/C1` pre-composite background.
- Source environment `uDarkenColor` follows the raw project/secondary color path, not the `C1.uBgColor` linear-to-sRGB path. The rebuild's environment setter remains on raw RGB.

Tooling/runtime changes:

- Extended the browser shader dump hook from only `VA` to a generic `window.__rogierShaderDump` covering `VA-work`, `VA-auxiliary`, `A1-pre-composite`, `OA-work-composite`, `Lu-main-composite`, `x1-thumb-composite`, `j1-media-composite`, and `u1-environment`.
- Updated `scripts/dump-va-shader.mjs` to extract compressed source shader constants with a generic next-backtick parser and to write `shader-dump-summary.json` with include, uniform, length, and key-token residuals.
- The new dump path is query-gated behind `dump-va-shader=1`; production rendering is unchanged.

Evidence from `/tmp/rogier-phase1-shader-dump-s61b`:

| Shader | Current read |
| --- | --- |
| `A1/C1` pre-composite | Fragment body is close; residual `tScene` is source-only and currently structural/inert in the visible path. |
| `Lu/lA` main composite | Rebuild still exposes extra disabled render-manager uniforms, but source defaults keep bloom/luminosity/fxaa off and main fluid nearly static at rest. |
| `OA/kA` work composite | Source includes `tonemapping_pars_fragment` / `tonemapping_fragment`; rebuild omits those while carrying debug-only uniforms. This is a real transfer/color-space audit target, but not proof for a gamma or brightness constant patch. |
| `u1/l1` environment | Rebuild has the active visible formula bridge, but source still declares shader/noise uniform surface (`uMultiplier`, `uShader*`, `uTime`) not present locally. Earlier source audit showed those are not visibly used in the active path; keep open as bridge-depth, not a tuning license. |
| `VA/HA/zA` | Source vertex and fragment-tail paths are active; residuals are mostly Three r164 chunk bridge differences and renamed modern specular/anisotropy uniforms. |

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rogier-phase1-shader-dump-s61b`.
- Output probe passed with no failures or exceptions: `/tmp/rogier-phase1-shaderdump-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rogier-phase1-shaderdump-full`.

Decision: keep the dump tooling and color-setter non-fix record. Phase 1 remains open; the next production change should target source-backed `OA` tonemapping/transfer interpretation or a complete render-target color-space proof, not local brightness constants.

### S1-12 `OA` / Thumb Composite Tonemapping Surface

This batch promoted a narrow source shader-surface difference found by S1-11.

Source evidence:

- Source `CA` (`OA/kA` work composite fragment) declares `#include <tonemapping_pars_fragment>` and ends with `#include <tonemapping_fragment>`.
- Source `v1` (`x1` thumb composite fragment) has the same tonemapping include pair.
- Both source materials set `toneMapped:false`, so Three r164 should not define `TONE_MAPPING`; the included `tonemapping_fragment` is therefore a source-surface no-op in the normal production path.
- Source `A1/C1` pre-composite does not include tonemapping and was left unchanged.

Runtime changes:

- Added the source tonemapping include pair to the rebuild `homeCompositeFragment` used by the work `OA/kA` composite.
- Added the same include pair to `thumbCompositeFragment`.
- Kept all material flags, renderer output color space, darken constants, and debug transfer paths unchanged.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rogier-phase1-oa-tonemap-shader`.
- The dump now reports no `fragmentIncludesOnlySource` residual for `OA-work-composite` or `x1-thumb-composite`.
- Output probe passed with no failures or exceptions: `/tmp/rogier-phase1-oa-tonemap-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rogier-phase1-oa-tonemap-full`.

Decision: keep this source-surface alignment. It does not close the Phase 1 transfer/color gap because `toneMapped:false` makes the fragment include inert unless source render state proves otherwise. The next batch should continue with render-target/output-color interpretation or exact source-vs-rebuild target content, not constants.

### S1-13 Remove Unused Pre-Composite Bloom Branch

This batch reduced a rebuild-only render-manager artifact without changing the active production path.

Source evidence:

- Source `Lu.update()` owns one render-manager bloom chain per render manager: primary target, optional luminosity bright target, five blur mip pairs, bloom composite, then the active composite material.
- Source main `I1/C1/A1` render manager has bloom/luminosity disabled by default, and the work `kA/OA` render manager owns the active work-scene bloom.
- There is no separate `preBloom*` branch between `OA/kA` work composite and `A1/C1` pre-composite in the source graph.

Runtime changes:

- Removed the unused rebuild-only `preBloomBrightTarget`, `preBloomTarget`, pre-bloom mip targets, materials, scenes, resize/dispose code, output-probe fields, and dead `renderPreCompositeBloomPass()` method.
- Kept active work bloom (`kA/OA`) and source-default main bloom placeholders (`I1/Lu`, disabled) intact.
- Did not change render order, clear behavior, shader constants, or visual tuning values.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe passed with no failures or exceptions and no longer reports `preBloom*` targets: `/tmp/rogier-phase1-remove-prebloom-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rogier-phase1-remove-prebloom-full`.

Decision: keep this source-structure cleanup. Phase 1 remains open; removing the dead pre-bloom branch reduces non-source graph noise but does not solve the hard horizon/fog-bed or transfer/color gap.

### S1-14 `I1/C1` Render-Manager Surface

This batch aligned narrow source render-manager surface details without enabling new visual effects or changing brightness constants.

Source evidence:

- Source `I1.initSettings()` defines a default-disabled `lensflare` settings object with `scale=(1.5,1.5)`, `exposure=1`, `clamp=1`, and `enabled=false`.
- Source `I1.initRenderer()` always creates `renderTargetLensflare`, resizes it at full render resolution, and writes `C1.tLensflare = renderTargetLensflare.texture` in `I1.update()`, even when the lensflare pass is disabled.
- Source `C1` declares `tScene`, `tPortal`, and `tLensflare` uniforms; `A1` actively declares `tScene` and `tLensflare`, while `tPortal` is a source material-surface uniform.
- Source `I1.resize()` uses `floorPowerOfTwo(renderSize) / 2` for main bloom/luminosity mip ownership; source `Lu/kA` uses `/4`.

Runtime changes:

- Added the source default-disabled main lensflare settings object and a full-resolution `mainLensflareTarget`.
- Routed `preCompositeMaterial.uniforms.tLensflare` to `mainLensflareTarget.texture` each frame, matching source `I1.update()` ownership while keeping the pass disabled.
- Added source-surface `tScene` and `tPortal` uniforms to the `A1/C1` pre-composite material.
- Changed the shared bloom composite factory to accept explicit settings, so source default-disabled main bloom uses `SOURCE_MAIN_RENDER_SETTINGS` factors instead of work `kA/OA` factors if enabled later.
- Changed main bloom/luminosity target sizing to the source `I1` half-POT path; work bloom remains on source `Lu/kA` quarter-POT sizing.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Output probe passed with no failures or exceptions and confirmed `lensflareEnabled=false` with a full-resolution lensflare target: `/tmp/rogier-phase1-i1-surface-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rogier-phase1-i1-surface-full`.

Decision: keep this source-surface alignment. It reduces remaining `I1/C1` graph drift and records the lensflare path as source-default disabled, but Phase 1 remains open because the hard horizon/fog-bed and render-target color interpretation gaps are still visible.

### S1-15 `VA/A1` Shader Surface Cleanup

This batch removed source-attribution noise from production shader paths and closed a narrow `A1/C1` shader-surface residual.

Source evidence:

- Source `HA` uses `vec4 mouseSim = texture2D(tMouseSim, mouseUv)` and later applies `transformed /= 1. - mouseSim.r * .2` before computing the instanced world position.
- Source `VA.onBeforeCompile` directly assigns source `HA/zA`; it has no runtime URL-driven fallback for vertex UV mode, world-position mode, output-tail mode, physical-lighting response, or spotlight-map transfer.
- Source `A1` declares `uniform sampler2D tScene;`; the rebuild had the material uniform but not the shader declaration.

Runtime/tooling changes:

- Changed the work-block vertex bridge to keep the source-shaped `mouseSim` vec4 and source world-position expression instead of the previous `vMouseSim` helper expression.
- Removed production `debug-va-*` and `debug-spotlight-map-transfer` branches from the work-block shader patch path.
- Removed dead helper chunks that existed only for those now-removed debug branches.
- Added the missing `A1/C1` `tScene` shader declaration so shader dump no longer reports it as source-only.
- Removed obsolete spotlight-transfer and VA-output-tail comparison scripts, and removed those stale variants from the broader brightness attribution script.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rogier-phase1-va-surface-shader-3`.
- The dump now reports no `A1-pre-composite.fragmentUniformsOnlySource`, and confirms the work vertex contains the source `transformed /= 1. - mouseSim.r * .2` expression.
- Output probe passed with no failures or exceptions: `/tmp/rogier-phase1-va-surface-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rogier-phase1-va-surface-full`.

Decision: keep this cleanup. It does not close Phase 1 visually, but it removes non-source shader toggles from the production path and narrows the remaining audit to real render-target, environment, and generated Three chunk differences.

### S1-16 `V1/H1/z1` and `h1/u1/l1` Shader Surface

This batch aligned narrow sky/environment shader-surface residuals in one source-backed group without changing visible constants or adding subjective brightness tuning.

Source evidence:

- Source `z1/B1` declares the full sky composite shader surface: `tScene`, `uTime`, `uShader1Speed`, `uShader1Alpha`, `uShader1Scale`, `uShader2Speed`, `uShader2Scale`, `uShader1Mix3`, `uShader3Scale`, and `uShaderMix`, and ends with `tonemapping_fragment`.
- Source `u1/l1` declares the full environment shader surface: `uTime`, `uMultiplier`, `uDarken`, `uDarkenColor`, `tSky`, `uShader1Alpha`, `uShader1Speed`, `uShader1Scale`, `uShader2Alpha`, `uShader2Scale`, `uShader3Alpha`, `uShader3Speed`, `uShader3Scale`, `uShader1Mix2`, and `uShader1Mix3`.
- Source `h1.update()` writes `uTime`, even though the currently active visible `l1` path does not use it for time-driven environment motion.

Runtime/tooling changes:

- Added the remaining source-declared sky composite uniforms and restored the source sky composite `tonemapping_fragment` tail.
- Added the remaining source-declared environment uniforms to the JS material surface and to the generated fragment shader declaration surface.
- Updated the environment material `uTime` every frame, matching source `h1.update()` ownership without introducing non-source animation.
- Expanded `window.__rogierOutputProbe` to record environment shader-surface values, `tSky` source ownership, and sky composite texture/filter/wrap/uniform metadata.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rd-sky-env-surface3-shader`.
- The dump now reports `u1-environment.fragmentUniformsOnlySource=[]` and `fragmentUniformsOnlyRebuild=[]`; `A1`, `OA`, and thumb-composite surface checks stayed clean.
- Output probe passed with no failures or exceptions and records `environment.tSkySource="composite"` plus the source environment uniform surface: `/tmp/rd-sky-env-surface3-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-sky-env-surface3-full`.

Decision: keep this source-surface alignment. It removes another low-level shader/probe residual from the sky/environment chain, but Phase 1 remains open because the visible hard horizon/fog-bed and transfer/color interpretation gaps are still not source-resolved.

### S1-17 `x1/_1/v1` Thumb Composite Uniform Surface

This batch aligned a narrow thumb-composite shader-surface residual without changing the source formula or visual constants.

Source evidence:

- Source `_1/v1` declares `tScene`, `uDarkenIntensity`, `uDarkenColor`, and `uSaturation`.
- Source `v1` applies `blendMultiply(mixed.rgb, uDarkenColor, uDarkenIntensity)`, then saturation, then `tonemapping_fragment`.
- The rebuild already matched the formula and tonemapping tail, but still used local names `uDarkness` and `uDarknessColor`, which appeared as source/rebuild-only uniform residuals in the shader dump.

Runtime/tooling changes:

- Renamed the thumb composite shader uniforms from `uDarkness/uDarknessColor` to source `uDarkenIntensity/uDarkenColor`.
- Updated the material uniform object, thumb darkness setters, GSAP tween targets, and thumb probe reads to use the source names.
- Kept legacy probe fields `darkness` and `darknessColor` while adding source-named `darkenIntensity` and `darkenColor` fields for easier comparison.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rd-thumb-uniform-shader`.
- The dump now reports `x1-thumb-composite.fragmentUniformsOnlySource=[]` and `fragmentUniformsOnlyRebuild=[]`.
- Output probe passed with no failures or exceptions: `/tmp/rd-thumb-uniform-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-thumb-uniform-full`.

Decision: keep this source-uniform cleanup. It improves shader attribution for the thumb/spotlight chain but does not close Phase 1 visually; the remaining blockers are still render-target/output transfer, generated material body parity, and the visible hard horizon/fog-bed gap.

### S1-18 `$1/j1/W1` Media Composite and `UD/FD` Project Media Surface

This batch aligned a source-backed project media/render-manager surface while keeping project pages as regression gates.

Source evidence:

- Source `$1` media scene uses `j1`, whose composite material `W1/G1` declares `tScene`, `tBloom`, `tBlur`, `tFluid`, `tMouseSim`, `boolBloom`, `boolFluid`, `boolLuminosity`, and `boolFxaa`.
- Source `G1` is a pass-through composite and writes the sampled `mixed` vec4, preserving alpha for `C1/A1` to consume.
- Source `UD/FD/LD` project media planes declare `tMap`, `uMapSize`, `uContainerSize`, `uCameraDistance`, `uRadius`, `uBackgroundColor`, and `uReveal`; they do not have a per-plane `uSceneOpacity`.
- Source project media reveal is owned by `Se.setMediaOpacity()` through `C1.uMediaReveal`, which multiplies `media.a * uMediaReveal` in the main pre-composite.

Runtime/tooling changes:

- Corrected shader-dump source mapping so `j1-media-composite` compares against source `G1`, and added a separate `UD-project-media` source mapping for source `LD`.
- Added the source `W1/G1` uniform surface to the rebuild media composite material.
- Kept media composite output as a pass-through `vec4 color`, matching source alpha behavior instead of forcing alpha to `1.0`.
- Removed rebuild-only `uSceneOpacity` from project media shader/material updates, leaving reveal opacity to `C1.uMediaReveal`.
- Added `scripts/probe-project-media.mjs` to check real project routes for desktop media nodes, canvas presence, media target output, media reveal state, and WebGL/runtime errors.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rd-media-surface-shader`.
- The dump now reports `j1-media-composite.fragmentUniformsOnlySource=[]` and `fragmentUniformsOnlyRebuild=[]`.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-media-surface-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-media-surface-full`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`: both keep `mediaCount=5`, `visibleMediaCount=5`, `uMediaReveal=1`, non-zero `mediaRaw/media` output, and no shader/runtime errors: `/tmp/rd-project-media-probe`.

Decision: keep this source-surface alignment. It reduces project-media regression risk and removes a non-source opacity path, but it does not close Phase 1; the remaining home blockers are still the hard horizon/fog-bed, generated `VA` residuals, and render-target/output color interpretation.

### S1-19 `I1/Lu/aA` Main Render-Manager Settings and Shader Mapping

This batch kept the focus on source-owned render-manager structure without changing visual constants.

Source evidence:

- Source `I1.initSettings()` owns main render-manager settings separately from source `kA`: `blur.enabled=false`, `fxaa.enabled=false`, `bloom.enabled=false`, `luminosity.enabled=false`, `mousesim.enabled=false`, and high-tier `fluid.enabled=true`.
- Source `I1.update()` selects the main composite `tScene` from its own blur state, not from work `kA` settings.
- Source `aA` main composite bloom branch samples `tBloom` through `rgbshift(tBloom, uv, -1.5, .02)`, then adds the angle/distortion shifted sample. The rebuild main composite previously only added a direct `texture2D(tBloom, uv)` sample.
- The active rebuild `mainCompositeFragment` corresponds to source `lA/aA`. The prior shader-dump label `Lu-main-composite -> m1` compared it against source `Lo/g1/m1`, which is the simple pass-through manager, not the `Lu/lA` default composite.

Runtime/tooling changes:

- Main blur/fxaa target sizing now reads `SOURCE_MAIN_RENDER_SETTINGS` instead of the work-scene `renderSettings`.
- Main screen composite `tScene` and `tBlur` selection now reads `SOURCE_MAIN_RENDER_SETTINGS.blur`.
- Tick-time main blur gating now reads `SOURCE_MAIN_RENDER_SETTINGS.blur`.
- Main composite bloom body now matches source `aA`'s shifted bloom accumulation.
- Shader dump now maps `Lu-main-composite` to source `aA`, reducing that fragment residual from the earlier misleading large mismatch to `fragmentLengthDelta=-17`, with only `tMouseSim` still rebuild-only.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rd-main-settings-shader2`.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-main-settings-probe`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-main-settings-full`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`: both keep `mediaCount=5`, `visibleMediaCount=5`, `uMediaReveal=1`, non-zero `mediaRaw/media` output, and no shader/runtime errors: `/tmp/rd-main-settings-project-media`.

Decision: keep this source-alignment batch. It improves render-manager ownership and fixes a misleading QA comparison, but Phase 1 remains open because the visible home hard horizon/fog-bed and render-target/output color interpretation gaps are still unresolved.

### S1-20 `Lu/lA/aA` Main Composite Shader Surface

This batch finished the narrow shader-surface cleanup left by S1-19.

Source evidence:

- Source `lA/aA` declares `tScene`, `tBloom`, `tBlur`, `tFluid`, `boolBloom`, `boolFluid`, `boolLuminosity`, and `boolFxaa`.
- Source `aA` does not declare or sample `tMouseSim`; mouse simulation remains part of source `OA/CA` work composite and the separate simulation passes, not the default main composite surface.

Runtime/tooling changes:

- Removed the rebuild-only `tMouseSim` declaration from `mainCompositeFragment`.
- Removed the corresponding main composite material uniform.
- Stopped updating `mainCompositeMaterial.uniforms.tMouseSim` during the main screen composite pass.
- Kept `homeCompositeFragment` / `OA-work-composite` mouse simulation intact; that source path still declares and samples `tMouseSim`.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rd-main-composite-surface-shader3`.
- The dump now reports `Lu-main-composite.fragmentUniformsOnlySource=[]` and `Lu-main-composite.fragmentUniformsOnlyRebuild=[]`.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-main-composite-surface-probe2`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`: both keep `mediaCount=5`, `visibleMediaCount=5`, `uMediaReveal=1`, non-zero media target output, and no shader/runtime errors: `/tmp/rd-main-composite-surface-project-media3`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-main-composite-surface-full`.

Decision: keep this source-surface cleanup. It closes the obvious `Lu/aA` uniform residual without changing `OA/CA` behavior, but Phase 1 remains open because the visible hard horizon/fog-bed and render-target/output color interpretation gaps are still unresolved.

### S1-21 `OA/CA` Production Shader Surface and Debug Isolation

This batch aligned the default work-composite shader surface while preserving the composite attribution tooling behind explicit debug query parameters.

Source evidence:

- Source `OA` uniforms are `tScene`, `tBloom`, `tBlur`, `tFluid`, `tMouseSim`, `boolBloom`, `boolFluid`, `boolLuminosity`, `boolFxaa`, `uDarken`, and `uSaturation`.
- Source `CA` declares `float uBloomDistortion = 2.5;` inside the bloom branch; it is not a material uniform.
- Source `CA` has no `uDebugStage`, `uDebugDarkenMode`, `uDebugTransferMode`, or `uDebugLightenMode`; those are rebuild diagnostic controls only.

Runtime/tooling changes:

- Moved `uBloomDistortion` from a rebuild material uniform to the source-style local `float uBloomDistortion = 2.5;`.
- Removed debug uniforms and debug branches from the default production `homeCompositeFragment`.
- Added a derived `homeCompositeDebugFragment` that is used only when a `debug-composite-*` query parameter requests a non-default diagnostic mode.
- Made `createCompositeMaterial()` create the extra debug uniforms only for that debug shader path.
- Made the output probe report missing debug uniforms as default zero values so normal production probing does not require debug uniforms to exist.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rd-oa-prod-surface-shader`.
- The dump now reports `OA-work-composite.fragmentUniformsOnlySource=[]` and `OA-work-composite.fragmentUniformsOnlyRebuild=[]` for the default production shader.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-oa-prod-surface-probe`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks and non-zero media targets: `/tmp/rd-oa-prod-surface-project-media`.
- Composite-stage diagnostics still compile and run through the query-only debug shader with no errors: `/tmp/rd-oa-prod-surface-composite-stages`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-oa-prod-surface-full`.

Decision: keep this source-surface correction. It removes production shader pollution from diagnostic fields without losing the attribution tools, but Phase 1 remains open because the visible hard horizon/fog-bed and target/output color interpretation gaps are still unresolved.

### S1-22 Shared `Ur` Saturation Helper Weights

This batch aligned a small shared helper semantic across the source-owned composite shaders.

Source evidence:

- Source helper `Ur` implements `saturation(rgb, adjustment)` with luminance weights `vec3(0.2125, 0.7154, 0.0721)`.
- Source `C1/A1`, `CA/OA`, and `v1/x1` all include `Ur` and call `saturation()`.
- Source `aA/Lu` includes `Ur` but does not call saturation in the active main composite body, so no main composite runtime change was needed.

Runtime/tooling changes:

- Updated the work composite saturation helper to use source `Ur` weights.
- Updated the pre-composite saturation helper to use source `Ur` weights.
- Updated the thumb composite saturation helper to use source `Ur` weights.
- Left `rgbshift` unchanged because the rebuild already samples alpha from the center texel, matching source `Qa`'s `g.a` behavior.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rd-saturation-helper-shader`.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-saturation-helper-probe`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks and non-zero media targets: `/tmp/rd-saturation-helper-project-media`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-saturation-helper-full`.

Decision: keep this helper alignment. It is source-correct and low risk, but it is a small color-semantic correction rather than a Phase 1 visual closeout; the hard horizon/fog-bed and target/output interpretation gaps remain open.

### S1-23 `Lu/kA/I1` Bloom Composite Target Reuse

This batch aligned a render-manager target ownership detail in source `Lu.update()`.

Source evidence:

- Source `Lu.initRenderer()` creates `renderTargetsHorizontal[]` and `renderTargetsVertical[]`, then `Lu.update()` writes the bloom composite back into `renderTargetsHorizontal[0]`.
- Source then assigns `compositeMaterial.uniforms.tBloom.value = renderTargetsHorizontal[0].texture`.
- There is no separate persistent `bloomTarget` or `mainBloomTarget` output target in source `Lu`; `renderTargetComposite` is reserved for the final composite material output.

Runtime/tooling changes:

- Removed the rebuild-only standalone work `bloomTarget`.
- Removed the rebuild-only standalone main `mainBloomTarget`.
- Changed the shared bloom chain to render the bloom composite into `horizontalTargets[0]`, matching source `Lu.update()`.
- Routed work `OA/CA.tBloom`, main `lA/aA.tBloom`, and `C1/A1.tBloom` through the source-style first horizontal mip target.
- Updated output probe `targets.bloom` and `targets.mainBloom` to report the source-style reused horizontal target.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Shader dump passed with no shader/runtime console errors: `/tmp/rd-bloom-reuse-shader`.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-bloom-reuse-probe`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks and non-zero media targets: `/tmp/rd-bloom-reuse-project-media`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-bloom-reuse-full`.

Decision: keep this source render-manager structure change. It removes two non-source bloom output targets and makes the active `tBloom` ownership closer to `Lu.update()`, but Phase 1 remains open because the visible hard horizon/fog-bed and exact target/output interpretation gaps are still unresolved.

### S1-24 `I1/Lu` Main Fluid GPU-Tier Gate

This batch aligned the source main render-manager fluid gate without changing work-scene `kA/OA` mouse simulation.

Source evidence:

- Source `I1.initSettings()` sets `fluid.enabled = Le.GPU_TIER >= 3`.
- Source `Le.GPU_TIER` defaults to `3` and `Qe.gpuCheck()` later updates it from the GPU benchmark, with `Le.LOW_RES = Le.GPU_TIER < 3`.
- Work `kA` remains separate: its `fluid.enabled` is `false`, while its `mousesim.enabled` remains `true`.

Runtime/tooling changes:

- Restored the static `SOURCE_MAIN_RENDER_SETTINGS.fluid.enabled` template to the source default disabled value.
- Added a local `sourceGpuTier()` bridge and made `sourceLowRes()` derive from that same tier gate.
- Added instance-level `sourceMainRenderSettings`, enabling main fluid only when the local bridge resolves to tier 3.
- Routed main composite creation, main bloom composite setup, resize gates, tick booleans, main fluid update, and output probe reporting through the instance settings.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-main-fluid-gate-probe`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-main-fluid-gate-project-media`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-main-fluid-gate-full`.

Decision: keep this source setting-ownership correction. On the current QA machine the local tier bridge resolves to `3`, so this does not close the remaining visible hard-horizon/fog-bed gap; it prevents the main fluid path from being unconditionally enabled on lower-tier devices and keeps main render-manager state closer to source `I1`.

### S1-25 `GA/VA` Base Diffuse Color Parsing

This batch aligned a source-confirmed `GA.createCube()` material construction detail without changing project visual-state setters.

Source evidence:

- Source `GA.createCube()` constructs the ordinary work material as `new VA({ color: new Color("#808080") })`.
- In Three r164/current Three, `new Color("#808080")` stores linear channels around `0.21586`, not raw `128 / 255`.
- Source `VA` then owns the standard-material diffuse path separately from project block/emissive colors that are set by `Se` and project payload data.

Runtime/tooling changes:

- Changed ordinary work block diffuse construction from the rebuild's raw RGB parser to the normal Three `Color` path for `#808080`.
- Left `payload.blocks`, `Se`-owned project colors, and media/background setter colors on their existing source-owned raw RGB paths.
- Added `settings.work.activeMaterial` to the output probe so future diagnostics can verify active work material diffuse, emissive, env map intensity, roughness, and metalness.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors and reports active work diffuse as `[0.21586050010324417, 0.21586050010324417, 0.21586050010324417]`: `/tmp/rd-work-diffuse-probe`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-work-diffuse-project-media`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-work-diffuse-full`.

Decision: keep this source material-color correction. It reduces a clear `GA/VA` diffuse mismatch and lowers work-target brightness in the expected source-backed direction, but Phase 1 remains open because the hard horizon/fog-bed, exact `VA` shader bridge, and final target/output interpretation gaps are not fully closed.

### S1-26 `I1/ag` Main Fluid Resize Ownership

This batch fixed a source-backed main render-manager fluid target sizing bug found by the output probe after S1-24.

Source evidence:

- Source `I1.resize()` computes render-pixel dimensions, then uses half power-of-two bloom dimensions and calls `fluidSimulation.onResize(e / 3, t / 3)`.
- Source `I1.initSettings()` enables main fluid on GPU tier 3, so when the local tier bridge resolves to `3`, the main fluid FBOs should be real offscreen targets, not placeholder-sized `1x1` textures.
- Work `kA/OA` fluid remains disabled; this fix applies only to the main `I1/C1` fluid path.

Runtime change:

- `resizeMainFluidPass()` now treats the dimensions passed by the source-shaped `I1.resize()` bridge as the final fluid target size, instead of multiplying them by `.005` a second time.
- Main fluid `fboSize`, `cellScale`, and all main fluid render targets now share the rounded source-derived dimensions.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-fluid-resize-probe`.
- The output probe now reports `mainFluid.fboSize=[171,85]` and `mainFluid.targets.*.width/height=171x85` at a `1440x900` viewport, matching `floorPowerOfTwo(renderSize) / 2 / 3`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-fluid-resize-project-media`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-fluid-resize-full`.

Decision: keep this source resize correction. It fixes a real `I1/ag` structural mismatch and makes the main fluid path operational on tier-3 devices, but Phase 1 remains open because the hard horizon/fog-bed, exact `VA` shader bridge, and final target/output interpretation gaps are still not fully closed.

### S1-27 Floor/Environment Contribution Attribution

This batch widened the next small step into three related diagnostics without changing default rendering. The goal was to stop guessing at the remaining hard horizon/fog-bed issue and isolate whether it is primarily caused by floor mesh output, floor reflection content, or the environment dome.

Runtime/tooling changes:

- Added explicit debug-only home render switches: `debug-floor=off`, `debug-floor-reflection=off`, and `debug-environment=off`.
- The floor/environment visibility switches are applied only around the home-scene render and then restored, so default rendering and project pages keep their normal state.
- The reflection switch skips the floor `onBeforeRender` reflection update only when requested.
- Added these diagnostics to `window.__rogierOutputProbe.settings.diagnostics`.
- Extended `scripts/compare-home-brightness-attribution.mjs` with `floor-off`, `floor-reflection-off`, and `environment-off` variants.

Attribution results at `1440x900`:

- Default: `workRaw=0.2935`, `workComposite=0.2192`, `preComposite=0.2818`.
- `floor-off`: `workRaw=0.3992`, `workComposite=0.3596`, `preComposite=0.5343`.
- `floor-reflection-off`: `workRaw=0.2004`, `workComposite=0.1798`, `preComposite=0.2306`.
- `environment-off`: `workRaw=0.1410`, `workComposite=0.1136`, `preComposite=0.1232`.
- `sky-off` and `sky-raw` still brighten the output substantially, confirming the sky/environment input remains a major source of the visible field.

Interpretation:

- The hard boundary is not explained by "floor too bright"; disabling the floor exposes a much brighter environment path.
- Environment is the dominant visible contributor, while the floor and reflected environment are acting as masking/darkening contributors.
- The next source-backed work should inspect `a1/i1/h1/u1` ownership around draw order, depth/write state, and reflector/environment interaction rather than tuning brightness constants.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Brightness attribution passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-floor-env-attribution`.
- Home output probe passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-floor-env-probe`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-floor-env-project-media`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-floor-env-full`.

Decision: keep the diagnostics and attribution results. No production visual behavior changed, but Phase 1 remains open. The evidence narrows the next batch to source draw-state/render-order parity for floor/environment/reflection instead of unsupported color or gamma tuning.

### S1-28 `a1/i1` Floor Group and Reflector Ownership

This batch promoted one source-backed structural difference from the S1-27 attribution results.

Source evidence:

- Source `a1.init()` creates a floor group, creates the floor mesh as a child, and adds the `i1` reflector object as a child of the floor mesh.
- Source floor placement is owned by the group: `p1.floor.position.y = -1.65`; the floor mesh itself keeps local position `0` and only rotates `x = -Math.PI / 2`.
- Source `i1.update()` reads reflector world position, rotation, texture matrix, and oblique clipping plane from `this.matrixWorld`, i.e. the reflector object itself, not directly from the floor mesh.
- Source `onBeforeRender` hides the `a1` group while the reflector renders, then restores it.

Runtime changes:

- Added `floorGroup` and `floorReflector` so the rebuild now follows `a1 group -> floor mesh -> reflector object`.
- Moved the `-1.65` y offset from the floor mesh to `floorGroup`.
- Changed floor reflection matrix/clip-plane ownership to read from `floorReflector.matrixWorld`.
- Changed floor reflection `onBeforeRender` and `debug-floor=off` visibility gating to hide/restore the floor group, matching source ownership.
- Added floor group/plane positions to the output probe.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Home output probe passed and confirms `floor.groupPosition=[0,-1.65,0]` and `floor.planePosition=[0,0,0]`: `/tmp/rd-floor-group-probe`.
- Brightness attribution passed with no failed requests, runtime exceptions, or WebGL errors: `/tmp/rd-floor-group-attribution`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-floor-group-project-media`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-floor-group-full`.

Decision: keep this source hierarchy correction. It removes a real `a1/i1` ownership drift and keeps the S1-27 attribution stable, but Phase 1 remains open because the remaining hard horizon/fog-bed still needs source-backed draw-state/render-order or target-content evidence.

### S1-29 `o1` Floor RawShaderMaterial / GLSL3 Surface

This batch aligned the floor material shader surface with source `o1` after the S1-28 hierarchy correction.

Source evidence:

- Source `o1` extends material construction with `glslVersion: "300 es"`.
- Source floor shaders use explicit GLSL3 attribute/uniform/varying declarations rather than relying on Three's injected `ShaderMaterial` declarations.
- Source fragment precision is `mediump`, writes through an explicit output color, and samples textures with GLSL3 `texture(...)`.
- Source floor material defines `USE_NORMALMAP` when the normal map is present.

Runtime changes:

- Changed the rebuild floor material from `ShaderMaterial` to `RawShaderMaterial`.
- Added `glslVersion: GLSL3` and the source-shaped `USE_NORMALMAP` define.
- Moved the floor vertex/fragment shaders to GLSL3 `in`/`out` syntax with explicit built-in uniforms.
- Switched the floor fragment from `texture2D(...)` to `texture(...)` and from `gl_FragColor` to `FragColor`.

Rejected implementation path:

- A first `ShaderMaterial + GLSL3` attempt matched the source version flag but failed at runtime because Three injected declarations that collided with the source-style explicit declarations. `RawShaderMaterial` is therefore the safer source-shaped bridge for this material.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-floor-rawshader-final-probe`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-floor-rawshader-final-project-media`.
- Brightness attribution passed with no errors: `/tmp/rd-floor-rawshader-final-attribution`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-floor-rawshader-final-full`.

Attribution snapshot:

| Variant | Work raw 9x9 | Work composite 9x9 | Pre-composite 9x9 | Bloom 9x9 |
| --- | ---: | ---: | ---: | ---: |
| default | `0.2857` | `0.2211` | `0.2863` | `0.0220` |
| `floor-off` | `0.3985` | `0.3589` | `0.5325` | `0.0819` |
| `floor-reflection-off` | `0.2006` | `0.1802` | `0.2315` | `0.0174` |
| `environment-off` | `0.1386` | `0.1123` | `0.1202` | `0.0039` |

Decision: keep the RawShader/GLSL3 floor material change. This removes a real source-surface mismatch and preserves project-page stability, but it does not close Phase 1 visually. The attribution still says the remaining hard horizon/fog-bed gap is dominated by environment/floor/reflection target content and render-order interaction, not by unsupported color or brightness constants.

### S1-30 `i1/t1` Reflector Blur Pass Direction and Camera Surface

This batch continued the same source-backed floor/reflector chain and intentionally stayed narrow because the change affects render-target content.

Source evidence:

- Source `i1.update()` runs two blur iterations by default.
- The source blur direction is computed as `d = (blurIterations - u - 1) * 15`, then `uDirection = (d, 0)` for the first iteration and `(0, d)` for the second iteration. With the default `blurIterations=2`, that means first pass `(15, 0)` and second pass `(0, 0)`.
- Source `i1.update()` sets `virtualCamera.far = camera.far` and copies `camera.projectionMatrix`, but does not assign a separate `near` value before the copy.
- Source `t1/QA` blur shader body matches the rebuild's blur formula, so no blur-kernel rewrite was promoted.

Runtime changes:

- Earlier this entry incorrectly described the source default second pass as `(0, 15)` and the rebuild `(0, 0)`. The accepted S1-76 correction below supersedes that note: source default is `(0, 0)` for the second pass.
- Removed the non-source `floorReflectionCamera.near = homeCamera.near` assignment from the reflector update path.

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-reflector-blur-vpass-probe`.
- Brightness attribution passed with no errors: `/tmp/rd-reflector-blur-vpass-attribution`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-reflector-blur-vpass-project-media`.
- Full capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-reflector-blur-vpass-full`.

Attribution snapshot:

| Variant | Work raw 9x9 | Work composite 9x9 | Pre-composite 9x9 | Bloom 9x9 |
| --- | ---: | ---: | ---: | ---: |
| default | `0.2955` | `0.2228` | `0.2887` | `0.0248` |
| `floor-off` | `0.3995` | `0.3597` | `0.5352` | `0.0820` |
| `floor-reflection-off` | `0.2028` | `0.1812` | `0.2331` | `0.0175` |
| `environment-off` | `0.1398` | `0.1129` | `0.1209` | `0.0040` |

Decision: keep this reflector blur/camera surface alignment. It changes reflector target content in a source-backed way and remains stable across project media, but Phase 1 is still open because the home hard horizon/fog-bed gap remains dominated by the broader environment/floor/reflection interaction and final target interpretation.

### S1-31 Floor Reflection Band Attribution

This batch expanded the Phase 1 QA harness instead of changing production visuals. The goal was to locate the hard horizontal fog/floor boundary before making more source-sensitive floor/environment edits.

Runtime/tooling changes:

- `scripts/analyze-home-bands.mjs` now accepts an output directory as its first CLI argument and reports source-vs-rebuild band deltas for desktop and mobile captures.
- `window.__rogierOutputProbe.targets.*` now includes `bandStats`: ten horizontal luma bands and the strongest adjacent-band delta for every probed render target.

Evidence from `/tmp/rd-band-probe` and `/tmp/rd-band-home`:

| Target / capture | Key band jump | Read |
| --- | ---: | --- |
| Rebuild screenshot desktop | `0.1232` at `63.3%` height | Visible hard horizon remains in the final image. |
| `workRaw` | `0.2023` at `0.50` | The boundary already exists in the raw home scene render. |
| `workComposite` | `0.1159` at `0.50` | `OA/CA` inherits and softens it; it is not the origin. |
| `preComposite` | `0.2027` at `0.50` | `A1/C1` re-exposes the same raw-scene boundary. |
| `floorReflectionRead` | `0.3314` at `0.50` | The strongest target discontinuity is in the blurred reflector texture. |
| `skyComposite` | `0.0325` at `0.90` | Sky target itself is smooth and is not the hard-horizon source. |

Screenshot comparison:

- Desktop rebuild center-band luma is now close to source (`-0.0178`), but the localized `0.55` band remains much darker than source (`-0.1032`).
- Mobile rebuild center-band luma is still darker than source (`-0.0247`), with the largest remaining deficits around `0.25`, `0.65`, and `0.75`.

Decision: keep the diagnostics. Do not tune global brightness, sky constants, thumb darkness, or final composite transfer from this evidence. The next source-backed batch should stay on `i1/a1` reflector target content and floor sampling/camera ownership, because the hard boundary is present before final compositing and is strongest in `floorReflectionRead`.

### S1-32 Reflector Clip / Blur / Sampling Diagnostic

This batch added query-only reflector diagnostics to test whether the hard horizon is caused by a single obvious `i1/a1` switch. Default production rendering is unchanged.

Runtime/tooling changes:

- Added `debug-floor-reflection=no-clip` to bypass the reflector oblique projection-matrix clip-plane write.
- Added `debug-floor-reflection=no-blur` to copy the raw reflection target through the blur shader without directional blur.
- Added `debug-floor-reflection=raw-sample` to make the floor shader sample the raw reflection target instead of the blurred read target.
- Added these three variants to `scripts/compare-home-brightness-attribution.mjs`.

Evidence from `/tmp/rd-reflection-variants`:

| Variant | Work raw 9x9 | Pre-composite 9x9 | `floorReflectionRead` strongest band | Read |
| --- | ---: | ---: | --- | --- |
| default | `0.2882` | `0.2916` | `0.3283` at `0.50` | Baseline hard reflection boundary. |
| `floor-reflection-off` | `0.1988` | `0.2285` | `0.0000` | Confirms reflection materially affects the floor/environment result. |
| `no-clip` | `0.2873` | `0.2921` | `0.6285` at `0.30` | Disabling clip is not source-shaped and makes reflection target content worse. |
| `no-blur` | `0.2917` | `0.2902` | `0.3331` at `0.50` | Blur pass is not the source of the hard band. |
| `raw-sample` | `0.3000` | `0.2932` | `0.3478` at `0.50` | Sampling raw reflection is not a production fix. |

Verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `git diff --check` passed.
- Default home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-reflection-default-probe`.
- Focused attribution passed with no errors: `/tmp/rd-reflection-variants`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-reflection-variants-project-media`.

Decision: keep the query-only diagnostics for future attribution, but do not promote any of these variants. The remaining hard horizon is not explained by simply removing clipping, removing blur, or sampling the raw reflection target. The next source-backed work should inspect source-vs-rebuild reflected scene content and camera/scene state at the reflection render, especially which objects/background/fog are visible to the virtual camera.

### S1-73 Source `Iu/p1/kA/GA` Update Order

This batch fixed a source-structure difference in the work-scene frame lifecycle.

Source evidence:

- Source `Iu.update(e,t,n,i)` calls `renderManager.update(...)` first.
- Only after the render-manager finishes does source `Iu.update()` call `cameraController.update(...)` and then each component update.
- Source `p1.update(...)` follows that order by calling `super.update(...)` before spotlight parallax, visible-block culling, `uRevealSides`, `uRevealSpreadSides`, `tMouseSim2`, and `GA.update(...)`.
- Source `kA` enables the render-manager `mousesim` path, so screen-space mouse simulation belongs to the render-manager/composite path for the current render, while each `GA` block's own `Ka` mouse simulation is prepared during the post-render component update for the next frame.

Runtime changes:

- Split the rebuild's combined mouse-simulation update into screen-space render-manager simulation and per-work-block simulation.
- Moved the source `kA` screen mouse-simulation update before the work-scene render.
- Moved camera controller, home spotlight parallax, visible-work-item side reveal/culling, pointer projection, and per-block mouse simulation to a post-render `updateWorkSceneForNextFrame(...)` step.
- Added `__rogierOutputProbe.settings.updateOrder` so browser QA records the active source update-order bridge.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-phase1-order-output`.
- Thumb spotlight probe passed and retained the source home map/position/target: `/tmp/rd-phase1-order-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-phase1-order-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-phase1-order-capture`.

Band snapshot from `/tmp/rd-phase1-order-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `-0.0024` | `+0.0009` |
| Mobile source -> rebuild | `-0.0143` | `+0.0039` |

Decision: keep this source update-order alignment. It removes a real `Iu/p1/kA/GA` lifecycle drift without regressing project media pages. Phase 1 remains open because the visual hard horizon/fog-bed and exact `VA` shader bridge are still not fully source-identical.

### S1-74 Source `HA/VA` Mouse Scale Ordering

This batch continued the Phase 1 shader audit and promoted one source-proven `HA/VA` vertex-order correction.

Source evidence:

- Source `HA` computes the Perlin-displaced candidate, then applies `transformed *= 1. - mouseSim.r * .05` before mixing toward `perlinDisplaced`.
- Source then applies `transformed = mix(transformed, perlinDisplaced, (1. - fadeDiplacement) * .25)`, reveal side masking, wave displacement, and the later world-position `transformed /= 1. - mouseSim.r * .2`.
- The rebuild already had the same operations, but the `.05` mouse scale happened after the Perlin mix and reveal-side masking. That changes the relative weighting of mouse deformation versus cube reveal/collapse.

Runtime changes:

- Moved the work-cube vertex `transformed *= 1.0 - mouseSim.r * 0.05` line before the Perlin reveal mix, matching the source operation order.

Non-fix source audit:

- Rechecked source `i1/a1/o1` reflector/floor ownership. Current rebuild still matches the important source structure: `floorGroup -> floorPlane -> floorReflector`, group y `-1.65`, source `CircleGeometry(60,32)`, reflector hidden via the floor group during reflection render, raw reflection target depth enabled, read/write targets depthless, and floor shader sampling/formula. S1-76 corrects the reflector blur loop detail to source `(15,0)` then `(0,0)` for the default two iterations.
- Rechecked source `h1/u1` environment defaults. Current rebuild matches the source defaults that materially affect the environment: `uMultiplier=2`, `uShader1Alpha=.5`, `uShader1Speed=.5`, `uShader1Scale=5.5`, `uShader2Alpha=0`, `uShader2Scale=13`, `uShader3Alpha=0`, `uShader3Speed=0`, `uShader3Scale=0`, `uShader1Mix3=1.5`, `envMapIntensity=1`, `BackSide`, and `fog:false`. The declared but unused `uShader1Mix2` is not promoted as a production change.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no console messages: `/tmp/rd-phase1-va-order-shaders`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-phase1-va-order-output`.
- Thumb spotlight probe passed and retained the source home map/position/target: `/tmp/rd-phase1-va-order-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-phase1-va-order-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-phase1-va-order-capture`.

Band snapshot from `/tmp/rd-phase1-va-order-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `-0.0018` | `+0.0004` |
| Mobile source -> rebuild | `-0.0143` | `+0.0107` |

Decision: keep the `HA/VA` mouse-scale ordering correction. It is source-proven, low scope, and does not regress project media. Phase 1 remains open; remaining blockers are still exact generated `VA` material-body parity, thumb/spotlight projection feel, and the mobile/fog-bed visual residual.

### S1-75 Source `zA/VA` Fragment Tail Surface

This batch continued the source shader audit and promoted three source-proven `zA/VA` fragment-tail differences in the production work block shader.

Source evidence:

- Source `zA` computes `screenUv` as `gl_FragCoord.xy / uCoords.xy`; the rebuild had a defensive `max(uCoords, vec2(1.0))` wrapper that is not in source.
- Source `zA` mutates `gl_FragColor.rgb` from the lit material output and does not keep a dead `sourceDisplacement * 0.0` color path.
- Source `zA` assigns `gl_FragColor.a = alpha` after reveal-side alpha calculation; the rebuild multiplied by `diffuseColor.a`.

Runtime changes:

- Updated the production work fragment tail to use the source `screenUv` expression.
- Removed the dead `sourceDisplacement` sample and zero-weight color add from the production work fragment tail.
- Updated production work alpha assignment to `gl_FragColor.a = alpha`.
- Removed the same dead displacement sample from the auxiliary block tail, but kept its defensive coordinate and alpha behavior because that auxiliary shader is not the ordinary source `VA` work shader.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Fresh shader dump passed after restarting the static rebuild server and confirmed the production work fragment contains `vec2 screenUv = gl_FragCoord.xy / uCoords.xy;`, `gl_FragColor.a = alpha;`, and no `sourceDisplacement`: `/tmp/rd-phase1-za-tail-shaders-fresh`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-phase1-za-tail-output`.
- Thumb spotlight probe passed and retained the source home map/position/path: `/tmp/rd-phase1-za-tail-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining visible project media: `/tmp/rd-phase1-za-tail-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-phase1-za-tail-capture`.

Band snapshot from `/tmp/rd-phase1-za-tail-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `-0.0013` | `+0.0041` |
| Mobile source -> rebuild | `-0.0131` | `+0.0111` |

Decision: keep this `zA/VA` fragment-tail correction. It removes real source-surface drift without relying on visual tuning. Phase 1 remains open because the remaining visible residual is now less about broad center brightness and more about localized horizon/fog-bed structure, thumb/spotlight projection fidelity, and any remaining generated material-body differences.

### S1-76 Source `i1` Reflector Blur Loop

This batch corrected the reflector blur pass implementation to match the source loop instead of the previous fixed two-axis approximation.

Source evidence:

- Source `i1` defaults to `blurIterations=2`.
- In `i1.update()`, each pass computes `d = (blurIterations - u - 1) * 15`.
- For the default two passes, the source directions are therefore `(15, 0)` on pass 0 and `(0, 0)` on pass 1, with `renderTargetRead` and `renderTargetWrite` swapped after each pass.

Runtime changes:

- Replaced the fixed `(15, 0)` then `(0, 15)` floor-reflection blur sequence with the source loop and read/write target swap.
- Rebound the floor material's `tReflect` uniform to the final swapped read target after the loop.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-reflector-source-blur-loop-probe`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining visible media tracks: `/tmp/rd-reflector-source-blur-loop-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-reflector-source-blur-loop-capture`.

Band snapshot from `/tmp/rd-reflector-source-blur-loop-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0001` | `-0.0017` |
| Mobile source -> rebuild | `-0.0132` | `+0.0048` |

Decision: keep the source reflector blur loop. It corrects a real `i1` implementation drift and slightly improves the measured desktop/mobile band residuals without touching unsupported brightness constants. Phase 1 remains open because mobile/fog-bed structure and thumb/spotlight projection still require source-backed work.

### S1-77 Source `T1/w1/E1/x1` Thumb Shader Surface

This batch aligned the thumb render-target shader surface with the source `T1/w1/E1/x1` chain.

Source evidence:

- Source `M1` thumb-plane material is created with `glslVersion: GLSL3`, explicit `in` attributes, explicit matrix uniforms, `out vec4 FragColor`, and `texture(...)`.
- Source `_1` thumb-composite material is also `glslVersion: GLSL3`, `toneMapped:false`, transparent, depthless, and uses the source fullscreen vertex surface plus `FragColor`.
- The previous rebuild thumb shaders were WebGL1-style `varying`, `texture2D`, and `gl_FragColor`. A first `ShaderMaterial + GLSL3` trial reproduced Three's injected-attribute collision, so the accepted bridge uses `RawShaderMaterial + GLSL3` for these explicit source shaders.

Runtime changes:

- Converted the thumb plane vertex/fragment shader to the source GLSL3 interface.
- Converted the thumb composite vertex/fragment shader to the source GLSL3 interface.
- Switched thumb plane and thumb composite materials to `RawShaderMaterial` with `GLSL3` to prevent non-source Three shader injection.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Fresh shader dump passed after restarting the static rebuild server, with no console/WebGL shader errors: `/tmp/rd-thumb-rawglsl3-fresh-shader`.
- Thumb spotlight probe passed and retained non-empty thumb/composite targets plus the home spotlight map: `/tmp/rd-thumb-rawglsl3-fresh-thumb`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-thumb-rawglsl3-output`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining visible media tracks: `/tmp/rd-thumb-rawglsl3-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-thumb-rawglsl3-capture`.

Band snapshot from `/tmp/rd-thumb-rawglsl3-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `-0.0029` | `-0.0019` |
| Mobile source -> rebuild | `-0.0131` | `+0.0069` |

Decision: keep the source thumb shader-surface bridge. It removes a real `T1/w1/E1/x1` WebGL1/WebGL2 surface drift without changing visual constants. Phase 1 remains open because this does not fully solve spotlight projection feel or mobile fog-bed residuals.

### S1-78 Source `Ka/Fn/Yi` Mouse Simulation Rounding

This batch aligned a small but real source difference in the `GA` mouse simulation path.

Source evidence:

- Source `Ka.update()` sets `uSpeed` to `Math.max(Fn(speed.length()), 1e-4)`, where `Fn(value, 4)` rounds to four decimal places.
- Source `GA.update()` smooths `mouseSpeed` through `Yi(current, target, 10, delta)`, which is `Fn(lerp(current, target, 1 - exp(-10 * delta)))`.
- During the audit, `u1` environment `uShader1Mix2` was initially suspected as rebuild-only, but shader dump confirmed it is part of the source environment shader surface. That candidate was reverted before acceptance.

Runtime changes:

- Added source-style `sourceRound()` and `sourceDamp()` helpers for this path.
- Rounded work mouse-simulation `uSpeed` to the source four-decimal precision before clamping.
- Replaced `MathUtils.damp()` for work-block `mouseSpeed` with the source `Yi`-equivalent rounded damping.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Fresh shader dump passed with no console/WebGL shader errors and confirmed `u1-environment.fragmentUniformsOnlySource=[]` / `fragmentUniformsOnlyRebuild=[]`: `/tmp/rd-source-mouse-round-shader`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-source-mouse-round-output`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-source-mouse-round-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-source-mouse-round-full`.

Band snapshot from `/tmp/rd-source-mouse-round-full`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `-0.0023` | `+0.0012` |
| Mobile source -> rebuild | `-0.0133` | `+0.0140` |

Decision: keep the source mouse-simulation rounding semantics. This is a source parity correction with low blast radius and no project-media regression. Phase 1 remains open because it does not materially close the remaining mobile/fog-bed or spotlight/projection residuals.

### S1-79 Source `VA/zA` r164 Physical Residual Strip

This batch removed two Three r164 generated physical-material residual branches that are not present in the source `VA/zA` work-block shader surface.

Source evidence:

- The mirrored source `zA` fragment does not declare r164 `dispersion` or `anisotropy` physical-material uniforms.
- After the Three r164 pin, the rebuild production work fragment still carried generated `USE_DISPERSION` and `USE_ANISOTROPY` uniform branches from Three's physical material chunks.
- A wider attempted strip of `USE_SHEEN`/physical macro tail code was rejected before acceptance because it was too broad and caused shader compilation failure. The accepted change only removes the two proven r164-only uniform branches.

Runtime changes:

- Added `stripSourceVaR164PhysicalBranches()` in the work-block shader patch path.
- Removed production `USE_DISPERSION` and `USE_ANISOTROPY` uniform branches from the generated work fragment before compile.
- Left `USE_SHEEN` and remaining generated Three chunk body differences untouched until there is a safer source-backed extraction.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Fresh shader dump passed with no console/WebGL shader errors and confirmed `fragmentAnalysis.uniformsOnlyRebuild=[]` for the production work fragment: `/tmp/rd-r164-physical-shader`.
- Thumb spotlight probe passed and retained non-empty thumb/composite targets plus the home spotlight map: `/tmp/rd-r164-physical-thumb`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-r164-physical-output`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-r164-physical-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-r164-physical-capture`.

Band snapshot from `/tmp/rd-r164-physical-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0009` | `-0.0009` |
| Mobile source -> rebuild | `-0.0120` | `+0.0138` |

Decision: keep the narrow r164 physical residual strip. It clears a real production `VA/zA` shader-surface divergence without changing visual constants. Phase 1 remains open because the remaining residual is still concentrated in mobile/fog-bed structure, spotlight/projection feel, and safe generated material-body attribution.

### S1-80 Source `i1` Reflection Blur No-Clear

This batch removed a rebuild-only clear from the floor-reflection blur pass.

Source evidence:

- Source `i1.update()` renders the reflected scene into `renderTarget`, conditionally calling `renderer.clear()` only for that reflected-scene target when `renderer.autoClear === false`.
- The source blur loop then renders the fullscreen blur pass into `renderTargetWrite` and swaps read/write targets without any explicit clear call.
- The rebuild still cleared `floorReflectionReadTarget` before blur and cleared every `writeTarget` inside the blur loop.

Runtime changes:

- Removed the extra clear before the floor-reflection blur/no-blur pass.
- Removed the extra clear inside each floor-reflection blur iteration.
- Kept the source two-pass blur direction loop and target swapping from the previous `i1` alignment.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-reflector-no-blur-clear-output`.
- Thumb spotlight probe passed and retained non-empty thumb/composite targets plus the home spotlight map: `/tmp/rd-reflector-no-blur-clear-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-reflector-no-blur-clear-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-reflector-no-blur-clear-capture`.

Band snapshot from `/tmp/rd-reflector-no-blur-clear-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0006` | `-0.0031` |
| Mobile source -> rebuild | `-0.0125` | `+0.0235` |

Decision: keep the source `i1` no-clear blur pass. It corrects a real render-pass divergence in the reflector lifecycle. Phase 1 remains open because mobile still has a larger horizontal residual, so the next floor/environment work should compare reflected target content and draw-state against source rather than adding clears back.

### S1-81 Source `i1` Reflection Target and Camera Initialization

This batch aligned two source-confirmed reflector initialization details and expanded reflector diagnostics.

Source evidence:

- Source `i1` constructs `renderTarget` with `{ depthBuffer:false }`, clones `renderTargetRead` and `renderTargetWrite`, then sets only `renderTarget.depthBuffer = true`.
- Source `i1.virtualCamera` is created with `new PerspectiveCamera()` defaults, then each update copies the real camera projection and far plane. That means the default reflection-camera surface starts from `fov=50`, `aspect=1`, and `near=.1`, not the rebuild's previous `near=1` constructor.

Runtime changes:

- The raw floor-reflection target now follows the source create-clone-toggle sequence, so the raw target has depth while read/write blur targets remain depthless.
- The floor-reflection camera now uses the default `PerspectiveCamera` constructor before the source update path copies the home projection.
- `reflectionStateProbe()` now reports reflection target depth/stencil/texture parameters, camera `fov/aspect/near/far`, and which reflection texture is bound to the floor material.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-reflector-target-camera-output`.
- Thumb spotlight probe passed and retained the home spotlight map and non-empty thumb targets: `/tmp/rd-reflector-target-camera-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-reflector-target-camera-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-reflector-target-camera-full`.

Band snapshot from `/tmp/rd-reflector-target-camera-full`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0013` | `-0.0031` |
| Mobile source -> rebuild | `-0.0133` | `+0.0133` |

Decision: keep the source reflector target/camera initialization. The new probe confirms raw target `depthBuffer=true`, read/write targets `depthBuffer=false`, floor reflection uses the final read texture, and the reflection camera reports `near=.1`. Phase 1 remains open because this is source-structure parity, not a visual closeout for the remaining mobile/fog-bed and spotlight/projection residuals.

### S1-82 Source `V1/H1/Lo` Sky Render Pass No-Clear

This batch aligned the sky render target pass with the source `V1/H1/Lo` render-manager lifecycle.

Source evidence:

- Source `V1.setRenderManager()` uses `new H1(...)`.
- Source `H1` extends `Lo`, and source `Lo.update()` renders the sky scene into `renderTargetA`, then renders the composite screen into `renderTargetComposite`, without explicit `renderer.clear()` calls in either pass.
- Source `nD.init()` then sets `skyScene.renderManager.renderTargetComposite.texture.wrapS = wrapT = RepeatWrapping` and assigns that texture to `workScene.env.material.customUniforms.tSky`.

Runtime changes:

- Removed the rebuild-only explicit clears before `skyRawTarget` and `skyCompositeTarget` renders.
- Added `settings.updateOrder.skyPassClearing = "source-Lo-no-explicit-clear"` to the output probe so this render-pass ownership stays visible in future QA.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors; the probe reports the source no-clear marker and non-empty sky/environment targets: `/tmp/rd-sky-no-clear-output`.
- Thumb spotlight probe passed and retained the home spotlight map and non-empty thumb targets: `/tmp/rd-sky-no-clear-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-sky-no-clear-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-sky-no-clear-full`.

Band snapshot from `/tmp/rd-sky-no-clear-full`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0022` | `-0.0023` |
| Mobile source -> rebuild | `-0.0126` | `+0.0163` |

Decision: keep the source sky no-clear render pass. It removes a real `V1/H1/Lo` render-pass divergence without changing visual constants. Phase 1 remains open because the remaining mobile/fog-bed distribution and spotlight/thumb projection feel are not fully source-matched yet.

### S1-83 Source `A1/C1` Pre-Composite Flow

This batch closed a small but concrete `A1/C1` shader-flow residual without tuning brightness.

Source evidence:

- Source `A1` declares and computes `displacementUv` and `vignetteF` even though the current live output does not consume them.
- Source `A1` computes `noiseUv` and samples `tNoise` immediately after the bloom branch and before contrast, saturation, background lighten, and media mix.
- Source `A1` still applies the two noise mixes only after the media mix.

Runtime and tooling changes:

- `homePreCompositeFragment` now restores the source `displacementUv` and `vignetteF` computations.
- The noise sample moved back to the source position, while the two tail noise mixes remain after media and use `noise.rgb`.
- `scripts/audit-renderer-output.mjs` now checks the updated `noise.rgb` form and only reports `noiseSampleRelocated` when the full source/rebuild anchor order actually differs.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Renderer audit confirms `A1` `orderMatchesSource=true`, `flowOrderMatchesSource=true`, and no inert computation residuals: `/tmp/rd-a1-flow-audit-2`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-a1-flow-output`.
- Thumb spotlight probe passed and retained the home spotlight map and non-empty thumb targets: `/tmp/rd-a1-flow-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-a1-flow-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-a1-flow-capture`.

Band snapshot from `/tmp/rd-a1-flow-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0012` | `-0.0023` |
| Mobile source -> rebuild | `-0.0134` | `+0.0171` |

Decision: keep the source `A1/C1` flow alignment. It removes a real shader-flow mismatch and keeps project pages stable, but it is not a Phase 1 closeout. Continue with source-backed target-content/projection attribution rather than visual tuning.

### S1-84 Source `T1/w1/E1/M1/x1` Thumb Shader Surface

This batch tightened the thumb/spotlight-map shader chain and expanded the shader audit so future projection work can compare the source thumb plane directly.

Source evidence:

- Source `M1` uses source `b1` vertex and `S1` fragment with `RawShaderMaterial`/GLSL3-like declarations, uniforms `tMap`, `uMapSize`, `uResolution`, `uProgress`, `uTransitionCount`, and `uTransitionSmoothness`, plus defaults `uTransitionCount=150` and `uTransitionSmoothness=.2`.
- Source `S1` uses source helper `y1`, then declares `vec2 uv = vUv`, samples `coverTexture(tMap, uMapSize, uv, uResolution)`, creates fallback `vec4 color = vec4(uv.x, uv.y, 0.0, 0.0)`, and calls `transition(map, color, 1. - uProgress, uv)`.
- Source `v1` thumb composite samples `vec4 mixed = texture(tScene, uv)`, applies `blendMultiply(...)`, then `saturation(...)`, and outputs `FragColor = vec4(mixed.rgb, 1.)` before the tonemapping include.

Runtime and tooling changes:

- `thumbFragment` now matches the source `S1` local `uv`/`color`/`1. - uProgress` form and source `y1` cover-helper naming (`containerSize`, `new`).
- `thumbCompositeFragment` now uses the source `saturation(...)` helper name and `mixed` variable/output form.
- `createThumbPlane()` now dumps `M1-thumb-plane` under `dump-va-shader=1`.
- `scripts/dump-va-shader.mjs` now maps `M1-thumb-plane` to source `S1` for fragment comparison and source `b1` for vertex comparison. The generic shader analysis now keeps separate fragment and vertex source maps so vertex deltas are not compared against fragment source text.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s1-84-thumb-shader-2`.
- Shader dump confirms `x1-thumb-composite.compositeCoreChecks.saturationTail` is true in both source and rebuild, and `M1-thumb-plane` is now captured with source vertex mapping (`vertexLengthDelta=1`).
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-s1-84-output`.
- Thumb spotlight probe passed and retained a non-empty thumb target/composite target plus spotlight map: `/tmp/rd-s1-84-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-s1-84-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-s1-84-capture`.

Band snapshot from `/tmp/rd-s1-84-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0006` | `-0.0014` |
| Mobile source -> rebuild | `-0.0137` | `+0.0153` |

Decision: keep the thumb shader-surface and audit-coverage alignment. It improves source attribution for the spotlight/thumb-map chain, but Phase 1 remains open for mobile/fog-bed and projection-feel residuals.

### S1-85 Source Render-State `blending: ot` Parity

This batch aligned a source draw-state residual across the active home render-target chain. In the source bundle, `ot=0`, which maps to Three `NoBlending`.

Source evidence:

- Source `C1` (`A1` pre-composite) constructs its material with `blending: ot`.
- Source `OA` (`CA` work composite) constructs its material with `blending: ot`.
- Source `lA` (`aA` main composite) constructs its material with `blending: ot`.
- Source `_1` (`v1` thumb composite) constructs its material with `blending: ot`.
- Source `t1` (`QA` floor-reflection blur) constructs its material with `blending: ot`.
- Source `o1` (`s1/r1` floor material) constructs its material with `blending: ot`.
- Source `W1` project media composite does not explicitly show `blending: ot`, so it was not changed in this batch.

Runtime and tooling changes:

- Imported `NoBlending` from Three and set the above six source-proven materials to `NoBlending`.
- Added output/reflection probe fields for `preComposite.blending`, `composite.blending`, `mainComposite.blending`, `thumbComposite.blending`, `floor.material.blending`, and `floorReflection.blurMaterialBlending`.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors and unchanged core shader checks: `/tmp/rd-s1-85-shader`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-s1-85-output`.
- Output probe confirms `preComposite.blending=0`, `composite.blending=0`, `mainComposite.blending=0`, `thumbComposite.blending=0`, `floor.material.blending=0`, and `blurMaterialBlending=0`.
- Thumb spotlight probe passed and retained a non-empty thumb target/composite target plus spotlight map: `/tmp/rd-s1-85-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-s1-85-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-s1-85-capture`.

Band snapshot from `/tmp/rd-s1-85-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0010` | `-0.0023` |
| Mobile source -> rebuild | `-0.0126` | `+0.0150` |

Decision: keep the source render-state parity. This removes a real draw-state divergence and slightly improves the mobile center-band delta versus S1-84, but Phase 1 remains open for the remaining mobile/fog-bed and projection-feel residuals.

### S1-86 Shader Audit Comment-Include Handling

This batch cleaned up a Phase 1 audit-harness false positive before making more runtime changes.

Source evidence:

- Source `u1-environment` contains a long block of full-line commented Three shader includes near the fragment tail, including `// #include <tonemapping_fragment>` and `// #include <colorspace_fragment>`.
- Those commented includes are not live shader code. `collectIncludes()` already ignored full-line comments, so `u1-environment` had no live include delta; only `analyzeCompositeCore()` was still matching against raw normalized text and counting the commented tonemapping include.

Tooling changes:

- `scripts/dump-va-shader.mjs` now strips full-line comments before normalized composite-core matching.
- Generic shader summaries now expose `fragmentCommentedIncludesSource` and `fragmentCommentedIncludesRebuild` separately, so commented source bundle text remains visible without being treated as runtime parity work.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s1-86-shader`.
- Shader dump confirms `u1-environment.compositeCoreChecks.tonemappingTail` is now `source=false` and `rebuild=false`; the source-only commented include list still reports the commented `tonemapping_fragment`, `colorspace_fragment`, `fog_fragment`, and related includes.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-s1-86-output`.
- Thumb spotlight probe passed and retained a non-empty thumb target/composite target plus spotlight map: `/tmp/rd-s1-86-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-s1-86-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-s1-86-capture`.

Band snapshot from `/tmp/rd-s1-86-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0012` | `+0.0001` |
| Mobile source -> rebuild | `-0.0128` | `+0.0208` |

Decision: keep the audit cleanup. It prevents a non-runtime source comment from driving production shader changes. Phase 1 remains open for the remaining mobile/fog-bed, safe `u1/l1` shader-body, `VA/GA` material-body, and spotlight/thumb projection residuals.

### S1-87 Source `h1/u1/l1` Environment Shader Runtime Surface

This batch tightened the active environment dome shader/runtime surface without changing visual constants.

Source evidence:

- Source `l1` includes source blend helper `${Po}` and calls `blend(4, ...)` / `blend(16, ...)` directly in the environment fragment body.
- Source `u1.customUniforms` binds `uTime`, `uMultiplier`, `uDarken`, `tSky`, `uDarkenColor`, `uShader1Alpha`, `uShader1Speed`, `uShader1Scale`, `uShader2Alpha`, `uShader2Scale`, `uShader3Alpha`, `uShader3Speed`, `uShader3Scale`, and `uShader1Mix3`.
- Source `l1` declares `uniform float uShader1Mix2;`, but source `u1.customUniforms` does not create it and `onBeforeCompile` does not assign it into `shader.uniforms`. That makes it source-declared shader text, not a runtime-bound material uniform.

Runtime and tooling changes:

- Replaced rebuild-only environment helper names `environmentBlendColorDodge*`, `environmentBlendNegation`, and `environmentBlend(...)` with source-shaped `blendColorDodge`, `blendNegation`, and `blend(...)` calls while preserving the same active mode `4` and `16` math.
- Removed the rebuild-only runtime `uShader1Mix2` material uniform while keeping the source shader declaration intact.
- Updated output probe metadata so `uShader1Mix2` reports `null` and `uShader1Mix2Binding="source-declared-only"` instead of requiring a runtime uniform value.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s1-87-shader`.
- Shader dump shows `u1-environment` fragment delta narrowed from `-519` to `-436`; live include and uniform deltas remain empty.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-s1-87-output`.
- Output probe confirms `environment.shaderSurface.uShader1Mix2=null` and `uShader1Mix2Binding="source-declared-only"`.
- Thumb spotlight probe passed and retained a non-empty thumb target/composite target plus spotlight map: `/tmp/rd-s1-87-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-s1-87-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-s1-87-capture`.

Band snapshot from `/tmp/rd-s1-87-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0006` | `-0.0026` |
| Mobile source -> rebuild | `-0.0126` | `+0.0190` |

Decision: keep the source environment runtime-surface alignment. It removes a real helper/runtime-binding drift and slightly improves the desktop band delta, but Phase 1 remains open for the remaining mobile/fog-bed, generated `VA/GA` material-body, and spotlight/thumb projection residuals.

### S1-88 `VA/GA` Shader Residual Attribution

This batch improved `VA/GA` shader attribution before making another production shader-body change.

Tooling changes:

- `scripts/dump-va-shader.mjs` now maps generic `VA-work` shader dumps to source `zA` and source `HA`, instead of treating `VA-work` as source-less generic output.
- Generic shader summaries now include `vaFragmentCoreChecks` for the source tail output, mouse-lightness mix, alpha grid, reveal radius, mouse alpha, source specular macro spelling, modern specular macro spelling, modern physical residuals, and sheen presence.
- The dump writes source/rebuild files for `VA-work` under the same generic shader summary path, making future work compare the active source and rebuild shader pair directly.

Current evidence:

- `VA-work` source mapping reports `vertexLengthDelta=-168` and `fragmentLengthDelta=+902`.
- Live uniform deltas are empty.
- Live include deltas are now explicit: source-only `bsdfs` and `opaque_fragment`; rebuild-only live includes are empty.
- Core active `VA` anchors are present in both source and rebuild: tail output, mouse-lightness mix, alpha grid, reveal radius, and mouse alpha.
- The earlier broad “generated material-body” bucket is now narrowed: the remaining clear material-body residuals are source `bsdfs`/`opaque_fragment` include shape and source old specular map macro spelling (`USE_SPECULARCOLORMAP`, `USE_SPECULARINTENSITYMAP`) versus rebuild modern underscore spelling (`USE_SPECULAR_COLORMAP`, `USE_SPECULAR_INTENSITYMAP`).
- The previously stripped modern physical branches remain absent: `modernPhysicalResidual.source=false` and `rebuild=false`.
- `USE_SHEEN` remains present in both source and rebuild, so the previous warning still stands: do not broad-strip sheen code without a safer source-backed extraction.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s1-88-va-audit-3`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-s1-88-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-s1-88-capture`.

Band snapshot from `/tmp/rd-s1-88-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0002` | `-0.0020` |
| Mobile source -> rebuild | `-0.0129` | `+0.0183` |

Decision: keep the `VA/GA` attribution upgrade. It does not change runtime behavior or close Phase 1, but it prevents another unsafe broad material-body edit. The next production candidates should be isolated against this evidence: specular macro/interface compatibility if proven non-inert, source `bsdfs`/`opaque_fragment` shape if it affects generated output, or the separate spotlight/thumb projection chain.

### S1-89 Source `T1/w1/E1` Thumb Strip Position Ownership

This batch aligned one source-backed runtime difference in the thumb/spotlight projection chain and expanded the browser probe so the same source shape is now enforced automatically.

Source evidence:

- Source `E1` creates a thumb plane with `mesh.scale.set(2,2,2)` and initializes `yHook=0`.
- Source `w1` stores `progress`, `itemWidth`, `totalItems`, `offsetY`, and `isTransitioning`, but `updateGalleryProgress()` positions each thumb with `r.mesh.position.set(c,0,0)`.
- Source `w1.updateGalleryProgress()` uses horizontal wrapping only: `itemWidth`, `totalWidth`, `progress * totalWidth`, modulo wrap with `67890`, and visibility in roughly `[-1.5, 1.5]`.

Runtime and tooling changes:

- `updateThumbGallery()` now writes thumb mesh positions as `(x,0,0)` instead of the rebuild-only `thumbYHook + thumbOffsetY` y path.
- `__rogierThumbProbe` now reports `thumbPositionMode="source-w1-x-only"`, `itemWidth`, `totalItems`, `totalWidth`, `offsetY`, `isTransitioning`, and every thumb's `xHook`, `yHook`, position, and visibility.
- `scripts/probe-thumb-spotlight.mjs` now fails if the thumb strip no longer matches the source shape: item width `2`, total width calculation, `offsetY=0`, `isTransitioning=false`, and all thumb y/z positions at zero during the default home probe.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s1-89-va`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-s1-89-output`.
- Thumb spotlight probe passed and confirmed `thumbPositionMode="source-w1-x-only"`, `itemWidth=2`, `totalItems=10`, `totalWidth=20`, `offsetY=0`, `isTransitioning=false`, `visibleThumbs=1`, all thumb y/z positions at `0`, spotlight map present, target `(0,0,-8)`, and intensity `220`: `/tmp/rd-s1-89-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-s1-89-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-s1-89-capture`.

Band snapshot from `/tmp/rd-s1-89-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `-0.0003` | `-0.0006` |
| Mobile source -> rebuild | `-0.0116` | `+0.0150` |

Decision: keep the source thumb strip position ownership. This removes a rebuild-only y-position path from the spotlight-map source and gives future projection work a stricter probe. Phase 1 remains open because this does not solve the remaining mobile/fog-bed, exact `VA/GA` material-body, or projection-feel residuals.

### S1-90 Source `u1/l1` Environment Shader Core Attribution

This batch tightened the environment shader body and its audit coverage without changing visual constants.

Source evidence:

- Source `l1` keeps two inert local declarations in the active environment fragment body: `vec3 maskColor = vec3(1.0, 1.0, 1.0);` after the `tSky` samples and `vec3 black = vec3(0.095, 0.095, 0.095);` before `opaque_fragment`.
- Source `l1` uses the same active environment formula already in the rebuild: sky UV offsets, `smoothMask` bands, `blend(4)` color dodge, `blend(16)` negation, vertical white band, white mix, clamp/square, `reflectedLight.indirectDiffuse`, and darken-color dodge tail.
- Source `l1` is GLSL3 text, but the rebuild environment is still patched through `MeshStandardMaterial`; `texture(...)` was not promoted into production because the current shader bridge compiles under Three's standard material path where `texture2D(...)` is the safer equivalent.

Runtime and tooling changes:

- Added the inert source `maskColor` and `black` declarations to the rebuild environment fragment.
- Added `environmentCoreChecks` to `scripts/dump-va-shader.mjs` for `u1-environment`, covering the active sky UV, mask, blend, white-band, light, and darken-tail anchors.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Shader dump passed with no WebGL shader errors: `/tmp/rd-s1-90-shader`.
- Shader dump shows `u1-environment` fragment delta narrowed from `-436` to `-352`, live include/uniform deltas remain empty, and all `environmentCoreChecks` are `source=true` / `rebuild=true`.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-s1-90-output`.
- Thumb spotlight probe passed and retained the source thumb strip shape plus spotlight map: `/tmp/rd-s1-90-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-s1-90-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-s1-90-capture`.

Band snapshot from `/tmp/rd-s1-90-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0001` | `-0.0038` |
| Mobile source -> rebuild | `-0.0131` | `+0.0246` |

Decision: keep the source environment body attribution. The active `u1/l1` formula is now covered by dedicated checks, so the remaining mobile/fog-bed residual is less likely to be an untracked environment formula typo. Phase 1 remains open for mobile/fog-bed structure, exact `VA/GA` material-body residuals, and spotlight/projection feel.

### S1-91 Source Helper-Pass `NoBlending` Draw State

This batch aligned a grouped render-manager draw-state residual across fullscreen/helper passes. It did not change shader formulas, constants, project data, or route transitions.

Source evidence:

- Source `H1/z1` sky composite material is constructed with `blending: ot`, where Three r164 defines `ot=0` (`NoBlending`).
- Source `sg` luminosity, `rg` gaussian bloom blur, `cg` bloom composite, `ig` FXAA, and the displacement-style offscreen helper materials are also fullscreen render-target passes with `blending: ot`.
- The rebuild had already aligned the major `A1/C1`, `OA/CA`, `lA/aA`, `x1/v1`, `i1/t1`, and floor material draw states, but still left these helper passes on `NormalBlending` or implicit default blending.

Runtime and tooling changes:

- Set source `NoBlending` on the rebuild luminosity, bloom blur, bloom composite, FXAA, sky composite, and displacement helper materials.
- Added `uniforms.passMaterials` to `__rogierOutputProbe` so QA records the helper pass blending values directly for both active and default-disabled paths.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-pass-blending-output`.
- Output probe confirms `passMaterials.luminosity`, `bloomBlur`, `bloomComposite`, `mainBloomBlur`, `mainBloomComposite`, `fxaa`, `skyComposite`, and `displacement` all report `0`.
- Shader dump passed with no WebGL shader errors and retained the existing `VA`, `OA`, `A1`, and `u1` core-check status: `/tmp/rd-pass-blending-shader`.
- Thumb spotlight probe passed and retained the source thumb strip shape plus spotlight map: `/tmp/rd-pass-blending-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-pass-blending-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-pass-blending-capture`.

Band snapshot from `/tmp/rd-pass-blending-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0007` | `-0.0021` |
| Mobile source -> rebuild | `-0.0131` | `+0.0148` |

Decision: keep the helper-pass draw-state alignment. This removes a real source-state divergence and does not regress project media. Phase 1 remains open because the mobile/fog-bed residual and strict `VA/GA`/projection feel are still unresolved.

### S1-92 Source `i1` Floor-Reflection CSS Sizing

This batch aligned the floor-reflection render-target sizing semantics with source `i1.setSize()`. It is a source-structure correction, not a brightness tune.

Source evidence:

- Source `i1.setSize(e,t,n)` receives DPR as its third argument but does not use it.
- Source `i1.setSize()` sizes `renderTarget`, `renderTargetRead`, and `renderTargetWrite` to `e * .75` and `t * .75`, where `e/t` are the CSS viewport dimensions passed through the scene resize path.
- Source `i1.setSize()` sets the blur material `uResolution` to `(e,t)`, not to the DPR-scaled render-buffer dimensions.

Runtime and tooling changes:

- Floor-reflection raw/read/write targets now size from CSS `width * .75` / `height * .75` instead of DPR-scaled `renderWidth * .75` / `renderHeight * .75`.
- Floor-reflection blur `uResolution` now receives CSS `width,height` instead of DPR-scaled `renderWidth,renderHeight`.
- Output/reflection probes now report `reflectionSizing="source-i1-css-viewport-0.75"`, expected CSS target size, and `sourceCssSized`.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-reflection-css-output`.
- Output probe confirms reflection target/read sizes are `1080x675` for a `1440x900` CSS viewport, blur resolution is `1440x900`, and `reflectionState.targets.sourceCssSized=true`.
- Thumb spotlight probe passed and retained the source thumb strip shape plus spotlight map: `/tmp/rd-reflection-css-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-reflection-css-media`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-reflection-css-capture`.

Band snapshot from `/tmp/rd-reflection-css-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0014` | `-0.0011` |
| Mobile source -> rebuild | `-0.0130` | `+0.0096` |

Decision: keep the source `i1` CSS sizing correction. It reduces the mobile max-horizontal-delta residual compared with the previous helper-pass batch while preserving project media. Phase 1 remains open because mobile center luma and strict `VA/GA`/projection feel are still unresolved.

### S1-93 Source `Lu` Main Mip/Fluid Resize Ownership

This batch aligned a grouped `Lu/kA/I1` render-manager sizing residual. It did not change shader formulas, project data, route transitions, or project media mapping.

Source evidence:

- Source `Lu.resize(e,t,n)` first converts CSS size to DPR render size via `e=Math.round(e*n), t=Math.round(t*n)`.
- Source then sizes `renderTargetA` and `renderTargetComposite` at full render size.
- Source then switches to `e=Fa(e)/4, t=Fa(t)/4` before luminosity, bloom mip, and fluid sizing.
- Source fluid uses `fluidSimulation.onResize(e/3,t/3)` from that quarter-power-of-two size.
- Source `Lu.initRenderer()` creates `renderTargetA` from a no-depth target and then sets only `renderTargetA.depthBuffer=true`; `Lo` render targets remain depthless.

Runtime and tooling changes:

- Main render-manager bloom sizing now uses the same source `Fa(renderSize)/4` start as work `kA/Lu`, instead of the rebuild-only half-resolution start.
- Main fluid sizing now uses `Fa(renderSize)/4/3`, matching source `Lu.resize()`, instead of `Fa(renderSize)/2/3`.
- `__rogierOutputProbe` now reports work/main render-manager sizing mode, bloom start size, fluid sizing mode, mouse-sim scale, and primary depth-buffer ownership.
- `scripts/audit-renderer-output.mjs` now checks the source `Lu.resize()` quarter-size and fluid resize anchors; its source excerpt window was expanded so these anchors are not truncated.

Verification:

- `git diff --check` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- Home output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-lu-sizing-output`.
- Output probe confirms work bloom starts at `256x128` for a `1440x900` render size, work primary depth is `true`, main primary depth is `false`, and main fluid targets are now `85x43` (`Fa(1440)/4/3` by `Fa(900)/4/3`).
- Renderer audit confirms source `Lu` contains `renderTargetA.depthBuffer=true`, `e=Fa(e)/4,t=Fa(t)/4`, and `fluidSimulation.onResize(e/3,t/3)`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-lu-sizing-project`.
- Full source-vs-rebuild capture passed for home desktop/mobile, about desktop, `/gc-2026/`, and `/hashgraph-vc/` with no failed requests or runtime exceptions: `/tmp/rd-lu-sizing-capture`.

Band snapshot from `/tmp/rd-lu-sizing-capture`:

| Pair | Center-band luma delta | Max horizontal delta delta |
| --- | ---: | ---: |
| Desktop source -> rebuild | `+0.0013` | `-0.0030` |
| Mobile source -> rebuild | `-0.0127` | `+0.0134` |

Decision: keep the source `Lu` sizing correction. This removes a real source render-manager ownership divergence and keeps project media stable. Phase 1 remains open because the mobile/fog-bed residual and strict `VA/GA`/projection feel are still unresolved.

### S1-233 Source `C1` Resize Vector Runtime Surface

This batch aligned the source `U1 -> C1.resize` vector runtime surface. It did not change shader formulas, visual constants, project data, route transitions, or project media mapping.

Source evidence:

- Source `U1.resize(e,t,n)` calls `super.resize(e,t,n),this.renderManager.compositeMaterial.resize(e,t)`, passing CSS viewport dimensions into `C1.resize`.
- Source `C1.resize(e,t)` only writes `this.uniforms.uContainerSize.value.set(e,t)`.
- Source `C1` constructs `uDisplacementSize:new I(new Q)` and `uContainerSize:new I(new Q)`, so both vector defaults are `[0,0]`.
- Source `uDisplacementSize` has no mirrored runtime write, and source `A1` does not sample it.
- Source `O1/k1` displacement render-target sizing remains separate: `this.renderManager.resize(t/10,t/10,n)`.

Runtime and tooling changes:

- `C1.uDisplacementSize` and `C1.uContainerSize` now initialize to `[0,0]`.
- `resize()` now writes `C1.uContainerSize` from CSS `width,height` instead of DPR render size.
- The rebuild-only runtime write to `C1.uDisplacementSize` was removed.
- Displacement raw/composite render targets still resize to `height/10`, matching source `O1/k1`.
- Output probes now assert `source-U1-C1-resize-css-width-height`, desktop/mobile CSS vector values, and the source `[0,0]` `uDisplacementSize` default.
- Renderer audit now checks source `C1.resize`, rebuild CSS-size write, source vector defaults, and absence of a runtime `C1.uDisplacementSize` write.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and reports all new `C1` source/rebuild anchors true.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-c1-resize-desktop`.
- Desktop output probe reports `C1.uContainerSize=[1440,900]` and `C1.uDisplacementSize=[0,0]`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-c1-resize-mobile`.
- Mobile output probe reports `C1.uContainerSize=[390,844]` and `C1.uDisplacementSize=[0,0]`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-c1-resize-media`.

Decision: keep the source `C1` resize vector correction. Phase 1 remains open because this only closes a runtime uniform-surface mismatch; `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity are still unresolved.

### S1-234 Source `rt` Object3D Container Surface

This batch aligned source `rt` container identity across the Home WebGL hierarchy. It did not change shader formulas, visual constants, target sizing, lighting values, route transitions, project data, or project media mapping.

Source evidence:

- Source `p1` constructs `this.blocksWrap=new rt,this.sceneWrap=new rt`.
- Source `IT` constructs `this.group=new rt,this.rotateGroup=new rt,this.innerGroup=new rt`.
- Source `a1 extends rt`, `i1 extends rt`, and `h1 extends rt`.
- Source `w1 extends rt` and constructs `this.scrollWrap=new rt`.
- Source `GA extends rt` and constructs `this.rotationWrap=new rt`.
- In the mirrored Three r164 bundle, source `rt` is the base `Object3D` surface, not `Group`.

Runtime and tooling changes:

- Source `rt` containers in `src/client/webgl.ts` now use `Object3D`: home `sceneWrap`/`blocksWrap`, thumb `thumbWrap`/`thumbScrollWrap`, floor group/reflector, environment group, camera controller chain, per-work `group`/`rotationWrap`, and auxiliary block wraps.
- `characterModelRoot` remains `Group`; this batch did not establish source evidence for that model-root surface.
- Output probes now report/assert source `Object3D` types for the camera controller chain, floor hierarchy, environment hierarchy, reflection `sceneWrap`, and floor reflector.
- Thumb probe now reports/asserts `thumbObjectMode=source-w1-rt-object3d-scrollWrap`, `thumbWrapType=Object3D`, and `thumbScrollWrapType=Object3D`.
- Renderer audit now checks matching source `rt` anchors for `p1`, `IT`, `a1/i1`, `h1`, `w1`, and `GA`, plus rebuild `Object3D` markers.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/probe-thumb-spotlight.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-rt-object3d-output`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-rt-object3d-mobile-output`.
- Thumb spotlight probe passed with source `Object3D` thumb wraps and no failures/exceptions/console messages: `/tmp/rd-rt-object3d-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-rt-object3d-media`.

Decision: keep the source `rt` container correction. Phase 1 remains open because this only closes a structural object-identity mismatch; `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity are still unresolved.

### S1-235 Renderer Audit Source-Window Cleanup

This batch cleaned up renderer-audit false negatives found after S1-234. It did not change runtime code, shader formulas, visual constants, target sizing, project data, route transitions, or project media mapping.

Source/tooling evidence:

- Fresh shader dump at `/tmp/rd-phase1-next-shader` reports the focused Phase 1 shader set as source-shaped, including `VA-work`, `OA-work-composite`, `A1-pre-composite`, `u1-environment`, floor, thumb, media, and main-fluid helper shaders.
- `node scripts/audit-renderer-output.mjs` still had false values in source-manager checks that were not actual runtime mismatches:
  - `p1EnvironmentHierarchy` looked for `blocksWrap/new rt` in an excerpt that started too late.
  - `thumbE1.ownership` used a texture-manager excerpt that ended before `preloadThumbs()` and a too-exact rebuild method signature check.
  - `environmentU1` and `skyZ1` checked expanded shader helper functions inside class excerpts rather than raw shader templates.
  - `mainI1.screenOwnership.rebuildNoSharedPassMaterialFields` rejected the source-gated optional `mainLensflareMaterial` creation call even though the old shared lensflare field is gone.

Runtime and tooling changes:

- Widened the source `p1` and texture-manager excerpt windows used by renderer audit.
- Added raw `l1` and `B1` template extraction to verify environment/sky helper placeholders on the shader surface, while leaving `u1/z1` class checks focused on constructor and material binding ownership.
- Relaxed the thumb preload rebuild check to match the stable async method name and behavior instead of the exact `private` method signature.
- Removed the stale negative check for `this.mainLensflareMaterial = this.createLensflareMaterial();` while continuing to reject old shared pass-material fields.

Verification:

- `node --check scripts/audit-renderer-output.mjs` passed.
- `node scripts/audit-renderer-output.mjs` passed.
- Recursive false-value review of the generated audit now shows only expected negative/default evidence: source `A1` lacking tonemapping, rebuild source-negative legacy A1 checks, inert-source-computation flags, and Three render-target defaults with `depthBuffer`, `stencilBuffer`, or `generateMipmaps` set to `false`.

Decision: keep the audit cleanup so future completion checks use accurate source evidence. Phase 1 remains open because this is QA/evidence cleanup only; `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity are still unresolved.

### S1-236 `Lu/Na` Work Blur Resize Resolution

This batch aligned the optional source `Lu` blur resize surface. It does not change default Home output because source `kA.initSettings()` keeps `blur.enabled=false`, and it does not change shader formulas, target ownership, visual constants, route state, or project media mapping.

Source evidence:

- Source `Lu.resize(e,t,n)` enters the blur branch only when `this.settings.blur.enabled`.
- In that branch, source `Lu` sizes `renderTargetBlurA` and `renderTargetBlurB` from CSS width/height times `settings.blur.scale`.
- The same source branch writes CSS viewport dimensions into both standard blur materials: `this.hBlurMaterial.uniforms.uResolution.value.set(e,t)` and `this.vBlurMaterial.uniforms.uResolution.value.set(e,t)`.
- Source `kA.initSettings()` keeps `blur.enabled=false`, so the branch is source-owned but inactive in the default Home work render manager.

Runtime and tooling changes:

- `src/client/webgl.ts` now writes `width,height` into `workBlurHorizontalMaterial.uniforms.uResolution` and `workBlurVerticalMaterial.uniforms.uResolution` inside the source work blur-enabled branch.
- Output probes now expose `source-Lu-Na-resize-css-width-height-when-blur-enabled` for work standard blur materials and retain `source-I1-Na-resize-css-width-height-when-blur-enabled` for main standard blur materials.
- `scripts/probe-output-color.mjs` now asserts those standard blur resize-mode markers and verifies the blur `uResolution` vectors are present.
- `scripts/audit-renderer-output.mjs` now checks the source `Lu.resize` blur-resolution anchors and the rebuild work blur writes.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-lu-blur-resolution-output`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-lu-blur-resolution-mobile`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-lu-blur-resolution-media`.

Decision: keep the source `Lu` optional blur resize correction. Phase 1 remains open because this only closes an inactive default-branch source mismatch; actual `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution parity are still unresolved.

### S1-237 `yD/w1` Thumb Progress Update Order

This batch aligned the source gallery update order around thumb projection content. It does not change formulas, constants, target ownership, shader text, project data, route state, or media mapping.

Source evidence:

- Source `yD.updateScene(e)` applies `J.workScene.sceneWrap.rotation.y=_a.degToRad(this.scroll.progress*360+180)`.
- It then writes `J.mainScene.renderManager.compositeMaterial.uniforms.uTransformX.value=this.scroll.progress*1`.
- It then calls `J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)`.
- Only after the thumb-progress update does source compute/apply work-scene roll and zoom: `J.workScene.scene.rotation.z=_a.degToRad(this.sceneRotation)` and `J.workScene.scene.position.z=J.workScene.scene.rotation.z-this.zoom`.

Runtime and tooling changes:

- `setGalleryProgress()` now updates `sceneWrap.rotation.y`, then calls `updateThumbGallery(-progress)`, then computes/applies source roll and zoom smoothing.
- Thumb probe now exposes `sourceProgressUpdateOrder=source-yD-sceneWrap-uTransformX-thumbProgress-before-roll-zoom`.
- `scripts/probe-thumb-spotlight.mjs` asserts that marker while retaining the existing nonzero-progress thumb wrap and spotlight-map checks.
- `scripts/audit-renderer-output.mjs` now checks the source and rebuild relative order for sceneWrap/uTransformX/thumb-progress before roll/zoom.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-thumb-spotlight.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed.
- Thumb spotlight probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-thumb-progress-order`.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-thumb-progress-order-output`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-thumb-progress-order-media`.

Decision: keep the source `yD/w1` progress update order. Phase 1 remains open because this is a narrow projection-content ordering correction; actual spotlight/thumb transfer feel, `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution parity are still unresolved.

### S1-238 `nD/C1` Main Mouse-Sim Binding Timing

This batch aligned the source timing for the main pre-composite mouse-sim input. It does not change shader formulas, visual constants, target sizing, route state, project data, or project-media mapping.

Source evidence:

- Source `nD.init()` waits for the initial resize delay, then assigns `this.mainScene.renderManager.compositeMaterial.uniforms.tMouseSim.value=this.workScene.renderManager.mouseSimulation.bufferSim.output.texture`.
- Source `C1.update(e,t,n)` only writes `this.uniforms.uTime.value=e`.
- No source path in `C1.update()` or default `I1.update()` reassigns `C1.tMouseSim` to the current ping-pong output each frame.

Runtime and tooling changes:

- The rebuild now calls `bindSourceMainMouseSimulationTexture()` once after creating the two screen mouse-sim targets.
- The frame loop no longer writes `this.preCompositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture`.
- Output probe now exposes `tMouseSimBindingMode=source-nD-init-one-time-C1-tMouseSim-initial-work-mousesim-output`, confirms `C1.tMouseSim` is bound to the initial screen mouse-sim target, and records the current ping-pong index for attribution.
- `scripts/audit-renderer-output.mjs` now checks the source `nD.init()` assignment, the rebuild one-time binder marker, and absence of the per-frame C1 mouse-sim rebind.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-c1-mousesim-binding-output`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-c1-mousesim-binding-mobile`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-c1-mousesim-binding-media`.
- Interactive mouse probe passed with source-shaped screen/local mouse response and main-fluid pointer response: `/tmp/rd-c1-mousesim-binding-interactive`.

Decision: keep the source one-time `C1/A1.tMouseSim` binding. Phase 1 remains open because this narrows one transfer-input timing mismatch but does not close the broader `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, or floor/environment distribution gaps.

### S1-239 `nD/C1` Main Cross-Scene Input Bindings

This batch extends the source `nD.init()` input-binding timing from `C1.tMouseSim` to the whole cross-scene `C1/A1` input group. It does not change shader formulas, visual constants, render-target sizing, route state, project data, or project-media mapping.

Source evidence:

- Source `nD.init()` waits for the initial resize delay, then assigns `this.mainScene.renderManager.compositeMaterial.uniforms.tWork.value=this.workScene.renderManager.renderTargetComposite.texture`.
- In the same source block, `tMedia` is assigned once to `this.mediaScene.renderManager.renderTargetComposite.texture`.
- In the same source block, `tMouseSim` is assigned once to `this.workScene.renderManager.mouseSimulation.bufferSim.output.texture`.
- Source `C1.update(e,t,n)` only writes `this.uniforms.uTime.value=e`.

Runtime and tooling changes:

- `bindSourceMainCompositeInputs()` now binds `C1.tWork` to `workCompositeTarget.texture`, `C1.tMedia` to `mediaTarget.texture`, and `C1.tMouseSim` to the initial screen mouse-sim target after resize.
- The production frame loop no longer reassigns `preCompositeMaterial.uniforms.tWork` to the source work composite target.
- The production frame loop no longer reassigns `preCompositeMaterial.uniforms.tMedia` to the media composite target.
- The existing raw-work path remains only behind the explicit `debug-pass-order=raw-work-composite` diagnostic.
- Output probe now exposes and asserts `tWorkBindingMode=source-nD-init-one-time-C1-tWork-work-renderTargetComposite`, `tMediaBindingMode=source-nD-init-one-time-C1-tMedia-media-renderTargetComposite`, and the existing source `tMouseSim` binding marker.
- `scripts/audit-renderer-output.mjs` now checks source `nD.init()` anchors for all three bindings, the rebuild one-time binder marker, and absence of the old production rebind bridges.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed.
- Desktop output probe passed with source binding markers and target identities for `tWork`, `tMedia`, and `tMouseSim`, with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-c1-cross-input-output`.
- Mobile output probe passed with source binding markers and target identities for `tWork`, `tMedia`, and `tMouseSim`, with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-c1-cross-input-mobile`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-c1-cross-input-media`.
- Interactive mouse probe passed with source-shaped screen/local mouse response and main-fluid pointer response: `/tmp/rd-c1-cross-input-interactive`.

Decision: keep the source one-time `C1/A1` cross-scene input bindings. Phase 1 remains open because this narrows transfer-input ownership but does not close the broader `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, or floor/environment distribution gaps.

### S1-240 Renderer Audit `C1` Frame-Loop Rebind Scope

This batch fixes a static renderer-audit false positive introduced after S1-239. It does not change runtime code, shader formulas, visual constants, render-target sizing, route state, project data, or project-media mapping.

Source evidence:

- Source `nD.init()` assigns `C1.tWork`, `C1.tMedia`, and `C1.tMouseSim` once after the initial resize delay.
- Source `C1.update(e,t,n)` only writes `this.uniforms.uTime.value=e`.
- Therefore the audit should reject production frame-loop rebinds for those `C1/A1` inputs, but should not reject the source one-time binder itself.

Tooling change:

- `scripts/audit-renderer-output.mjs` now extracts the rebuild `private tick` block as the frame-loop scope.
- `noPerFrameTWorkCompositeRebind`, `noPerFrameTMediaRebind`, and `noPerFrameTMouseSimRebind` now inspect that frame-loop scope instead of searching the full `src/client/webgl.ts` file.
- This preserves rejection of production frame-loop `C1` rebind bridges while allowing the source one-time `bindSourceMainCompositeInputs()` assignments.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-renderer-audit-s240-final.json`.
- Recursive false/null review reports `falseOrNull=19`; the stale `sourceManagers.C1.rebuildChecks.noPerFrameTMediaRebind=false` entry is gone, and remaining false/null entries are the expected source-negative/default evidence already tracked by the audit.

Decision: keep renderer audit per-frame checks scoped to the actual frame loop. Phase 1 remains open because this cleans evidence quality for the `C1/A1` transfer-input chain but does not close the broader `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, or floor/environment distribution gaps.

### S1-241 Source-Null Composite Sampler Ownership

This batch aligned constructor/default sampler ownership for the composite materials. It does not change shader formulas, visual constants, render-target sizing, route state, project data, or project-media mapping.

Source evidence:

- Source `C1` constructs its sampler uniforms as `tScene:new I(null), tWork:new I(null), tMedia:new I(null), tBloom:new I(null), tBlur:new I(null), tFluid:new I(null), tPortal:new I(null), tMouseSim:new I(null)`.
- Source `OA`, `lA`, and `W1` likewise construct `tScene`, `tBloom`, `tBlur`, `tFluid`, and `tMouseSim` with `new I(null)`.
- Source `_1` constructs `tScene:new I(null)` for the thumb composite.
- Source `Lu.update()` assigns `this.compositeMaterial.uniforms.tBloom.value=d[0].texture` only inside `this.settings.bloom.enabled`.
- Source `I1.update()` assigns `this.compositeMaterial.uniforms.tBloom.value=u[0].texture` only inside `this.settings.bloom.enabled`; default source `I1.bloom.enabled=false`.

Runtime and tooling changes:

- `createCompositeMaterial()`, `createPreCompositeMaterial()`, `createMainCompositeMaterial()`, `createMediaCompositeMaterial()`, and `createThumbCompositeMaterial()` now initialize their source sampler uniforms to `null` where the mirrored source uses `new I(null)`.
- The source one-time `nD.init()` ownership for `C1.tWork`, `C1.tMedia`, and `C1.tMouseSim` is unchanged.
- Work `OA.tBloom` is now assigned inside the work bloom branch, matching source `Lu.update()`.
- Main `C1.tBloom` is now assigned only inside the optional main bloom branch, matching source `I1.update()` and leaving default-disabled `C1.tBloom` constructor-null.
- Default-disabled/unused `C1.tPortal` and `C1.tBlur` now remain source-null instead of placeholder-bound.
- Output probes now expose/assert `samplerConstructorMode=source-C1-sampler-uniforms-construct-null-branch-owned-bindings`, `tBloomBindingMode=source-I1-bloom-branch-only`, source-null `tPortal/tBlur`, and source fluid branch ownership.
- `scripts/audit-renderer-output.mjs` now checks the source `new I(null)` constructor surfaces and the rebuild branch-owned bloom markers.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-renderer-audit-null-sampler.json`.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-null-sampler-output-desktop`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-null-sampler-output-mobile`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-null-sampler-project-media`.
- Thumb spotlight probe passed and retained source thumb strip/spotlight map guardrails: `/tmp/rd-null-sampler-thumb`.

Decision: keep the source-null sampler constructor ownership and branch-owned bloom bindings. Phase 1 remains open because this narrows transfer-input ownership but does not close the broader `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, or floor/environment distribution gaps.

### S1-242 `Lo/g1/z1/N1` Source-Null `tScene` Constructor Ownership

This batch aligned constructor/default `tScene` ownership for the simple `Lo` composite render managers. It does not change shader formulas, visual constants, render-target sizing, route state, project data, or project-media mapping.

Source evidence:

- Source `g1` constructs `uniforms:{tScene:new I(null)}`.
- Source `z1` constructs `uniforms:{tScene:new I(null),uTime:new I(0),...}` for the sky composite material.
- Source `N1` constructs `uniforms:{tScene:new I(null),uRatio:new I(1),uTime:new I(0)}` for the wavves/displacement composite material.
- Source `Lo.update()` renders the raw scene into `renderTargetA`, stores that target as `c`, then assigns `this.compositeMaterial.uniforms.tScene.value=c.texture` before rendering the composite screen pass into `renderTargetComposite`.

Runtime and tooling changes:

- `createSkyCompositeMaterial()` now initializes `tScene` to `null` instead of prebinding `skyRawTarget.texture`.
- `createDisplacementMaterial()` now initializes `tScene` to `null` instead of prebinding `displacementRawTarget.texture`.
- The runtime sky and displacement composite passes still bind `tScene` to `skyRawTarget.texture` and `displacementRawTarget.texture` before rendering through their source `Lo` screen-material swap.
- Output probes now expose/assert `tSceneConstructorMode=source-z1-tScene-construct-null-Lo-update-binds-raw` and `tSceneConstructorMode=source-N1-tScene-construct-null-Lo-update-binds-raw`, plus raw-target identity checks.
- `scripts/audit-renderer-output.mjs` now checks source `g1/z1/N1` constructor anchors and rebuild raw-target binding markers for sky and displacement.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-renderer-audit-lo-null-final.json`.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-lo-null-output-desktop`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-lo-null-output-mobile`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-lo-null-project-media`.
- Thumb spotlight probe passed and retained source thumb strip/spotlight map guardrails: `/tmp/rd-lo-null-thumb`.

Decision: keep the `Lo`-derived simple composite `tScene` uniforms constructor-null and runtime-bound to the raw target. Phase 1 remains open because this narrows constructor/input ownership but does not close the broader `kA/Lu/I1` transfer interpretation, spotlight/thumb transfer feel, or floor/environment distribution gaps.

### S1-243 `Lu/I1` Helper Pass Source-Null Input Ownership

This batch aligned constructor/default input sampler ownership for the `Lu/I1` helper pass materials and mirrored the optional work FXAA branch. It does not change shader formulas, visual constants, route state, project data, or project-media mapping.

Source evidence:

- Source `ig` constructs `uniforms:{tMap:new I(null),uResolution:new I(new Q)}`.
- Source `sg` constructs `uniforms:{tMap:new I(null),uThreshold:new I(1),uSmoothing:new I(1)}`.
- Source `Na` constructs `uniforms:{tMap:new I(null),uBluriness:new I(0),uDirection:new I(e),uResolution:new I(new Q)}`.
- Source `rg` constructs `uniforms:{tMap:new I(null),tDetail:new I(null),tOverview:new I(null),tOverviewMask:new I(null),uDirection:new I(new Q(.5,.5)),uResolution:new I(new Q)}`.
- Source `cg` constructs `tBlur1..5` and `uBloomFactors` with `new I(null)`, then source `Lu/I1.initRenderer()` assigns the vertical bloom target textures and bloom factors after construction.
- Source `L1` constructs `tMap:{value:null}` for the optional main lensflare material.
- Source floor-reflection `t1` constructs `uniforms:{tMap:new I(null),uDirection:new I(new Q(1,0)),uResolution:new I(new Q)}`.
- Source `Lu.resize()` writes the FXAA target size and `FxaaMaterial.uResolution` only when `settings.fxaa.enabled`; source `Lu.update()` renders the composite material to `renderTargetFXAA`, binds `FxaaMaterial.tMap` to that texture, swaps the screen material, then renders to `renderTargetComposite`.

Runtime and tooling changes:

- `createLensflareMaterial()`, `createLuminosityMaterial()`, `createBloomBlurMaterial()`, `createBlurMaterial()`, `createFloorReflectionBlurMaterial()`, and `createFxaaMaterial()` now initialize their input `tMap` sampler to `null` where source does.
- `createBloomCompositeMaterial()` now constructs `tBlur1..5` and `uBloomFactors` as `null`, then performs the source-shaped post-constructor bindings to the vertical bloom targets and computed factors before returning the material.
- Work FXAA now mirrors source `Lu`: resize writes `workFxaaMaterial.uniforms.uResolution`, and the work composite path renders to `workFxaaTarget`, binds `workFxaaMaterial.uniforms.tMap`, swaps `workPostScreen.material`, then renders to `workCompositeTarget`.
- Output probes now expose/assert source constructor markers for `sg`, `Na`, `rg`, `cg`, `ig`, and floor `t1`, plus work/main FXAA screen and resize ownership markers.
- `scripts/audit-renderer-output.mjs` now checks source `ig/sg/Na/rg/cg/L1/t1` constructor-null anchors, rebuild factory ownership, old constructor prebind absence, and source/rebuild `Lu` FXAA branch anchors.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-renderer-audit-pass-null-check.json`; recursive false/null review stayed at the expected `19` source-negative/default entries.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-pass-null-output-desktop`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-pass-null-output-mobile`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-pass-null-project-media`.
- Thumb spotlight probe passed and retained source thumb strip/spotlight map guardrails: `/tmp/rd-pass-null-thumb`.

Decision: keep the helper pass input samplers constructor-null and runtime-bound by the owning optional branch or `initRenderer()` step. Phase 1 remains open because this narrows `Lu/I1` input ownership and optional FXAA branch parity but does not close the broader transfer/composite interpretation, spotlight/thumb transfer feel, or floor/environment distribution gaps.

### S1-247 `Lu/I1` Optional `Na` Blur Update Ownership

This batch aligned the optional `Na` standard-blur update path for the source work/main render managers. The source `kA` and default `I1` settings keep blur disabled, so this is default-inactive source parity rather than a visual tuning change.

Source evidence:

- Source `Lu.update()` renders optional work blur as `renderTargetA -> renderTargetBlurA -> renderTargetBlurB`.
- Source `Lu.update()` feeds `luminosityMaterial.tMap` and final `compositeMaterial.tScene` from `renderTargetBlurB` only when `settings.blur.enabled`, otherwise from `renderTargetA`.
- Source `Lu.update()` starts the bloom chain from `renderTargetBright` when luminosity is enabled, otherwise from raw `renderTargetA`; it does not use `renderTargetBlurB` as the non-luminosity bloom source.
- Source `Na` constructs `uBluriness` with `new I(0)`, and the mirrored bundle has no `settings.blur.strength` runtime write in either `Lu.update()` or `I1.update()`.

Runtime and tooling changes:

- Added `renderWorkBlurPass()` using the existing source-style `workPostScreen` material swap, rendering work raw to `workBlurTargetA` and then to `workBlurTargetB`.
- Work luminosity now takes a separate source target, so blur-enabled luminosity can read `workBlurTargetB` while the bloom chain still receives raw `workRawTarget` unless luminosity produced a bright target.
- Work `OA.tScene` now uses the source blur-or-raw target expression.
- Removed the rebuild-only main optional blur `uBluriness = settings.blur.strength` writes; `Na.uBluriness` stays at the source constructor value `0`.
- Output probes now expose/assert `work.renderManagerPassInputs` markers and `blurinessUpdateMode=source-Na-uBluriness-init-zero-no-update-write` for work/main standard blur materials.
- `scripts/audit-renderer-output.mjs` now checks source/rebuild work blur branch anchors, `Lu/I1` init-only `Na.uBluriness` evidence, and the updated work bloom/luminosity input shape.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-lu-blur-update-audit.json`; recursive false/null review stayed at the expected `19` source-negative/default entries.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-lu-blur-update-output-desktop`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-lu-blur-update-output-mobile`.
- Thumb spotlight probe passed and retained source thumb strip/spotlight map guardrails: `/tmp/rd-lu-blur-update-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-lu-blur-update-media`.

Decision: keep optional `Na` blur update ownership source-shaped and do not reintroduce runtime `blur.strength` writes without bundle evidence. Phase 1 remains open because this closes a default-inactive optional branch mismatch only; the broader `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution gaps remain unresolved.

### S1-248 `Lu/Ka` Screen Mouse Simulation Sizing

This batch aligned source screen mouse-simulation target sizing. It does not change shader formulas, visual constants, route state, project data, or project-media mapping.

Source evidence:

- Source `Lu.resize(e,t,n)` rounds the work render size for DPR and then, when `settings.mousesim.enabled`, calls `this.mouseSimulation.onResize(e/10,t/10)`.
- Source `Lu.resize(e,t,n)` has no `Math.round(e/10)` or `Math.round(t/10)` post-division sizing step.
- Source `Ka.onResize(e,t)` directly forwards those values to `bufferSim.onResize(e,t)` and `simulationMaterial.uniforms.uCoords.value.set(e,t)`.

Runtime and tooling changes:

- Work screen mouse-sim targets now use `workRenderWidth / SCREEN_MOUSE_SIM_SCALE` and `workRenderHeight / SCREEN_MOUSE_SIM_SCALE`, with only the existing minimum size clamp.
- This preserves source-shaped non-integer target sizes when the source path produces them, for example mobile `390 / 10 = 39` and `844 / 10 = 84.4`.
- Runtime probes now expose `expectedTargetSize`, `targetSizingMode=source-Lu-mousesim-render-size-div-10-no-post-rounding`, `targetSizeMatchesSource`, and `uCoordsMatchesSource`.
- Output and interactive mouse probes now assert the source-shaped target size and `uCoords` surface.
- `scripts/audit-renderer-output.mjs` now checks the source `Lu` `onResize(e/10,t/10)` anchor, rejects the old rebuild post-rounding path, and checks the source `Ka.onResize(e,t)` direct buffer/`uCoords` binding.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/probe-interactive-mouse.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-screen-mousesim-sizing-audit.json`; recursive false/null review stayed at the expected `19` source-negative/default entries.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-screen-mousesim-sizing-output-desktop`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors and confirmed the source-shaped non-integer path: `/tmp/rd-screen-mousesim-sizing-output-mobile`.
- Interactive mouse probe passed with source-shaped screen/local mouse response and no browser failures, runtime exceptions, or console messages: `/tmp/rd-screen-mousesim-sizing-interactive`.
- Thumb spotlight probe passed and retained source thumb strip/spotlight map guardrails: `/tmp/rd-screen-mousesim-sizing-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-screen-mousesim-sizing-media`.

Decision: keep the source `Lu/Ka` no-post-rounding screen mouse-simulation sizing. Phase 1 remains open because this closes a narrow render-manager sizing mismatch only; the broader `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution gaps remain unresolved.

### S1-249 `yD/onProjectActive` Active Project Reveal Ownership

This batch aligned active-project reveal ownership. It does not change visual constants, shader formulas, project data, project-media mapping, gallery enter/out timing, or `uRevealProject` gallery ownership.

Source evidence:

- Source `yD.onProjectActive(e)` computes the active project index and calls `Se.setRevealSpread(0)`.
- Source `yD.onProjectActive(e)` tweens inactive `J.workScene.blocks` `a.instance.material.customUniforms.uReveal` to `0` with `duration:1.6` and `ease:"power4.out"`.
- Source `yD.onProjectActive(e)` tweens the active block `customUniforms.uReveal` to `1` with `delay:.2`, `duration:4`, and `ease:"power4.out"`.
- The active-project source excerpt does not mention `uRevealProject`; that uniform remains owned by gallery enter/out reveal paths.

Runtime and tooling changes:

- `setProjectBlockReveal(active)` now only kills/recreates active-project `uReveal` tweens.
- `setProjectBlockReveal(active)` no longer kills or clears `projectRevealProjectTweens`.
- `setProjectBlockReveal(active)` no longer creates a `uRevealProject` tween.
- Runtime probes now expose `activeProjectRevealOwnership=source-yD-onProjectActive-uReveal-only-uRevealProject-owned-by-gallery-enter-out`, `activeProjectRevealTweenCount`, and informational `revealProjectTweenCount`.
- `scripts/probe-output-color.mjs` now asserts the active reveal ownership marker and that `activeProjectRevealTweenCount` matches `p1UpdateCulling.total`.
- `scripts/audit-renderer-output.mjs` now extracts source `yD.onProjectActive()` and rebuild `setProjectBlockReveal()`, checks source/rebuild `uReveal` active reveal anchors, and rejects active-reveal `uRevealProject` / `projectRevealProjectTweens` ownership.

Verification:

- `git diff --check` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-active-reveal-audit.json`; recursive false/null review stayed at the expected `19` source-negative/default entries.
- Desktop output probe passed with `activeProjectRevealOwnership=source-yD-onProjectActive-uReveal-only-uRevealProject-owned-by-gallery-enter-out`, `activeProjectRevealTweenCount=10`, and `p1UpdateCulling.total=10`: `/tmp/rd-active-reveal-output-desktop`.
- Mobile output probe passed with the same ownership marker and `activeProjectRevealTweenCount=10`: `/tmp/rd-active-reveal-output-mobile`.
- Thumb spotlight probe passed and retained source thumb strip/spotlight map guardrails: `/tmp/rd-active-reveal-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-active-reveal-media`.

Decision: keep active-project reveal scoped to source `uReveal` tweens. Do not reintroduce active-path `uRevealProject` ownership unless mirrored-bundle evidence shows that source path writing it. Phase 1 remains open because this closes a narrow reveal-ownership mismatch only; the broader `kA/Lu/I1` transfer/composite interpretation, spotlight/thumb transfer feel, and floor/environment distribution gaps remain unresolved.

### S1-250 `Se` Thumb State Tween Ownership

This batch aligned source `Se.settings.thumb` tween ownership. It does not change thumb shader formulas, work item geometry, project data, spotlight constants, or visual transfer constants.

Source evidence:

- Source `Se.init()` initializes `settings.thumb` with `darknessIntensity:0`, black `darknessColor`, `saturation:1`, and `mouseLightness:1`.
- Source `Se.setThumbDarknessIntensity(e,t)` tweens `this.settings.thumb.darknessIntensity` and writes `uDarkenIntensity` in `onUpdate`.
- Source `Se.setThumbDarknessColor(e,t)` parses string colors through `sr(e)`, tweens `this.settings.thumb.darknessColor`, and writes `uDarkenColor` in `onUpdate`.
- Source `Se.setThumbSaturation(e,t)` tweens `this.settings.thumb.saturation` and writes `uSaturation` in `onUpdate`.
- Source `Se.setThumbMouseLightness(e,t)` runs one tween on `this.settings.thumb.mouseLightness` and writes every work block `uMouseLightness` from that state in `onUpdate`.

Runtime and tooling changes:

- `WebGLBackdrop` now keeps `thumbState` with the source default values.
- `setThumbDarknessIntensity()`, `setThumbDarknessColor()`, `setThumbSaturation()`, and `setThumbMouseLightness()` now tween `thumbState` and write uniforms in update callbacks.
- `setThumbMouseLightness()` now creates one state tween and fans out the state value to all work-item `uMouseLightness` uniforms.
- `__rogierThumbProbe.thumbComposite` now exposes `stateOwnership=source-Se-settings-thumb-state-onUpdate-uniforms`, the state values, `stateUniformsMatch`, and `mouseLightnessUniformsMatchState`.
- `scripts/probe-thumb-spotlight.mjs` asserts the thumb state ownership marker and state/uniform parity.
- `scripts/audit-renderer-output.mjs` extracts the four rebuild thumb setter blocks, checks the source `Se.settings.thumb` ownership anchors, and rejects old direct-uniform/per-block tween paths.

Verification:

- `git diff --check` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `node --check scripts/probe-thumb-spotlight.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-thumb-state-audit-final.json`; recursive false/null review stayed at the expected `19` source-negative/default entries.
- Thumb spotlight probe passed with `stateOwnership=source-Se-settings-thumb-state-onUpdate-uniforms`, `stateUniformsMatch=true`, and `mouseLightnessUniformsMatchState=true`: `/tmp/rd-thumb-state-thumb`.
- Desktop output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-thumb-state-output-desktop`.
- Mobile output probe passed with no failed requests, runtime exceptions, console messages, or WebGL shader errors: `/tmp/rd-thumb-state-output-mobile`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-thumb-state-media`.

Decision: keep thumb visual setters owned by source-style `Se.settings.thumb` state and update uniforms from `onUpdate`. Do not reintroduce direct composite-uniform tweens or per-block mouse-lightness tweens without mirrored-bundle evidence. Phase 1 remains open because this closes state tween ownership only; spotlight/thumb projection transfer feel, broader `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution gaps remain unresolved.

### S1-251 `Se` Light Intensity State Tween Ownership

This batch aligned source `Se.settings` light intensity tween ownership. It does not change light constants, spotlight map assignment, light positions/targets, shader formulas, render targets, or visual transfer constants.

Source evidence:

- Source `Se.init()` initializes `settings.directionalLight`, `settings.directionalLight2`, and `settings.spotLight` as nested objects with `intensity:0`.
- Source `Se.setDirectionalLightIntensity(e,t,n)` kills the previous tween, tweens `this.settings.directionalLight.intensity`, and writes `J.workScene.directionalLight.intensity=this.settings.directionalLight.intensity` in `onUpdate`.
- Source `Se.setDirectionalLight2Intensity(e,t,n)` does the same for `this.settings.directionalLight2` and `J.workScene.directionalLight2.intensity`.
- Source `Se.setSpotLightIntensity(e,t,n)` does the same for `this.settings.spotLight` and `J.workScene.spotLight.intensity`.
- The mirrored source has no separate rebuild-style scalar mirror fields for these values, such as `spotLightIntensity`, `directionalLightIntensity`, or `directionalLight2Intensity`.

Runtime and tooling changes:

- `WebGLBackdrop` now keeps `lightState` with nested `directionalLight`, `directionalLight2`, and `spotLight` objects.
- `setDirectionalLightIntensity()`, `setDirectionalLight2Intensity()`, and `setSpotLightIntensity()` now tween those nested state objects and write the actual Three light intensities in update callbacks.
- The old scalar mirror fields and `gsap.to(this, ...)` light-intensity tween paths are removed.
- `__rogierOutputProbe.workSettings.lightStateOwnership` now exposes `mode=source-Se-settings-light-state-onUpdate-intensities`, state values, and state/light parity.
- `__rogierOutputProbe.spotlightProjection.spotlight` and `__rogierThumbProbe.spotlight` expose the same state ownership marker, `stateIntensity`, and `stateIntensityMatchesLight`.
- `scripts/probe-output-color.mjs` and `scripts/probe-thumb-spotlight.mjs` assert state ownership and state/light parity.
- `scripts/audit-renderer-output.mjs` extracts the three rebuild light setter blocks, checks the source `Se.settings` light anchors, and rejects the old scalar mirror fields / direct `this` tween paths.

Verification:

- `git diff --check` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/probe-thumb-spotlight.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-light-state-audit-final.json`; recursive false/null review stayed at the expected `19` source-negative/default entries.
- Desktop output probe passed with `lightStateOwnership.mode=source-Se-settings-light-state-onUpdate-intensities`, state values `directionalLight=1.5`, `directionalLight2=1`, `spotLight=220`, and `matchesLights=true`: `/tmp/rd-light-state-output-desktop`.
- Mobile output probe passed with the same light state ownership and parity markers: `/tmp/rd-light-state-output-mobile`.
- Thumb spotlight probe passed with `stateOwnership=source-Se-settings-light-state-onUpdate-intensities`, `stateIntensity=220`, and `stateIntensityMatchesLight=true`: `/tmp/rd-light-state-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-light-state-media`.

Decision: keep light intensity setters owned by source-style `Se.settings` state and update actual Three lights from `onUpdate`. Do not reintroduce separate scalar mirror fields or direct `gsap.to(this, ...)` intensity tweens without mirrored-bundle evidence. Phase 1 remains open because this closes state tween ownership only; spotlight/thumb projection transfer feel, broader `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution gaps remain unresolved.

### S1-252 `Se` Settings Scalar/Media State Tween Ownership

This batch aligned another source `Se.settings` tween-ownership slice. It does not change visual constants, shader formulas, render targets, spotlight/thumb map wiring, or route data.

Source evidence:

- Source `Se.init()` initializes `this.settings` scalar values for `contrast`, `darken`, `saturation`, `sceneReveal`, `envRotation`, `revealSpread`, and `fluidStrength`, plus `this.settings.media.opacity`.
- Source `Se.setDarken(e,t)` writes `J.workScene.renderManager.compositeMaterial.uniforms.uDarken.value` from `this.settings.darken`, with a duration-zero direct state branch.
- Source `Se.setSaturation(e,t)` writes `J.workScene.renderManager.compositeMaterial.uniforms.uSaturation.value` from `this.settings.saturation`, with a duration-zero direct state branch.
- Source `Se.setContrast(e,t)` writes `J.mainScene.renderManager.compositeMaterial.uniforms.uContrast.value` from `this.settings.contrast`, with a duration-zero direct state branch.
- Source `Se.showScene(e,t)` tweens `this.settings.sceneReveal` and writes `C1.uReveal` from state in `onUpdate`.
- Source `Se.setEnvRotation(e,t)` writes `J.workScene.sceneWrap.rotation.x` from `this.settings.envRotation`, with a duration-zero direct state branch.
- Source `Se.setRevealSpread(e,t,n)` tweens `this.settings.revealSpread` and writes every work block `uRevealSpread` from state in `onUpdate`.
- Source `Se.setFluidStrength(e,t)` writes `C1.uFluidStrength` from `this.settings.fluidStrength`, with a duration-zero direct state branch.
- Source `Se.setMediaOpacity(e,t,n,i)` tweens `this.settings.media.opacity` and writes `C1.uMediaReveal` from state in `onUpdate`.

Runtime and tooling changes:

- `WebGLBackdrop` now keeps `settingsState` for the covered scalar/media values.
- `setDarken()`, `setSaturation()`, `setContrast()`, `showScene()`, `setEnvRotation()`, `setRevealSpread()`, `setFluidStrength()`, and `setMediaOpacity()` now tween `settingsState` or `settingsState.media` and write uniforms/rotation/fan-out from state update callbacks.
- The old standalone scalar mirror fields for this chain are removed.
- `__rogierOutputProbe.settings.work.settingsStateOwnership` exposes `mode=source-Se-settings-scalar-media-state-onUpdate`, state values, uniform parity, reveal-spread fan-out parity, and env-rotation parity.
- `scripts/probe-output-color.mjs` asserts the settings-state ownership marker and parity fields.
- `scripts/audit-renderer-output.mjs` extracts the eight rebuild setter blocks, checks source `Se.settings` scalar/media anchors, and rejects old scalar fields / direct `this` tween paths for this chain.

Verification:

- `git diff --check` passed.
- `node --check scripts/audit-renderer-output.mjs` passed.
- `node --check scripts/probe-output-color.mjs` passed.
- `node --check scripts/probe-thumb-spotlight.mjs` passed.
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` passed.
- `node scripts/audit-renderer-output.mjs` passed and wrote `/tmp/rd-settings-state-audit-final.json`; recursive false/null review stayed at the expected `19` source-negative/default entries.
- Desktop output probe passed with `settingsStateOwnership.mode=source-Se-settings-scalar-media-state-onUpdate`, uniform parity, reveal-spread fan-out parity, and env rotation parity: `/tmp/rd-settings-state-output-desktop`.
- Mobile output probe passed with the same settings-state ownership and parity markers: `/tmp/rd-settings-state-output-mobile`.
- Thumb spotlight probe passed and retained the source thumb/light state guardrails: `/tmp/rd-settings-state-thumb`.
- Project media probe passed for `/gc-2026/` and `/hashgraph-vc/`, retaining five visible media tracks on both pages: `/tmp/rd-settings-state-media`.

Decision: keep these `Se` scalar/media setters owned by source-style `Se.settings` state and update uniforms/rotation/fan-out from `onUpdate`. Do not reintroduce separate scalar mirror fields or direct `gsap.to(this, ...)` tweens for this chain without mirrored-bundle evidence. Phase 1 remains open because this closes state tween ownership only; spotlight/thumb projection transfer feel, broader `kA/Lu/I1` transfer/composite interpretation, and floor/environment distribution gaps remain unresolved.

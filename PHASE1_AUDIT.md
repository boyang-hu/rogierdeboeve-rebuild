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

Phase 1 is past the broad architecture-rebuild stage and is now in source-difference attribution. Most source-proven structural gaps are closed, but Phase 1 is not complete because source-vs-rebuild captures still show material WebGL/composite differences, especially home cube/thumb brightness and shared project-page composite brightness.

Estimated status:

- Architecture parity: 88-90%
- Shader/render-manager parity: 75-80%
- Final home visual parity: 65-70%
- Runtime stability: currently good based on build, marker checks, and Chrome CDP smoke across home, about, and two project pages

The rebuild now has the correct broad shape: `sceneWrap -> blocksWrap -> GA`, source-sized grids, MeshStandardMaterial with source-style shader patching, real `SpotLight.map`, thumb render target, A1/OA split composite passes, bloom mip chains, Ka-style ping-pong mouse simulation, per-work-item local mouse simulation, source-shaped floor/environment bridges, and about/floating auxiliary blocks.

The remaining risk is concentrated in fine-grained shader behavior, render-target/color output, source material details, and visual validation of spotlight/thumb projection and mouse/fluid feel. Phase 2 should not start until Phase 1 either reaches visual acceptance or records explicit accepted deviations for the remaining home WebGL differences.

## Decision Checkpoint

The previous goal was directionally right, but too broad for the current state. "Rebuild the whole site 1:1" is useful as the overall goal; for execution, Phase 1 should now be treated as the active goal until closed. Project detail pages are closer and should remain regression checks, not the main target of new risky rendering changes.

Recommended cadence:

- Do not attempt the rest of Phase 1 in one pass. The remaining work is coupled enough that a large shader/render-manager pass can pass build while making visual attribution worse.
- Do 6-10 differences per batch only when they are low-risk constants, ownership, documentation, or route-state corrections in one chain.
- Do 3-5 differences per batch for shader, render-target, render-order, or material-replacement changes.
- Run full QA and commit once per batch, not once per tiny sub-step.

Current next batch: a focused `S1-08/S1-09/S1-17` attribution batch around ordinary `VA` color/light semantics, spotlight-map contribution, and renderer color-output assumptions. The first candidate implementation should be small: verify and align ordinary `VA` diffuse raw-color semantics before touching auxiliary `WA/XA` or attempting a full `HA/zA` replacement.

## Phase 1 Remaining Execution Audit

This table is the current working board for completing Phase 1. It supersedes the older scattered "next batch" notes below without deleting their evidence history.

| Priority | ID | Chain | Source evidence summary | Rebuild status | Risk | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | S1-08A | Ordinary `VA` color semantics | Source `VA.createCube()` seeds the material with `new Color("#808080")`; source runtime setters parse hex through `sr()` as raw channel values. Under local Three 0.184, `new Color("#808080")` becomes linear `~0.216`, not raw `~0.502`. | Runtime `Se` color setters already use `sourceRgbColor()`, but initial ordinary work material diffuse still needs a focused audit. Auxiliary `WA/XA` should not be changed until source evidence is checked separately. | Medium | Confirm source `VA` diffuse path and, if proven, change ordinary work diffuse to raw source RGB. Run full QA because this may affect spotlight/luma. |
| 2 | S1-08B | Ordinary `VA` full shader | Source `VA` replaces the full standard vertex and fragment shaders with `HA/zA`, omits the final tonemapping tail, and owns alpha/reveal/mouse-lightness after the physical lights body. | Rebuild uses source-style chunk injection and already removed several Three 0.184 output/fragment tails. This is safer but still not a full `VA` replacement. The dark home cubes/thumb projection gap remains. | High | Compare current generated patched shader against source `HA/zA` and make only 3-5 isolated source-proven changes. Full replacement remains an experiment branch only if smaller diffs fail. |
| 3 | S1-09 | Render target and color output | Source `Lu` creates default `WebGLRenderTarget` clones; many screen materials are `toneMapped:false`; selected colors call `.convertLinearToSRGB()` explicitly. | Rebuild uses source-shaped target defaults and source raw color setters, but runs on Three 0.184 with `renderer.outputColorSpace = SRGBColorSpace`. Luma remains much lower on home and project captures. | Medium-high | Audit actual source renderer initialization and render-target texture color-space assumptions before broad changes. Keep project pages in every full run. |
| 4 | S1-17 | Spotlight projection and map contribution | Source home route assigns `J.workScene.spotLight.map = J.workThumbScene.renderManager.renderTargetComposite.texture`, sets position `(0,0,3.7)`, target `(0,0,-8)`, and intensity `220`; `p1.update()` only applies camera parallax to spotlight `x/y`. | Rebuild follows map ownership, position, target, intensity, and parallax. Brightness still suggests the map may not contribute through `VA` the same way as source. | Medium-high | Do not change intensity without source evidence. Attribute the gap through `VA` light/color semantics and renderer output first. |
| 5 | S1-18 | Shared `C1/A1` + media flow | Source `C1/A1` mixes `tWork`, `tMedia`, noise, contrast, background, and media reveal; source media scene renders offscreen into `C1.tMedia`. | A1/OA split and several source cleanups are implemented. A source-shaped media offscreen experiment regressed project luma and was reverted, proving unresolved coupling in current ownership. | High | Defer new architecture changes until `S1-08/S1-09` are narrowed. If revisited, isolate why `C1.tMedia` darkens project pages before keeping the source offscreen media flow. |
| 6 | S1-19 | Floor reflector full projection | Source `a1/o1/i1` owns a dedicated projection-matrix reflector path with normal-map distortion. | Rebuild has source constants and normal-map distortion, but not full reflector parity. Recent floor cleanup did not materially move luma. | Medium | Defer. Handle as an isolated floor batch after ordinary `VA`/output attribution. |
| 7 | S1-20 | About character/render manager | Source about spotlight map comes from the character scene/render manager and rotatable mesh behavior. | Rebuild renders `me.gltf` into a character target and uses it as the about spotlight map, with fallback texture. | Medium | Treat as accepted bridge unless final visual QA shows a material about-page mismatch. Home parity is higher priority. |

### Current Recommendation

Finish Phase 1 before opening Phase 2 work. The next implementation batch should stay in one rendering chain: ordinary `VA` color/light semantics plus spotlight contribution attribution. If the batch only changes initial color/material constants and documentation, it can include up to 6-10 source-proven differences. If it changes shader text, render targets, render order, or full material replacement, cap it at 3-5 differences and run browser QA immediately.

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
| S1-10 | `V1/H1/z1/B1` sky render target | Source creates `skyScene = new V1`, renders it through `H1` with a `z1` composite material, uses `#666666.convertLinearToSRGB()` as the sky scene background, sizes the target to `height * .75`, and assigns `skyScene.renderManager.renderTargetComposite.texture` to `workScene.env.material.customUniforms.tSky`. | Rebuild feeds `/images/textures/blue-noise.png` directly into `environmentMaterial.uniforms.tSky`. There is no offscreen sky scene/composite target. | High. This is the clearest source-proven explanation for the whole home environment reading dark, because `tSky` should be a processed bright/inverted sky texture rather than raw blue noise. | Next implementation target. Add a source-shaped offscreen sky target and feed it to `environmentMaterial.tSky` before tuning `VA`. |
| S1-11 | `h1/u1/l1/c1` environment material | Source environment is `MeshStandardMaterial`-derived with full shader replacement, `envMapIntensity = Qn.ENVMAP_INTENSITY`, and a large standard-lighting fragment body sampling `tSky`. Constants include `ENVMAP_INTENSITY=1`, `SHADER_1_ALPHA=.5`, `SHADER_1_SCALE=5.5`, `SHADER_2_ALPHA=0`, `SHADER_2_SCALE=13`, `SHADER_3_ALPHA=0`, `SHADER_1_MIX_3=1`. | Rebuild uses a simplified transparent `ShaderMaterial` around the same broad constants, with raw blue-noise sampling and local color math. | High. Even with a sky target, simplified environment lighting may still underrepresent source horizon/sky contribution. | Pair with S1-10 only as far as needed: first feed a real sky target, then decide whether to port more `l1` shader math based on luma/contact-sheet change. |
| S1-12 | `VA` full shader and material tonemapping | Source `VA` extends the standard material class but replaces the complete vertex and fragment shader through `onBeforeCompile`; its fragment comments out `tonemapping_fragment`. Material flags include `dithering=true`, `transparent=true`, `envMapIntensity=.75`, `roughness=1`, `depthTest=false`, and `depthWrite=false`. | Rebuild uses `MeshStandardMaterial` with chunk injection. Work and auxiliary materials now have source flags, and a local source-supported experiment adds `toneMapped:false` plus raw initial emissive colors, but luma did not materially improve by itself. | Medium-high. Still likely affects cube/thumb brightness and spotlight-map interpretation, but the environment target gap is broader and safer to test first. | Keep the source-supported `toneMapped:false`/initial emissive correction if no regression appears, but do not treat it as the main brightness fix. Full `VA` replacement remains a dedicated high-risk batch. |
| S1-13 | `Lu/I1` render-target and color-space assumptions | Source creates default `WebGLRenderTarget` clones throughout `Lu`, then applies many `toneMapped:false` screen materials. Source colors often call `.convertLinearToSRGB()` explicitly and run under the bundled Three color-management defaults. | Rebuild explicitly sets many target textures to non-mipmapped linear/clamped and runs Three 0.184 with `renderer.outputColorSpace = SRGBColorSpace`; runtime project colors are now parsed with source `sr()` semantics. | Medium-high. Color-space/tone-map mismatch could explain why source-shaped colors and lights still produce low luma. | Audit after S1-10 because the sky-target absence is a concrete missing source pass; avoid broad color-space changes until that pass is measured. |
| S1-14 | Source scene update/render ordering | Source manager updates scenes in order `sky`, `media`, `work`, `main`, `workthumb`, `wavves`, `character`; it assigns `skyScene.renderTargetComposite` to env once during init. Earlier audit showed work blocks consume previous-frame thumb/displacement outputs. | Rebuild currently renders home first, then thumb targets, character target, and displacement; it has no sky render pass. Some previous-frame behavior is intentional and already source-shaped for thumb/displacement. | Medium. Adding sky must respect source ordering enough that env samples a valid sky target before the home scene render. | When implementing S1-10, render the sky target before the home scene render. Do not disturb the source-shaped previous-frame thumb/displacement order unless new evidence requires it. |
| S1-15 | `a1/o1/i1` floor material | Source floor is a dedicated material chain and participates in the same environment/reflection feel beneath the cubes. | Rebuild floor is an approximation using a reflection target and local scan/reflection math. | Medium. It may contribute to lower-viewport darkness but is less likely than missing `V1` to explain the full-screen luma gap. | Defer until after sky/environment measurement. Keep as an isolated batch. |
| S1-16 | Shared project composite/background darkness | Source project luma is also higher (`/gc-2026/` about `0.140` original vs `0.039` rebuild), suggesting part of the issue may be shared `A1/C1` or media-background handling, not only home cubes. | Project media markers and WebGL planes remain stable, but background/composite appears darker. | Medium. Project pages are closer and should stay regression checks; changing shared composite can regress them. | Keep project pages in every full QA pass. Do not tune project visuals separately until home `V1/tSky` and render-target assumptions are narrowed. |

### S1-10/S1-11 Implementation Result

The source-shaped sky/environment bridge is now implemented:

- Added a dedicated offscreen `skyScene` with `#666666.convertLinearToSRGB()` background.
- Added a `z1/B1`-shaped sky composite pass and `height * .75` square render targets.
- Set the sky composite texture to repeat wrapping and feed it to `environmentMaterial.uniforms.tSky`.
- Stopped assigning raw `/images/textures/blue-noise.png` directly to the environment `tSky`; blue-noise remains scoped to pre-composite and mouse simulation.
- Moved the environment fragment closer to source `l1` by removing the rebuild-only low-alpha transparent band and outputting the source-style full environment color path.

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

Decision: keep the sky/environment bridge because it removes a source-proven architecture gap, but do not continue tuning this path blindly. The next implementation batch should target `S1-12` (`VA` full fragment/tone-mapping path) or `S1-13` (render-target/color-space assumptions).

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

# Rebuild Plan

Last updated: 2026-06-05

## Execution Rules

- Use the mirrored original bundle as the implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- Work in batches of roughly five source-alignment steps unless a risky shader/navigation/media change needs a quick local check. Prefer one verification/documentation/commit cycle per batch instead of per tiny step.
- After each completed batch:
  - update this document,
  - run build and diff checks,
  - run a browser smoke/QA check when relevant,
  - commit the code and this document together.
- Commits use `Boyang Hu <i@boyang.hu>` and no AI co-author.

## Phase Status

1. Home WebGL source parity: in progress, current priority.
2. Home DOM and interaction parity: paused until Phase 1 is complete.
3. Project detail media system: stable, monitor for regressions.
4. About and auxiliary pages: pending.
5. Global transitions, state, audio, Lenis lifecycle: pending.
6. Final source/visual QA and cleanup: pending.

## Completed Steps

| Commit | Area | Progress |
| --- | --- | --- |
| `cb499d9` | Home WebGL | Added source-style `wavvesScene/k1` displacement pass for work cubes. |
| `cd1a3a9` | Home WebGL | Aligned main home composite with source `A1/C1` shader behavior using `tNoise`, `tPerlin`, RGB shift, mouse-flow distortion, and blend operations. |
| `1c31149` | Home WebGL | Refined mouse simulation toward source `Ka`: old/new/target pointer state, delta-based lerp, persistence, brush thickness, and flow channels. |
| `d1a8f00` | Home WebGL | Drove work cube displacement with source-style Perlin texture and restored stronger mouse Z displacement. |
| `7f35f97` | Home WebGL | Aligned mouse UV projection with source `uUvOffset/uUvOffsetScale` and enlarged ray plane mapping. |
| `efe5786` | Home WebGL | Added lightweight work-scene bloom compensation based on source `kA/OA` luminosity and bloom settings. |
| `9ff9453` | Home DOM | Added source-style work CTA magnet movement from source `gD`. |
| `ed80a14` | Home DOM | Added source-style temporary `is-dragging` state during gallery wheel/touch navigation to suppress accidental link interaction, matching source `yD` pointer gating. |
| `2eaa8e5` | Home DOM | Added source-compatible progressbar `data-slug` support while preserving existing `data-progress-slug` behavior from the rebuild. |
| `7f41fba` | Home DOM | Aligned homepage title/work/footer intro animation targets with source `Rg/vD/Ou` inner-element structure. |
| `f7531e4` | Home DOM | Aligned work title click behavior with source `vD`: project titles select the active project while the CTA remains the detail-page entry point. |
| `66c6970` | Home DOM | Added source-style `gD` CTA text and opacity animate-in/out when the active work item changes. |
| `71f2403` | Home DOM | Aligned touch gallery movement with source `yD` virtual-scroll deltas by driving project changes during touchmove instead of only on touchend. |
| `a0d4955` | Home DOM | Matched source `Ou` footer contact resize behavior by shortening the mobile contact label to `E-mail`. |
| `f9840d9` | Home WebGL | Moved gallery velocity roll from the rotating project ring to the work scene container to better match source `yD.updateScene`. |
| `e8a811d` | Home DOM | Added source-style header description and availability inner-line animation targets from `Ki/SD.animateIn`. |
| `e7997ec` | Home DOM | Added source-style `.ui-nav-a-inner` targets and nav animate-in timing from source `Tr`. |
| `833594d` | Home DOM | Aligned mobile nav link/state structure with source `Ar` using `.ui-nav-mobile-a`, inner spans, `data-slug`, and `html.is-nav-mobile-open`. |
| `44f341b` | Home DOM | Rebuilt the mobile nav shell closer to source `Ar`, including `.ui-nav-mobile-content`, `.ui-nav-mobile-content-bg`, footer links, toggle-line state, fade-in, and delayed link active/close timing. |
| `3fbf535` | Home WebGL | Matched source `Se.setThumbMouseLightness` propagation by animating `uMouseLightness` on every work block instead of only the active block. |
| `e710154` | Home WebGL | Split source-style overview/detail darken from thumbnail darkness so main composite uses `darkenOverview`/`darkenDetail` while thumb composite and block projection use `thumbnail.darkness`. |
| `1cac355` | Home WebGL | Moved work spotlight parallax closer to source `p1.update` by deriving spotlight x/y from the camera position instead of directly from pointer coordinates. |
| `53e7e31` | Home WebGL | Renamed the work block screen-coordinate uniform to source-compatible `uCoords` while keeping thumb-plane `uResolution` aligned with source `E1`. |
| `cc52ec8` | Home DOM | Kept work gallery pointer gating closer to source `yD` by holding `is-dragging` through the snap window and marking keyboard-driven gallery steps too. |
| `9930ced` | Home DOM/WebGL | Added source-style work gallery event semantics with `rd:nav-click`/`rd:project-active` and carried split darkness payload fields through active project changes. |
| `41bbd7d` | Home DOM | Added source-style `.ui-work-container` around the home work content and aligned fixed container CSS with source `yD`/bundle styles. |
| `0a77fdf` | Home DOM | Aligned work gallery virtual-scroll diff handling with source `yD` so sub-threshold deltas still feed scene inertia while only larger deltas trigger next/prev. |
| `2bdb0ce` | Global DOM | Added source-style button SVG formatting from `gD.formatButton()` so `.c-button` background SVG/rect dimensions match rendered button size on init and resize. |
| `8e65755` | Home DOM | Added source-style mobile `touchstart` selection for work titles and progressbar items from `vD/_D`, with click dedupe to avoid double navigation. |
| `0ba12a7` | Home DOM | Added session-backed work gallery state restoration as a local equivalent of source `Qe.workState` for active slug/index and virtual scroll position. |
| `31e3001` | Home DOM | Added source-style home gallery `mousedown` default suppression from `yD.onMouseDown`, scoped to the home view. |
| `0c3c407` | Home WebGL | Restored source `GA` work-block displacement strength constants: Perlin reveal mix `10.25` and unrevealed wave depth `9.0`. |
| `9021b23` | Home WebGL | Split local cube mouse simulation from source-style screen-space `tMouseSim2`, so work-block fragment light/alpha and main composite sample screen mouse flow separately from vertex displacement. |
| `e076340` | Home DOM/WebGL | Passed gallery frame delta into `setGalleryProgress` and matched source `yD.updateScene` delta-based smoothing for work-scene roll and zoom. |
| `fdaeff0` | Home WebGL | Matched source `w1.updateGalleryProgress` by keeping thumb `uProgress` at its default value during gallery wrapping instead of dimming non-active thumbs. |
| `19cdcbb` | Home WebGL | Moved the home composite tail closer to source `OA`: final darken now uses screen-space `mouseSim.r`, applies source-style lighten blend with black, and finishes with saturation after darkening. |
| `33b2c9e` | Home WebGL | Added a separate low-resolution home bloom pass so final composite samples `tBloom` like source `Lu/kA` instead of deriving all glow inline from `tWork`. |
| `5ac8713` | Home WebGL | Matched source `p1.resize` mobile behavior by keeping the work WebGL scene active below `LG` and shifting `sceneWrap.position.y` to `.3` below source `MD=800`. |
| `2af884f` | Home DOM | Moved work gallery pointer gating closer to source `yD.checkSpeed()` by tracking pointer activity and last deltas, then toggling `.is-dragging` from the RAF loop instead of using a fixed timeout for every gallery delta. |
| `452bf21` | Home DOM | Matched source `yD.onVirtualScroll` snap state more closely by only easing `scroll.diff` back toward zero after gallery input has enabled the snap flag and by clearing/restarting the 100ms snap timeout on each delta. |
| `fd92af1` | Home DOM | Extended the session-backed work gallery state toward source `Qe.workState` by preserving `index.current/prev/next`, `activeHook`, and `targetHook` alongside scroll state. |
| `8d99bdb` | Home DOM/WebGL | Added source-style `SD.animateIn -> Se.showScene()` wiring so the home composite `uReveal` animates in over 1.6s with `expo.out` after WebGL initialization. |
| `489ca4c` | Home DOM | Added source-style `SD.onLeave -> Ki.animateDescriptionOut/animateAvailibilityOut` behavior to the home CTA transition path with 0.5s opacity fades. |
| `ec26bfe` | Home WebGL | Matched source `yD.onWorkGalleryOut()` more closely by killing active work-block reveal tweens before running the gallery-out spread and project fade. |
| `1cb6a6b` | Home WebGL | Matched source `p1.update()` mobile spotlight parallax by adding the `.3` y-offset below `MD=800` while keeping camera-derived spotlight movement. |
| `e93e165` | Home WebGL | Matched source `p1.setLights()` spotlight cone by using `angle = PI / 4` for the shader thumb-map projection instead of the narrower half-angle approximation. |
| `c183c76` | Home WebGL | Made the auxiliary thumb projection plane follow source-style scene reveal/out timing instead of staying permanently visible outside the spotlight-map lifecycle. |
| `15b1ad9` | Home WebGL | Moved the lightweight home bloom pass closer to source `kA` by adding a `uRadius` uniform set to source bloom radius `1.5` for luminosity blur offsets. |
| `95ebb65` | Home WebGL | Moved final home bloom compositing closer to source `OA` by adding `tBloom` directly and adding a shifted bloom sample instead of attenuating bloom a second time. |
| `32ef9ec` | Global Audio | Split CTA click audio from gallery-out soft-woosh behavior using source `gD`/`yD` Howler assets and playback rates. |
| `f200c8f` | Home DOM/WebGL | Cleared local CTA preview state before work-gallery leave so the source-style `yD.onWorkGalleryOut()` transition is not tinted by hover/focus preview leftovers. |
| `7a49018` | Global Audio | Split source-style hover and gallery-enter plucks cues so `yD.animateIn()` can play plucks without reusing the hover sound. |
| `7ead336` | Global Audio | Moved the source-style home gallery plucks trigger behind audio listener initialization so dynamic import ordering cannot drop `yD.animateIn()` audio. |
| `a0fcfe7` | Home WebGL | Aligned the source-style `p1` floor and environment planes to the original large geometries, y offsets, floor rotation, and demorgen environment rotation adjustment. |
| `c68adb6` | Home WebGL | Moved the home bloom pass closer to source `Lu/kA` by rendering five downsampled bloom mips and recombining them with source-style bloom radius factors before final `OA` compositing. |
| `e3195db` | Home DOM/Audio | Batched Phase 2 source alignment for `vD/_D/yD`: click audio now only binds `data-sound-click`, project changes emit source-style woosh, redundant active project selections short-circuit, and session work state stores `activeProject`/`sceneRotation`. |
| `bd18bda` | Home WebGL/DOM | Batched source `yD/gD` mouse-factor lifecycle alignment: centralized mouse-factor tween ownership, removed constructor auto-start, made home entry explicitly animate mouse factor from 0 to 1, reused the same path for CTA preview enter/leave, and reset mouse factor on gallery leave. |
| `342bb68` | Home WebGL | Batched source `IT/p1/yD` camera-controller alignment: added source-style camera controller settings, pixel-space pointer tracking, mobile camera-origin z behavior, delta-driven camera roll, and home entry wiring for `targetXY=(1,.5)` with `rotateAngle=20`. |
| `aa8a85f` | Home WebGL | Batched source `Lu/kA` bloom pipeline alignment: split luminosity threshold into a bright target, added source-style horizontal/vertical bloom render targets for five mips, matched floor-power-of-two quarter sizing, and fed vertically blurred mips into the existing source-factor bloom composite. |
| `4210264` | Home WebGL | Batched source `T1/w1/E1/SD/p1` thumb projection alignment: matched thumb camera near/far and square render-target sizing, reset thumb map metadata to source `1x1`, changed thumb composite darkening to multiply, reduced the auxiliary projection overlay, and moved it closer to the spotlight-map path. |
| `d378e2f` | Home WebGL | Batched source `A1/C1/OA/p1` composite alignment: removed local procedural/background/glow compensation from the main composite, restored texture-driven `uPerlin=.1` displacement, shifted bloom sampling through fluid UVs, fixed source work/composite background colors, and removed stale composite color uniforms. |
| `e95069f` | Home WebGL | Batched source `Ka/Lu/A1` mouse-simulation alignment: replaced CPU `DataTexture` brush updates with source-style low-resolution ping-pong render targets, added the original mouse simulation shader inputs, resized simulation targets from render resolution like `Lu`, fed both mesh and screen mouse textures through the WebGL render path, and restored source-style `mouseSim.rg` composite flow sampling. |
| `c312ef6` | Home DOM | Batched source `vD/_D/yD` nav semantics alignment: split immediate DOM active/CTA updates from scene project activation during nav/progress clicks, delayed scene activation until the source-style transition window completes, preserved keyboard navigation as direct next/prev gallery motion, and fixed mobile touch-end delta tracking from the original touch start point. |
| `f844355` | Home WebGL | Batched source `p1/SD/T1` spotlight-map alignment: projected thumb sampling from source-style spotlight position and target `(0,0,-8)`, added per-frame spotlight basis uniforms, synchronized spotlight target/right/up during intensity changes, and further reduced the auxiliary projection-plane overlay so cube shading carries the thumb-map projection. |
| `3306bf0` | Home DOM | Batched source `gD/yD/SD` gallery-out interaction alignment: moved CTA magnet smoothing to source `yf(..., 2.5, delta)` exponential damping, centralized CTA preview cleanup, introduced a source-style `rd:work-gallery-out` event consumer for leave animation, guarded duplicate gallery leaves, and reset stale leave state on restored home pages. |
| `78838b6` | Home DOM/WebGL | Batched source `yD/SD` home-entry and gallery-scroll alignment: delayed work-gallery scroll activation until home entry, moved scroll smoothing to source `Yi` exponential damping, gated gallery input and WebGL progress updates behind active state, matched WebGL roll/zoom damping to source `updateScene`, and tied plucks playback to the gallery entry event with import-order protection. |
| `5a9d6a6` | Home DOM/WebGL | Batched source `yD/Qe.workState` restoration alignment: restored active project identity before first gallery tick, prevented restored pages from replaying duplicate active-project scene transitions, preserved source-style scene roll/zoom state separately from carousel progress, reset restored `scroll.active` until home entry, and added a narrow WebGL gallery-state restore hook for scene rotation/thumb progress. |
| `e07db5d` | Home WebGL | Batched source `OA/kA` composite alignment: reduced the home final composite to the source `OA` scene/bloom/mouseSim tail, removed local noise/perlin/contrast/background-lighten compensation from the composite pass, kept the existing source-style bloom mip chain, changed fluid contribution to `length(mouseSim.xy) * .015`, and removed stale composite uniforms/update paths. |
| `1e4fd91` | Home WebGL | Batched source `A1/C1` pre-composite alignment: added a separate A1-style pre-composite pass before the final OA pass, restored source perlin/noise/mouseSim/contrast preprocessing in that layer, kept bloom in the source OA/kA branch to avoid double bloom, routed raw home scene through `workRawTarget -> preCompositeTarget -> finalComposite`, and fixed stale `tPerlin` writes after the previous OA cleanup. |
| `c7cf4ac` | Home WebGL | Batched source `GA/p1` work-block material and spotlight-map alignment: moved cube fragment UVs back toward source `vUv / uGridSize + instanceOffset`, restored the source-style random grid alpha formula without local seed offsets, reduced non-source thumb/projection color amplification, softened spotlight-map contribution so it behaves more like projected map lighting, and clamped local normalized spotlight intensity to the source max-intensity range. |
| `0757011` | Home DOM | Batched source `yD` lifecycle and input-state alignment: normalized restored gallery scroll/progress/remainder before first frame, added source-style timeout ownership for nav/next/prev transitions, blocked wheel/touch deltas during next/prev transition windows, gated keyboard navigation behind active gallery state, and added cleanup paths for global gallery listeners/timers while preserving `pagehide` state saves. |
| `cfbf96b` | Project DOM/WebGL | Batched source `OD/CD` project-state alignment: added next-project color payloads to project pages, implemented source-style next-project scroll threshold switching for main color/ambient/media background/saturation/contrast, exposed a narrow WebGL project-scroll state setter, added project-leave media opacity/fluid reset, and preserved project media track counts during smoke checks. |
| `7ca3a77` | Project DOM | Batched source `RD/ND` project reveal alignment: added source-compatible title span structure for `.ts-2 > span`, split project header intro animation from the generic content fade so title/info/link targets follow source `RD.animateIn`, added overflow/display guards for project title and info spans, and moved mobile DOM media reveal timing closer to source project animation duration while keeping desktop WebGL media tracks stable. |
| `88c7db0` | Project WebGL | Batched source `FD/ND` project media-plane alignment: cached source-style `parallaxTop` state per media plane, updated desktop media `uCameraDistance` to use `mediaCamera.position.y - plane.position.y` like source `FD.update`, preserved top-parallax override as `-scroll`, and forced a media-plane position refresh before reveal tweens start. |
| `9899681` | Home DOM | Batched source `yD/vD` gallery nav activation alignment: title/progress nav clicks now immediately activate the selected project scene and state like source `yD.onNavClick`, while preserving the 1200ms transition lock. |
| `7e35956` | Home DOM/WebGL | Batched source `Se/yD` state payload alignment: split project saturation from thumbnail saturation, carried `data-thumb-saturation` through DOM payloads into WebGL thumb materials/composite, preserved more source-shaped `Qe.workState.scroll` fields, and corrected pointer-speed gating math toward source `checkSpeed()`. |
| `1fe3bf9` | Home WebGL | Batched source `Se/p1` visual-state control alignment: added tween ownership for scene reveal, darken, reveal spread, and spotlight intensity, moved `showScene()` back to main-composite reveal only, changed darken timing/easing to source defaults, and stopped applying thumbnail saturation directly to work-block materials so the thumb composite remains the source of that adjustment. |
| `6936bff` | Home DOM | Batched source `Cg/yD` input lifecycle alignment: restored source pointer-speed gating expression, removed local swipe-end threshold navigation in favor of source zero-delta touchend semantics, made touch listeners non-passive like source virtual scroll, and guarded repeated mouse/touch starts while a pointer is already active. |
| `29251c7` | Home DOM | Batched source `vD/_D/gD` component-lifecycle alignment: made work title, progress, CTA hover/focus/click, and CTA magnet handlers explicitly removable during gallery cleanup, and killed CTA timelines/tickers like source component destroy paths. |
| `e972926` | Home DOM | Batched source `Rg/Ou/SD` page chrome lifecycle alignment: matched title intro stagger to source `Rg`, delayed footer contact first resize update like source `Ou`, added cleanup for footer resize and Lenis RAF/destroy, and wired motion cleanup into pagehide/beforeunload. |
| `d347697` | Home/Project WebGL | Batched source `Se` shared visual-state tween alignment: added tween ownership and instant paths for main color, ambient light, saturation, contrast, media background, and active block color so rapid home/project state switches do not leave stale GSAP updates fighting the current visual state. |
| `c478490` | Home/Project WebGL | Batched source `Se/OD/yD` lifecycle tween ownership: added source-style kill/instant paths for fluid strength and media opacity, owned project media translation tweens, owned work-scene revealProject tweens, and centralized active project thumb/block state tweens to prevent stale GSAP writes during fast gallery and route transitions. |
| `5ee54a0` | Home DOM | Batched source `yD` active-project lifecycle alignment: made project activation idempotent unless the slug changes or initialization forces it, aligned `rd:project-active` payload slug with the active project id, guarded invalid nav indexes, made home gallery entry idempotent, and removed stale CTA timelines during gallery cleanup. |
| `637762d` | Home/Project DOM | Batched source component destroy/lifecycle cleanup alignment: made button formatting, work gallery, scroll state, mobile project media observers, next-project state switching, and project-leave link handlers return cleanup callbacks that are collected by pagehide/beforeunload lifecycle teardown. |
| `b5e10e5` | Home WebGL | Batched source `p1/T1` resize and projection scale alignment: introduced the source DPR cap of `1.5`, reapplied renderer pixel ratio during resize, matched the work camera near/far plane to source `p1.setCamera`, and routed work-block screen-coordinate uniforms from actual render target dimensions. |
| `ee79ab3` | Home WebGL | Started source `p1.setLights` / `Se.setDirectionalLightIntensity` parity by adding tween-owned directional-light state, syncing it into work-block shaders, and preserving the source default intensity of `1.5` when projects activate. |
| `1bad2ac` | Home WebGL | Batched source `GA/p1/Ka` work-block simulation alignment: restored source low-res layer count fallback, changed local cube mouse simulation to source `persistance=.85` and `thickness=.1`, moved mouse-lightness darkening toward source `mouseF`, restored source screen-y gated alpha boost, and kept the screen mouse simulation on the existing broader composite brush. |
| `6a8b206` | Home DOM/WebGL | Batched source `yD/SD/Cg/gD` home-entry and input lifecycle alignment: added a WebGL gallery-entry hook that resets block reveal and animates `uRevealProject` like `yD.animateIn`, moved gallery scroll activation after WebGL entry state restore, preserved source touchstart/touchend zero-delta semantics, kept CTA clicks from starting a nav scroll before gallery-out, and removed the duplicate boot-time mouse-factor animation. |
| `c4cd296` | Home DOM/WebGL | Batched source `vD/_D/gD/yD` preview and event semantics alignment: removed the non-source DOM `.work-preview` layer and `html.is-work-previewing` CSS/JS state, kept CTA hover/focus preview routed only through WebGL mouse-factor state, made progressbar selection update DOM active state immediately like `_D.onListItemClick`, restored slug-shaped `rd:project-active` event detail, and split payload delivery into a separate compatibility event. |
| `280cccc` | Home WebGL | Batched source `GA/T1/E1/Ka` shader and simulation alignment: restored source unrevealed work-block wave depth, made block alpha finish with `uRevealSides` like `GA`, matched thumb transition fallback alpha to `S1`, moved the screen mouse simulation to source `persistance=.85` and `thickness=.1`, and removed the local auxiliary projection plane from the home scene so projected thumb lighting is carried by the cube shader. |
| `4d0c93d` | Home WebGL/DOM | Batched source `A1/OA/kA/gD` fluid and preview semantics alignment: split `tFluid` back out from `tMouseSim` in the pre-composite and final composite shaders, supplied a black source-style disabled-fluid texture for home `kA`, kept final `OA` mouse simulation use scoped to darkening instead of flow brightness, kept `A1` displacement UVs tied to disabled fluid unless a real fluid pass exists, and made CTA preview hover/focus only animate work-scene mouse factor like `gD`. |
| `8362ea8` | Home DOM | Batched source `vD/_D/gD` selection-event semantics alignment: removed non-source card hover/focus project activation, kept work-title selection driven by click/mobile touchstart, kept CTA focus routed only to preview mouse-factor state, removed the duplicate progressbar DOM-active write after nav selection, and bound title/progress touchstart handlers only under the mobile breakpoint like the original components. |
| `5492d96` | Home WebGL | Batched source `GA/VA` work-block geometry/material alignment: restored source-style `instanceIndex` attributes, moved instance color/alpha seeds back to per-instance `Math.random()` values, matched the rounded cube geometry segment count to source `mg(size,size,size,.05)`, disabled block material depth testing like `VA`, and routed the screen mouse alpha boost through `uMouseFactor` instead of thumbnail mouse-lightness. |
| `165051c` | Home WebGL | Batched source `GA` vertex displacement alignment: removed local procedural noise/wave mixing from the work-block vertex shader, restored source perlin-only reveal displacement, multiplied perlin displacement by the source fade term, changed reveal displacement mixing back to `.25`, and kept wave displacement sourced directly from `tDisplacement.r` before the source mouse transform. |
| `a833dcd` | Home DOM | Batched source `vD/_D/yD/Se` event semantics cleanup: removed unconsumed rebuild-only `rd:project-active-payload` and `rd:nav-click` browser events, kept `rd:project-active` as a slug-shaped event only for emitted state changes, kept `rd:woosh` scoped to real project switches, and suppressed boot-time active-project event/audio emission while preserving initial DOM color state. |
| `d348ebc` | Home DOM | Batched source `yD` scroll and pointer lifecycle alignment: restored source-shaped scroll `limit/step/offset` fields in runtime state, routed gallery hook math through those scroll fields, moved `is-dragging` to the `.ui-work-content` component root like source `yD.el`, added matching CSS so pointer suppression actually applies there, and preserved source zero-delta touchstart/touchend snap semantics. |
| `f5974b3` | Home WebGL | Batched source `Se` shared visual-state alignment: removed the rebuild-only minimum clamp from project saturation so low-saturation source data is honored, made `setBlocksColor()` affect every work block like source `Se.setBlocksColor`, removed active-block duplicate writes for block color and thumb mouse-lightness, and kept those global setter tweens from being killed by project reveal cleanup. |
| `fae41f0` | Home DOM | Batched source work-list CSS parity: matched desktop `.ui-work-ul li` block/overflow structure, restored source `ui-work-a` letter spacing and inner-span transform baseline, kept intro animation transform ownership so titles do not snap back after GSAP, and aligned work CTA width/opacity transition plus wide-aspect override with the source stylesheet. |
| `971e955` | Home DOM | Batched source `Ki/Tr/Rg/Ou/Ar` page chrome lifecycle parity: desktop nav links start with source-style disabled pointer events and are enabled by animate-in, intro tweens preserve transform ownership instead of clearing source baselines, header description/availability out tweens kill active in tweens before fading, mobile nav active/close timing follows source `Ar`, and mobile nav listeners are cleaned up on page teardown. |
| `c668b4f` | Home WebGL | Batched source `GA/p1/Ka` alpha, projection, and mouse-simulation parity: work-block alpha now follows the original two-grid random formula, local logo alpha boosting was removed, spotlight projection uses the source mouse-expanded world position, both mouse simulation buffers use source-style viewport `/4` sizing, and mesh/screen simulation `uCoords` now stay aligned with that source buffer size. |
| `de7cba8` | Home DOM | Batched source `sl/SD` view lifecycle parity: `[data-view]` roots now start hidden and fade in over the source 0.5s linear timing, work-gallery and project-route leaves fade the active view out, html receives source-style `is-${view}` state, header-name pointer events are explicitly restored during view entry, and lifecycle cleanup removes those temporary view states. |
| `eed7f1b` | Home WebGL | Batched source `A1/OA/kA` composite-shader parity: final `OA` bloom now uses the source `boolBloom` branch and `uBloomDistortion`, pre-composite `A1` keeps original base/perlin UV separation while routing scene sampling through fluid UVs, the source `mix(uBgColor, sceneMixed, 1.)` stage is restored, the work raw render target keeps a depth buffer like source renderTargetA, and composite uniforms are synchronized before the final pass. |
| `cef11f8` | Home WebGL | Batched source `Se` shared thumb-state ownership parity: project block reveal no longer kills shared thumbnail darkness, darkness-color, or saturation tweens; reveal cleanup stays scoped to project/block-local state; duplicate thumb composite writes were removed from reveal; thumb darkness color now follows the source shared setter path; active block tint, darkness, and contrast transitions remain local to the active project block. |
| `ec296b7` | Home WebGL/DOM | Batched source bootstrap and mobile WebGL lifecycle parity: WebGL initialization now follows source-style capability gating instead of viewport-width gating; reduced-motion no longer removes the GL layer; low-memory/save-data handling remains a low-resolution WebGL path instead of a hard disable; mobile home can initialize the same WebGL scene that `p1.resize` already positions; browser smoke was expanded with a mobile viewport check. |
| `2f46152` | Home DOM/WebGL | Batched source `yD` gallery-out and work-state parity: gallery leave no longer applies non-source fluid-strength or mouse-factor resets, work-state persistence now matches source fields by keeping `sceneRotation` without the local zoom extension, WebGL gallery restore no longer rehydrates a stale zoom offset, and the source `onWorkGalleryOut` reveal-spread/spotlight/project-reveal behavior remains intact. |
| `63d8a3d` | Home WebGL/DOM | Batched source `SD` home-entry spotlight parity: home boot now explicitly initializes the source spotlight position `(0,0,3.7)`, target `(0,0,-8)`, and max intensity before scene reveal; the spotlight projection reveal is reset for the home spotlight-map lifecycle; gallery-state restore now exposes only progress and scene rotation instead of the removed local zoom extension. |
| `d8c95a7` | Home DOM/Audio | Batched source `Tr/Ar` nav interaction parity: desktop and mobile nav links now participate in the Howler hover/click audio path like the source component handlers, the mobile nav toggle gets click audio, delayed mobile nav close state is timer-owned and cleaned up during teardown, and marker QA now expects the added nav click targets. |
| `d7f4dcc` | Project WebGL | Batched source `OD/Se` project-entry visual-state parity: project-route boot now enters source-shaped project visual state without running the full home `setProject()` path, avoiding home thumb/block/spotlight/reveal-spread writes on project pages while preserving project main color, darken, ambient light, media background, saturation, contrast, fluid strength, and media animate-in behavior. |
| `cdaa177` | Home DOM/WebGL | Batched source `SD/yD/Cg` home-gallery entry and input lifecycle parity: gallery entry now emits the current active-project state before restoring/entering WebGL, keyboard and pointer listeners rely on the home component lifecycle instead of duplicate `body.is-home` gates, keyboard next/prev follows source gallery handler timing more closely, and stale local scene-zoom bookkeeping was removed from the DOM controller. |
| `31c5f99` | Home DOM | Batched source `Cg/yD` virtual-scroll input branch parity: home gallery input now follows the source touch-vs-mouse listener split, pointer moves are ignored unless the source-style pointer is active, mouse start/end emit zero-delta gallery scroll events like `Cg`, keyboard next/prev can issue direct gallery steps without the virtual-scroll transition guard, and passive mouse listener options were aligned with the source virtual-scroll implementation. |
| `390fec5` | Home WebGL | Batched source `Se` visual-state responsibility parity: `setMainColor` now stays scoped to DOM `.c-color` updates instead of tinting rebuild-only background, floor, and particle materials; `setAmbientLight` no longer mutates active work-block tint or particle opacity, leaving block coloration to the source-shaped `setBlocksColor` and project-reveal paths while retaining ambient environment uniforms. |
| `42e0d52` | Home WebGL | Refocused active rebuild work on Phase 1 Home WebGL source parity before returning to Phase 2 DOM/interaction cleanup, and removed the rebuild-only work-scene particles layer so the home scene composition stays closer to source `p1`, which adds blocks, floor, environment, about blocks, and floating blocks but no standalone points particle system. |
| `8045258` | Home WebGL | Batched source `Ka/Lu/GA` mouse-simulation sizing alignment: split screen-space composite mouse simulation from cube-local mesh simulation, resized the screen simulation from the render target at source `/10`, resized the cube-local simulation from the source work-grid plane dimensions, and centralized the source `1.3` plane scale plus `1.5` ray expansion constants used by local pointer projection. |
| `ccd9ce1` | Home WebGL | Batched source `SD/p1/GA/Ka` spotlight and pointer-projection cleanup: removed the rebuild-only auxiliary thumb projection overlay path so thumbnail lighting is carried by the cube shader/spotlight-map path, and replaced the global mouse ray plane with per-work-block hidden ray planes so cube-local mouse simulation uses source-style block-local UV intersections. |
| `6675877` | Home WebGL | Batched source `A1/k1/GA` render-target and shader-coordinate alignment: restored A1 pre-composite noise sampling to original `vUv` space instead of fluid-warped UVs, resized the work displacement target to source `k1`'s height-based square target, and scaled the per-block ray-plane z offset through the work-block scale like the source `GA.rotationWrap`. |
| `60ad21f` | Home WebGL | Batched source `Se/h1/u1` environment-state alignment: reshaped the simplified environment shader around source-style `uDarkenColor`, `uDarken`, and shader-pattern constants, and narrowed ambient updates so the environment layer follows `Se.setAmbientColor()`'s darken-color path instead of a rebuild-only ambient-intensity tint. |
| `921efda` | Home WebGL | Batched source `a1/o1/i1` floor-reflector alignment: added a source-style low-resolution floor reflection render target and mirrored camera pass, temporarily hides the floor while rendering the reflection texture, and reshaped the simplified floor shader around source `uReflectivity=.97`, `uMirror=1`, `uFloorMixStrength=15`, normal distortion, and Fresnel-style reflection mixing. |
| `current batch` | Home WebGL | Batched source `u1/l1/c1` environment-shader alignment: routed the preloaded blue-noise texture into the environment as source-style `tSky`, set repeat wrapping like `Xt.blueNoise`, and reshaped the simplified environment fragment around source two-layer sky UV offsets, `smoothMask` vertical bands, sky-mask modulation, white mix, and `uDarkenColor/uDarken` final blending. |

## Current Focus

Finish Phase 1 Home WebGL source parity before returning to Phase 2 DOM parity. The current pass is focused on source `p1/GA/T1/w1/E1/Se/A1/OA/kA/Ka` evidence from the mirrored JS bundle, while preserving recent Se visual-state responsibility cleanup, Cg/yD virtual-scroll input branch work, SD/yD/Cg home-gallery entry work, OD/Se project-entry state separation, Tr/Ar nav audio lifecycle, SD home-entry spotlight parity, yD gallery-out/work-state parity, bootstrap/mobile WebGL lifecycle parity, Se shared thumb-state ownership parity, A1/OA/kA composite-shader parity, sl/SD view lifecycle parity, GA/p1/Ka alpha/projection/mouse-simulation parity, page chrome lifecycle parity, work-list CSS parity, and project detail media stability.

Immediate source targets:

- `p1`: work scene geometry, camera, spotlight, resize, ring state, floor/environment behavior.
- `GA/VA`: work-block material, vertex displacement, alpha, projection, and mouse-simulation uniforms.
- `T1/w1/E1`: thumbnail scene, render target sizing, thumb strip progress, and spotlight-map texture path.
- `A1/OA/kA`: pre-composite, final composite, bloom chain, fluid/mouseSim inputs, and render-manager ordering.
- `Ka`: low-resolution mouse simulation sizing, pointer projection, persistence/thickness, and screen-vs-local simulation feeds.
- `Se`: source-style visual-state setter ownership without non-source side effects.

Latest verification:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `git diff --check`
- Home dist markers: `data-project-card=10`, `data-sound-click=30`, `data-webgl-root=1`, `ui-work-container=1`
- Project dist markers on `/gc-2026/`: `data-media-src=5`, `data-mobile-media=5`, `data-webgl-project=1`
- Chrome headless smoke with SwiftShader on `/?skip-preloader`, `/gc-2026/?skip-preloader`, and `/following-wildfire/?skip-preloader`: `.gl-canvas=true`, `has-webgl=true`, `canvasLost=false`, expected project media counts, no filtered runtime/shader errors. The remaining warning is the expected audio autoplay restriction in headless Chrome.

## Next Candidate Steps

1. Continue source `A1/OA/kA` render-manager ordering review, especially optional media/lensflare uniforms only if home visual QA indicates that layer is still materially off.
2. Revisit `GA/VA` only for source-standard-material gaps that still materially affect the home cube lighting/projection after the floor/environment changes.
3. Defer Phase 2 DOM/interaction work until Phase 1 Home WebGL parity has stronger evidence.
4. Keep future batches around five source-alignment steps before the next verification/documentation/commit cycle.

## Verification Baseline

Run after each completed batch of roughly five source-alignment steps, unless a risky shader, navigation, or media change needs an earlier quick check:

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build
git diff --check
```

For local smoke:

```sh
PORT=5173 SERVE_ROOT=dist FALLBACK_ROOT=public node scripts/serve.mjs
```

Open:

```text
http://127.0.0.1:5173/?skip-preloader
http://127.0.0.1:5173/gc-2026/?skip-preloader
```

Browser smoke should confirm:

- home loads the latest JS bundle,
- project pages keep `.gl-canvas`,
- project pages keep desktop `[data-media][data-media-src]` tracks,
- no WebGL shader/runtime errors in available logs.

# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-07

## Current State

The rebuild is source-driven from the mirrored original bundle. Visual QA is used only as verification and attribution; source behavior remains the implementation spec.

- Latest source-alignment commit: `9986590 Align about destroy spotlight map ownership`.
- Active phase: Phase 1, Home WebGL source parity.
- Phase 1 status: open, roughly 65-70% complete.
- Runtime stability: good based on build, renderer audit, and Chrome CDP probes across home, about, thumb spotlight, and project media.
- Project detail media pages are relatively stable and should remain regression gates.

Estimated current parity:

| Area | Estimate | Notes |
| --- | ---: | --- |
| Architecture and lifecycle | 75-80% | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | 65-75% | Many shader surfaces and pass ownership edges are source-shaped; full `kA/Lu/I1` transfer interpretation is still open. |
| Final Home visual parity | 55-65% | Home still differs in spotlight/thumb projection feel and floor/environment blending. |

## Working Rules

- Use these original files as the spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Keep the agreed stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must continue to use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- Work in scoped source-backed batches, verify each batch, update docs, then commit.
- Commits use `Boyang Hu <i@boyang.hu>` with no AI co-author.
- Do not close known source mismatches as accepted visual deviations.

## Important Files

- Rebuild WebGL: `src/client/webgl.ts`
- Client app logic: `src/client/main.ts`, `src/client/motion.ts`, `src/client/audio.ts`
- Project templates: `src/pages/index.astro`, `src/pages/[slug].astro`, `src/components/MediaBlock.astro`
- Project data: `src/data/projects.json`, `src/data/site.ts`
- Main validation tools:
  - `scripts/audit-renderer-output.mjs`
  - `scripts/probe-output-color.mjs`
  - `scripts/probe-thumb-spotlight.mjs`
  - `scripts/probe-about-scroll-opacity.mjs`
  - `scripts/probe-project-media.mjs`

## Latest Batch

`9986590` aligned source `TD` about destroy spotlight-map ownership.

Source evidence:

- `TD.addEvents()` binds `J.workScene.spotLight.map` to the character composite texture after the `100ms` delay.
- `TD.animateOut()` only tweens reveal state and calls `Se.setSpotLightIntensity(0)`.
- `TD.destroy()` removes about RAF, clears about block visibility/tracking, restores `spotLightParallax=true`, and removes character rotatable events.
- `TD.animateOut()` and `TD.destroy()` do not restore `spotLight.map` to the Home thumb composite. Source `SD.init()` owns the later Home map bind.

Implemented result:

- `animateAboutVisualOut()` and `destroyAboutVisualState()` no longer assign `this.spotLight.map = this.homeSpotlightMap()`.
- Runtime probes expose `source-TD-destroy-keeps-current-spotLight-map-SD-init-restores-home-map`.
- The direct about lifecycle probe waits for the source map/initial-scroll delays, calls the destroy helper, and asserts the character composite map is retained.
- Renderer audit rejects reintroducing Home map assignment in about out/destroy.

## Validation Baseline

Latest batch checks that passed:

```sh
node --check src/client/webgl.ts
node --check scripts/probe-output-color.mjs
node --check scripts/probe-about-scroll-opacity.mjs
node --check scripts/audit-renderer-output.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-about-destroy-map-audit.json
ASTRO_TELEMETRY_DISABLED=1 npm run build
git diff --check
```

The recursive false/null audit count was `0`.

Known blocked check:

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7. It is pre-existing and unrelated to the latest WebGL batch.

## Run Locally

```sh
npm install
npm run build
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
```

Open:

```text
http://127.0.0.1:5173/?skip-preloader
http://127.0.0.1:5173/about/?skip-preloader
http://127.0.0.1:5173/gc-2026/?skip-preloader
```

If `5173` is busy, use another port:

```sh
PORT=5174 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
```

## Next Work

Continue Phase 1 in this order:

1. Spotlight/thumb projection content and transfer feel.
   - Already guarded: `SpotLight.map` projection path, `p1.setLights()` constructor no-map/no-target-position ownership, `SD.init()` Home map/position/target/intensity ownership, `TD` direct-about previous-map and destroy-map ownership, `yD.onProjectActive()` spotlight/application order, `T1/x1` thumb scene surface/settings, and `M1/x1` shader text.
   - Still open: the projected thumb content, brightness, depth, and transfer feel are not source-exact.

2. Remaining `kA/Lu/I1` composite and transfer interpretation.
   - Already guarded: many shader surfaces, settings, optional blur chain, target resize ownership, GPU bridge, camera surfaces, and runtime uniform order.
   - Still open: whole-chain transfer/target/composite behavior is not fully source-isomorphic.

3. Floor/environment distribution.
   - Already guarded: scene hierarchy, camera surfaces, environment material ownership, floor reflection draw-state, reflector renderer state, and blur/swap ownership.
   - Still open: visible fog-bed/horizon differs from source. Do not tune brightness/fog without bundle evidence.

4. Mouse/fluid guardrails when interaction paths are touched.
   - The interactive probe exists and should run for mouse/fluid changes.
   - Do not prioritize this unless new source mismatch evidence appears.

## Prompt For A New Agent

```text
We are in the repo `rogierdeboeve-rebuild`. Read `HANDOFF.md`, `REBUILD_PLAN.md`, and `PHASE1_AUDIT.md`.

Goal: continue rebuilding `https://rogierdeboeve.com/` 1:1 using Astro + TypeScript + Three.js + GSAP + Lenis + Howler. Audio must use Howler.

Use the mirrored source bundle as the implementation spec:
- `legacy-mirror/public/assets/bundle.250f01b7.js`
- `legacy-mirror/public/assets/bundle.87ba3613.css`

Do not use screenshots as the primary implementation method. Visual QA is regression/attribution only.

Current state:
- Latest source-alignment commit is `9986590`.
- Phase 1 Home WebGL source parity remains open.
- Home WebGL is source-derived but not 1:1 yet.
- Next focus is spotlight/thumb projection transfer feel, then `kA/Lu/I1` composite/transfer, then floor/environment residuals.
- Project detail media pages are closer and should not regress.

After each source-backed batch, run build, renderer audit, diff checks, relevant browser probes, update docs, and commit.
```

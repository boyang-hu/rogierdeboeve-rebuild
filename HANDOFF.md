# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-07

## Read Order

1. `HANDOFF.md` - fast resume context and immediate next action.
2. `PHASE1_AUDIT.md` - current Phase 1 source-parity audit.
3. `REBUILD_PLAN.md` - execution order and validation matrix.

Historical append-only timelines are not repeated in these docs. Use git only when older archaeology is needed:

```sh
git show 9986590:PHASE1_AUDIT.md
git show 9986590:REBUILD_PLAN.md
```

## Current Snapshot

- Latest production source-alignment batch: `9986590 Align about destroy spotlight map ownership`.
- Active phase: Phase 1, Home WebGL source parity.
- Phase 1 status: open, roughly 65-70% complete.
- Current working tree expectation: clean unless a new batch is in progress.
- Local service expectation: no dev server should be left running after handoff.

Estimated parity:

| Area | Estimate | Read |
| --- | ---: | --- |
| Architecture/lifecycle | 75-80% | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | 65-75% | Many shader surfaces and pass edges are source-shaped; the full `kA/Lu/I1` transfer graph remains open. |
| Final Home visual parity | 55-65% | Home still diverges in spotlight/thumb projection feel and floor/environment distribution. |

## Source Of Truth

- Implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Visual QA is verification and attribution only.
- Do not close a mismatch as an accepted visual deviation unless it is documented as an unavoidable technical bridge.
- Keep the agreed stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must continue to use Howler.
- Do not delete `public/` or `legacy-mirror/`.

## Important Files

- Rebuild WebGL: `src/client/webgl.ts`
- Client logic: `src/client/main.ts`, `src/client/motion.ts`, `src/client/audio.ts`
- Pages/templates: `src/pages/index.astro`, `src/pages/[slug].astro`, `src/components/MediaBlock.astro`
- Data: `src/data/projects.json`, `src/data/site.ts`
- Main validation tools:
  - `scripts/audit-renderer-output.mjs`
  - `scripts/probe-output-color.mjs`
  - `scripts/probe-thumb-spotlight.mjs`
  - `scripts/probe-about-scroll-opacity.mjs`
  - `scripts/probe-project-media.mjs`

## Current Evidence

Latest production batch, `9986590`, aligned source `TD` about destroy spotlight-map ownership:

- `TD.addEvents()` binds `J.workScene.spotLight.map` to the character composite texture after the `100ms` delay.
- `TD.animateOut()` and `TD.destroy()` do not restore the Home thumb composite map.
- `SD.init()` owns the later Home map bind.
- Runtime probes and renderer audit now guard against reintroducing Home map assignment in about out/destroy.

Latest local investigation after that batch:

- `VA-work` shader dump matched the source-shaped vertex and fragment text with zero recorded deltas.
- Work composite, main pre-composite, thumb, floor, environment, media, and fluid shaders were source-shaped.
- Source bundle light chunks and local Three light chunks matched for the relevant spotlight-map path.
- Source `I1` default target behavior was traced: `renderToScreen=true` renders C1 directly to the canvas, and `renderTargetComposite` is unused in the default visible Home path.
- Source `nD` delayed C1 bindings were traced: after the `100ms` delay, `tWork`, `tMedia`, and the initial work mouse-simulation output bind once.
- Full renderer audit currently has zero recursive false/null findings. Browser output and thumb probes pass with source-shaped `I1`, `T1/x1`, floor-reflection, and environment guardrails.

## Next Action

Continue Phase 1 in this order:

1. Continue floor/environment visible residual attribution from source-backed target content and material inputs.
2. Re-check spotlight/thumb projected content only after a concrete source-owned content/timing edge is identified.
3. Keep `kA/Lu/I1` render-target/default-screen behavior as a guardrail, not the primary next suspect, unless new evidence contradicts the current audit.

Do not repeat already-closed checks around spotlight-map multiplication or `w1.updateGalleryProgress()` centered wrapping unless new evidence contradicts the current probes.

## Validation Baseline

Default checks for a Phase 1 rendering batch:

```sh
node --check src/client/webgl.ts
node --check scripts/audit-renderer-output.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-phase1-audit.json
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Known blocked check:

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

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

Stop the server with Ctrl-C after review. If `5173` is busy, use another port.

## Commit Rules

- Work in scoped source-backed batches.
- Update docs and commit code/docs together.
- Use `Boyang Hu <i@boyang.hu>`.
- Do not add an AI co-author.

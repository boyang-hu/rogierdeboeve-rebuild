# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-07

## Start Here

This is the single resume sheet. It answers the current state and the next action only.

| Need | Read |
| --- | --- |
| Where are we now? | This file |
| Why do we believe that? | `PHASE1_AUDIT.md` |
| What exact order should work follow? | `REBUILD_PLAN.md` |
| What happened earlier? | `git log --oneline` and `git show <commit>:<file>` |

The three Markdown files do not maintain separate timelines. Keep history in git.

## Current State

| Item | Value |
| --- | --- |
| Active phase | Phase 1, Home WebGL source parity |
| Phase 1 status | Open, roughly 65-70% complete |
| Current production priority | Floor/environment distribution residuals |
| Next secondary priority | Spotlight/thumb projection transfer feel |
| Latest source-backed guard batch | Cubemap `scene.environment` sampling surface |
| Expected local service | Stopped unless actively reviewing |
| Expected worktree | Clean unless a scoped batch is in progress |

Estimated parity:

| Area | Estimate | Read |
| --- | ---: | --- |
| Architecture/lifecycle | 75-80% | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | 65-75% | Many shader surfaces and pass edges are source-shaped; `kA/Lu/I1` is a guarded follow-up. |
| Final Home visual parity | 55-65% | Home still diverges in spotlight/thumb projection feel and floor/environment distribution. |

## Source Of Truth

- JavaScript bundle: `legacy-mirror/public/assets/bundle.250f01b7.js`
- CSS bundle: `legacy-mirror/public/assets/bundle.87ba3613.css`
- Screenshots and probes are for attribution and regression only.
- Do not tune horizon, fog, floor color, brightness, or projection by eye.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must continue to use Howler.
- Do not delete `public/` or `legacy-mirror/`.

## Next Batch

Continue Phase 1 with floor/environment distribution.

1. Trace the remaining hard horizon and fog-bed difference from source-owned content, timing, material inputs, render target contents, or renderer state.
2. Use the existing attribution probes to choose the next source chain, not to tune production values.
3. Patch only after a concrete source mismatch is identified.
4. Update `PHASE1_AUDIT.md` with the source evidence and `REBUILD_PLAN.md` if the queue changes.
5. Validate and commit the scoped batch.

Do not spend the next batch first on these guarded areas unless new evidence points back at them:

- Cubemap `scene.environment` loader defaults and sampling surface.
- `kA/Lu/I1` default visible target transfer.
- Spotlight-map shader and Three light-chunk multiplication.
- `w1.updateGalleryProgress()` centered wrapping.
- `T1/x1/E1/M1` thumb scene surface.
- Mouse/fluid feel, unless the batch touches interaction paths.

## Important Files

- Rebuild WebGL: `src/client/webgl.ts`
- Client logic: `src/client/main.ts`, `src/client/motion.ts`, `src/client/audio.ts`
- Pages/templates: `src/pages/index.astro`, `src/pages/[slug].astro`, `src/components/MediaBlock.astro`
- Data: `src/data/projects.json`, `src/data/site.ts`
- Core validation tools:
  - `scripts/audit-renderer-output.mjs`
  - `scripts/probe-output-color.mjs`
  - `scripts/probe-thumb-spotlight.mjs`
  - `scripts/probe-project-media.mjs`
  - `scripts/probe-about-scroll-opacity.mjs`

## Validate A Rendering Batch

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

# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-07

## Purpose

This is the current resume sheet. Keep it short and replace stale details instead of appending chronology.

It should answer only:

- where Phase 1 stands now
- what the last committed batch closed
- what to do next
- how to validate the next batch

It is not a timeline. Use git for history.

| Need | Read |
| --- | --- |
| Resume current work | `HANDOFF.md` |
| Check source evidence, blockers, and guarded edges | `PHASE1_AUDIT.md` |
| Decide the next execution order | `REBUILD_PLAN.md` |
| Inspect old document states | `git log --oneline` and `git show <commit>:<file>` |

## Current Snapshot

| Item | Value |
| --- | --- |
| Active phase | Phase 1, Home WebGL source parity |
| Phase 1 status | Open, roughly 65-70% complete |
| Current production priority | Floor/environment distribution residuals |
| Next secondary priority | Spotlight/thumb projection transfer feel |
| Last committed source-backed batch | `d910163` sky composite `V1/H1/z1/B1` target chain and `z1` uniform surface |
| Local service | Stopped unless actively reviewing |
| Expected worktree | Clean after each committed batch; dirty means one scoped batch is in progress |

Estimated parity:

| Area | Estimate | Current read |
| --- | ---: | --- |
| Architecture/lifecycle | 75-80% | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | 65-75% | Many shader surfaces and pass edges are source-shaped; `kA/Lu/I1` is a guarded follow-up. |
| Final Home visual parity | 55-65% | Home still diverges in spotlight/thumb projection feel and floor/environment distribution. |

## Last Closed Batch

The committed source-backed batch closed the sky-composite target-content candidate, not the remaining floor/environment residual.

- Source `V1/H1/z1/B1` renders the sky raw target and cloned composite through `Lo`, using height `*.75` square sizing and no explicit clear.
- Source `z1` declares `uShader1Mix3`, `uShader3Scale`, and `uShaderMix`, but only binds `uShaderMix`; because `Zs.SHADER_1_MIX_3` is missing, the source runtime value is undefined.
- Rebuild already follows this behavior; the audit now rejects reopening that candidate first without new source evidence.

## Current Evidence

The remaining visible gap points back to distribution through environment/floor/final work contents, not to the now-guarded sky target.

- Variant attribution showed environment-off and floor-reflection-off make the largest brightness-distribution moves.
- Sky-off moved the output, but in the opposite direction from the likely residual; sky is not the first suspect.
- Source-vs-rebuild band analysis showed the rebuild is still too bright in mid bands and darker/shifted around the lower floor band.
- `p1.update()` order is guarded: work renders first, then camera/components update for the next frame, so environment `uTime` is next-frame in both source and rebuild.
- `p1.setLights()` is guarded: source adds ambient, spot, spot target, and `directionalLight1`; `directionalLight2` exists but is not added to the scene.

## Source Of Truth

- JavaScript bundle: `legacy-mirror/public/assets/bundle.250f01b7.js`
- CSS bundle: `legacy-mirror/public/assets/bundle.87ba3613.css`
- Screenshots and probes are attribution/regression aids only.
- Do not tune horizon, fog, floor color, brightness, or projection by eye.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must continue to use Howler.
- Do not delete `public/` or `legacy-mirror/`.

## Next Action

Continue Phase 1 with a floor/environment distribution batch:

1. Trace environment target contents beyond the guarded sky composite input.
2. Trace how the floor reflection path receives environment contribution through `a1/i1/o1/t1`.
3. Only if those remain source-shaped, inspect final work distribution and renderer state not yet covered by output-color guards.
4. Patch only after a concrete source mismatch is identified.
5. Update `PHASE1_AUDIT.md` with evidence; update `REBUILD_PLAN.md` only if the execution queue changes.
6. Validate and commit the scoped batch.

Do not spend the next batch first on these guarded areas unless new evidence points back at them:

- Cubemap `scene.environment` loader defaults and sampling surface.
- `p1.addEnvironment()` fire-and-forget cubemap start order.
- `u1` environment vertex/fragment shader text.
- Sky composite `V1/H1/z1/B1` target chain and `z1` uniform surface.
- Renderer constructor clear color/alpha state.
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
  - `scripts/dump-va-shader.mjs`
  - `scripts/probe-output-color.mjs`
  - `scripts/probe-thumb-spotlight.mjs`
  - `scripts/probe-project-media.mjs`
  - `scripts/probe-about-scroll-opacity.mjs`

## Validate A Rendering Batch

```sh
node --check src/client/webgl.ts
node --check scripts/dump-va-shader.mjs
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

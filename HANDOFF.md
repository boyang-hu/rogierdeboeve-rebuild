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
| Phase 1 status | Open, roughly 75-80% complete |
| Current production priority | Spotlight/thumb projection transfer closeout |
| Next secondary priority | Final Home WebGL distribution audit |
| Last committed source-backed batch | Home blocks-color fallback parity |
| Local service | Stopped unless actively reviewing |
| Expected worktree | Clean after each committed batch; dirty means one scoped batch is in progress |

Estimated parity:

| Area | Estimate | Current read |
| --- | ---: | --- |
| Architecture/lifecycle | 80-85% | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | 70-80% | Many shader surfaces and pass edges are source-shaped; `kA/Lu/I1` is a guarded follow-up. |
| Final Home visual parity | 70-80% | Canvas-only Home distribution is now close; remaining work is projection/transfer closeout and final guard coverage. |

## Last Closed Batch

The latest source-backed batch fixed a source-owned active block material mismatch.

- Source `yD.onProjectActive()` calls `Se.setBlocksColor(t.data.colors.blocks || "#000000")`.
- Hashgraph has no `colors.blocks`, so the source fallback is black.
- Rebuild was falling back to `SOURCE_WORK_BG` (`#1a1a1a`), which made the active cube field and projection read too light.
- Rebuild now uses the source black fallback, and browser probes guard expected active emissive.

## Current Evidence

The main mid-field Home WebGL distribution residual has been source-fixed through active block material fallback parity. Remaining P1 work should confirm projection/transfer closeout and final guard coverage.

- Before this batch, canvas-only desktop bands were about `+0.061/+0.068` at `0.45/0.55`; mobile was about `+0.10` at `0.35-0.55`.
- After the source fallback fix, canvas-only desktop center delta is `+0.0027`, with bands within about `-0.0017` to `+0.0040`.
- After the source fallback fix, canvas-only mobile center delta is `-0.0042`, with bands within about `-0.0089` to `+0.0012`.
- A desktop CTA DOM visibility mismatch has been cleared; it was screenshot noise, not the WebGL residual.
- Initial Home WebGL entry lifecycle is now guarded: source-shaped spotlight prep happens before gallery entry, and active-project reveal is not triggered before gallery entry.
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

Continue Phase 1 with a projection/closeout batch:

1. Re-run and inspect spotlight/thumb projection content and transfer probes after the blocks-color fallback fix.
2. Confirm no remaining source-owned mismatch in active block reveal/material state at capture time.
3. If projection remains source-shaped, move to final Home WebGL closeout audit against `PHASE1_AUDIT.md` completion criteria.
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

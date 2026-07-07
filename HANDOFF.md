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
| Active phase | Phase 2, Home DOM/interaction parity audit |
| Phase 1 status | Closed/guarded on 2026-07-07 |
| Current production priority | Phase 2 audit-only pass against online/source behavior |
| Next secondary priority | First source-backed Home DOM/interaction fix batch |
| Last committed source-backed code batch | Home brightness overlay parity, `416c43d` |
| Last closed evidence batch | Online baseline/source mirror drift audit plus Phase 1 closeout |
| Local service | Stopped unless actively reviewing |
| Expected worktree | Clean after each committed batch; dirty means one scoped batch is in progress |

Closeout state:

| Area | State | Current read |
| --- | --- | --- |
| Architecture/lifecycle | Guarded | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | Guarded | Shader surfaces and pass edges are source-shaped; `kA/Lu/I1` has no active Phase 1 mismatch. |
| Final Home visual parity | Guarded | Canvas-only Home distribution and spotlight/thumb transfer are source-guarded; final probe set is clean. |

## Last Closed Batch

The latest committed batch aligned Home page brightness with the source-owned page overlay behavior.

- Rebuild removed the non-source `.gl::after` dark overlay from `src/styles/global.css`.
- `src/client/webgl.ts` now exposes debug-only C1 render-target and Home band probe data for attribution checks.
- Online site versus local source mirror remains visually close in the checked center luma samples: desktop `-0.0012`, mobile `-0.0005`.
- Online site versus rebuild after the overlay removal remains close in the checked center luma samples: desktop `-0.0047`, mobile `-0.0027`.

The earlier Phase 1 closeout remains guarded.

- Source `yD.onProjectActive()` uses `colors.blocks || "#000000"`; rebuild matches this active block fallback.
- Final renderer audit, build, Home desktop/mobile probes, thumb spotlight probe, project media probe, about desktop/mobile probes, and interactive mouse probe passed during closeout.
- Phase 1 has no active blockers in `PHASE1_AUDIT.md`.

## Current Evidence

The main Home brightness residual has been closed through two source-owned findings: active block material fallback parity and removal of a rebuild-only page overlay.

- Before this batch, canvas-only desktop bands were about `+0.061/+0.068` at `0.45/0.55`; mobile was about `+0.10` at `0.35-0.55`.
- After the source fallback fix, canvas-only desktop center delta was `+0.0027`, with bands within about `-0.0017` to `+0.0040`.
- After the source fallback fix, canvas-only mobile center delta was `-0.0042`, with bands within about `-0.0089` to `+0.0012`.
- After removing the rebuild-only Home overlay, online-versus-rebuild center luma deltas were desktop `-0.0047` and mobile `-0.0027` in the latest attribution run.
- A desktop CTA DOM visibility mismatch has been cleared; it was screenshot noise, not the WebGL residual.
- Initial Home WebGL entry lifecycle is now guarded: source-shaped spotlight prep happens before gallery entry, and active-project reveal is not triggered before gallery entry.
- `p1.update()` order is guarded: work renders first, then camera/components update for the next frame, so environment `uTime` is next-frame in both source and rebuild.
- `p1.setLights()` is guarded: source adds ambient, spot, spot target, and `directionalLight1`; `directionalLight2` exists but is not added to the scene.
- Spotlight/thumb projection transfer is guarded: browser probe confirms source `Lo` raw-to-composite transfer order, `SpotLight.map` receives the thumb composite texture, spotlight position/target/intensity match `SD.init()`, and 3x3 active-bounds projection sampling has nonzero map content.
- About lifecycle, project media material lifecycle, and interactive mouse/fluid paths passed their current guard probes.

## Source Of Truth

- Final visual acceptance baseline: `https://rogierdeboeve.com/`.
- Implementation source bundle: `legacy-mirror/public/assets/bundle.250f01b7.js`.
- Implementation CSS bundle: `legacy-mirror/public/assets/bundle.87ba3613.css`.
- Local mirror note: online HTML/CSS/service-worker assets matched the mirror during the drift audit; the local JS bundle intentionally differs where `scripts/mirror-site.mjs` rewrites service-worker registration, `detect-gpu` benchmark URLs, and GPU-check fallback behavior for local serving.
- Screenshots and probes are attribution/regression aids only.
- Do not tune horizon, fog, floor color, brightness, or projection by eye.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must continue to use Howler.
- Do not delete `public/` or `legacy-mirror/`.

## Next Action

Phase 1 is closed. Do not reopen it unless a concrete source-owned mismatch appears.

Recommended next move:

1. Run a Phase 2 audit-only pass on Home DOM, interaction affordances, and route-level user-visible behavior.
2. Convert audit findings into a short source-backed fix queue before editing production code.
3. Keep Phase 1 WebGL, project media, about, and interaction probes as regression gates when shared render or lifecycle paths change.

Guarded Phase 1 areas should not be reopened first without new evidence:

- Cubemap `scene.environment` loader defaults and sampling surface.
- `p1.addEnvironment()` fire-and-forget cubemap start order.
- `u1` environment vertex/fragment shader text.
- Sky composite `V1/H1/z1/B1` target chain and `z1` uniform surface.
- Renderer constructor clear color/alpha state.
- `kA/Lu/I1` default visible target transfer.
- Spotlight-map shader, Three light-chunk multiplication, thumb transfer order, and projection sampling.
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

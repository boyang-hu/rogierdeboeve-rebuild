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
| Active phase | Phase 2, Home DOM/interaction parity follow-up |
| Phase 1 status | Closed/guarded on 2026-07-07 |
| Current production priority | Route/session, sound-choice, and remaining Home interaction checks |
| Next secondary priority | Decide whether Phase 2 can close or needs one more narrow fix batch |
| Last committed source-backed code batch | Phase 2 Home preloader and mobile work-state parity |
| Last closed evidence batch | Phase 2 Home preloader/mobile DOM audit plus WebGL output probes |
| Local service | Running at `http://localhost:5174/` while reviewing |
| Expected worktree | Clean after each committed batch; dirty means one scoped batch is in progress |

Closeout state:

| Area | State | Current read |
| --- | --- | --- |
| Architecture/lifecycle | Guarded | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | Guarded | Shader surfaces and pass edges are source-shaped; `kA/Lu/I1` has no active Phase 1 mismatch. |
| Final Home visual parity | Guarded | Canvas-only Home distribution and spotlight/thumb transfer are source-guarded; final probe set is clean. |

## Last Closed Batch

The latest production batch aligned Home preloader and mobile work-state behavior with the online/source read.

- Preloader markup now uses the source-shaped `.preloader`, `.preloader-cta[data-sound="true"]`, `.preloader-cta-2[data-sound="false"]`, progress text, circle, footer text, and dots structure.
- Preloader timing now waits for WebGL readiness before CTA activation, uses source-shaped progress/CTA intro motion, and removes the preloader through the source `scale: 1.2`, `opacity: 0`, `expo.out` reveal path.
- Home no longer server-renders or immediately initializes an active work item before preloader entry; gallery entry owns the first active state.
- Mobile work title/list behavior now matches the observed online/source computed state: title remains in layout but hidden, cards stay opaque, inactive links are hidden/non-interactive, active link is visible, and the active CTA owns pointer interaction.
- The `?disable-webgl` query is available for DOM audits only; normal users still run WebGL, and visual/WebGL validation remains covered by output probes.

Phase 1 remains closed/guarded in `PHASE1_AUDIT.md`.

## Current Evidence

Latest Phase 2 evidence:

- DOM audit with WebGL disabled for test stability: `/tmp/rd-phase2-home-audit-mobile-final2/home-dom-interaction-audit.json`.
- Desktop WebGL output probe: `/tmp/rd-output-p2-preloader-desktop`.
- Mobile WebGL output probe: `/tmp/rd-output-p2-preloader-mobile`.
- DOM audit result: online and rebuild both removed the preloader after entry, both activated `hashgraph-vc`, both moved to `gc-2026` after wheel input, and both reported `0` checked network failures/runtime exceptions.
- Mobile DOM audit result: title display/visibility, card opacity, link opacity/pointer-events, active link visibility, and active CTA pointer-events matched online.
- WebGL output probes reported no failures/exceptions and preserved active `hashgraph-vc` after entry on desktop and mobile.

Audit method note:

- `/tmp/phase2-home-audit.mjs` launches Chrome with GPU disabled; full WebGL can stall in headless SwiftShader after preloader entry.
- Use `?disable-webgl` for DOM-interaction audits that do not need canvas rendering.
- Use `scripts/probe-output-color.mjs` without `?disable-webgl` for visual/WebGL coverage.

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

Phase 2 Home shell/preloader/mobile-list parity is now closed by the latest batch. Do not call all of Phase 2 complete until the remaining observable Home flows are either matched or explicitly deferred.

Recommended next move:

1. Audit sound choice and audio lifecycle from source/online: preloader sound opt-in/out, persisted sound state, Howler resume/mute behavior, and sound-toggle state after route/session restore.
2. Audit route/session restore: Home to project/about, browser back/forward, `skip-preloader`, re-entry after `rd:has-entered`, and active work restoration.
3. Sweep remaining Home interaction affordances: desktop hover CTA, progressbar click state, touch/drag/keyboard behavior, mobile menu close/open state, and footer/header animation details.
4. Only after those checks are clean, decide whether Phase 2 is complete and move to Phase 3 project-detail media parity.
5. Keep Phase 1 WebGL, project media, about, and interaction probes as regression gates when shared render or lifecycle paths change.

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

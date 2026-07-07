# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-07

## Read This First

This file is the fast resume sheet. It should answer only:

- where the rebuild is now
- what just finished
- what to do next
- how to run or validate it

Use the other docs for deeper detail:

| File | Role |
| --- | --- |
| `HANDOFF.md` | Current snapshot and immediate next action. |
| `PHASE1_AUDIT.md` | Canonical Phase 1 evidence, active blockers, and source-edge ledger. |
| `REBUILD_PLAN.md` | Forward execution order and validation matrix. |

Historical timelines are not maintained in these files. Use git when older archaeology is needed:

```sh
git log --oneline
git show <commit>:PHASE1_AUDIT.md
git show <commit>:REBUILD_PLAN.md
```

## Current Snapshot

| Item | Current value |
| --- | --- |
| Active phase | Phase 1, Home WebGL source parity |
| Phase 1 status | Open, roughly 65-70% complete |
| Current priority | Floor/environment distribution attribution |
| Last completed code batch | `38931a6 Align animate-in texture await semantics` |
| Docs policy | Current-state docs only; use git log for docs-only history. |
| Expected worktree | Clean unless a new batch is in progress |
| Expected local service | Stopped after review |

Estimated parity:

| Area | Estimate | Read |
| --- | ---: | --- |
| Architecture/lifecycle | 75-80% | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | 65-75% | Many shader surfaces and pass edges are source-shaped; `kA/Lu/I1` is a guarded follow-up, not the first suspect. |
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

## Immediate Next Action

Continue Phase 1 with a scoped source-backed batch:

1. Trace the floor/environment visible residual from source-owned content, timing, material inputs, target contents, or renderer state.
2. Avoid repeating already-closed structural checks unless new evidence contradicts them.
3. Patch only after a concrete source mismatch is identified.
4. Update `PHASE1_AUDIT.md` and `REBUILD_PLAN.md` with the source evidence, then commit the batch.

Do not tune horizon, fog, brightness, or floor color by eye.

## Do Not Reopen First

These areas are guarded and should stay secondary unless new probe/source evidence points back at them:

- `kA/Lu/I1` default visible target transfer.
- Spotlight-map shader and Three light-chunk multiplication.
- `w1.updateGalleryProgress()` centered wrapping.
- `T1/x1/E1/M1` thumb scene surface.

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

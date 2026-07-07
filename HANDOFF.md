# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-07

## Read Order

1. `HANDOFF.md` - fast resume context and immediate next action.
2. `PHASE1_AUDIT.md` - current Phase 1 source-parity audit.
3. `REBUILD_PLAN.md` - execution order and validation matrix.

These docs are intentionally state-based, not append-only timelines:

- `HANDOFF.md` answers "where are we and what should happen next?"
- `PHASE1_AUDIT.md` answers "what is still blocking Phase 1, and what source evidence is already closed?"
- `REBUILD_PLAN.md` answers "what order should the next batches run in, and how do we validate them?"

Use git only when older archaeology is needed:

```sh
git show 9986590:PHASE1_AUDIT.md
git show 9986590:REBUILD_PLAN.md
```

## Resume Snapshot

| Item | Current value |
| --- | --- |
| Active phase | Phase 1, Home WebGL source parity |
| Phase 1 status | Open, roughly 65-70% complete |
| Last code-changing source batch | `9986590 Align about destroy spotlight map ownership` |
| Last investigation/doc anchor | `53b13f4 Narrow Phase 1 render-manager follow-up` |
| Expected worktree | Clean unless a new batch is in progress |
| Expected local service | Stopped after review |
| Next production batch | Floor/environment distribution attribution |

Estimated parity:

| Area | Estimate | Read |
| --- | ---: | --- |
| Architecture/lifecycle | 75-80% | Broad scene structure, route ownership, probes, and source guardrails are in place. |
| Shader/render-manager parity | 65-75% | Many shader surfaces and pass edges are source-shaped; `kA/Lu/I1` is now a guarded follow-up, not the first suspect. |
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

## Evidence Location

Use `PHASE1_AUDIT.md` for the active evidence set:

- Current blockers and their priority order.
- Source edges already closed.
- Narrowed non-primary suspects.
- Phase 1 closeout criteria.

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

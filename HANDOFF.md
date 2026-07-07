# Rogier de Boeve Rebuild Handoff

Last updated: 2026-07-07

## Purpose

This is the resume sheet for the rebuild. Keep it current-only: replace stale details instead of appending chronology. Use git history for older batch notes.

| Need | Read |
| --- | --- |
| Resume current work | `HANDOFF.md` |
| Check Phase 1 source evidence and guarded WebGL edges | `PHASE1_AUDIT.md` |
| Decide execution order after a new finding | `REBUILD_PLAN.md` |
| Inspect old document states | `git log --oneline` and `git show <commit>:<file>` |

## Current Snapshot

| Item | Value |
| --- | --- |
| Active production phase | None |
| Overall status | Phase 1 through Phase 6 are closed/guarded as of 2026-07-07 |
| Latest closed batch | Phase 6 final QA and documentation cleanup |
| Last source-backed code batch | Phase 5 audio lifecycle source alignment |
| Current priority | Do not patch unless a new source-owned mismatch is isolated |
| Local service | Dev server is listening at `http://localhost:5173/`; older static service is also listening at `http://127.0.0.1:5174/` |
| Expected worktree | Clean after the Phase 6 docs commit |

## Phase Status

| Phase | Status | Reopen only when |
| --- | --- | --- |
| Phase 1: Home WebGL source parity | Closed/guarded | A concrete Home WebGL, renderer, projection, or interaction mismatch is traced to source ownership. |
| Phase 2: Home DOM/interaction parity | Closed/guarded | A concrete Home DOM, preloader, sound, route, or interaction mismatch is found. |
| Phase 3: Project detail media/routes | Closed/guarded | A concrete project-detail media, scroll, route, or next-project mismatch is found. |
| Phase 4: About and auxiliary pages | Closed/guarded | A concrete About DOM, CSS, motion, route, modal, or auxiliary visual mismatch is found. |
| Phase 5: Transitions/audio/Lenis lifecycle | Closed/guarded | A concrete transition, audio, or page-scroll lifecycle mismatch is found. |
| Phase 6: Final QA/cleanup | Closed/guarded | Final regression gates fail or docs drift from current state again. |

## Latest Evidence

Phase 6 final QA was run against `http://localhost:5173/`.

Static/build checks:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `OUT_DIR=/tmp/rd-phase6-final-renderer node scripts/audit-renderer-output.mjs`
- `git diff --check` before the docs rewrite

Fresh browser probes:

- Home desktop output: `/tmp/rd-phase6-final-home-desktop/summary.json`
  - `failures: 0`, `exceptions: 0`, `consoleMessages: 0`
  - Active project `hashgraph-vc`; desktop CTA parent opacity remains source-shaped at `0`.
- Home mobile output: `/tmp/rd-phase6-final-home-mobile/summary.json`
  - `failures: 0`, `exceptions: 0`, `consoleMessages: 0`
  - Active project `hashgraph-vc`; mobile CTA parent opacity remains source-shaped at `1`.
- Thumb spotlight: `/tmp/rd-phase6-final-thumb/summary.json`
  - `failures: 0`, `exceptions: 0`, `consoleMessages: 0`
  - Raw-to-composite transfer, `SpotLight.map` composite ownership, and thumb projection sampling are source-shaped.
- Project media: `/tmp/rd-phase6-final-project-media/summary.json`
  - `gc-2026` and `hashgraph-vc` each have `5` visible media planes.
  - Shader surfaces, constructor defaults, runtime backgrounds, failures, exceptions, and console messages all pass.
- About desktop: `/tmp/rd-phase6-final-about-desktop/summary.json`
  - `failures: 0`, `exceptions: 0`, `consoleMessages: 0`
  - Desktop scroll opacity is source `1`; destroy lifecycle keeps the current spotlight map.
- About mobile: `/tmp/rd-phase6-final-about-mobile/summary.json`
  - `failures: 0`, `exceptions: 0`, `consoleMessages: 0`
  - Mobile scroll opacity is source `0.3507`; destroy lifecycle keeps the current spotlight map.
- Interactive mouse: `/tmp/rd-phase6-final-mouse/summary.json`
  - Source interaction assertions passed: mouse simulation, active raycast target ownership, input normalization, and main-fluid gating are source-shaped.
  - The dev-server run recorded one canceled Vite script request and two Vite connection logs. This is not a product/source mismatch.
  - The probe ran under SwiftShader fallback GPU tier `1`; source `I1` disables main fluid when `Le.GPU_TIER < 3`, and rebuild matches.

## Source Of Truth

- Final visual acceptance baseline: `https://rogierdeboeve.com/`.
- Implementation source bundle: `legacy-mirror/public/assets/bundle.250f01b7.js`.
- Implementation CSS bundle: `legacy-mirror/public/assets/bundle.87ba3613.css`.
- Local mirror note: online HTML/CSS/service-worker assets matched the mirror during the drift audit. The local JS bundle intentionally differs where `scripts/mirror-site.mjs` rewrites service-worker registration, `detect-gpu` benchmark URLs, and GPU-check fallback behavior for local serving.
- Screenshots and probes are attribution/regression aids only.
- Do not tune horizon, fog, floor color, brightness, projection, sound, or motion by eye.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Do not delete `public/` or `legacy-mirror/`.

## Next Action

No planned production phase remains.

When a new visual or behavioral mismatch is reported:

1. Reproduce it locally and capture the failing route/viewport.
2. Attribute it to the source bundle/CSS or online baseline before changing code.
3. Patch only the source-owned owner path.
4. Run the smallest focused probe plus the affected regression gates.
5. Update docs and commit code/docs together.

Recommended regression gates by area:

| Area touched | Minimum gates |
| --- | --- |
| Home WebGL/rendering | Build, renderer audit, Home desktop/mobile output, thumb spotlight |
| Home DOM/preloader/sound | Build, Home output or DOM probe, audio lifecycle probe if sound path changes |
| Project detail | Build, project media probe, Home output if shared WebGL changed |
| About/auxiliary | Build, About desktop/mobile probe, Home output if spotlight/shared WebGL changed |
| Router/transition/scroll | Build, focused route probe, About/project/Home gates as affected |
| Mouse/fluid/input | Build, interactive mouse probe, Home output |

## Important Files

- Rebuild WebGL: `src/client/webgl.ts`
- Client logic: `src/client/main.ts`, `src/client/motion.ts`, `src/client/audio.ts`
- Pages/templates: `src/pages/index.astro`, `src/pages/[slug].astro`, `src/pages/about.astro`, `src/components/Footer.astro`, `src/components/MediaBlock.astro`
- Data: `src/data/projects.json`, `src/data/site.ts`
- Core validation tools:
  - `scripts/audit-renderer-output.mjs`
  - `scripts/probe-output-color.mjs`
  - `scripts/probe-thumb-spotlight.mjs`
  - `scripts/probe-project-media.mjs`
  - `scripts/probe-about-scroll-opacity.mjs`
  - `scripts/probe-interactive-mouse.mjs`

## Run Locally

```sh
npm install
npm run build
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
```

Open:

```text
http://localhost:5173/
http://localhost:5173/about/
http://localhost:5173/gc-2026/
```

If `5173` is busy, use another port. Stop the server with Ctrl-C after review.

## Known Blocked Check

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

## Commit Rules

- Work in scoped source-backed batches.
- Update docs and commit code/docs together.
- Use `Boyang Hu <i@boyang.hu>`.
- Do not add an AI co-author.

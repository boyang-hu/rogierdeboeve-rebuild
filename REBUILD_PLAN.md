# Rebuild Plan

Last updated: 2026-07-07

## Purpose

This file is the forward execution queue. It is ordered by what to do next, not by when discoveries happened.

Use git for chronology. Keep detailed Phase 1 WebGL evidence in `PHASE1_AUDIT.md`; keep immediate resume state in `HANDOFF.md`.

| File | Role |
| --- | --- |
| `HANDOFF.md` | Current resume snapshot, latest QA, and immediate next action. |
| `PHASE1_AUDIT.md` | Phase 1 source evidence, guarded WebGL edges, blockers, and closeout criteria. |
| `REBUILD_PLAN.md` | Phase gates, reopen triggers, and validation profiles. |

## Current Work Order

There is no active production phase.

The next work item must start from a new concrete finding:

1. Reproduce the mismatch on the affected route and viewport.
2. Attribute ownership to the online baseline, source JS bundle, source CSS bundle, or local-serving mirror rewrite.
3. Patch only source-owned behavior.
4. Run the focused gate for the touched owner path plus any shared regression gates.
5. Update docs and commit code/docs together.

Everything else remains closed and guarded.

## Execution Rules

- Source bundle is the implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Online site is the final visual acceptance baseline: `https://rogierdeboeve.com/`.
- Local mirror is a source oracle with known local-serving rewrites in the JS bundle; do not treat those rewrites as visual product requirements without separate evidence.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- Do not tune visuals, motion, audio, or interaction by eye.
- Work in scoped source-backed batches.
- Each completed production batch updates docs, runs validation, and commits code/docs together.
- Commits use `Boyang Hu <i@boyang.hu>` and no AI co-author.

## Phase Gates

| Phase | Status | Reopen gate |
| --- | --- | --- |
| 1. Home WebGL source parity | Closed/guarded on 2026-07-07 | Concrete source-owned mismatch in Home WebGL distribution, renderer state, spotlight/thumb projection, camera/block material ownership, or mouse/fluid paths. |
| 2. Home DOM/interaction parity | Closed/guarded on 2026-07-07 | Concrete source-owned mismatch in Home DOM, preloader, sound choice, sound lifecycle, route state, work list, progressbar, keyboard, touch, drag, header, or footer behavior. |
| 3. Project detail media/routes | Closed/guarded on 2026-07-07 | Concrete source-owned mismatch in project DOM, desktop/mobile media, WebGL media payloads, page scroll, scrollbar, header fade, next-project behavior, or project routes. |
| 4. About and auxiliary pages | Closed/guarded on 2026-07-07 | Concrete source-owned mismatch in About DOM/CSS, split text, footer, credits modal, route leave/entry, scroll CTA, scrollbar, mobile layout, or auxiliary WebGL lifecycle. |
| 5. Transitions/audio/Lenis lifecycle | Closed/guarded on 2026-07-07 | Concrete source-owned mismatch in `BD/zD/HD`, nav active state, page Lenis ownership, scroll reset, Howler initialization, sound binding, or mobile sound behavior. |
| 6. Final QA/cleanup | Closed/guarded on 2026-07-07 | Final regression gate failure, stale docs, dirty worktree, or a new source-owned mismatch found during review. |

## Closed Phase Matrix

| Phase | Current guarded read | Key gates |
| --- | --- | --- |
| Phase 1 | Home WebGL distribution, renderer state, C1/kA/Lu/I1 pass ownership, active block fallback, removed non-source overlay, spotlight/thumb projection, and mouse/fluid guardrails are source-shaped. | Build, renderer audit, Home desktop/mobile output, thumb spotlight, project media, About desktop/mobile, interactive mouse. |
| Phase 2 | Home shell, preloader, sound choice, runtime state, work list, progressbar, keyboard/touch/drag, mobile nav, and footer interactions are source-shaped. | Build, Home DOM/output probes, audio lifecycle probe when sound changes. |
| Phase 3 | Project detail DOM, media DOM, WebGL media payloads, page scroll, scrollbar, header fade, next-project switching, and route behavior are source-shaped. | Build, project media, project route/scroll probe, Home output if shared WebGL changes. |
| Phase 4 | About DOM/CSS, split text, footer/credits modal, route lifecycle, scroll CTA/scrollbar, mobile layout, and auxiliary WebGL lifecycle are source-shaped. | Build, About desktop/mobile, renderer audit/Home output if shared WebGL changes. |
| Phase 5 | Lenis/page scroll ownership, transition/nav ownership, and audio lifecycle are source-shaped. | Build, focused Lenis/transition/audio probes, affected About/Home/Project gates. |
| Phase 6 | Broad final QA is clean; docs are reduced to current state and reopen criteria. | Build, renderer audit, Home desktop/mobile output, thumb spotlight, project media, About desktop/mobile, interactive mouse, `git diff --check`. |

## Phase 6 Final QA

Latest clean evidence is recorded in `HANDOFF.md`.

Fresh Phase 6 artifacts:

- `/tmp/rd-phase6-final-renderer/summary.json`
- `/tmp/rd-phase6-final-home-desktop/summary.json`
- `/tmp/rd-phase6-final-home-mobile/summary.json`
- `/tmp/rd-phase6-final-thumb/summary.json`
- `/tmp/rd-phase6-final-project-media/summary.json`
- `/tmp/rd-phase6-final-about-desktop/summary.json`
- `/tmp/rd-phase6-final-about-mobile/summary.json`
- `/tmp/rd-phase6-final-mouse/summary.json`

Interactive mouse note:

- The interaction assertions passed.
- The dev-server run recorded one canceled Vite script request and two Vite connection logs.
- The run used SwiftShader fallback GPU tier `1`; source `I1` disables main fluid when `Le.GPU_TIER < 3`, and rebuild matches.

## Reopen Queue

Use this order when a new issue appears:

1. Classify the issue by owner path: Home WebGL, Home DOM, Project, About, transition/router, Lenis, audio, or mouse/fluid.
2. Check source evidence first in `legacy-mirror/public/assets/bundle.250f01b7.js` and `legacy-mirror/public/assets/bundle.87ba3613.css`.
3. Compare with the online baseline only after accounting for known local mirror rewrites.
4. Patch narrowly.
5. Run focused validation and at least one shared regression gate if the change touches shared WebGL/router/audio/scroll state.

Do not reopen a phase because it is old or because a visual difference feels plausible. Reopen only when the source owner is concrete.

## Watchlist

These are not active tasks. They are the first places to inspect if a related regression appears.

| System | Guarded edge |
| --- | --- |
| Online baseline | Online site is final visual acceptance; local mirror is implementation oracle with known local JS rewrites. |
| Home brightness | Prior residuals were source-owned by block color fallback and a rebuild-only overlay; both are closed. |
| Renderer | Source `qw` has no constructor `setClearColor`; probes guard default clear color and alpha. |
| GPU tier | Source `I1` main fluid is `Le.GPU_TIER >= 3`; SwiftShader tier 1 disables it. |
| Spotlight/thumb | `SD.init()` owns Home spotlight map/position/target/intensity; thumb `Lo` raw-to-composite transfer feeds `SpotLight.map`. |
| Audio | Source `ln.initSounds()` owns Howler construction; muted hover/click/woosh/plucks events do not initialize sounds. |
| Lenis | Home does not own page Lenis; About and Project do through source `Ug`. |
| About destroy | `TD.destroy()` keeps current spotlight map; later Home `SD.init()` restores Home map. |

## Non-Goals

- Do not make production edits before source ownership is isolated.
- Do not introduce screenshot-driven tuning.
- Do not refactor closed phases without a shared-owner finding.
- Do not treat local mirror JS rewrites as product behavior without checking online/source ownership.
- Do not broaden DOM/text splitters, route hooks, sound hooks, or WebGL probes just for cleanup.

## Validation Profiles

Docs-only cleanup:

```sh
git diff --check
```

Default build/static check:

```sh
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Rendering/WebGL batch:

```sh
node --check src/client/webgl.ts
node --check scripts/audit-renderer-output.mjs
OUT_DIR=/tmp/rd-renderer node scripts/audit-renderer-output.mjs
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Browser probes while a local server is active:

```sh
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs

CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-home-desktop CDP_PORT=9301 REBUILD_URL=http://localhost:5173/ node scripts/probe-output-color.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-home-mobile CDP_PORT=9302 VIEWPORT=mobile REBUILD_URL=http://localhost:5173/ node scripts/probe-output-color.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-thumb CDP_PORT=9303 REBUILD_URL=http://localhost:5173/ node scripts/probe-thumb-spotlight.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-media CDP_PORT=9304 REBUILD_URL=http://localhost:5173 PROJECT_SLUGS=gc-2026,hashgraph-vc node scripts/probe-project-media.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-about CDP_PORT=9305 REBUILD_URL=http://localhost:5173/about/ node scripts/probe-about-scroll-opacity.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-mouse CDP_PORT=9306 REBUILD_URL=http://localhost:5173/ node scripts/probe-interactive-mouse.mjs
```

Known blocked check:

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

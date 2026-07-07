# Rebuild Plan

Last updated: 2026-07-07

## How To Use This

This file is the forward execution queue. It is ordered by what to do next, not by discovery date.

| File | Role |
| --- | --- |
| `HANDOFF.md` | Current resume snapshot and immediate next action. |
| `PHASE1_AUDIT.md` | Phase 1 evidence, blockers, and source-edge ledger. |
| `REBUILD_PLAN.md` | Work queue, gates, and validation profiles. |

Do not use this file as a history log. Use git for old plans.

## Execution Rules

- Source bundle is the implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- Work in scoped source-backed batches.
- Each completed production batch updates docs, runs validation, and commits code/docs together.
- Commits use `Boyang Hu <i@boyang.hu>` and no AI co-author.

## Phase Gates

| Phase | Status | Gate to advance |
| --- | --- | --- |
| 1. Home WebGL source parity | In progress, about 65-70% complete | Close the Phase 1 blockers in `PHASE1_AUDIT.md`. |
| 2. Home DOM/interaction parity | Paused | Resume only after Phase 1 closes. |
| 3. Project detail media | Stable regression gate | Keep checking when shared render/media paths change. |
| 4. About and auxiliary pages | Partial guardrails in place | Broader page parity waits until Home WebGL is stable. |
| 5. Transitions/audio/Lenis lifecycle | Pending | Do not start before Phase 1 closes. |
| 6. Final QA/cleanup | Pending | Requires Phase 1-5 completion. |

## Now

### 1. Floor/environment distribution

Goal: explain and fix the remaining hard horizon and fog-bed residual from source-owned behavior.

Work path:

1. Continue source-backed attribution in `a1/i1/o1/t1`, `h1/u1/l1/c1`, `V1/H1/z1/B1`, and their target contents.
2. Treat current structural guardrails as closed unless new evidence contradicts them.
3. Look for source asset properties, async timing, render target contents, material inputs, or renderer state before changing production behavior.
4. Do not tune horizon, fog, brightness, or floor color by eye.

Required validation:

- Build.
- Renderer audit.
- Desktop/mobile output probes.
- Project media probe if shared render/media paths change.
- Focused band/capture attribution when the candidate source chain affects final color distribution.

## Next

### 2. Spotlight/thumb projection content and transfer

Goal: close projected thumb brightness, depth, content transfer, and timing.

Current boundary:

- Shader, light-chunk, and `T1/x1/E1/M1` scene-surface evidence currently looks source-shaped.
- Do not repeat the already-verified spotlight-map shader/light-chunk path unless new evidence appears.

Required validation:

- Build.
- Renderer audit.
- Desktop/mobile output probes.
- Thumb spotlight probe.
- Project media probe.

## Watchlist

### 3. `kA/Lu/I1` composite and transfer

Use this only if new evidence contradicts the current audit.

Current boundary:

- Source `I1.renderToScreen=true` renders C1 directly to screen.
- `renderTargetComposite` is unused for the default visible Home path.
- Source `nD` binds C1 `tWork`, `tMedia`, and initial work mouse-simulation texture once after the delayed resize/bind phase.

### 4. Interaction/mouse/fluid

Use this when a batch touches mouse/fluid paths or when a specific interaction regression is isolated.

Current boundary:

- Existing `Ka`, `ag`, and `qT` guardrails remain active.
- Run `scripts/probe-interactive-mouse.mjs` for mouse/fluid path changes.

## Non-Goals For The Current Phase 1 Batch

- Do not start Phase 2.
- Do not accept visual deviations as Phase 1 closeout.
- Do not introduce screenshot-driven production tuning.
- Do not refactor unrelated WebGL systems while chasing one source chain.
- Do not change project-detail media behavior unless source evidence requires it.
- Do not repeat already-verified `I1` default screen/render-target behavior without new evidence.

## Validation Profiles

Docs-only cleanup:

```sh
git diff --check
```

Default rendering batch:

```sh
node --check src/client/webgl.ts
node --check scripts/audit-renderer-output.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-phase1-audit.json
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Browser probes while a local server is active:

```sh
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
node --check scripts/probe-output-color.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-output CDP_PORT=9301 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-output-color.mjs
node --check scripts/probe-thumb-spotlight.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-thumb CDP_PORT=9302 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-thumb-spotlight.mjs
node --check scripts/probe-project-media.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-media CDP_PORT=9303 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-project-media.mjs
```

Add when relevant:

```sh
node --check scripts/probe-about-scroll-opacity.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-about CDP_PORT=9304 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-about-scroll-opacity.mjs
node --check scripts/probe-interactive-mouse.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-mouse CDP_PORT=9305 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-interactive-mouse.mjs
```

Known blocked check:

```sh
npm exec tsc -- --noEmit --pretty false
```

This remains blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

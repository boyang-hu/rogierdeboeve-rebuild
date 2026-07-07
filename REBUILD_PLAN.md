# Rebuild Plan

Last updated: 2026-07-07

## Purpose

This file is the forward execution queue. It is ordered by what to do next, not by when discoveries happened.

If a completed item still matters, keep it in a guarded list. Do not preserve old batch notes as a second timeline, and do not copy detailed evidence here from `PHASE1_AUDIT.md`.

| File | Role |
| --- | --- |
| `HANDOFF.md` | Current resume snapshot and immediate next action. |
| `PHASE1_AUDIT.md` | Phase 1 source evidence, guarded edges, blockers, and closeout criteria. |
| `REBUILD_PLAN.md` | Work queue, phase gates, and validation profiles. |

Use git for history. Do not maintain a second timeline here.

## Current Work Order

The current order is intentionally narrow:

1. Finish Phase 1 Home WebGL source parity.
2. Run final Home WebGL closeout against the current guarded evidence.
3. Prepare the Phase 1 closeout package if the final probe set stays clean.
4. Reopen `kA/Lu/I1`, interaction, project media, or about pages only when evidence or touched code requires it.

Everything else stays paused until Phase 1 is closed or explicitly re-scoped.

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
| 1. Home WebGL source parity | In progress, about 80-85% complete | Close the Phase 1 blockers in `PHASE1_AUDIT.md`. |
| 2. Home DOM/interaction parity | Paused | Resume only after Phase 1 closes. |
| 3. Project detail media | Stable regression gate | Keep checking when shared render/media paths change. |
| 4. About and auxiliary pages | Partial guardrails in place | Broader page parity waits until Home WebGL is stable. |
| 5. Transitions/audio/Lenis lifecycle | Pending | Do not start before Phase 1 closes. |
| 6. Final QA/cleanup | Pending | Requires Phase 1-5 completion. |

## Phase 1 Queue

### Active: Final Home WebGL closeout audit

Goal: determine whether Phase 1 can close with the current guarded evidence, or identify one concrete source-owned mismatch to patch.

Current read:

- The prior mid-field brightness residual was source-owned by block color fallback: source uses `colors.blocks || "#000000"`, and rebuild now matches.
- Canvas-only source/rebuild deltas are now close on desktop and mobile after the fallback fix.
- Spotlight/thumb projection transfer is guarded: source-shaped `Lo` raw-to-composite transfer, `SpotLight.map` composite binding, spotlight state, thumb scene state, and active-bounds projection sampling all pass runtime probes.
- The active suspect set is now final P1 closeout coverage, not a specific visual-tuning lane.
- The current attribution basis lives in `PHASE1_AUDIT.md`.
- Do not promote a visual tweak into production unless the source path owns it.

Already guarded for this lane:

- Scene and `sceneWrap` hierarchy.
- Home camera surfaces.
- Environment hierarchy/material ownership.
- `u1` environment shader surface: source `l1` fragment and source `c1` vertex.
- Sky composite `V1/H1/z1/B1` target chain, height-based square sizing, post-render `uTime`, delayed repeat `tSky` binding, and source `z1` declared-only uniform behavior.
- Cubemap `scene.environment` loader defaults and sampling fields.
- `p1.addEnvironment()` fire-and-forget cubemap start order before floor/env sceneWrap attachment.
- Renderer constructor clear state: source `qw` has no `setClearColor`, and probes guard default clear color/alpha.
- Floor material inputs, reflection draw-state, reflector camera/renderer state, blur/swap ownership, and target sizing.
- Texture-object await semantics for `nD.animateIn()`.
- Home active CTA desktop visibility as screenshot-noise guard: parent hidden until hover, mobile visible.
- Initial Home entry lifecycle: `SD.init()`-shaped spotlight prep happens before gallery entry, while WebGL active-project reveal waits for gallery entry.
- Active block emissive fallback: `colors.blocks || "#000000"`.
- Spotlight/thumb transfer order, composite map ownership, active-project spotlight state, and 3x3 projection sampling.

Next source candidates, in order:

1. Final Home WebGL closeout audit against `PHASE1_AUDIT.md`.
2. Environment/floor or final target distribution only if the closeout audit reveals a new source-owned mismatch.
3. Renderer state not yet covered by existing output-color audit guards.
4. Phase 1 closeout documentation and regression probe package.

Rules:

- Continue source-backed attribution in project activation/reveal ownership, `a1/i1/o1/t1`, `h1/u1/l1/c1`, environment target contents, and final work target distribution.
- Treat current structural guardrails as closed unless new evidence contradicts them.
- Do not tune horizon, fog, brightness, or floor color by eye.
- Keep detailed findings in `PHASE1_AUDIT.md`; keep this file as the next-action queue.

Required validation:

- Build.
- Renderer audit.
- Desktop/mobile output probes when production behavior changes.
- Project media probe if shared render/media paths change.
- Focused band/capture attribution when the candidate source chain affects final color distribution.

### Guarded: Spotlight/thumb projection content and transfer

Goal: keep projected thumb brightness, depth, content transfer, and timing guarded while final closeout proceeds.

Current boundary:

- Shader, light-chunk, and `T1/x1/E1/M1` scene-surface evidence currently looks source-shaped.
- Runtime probe confirms source `Lo` transfer order, `SpotLight.map` composite texture ownership, spotlight state, thumb composite state, and 3x3 projection sampling.
- Do not repeat the already-verified spotlight-map shader/light-chunk path unless new evidence appears.

Required validation:

- Build.
- Renderer audit.
- Desktop/mobile output probes.
- Thumb spotlight probe.
- Project media probe.

## Watchlist

### `kA/Lu/I1` composite and transfer

Use this only if new evidence contradicts the current audit.

Current boundary:

- Source `I1.renderToScreen=true` renders C1 directly to screen.
- `renderTargetComposite` is unused for the default visible Home path.
- Source `nD` binds C1 `tWork`, `tMedia`, and initial work mouse-simulation texture once after the delayed resize/bind phase.

### Interaction/mouse/fluid

Use this when a batch touches mouse/fluid paths or when a specific interaction regression is isolated.

Current boundary:

- Existing `Ka`, `ag`, and `qT` guardrails remain active.
- Run `scripts/probe-interactive-mouse.mjs` for mouse/fluid path changes.

## Non-Goals For The Active Phase 1 Batch

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
node --check scripts/dump-va-shader.mjs
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

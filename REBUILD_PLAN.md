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

1. Keep Phase 1 closed unless new source-owned evidence requires reopening.
2. Run the Phase 2 Home DOM/interaction audit against the online site and source bundle.
3. Convert the audit into one small source-backed Home fix batch at a time.
4. Keep project media, about, and interaction probes as regression gates when shared paths change.

Everything outside Home DOM/interaction stays paused unless the audit identifies a shared-path dependency.

## Execution Rules

- Source bundle is the implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Online site is the final visual acceptance baseline: `https://rogierdeboeve.com/`.
- Local mirror is a source oracle with known local-serving rewrites in the JS bundle; do not treat those rewrites as visual product requirements without separate evidence.
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- Work in scoped source-backed batches.
- Each completed production batch updates docs, runs validation, and commits code/docs together.
- Commits use `Boyang Hu <i@boyang.hu>` and no AI co-author.

## Phase Gates

| Phase | Status | Gate to advance |
| --- | --- | --- |
| 1. Home WebGL source parity | Closed on 2026-07-07 | Reopen only with concrete source-owned mismatch evidence. |
| 2. Home DOM/interaction parity | Audit started | First pass identifies source-backed DOM/interaction gaps before production edits. |
| 3. Project detail media | Stable regression gate | Keep checking when shared render/media paths change. |
| 4. About and auxiliary pages | Partial guardrails in place | Broader page parity waits until Home WebGL is stable. |
| 5. Transitions/audio/Lenis lifecycle | Pending | Start after Phase 2-4 scope is accepted. |
| 6. Final QA/cleanup | Pending | Requires Phase 1-5 completion. |

## Phase 1 Closed Record

### Closed: Final Home WebGL closeout audit

Goal: keep the closeout evidence easy to verify and avoid reopening guarded Phase 1 systems without new source-owned evidence.

Current read:

- The prior mid-field brightness residual was source-owned by block color fallback: source uses `colors.blocks || "#000000"`, and rebuild now matches.
- The later page-composite brightness residual was caused by a rebuild-only `.gl::after` dark overlay; source has no matching overlay, and rebuild now removes it.
- Online site is the final visual baseline. Local source mirror remains usable as a source oracle, with known local JS rewrites for service worker, `detect-gpu` benchmark URL, and GPU-check fallback.
- Canvas-only source/rebuild deltas are now close on desktop and mobile after the fallback fix.
- Spotlight/thumb projection transfer is guarded: source-shaped `Lo` raw-to-composite transfer, `SpotLight.map` composite binding, spotlight state, thumb scene state, and active-bounds projection sampling all pass runtime probes.
- Final closeout probes passed for Home desktop/mobile, thumb projection, project media, about desktop/mobile, and interactive mouse.
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

Reopen candidates, in order:

1. Home WebGL distribution only if a new capture/probe reveals a source-owned mismatch.
2. Environment/floor or final target distribution only if the evidence points there.
3. Renderer state only if output-color audit guards fail.
4. Spotlight/thumb projection only if transfer, map, or sampling guards fail.

Rules:

- Continue source-backed attribution if Phase 1 is reopened.
- Treat current structural guardrails as closed unless new evidence contradicts them.
- Do not tune horizon, fog, brightness, or floor color by eye.
- Keep detailed findings in `PHASE1_AUDIT.md`; keep this file as the next-action queue.

Closeout validation:

- Build.
- Renderer audit.
- Desktop/mobile output probes.
- Thumb spotlight probe.
- Project media probe.
- About desktop/mobile probes.
- Interactive mouse probe.

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

### Phase 2 Home DOM/interaction parity

This is the active production lane. Start with audit-only work before production edits.

Initial boundary:

- Keep Phase 1 WebGL probes as regression gates.
- Start from Home DOM state, interaction affordances, and route-level user-visible behavior.
- Do not reopen WebGL source parity unless a Phase 2 finding identifies a concrete shared-path mismatch.

Audit checklist:

- Home DOM structure and text against online/source.
- Header, nav, mobile menu, and footer visible states.
- Preloader and sound-choice flow.
- Work list active state, CTA visibility, progress bar, and pointer affordances.
- Wheel, keyboard, touch, drag, hover, and click behavior.
- Home-to-project/about route behavior and state restoration.
- Howler sound event timing only where source behavior is observable or source-owned.

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

## Non-Goals For The Active Phase 2 Audit

- Do not make production edits before a source-backed Phase 2 finding is isolated.
- Do not reopen Phase 1 WebGL systems for DOM or interaction differences without a concrete shared-path mismatch.
- Do not introduce screenshot-driven tuning.
- Do not refactor project-detail, about, audio, or transition systems unless Home audit evidence points to a shared owner.
- Do not treat local mirror JS rewrites as product behavior without checking the online site or original source ownership.

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

# Rebuild Plan

Last updated: 2026-07-07

## Document Map

- `HANDOFF.md`: quick resume document for the current repo state.
- `PHASE1_AUDIT.md`: active Phase 1 audit and source-parity closeout criteria.
- `REBUILD_PLAN.md`: forward execution plan and recent clean timeline.

Historical long-form timelines were intentionally collapsed. The last full historical docs are available from commit `9986590`, for example:

```sh
git show 9986590:REBUILD_PLAN.md
git show 9986590:PHASE1_AUDIT.md
```

## Execution Rules

- Source bundle is the implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- Work in scoped source-backed batches.
- Each completed batch updates docs, runs validation, and commits code/docs together.
- Commits use `Boyang Hu <i@boyang.hu>` and no AI co-author.
- Replace any temporary `current batch` row with the real commit hash before committing. Do not let stale `current batch` rows accumulate.

## Phase Status

| Phase | Status | Notes |
| --- | --- | --- |
| 1. Home WebGL source parity | In progress | Active priority. About 65-70% complete. |
| 2. Home DOM/interaction parity | Paused | Resume after Phase 1 closes. |
| 3. Project detail media | Stable regression gate | Keep checking when shared render/media paths change. |
| 4. About and auxiliary pages | Partial guardrails in place | About visual lifecycle is guarded; broader page parity is later. |
| 5. Transitions/audio/Lenis lifecycle | Pending | Do not start before Phase 1 closes. |
| 6. Final QA/cleanup | Pending | Requires Phase 1-5 completion. |

## Recent Timeline

| Commit | Area | Result |
| --- | --- | --- |
| `9986590` | `TD` About Destroy Spotlight Map Ownership | About out/destroy now keeps the current spotlight map, matching source `TD`; `SD.init()` owns the later Home map bind. |
| `a42e975` | `p1/SD/TD` Spotlight Init Lifecycle Ownership | Spotlight constructor leaves map/target defaults; `SD.init()` owns Home map, target, position, and intensity. |
| `a69ad3a` | `Ir/GT` Main Fluid Bounded Pass Geometry Ownership | Main-fluid bounded passes use source geometry and default culling; force pass remains fullscreen. |
| `fe213c1` | `Lu` Work Luminosity Branch Ownership | Work luminosity branch runs before bloom and remains independent from bloom enablement. |
| `f6e84c4` | `Lu/I1` Optional Blur Target Resize Ownership | Optional blur target chain and resize input ownership match source. |
| `cdbbde7` | `eD/Pe` Character Camera Pan Mouse Ownership | About character camera pan consumes shared source normalized mouse state. |
| `dcb3ed6` | `VA/XA` uCoords Direct Viewport Ownership | Work/about material coords use direct viewport times capped DPR, no rebuild clamp. |
| `c0b2e42` | `IT` Camera Update Denominator Ownership | Home camera update uses direct viewport denominators. |
| `0441731` | `VA/XA/KA` Program Cache Key Ownership | Block materials rely on Three default `onBeforeCompile` cache keys. |
| `02f0b0d` | `h1/u1` Program Cache Key Ownership | Environment material relies on Three default `onBeforeCompile` cache key. |

## Active Phase 1 Plan

1. Spotlight/thumb projection content and transfer.
   - Inspect source around `SD`, `yD`, `T1`, `w1`, `E1`, `M1`, `x1`, `p1`, and the spotlight projection path.
   - Target remaining mismatches in projected thumb brightness, depth, content transfer, and timing.
   - Required checks: build, renderer audit, desktop/mobile output probes, thumb spotlight probe, project media probe.

2. `kA/Lu/I1` composite and transfer interpretation.
   - Inspect remaining render-target ownership, target inputs, composite texture transfer, and default enabled/disabled branches.
   - Avoid repeating already guarded settings, GPU bridge, camera surfaces, optional blur target chain, or runtime uniform order.
   - Required checks: build, renderer audit, desktop/mobile output probes, project media probe. Add shader dump/capture only when shader or transfer surfaces change.

3. Floor/environment distribution.
   - Inspect source-backed differences in `a1/i1/o1/t1`, `h1/u1/l1/c1`, `V1/H1/z1/B1`, and their target content.
   - Do not tune horizon, fog, brightness, or floor color by eye.
   - Required checks: build, renderer audit, desktop/mobile output probes, project media probe, and focused band/capture attribution when relevant.

4. Interaction/mouse/fluid follow-up only if touched.
   - Keep existing `Ka`, `ag`, and `qT` guardrails.
   - Run `scripts/probe-interactive-mouse.mjs` for mouse/fluid path changes.

## Non-Goals For The Next Batch

- Do not start Phase 2.
- Do not accept visual deviations as Phase 1 closeout.
- Do not introduce screenshot-driven production tuning.
- Do not refactor unrelated WebGL systems while chasing one source chain.
- Do not change project-detail media behavior unless the source evidence requires it.

## Verification Baseline

Always run:

```sh
node --check src/client/webgl.ts
node --check scripts/audit-renderer-output.mjs
node scripts/audit-renderer-output.mjs > /tmp/rd-phase1-audit.json
git diff --check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Run relevant browser probes while a local server is active:

```sh
PORT=5173 ENABLE_CONTENT_JSON_FALLBACK=1 node scripts/serve.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-output CDP_PORT=9301 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-output-color.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-thumb CDP_PORT=9302 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-thumb-spotlight.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-media CDP_PORT=9303 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-project-media.mjs
```

Add these when relevant:

```sh
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-about CDP_PORT=9304 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-about-scroll-opacity.mjs
CHROME_PATH=/home/boyang/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome OUT_DIR=/tmp/rd-mouse CDP_PORT=9305 REBUILD_URL=http://127.0.0.1:5173 node scripts/probe-interactive-mouse.mjs
```

Known blocked check:

```sh
npm exec tsc -- --noEmit --pretty false
```

This is blocked by the existing TypeScript config deprecation around `baseUrl` under TS7.

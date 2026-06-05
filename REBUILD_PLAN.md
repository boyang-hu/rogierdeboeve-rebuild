# Rebuild Plan

Last updated: 2026-06-05

## Execution Rules

- Use the mirrored original bundle as the implementation spec:
  - `legacy-mirror/public/assets/bundle.250f01b7.js`
  - `legacy-mirror/public/assets/bundle.87ba3613.css`
- Keep the stack: Astro, TypeScript, Three.js, GSAP, Lenis, Howler.
- Audio must use Howler.
- Do not delete `public/` or `legacy-mirror/`.
- After each completed small step:
  - update this document,
  - run build and diff checks,
  - run a browser smoke/QA check when relevant,
  - commit the code and this document together.
- Commits use `Boyang Hu <i@boyang.hu>` and no AI co-author.

## Phase Status

1. Home WebGL source parity: in progress.
2. Home DOM and interaction parity: in progress.
3. Project detail media system: stable, monitor for regressions.
4. About and auxiliary pages: pending.
5. Global transitions, state, audio, Lenis lifecycle: pending.
6. Final source/visual QA and cleanup: pending.

## Completed Steps

| Commit | Area | Progress |
| --- | --- | --- |
| `cb499d9` | Home WebGL | Added source-style `wavvesScene/k1` displacement pass for work cubes. |
| `cd1a3a9` | Home WebGL | Aligned main home composite with source `A1/C1` shader behavior using `tNoise`, `tPerlin`, RGB shift, mouse-flow distortion, and blend operations. |
| `1c31149` | Home WebGL | Refined mouse simulation toward source `Ka`: old/new/target pointer state, delta-based lerp, persistence, brush thickness, and flow channels. |
| `d1a8f00` | Home WebGL | Drove work cube displacement with source-style Perlin texture and restored stronger mouse Z displacement. |
| `7f35f97` | Home WebGL | Aligned mouse UV projection with source `uUvOffset/uUvOffsetScale` and enlarged ray plane mapping. |
| `efe5786` | Home WebGL | Added lightweight work-scene bloom compensation based on source `kA/OA` luminosity and bloom settings. |
| `9ff9453` | Home DOM | Added source-style work CTA magnet movement from source `gD`. |

## Current Focus

Continue Phase 2, Home DOM and interaction parity, while keeping Phase 1 WebGL improvements stable.

Immediate source targets:

- `yD`: work gallery virtual scroll, pointer/drag state, snap timing, keyboard/mouse/touch behavior.
- `vD`: work nav click behavior and active project event flow.
- `gD`: CTA formatting, magnet, animate in/out, click sound behavior.
- `_D`: progressbar click behavior and active state.
- `SD`: page-level init/animate-in/out and source state wiring.

## Next Candidate Steps

1. Compare source `yD` against `src/client/main.ts` virtual gallery logic and align pointer-drag state or snap behavior if a low-risk mismatch is found.
2. Align progressbar dataset/event behavior with source `_D` while preserving current `data-progress-slug` markup or update markup if needed.
3. Improve home animate-in/animate-out sequencing for nav/title/footer/CTA to better match `SD/vD/gD`.
4. Revisit WebGL spotlight/thumb projection after DOM interaction parity no longer creates obvious mismatches.
5. Start About page source analysis once home first-viewport behavior is closer.

## Verification Baseline

Run after each completed step:

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build
git diff --check
```

For local smoke:

```sh
PORT=5173 SERVE_ROOT=dist FALLBACK_ROOT=public node scripts/serve.mjs
```

Open:

```text
http://127.0.0.1:5173/?skip-preloader
http://127.0.0.1:5173/gc-2026/?skip-preloader
```

Browser smoke should confirm:

- home loads the latest JS bundle,
- project pages keep `.gl-canvas`,
- project pages keep desktop `[data-media][data-media-src]` tracks,
- no WebGL shader/runtime errors in available logs.


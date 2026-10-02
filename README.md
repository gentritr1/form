# FORM: Sculpture Studio Edition

A fictional digital sculpture exhibition for a frontend portfolio. Three original mathematical sculptures, live material and surface controls, and a generated chrome-and-cobalt still life.

## Run

Node 18 or newer. No installation or runtime dependencies.

```sh
npm run dev
```

Open http://127.0.0.1:4173. You can also open the self-contained `FORM.html` directly in a WebGL-enabled browser. Deploy `dist` to a static host.

```sh
npm run check
```

Runs JavaScript syntax checks and the mocked renderer's state/lifecycle regressions.

```sh
npm run build
```

Regenerates the self-contained `FORM.html` from the editable source.

## Explore

- Three original sculptures with interruptible shape transitions.
- Copper, chrome, and porcelain with procedural studio reflections and physically inspired lighting.
- Pointer rotation with inertia, immediate arrow-key rotation, pause and reset.
- Asymmetric gallery with object-specific construction notes and clear viewer actions.
- A tactile studio: pull a dedicated handle to twist the surface; sliders and keyboard controls offer equivalent access.
- Five curated sculpture studies, with no immediate repeat when using Surprise me.
- Cast a word: a typed word deterministically casts a sculpture (same word, same sculpture on every device), refinable with every control.
- A Copy link action that encodes the exact study in the URL; opening the link restores it.
- Object and material choices, personal titles, and a 1200 × 1500 PNG poster download.
- Original generated artwork, identified separately from the live sculptures.
- A restrained hero entrance, consistent sans-serif typography, and a responsive exhibition layout.
- A material-reactive identity: the page tint and accent follow the hero material (copper, chrome, porcelain) and crossfade on change, in both light and dark themes.
- A placard button component, segmented object/material controls (native radios), accent-filled sliders, and an icon theme toggle.
- Remembered theme choice, visible focus, reduced motion, context recovery, and offscreen/background suspension.

## Edit

- `dist/index.html`: copy, structure, and semantics.
- `dist/styles.css`: tokens, layouts, typography, and page motion.
- `dist/app.js`: geometry, shaders, rendering lifecycle, and interactions.
- `dist/assets/material-dreams.jpg`: generated editorial artwork.
- `tests/renderer.cjs`: mocked state/lifecycle checks, including gestures and export recovery.
- `build.mjs`: reproducible standalone packaging.
- `DESIGN.md`: visual and motion decisions.
- `AUDIT.md`: anti-pattern findings and refinements.

## Assets and concept

FORM is a fictional studio. Its original mathematical sculptures are included in this project. The still life was generated with the available image-generation tool; no model version was exposed. There are no real client, award, or commercial claims. Runtime assets are local; there are no trackers or third-party requests.

## Skills

Applied available Taste and UI/UX Pro Max guidance, Anthropic Frontend Design, Impeccable craft guidance, and Emil Kowalski animation construction/review standards. These informed composition, copy specificity, timing, interruption, pointer gating, and reduced-motion treatment. The current Taste repository was checked again for this edition. Its audit and context-dependent guidance informed the typography and studio changes. The requested npm skill installer and the Impeccable context launcher were unavailable in the execution environment.

## Depth-pass review

The depth pass was built on `feat/3d-depth-pass` and is merged into `feat/identity-and-cast-a-word`. The depth pass is the default: opening the page with no `layers` parameter turns on all six layers. `?layers=none` is the original renderer, and any subset can be named to compare costs. If the depth pass cannot start on a device, the page reloads once with `layers=none`. Frame delivery has been measured in an ordinary Chrome window on one machine (M1 Pro, 120Hz): every frame delivered with and without the layers; see `tests/results/MEASUREMENTS.md`. For a quick re-run use `/tests/perf.html?layers=none&batch=1&quick=1` (two configurations, about 80 seconds).

- Default (depth pass): http://127.0.0.1:4173/
- Baseline: http://127.0.0.1:4173/?layers=none
- Diagnostic: http://127.0.0.1:4173/tests/perf.html?layers=direct,shadow,room,construction,cast,adaptive

Keep any subset of `direct`, `shadow`, `room`, `construction`, `cast`, `adaptive` to compare costs. Each visual layer automatically uses the direct shared renderer. `shared` retains the measured, slower 2D-copy prototype for comparison. Append `&webgl=1` to exercise the WebGL1 fallback. These query flags also work with the standalone file.

In the diagnostic, run the three ten-second samples in a visible foreground tab without running CPU-heavy tests at the same time. Keep viewport and DPR fixed. Save the JSON, compare ranges, and retain invalid attempts separately. The other controls generate same-task framebuffer hashes, three light directions, the 18-state room grid, construction/cast frame sequences, and context/poster checks. “Save comparison PNG” exports the motion sheet or poster generated by those checks.

For the full sequence, open `/tests/perf.html?layers=none&batch=1`. The diagnostic saves each completed configuration before advancing through the eight configurations; an invalid run stops the batch. Keep the tab selected throughout. The local development server checkpoints diagnostic JSON and PNG files under `tests/results`; this same-origin endpoint is absent from static deployments and is never used by the production page. Results include the application source hash. Open the page with `127.0.0.1`, not `localhost`: results are only saved from that origin. Run `npm run report` to write `tests/results/MEASUREMENTS.md` from the records that match the current `dist/app.js`; it lists the viewport and browser of each configuration and adds refresh-independent stall counts (intervals over 25ms and over 50ms). `tests/results/MEASUREMENTS-0ffb4a9.md` is the earlier report, taken under browser automation before the review fixes.

## Verification and limitations

`AUDIT.md` records executed measurements separately from implementation inferences. The original `tests/renderer.cjs` assertions remain unchanged. Added tests cover renderer ownership, adaptive resolution, shadow bounds, construction/cap invariants, equation input, periodic casting, interruption, reduced motion, idle rendering and poster/context state preservation.

Final Chrome checks passed all 14 width/theme combinations, keyboard equation activation/release and construction scrubbing, WebGL2 and forced-WebGL1 compilation/recovery, six-view idle suspension, and all five owner pixel hashes under both the original and shared renderers. The 1200 × 1500 posters and comparison images were inspected. A study link reproduced its controls in a fresh tab on this machine. Raw browser records and the current comparison are in `tests/results/FINAL-MEASUREMENTS.md`; `AUDIT.md` records the limits. Direct-from-disk opening was blocked by browser URL policy; a second machine, native reduced-motion media emulation and mobile Safari remain untested. The optional live cobalt glass was deferred.

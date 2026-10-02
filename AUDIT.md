# FORM refinement audit

Reviewed against the available Taste, UI/UX Pro Max, Frontend Design, Impeccable, and Emil Kowalski guidance. This pass concentrates on specificity, hierarchy, motion purpose, and reliable interaction.

| Before | After | Why |
| --- | --- | --- |
| Repeated abstract studio slogans | Explanations of the knot, waved ring, folded sphere, and material behavior | Copy now belongs to these objects rather than a generic agency. |
| Generic captions such as “Form exploration” | Material labels and construction notes | Gives each work a useful identity. |
| “Turn it around” jumped to the page top | “Open in viewer,” with an explicit accessible destination | The label now matches the action. |
| Gallery frame lift, canvas scale, rotating object, and appearing pill | Object rotation plus a small directional arrow | Removes competing motion without flattening the artwork. |
| Many staged supporting reveals, manifesto lines, animated footer, and image scaling | One short hero entrance; remaining page content stays visible and still | Keeps motion focused on the live objects. |
| Repeated capsule controls and rounded image panels | Underlined object selection, flat frames, simple rectangular actions | Gives the exhibition a consistent, less generic visual language. |
| One typography voice throughout | Precise sans-serif text with italic serif display accents | Adds contrast through typography rather than ornament. |
| Absolutely positioned hero and several appended mobile overrides | A coherent grid with one flowing tablet/mobile layout | Reduces overlap risk and makes the stylesheet maintainable. |
| Context restoration left lab controls disabled | Shared availability synchronization re-enables controls | Fixes a concrete recovery defect. |
| Reduced-motion changes erased the visitor's pause choice | Preference and manual pause are independent | Respects both system preference and visitor intent. |
| Fixed object scale in narrow canvases | Scale follows the shorter viewport dimension | Protects the sculpture silhouette in portrait frames. |
| Theme choice reset on reload | Stored preference and synchronized browser theme color | Makes the existing theme control reliable. |

## Evidence

`npm run check` passes syntax and state/lifecycle regression checks for interrupted morph continuity, material state, sliders and accessible values, keyboard rotation, pause preference preservation, WebGL recovery, portrait fitting, theme state, and background suspension. HTML IDs, fragment links, local assets, and control labeling were checked structurally. Source and standalone packages use the same application code.

## Outstanding review

No browser visual pass was possible in this environment. The mock renderer cannot establish GPU shader support, screenshot quality, font wrapping, actual contrast over the rendered objects, or perceived animation smoothness. Review at 320, 390, 768, 1024, and 1440px in a WebGL-enabled browser, including dark mode, reduced motion, keyboard navigation, and mobile scrolling. Publishing remains blocked by the environment's source-host network access.

## Sculpture studio pass

| Before | After | Why |
| --- | --- | --- |
| A Bloom-only slider experiment | A full-width studio with three object choices and three materials | Gives visitors a complete place to create. |
| Surface controls felt technical | A directly draggable side handle plus equivalent keyboard and slider input | Turns deformation into a discoverable tactile gesture. |
| No quick way to discover combinations | Five deliberately composed, non-repeating surprise studies | Adds variety through meaningful object/material/light combinations. |
| Exploration ended on the page | A personal title and a downloadable sculpture poster | Gives the visitor a result to keep. |
| Mixed-family italic hero emphasis | Italic emphasis within the same sans-serif family | Removes an ornamental typography shortcut flagged in the current Taste review. |
| Repeated split section headers | Stacked collection and material headings; full-width studio | Improves the page's composition rhythm. |
| Hand-built standalone packaging | A reproducible npm build command | Keeps the editable site and standalone file aligned. |

The latest state checks additionally cover direct handle movement, clamping, release, keyboard slider operations, context loss during a gesture, surprise selection, personal titles, print capture without simulation advancement, restored live-canvas dimensions, duplicate export clicks, sanitized download filenames, URL cleanup, empty-blob errors, and copy errors. Text contrast ratios pass for both page themes and all three studio artwork backgrounds.

The scene backgrounds belong to the artwork and its exported poster; the surrounding page retains the user's light/dark theme. Export is local and does not upload the visitor's title or image. GPU appearance, actual PNG pixels, download behavior on mobile Safari, and real gesture smoothness remain subject to browser visual review.

## Identity and controls pass

| Before | After | Why |
| --- | --- | --- |
| Cold gray shell with a single accent only ever seen in focus rings | Six theme × material token sets; the page tint and accent follow the hero material and crossfade over 420ms | Gives the shell a branded identity tied to the objects instead of an anonymous frame. |
| Flat dark rectangles with Unicode arrows | One placard button (label + square icon cell, inline-SVG icons, accent cell-wipe on hover) | A single distinctive, consistent action component; no decorative glyph fonts. |
| Native `<select>` dropdowns for three-option choices | Segmented radio controls with one sliding thumb and sphere material dots | Three options never need a dropdown; keeps native keyboard/AT behaviour with a visible selected state. |
| Near-default range sliders; thumbs and track generic | 2px track with accent fill, 20px round thumbs on both engines, hover/active scaling | Ties the sliders to the accent and gives clear drag affordance. |
| "Light / Dark" text toggle | Icon-only 44×44 toggle that rotates when the effective theme is dark | Smaller, clearer, and consistent with the icon language. |
| Gallery frames stayed pale in dark theme | Per-theme frame tokens; frames darken with the theme | Removes bright rectangles from the dark page. |
| Material name hidden below 1100px; swatches identified by colour alone | `#material-name` in the viewer tools at every breakpoint | Names the chosen material for everyone, including screen magnifier and colour-blind users. |
| No construction detail in the gallery | A monospace catalogue line per work with its real equation | Connects each object to the mathematics named elsewhere. |
| Reduced-motion rule killed every transition | Reduced motion keeps colour/opacity and the material crossfade, drops only movement | Respects the preference without flattening comprehension cues. |
| Hero copy read "mathematics.Turn them." at ≤600px (missing space) | Space added so it reads correctly at every width | Copy defect fix. |

Verification performed this pass: `npm run check` passes (state/lifecycle regressions updated for the radio groups, material-reactive theme-color, slider fill, segmented `data-index`, and Save-print `data-state`). Observed in a Chromium browser at 320/375/768/1440 px, light and dark: no console errors, `document.querySelectorAll('select').length === 0`, each hero swatch sets `data-material` and settles `--accent` to the table value for the theme/material, no horizontal scroll, lab toolbar buttons inside the stage and not overlapping at 375 px, and every interactive hit area ≥ 44×44. Not verified: `prefers-reduced-motion` computed `transition-property` (the override is `!important` and correct by construction, but was not emulated at runtime), real-device Safari, GPU shader output, and PNG pixels.

## Cast a word

| Before | After | Why |
| --- | --- | --- |
| Optional "Name your study" field at the bottom of the print bar | "Cast a word" field above the stage; the word deterministically chooses object, material, scene, twist, light, lobes, wave and angle | Gives every visitor a personal starting point in one gesture, and makes the name part of the sculpture rather than a caption. |
| Fixed ripple (5 lobes, wave 7) baked into the shader | `uLobes` / `uWave` / `uRipple` uniforms, defaults equal to the old constants | Lets a word change the surface itself; with no word the render is unchanged. |
| — | Ripple gate: the ripple flattens, the integer lobe count swaps while flat, then the ripple returns | `atan` wraps at ±π, so interpolated lobes would show a seam; the gate is interruptible by construction. |
| A sculpture could only be kept as a PNG | Copy link encodes the exact study in the URL hash; opening it restores the sculpture immediately | Sharing without a server, account or storage. |
| Status line: "No sign-up needed." | "Nothing you type leaves this page." | States the actual privacy property of the new text field. |
| Long unbroken titles could overflow the status line | `.print-status` wraps anywhere | The status now quotes the typed word. |

Verification for this pass: `npm run check` (state tests for determinism, ranges and coverage over 2000 words, debounce and control sync, ripple-gate ordering per frame including two mid-transition retargets, per-draw form uniforms, reduced motion, 200-word encode/parse round trip, malformed links, name truncation, copy-link success/rejection/absence, Start again and Surprise me). In a Chromium pane: the real GLSL compiles; with no word typed, readPixels hashes of hero, lab and previews match the pre-change vertex shader at fixed poses (lab also at full twist on all three shapes); typed words cast with no console errors; a copied link reopened in a fresh tab reproduced shape, material, scene, twist, light, lobes, wave and name; each malformed hash loaded the default Bloom studio with no console errors; no new horizontal overflow at 320/375/768/1440 (320 keeps a pre-existing 15px overflow from the hero viewer tools, identical in the pre-change build); new controls are at least 44px; the poster after a cast is 1200 × 1500 with a non-empty sculpture region. Not verified: animation smoothness and the mid-transition look (the pane does not run animation frames), the clipboard success path in a real browser (the pane refused clipboard access; the fallback path ran), mobile devices. Known visual limit: at 8–9 lobes with high twist, the Orbit shows serrated ridges where the ring crosses the model's vertical axis (the ripple's angular term is singular there and the mesh cannot resolve it); about 4.5% of words land in that corner.

## Review fixes (2026-10-02)

Found by running the build in a browser after the two passes above.

| Before | After | Why |
| --- | --- | --- |
| The surface tore where it crossed the vertical axis at high twist (visible on "gentrit": Orbit, 3 lobes, 99% twist) and showed serrated ridges at 8–9 lobes | The ripple fades to zero near the axis, earlier for more lobes | `atan(z, x)` is singular on that axis and the mesh cannot resolve lobes that close together. |
| Four-column control row at every width above 900px; between 900 and 1240px the Material labels spilled out of their track into the slider | Four columns only from 1240px, two columns below, Object and Material on full rows below 760px; labels cannot overflow their cell | The row needs about 1240px to hold both segmented groups and both sliders. |
| Light slider had no accent fill until first moved | `setLight(45)` runs at start-up | The fill is driven by a property that only `setLight` set. |
| Placard hover cell snapped back on mouse-out | 160ms exit transition | Exits should be fast, not absent. |
| Segmented labels sat 3px low; hero object tabs and the hero pause button were under 44px wide on phones | Labels fill the track with the radio overhanging to 44px; tabs get a wider invisible hit area; pause no longer shrinks | Touch targets. |
| 15px of horizontal scroll at 320px from the hero tool row | The tool row wraps at 380px and below | The material name added to that row made it too wide. |
| A frame timestamp older than the previous one produced a negative step | The step is clamped at zero | Defensive; cannot happen with real animation frames. |

Checked by execution: hero and gallery canvas pixel hashes equal the pre-feature build at fixed poses (lab hashes differ, as intended by the axis fade); `gentrit`, ` Gentrit ` and `GENTRIT` give the same sculpture; 260 real render-loop frames during fast typing never changed the lobe count while the ripple was raised; a copied link reopened with the same shape, material, scene, twist, light, lobes, wave and name; twelve malformed links left the studio untouched; a name containing markup rendered as text; no label overflow and no horizontal scroll at 320, 375, 620, 768, 925, 1100, 1240 and 1440px.

Still not checked: perceived smoothness and frame rate (the review browser reported the page as hidden and produced no animation frames), Safari and Firefox, real phones, the clipboard success path, and a real PNG download.


## Depth pass — package 0 (2026-10-02)

**Executed-and-observed.** Baseline is commit `3781ea5`. `tests/perf.html` is a diagnostic twin built by `build.mjs`; `FORM.html`, all production source, and `tests/renderer.cjs` remain byte-identical at this checkpoint. `npm run check` and `npm run build` pass. The new metric tests exercise empty windows, long stalls, hidden runs, invalid timestamps, frame reconciliation, ranges and pixel hashing.

**Meaning:** make frame delivery and rendering cost reviewable before adding visual work.

**Executed-and-observed.** Visible Chrome 152, MacBook Pro / Apple M1 Pro (8 cores) / 16 GB / macOS 26.5.2. Viewport 1800 × 875 CSS px, DPR 2, `document.hidden === false` throughout accepted runs. Three fixed 10-second runs, five 2-second segments. Refresh estimated from 120 unloaded rAF intervals: 119.0476 Hz (not an independently measured monitor refresh rate). Expected frames per segment: 238.095; slow threshold: 12.6 ms. Intervals are assigned whole by ending callback; terminal-boundary intervals are separate.

| Segment | Delivered / expected frames, each 2s | Median ms, range | p95 ms, range | Worst ms, range | >1.5× interval count, range |
| --- | --- | --- | --- | --- | --- |
| Hero rotation | 189–212 / 238.095 | 8.3–8.4 | 16.6–17.4 | 66.7–107.7 | 16–26 |
| Shape change | 181–220 / 238.095 | 8.3–8.4 | 10.2–16.7 | 41.3–124.5 | 11–17 |
| Material change | 93–167 / 238.095 | 8.4–8.4 | 33.9–83.2 | 100–400.6 | 25–28 |
| Word cast | 106–202 / 238.095 | 8.3–8.4 | 17–58.3 | 41.8–308.5 | 23–31 |
| Twist drag | 81–118 / 238.095 | 8.5–8.8 | 41.6–58.2 | 141.8–383.4 | 29–48 |

Every range has n=3 runs. Run 1 also has a 1057.8 ms terminal interval crossing the end boundary (799.8 ms overshoot), retained explicitly rather than hidden by the fixed-window percentiles. Runs 2–3 terminal intervals: 33.3 / 33.4 ms. The script dispatches synthetic handle events, not hardware pointer input. It scrolls the studio into view at 6 seconds and pauses the lab during the cast so idle settling remains observable.

**Executed-and-observed.** `EXT_disjoint_timer_query` works on all five WebGL contexts. No disjoint or unresolved queries. GPU median ranges and sample counts across the three runs: hero 0.836–0.858 ms (198/213/190 draws); shape 0.713–0.726 ms (212/220/181); material 0.667–0.738 ms (167/93/104); cast 0.618–0.921 ms (63/67/34); twist 0.630–0.641 ms (81/114/118). Full per-run summaries, GPU p95/worst and counts are in `tests/results/baseline-summary.json`. Timer query overhead is included. GPU times do not explain the long rAF gaps on their own; no cause is asserted from this evidence.

**Executed-and-observed.** Five 400 × 300 synchronous draw/readPixels FNV-1a hashes exactly match the owner's reference hashes: `dcbc4c2a`, `577ba6bf`, `937de9cc`, `ce2785be`, `f72ad12a`. GPU: ANGLE Metal Renderer / Apple M1 Pro. These are the local before-hashes for subsequent comparisons.

**Inferred from reading / limits.** Sharing contexts may reduce resource duplication; its timing benefit is not established. Large baseline variation prevents claims of small performance gains. No feel/beauty claim is made. Packages 1–6 and the full responsive/theme matrix are not yet validated at this checkpoint.

## Depth pass — architecture comparison and shadow checkpoint

**Executed-and-observed.** All five reference GPU hashes also match with `?layers=shared` (offscreen WebGL2 plus 2D copies) and `?layers=direct` (one fixed WebGL2 canvas with scissored viewports). The original assertion suite is run verbatim under both flags by `tests/shared-renderer.cjs`; it passes, including export state and determinism. The original assertion file is untouched. New tests cover shared resource ownership, all-client loss/restoration, idle suspension, and adaptive resolution bounds/settling.

**Decision from measurement.** Reject the 2D copy architecture for normal use; retain its flag for comparison. Select direct rendering. It preserves each original canvas as a transparent keyboard/pointer target, draws within its DOM rectangle, and uses a retained drawing buffer so a resting preview is not cleared when another object animates. Scroll/resize invalidate the placement and redraw visible views. The shared scene program and static meshes are uploaded once; interrupted morphs use one reusable scratch buffer. WebGL1 with OES VAOs (or explicit attribute binding when absent) is the fallback, not yet executed on a real WebGL1-only device.

**Executed-and-observed.** Same machine/browser/1800×875/DPR2 and script, n=3/configuration. Refresh calibration for both candidates was approximately 120.482 Hz, or 240.964 expected callbacks per 2-second segment. The following tuples are ranges over the three runs: delivered callbacks; median ms; p95 ms; worst ms; slow callback count.

| Segment | 2D copy | Direct |
| --- | --- | --- |
| Rotation | 77–162; 8.4–8.6; 25.4–142.7; 81.7–407.2; 15–27 | 185–238; 8.3; 10–32.3; 15.6–98.1; 1–15 |
| Shape | 39–113; 8.5–16.4; 41.5–250.5; 234.2–692; 22–28 | 235–239; 8.3; 9.8–10.2; 14–25; 1–4 |
| Material | 3–22; 34.5–540.7; 399.6–1433.8; 431.7–1433.8; 2–21 | 168–199; 8.4; 23.3–41; 57.8–116.7; 18–25 |
| Cast | 3–122; 8.4–616.1; 51.8–891.8; 275.9–891.8; 3–17 | 220–232; 8.3–8.4; 10.4–15.9; 18.3–49.2; 8–17 |
| Twist | 10–58; 16.5–168.7; 69–526.6; 299.2–526.6; 10–35 | 135–190; 8.5–8.8; 18.5–25.1; 35.2–267; 34–44 |

Terminal intervals for copy: 571.2 / 16.5 / 226.9 ms; direct: 31.7 / 8.4 / 42.6 ms. Direct GPU median ranges (sample counts in run order): rotation 0.780–0.850 ms (236/186/239), shape 0.710–0.768 (239/235/235), material 0.765–0.804 (188/199/168), cast 0.712–0.854 (70/71/84), twist 0.925–0.932 (135/190/183). The direct-versus-copy difference exceeds the observed range overlap in several segments; a small percentage speedup over the original baseline is not claimed.

**Package 2 meaning:** the actual silhouette and key light give the object a ground relationship. Construction: project the deformed geometry along its shading key onto a plane 0.025 scene units below its lowest vertex; rasterize a 256×256 alpha mask; composite a 25-tap Gaussian approximation at 28% opacity before the surface. No painted blob. The CPU height bound is cached when pose/twist/morph do not change it. The mask and composite are transparent over each existing background. Print uses the same passes at its export size; context restoration recreates the shadow resources.

**Executed-and-observed.** Shadow state tests pass for finite/cached bounds across 27 shape/twist/pose combinations, export pass inclusion, 1200×1500 dimensions and resource restoration. Real Chrome shader compilation succeeds and the shadow renders. The diagnostic `Shadow light study` control creates three actual rendered frames at 0/90/180 degrees through `copyTo`. Full visual acceptance, all-background review and downloaded PNG verification are still pending.

**Executed-and-observed.** `?layers=shadow`, n=3, refresh estimate 120.482 Hz, expected 240.964 callbacks per 2 seconds; adaptive resolution was OFF for this measurement:

| Segment | Delivered / expected | Median ms | p95 ms | Worst ms | Slow count | GPU median ms (sample counts) |
| --- | --- | --- | --- | --- | --- | --- |
| Rotation | 231–237 / 240.964 | 8.3–8.4 | 9.9–10.2 | 16.8–34.1 | 3–6 | 1.545–1.613 (232/238/235) |
| Shape | 215–223 / 240.964 | 8.4 | 15.8–16.3 | 33.3–82 | 12–14 | 1.584–1.664 (215/223/219) |
| Material | 194–208 / 240.964 | 8.3–8.4 | 17–25.1 | 40.5–50.2 | 21–24 | 1.531–1.613 (208/194/198) |
| Cast | 191–201 / 240.964 | 8.4 | 17.5–18.6 | 50.4–83.9 | 25–26 | 1.905–2.159 (51/57/67) |
| Twist | 105–125 / 240.964 | 15.9–16.6 | 32.4–34 | 59.6–158.3 | 68–71 | 1.926–2.341 (118/105/125) |

Terminal intervals: 66.6 / 233.3 / 16.7 ms. These measurements show a GPU cost increase for shadows beyond the direct renderer's median variation, and slower twist delivery. They do not support claiming the shadow is free. The separate `adaptive` flag adds an eight-sample resolution controller with a 60Hz budget, DPR cap steps 1.5→1.25→1→0.75 and one sharp redraw when all visible motion settles; its combined cost is not yet measured at this checkpoint.

## Depth pass — package 3 checkpoint

**Meaning:** reflected light belongs to the room, and each surface responds according to its material.

**Implemented; inferred from shader construction.** The procedural rig has a broad upper-left key (cosine exponent 9; neutral-warm, slightly room-tinted), smaller right fill (32; cool-neutral), rear-left rim (23; page-accent plus room colour), and broad floor bounce (9; room colour). No downloaded environment. Copper uses anisotropic GGX with roughness axes 0.45× / 1.6× aligned to the generating parameter, and anisotropic Smith masking. Chrome varies roughness by ±10% spatially. Porcelain combines its diffuse/rough body with a Schlick clearcoat environment reflection. Fresnel splits the direct diffuse/specular energy; the coat attenuates the body before adding its reflection. The environment is an analytic studio approximation without a physically convolved roughness mip chain; clearcoat environment weighting and multiple-scattering compensation are approximate. It is not a spectral or fully energy-integrated material model.

**Executed-and-observed.** Real Chrome compiles and renders the room shaders. The `Material / room grid` diagnostic rendered and displayed all 18 combinations (three materials × six theme/page-material states) at fixed geometry/pose. The copper-tinted dark room produces a warm reflection on chrome; porcelain retains a diffuse body. Owner acceptance of the appearance remains open. The original assertions also pass under the room flag with a mocked computed-style source; this checks state contracts, not shader appearance.

**Executed-and-observed.** Same machine, viewport and script, `?layers=room`, n=3. Estimated refresh 119.0476 Hz; 238.095 expected callbacks per 2-second segment. No shadow or adaptive-resolution layer enabled:

| Segment | Delivered / expected | Median ms | p95 ms | Worst ms | Slow count | GPU median ms (sample counts) |
| --- | --- | --- | --- | --- | --- | --- |
| Rotation | 223–237 / 238.095 | 8.3–8.4 | 10.1–10.4 | 17.6–143.3 | 2–10 | 0.781–0.930 (224/225/238) |
| Shape | 237–239 / 238.095 | 8.3–8.4 | 10.1–10.2 | 10.4–24.6 | 0–2 | 0.756–0.776 (237/238/239) |
| Material | 192–202 / 238.095 | 8.4–8.6 | 17.6–24.7 | 57.5–74.4 | 17–28 | 0.866–0.937 (202/192/195) |
| Cast | 188–232 / 238.095 | 8.4–8.5 | 10.4–24.9 | 34.7–215 | 8–21 | 0.833–1.021 (73/80/47) |
| Twist | 151–194 / 238.095 | 8.5–9.2 | 18.2–25.8 | 34.3–82.7 | 34–62 | 1.004–1.033 (194/151/183) |

Terminal intervals: 8.9 / 33.7 / 9.5 ms. These ranges overlap direct-renderer timing in several segments, so no small speed change is claimed. Material and twist GPU medians are higher than direct in this sample. The measurement preceded an additional degenerate-tangent guard; final combined measurements must cover the finished version. Background-specific shadow review, real context loss/restoration and the full responsive matrix remain pending.

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

## Depth pass — packages 4 and 5 implementation checkpoint

**Package 4 meaning:** the generator, sweep and radius modulation explain how an equation becomes a surface.

**Executed-and-observed:** Chrome compiled the combined shader and displayed a 30-frame diagnostic grid covering all three constructions, a copper-to-chrome cast and a retarget during construction/cooling. Inspection exposed an overly large finite-difference normal threshold and a sampler conflict between cast and shadow; both were corrected. The grid is reproducible with the diagnostic “Construction / cast frames” button. It is sampled from the real renderer, not generated artwork. Appearance remains for the owner to judge.

**Inferred from implementation:** positions and finite-difference normals are evaluated on the GPU during construction and term interaction. Static settled meshes are retained, preserving the original canonical surface. A 240ms retraction starts from the current sweep; a subsequent 920ms construction traces the generator, sweeps a capped tube (or a meridian for Bloom), then introduces radius modulation. End caps close partial sweeps. The studio section contains a scrubber; keyboard changes are immediate and pointer scrubbing eases. Three labelled equation buttons change bounded amplitudes; focus activates them, blur restores the true parameter, and reduced motion uses a discrete alternative value. Existing layout and tokens are retained except for the expressly requested object, scrubber and equation terms.

**Executed-and-observed:** the added construction suite checks 154,275 finite CPU-reference position samples, 47,190 cap/body boundary pairs, canonical endpoint agreement and 363 interruption points. It also checks reduced-motion snapping and zero queued frames after settling. These are CPU invariant tests, not a claim that GPU transform-feedback positions were read back. The original renderer assertions are unchanged and also run under the construction flag.

**Package 5 meaning:** filling, heat and cooling make a material change an event on the surface.

**Inferred from implementation:** a 129-sample periodic parameter field carries colour, metalness, roughness and residual heat. The front divides at the periodic origin and meets halfway around the surface, avoiding a seam. Filling lasts up to 950ms; cooling completes by 1450ms. On retarget, the exact last uploaded field is retained. The colour/roughness heat response is illustrative, not a thermal simulation. After cooling the shader returns to the exact original target material uniforms. The logical material selection remains immediate; no control waits for the event. Manual material changes use the same event. Optional per-keystroke impulses were omitted so the physical rhythm does not add another perpetual or nondeterministic motion source.

**Executed-and-observed:** 819 cast interruptions preserve the exact displayed field at retarget and its first subsequent frame; periodic endpoints match; settled fields are deterministic. Added tests cover reduced motion, idle, poster sampling without advancing the event, and restoring a lost context without resetting thermal state. The original 200-word round-trip and ripple-gate assertions remain untouched and run again under the cast flag.

**Measurement limitation recorded, not discarded silently:** the first construction performance attempt at 1800×819/DPR2 stalled before its third run (`no rAF within 2 seconds`). CPU-heavy tests were also running. Its two completed runs are not used as the required three-run comparison. The viewport differed from the prior 1800×875 baseline. Subsequent comparisons must run at the recorded size with those tests stopped.

**Package 6 decision:** leave the original cobalt still life alone. The measured shadow cost and incomplete combined frame-budget verification do not justify adding refraction/thickness passes.

## Current handoff / acceptance status

**Executed-and-observed in tests:** `npm run check` and `npm run build` passed after adding the construction and cast suites. Equation focus, pointer release, discrete reduced-motion values, immediate keyboard scrubbing, and eased pointer twist have added mock-DOM checks. A focused combined-layer integration check retains a six-canvas context and preserves the thermal field through poster sampling and recovery. The full original assertions run unchanged with baseline, shared, direct, room, construction and cast configurations. The additional combined test is focused; it does not claim to repeat all 200 word cases with the shadow CPU bounds pass.

**Executed-and-observed in a source/buffer comparison:** SHA-256 comparisons against `3781ea5` match for the two all-layers-off shader strings, all three position/normal/index buffers, `castWord` and `parseStudy`. `tests/results/source-preservation.json` contains the hashes. This is stronger preservation evidence than visual inference, but does **not** replace the requested final `gl.readPixels` run. The five earlier observed GPU hashes remain recorded above.

**Inferred from implementation, awaiting final browser recheck:** native focus outlines remain visible on the blank 2D placeholders in direct mode; equation buttons sit above the gallery's stretched link; pointer twist has a separate eased display value while the public logical value and keyboard feedback remain immediate; the shadow uses that displayed twist. Hero reflections now read the body's interpolated background, with CSS colour parsing for RGB, sRGB and OKLab. The poster samples the currently displayed studio background when the room layer is enabled. The last visual frame-sheet review preceded these final input/background fixes.

**Browser limitation, executed-and-observed:** the visible Chrome session disconnected during final checks. Existing-tab commands reported the browser unavailable; reconnect and inventory attempts timed out. A requested viewport override of 1800×875 was issued before disconnection; clearing that override could not subsequently be confirmed. This is not evidence of renderer smoothness or of failure on another GPU.

**Still open; not claimed complete:**

- Three valid runs each for `construction`, `cast`, `adaptive`, and the final combined configuration, compared with a contemporaneous baseline at the same viewport. The interrupted two-run construction attempt is described above.
- Final all-off pixel hashes, real WebGL2 loss/restoration on all six views, actual WebGL1 fallback compilation, and real poster PNG inspection after the final changes.
- Real keyboard-only interaction review and reduced-motion review of the final implementation.
- Widths 320, 375, 768, 925, 1100, 1240 and 1440 in both themes (14 combinations), including scroll overflow and canvas aspect checks.
- A shared link opened on another machine, and direct-from-disk execution of the final standalone file.

The default remains the baseline. The full depth pass is available through the documented query flags for owner review; it has **not** been promoted as a verified performance improvement. No push, deployment, or modification of the Desktop source checkout was performed in this continuation. The optional cobalt-glass layer remains deferred because packages 0–5 do not yet have complete acceptance evidence.


## Recovered continuation and final validation (2026-10-02)

This section supersedes the earlier **Current handoff / acceptance status** list. The implementation was recovered from the existing working tree on `feat/3d-depth-pass`; no reset or replacement of the previous work was performed.

**Executed-and-observed — corrections in this continuation:**

- The support plane now follows the procedural construction and equation deformation. The former calculation used the source/target morph buffers even when the displayed surface was procedural.
- A full CPU-reference implementation proved too expensive (one combined attempt stopped with `no rAF within 2 seconds`; the completed shape segment had eight callbacks and a 67.8ms median CPU draw). That implementation was replaced by cached cross-section trigonometry, one generating frame per ring, and a coarse support probe refined around its 12 lowest points. The full silhouette still renders from every triangle. The floor clearance is now 0.03 scene units. Dense-reference tests bound the *observed* probe error to 0.005 units across 27 settled shape/twist/pose combinations and 12 construction states. This is not an analytic guarantee for every continuous input.
- Bloom grows from its meridian without a full-size flat cap in the initial frames. Its settled surface remains canonical. The construction readout stays finite before playback starts, including the reduced-motion path.
- Studio dragging no longer rewrites identical labels, radio selections, accessibility labels and live-region messages every pointer event.
- The diagnostic checkpoints JSON/PNG output to the local server after a result is complete, and includes the application's SHA-256 in its JSON. `?batch=1` runs all eight configurations; invalid runs stop it. The final follow-up to the harness carries the first calibration through future batches. `npm run report` rebuilds the report from raw intervals and checks the source hash.

**Executed-and-observed — final functional checks:**

- `npm run check` and `npm run build` pass. The original `tests/renderer.cjs` is byte-identical to `3781ea5`. The existing determinism, ripple gate, export preservation and interrupted-state checks are retained.
- Five owner GPU hashes match under **both** `layers=none` and `layers=direct`: `dcbc4c2a`, `577ba6bf`, `937de9cc`, `ce2785be`, `f72ad12a`. These are synchronous real draw/readPixels results on the Apple M1 Pro.
- All **14** width/theme cases (320, 375, 768, 925, 1100, 1240, 1440 × light/dark) have no horizontal overflow. All six views match their CSS aspect ratios; all sampled GL errors are zero.
- Actual WebGL2 and forced WebGL1 runs recovered **6/6** views after intentional context loss. Each settled run had **0/6** pending animation frames; both produced a 1200 × 1500 PNG. WebGL1's captured error/warning log was empty.
- Keyboard Space activated each of the three equation controls; Tab released it (`aria-pressed: true → false`). Home/End on the scrubber read “Generating curve” / “Finished surface.” This exercised the real browser controls; no screen-reader software was available.
- A copied `continuity` study reopened in a fresh tab with Bloom, Porcelain, twist 48, light 1 and seven lobes. This is a same-machine observation, not a second-machine result.

**Executed-and-observed — measurements:** eight final-source configurations × three valid ten-second runs = **24 runs**, at **1800 × 875 / DPR 1**, visible throughout. The final raw records, all five segments per configuration, sample counts, GPU timings, terminal boundary intervals and retained invalid/other-viewport attempts are linked in [FINAL-MEASUREMENTS.md](tests/results/FINAL-MEASUREMENTS.md). macOS 26.5.2 was checked with `sw_vers`; Chrome 152 and Apple M1 Pro were identified in the browser records. No CPU-heavy state tests ran during the final timing batch.

Idle calibration sometimes estimated roughly 60Hz before subsequent delivery returned to roughly 120Hz. Therefore the comparison recomputes expected counts and slow counts from the raw intervals with **one baseline reference, 120.482Hz** (240.964 expected callbacks per two seconds; 12.45ms slow threshold). This is a stated comparison assumption, not an independently verified display specification. Raw records keep their original estimates. Do not compare their differently calibrated ratios without this adjustment.

Every range below has n=3 runs; GPU parenthetical counts are draw samples in run order. The boundary-crossing terminal intervals are reported separately in the full report.

| Layers | Segment | Delivered / expected per 2s | Median ms | p95 ms | Worst ms | Slow intervals | GPU median ms (draw counts) |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  none | Hero rotation | 132–212 / 240.964 | 8.3–8.5 | 16.7–50.5 | 32.6–100.1 | 17–39 | 0.693–0.777 (212/213/133) |
|  none | Shape change | 106–217 / 240.964 | 8.3–8.4 | 16.7–67.2 | 33.3–333.3 | 20–26 | 0.624–0.694 (203/217/106) |
|  none | Material change | 66–178 / 240.964 | 8.4–16.6 | 25.5–83.4 | 66.6–274.9 | 23–41 | 0.633–0.717 (178/176/66) |
|  none | Word cast | 126–210 / 240.964 | 8.4–8.4 | 16.7–33.4 | 33.4–366.2 | 22–25 | 0.533–0.617 (55/72/60) |
|  none | Twist drag | 103–112 / 240.964 | 8.8–16.3 | 41.6–58.3 | 91.2–125.5 | 47–55 | 0.523–0.598 (103/110/112) |
|  direct,shadow,room,construction,cast,adaptive | Hero rotation | 211–232 / 240.964 | 8.3–8.3 | 9.4–16.7 | 25.1–74 | 6–13 | 1.543–1.722 (212/233/225) |
|  direct,shadow,room,construction,cast,adaptive | Shape change | 205–221 / 240.964 | 8.3–8.4 | 9.5–17 | 33.4–50.9 | 11–24 | 1.328–1.393 (209/205/221) |
|  direct,shadow,room,construction,cast,adaptive | Material change | 139–202 / 240.964 | 8.3–8.7 | 17.3–33.9 | 34–157.3 | 20–43 | 1.333–1.463 (195/202/139) |
|  direct,shadow,room,construction,cast,adaptive | Word cast | 186–205 / 240.964 | 8.3–8.4 | 16.7–17.6 | 59–166.6 | 14–29 | 1.172–1.34 (143/137/125) |
|  direct,shadow,room,construction,cast,adaptive | Twist drag | 117–205 / 240.964 | 8.3–9.2 | 17.3–50.2 | 33.4–125.7 | 28–52 | 1.323–1.36 (117/183/205) |

**Interpretation, not a new measurement:** the optimized implementation reduces repeated CPU work and the final combined twist delivery exceeds the baseline range in this batch. The wide frame-time variation, and GPU cost of extra passes, do not justify a general speedup or smoothness claim. Both versions still have long stalls. The baseline remains the default; the full depth pass is opt-in for owner review.

| Package | Meaning and result | Observed evidence / decision |
| --- | --- | --- |
| 0 | Frame delivery is measurable rather than assumed. | Original baseline retained; final comparable baseline plus seven configurations, three runs each, with raw intervals, sample reconciliation and GPU samples. |
| 1 | Shared resources make the exhibition one renderer. | Direct WebGL2/WebGL1 scene renderer retained; five pixel hashes unchanged, six-view restoration and idle verified. The slower copy prototype remains a comparison flag. |
| 2 | The light gives the sculpture weight. | Full-geometry silhouettes at three light directions, procedural support correction, reduced-resolution blur and inspected exported posters. Cost is isolated by `shadow`; it is not free. |
| 3 | Material belongs to its room. | The 18-frame room grid was rendered and inspected; warm chrome edges are visible on the copper room. Rig and energy approximations remain documented above. |
| 4 | The generator explains the object. | Thirty-frame construction/cast sheet, keyboard terms and scrubbing, finite surface/cap tests and corrected Bloom start. GPU positions were not read with transform feedback. |
| 5 | A material change fills and cools. | Actual cast/retarget frames, 819 interruption checks, unchanged original determinism assertions, and a fresh-tab study link. A second machine remains untested. |
| 6 | Optional cobalt glass stays deferred. | Consistent frame-budget acceptance is still open; adding refraction/thickness is not justified by these results. |

**Executed-and-observed image evidence** (actual renderer output, no generated stand-ins):

- [Construction, casting and retargeting: 30 frames](tests/results/final-construction-cast.png)
- [Three shadow directions](tests/results/final-shadow-angles.png)
- [Three materials × six room states](tests/results/final-material-room-grid.png)
- [WebGL2 poster](tests/results/final-poster-webgl2.png) and [WebGL1 poster](tests/results/final-poster-webgl1.png)

**Still unverified / external limits:** native reduced-motion media emulation (mock state tests pass), actual screen-reader output, mobile Safari and other GPUs, a shared link on another machine, and owner acceptance of feel/appearance. Browser security policy explicitly blocked `file://` navigation; no alternate surface or workaround was used. The self-contained build exists and the diagnostic uses that same inlined application, but direct-from-disk launch is not claimed tested. Nothing was deployed or pushed to the Desktop source checkout.

## Review of the depth pass and fixes (2026-10-02)

The depth pass was reviewed by running the build, then merged. With no `layers` flag the output is unchanged: eight fixed-pose framebuffer hashes (hero ×2, previews ×3, studio ×3) equal those of `3781ea5`, before and after the fixes below.

| Before | After | Why |
| --- | --- | --- |
| The hero shadow ended in a hard vertical edge where its canvas ends | The shadow composite fades over the outer 12% of the view | A long shadow should dissolve, not be cut. |
| With `construction` on, every studio shape change retracted the object and rebuilt it over 1160ms. Typing "sculpture" one letter per 233ms left it less than half built in 125 of 164 frames | The studio keeps the continuous morph; the hero and the construction study keep the construction event. Same test: 0 of 126 frames | The studio object must stay present while a word is typed. |
| Construction scrubber was a native range input, 16px tall | It uses the studio slider styling, 44px tall, with the accent fill | One slider in the system, touch target met. |
| Equation-term buttons were 47×21px targets | Same visual size, 44px-tall target through a pseudo-element | Touch target met without disturbing the line. |
| With `room` on, every draw read computed style two or three times | Room colours come from token tables and are eased in JavaScript; a test fails if drawing reads computed style | Removes the only call tied to the 12–17ms CPU draws recorded during material changes with `room` on. |
| The construction study was lit by a black room (its parent has no background) | It is lit by the page tint | The reflection should match where the object stands. |

**Frame delivery: what the recorded data supports.** Re-reading the raw intervals of the `0ffb4a9` batch without assuming a refresh rate:

- Hitches appear in the plain rotation segment of the baseline too (0–7 intervals over 50ms per two seconds, 33–827ms spent in stalls, n=3), while the same runs record a CPU draw median of 0.10ms and a GPU median near 0.7ms. The renderer's own work cannot produce those stalls; they are the noise floor of that session, which was driven by browser automation.
- "Slow intervals" in the earlier report counts ordinary 60Hz frames, because the display alternated between about 60 and 120Hz. The report now adds counts that do not depend on the refresh rate.
- Two costs stood out with non-overlapping ranges across three runs: CPU draw p95 of 11.6–17.3ms during material changes whenever `room` was on (0.3–2.3ms otherwise), and 5.2–9.4ms during twist whenever `shadow` was on (0.2–3.9ms otherwise).

**Measured here (same machine, CPU timing in a hidden tab, so no frames):** the shadow support probe takes 0.3–0.5ms per call (300 calls per case, all three shapes, settled and under construction), and a full style recalculation at each of 24 steps of the page colour crossfade takes about 1.3ms (median; p95 about 2ms; 236 elements; six repetitions). Neither reproduces the 5–17ms recorded under automation. The style reads were removed from drawing anyway; the support probe was left as it is.

**Measured in an ordinary browser window (2026-10-02, owner's machine).** Chrome 152, Apple M1 Pro, 1800 × 875 at DPR 2, tab visible throughout, no automation attached; quick batch (`/tests/perf.html?layers=none&batch=1&quick=1`), three ten-second runs per configuration, five two-second segments each. Full table: [tests/results/MEASUREMENTS.md](tests/results/MEASUREMENTS.md).

| | Baseline (no layers) | All six depth layers |
| --- | --- | --- |
| Frames delivered per 2s segment (about 241 expected at the calibrated 120.5Hz) | 238–241 | 239–241 |
| Median / p95 interval | 8.3ms / 9.2–9.3ms | 8.3ms / 9.2–9.3ms |
| Intervals over 50ms, all 15 segments | 0 | 0 |
| Intervals over 25ms, all 15 segments | 1 (25.8ms, first run of "Word cast") | 1 (25.1ms, first run of "Word cast") |
| CPU per draw, p95 | 0.1–0.2ms | 0.2–1.5ms |
| GPU per draw, median | 0.66–0.83ms | 1.88–2.41ms |

An earlier batch the same afternoon agrees: baseline, three runs, 238–241 frames, nothing over 25ms; depth pass, two runs before the tab was hidden, 239–241 frames, nothing over 25ms.

Reading: both configurations deliver every frame at 120Hz in all five segments, including twist and material change. The p95 of 9.3ms against an 8.3ms interval is within vsync timing jitter, not a missed frame. The depth layers add about 1.3ms of GPU time and up to 1.3ms of CPU time per draw, inside the 8.3ms budget. The stalls in the `0ffb4a9` batch were that session's automation, not the renderer. The single 25ms interval is the first studio draw after the page scrolls to it, once per page load, in both configurations.

Limits: one machine and one browser; synthetic pointer events, so input latency is not measured; no phone, Safari or Firefox measurement; feel and appearance are still the owner's call.

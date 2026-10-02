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


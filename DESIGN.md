# FORM: sculpture studio edition

Reading this as a playful sculpture exhibition for design-conscious visitors, with a precise, tactile studio at its center. This is a targeted evolution of the existing site: preserve the wordmark, original sculptures, cool gray/copper identity, anchors, collection, and generated still life. Dials: variance 8, motion 7, density 4. The extra motion belongs to creating and discovering sculptures.

## Composition and typography

The hero uses two grid columns and a separate caption/control row. Tablet/mobile changes to a flowing layout. An asymmetric gallery introduces the three mathematical surfaces. The full-width sculpture studio breaks the sequence of split sections, followed by the still life and studio explanation. Collection and material headers are stacked.

One sans-serif family throughout: Helvetica Neue, Helvetica, Arial (a font decision is still pending with the owner). Hero emphasis is italic within the same family with extra descender clearance, replacing the previous decorative serif insertion. Local fonts avoid runtime network requests and system-font redistribution. Body copy is 16px; controls and supporting labels are 14px; gallery catalogue lines are 13px monospace. Light/dark themes remain page-wide and remember the visitor's choice. The studio's three scene background colors are separate artwork settings, also used by the exported print, and are untouched by the page theme.

## Identity: the room takes the temperature of the material

The page tint and accent follow the hero material. `<html>` carries `data-material` (`copper | chrome | porcelain`); picking a hero swatch sets it (the studio's own material does not). Each theme × material pair has its own hand-checked tokens, every text role ≥ 4.5:1 on its background:

| theme / material | --bg | --text | --muted | --line | --surface | --accent | --on-accent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| light / copper | #ECE9E4 | #1F2022 | #5F5B56 | #D2CDC6 | #E2DDD6 | #A04F2B | #FFFFFF |
| light / chrome | #E8EBEE | #1F2022 | #585E64 | #CBD0D5 | #DCE1E6 | #38597A | #FFFFFF |
| light / porcelain | #E9ECE8 | #1F2022 | #595F5B | #CCD2CD | #DDE2DD | #44695A | #FFFFFF |
| dark / copper | #1B1917 | #EEEAE5 | #ABA59D | #3A3632 | #292623 | #E0946A | #1B1917 |
| dark / chrome | #17191C | #E9ECEF | #A4ABB3 | #343A41 | #24292F | #93B7D8 | #17191C |
| dark / porcelain | #171A18 | #E9EDEA | #A3ABA6 | #343A36 | #242A26 | #A3C9B4 | #171A18 |

`--button` = `--text`, `--on-button` = `--bg` throughout. Gallery frames use per-theme tokens `--frame-copper/-chrome/-porcelain` (light `#DDD5CD / #CDD4DA / #C8D0CA`, dark `#2C2622 / #232A32 / #232B27`), so frames stay dark in dark mode. The accent appears only where it earns attention: the hero italic line, the studio heading `em`, nav-hover underline, the active object-tab indicator, slider fill, button cell-hover fill, focus ring, `::selection`, and the gallery open-arrow on hover.

The colour tokens are registered with `@property` (`<color>`, inheriting, light/copper initial values) and crossfaded by one 420ms `ease` transition on `:root`, so a material or theme change blends the whole room. Browsers without `@property` switch instantly (the accepted fallback). `<meta name="theme-color">` tracks `--bg` from a JS lookup table, not `getComputedStyle` (a read mid-crossfade returns an in-between colour).

## Controls

- **Placard button** (`.btn`): 52px (`.btn-sm` 44px), a label beside a square icon cell separated by a hairline. Icons are inline SVG, never Unicode arrows. On fine-pointer hover the cell fills with accent (a `clip-path` wipe) and the icon flips to `--on-accent`; arrow buttons swap a second glyph in from the opposite corner. `:active` scales .97. Used for Make a study (solid, SE arrow), Save print (solid, download→check by `data-state` alone), Surprise me (solid sm, shuffle rotates 180° per click), Pause motion (outline sm, CSS pause/play glyph; label hides ≤600px so the lab toolbar never overflows).
- **Segmented control** (`.seg`): native radios behind one sliding thumb, three options; replaces the old `<select>`s. `data-index` (= value) drives the thumb. Arrow keys and screen readers use the native radios. The material group prefixes each option with a sphere dot.
- **Text links** (`.link`): one underlined treatment for Reset view, Start again, Open in viewer, Back to top; hover moves the underline colour to accent.
- **Sliders**: 2px track, accent fill driven by a `--fill` percentage set in JS; 20px round thumb on both engines, scaling on hover/active. The cast field (`#study-title`) is an underline-only field: 32px (26px ≤600px), letter-spacing -.02em.
- **Swatches**: radial-gradient spheres; the material name sits in the viewer tools at every breakpoint.
- **Theme toggle**: icon-only 44×44, rotates 180° when the effective theme is dark.

## Visitor experience

Explore an object, enter the studio, manipulate its surface, try a curated combination, and keep a personal poster. Segmented object/material controls (native radios) and labeled twist/light ranges keep the experience discoverable. A separate 44px touch handle offers direct shaping without capturing gestures elsewhere on the page. Keyboard arrows, Home/End, and PageUp/PageDown offer equivalent control. The word is optional, limited to 42 characters, and only ever inserted as text (`.value` / `textContent`). Printing exports a 1200 × 1500 PNG locally, without accounts or uploads.

Five curated studies deliberately pair shape, material, twist, light, angle, and scene. Surprise me excludes the immediately previous choice. User naming persists across discovery; Start again restores the original Bloom studio.

## Cast a word

The visitor types a word into the cast row (between the section copy and the stage) and FORM casts a sculpture from it: same word, same sculpture, on every device. Beside the field (below it ≤600px) a 13px monospace readout `#cast-readout` reads `Nº — — type to cast`, then `Nº <8 hex> — <Shape> / <Material> / <n> lobes`, plus ` / adjusted` once any control changes the cast. It swaps text without animation and reserves its height (one line, two ≤600px).

- **Mapping** (`castWord`): normalise with NFKC, trim, collapse whitespace, lowercase; empty means no cast. FNV-1a 32-bit over the UTF-16 code units seeds mulberry32, drawn in order: shape, material, scene (silver/sage/ink), twist 20–100, light 0–180, lobes 2–9 (integer), wave 3.0–12.0, x −0.6–0.6, y 0–2π.
- **Behaviour**: input is debounced 220ms; Enter casts at once (and recasts the same word on purpose). Retyping the same normalised word does not undo refinements. A cast drives the existing controls in order (object, material, twist, light, scene, form, pose) and announces `Cast: <Shape>, <Material>.` once. The pose turns by the shortest path to the cast angle. Sliders, the handle, the segmented groups and Surprise me keep the word; Surprise me restores lobes 5 / wave 7; Start again clears the word and the form.
- **Form uniforms**: the vertex ripple is `1 + tension·0.07·uRipple·fade·sin(p.y·uWave + atan(p.z,p.x)·uLobes)`, where `fade = smoothstep(0.03·uLobes, 0.03·uLobes + 0.35, length(p.xz))`. `atan` is singular on the vertical axis and the lobes crowd together near it, so the ripple fades out there, sooner for higher lobe counts, before the 192×64 mesh stops resolving it. This changes the lab render near the axis whenever twist is above zero; the hero and gallery (twist 0) are pixel-identical to before. Every sculpture defaults to lobes 5, wave 7, ripple 1, which is the original surface; with no word typed the hero, previews and lab render as before.
- **Ripple gate**: `atan` wraps at ±π, so a fractional lobe count would show a seam; lobes are never interpolated. Each frame wave eases toward its target; while lobes differ from the target the ripple eases to 0 and the integer lobe count switches only on a frame that starts with ripple < 0.02; then the ripple eases back to 1. Retargeting mid-transition can never change lobes while the ripple is raised. Reduced motion snaps all three. Rendering continues until ripple and wave settle, then stops as before.
- **Share link** (`#copy-link`, outline placard with a link icon that crossfades to a check for 1600ms on success): `#study=v1.<shape>.<material>.<scene 0–2>.<twist>.<light>.<lobes>.<wave×10>.<round(x×100)>.<round((y mod 2π)×100)>[&name=<encoded title>]`, from the displayed pose, the slider values and the target form. Copy link first writes the hash with `history.replaceState`, then tries the clipboard; without it, the status says the address bar holds the link. `parseStudy` accepts only exactly nine in-range integers (x may be negative); anything else is ignored, so ordinary anchors keep working. A valid link (on load or `hashchange`) applies immediately with no morph or crossfade, fills the field without recasting, and scrolls the studio into view.
- **Copy**: the default status is `Your print is a PNG. Nothing you type leaves this page.` The word is never stored or sent; it exists only in the field and, when the visitor copies a link, in that link.

## Motion contract

- Hero typography enters as two masked lines over 650ms, 55ms apart. Its sculpture fades in concurrently. Other page content remains immediately available.
- Shape morphs take 650ms and preserve the current blended surface when interrupted. A cast reuses the existing morph, material, twist/light/pose easing and scene colour timings, plus the ripple gate; it adds no entrance animation.
- Material transitions take 220ms and retarget from the current displayed values.
- Direct twisting follows input immediately. Preset deformation and light ease toward their targets. The handle has a small resistance beyond its limits and settles on release using a 220ms transform transition.
- Object dragging has damped angular inertia. Arrow-key object rotation is immediate.
- Gallery objects rotate on fine-pointer hover; frames stay still. A small arrow acknowledges their open action.
- Editorial image, studio explanation, and footer stay still.
- Material/theme change crossfades the colour tokens over 420ms. The object-tab indicator slides (260ms) but does not animate its first placement. Segmented thumbs slide 220ms. Placard cell wipes 220ms, arrow swaps 260ms, Save print icon crossfade 200ms, Surprise/theme icon rotation 320ms. No section-level scroll-reveal animations: motion stays on the objects (plus the room's colour response).
- No `transition: all`, no `ease-in`, and no UI transition over 320ms except the 420ms token crossfade and the existing 650ms hero entrance/morph. Hover effects live inside `@media (hover: hover) and (pointer: fine)`.

The main timing curve is cubic-bezier(.23,1,.32,1), shared by CSS and JavaScript. Reduced motion removes movement — transform, rotate, scale, clip-path, automatic rotation, inertia, morph transitions, and entrances — while preserving colour/opacity transitions and the material crossfade; manual interaction remains. Page hiding and offscreen observers suspend rendering. Preference changes preserve explicit pause choices. Context loss cancels sculpting and disables unavailable controls; restoration rebuilds resources and restores access.

## Renderer and export

Dependency-free WebGL with shared topology, GGX direct lighting, Schlick Fresnel, procedural studio reflections, subtle metal grain, and filmic tone mapping. Finite-difference normals follow deformation. Geometry is generated once at startup; ResizeObserver caches dimensions. DPR is capped at 1.5 (1.25 previews), and scale follows the shorter viewport dimension.

Simulation and drawing are separate. Print composition draws a high-resolution frame immediately before copying it to a 2D canvas, then restores the live canvas dimensions. It does not advance the pose or material transition and does not require preserveDrawingBuffer. Encoding has visible busy, success, and retry states, prevents duplicate export clicks, and revokes temporary object URLs.

## Pre-flight and validation boundary

Static checks cover unique IDs, valid anchors/assets, labeled controls, slider semantics, text contrast, and source/standalone consistency. Mocked rendering checks cover state transitions, gestures, keyboard control, context recovery, pause settings, curated variation, export state preservation, dimension restoration, and failures. Local preview restrictions still prevent browser visual review. Actual GPU rendering, PNG pixels, mobile Safari downloading, font wrapping, and perceived smoothness remain outstanding. See AUDIT.md and README.md.

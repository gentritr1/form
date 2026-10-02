# Brief: the 3D depth pass for FORM

You are a 3D and real-time graphics specialist. This brief is self-contained: you have no access to the conversations that produced the project, so read it fully, then read the code it points at before you design anything.

## What FORM is

FORM is a fictional sculpture exhibition built as a frontend portfolio piece. It is a static site with no dependencies and no network requests at runtime. Everything 3D is hand-written WebGL in one file.

- `dist/index.html`, `dist/styles.css`, `dist/app.js` (530 lines, 41 KB) are the source.
- `npm run check` runs `tests/renderer.cjs`, mock-DOM state tests with a mocked GL context. `npm run build` inlines `dist` into the standalone `FORM.html`. `npm run dev` serves `dist` on `127.0.0.1:4173`.
- `DESIGN.md` holds the design decisions and the motion contract. `AUDIT.md` holds what was changed, what was verified by execution and what was not.

The site rests on three ideas. Every change you make must serve at least one of them, and you should be able to say which.

1. **Made from mathematics.** There are three sculptures: a trefoil knot tube, a ring with an uneven radius, and a sphere folded into eight lobes. Each is a parametric surface (`surface()` in `app.js`), and the gallery prints each equation as a wall label.
2. **The room takes the temperature of the material.** Choosing copper, chrome or porcelain re-tints the whole page (`html[data-material]`, colour tokens in `styles.css`).
3. **Every word has a form.** In the studio a typed word deterministically casts a sculpture (`castWord`, `applyCast`): object, material, scene, twist, light, lobe count, wave and angle. It can be printed as a poster (`composePoster`) or shared as a link (`parseStudy`).

## What the renderer is today

Read `app.js` lines 26–110 (shaders), 144–182 (geometry), 183–320 (`Sculpture`).

- Five WebGL1 contexts: hero, studio ("lab") and three gallery previews. Each compiles its own program and uploads its own buffers.
- One shared topology: a 193 × 65 vertex grid (12,545 vertices, 73,728 indices) per shape, generated once in JavaScript.
- Shape changes are a linear vertex blend between two meshes over 650ms (`uMorph`), interruptible. Mid-morph normals come from a blended normal, not from the blended surface.
- Deformation in the vertex shader: a twist about the vertical axis and a ripple with `uLobes`, `uWave`, `uRipple`. Normals are rebuilt with finite differences. Lobes must stay integers; they swap only while the ripple is flat (the "ripple gate" in `render`).
- Shading: a procedural environment (a vertical gradient plus four highlight lobes), two direct GGX lights, Schlick Fresnel, a height-based occlusion term, filmic tone mapping. No shadows, no ground, no environment that knows about the page.
- Rendering stops when a canvas is offscreen, the page is hidden, or nothing is changing. Device pixel ratio is capped at 1.5 (1.25 for previews).
- Motion that exists: auto-rotation, drag with damped inertia, pointer-driven light in the hero, eased twist, light and pose, a 220ms material blend, the ripple gate.

## What is missing, and what I want from you

The sculptures render well, but they float on a flat colour, they do not react to the room they are in, and their transitions are blends rather than events. The text says "made from mathematics", "a different kind of weight", "cast". The 3D does not yet say any of those things. Your job is to make the 3D carry meaning the copy only claims, and to do it with construction that holds up: interruptible, measured, cheap when idle.

Work through the packages below in order. Each one names the meaning it adds, the construction, and how it will be judged. If you think a package is the wrong idea, say so and propose a better one that serves the same meaning; do not silently skip it.

### 0. Measure first

Nobody has measured this renderer's frame rate. The previous review could not: its browser reported the page as hidden and produced no animation frames. Before changing anything:

- Write `tests/perf.html` (or a `?perf=1` mode) that runs in a real, visible browser tab and records `requestAnimationFrame` intervals for a fixed 10-second script: hero auto-rotating, a shape change, a material change, a cast, a twist drag.
- Report, for each segment: frames delivered next to frames expected (`window × refresh rate`), median, p95 and worst interval, and count of intervals over 1.5× the refresh interval. A percentile without the frame-count reconciliation next to it is not a measurement. Check `document.hidden` is false and say what machine, browser, window size and DPR you measured on.
- If `EXT_disjoint_timer_query` is available, report GPU time per draw as well.
- Record this baseline in `AUDIT.md`. Every later performance claim is a delta against it, from the same script.

### 1. One context, one program

Five contexts each hold a program and three meshes. Move to a single renderer that draws every visible sculpture: one WebGL2 context when available (WebGL1 fallback kept), one program, one copy of each mesh, vertex array objects. Either one fixed canvas with scissored viewports aligned to the placeholders, or one offscreen context blitted to 2D canvases; choose by measurement and say why.

- The public behaviour of `Sculpture` (select, setMaterial, setTension, setForm, reset, copyTo, availability and context-loss handling) must not change. The existing tests are the contract.
- Previews may use a lower-resolution mesh if you can show they look the same at their size.
- Judged by: the pixel-hash check below still passes for hero and previews; context loss and restoration still recover every canvas; the perf script shows no regression.

### 2. Weight: a ground and a shadow

A sculpture with no shadow has no weight, and "Light direction" is a slider whose effect is hard to see. Give each sculpture a ground relationship: a soft contact shadow that comes from the actual silhouette under the actual key light, so moving the light slider or pulling the twist handle visibly moves and reshapes the shadow.

- Derive it from geometry (a small depth or silhouette pass from the light, blurred), not a painted blob.
- It must sit correctly on every background: the page tint in the hero, the three gallery frames in both themes, the three studio scenes, and the exported poster.
- Judged by: screenshots at three light angles showing the shadow following the light; the shadow present in the exported poster; cost reported from the perf script.

### 3. The room in the metal

Chrome currently reflects a fixed grey studio regardless of where it sits. Make the environment a function of the room: the page tint and accent for the hero, the frame colour for the gallery, the scene colour in the studio. When the visitor switches material and the page crossfades, the reflections should cross with it. Chrome on the copper-tinted page should carry warm light at its edges.

- Keep the environment procedural (no image downloads). Describe the light rig you design as a rig: key, fill, rim, floor bounce, with sizes and colours.
- Give each material a surface that is specific to it: brushed anisotropy along the tube for copper (there is a sine "grain" hack to replace), a mirror with slight roughness variation for chrome, a glazed clearcoat over a soft diffuse body for porcelain.
- Judged by: one screenshot grid, three materials × six theme and material page states, where the same sculpture is visibly lit by its room; a note on energy conservation and where you approximated.

### 4. Equations become objects

This is the layer text cannot cover. The wall labels show equations; nothing shows what a term does.

- **Construction.** Replace the linear vertex blend with a construction that reads as mathematics: the generating curve is drawn first, the tube sweeps along it, the radius modulation arrives last. The "It starts with a curve" section currently has no object in it; it is the natural home for a sculpture that assembles from its curve as the visitor arrives and can be scrubbed.
- **Terms you can touch.** Make the terms of each wall-label equation interactive: pressing or focusing `cos 3t` in the trefoil's label animates that parameter on the nearby sculpture (a slow, bounded oscillation around its true value, returning when released), so the visitor sees what the term contributes. This needs the surfaces evaluated on the GPU, or re-evaluated cheaply on the CPU; pick one and justify it.
- Keyboard and screen-reader access is required: terms are buttons with labels that say what they change. Under reduced motion the parameter steps to a second value and back without animating.
- Judged by: a recording or frame sequence of each construction; the term interaction working from keyboard alone; interruption at any frame leaving a valid closed surface (assert no NaN positions and no seam in a test).

### 5. Cast means cast

Typing a word currently morphs and blends. Casting is a physical process: something is poured, sets, and cools.

- Design a cast transition where the form arrives as a material event: for example a front that travels along the surface's own parameter, the surface starting rough and warm and settling to its finished roughness and colour behind the front. The exact idea is yours; the requirement is that a viewer who cannot read the UI would still guess the word "cast".
- Each keystroke may give the surface a small, deterministic impulse so that typing has a physical rhythm, but the settled form must remain exactly the deterministic cast (the share link and the poster depend on it).
- The same event should replace the 220ms uniform blend when the visitor changes material by hand.
- Must be interruptible at any frame. The ripple-gate rule stands: the lobe count never changes while the ripple is visibly raised.
- Judged by: frame sequences of a cast and of an interrupted cast; the determinism tests in `tests/renderer.cjs` untouched and passing; a link opened on another machine showing the same settled form.

### 6. The still image becomes live (optional, only if 0–5 are solid)

The section "A different kind of weight" shows a generated still of chrome folded around cobalt glass, described as "beyond the live collection". A fourth live material, cobalt glass with refraction, absorption by thickness and a Fresnel rim, would let that section be a real object. Attempt it only if you can hold the frame budget; otherwise leave the section alone and say so.

## How motion will be judged

- Every animation needs a purpose you can state in one line: it explains something, it gives feedback, or it preserves continuity. "It looks good" is not a purpose.
- Anything a visitor can trigger twice quickly must be interruptible and must retarget from its current state, never restart from zero.
- Movement driven by a pointer is eased or sprung, never tied one-to-one to the cursor; movement driven by a keyboard is immediate.
- Durations: feedback under 200ms, state changes 200–400ms, the construction and cast events may run longer because they are the content. Use the existing curve `cubic-bezier(.23, 1, .32, 1)` (the `easeOut` function in `app.js` matches it) unless you can say why another is right.
- Reduced motion: no automatic movement, no travelling fronts, no construction playback. State still changes, with a short opacity or colour change at most.
- Nothing may depend on an animation finishing in order to become visible or usable.

## Performance rules

- Idle cost stays zero: when nothing changes, nothing renders.
- Adapt resolution to the frame budget: lower DPR while moving if the measured interval exceeds the budget, then render one sharp frame when motion stops.
- Any extra pass (shadow, thickness) runs at a reduced resolution and only for canvases that are visible.
- Report the cost of each package separately from the same perf script: enable one layer at a time through a query flag such as `?layers=shadow,room`, with everything off equal to today's output. Keep the flags in the build; they are how the owner will compare.
- Do not state a shortfall or a gain smaller than run-to-run variation. Run the script at least three times per configuration and give the range.

## Constraints

- No dependencies, no build tooling beyond `build.mjs`, no network requests, no downloaded assets. The standalone `FORM.html` must keep working when opened from disk.
- Do not change tokens, typography, layout, buttons, the cast mapping (`castWord`), or the link format (`parseStudy`). A link created today must open to the same settled form after your work.
- Do not delete or weaken existing assertions in `tests/renderer.cjs`. Add tests for every new state machine.
- The poster export (`composePoster`, `copyTo`) must keep producing a 1200 × 1500 PNG of exactly what is on screen, including any new shadow or lighting.
- WebGL context loss and restoration must keep working for every canvas.

## Checks you must run and report

1. `npm run check` and `npm run build`.
2. **Pixel regression with all layers off.** For hero and the three previews, draw at 400 × 300 at fixed poses and hash `gl.readPixels` in the same task as the draw. Hashes recorded on the owner's machine before this brief, for comparison on that machine only: hero at (x −0.38, y 0.35, twist 0, light 0.15) `dcbc4c2a`, hero at (0.2, 1.1, 0, 0.15) `577ba6bf`, previews at (−0.38, 0.35, 0, 0.15) `937de9cc` and `ce2785be`, and Bloom preview at (0.15, 0.35, 0, 0.15) `f72ad12a`. On any other GPU, record your own before-hashes first and compare against those.
3. The perf script, baseline and per layer, as specified in package 0.
4. A real, visible browser for anything you call smooth. If you cannot get one, say exactly that and list what remains unseen.
5. Widths 320, 375, 768, 925, 1100, 1240, 1440 in both themes: no horizontal scroll, no canvas stretched to the wrong aspect.

## Report back

For each package: what you built, the one-line meaning it adds, what you measured (numbers with their sample counts), what you only inferred, what you chose not to do and why. Mark every claim as executed-and-observed or as inferred from reading. Feel and beauty are judged by the owner on the running site, with the layer flags, so do not declare them done; show the before and after and let them decide.

# FORM: Exhibition Edition

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

## Explore

- Three original sculptures with interruptible shape transitions.
- Copper, chrome, and porcelain with procedural studio reflections and physically inspired lighting.
- Pointer rotation with inertia, immediate arrow-key rotation, pause and reset.
- Asymmetric gallery with object-specific construction notes and clear viewer actions.
- Surface playground with twist and light direction controls.
- Original generated artwork, identified separately from the live sculptures.
- A restrained hero entrance, serif display accents, and a responsive exhibition layout.
- Remembered theme choice, visible focus, reduced motion, context recovery, and offscreen/background suspension.

## Edit

- `dist/index.html`: copy, structure, and semantics.
- `dist/styles.css`: tokens, layouts, typography, and page motion.
- `dist/app.js`: geometry, shaders, rendering lifecycle, and interactions.
- `dist/assets/material-dreams.jpg`: generated editorial artwork.
- `tests/renderer.cjs`: mocked state/lifecycle checks.
- `DESIGN.md`: visual and motion decisions.
- `AUDIT.md`: anti-pattern findings and refinements.

## Assets and concept

FORM is a fictional studio. Its original mathematical sculptures are included in this project. The still life was generated with the available image-generation tool; no model version was exposed. There are no real client, award, or commercial claims. Runtime assets are local; there are no trackers or third-party requests.

## Skills

Applied available Taste and UI/UX Pro Max guidance, Anthropic Frontend Design, Impeccable craft guidance, and Emil Kowalski animation construction/review standards. These informed composition, copy specificity, timing, interruption, pointer gating, and reduced-motion treatment. Remote skill installation and the Impeccable context launcher were unavailable in the execution environment.

## Verification and limitations

Syntax, fragment links, local assets, geometry finiteness and normals, shared topology, and interaction state checks passed. The WebGL context in the regression check is mocked: it does not establish GPU shader compilation or visual correctness. Local preview restrictions prevented browser screenshot review. Publishing was attempted, but the source host was unreachable under the environment's network restrictions. Browser visual review is still required before presenting the project publicly; use the viewport and interaction checks in AUDIT.md.

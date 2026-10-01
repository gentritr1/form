# FORM: sculpture studio edition

Reading this as a playful sculpture exhibition for design-conscious visitors, with a precise, tactile studio at its center. This is a targeted evolution of the existing site: preserve the wordmark, original sculptures, cool gray/copper identity, anchors, collection, and generated still life. Dials: variance 8, motion 7, density 4. The extra motion belongs to creating and discovering sculptures.

## Composition and typography

The hero uses two grid columns and a separate caption/control row. Tablet/mobile changes to a flowing layout. An asymmetric gallery introduces the three mathematical surfaces. The full-width sculpture studio breaks the sequence of split sections, followed by the still life and studio explanation. Collection and material headers are stacked.

One sans-serif family throughout: Helvetica Neue, Helvetica, Arial. Hero emphasis is italic within the same family with extra descender clearance, replacing the previous decorative serif insertion. Local fonts avoid runtime network requests and system-font redistribution. Body copy is 16px; controls and supporting labels are 14px. Existing tokens: cool gray #e9ebed, charcoal #272a2d, muted #5b6065, copper #a55c3b. Light/dark themes remain page-wide and remember the visitor's choice. The studio's three background colors are artwork settings also used by the exported print.

## Visitor experience

Explore an object, enter the studio, manipulate its surface, try a curated combination, and keep a personal poster. Native object/material selects and labeled twist/light ranges keep the experience discoverable. A separate 44px touch handle offers direct shaping without capturing gestures elsewhere on the page. Keyboard arrows, Home/End, and PageUp/PageDown offer equivalent control. The title is optional, limited to 42 characters, and inserted as text. Printing exports a 1200 × 1500 PNG locally, without accounts or uploads.

Five curated studies deliberately pair shape, material, twist, light, angle, and scene. Surprise me excludes the immediately previous choice. User naming persists across discovery; Start again restores the original Bloom studio.

## Motion contract

- Hero typography enters as two masked lines over 650ms, 55ms apart. Its sculpture fades in concurrently. Other page content remains immediately available.
- Shape morphs take 650ms and preserve the current blended surface when interrupted.
- Material transitions take 220ms and retarget from the current displayed values.
- Direct twisting follows input immediately. Preset deformation and light ease toward their targets. The handle has a small resistance beyond its limits and settles on release using a 220ms transform transition.
- Object dragging has damped angular inertia. Arrow-key object rotation is immediate.
- Gallery objects rotate on fine-pointer hover; frames stay still. A small arrow acknowledges their open action.
- Editorial image, studio explanation, and footer stay still.

The main timing curve is cubic-bezier(.23,1,.32,1), shared by CSS and JavaScript. Reduced motion removes automatic rotation, inertia, morph transitions, and entrances, while manual interaction remains. Page hiding and offscreen observers suspend rendering. Preference changes preserve explicit pause choices. Context loss cancels sculpting and disables unavailable controls; restoration rebuilds resources and restores access.

## Renderer and export

Dependency-free WebGL with shared topology, GGX direct lighting, Schlick Fresnel, procedural studio reflections, subtle metal grain, and filmic tone mapping. Finite-difference normals follow deformation. Geometry is generated once at startup; ResizeObserver caches dimensions. DPR is capped at 1.5 (1.25 previews), and scale follows the shorter viewport dimension.

Simulation and drawing are separate. Print composition draws a high-resolution frame immediately before copying it to a 2D canvas, then restores the live canvas dimensions. It does not advance the pose or material transition and does not require preserveDrawingBuffer. Encoding has visible busy, success, and retry states, prevents duplicate export clicks, and revokes temporary object URLs.

## Pre-flight and validation boundary

Static checks cover unique IDs, valid anchors/assets, labeled controls, slider semantics, text contrast, and source/standalone consistency. Mocked rendering checks cover state transitions, gestures, keyboard control, context recovery, pause settings, curated variation, export state preservation, dimension restoration, and failures. Local preview restrictions still prevent browser visual review. Actual GPU rendering, PNG pixels, mobile Safari downloading, font wrapping, and perceived smoothness remain outstanding. See AUDIT.md and README.md.

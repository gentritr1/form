# FORM: exhibition edition

FORM is an interactive sculpture exhibition. Its identity comes from three original parametric surfaces, restrained material colors, and a contrast between precise sans-serif labels and italic serif sculpture names. The surrounding interface gives the objects room.

## Composition

The hero uses two real grid columns, followed by a separate caption/control row. It changes to a flowing layout at tablet widths. The gallery is asymmetric: a larger Trefoil, an offset Orbit, then a wide Bloom. Flat artwork frames and text controls replace the previous repeated capsules and rounded cards. Each object has a specific description of its construction. The generated chrome-and-cobalt image is explicitly identified as a separate concept image.

Typography uses locally available Helvetica Neue and Georgia with standard fallbacks. No network font requests or restricted system-font redistribution. Desktop body copy is 16px; controls and secondary labels are 14px. Cool gray #e9ebed, charcoal #272a2d, secondary #5b6065, copper #a55c3b. Full-page light/dark tokens, remembered theme choice, and matching browser theme color.

## Motion contract

- The hero's two masked lines enter over 650ms, 55ms apart. Its sculpture fades in at the same time. Supporting content is available immediately.
- Object selection morphs a common topology over 650ms. This motion explains the relationship between surfaces. An interrupted morph captures the displayed surface before retargeting.
- Materials transition over 220ms from the currently displayed color, metalness, and roughness.
- Pointer rotation carries damped angular inertia. Keyboard rotation responds immediately. Fine-pointer movement shifts the hero light; leaving the viewer recenters it.
- Gallery objects rotate on fine-pointer hover. Their frames stay still. A small directional arrow confirms the open action.
- Editorial imagery, studio text, and the footer remain still. The sculpture holds the page's motion hierarchy.

Cubic-bezier(.23,1,.32,1) is shared by CSS and JavaScript. Automatic motion stops offscreen or when the page is hidden. Reduced motion removes automatic rotation, inertia, morph transitions, and entrance effects. Changing this preference preserves the visitor's explicit pause choice. Hero and playground have independent pause controls.

## 3D and recovery

Dependency-free WebGL; shared mesh topology; GGX direct lighting; Schlick Fresnel; procedural studio reflections; subtle metal grain; filmic tone mapping. Playground deformation uses finite-difference normals. Startup generates geometry once. ResizeObserver caches canvas dimensions. Pixel ratio is capped at 1.5 (1.25 for previews). Object scale follows the shorter viewport dimension to prevent portrait clipping.

A lost WebGL context hides the canvas and disables unavailable controls. Restoration rebuilds buffers and shaders, hides fallback text, and re-enables controls. Gallery selection focuses a visible selector if the live viewer is unavailable. A no-JavaScript message is present near the page top.

## Validation boundary

State/lifecycle regression checks use a mock WebGL context. They do not verify shader compilation, browser layout, appearance, or perceived timing. Browser visual review remains outstanding because the execution environment blocks local previews. See AUDIT.md for the refinement decisions and README.md for running the project.

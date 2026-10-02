# Visible-browser measurements

Records accepted: built from the current `dist/app.js` (SHA-256 `1cd9a1183459…`), valid, three ten-second samples per configuration, five two-second segments per sample. Every range below has n=3 runs. Timer-query overhead is included. Browser, viewport and DPR for each configuration are listed under "Boundary intervals"; only compare configurations measured at the same viewport.

Frame reconciliation and slow counts are recomputed from the saved raw intervals using one common reference: the final baseline's 120-interval calibration, **120.482 Hz** (240.964 expected callbacks per 2 seconds; slow threshold 12.45 ms). This is a comparison assumption, not an independently measured panel refresh rate. Individual idle calibrations varied, including a roughly 60Hz estimate followed by roughly 120Hz delivery; comparing their original expected counts directly would be misleading. Raw files retain those original calibrations and statistics unchanged.

These are measurements of frame delivery on one machine, not a judgement of how the motion feels. GPU times cover each sculpture draw including enabled passes. Synthetic handle events exercise the renderer but do not measure hardware input latency.

"Slow intervals" depends on the assumed refresh rate and counts ordinary 60Hz frames on an adaptive 120Hz display. The three stall columns do not: an interval over 25ms is a missed frame at 60Hz, over 50ms is a visible hitch, and "ms in stalls" is the time spent in intervals over 25ms within the two-second segment.

| Layers | Segment | Delivered / expected per 2s | Median ms | p95 ms | Worst ms | Slow intervals | Over 25ms | Over 50ms | ms in stalls | CPU draw p95 ms | GPU median ms (draw counts per run) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | Hero rotation | 239–240 / 240.964 | 8.3–8.3 | 9.3–9.3 | 9.4–11.6 | 0–0 | 0–0 | 0–0 | 0–0 | 0.2–0.2 | 0.782–0.828 (241/240/240) |
| none | Shape change | 239–240 / 240.964 | 8.3–8.3 | 9.2–9.3 | 9.4–10.3 | 0–0 | 0–0 | 0–0 | 0–0 | 0.2–0.2 | 0.676–0.742 (239/240/240) |
| none | Material change | 240–241 / 240.964 | 8.3–8.3 | 9.2–9.3 | 9.4–10 | 0–0 | 0–0 | 0–0 | 0–0 | 0.2–0.2 | 0.722–0.738 (241/240/241) |
| none | Word cast | 238–240 / 240.964 | 8.3–8.3 | 9.2–9.3 | 9.4–25.8 | 0–2 | 0–1 | 0–0 | 0–26 | 0.1–0.2 | 0.657–0.795 (86/88/88) |
| none | Twist drag | 239–241 / 240.964 | 8.3–8.3 | 9.3–9.3 | 9.4–9.4 | 0–0 | 0–0 | 0–0 | 0–0 | 0.1–0.2 | 0.807–0.825 (239/240/241) |
| direct,shadow,room,construction,cast,adaptive | Hero rotation | 239–240 / 240.964 | 8.3–8.3 | 9.2–9.3 | 9.4–10.9 | 0–0 | 0–0 | 0–0 | 0–0 | 0.3–0.3 | 2.059–2.411 (240/241/240) |
| direct,shadow,room,construction,cast,adaptive | Shape change | 240–241 / 240.964 | 8.3–8.3 | 9.2–9.3 | 9.3–9.5 | 0–0 | 0–0 | 0–0 | 0–0 | 1.5–1.5 | 1.875–2.097 (240/240/241) |
| direct,shadow,room,construction,cast,adaptive | Material change | 240–240 / 240.964 | 8.3–8.3 | 9.3–9.3 | 9.4–9.4 | 0–0 | 0–0 | 0–0 | 0–0 | 0.2–0.3 | 1.883–2.119 (240/240/240) |
| direct,shadow,room,construction,cast,adaptive | Word cast | 239–240 / 240.964 | 8.3–8.3 | 9.2–9.3 | 9.4–25.1 | 0–1 | 0–1 | 0–0 | 0–25 | 1.4–1.5 | 2.303–2.364 (173/176/176) |
| direct,shadow,room,construction,cast,adaptive | Twist drag | 239–240 / 240.964 | 8.3–8.3 | 9.3–9.3 | 9.4–9.4 | 0–0 | 0–0 | 0–0 | 0–0 | 0.8–0.9 | 2.311–2.339 (239/240/239) |

## Boundary intervals and raw data

Raw records are local files under `tests/results` and are not committed.

- none: 1800 × 875 at DPR 2, Chrome/152; original idle estimate 120.482 Hz; terminal intervals 9.1 / 8.1 / 7.8 ms; overshoot 0.1 / 0.7 / 7.3 ms. Raw data: [form-perf-v1-1790948227021-xrbwof.json](form-perf-v1-1790948227021-xrbwof.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].
- direct,shadow,room,construction,cast,adaptive: 1800 × 875 at DPR 2, Chrome/152; original idle estimate 120.482 Hz; terminal intervals 8.2 / 8.3 / 8.7 ms; overshoot 0 / 8.2 / 0 ms. Raw data: [form-perf-v1-1790948260211-bfwpms.json](form-perf-v1-1790948260211-bfwpms.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].

## Retained attempts outside the comparison

- [form-perf-v1-1790947330709-0icaph.json](form-perf-v1-1790947330709-0icaph.json): none, 1800 × 875, DPR 2; completed, outside the final source/viewport comparison set.
- [form-perf-v1-1790947358329-1jlfr1.json](form-perf-v1-1790947358329-1jlfr1.json): direct,shadow,room,construction,cast,adaptive, 1800 × 875, DPR 2; INVALID: tab became hidden..

## Other browser evidence



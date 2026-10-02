# Visible-browser measurements at commit 0ffb4a9

Historical record. These numbers describe the renderer as it was at commit `0ffb4a9`, before the review fixes. The raw records linked below are no longer in the working tree; read them with `git show 0ffb4a9:tests/results/<file>`. New runs are summarised in `MEASUREMENTS.md` by `npm run report`.

Executed in Chrome 152, Apple M1 Pro, macOS 26.5.2. Comparable set: 1800 × 875 CSS pixels, DPR 1, visible throughout each accepted run. Three ten-second samples per configuration; five two-second segments per sample. Every range below has n=3 runs. Timer-query overhead is included.

Frame reconciliation and slow counts are recomputed from the saved raw intervals using one common reference: the final baseline's 120-interval calibration, **120.482 Hz** (240.964 expected callbacks per 2 seconds; slow threshold 12.45 ms). This is a comparison assumption, not an independently measured panel refresh rate. Individual idle calibrations varied, including a roughly 60Hz estimate followed by roughly 120Hz delivery; comparing their original expected counts directly would be misleading. Raw files retain those original calibrations and statistics unchanged.

These are measurements, not a claim of smoothness or a performance improvement. Baseline and candidate ranges vary considerably. GPU times cover each sculpture draw including enabled passes. Synthetic handle events exercise the renderer but do not measure hardware input latency.

| Layers | Segment | Delivered / expected per 2s | Median ms | p95 ms | Worst ms | Slow intervals | GPU median ms (draw counts per run) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | Hero rotation | 132–212 / 240.964 | 8.3–8.5 | 16.7–50.5 | 32.6–100.1 | 17–39 | 0.693–0.777 (212/213/133) |
| none | Shape change | 106–217 / 240.964 | 8.3–8.4 | 16.7–67.2 | 33.3–333.3 | 20–26 | 0.624–0.694 (203/217/106) |
| none | Material change | 66–178 / 240.964 | 8.4–16.6 | 25.5–83.4 | 66.6–274.9 | 23–41 | 0.633–0.717 (178/176/66) |
| none | Word cast | 126–210 / 240.964 | 8.4–8.4 | 16.7–33.4 | 33.4–366.2 | 22–25 | 0.533–0.617 (55/72/60) |
| none | Twist drag | 103–112 / 240.964 | 8.8–16.3 | 41.6–58.3 | 91.2–125.5 | 47–55 | 0.523–0.598 (103/110/112) |
| direct | Hero rotation | 198–209 / 240.964 | 8.3–8.4 | 16.8–24 | 41.3–75.1 | 16–24 | 0.635–0.707 (210/199/202) |
| direct | Shape change | 212–214 / 240.964 | 8.3–8.4 | 15.8–16.7 | 33.6–66.6 | 12–21 | 0.604–0.671 (214/214/212) |
| direct | Material change | 168–203 / 240.964 | 8.3–8.4 | 17.5–33.3 | 34.3–124.5 | 14–26 | 0.527–0.609 (168/203/179) |
| direct | Word cast | 147–220 / 240.964 | 8.3–8.5 | 16.1–25 | 50.1–258.4 | 13–41 | 0.526–0.813 (68/73/67) |
| direct | Twist drag | 29–213 / 240.964 | 8.3–42.1 | 16.7–216.3 | 25.6–300.1 | 23–51 | 0.557–0.636 (29/213/100) |
| shadow | Hero rotation | 192–238 / 240.964 | 8.3–8.4 | 9.2–24.4 | 16.9–58.5 | 2–29 | 1.1–1.313 (239/238/193) |
| shadow | Shape change | 212–228 / 240.964 | 8.3–8.4 | 9.3–16.7 | 33.5–41.6 | 7–23 | 1.038–1.095 (212/228/216) |
| shadow | Material change | 158–205 / 240.964 | 8.4–8.4 | 16.8–33.9 | 42.3–99.1 | 20–38 | 0.987–1.184 (169/205/158) |
| shadow | Word cast | 150–202 / 240.964 | 8.3–8.6 | 16.6–25.3 | 100–141.7 | 18–54 | 0.96–1.065 (53/75/53) |
| shadow | Twist drag | 87–123 / 240.964 | 9.2–16.9 | 41.7–42.2 | 58.5–183.5 | 61–64 | 1–1.118 (123/87/115) |
| room | Hero rotation | 232–239 / 240.964 | 8.3–8.3 | 9.1–9.3 | 16.7–25 | 1–7 | 0.78–0.957 (238/233/240) |
| room | Shape change | 152–241 / 240.964 | 8.3–8.4 | 9.3–33.4 | 12.2–125.2 | 0–33 | 0.729–0.886 (218/152/241) |
| room | Material change | 170–206 / 240.964 | 8.3–8.4 | 17.3–25.1 | 34.2–100.5 | 20–35 | 0.735–0.839 (170/190/206) |
| room | Word cast | 194–214 / 240.964 | 8.3–8.4 | 16.6–24.8 | 41.8–91.8 | 16–31 | 0.746–0.807 (62/71/74) |
| room | Twist drag | 137–170 / 240.964 | 8.5–8.6 | 25.3–33.4 | 34.2–75.4 | 48–55 | 0.745–0.805 (137/161/170) |
| construction | Hero rotation | 188–216 / 240.964 | 8.4–8.4 | 16.7–17.6 | 41.6–49.1 | 16–34 | 0.603–0.701 (212/189/217) |
| construction | Shape change | 169–232 / 240.964 | 8.3–8.4 | 9.4–32.4 | 24–51 | 7–40 | 0.603–0.685 (169/211/232) |
| construction | Material change | 144–194 / 240.964 | 8.3–8.4 | 25–50 | 41.7–99.9 | 29–32 | 0.626–0.759 (167/194/144) |
| construction | Word cast | 150–206 / 240.964 | 8.4–8.7 | 16.7–32.5 | 58.8–83.1 | 24–43 | 0.617–0.662 (83/98/112) |
| construction | Twist drag | 148–167 / 240.964 | 8.4–8.8 | 25–33.3 | 49.8–75 | 44–55 | 0.681–0.706 (156/167/148) |
| cast | Hero rotation | 161–218 / 240.964 | 8.4–8.4 | 16.6–24.3 | 31.5–275.1 | 17–23 | 0.631–0.689 (208/219/162) |
| cast | Shape change | 186–235 / 240.964 | 8.3–8.3 | 9.3–24.1 | 23.5–149.9 | 4–22 | 0.655–0.73 (227/235/186) |
| cast | Material change | 159–202 / 240.964 | 8.3–8.4 | 16.8–33.3 | 50.9–116.6 | 23–33 | 0.753–0.771 (159/202/177) |
| cast | Word cast | 117–210 / 240.964 | 8.4–8.4 | 16.8–33.4 | 33.1–391.8 | 24–28 | 0.677–0.777 (151/148/112) |
| cast | Twist drag | 101–175 / 240.964 | 8.5–16.5 | 25–42.6 | 41.6–57.5 | 50–60 | 0.643–0.694 (175/137/101) |
| adaptive | Hero rotation | 221–234 / 240.964 | 8.3–8.3 | 9.3–9.4 | 17–42 | 4–9 | 0.597–0.657 (235/231/222) |
| adaptive | Shape change | 211–236 / 240.964 | 8.3–8.3 | 9.2–16.7 | 24.3–59.2 | 3–15 | 0.554–0.684 (216/211/236) |
| adaptive | Material change | 198–210 / 240.964 | 8.3–8.4 | 16.7–17.5 | 33.8–116.6 | 21–28 | 0.446–0.482 (210/198/205) |
| adaptive | Word cast | 197–229 / 240.964 | 8.3–8.3 | 9.4–24 | 33.2–50 | 9–27 | 0.619–0.676 (81/71/71) |
| adaptive | Twist drag | 168–199 / 240.964 | 8.4–8.4 | 17.1–33.3 | 50.2–75.3 | 27–37 | 0.533–0.55 (192/199/168) |
| direct,shadow,room,construction,cast,adaptive | Hero rotation | 211–232 / 240.964 | 8.3–8.3 | 9.4–16.7 | 25.1–74 | 6–13 | 1.543–1.722 (212/233/225) |
| direct,shadow,room,construction,cast,adaptive | Shape change | 205–221 / 240.964 | 8.3–8.4 | 9.5–17 | 33.4–50.9 | 11–24 | 1.328–1.393 (209/205/221) |
| direct,shadow,room,construction,cast,adaptive | Material change | 139–202 / 240.964 | 8.3–8.7 | 17.3–33.9 | 34–157.3 | 20–43 | 1.333–1.463 (195/202/139) |
| direct,shadow,room,construction,cast,adaptive | Word cast | 186–205 / 240.964 | 8.3–8.4 | 16.7–17.6 | 59–166.6 | 14–29 | 1.172–1.34 (143/137/125) |
| direct,shadow,room,construction,cast,adaptive | Twist drag | 117–205 / 240.964 | 8.3–9.2 | 17.3–50.2 | 33.4–125.7 | 28–52 | 1.323–1.36 (117/183/205) |

## Boundary intervals and raw data

- none: original idle estimate 120.482 Hz; terminal intervals 8.4 / 33.3 / 41.8 ms; overshoot 8.3 / 9.1 / 34.2 ms. Raw data: [form-perf-v1-1790943340211-q2vt73.json](form-perf-v1-1790943340211-q2vt73.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].
- direct: original idle estimate 60.976 Hz; terminal intervals 75.7 / 16.7 / 41.7 ms; overshoot 12.5 / 8.4 / 8.3 ms. Raw data: [form-perf-v1-1790943381901-u1qqsh.json](form-perf-v1-1790943381901-u1qqsh.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].
- shadow: original idle estimate 120.482 Hz; terminal intervals 16.6 / 25 / 7.9 ms; overshoot 16.5 / 8.3 / 7.5 ms. Raw data: [form-perf-v1-1790943417173-0rr7ur.json](form-perf-v1-1790943417173-0rr7ur.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].
- room: original idle estimate 120.482 Hz; terminal intervals 50.4 / 32.7 / 9 ms; overshoot 8.4 / 3.5 / 4.5 ms. Raw data: [form-perf-v1-1790943451617-qe5oyg.json](form-perf-v1-1790943451617-qe5oyg.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].
- construction: original idle estimate 119.048 Hz; terminal intervals 42.6 / 8.3 / 16.5 ms; overshoot 30 / 0.7 / 8.7 ms. Raw data: [form-perf-v1-1790943486393-ane3t1.json](form-perf-v1-1790943486393-ane3t1.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].
- cast: original idle estimate 120.482 Hz; terminal intervals 8.3 / 25.5 / 49.9 ms; overshoot 0.8 / 0.4 / 0.7 ms. Raw data: [form-perf-v1-1790943520672-fivu26.json](form-perf-v1-1790943520672-fivu26.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].
- adaptive: original idle estimate 120.482 Hz; terminal intervals 9.3 / 9.2 / 8.5 ms; overshoot 0 / 0.9 / 4.2 ms. Raw data: [form-perf-v1-1790943554975-j32s8w.json](form-perf-v1-1790943554975-j32s8w.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].
- direct,shadow,room,construction,cast,adaptive: original idle estimate 120.482 Hz; terminal intervals 17.6 / 17.5 / 16.7 ms; overshoot 0.8 / 0 / 8.3 ms. Raw data: [form-perf-v1-1790943589468-4d0jb0.json](form-perf-v1-1790943589468-4d0jb0.json). GPU cleanup: [{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0},{"disjoint":false,"unresolved":0}].

## Retained attempts outside the comparison

- [form-perf-v1-1790942252207-6akxmq.json](form-perf-v1-1790942252207-6akxmq.json): direct,shadow,room,construction,cast,adaptive, 1800 × 819, DPR 2; completed, outside the final source/viewport comparison set.
- [form-perf-v1-1790942305729-riub4r.json](form-perf-v1-1790942305729-riub4r.json): none, 1800 × 875, DPR 1; INVALID: tab became hidden..
- [form-perf-v1-1790942387951-ct83q5.json](form-perf-v1-1790942387951-ct83q5.json): direct, 1800 × 875, DPR 1; completed, outside the final source/viewport comparison set.
- [form-perf-v1-1790942436407-mtqgss.json](form-perf-v1-1790942436407-mtqgss.json): shadow, 1800 × 875, DPR 1; completed, outside the final source/viewport comparison set.
- [form-perf-v1-1790942509572-3tscs9.json](form-perf-v1-1790942509572-3tscs9.json): room, 1800 × 875, DPR 1; INVALID: tab became hidden..
- [form-perf-v1-1790942546707-r4o6q2.json](form-perf-v1-1790942546707-r4o6q2.json): construction, 1800 × 875, DPR 1; completed, outside the final source/viewport comparison set.
- [form-perf-v1-1790942606139-u15xs3.json](form-perf-v1-1790942606139-u15xs3.json): cast, 1800 × 875, DPR 1; INVALID: tab became hidden..
- [form-perf-v1-1790942667019-uoabq9.json](form-perf-v1-1790942667019-uoabq9.json): adaptive, 1800 × 875, DPR 1; completed, outside the final source/viewport comparison set.
- [form-perf-v1-1790942728252-9wi25z.json](form-perf-v1-1790942728252-9wi25z.json): direct,shadow,room,construction,cast,adaptive, 1800 × 875, DPR 1; completed, outside the final source/viewport comparison set.
- [form-perf-v1-1790942777674-2nkttk.json](form-perf-v1-1790942777674-2nkttk.json): none, 1800 × 875, DPR 1; completed, outside the final source/viewport comparison set.

## Other browser evidence

- [form-health-v1-1790943023354-hdi3be.json](form-health-v1-1790943023354-hdi3be.json): form-health-v1.
- [form-health-v1-1790943094101-gmccdu.json](form-health-v1-1790943094101-gmccdu.json): form-health-v1.
- [form-layout-v1-1790942955536-fd5uf2.json](form-layout-v1-1790942955536-fd5uf2.json): form-layout-v1.
- [form-layout-v1-1790942990961-4mtv4t.json](form-layout-v1-1790942990961-4mtv4t.json): form-layout-v1.
- [form-layout-v1-1790942992105-qz0e56.json](form-layout-v1-1790942992105-qz0e56.json): form-layout-v1.
- [form-layout-v1-1790942992966-j6r2b5.json](form-layout-v1-1790942992966-j6r2b5.json): form-layout-v1.
- [form-layout-v1-1790942994040-lzqd15.json](form-layout-v1-1790942994040-lzqd15.json): form-layout-v1.
- [form-layout-v1-1790943002645-4qrbg0.json](form-layout-v1-1790943002645-4qrbg0.json): form-layout-v1.
- [form-layout-v1-1790943004640-mntkqc.json](form-layout-v1-1790943004640-mntkqc.json): form-layout-v1.
- [form-layout-v1-1790943005559-a3sab7.json](form-layout-v1-1790943005559-a3sab7.json): form-layout-v1.
- [form-layout-v1-1790943006752-ordv13.json](form-layout-v1-1790943006752-ordv13.json): form-layout-v1.
- [form-layout-v1-1790943008092-jmfy4h.json](form-layout-v1-1790943008092-jmfy4h.json): form-layout-v1.
- [form-layout-v1-1790943008982-t3gp3k.json](form-layout-v1-1790943008982-t3gp3k.json): form-layout-v1.
- [form-layout-v1-1790943018289-4c3wuy.json](form-layout-v1-1790943018289-4c3wuy.json): form-layout-v1.
- [form-layout-v1-1790943019924-0bzkor.json](form-layout-v1-1790943019924-0bzkor.json): form-layout-v1.
- [form-layout-v1-1790943021043-sm3ba7.json](form-layout-v1-1790943021043-sm3ba7.json): form-layout-v1.
- [form-layout-v1-1790943022305-nuwbcm.json](form-layout-v1-1790943022305-nuwbcm.json): form-layout-v1.
- [form-pixels-v1-1790943102941-74as9n.json](form-pixels-v1-1790943102941-74as9n.json): form-pixels-v1.
- [form-pixels-v1-1790943125289-k1jinm.json](form-pixels-v1-1790943125289-k1jinm.json): form-pixels-v1.
- [form-ui-v1-observed.json](form-ui-v1-observed.json): form-ui-v1.

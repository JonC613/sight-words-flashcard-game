# Adventure Map Acceptance Evidence

## Automated verification

- [x] `npm run lint` passes with no warnings or suppressed rules (2026-07-23).
- [x] `npm test` passes: production build plus 17/17 Node tests (2026-07-23).
- [x] Catalog, legacy migration, corrupt-record repair, idempotency, reward accounting,
  duplicate completion, story unlock, world choice, placement suggestion, resident
  assignment, full-map continuation, and JSON round-trip contracts are covered.
- [x] Production HTML includes the Map entry and unplaced map-preview entry.

## Browser evidence

- [x] 768×1024 portrait: active map presents one named next destination, five labeled
  locations, 44 px or larger controls, and no page-level horizontal overflow.
- [x] 1024×768 landscape: split map layout renders without horizontal overflow.
- [x] 320×700 narrow: stacked map and trail remain 292 px wide inside a 320 px viewport;
  the smallest rendered button is 44 px tall.
- [x] Unplaced learner can leave Placement Quest for the map preview and return through
  “Find my starting trail.”
- [x] A fresh eight-clue placement opens the suggested world at Trailhead with one
  explicit next destination.
- [x] Map-to-mission takes one action.
- [x] Leaving an incomplete mission preserves 0/10 map progress.
- [x] Reload preserves completed placement and active world.
- [ ] Offline navigation and service-worker fallback manually verified.
- [ ] Forced local-storage read/write failure manually verified.
- [ ] Story dialog keyboard focus, Escape close, and reread manually verified after an
  even-step unlock.
- [ ] Reduced-motion behavior manually verified with the browser preference enabled.

## Release evidence still requiring people or specialized tooling

- [ ] With grown-up consent, at least five children complete the anonymous current/next
  location check; at least four identify both within 10 seconds.
- [ ] Twenty warm-cache Map navigations are measured under Chromium 768×1024 with 4× CPU
  throttling; Map presentation is under 1 second and control updates are under 100 ms.

## Safety and copy audit

- [x] No leaderboard, countdown, loss state, penalty, streak pressure, or shaming copy.
- [x] Stories are one or two short sentences and rewards are deterministic.
- [x] Locked, reached, next, current, complete, and halfway states do not depend on color.
- [x] Placement rechecks offer exactly “Stay here” and “Switch trails,” preserving all
  learning and map progress.
- [x] Storage errors use calm language and the app continues in memory.
- [x] Collection remains reachable from the map.

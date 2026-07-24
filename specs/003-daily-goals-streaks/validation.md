# Validation: Gentle Daily Goals and Streaks

## Automated

- `npm run lint`: passed with 0 errors and 0 warnings.
- `npm test`: production build passed; 40 tests passed, 0 failed.
- Coverage includes local date repair, same-day idempotency, consecutive and
  missed-day behavior, future clock dates, legacy saves, accepted completion,
  reward/map neutrality, and child-facing source contracts.

## Performance

A warm 1,000-sample selection-plus-recording benchmark used 3,650 practice dates
(ten years):

- p50: 0.27 ms
- p95: 0.50 ms
- max: 2.19 ms
- Result: passed the 5 ms plan goal.

## Desktop Browser

In-app browser at 1280×720:

- Home rendered the incomplete gentle goal and first practice-trail message.
- Document scroll width was 1265 px within the 1280 px viewport.
- Primary mission button measured 54 px high.
- No unintended horizontal overflow was observed.

## Tablet Browser

In-app responsive viewport validation:

- Portrait 768×1024: document scroll width 753 px; goal card left/right bounds
  65.5/687.5 px; no horizontal overflow.
- Landscape 1024×768: document scroll width 1009 px; goal card left/right bounds
  40/969 px; no horizontal overflow.
- Landscape grown-up summary left/right bounds 20/989 px and showed today's
  status, current streak, best streak, and practice days.
- The portrait check found and verified a fix for the new-learner empty state:
  “Your first practice trail starts today.”

## Accessibility and Engagement Safety

- Status uses visible text and does not depend on sound, animation, or color.
- Daily completion uses `role="status"`.
- Reduced-motion CSS explicitly disables daily celebration animation.
- Copy review found no broken-streak, expiration, repair, countdown, ranking, or
  escalating-target language.
- Child UI shows only today's goal and current trail; best and lifetime values
  remain in the grown-up area.

## Open Release Gates

- T026: manually exercise the full home → mission → finale → grown-up journey
  with sound off and an actual reduced-motion browser preference.
- T027: rotate a physical tablet during an in-progress mission and verify mission
  state, keyboard focus, and touch behavior persist.

## Release Classification

**Conditionally ready**: automated, performance, desktop, and responsive layout
checks passed. T026 and T027 remain environment-dependent manual gates and are
not marked complete.
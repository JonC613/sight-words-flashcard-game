# Quickstart: Gentle Daily Goals and Streaks

## Implementation Sequence

1. Add a pure daily-practice domain module with date normalization, selection,
   and recording operations.
2. Add focused tests for same-day, consecutive-day, missed-day, invalid-date,
   clock-change, legacy-save, and duplicate-event behavior.
3. Extend the existing mission completion path to record accepted completion
   dates without changing reward or map formulas.
4. Add child home/play goal and current-trail presentation.
5. Add first-completion acknowledgment to the mission finale.
6. Add full practice summary to the grown-up area.
7. Add responsive, reduced-motion, and non-color-only styling.
8. Run regression, production-build, and tablet validation gates.

## Automated Validation

```powershell
npm run lint
npm test
```

The test suite must cover:

- real local date-key generation and invalid-date repair;
- one count per local date;
- consecutive streak growth;
- quiet restart at one after missed days;
- best and lifetime preservation;
- legacy and malformed saves;
- duplicate mission completion idempotency;
- unchanged stars, rescues, sessions, map steps, learning, and review formulas;
- source contracts for child, finale, grown-up, and reduced-motion states.

## Manual Validation

Test with sound on and off and reduced motion enabled.

| Viewport | Journey |
|---|---|
| Desktop 1280×720 | Home → mission → daily finale → grown-up summary |
| Tablet portrait | Home status, mission controls, finale, grown-up cards |
| Tablet landscape | Same journey after rotation |

For each journey verify:

- no clipped primary content or unintended horizontal page scrolling;
- today's goal is identifiable within five seconds;
- after a missed-day fixture, return copy is welcoming and shows no loss;
- after one completion, the goal completes once;
- a second same-day mission does not repeat daily completion;
- keyboard focus remains visible;
- status is understandable without color or motion.

## Release Gate

Run `$wordling-release-check`, open a focused pull request, require the
Cloudflare workflow to pass, deploy from `master`, and smoke-test the production
URL separately from deployment success.

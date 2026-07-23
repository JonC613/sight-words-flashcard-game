# Quickstart: Mission Variety

## Prerequisites

- Node.js 22.13 or newer
- Repository dependencies installed with `npm ci`
- Feature branch `002-mission-variety`

No database, Cloudflare binding, account, secret, analytics service, or new
runtime dependency is required.

## Planned implementation sequence

1. Add pure eligibility, prompt, composition, and retry functions in
   `app/mission-variety.js`.
2. Add `tests/mission-variety.test.mjs` and `tests/mission-session.test.mjs` and
   include both in `npm test`.
3. Add the pure guarded answer and abandonment transitions in
   `app/mission-session.js`, then extend mission mode/card types and integrate both
   pure modules in `app/page.tsx`.
4. Render Missing Letter and Word Hunt prompts through the existing guarded answer
   and feedback path.
5. Add responsive, focus, disabled, and reduced-motion styles in
   `app/globals.css`.
6. Retain the initial rendered-worker smoke test and add source/CSS contract checks
   for mission-only controls.
7. Run automated and manual acceptance checks.

## Local development

```powershell
npm ci
npm run dev
```

Open the printed URL at a tablet viewport. A save with several entries in
`wordling-rescue-v1.progress` provides introduced Word Hunt distractors.

## Automated verification

```powershell
npm run lint
npm test
```

The Mission Variety unit tests must cover:

- Selected word identity and order remain unchanged.
- Due/new selection output is identical before activity assignment.
- Missing Letter accepts two-letter and apostrophe words.
- Missing Letter has one omitted position, three or four distinct choices, and
  exactly one correct answer.
- One-letter or otherwise invalid prompts fall back.
- Word Hunt uses only introduced catalog words and exactly one target.
- Insufficient introduced distractors fall back.
- Missions with four or more cards guarantee one new activity when eligible.
- Eligible missions use at least two modes and avoid three identical modes in a
  row.
- Injected randomness produces deterministic fixtures.
- Incorrect new activities append one different-mode retry within the existing
  12-card cap.
- Duplicate submissions record one outcome through the pure session transition.
- Existing star, interval, mastery, finale, rescue, and Adventure Map behaviors
  remain unchanged.

## Manual tablet and accessibility matrix

Test at minimum:

- 768×1024 portrait
- 1024×768 landscape
- 320 px narrow smoke viewport
- Touch input and keyboard-only input
- Sound disabled or speech synthesis unavailable
- `prefers-reduced-motion: reduce`
- Warm offline reload
- Local storage unavailable/full

Verify:

- Instructions and the target clue remain visible without audio.
- Every letter and word choice has a minimum 44×44 CSS-pixel target.
- Tab order is logical, focus is visible, and Enter/Space activate choices.
- Choice buttons disable after the first submission.
- Correct and incorrect states do not depend on color or animation.
- The full correct word appears after an error.
- The retry returns later with a different activity.
- No content clips or creates horizontal page overflow.
- Leaving early creates no mission completion, rescue, session, or map progress.

## Performance check

Using Node and a fixed activity fixture, compose 1,000 eight-card missions and
confirm p95 composition time is below 10 ms on the supported development runtime.
In a warm Chromium production build, confirm visible feedback appears within
100 ms of a choice activation in at least 19 of 20 runs, excluding optional
speech.

## Child usability check

With grown-up consent, observe at least five children using both activities on a
representative tablet. Record anonymous aggregate outcomes only. At least four of
five should begin each activity without adult explanation, and at least four of
five should report the varied mission as equally comfortable or more interesting.
No child should report pressure from time or loss mechanics.

## Requirement trace checkpoints

- **P1 / FR-001–011**: prompt generation, response handling, retries, learning and
  reward preservation.
- **P2 / FR-002–007, FR-012–013**: post-selection composition, eligibility,
  guaranteed novelty, and bounded repetition.
- **P3 / FR-011, FR-014–018**: duplicate protection, accessible interaction,
  abandonment, save compatibility, and offline fallback.

## Release gate

The existing GitHub Actions workflow runs installation and tests for pull
requests. After review and merge to `master`, the established Cloudflare workflow
deploys the same client-only build. Verify both activities, an old save, and an
offline mission in production after deployment.

# Contract: Daily Practice UI

## Child Home/Play Journey

Before mission start, show:

- an incomplete state: one mission completes today's goal;
- a completed state: today's goal is complete and more practice is optional;
- a current practice-trail count when the active run is today or yesterday;
- a welcoming new-trail message after a longer gap instead of a zero-loss alert.

Do not show best streak, lifetime totals, countdowns, warnings, repairs, rankings,
or escalating targets in the child journey.

## Mission Finale

On the first accepted completion for a local date:

- show one brief supportive daily-goal acknowledgement;
- keep the existing mission reward and rescue summary unchanged;
- convey completion with text, not animation or color alone;
- respect reduced-motion preferences.

Later missions on the same date do not repeat the daily achievement.

## Grown-Up Area

Show plain-language values for:

- today's goal status;
- current practice streak;
- best practice streak;
- lifetime practice days.

Do not compare learners or describe a missed day as loss or failure.

## Responsive and Accessible Behavior

- Primary status and mission controls remain reachable at representative tablet
  portrait and landscape viewports.
- No unintended horizontal page scrolling.
- New interactive controls, if any, are at least 44×44 CSS pixels.
- Status remains understandable without sound, motion, or color.
- Keyboard focus remains visible.

# Research: Gentle Daily Goals and Streaks

## Decision 1: Store unique local practice dates

**Decision**: Add an optional, sorted list of unique `YYYY-MM-DD` local calendar
date keys to the existing device-local save. Derive today's state, current
streak, best streak, and lifetime practice days from that list.

**Rationale**: The list is the smallest source of truth that can repair
duplicates, tolerate missed days, recompute summaries after upgrades, and avoid
destructive migration. Even ten years of one date per day remains small for
browser storage.

**Alternatives considered**:

- Store only counters and the last date: smaller, but harder to repair after
  malformed state or clock changes and cannot independently verify best streak.
- Store mission timestamps: unnecessary precision, more data, and greater
  privacy surface.
- Use a server clock: violates offline and device-local constraints.

## Decision 2: Use local calendar completion date

**Decision**: Generate a date key from local year, month, and day at successful
mission completion. Compare date keys through calendar ordinals rather than
elapsed milliseconds.

**Rationale**: A daily goal should match the child's visible calendar day.
Calendar ordinals avoid daylight-saving days that are not exactly 24 hours.

**Alternatives considered**:

- UTC dates: can switch the visible day during afternoon or evening.
- Millisecond gaps: incorrectly treats daylight-saving transitions.

## Decision 3: Integrate with duplicate-safe mission completion

**Decision**: Record a practice day only in the existing successful
`completeMission` path after its completion-ID guard accepts the event.

**Rationale**: Placement, abandoned missions, and duplicate submissions already
have clear boundaries there. Keeping the update atomic preserves reward and map
idempotency.

**Alternatives considered**:

- Record on mission start: rewards abandonment and passive entry.
- Record after every answered card: makes partial missions count and increases
  writes.
- Add a separate UI-only counter: risks disagreement with saved mission state.

## Decision 4: Recognition without a second economy

**Decision**: Show a brief, reduced-motion-safe daily completion message on the
mission finale. Do not add stars, currency, unlocks, streak freezes, or repairs.

**Rationale**: Immediate acknowledgment supports engagement while the completed
mission remains the learning action being rewarded. It avoids pressure and does
not alter established reward formulas.

**Alternatives considered**:

- Bonus stars: changes the economy and may encourage unnecessary repetition.
- Unlocks tied to uninterrupted streaks: turns missed days into lost access.
- No acknowledgment: makes the daily goal feel disconnected from completion.

## Decision 5: Split child and grown-up detail

**Decision**: The child home/play journey shows today's goal and a friendly
current "practice trail." The grown-up area also shows best streak and lifetime
practice days.

**Rationale**: The child gets a short visible target without a wall of historical
metrics. Grown-ups retain context for encouragement.

**Alternatives considered**:

- All metrics in both views: adds numerical pressure to the child journey.
- All metrics grown-up-only: weakens the visible daily finish line.

## Decision 6: Repair optional save data

**Decision**: Normalize the optional date list by accepting only real date keys,
deduplicating, and sorting. Missing or malformed values become an empty list
without changing other save fields.

**Rationale**: This preserves `wordling-rescue-v1` compatibility and ensures
practice remains available if the new field is damaged.

**Alternatives considered**:

- Reject the whole save: violates safe fallback.
- Require an eager migration: creates unnecessary versioning complexity for one
  optional field.

# Contract: Daily Practice State

## Pure Domain Operations

### `localDateKey(timestamp)`

- Accepts a finite timestamp.
- Returns the device-local calendar date as `YYYY-MM-DD`.
- Uses a safe current-time fallback for invalid timestamps.

### `normalizePracticeDays(value)`

- Accepts unknown input.
- Returns ascending, unique, real `YYYY-MM-DD` date keys.
- Never throws for malformed input.

### `selectDailyPractice(save, timestamp)`

- Reads optional `save.practiceDays`.
- Returns `todayKey`, `goalComplete`, `currentStreak`, `bestStreak`,
  `lifetimePracticeDays`, and `returning`.
- Does not mutate the save or supplied arrays.

### `recordPracticeDay(save, timestamp)`

- Adds the local completion date exactly once.
- Preserves every unrelated save field.
- Returns whether the date was newly recorded so the UI can acknowledge only
  the first daily completion.

## Mission Completion Contract

- `completeMission(save, event)` records practice only when it accepts a valid,
  non-duplicate mission completion ID.
- Placement completion, story viewing, mission abandonment, and answer events
  cannot record a practice day.
- Daily practice metadata cannot change mission stars, rescue count, session
  count, map steps, learning progress, or review scheduling.

## Compatibility Contract

- Existing saves without `practiceDays` behave as empty history.
- Invalid `practiceDays` cannot block loading or mission play.
- Persistence remains under the existing `wordling-rescue-v1` device-local key.

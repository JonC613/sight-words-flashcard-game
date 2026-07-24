# Data Model: Gentle Daily Goals and Streaks

## Practice Day

A unique local calendar date on which a mission was successfully completed.

| Field | Type | Rules |
|---|---|---|
| dateKey | string | Real local calendar date formatted `YYYY-MM-DD` |

Identity is the date key. One date can occur at most once.

## Persisted Practice History

Optional state attached to the existing device-local save.

| Field | Type | Rules |
|---|---|---|
| practiceDays | string[] | Optional; valid unique date keys in ascending order |

Missing, non-array, invalid, duplicate, or unsorted input is normalized without
changing unrelated save state.

## Derived Practice Status

Calculated for a supplied local date and never persisted as a second source of
truth.

| Field | Type | Meaning |
|---|---|---|
| todayKey | string | Current local calendar date |
| goalComplete | boolean | `todayKey` exists in practice days |
| currentStreak | number | Consecutive practice days ending today or yesterday; zero after a longer gap until the next completion |
| bestStreak | number | Greatest consecutive run across all practice days |
| lifetimePracticeDays | number | Number of unique valid practice days |
| returning | boolean | At least one historical day exists and the most recent day is earlier than yesterday |

## Mission Completion Extension

The existing mission completion event already supplies:

| Field | Type | Rules |
|---|---|---|
| id | string | Stable event identity used for duplicate protection |
| completedAt | number | Completion timestamp used to derive the local date |

The practice date is recorded only after the existing event-ID guard accepts the
completion. A duplicate event produces no new practice history, reward, rescue,
session, or map step.

## State Transitions

```text
No history
  └─ successful mission today → today complete, current 1, best 1, lifetime 1

Most recent practice today
  └─ another successful mission → unchanged daily and streak state

Most recent practice yesterday
  └─ successful mission today → current +1, best=max(best,current), lifetime +1

Most recent practice before yesterday
  ├─ view before completion → welcoming return, current 0
  └─ successful mission today → current 1, best preserved, lifetime +1

Duplicate or abandoned mission
  └─ no state transition
```

## Validation and Repair

- Reject impossible dates such as `2026-02-30`.
- Calendar ordering uses date components, not elapsed local milliseconds.
- A future recorded date is preserved but does not make today's goal complete.
- Clock or time-zone changes never remove stored dates.
- The reset-progress action continues to reset the entire save by explicit
  grown-up confirmation, including practice history.

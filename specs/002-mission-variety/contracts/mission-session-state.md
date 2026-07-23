# Contract: Mission Session State

`app/mission-session.js` owns the pure learning-outcome boundary used by
`app/page.tsx` and `tests/mission-session.test.mjs`. It performs no DOM, storage,
speech, network, or clock access; callers supply the current time and activity
context.

## `applyMissionAnswer`

```js
applyMissionAnswer({
  save,
  card,
  cards,
  ok,
  now,
  alreadyAnswered,
  context,
}) => {
  accepted: boolean;
  save: Save;
  retryCard: ActivityCard | null;
}
```

Guarantees:

- Returns `accepted: false`, the original save, and no retry when
  `alreadyAnswered` is true or the card is absent.
- For one accepted answer, updates stars, stage, due time, attempts, correct
  count, distinct mode history, and mastery exactly once using the existing
  formulas.
- Keeps the existing stage bounds, review intervals, correct/incorrect star
  amounts, and mastery threshold of three distinct activity modes.
- Counts `missing-letter` and `word-hunt` as distinct modes toward that unchanged
  three-mode threshold.
- Requests at most one appended retry through `createRetryCard`.
- Does not mutate its inputs or apply mission-completion rewards.

## `abandonMission`

```js
abandonMission(session) => {
  cards: [];
  answers: [];
  feedback: null;
  completion: null;
}
```

Guarantees:

- Clears transient mission state only.
- Does not mutate the supplied save.
- Does not increment sessions, append rescues, add a completion bonus, or advance
  Adventure Map progress.

## Completion boundary

`applyMissionAnswer` never finalizes a mission. After the final accepted answer,
the existing guarded finale action remains the only caller of `completeMission`.
The existing stable mission ID and finalizing guard continue to provide
exactly-once completion behavior.

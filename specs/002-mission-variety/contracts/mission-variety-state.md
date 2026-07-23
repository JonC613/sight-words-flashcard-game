# Contract: Mission Variety State Module

`app/mission-variety.js` is a pure module imported by `app/page.tsx` and Node
tests. It performs no DOM, storage, speech, network, reward, or clock access.

## `createMissingLetterPrompt`

```js
createMissingLetterPrompt(word, random) => MissingLetterPrompt | null
```

Guarantees:

- Returns `null` for words with fewer than two alphabetic characters or when a
  valid prompt cannot be formed.
- Omits exactly one alphabetic position and preserves punctuation.
- Returns three or four distinct lowercase letter choices containing the answer
  exactly once.
- Uses only the injected random source for position and choice order.

## `createWordHuntPrompt`

```js
createWordHuntPrompt(target, progress, catalog, random) => WordHuntPrompt | null
```

Guarantees:

- Uses only catalog distractors with an existing `progress` entry.
- Excludes the target and duplicate normalized words.
- Prefers same-grade distractors.
- Returns two to four total choices with the target exactly once.
- Returns `null` rather than using an unseen or invalid distractor.

## `eligibleActivities`

```js
eligibleActivities(word, context) => ActivityMode[]
```

Guarantees:

- Always includes the suitable existing activities.
- Includes a new activity only when its complete prompt can be produced.
- Does not mutate progress, catalog, or random state outside explicit prompt
  generation.

## `composeMissionActivities`

```js
composeMissionActivities(selectedCards, context) => ActivityCard[]
```

Guarantees:

- Returns the same number, word identities, word order, and retry flags.
- Assigns activities only after receiving the selected sequence.
- Includes at least one new activity for a mission of four or more cards when any
  selected word is eligible.
- Uses at least two activity types for an eligible mission of four or more cards.
- Avoids three consecutive identical modes when another eligible mode exists.
- Attaches valid prompt data for each new activity.
- Does not mutate its inputs or any learning/reward state.
- Produces reproducible output with a reproducible random function.

## `createRetryCard`

```js
createRetryCard(card, cards, context) => ActivityCard | null
```

Guarantees:

- Returns `null` when the card is already a retry or the existing 12-card cap is
  reached.
- Preserves the target word and sets `retry: true`.
- For a missed new activity, excludes its mode when another eligible activity is
  available.
- Falls back to `read` when no other generated activity is suitable.
- Does not insert immediately; the caller appends the returned card.

## Outcome boundary

This module never applies an answer. Every rendered activity passes its card and
answer to the pure mission-session boundary defined in
[mission-session-state.md](./mission-session-state.md). Activity choice does not
alter star amounts, stage bounds, review intervals, the three-distinct-mode
mastery threshold, mission completion, rescue creation, session count, or
Adventure Map progression.

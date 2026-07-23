# Data Model: Mission Variety

## Overview

Mission Variety extends the existing transient mission-card shape and the
forward-compatible `Progress.modes` string array. It does not add a storage key,
remote entity, or save migration. Word scheduling remains authoritative and runs
before activity composition.

## ActivityMode

```ts
type ActivityMode =
  | "read"
  | "choice"
  | "spell"
  | "missing-letter"
  | "word-hunt";
```

The first three values retain their existing behavior. Missing Letter and Word
Hunt each count as one distinct practice mode toward the existing
`modes.length >= 3` mastery rule; the numeric threshold remains unchanged.

## Existing persisted entities

### Progress (compatible extension)

```ts
type Progress = {
  stage: number;
  due: number;
  attempts: number;
  correct: number;
  modes: ActivityMode[];
  mastered: boolean;
};
```

Validation and compatibility:

- Old arrays containing only `read`, `choice`, and `spell` remain valid.
- New activity values require no migration because modes are serialized strings.
- Unknown malformed values should not block loading; existing save normalization
  behavior remains authoritative.
- Stage bounds, due-date intervals, attempt counts, correct counts, and mastery
  threshold remain unchanged.

### Save (unchanged shape)

```ts
type Save = {
  name: string;
  stars: number;
  sessions: number;
  sound: boolean;
  progress: Record<string, Progress>;
  placement?: Placement;
  rescues?: Rescue[];
  adventureMap?: unknown;
};
```

A catalog word is **introduced** when `progress[word]` exists. Only introduced
words may become Word Hunt distractors.

## Transient entities

### SelectedCard

```ts
type SelectedCard = {
  word: SightWord;
  retry?: boolean;
};
```

This is the ordered output of existing due/new-word scheduling. Activity
composition MUST preserve its length, word identities, order, and retry flag.

### ActivityCard

```ts
type ActivityCard = {
  word: SightWord;
  mode: ActivityMode;
  retry?: boolean;
  prompt?: MissingLetterPrompt | WordHuntPrompt;
};
```

Invariants:

- Exactly one selected word is associated with each card.
- Existing modes require no prompt object.
- A new mode is present only with a valid matching prompt.
- Prompt data is held in React mission state and is not persisted.

### MissingLetterPrompt

```ts
type MissingLetterPrompt = {
  kind: "missing-letter";
  displayParts: [string, string];
  missingIndex: number;
  choices: string[];
  answer: string;
};
```

Rules:

- The target has at least two alphabetic characters.
- `missingIndex` identifies exactly one alphabetic character in the original word.
- Joining `displayParts` around `answer` reconstructs the target.
- `choices.length` is three or four; normalized values are distinct.
- `choices` contains `answer` exactly once.
- Punctuation not at the omitted position remains visible.

### WordHuntPrompt

```ts
type WordHuntPrompt = {
  kind: "word-hunt";
  target: string;
  choices: string[];
};
```

Rules:

- `choices.length` is two through four.
- Choices are distinct catalog words.
- `target` appears exactly once.
- Every distractor differs from the target and has an existing progress record.
- Same-grade distractors are preferred but not required.

### CompositionContext

```ts
type CompositionContext = {
  progress: Save["progress"];
  allWords: SightWord[];
  random: () => number;
};
```

The caller provides catalog, learning state, and randomness. No composition
function reads the clock, storage, DOM, speech, or network.

## State transitions

| Event | Preconditions | Transition | Invariants |
|---|---|---|---|
| Mission words selected | Existing scheduler completes | Compose activities over the ordered cards | Words and order unchanged |
| Missing Letter composed | Target has 2+ letters and valid choices | Attach prompt and mode | One missing position and answer |
| Word Hunt composed | At least one introduced distractor exists | Attach prompt and mode | One target; no unseen distractors |
| New activity ineligible | Prompt cannot satisfy constraints | Choose another eligible existing activity | No low-quality prompt |
| Incorrect new activity | No prior retry and card count below 12 | Append same word with another eligible mode | Retry timing/cap unchanged |
| Answer submitted | Card active and feedback absent | Apply pure mission-session answer transition once | One outcome and reward |
| Duplicate submission | Feedback already present | Pure session transition rejects input | No duplicate outcome |
| Mission abandoned | Mission incomplete | Apply pure abandonment transition and discard transient cards/prompts | Save unchanged; no completion reward or map step |
| Mission completed | All cards resolved | Use existing finale transition | One bonus, rescue, session, map step |

## Composition invariants

- Activity assignment occurs only after word selection.
- A mission of at least four cards contains a new activity when at least one card
  is eligible.
- At least two activity types appear in eligible missions of at least four cards.
- No activity occurs three times consecutively when another eligible activity
  exists.
- A retry for a missed new activity excludes the missed activity when a different
  eligible activity exists.
- Randomness affects only valid prompt/activity choices, never the selected words,
  learning outcomes, reward size, or review dates.

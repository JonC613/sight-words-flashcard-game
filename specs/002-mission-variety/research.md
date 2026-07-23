# Research: Mission Variety

## Decision 1: Separate word selection from activity assignment

**Decision**: Preserve the current due/new-word selection and ordered card sequence,
then pass that sequence to a pure activity composer. The composer may change only
the activity and its prompt data.

**Rationale**: This makes SC-004 directly testable and prevents presentation
novelty from changing spaced repetition, new-word limits, or review priority.

**Alternatives considered**:

- Replace `makeMission` with one combined scheduler: rejected because activity
  rules could accidentally affect learning order.
- Select words per activity: rejected because eligibility would bias the schedule.

## Decision 2: Use a pure JavaScript rules module

**Decision**: Add `app/mission-variety.js` with `// @ts-check` for eligibility,
prompt generation, balanced composition, and retry selection. Add
`app/mission-session.js` as the pure answer/abandonment transition used by React.
Accept injected randomness and time for reproducible tests.

**Rationale**: The repository already tests pure JavaScript modules with
`node:test`. This adds no framework or runtime dependency and keeps `page.tsx`
focused on React state and rendering.

**Alternatives considered**:

- Put all rules in `page.tsx`: rejected because UI coupling would make scheduler
  invariants and boundary cases harder to test.
- Add a browser test framework: deferred because pure activity/session rules,
  source/CSS contract checks, the existing initial-response smoke test, and a
  focused manual browser matrix cover the highest-risk behavior.

## Decision 3: Represent five activity types in the existing mode history

**Decision**: Extend the current mode vocabulary from `read | choice | spell` to
also include `missing-letter | word-hunt`. Continue recording distinct modes in
`Progress.modes`; retain the existing stage and three-mode mastery thresholds.

**Rationale**: The new activities are genuine retrieval modes. The existing array
is forward-compatible JSON, and old saves require no migration.

**Alternatives considered**:

- Store separate activity analytics: rejected because analytics and new persisted
  records are unnecessary.
- Map both activities to `choice`: rejected because it loses the evidence that a
  learner practiced different recall modes.

## Decision 4: Generate Missing Letter prompts from letter positions

**Decision**: Eligible targets contain at least two alphabetic characters. Omit
one alphabetic position, retain punctuation such as apostrophes, and present
exactly four distinct lowercase letter buttons including exactly one correct
letter. Injected randomness selects the position and shuffles choices.

**Rationale**: A visible position makes repeated-letter words unambiguous, keeps
two-letter words supported, and produces a bounded tablet interaction.

**Alternatives considered**:

- Free typing: rejected by clarification.
- Hide every occurrence of the chosen letter: rejected because repeated letters
  could create multiple missing positions.

## Decision 5: Restrict Word Hunt distractors to introduced words

**Decision**: A word is introduced when it has an entry in `Save.progress`.
Choose introduced catalog words other than the target, preferring the target
grade before other grades. Normalize choices to lowercase alphabetic characters
and require pairwise Damerau-Levenshtein distance of at least two. Produce two to
four total written choices with exactly one target; fall back when fewer than one
suitable distractor exists.

**Rationale**: This prevents unseen words from confusing the learner while using
familiar alternatives to make recognition meaningful.

**Alternatives considered**:

- Any same-grade catalog word: rejected by clarification because it can expose
  unseen words.
- Synthetic nonwords: rejected because Word Hunt requires valid sight words.

## Decision 6: Use constrained greedy activity composition

**Decision**: For each selected card in order, compute eligible activities,
exclude an activity that would create a third consecutive occurrence when an
alternative exists, and choose from the least-used eligible activities. For
missions of at least four cards, reserve the first eligible position needed to
guarantee at least one new activity.

**Rationale**: A small greedy pass satisfies bounded novelty without changing the
word sequence or needing a complex optimizer.

**Alternatives considered**:

- Independent random choice: rejected because it cannot reliably guarantee
  variety or prevent long runs.
- Fixed five-mode cycle: rejected because per-word eligibility and fallback can
  make a fixed cycle invalid.

## Decision 7: Retry later through a different activity

**Decision**: Preserve the existing one-retry, append-to-end behavior and
12-card cap. When a new activity is missed, select another eligible activity while
excluding the missed one; prefer the least-used option and fall back to `read`.

**Rationale**: The timing and cap stay unchanged while the learner receives a
fresh retrieval cue instead of the same frustrating interaction.

**Alternatives considered**:

- Immediate retry: rejected because it changes current retry timing.
- Repeat the same activity: rejected by clarification.

## Decision 8: Keep feedback and rewards on the existing answer path

**Decision**: Extract the existing guarded learning update into
`app/mission-session.js`. All activities call that pure boundary, which rejects an
already-answered card and preserves per-answer stars, stages, due dates, attempts,
mission summary, completion bonus, rescue, and Adventure Map behavior.

**Rationale**: One outcome boundary preserves duplicate-submission protection and
prevents activity-specific reward drift.

**Alternatives considered**:

- Activity-specific scoring: rejected because novelty must not change rewards.
- Separate answer handlers with duplicated learning updates: rejected because
  they invite inconsistent outcomes.

## Decision 9: Use semantic buttons and existing accessibility patterns

**Decision**: Render both prompts with visible instructions, native buttons,
disabled states after submission, visible focus, non-color feedback, and at least
44×44 CSS-pixel targets. Sound may repeat a word but never supplies the only clue.
Reduced motion changes presentation only.

**Rationale**: This matches the current tablet-first UI and constitution without a
new component library.

**Alternatives considered**:

- Drag-and-drop letters: rejected because it adds precision and keyboard burdens.
- Audio-only Word Hunt: rejected because sound must be optional.

## Decision 10: Keep persistence and deployment unchanged

**Decision**: Store only the extended string values already supported by
`Progress.modes`. Mission cards and generated choices remain transient. Use the
existing vinext build, service worker, GitHub Actions, and Cloudflare deployment.

**Rationale**: The feature is client-only, old mode strings remain valid, and no
binding, secret, database, or save-version change is needed.

**Alternatives considered**:

- Persist in-progress mission composition: rejected because current abandoned
  missions are intentionally not resumed.
- Add server analytics: rejected by the privacy constitution.

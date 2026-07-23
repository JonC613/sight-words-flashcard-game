# Feature Specification: Mission Variety

**Feature Branch**: `002-mission-variety`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Add two rotating, ADHD-friendly sight-word mission activities that preserve spaced repetition, mastery scoring, and pressure-free play."

## Clarifications

### Session 2026-07-23

- Q: How should the learner supply the missing letter? → A: Choose the missing letter from 3–4 options; this feature standardizes on four.
- Q: How often must a new activity appear in a mission? → A: Include at least one new activity whenever eligible.
- Q: How should a word answered incorrectly in a new activity be retried? → A: Retry later using a different eligible activity.
- Q: What is the minimum word length for Missing Letter? → A: Allow words with two or more letters.
- Q: Which words may be used as Word Hunt distractors? → A: Use only previously introduced sight words.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Practice Through Varied Activities (Priority: P1)

A child completing a sight-word mission encounters two additional activity types:
Missing Letter, where the child completes a partially shown sight word, and Word
Hunt, where the child finds the target word among a small set of distractors. The
activities change how a word is presented without changing which words are due.

**Why this priority**: Short, meaningful changes in interaction reduce repetition
fatigue while preserving the recall practice that drives learning.

**Independent Test**: Complete a mission containing the two new activities and
verify that each activity presents one due or new word, accepts an answer, gives
supportive feedback, and advances through the existing mission.

**Acceptance Scenarios**:

1. **Given** a learner has words selected for a mission, **When** the mission is
   composed, **Then** eligible words may be presented as Missing Letter or Word
   Hunt activities without changing the selected word set.
2. **Given** a Missing Letter activity with four letter choices, **When**
   the learner selects the missing letter correctly, **Then** the answer is
   recorded as correct and the full word is reinforced.
3. **Given** a Word Hunt activity, **When** the learner selects the target word,
   **Then** the answer is recorded as correct and the learner receives immediate
   supportive feedback.
4. **Given** an incorrect response in either activity, **When** feedback appears,
   **Then** the full correct word is shown and the word returns later, within the
   existing retry limit, using a different eligible activity without a penalty,
   countdown, or loss state.

---

### User Story 2 - Receive Balanced Mission Rotation (Priority: P2)

A child receives a balanced mix of activity types so a mission feels varied but
predictable. No activity dominates the mission, and a learner is not asked to use
an activity that is unsuitable for the selected word.

**Why this priority**: Bounded novelty supports attention without making the
learning experience chaotic or obscuring the word being practiced.

**Independent Test**: Generate missions from representative word sets and verify
that activities are eligible for their words, consecutive repetition is limited,
and the same selected words and review priorities are retained.

**Acceptance Scenarios**:

1. **Given** at least four mission cards with a word eligible for a new activity,
   **When** activities are assigned, **Then** the mission includes at least one
   Missing Letter or Word Hunt card and more than one activity type.
2. **Given** sufficient eligible alternatives, **When** activities are assigned,
   **Then** the same activity type does not appear more than twice consecutively.
3. **Given** a word that cannot produce an unambiguous new activity, **When** its
   card is prepared, **Then** it uses an existing suitable activity instead.
4. **Given** the same learning state before and after this feature, **When** words
   are selected for a mission, **Then** due-word priority and new-word limits are
   unchanged.

---

### User Story 3 - Resume Calmly After Interruption (Priority: P3)

A child can leave or resume a mission containing new activities with the same
forgiving behavior as existing practice. Sound-off, reduced-motion, keyboard, and
touch use remain fully supported.

**Why this priority**: Reliable re-entry and accessible alternatives prevent
novelty from becoming frustration.

**Independent Test**: Use both activities with sound disabled, keyboard-only
input, reduced motion, and an interrupted mission; verify that instructions,
answers, and feedback remain understandable and no extra rewards are granted.

**Acceptance Scenarios**:

1. **Given** sound is disabled or unavailable, **When** either activity appears,
   **Then** all instructions and target information needed to answer are visible.
2. **Given** reduced motion is enabled, **When** feedback appears, **Then** the
   result remains clear without relying on animation.
3. **Given** a learner leaves before completing a mission, **When** the mission is
   abandoned, **Then** no session, rescue, completion bonus, or map step is added.
4. **Given** a learner uses keyboard or touch input, **When** either activity is
   completed, **Then** every required control is operable and visibly focused.

---

### Edge Cases

- Words with repeated letters must identify a single, unambiguous missing position
  or fall back to another activity.
- One-letter words are ineligible for Missing Letter. Words with two or more
  letters remain eligible only when the prompt has exactly one valid answer.
- Distractor words in Word Hunt must be previously introduced valid sight words.
  After lowercase alphabetic normalization, every pair of choices must be unique
  and have a Damerau-Levenshtein edit distance of at least two.
- When too few suitable previously introduced distractors exist, the activity must
  use another existing activity rather than use unseen words or lower answer
  quality.
- Retry cards must use a different eligible activity when one is available, fall
  back to a suitable existing activity otherwise, and must not create an endless
  loop or cause the mission to exceed its existing maximum card count.
- Repeated taps or submissions must record only one answer for the current card.
- Reloading, storage failure, or offline use must not reinterpret prior learning
  history or award completion rewards early.

### Learning and Engagement Safety *(mandatory for child-facing changes)*

- **Learning rationale**: Missing Letter strengthens orthographic recall by
  requiring attention to letter structure. Word Hunt strengthens rapid visual
  recognition without measuring or rewarding speed. Both operate only on words
  already selected by the established review schedule.
- **ADHD-friendly engagement**: Activities use short instructions, one goal per
  screen, immediate feedback, bounded choice sets, limited consecutive repetition,
  and forgiving continuation after mistakes.
- **Safety boundaries**: The feature adds no timer, leaderboard, streak pressure,
  random high-value reward, penalty, lives, failure screen, or shaming language.
  Novelty changes presentation only and never changes reward size.
- **Accessibility and fallback**: Every activity supports tablet touch targets,
  keyboard operation, visible focus, non-audio instructions, non-color answer
  states, reduced motion, and an existing-activity fallback when a prompt cannot
  be formed safely.
- **Privacy and save compatibility**: No personal information or new remote data is
  collected. Existing learning, placement, rescue, and map records remain valid.
  Activity history may extend a word's locally stored practice-mode record without
  changing prior results.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST offer Missing Letter and Word Hunt as two additional
  sight-word activity types.
- **FR-002**: The system MUST assign activities only after the established learning
  process has selected the mission's words.
- **FR-003**: Activity assignment MUST NOT change due-word order, new-word limits,
  placement results, the mastery threshold of three distinct activity modes, or
  review timing. Missing Letter and Word Hunt each count as a distinct activity
  mode toward that unchanged threshold.
- **FR-004**: Missing Letter MUST show enough of the target word to identify one
  omitted letter position and MUST present exactly four selectable letter choices
  containing exactly one correct completion.
- **FR-005**: Missing Letter MUST accept words with two or more letters when a
  clear prompt with exactly one valid answer can be created. One-letter words and
  any word lacking such a prompt MUST fall back to an existing activity.
- **FR-006**: Word Hunt MUST present one target sight word and a bounded set of two
  to four distinct written choices containing exactly one correct answer.
- **FR-007**: Word Hunt distractors MUST be valid sight words already introduced
  to the learner. After converting each choice to lowercase and removing
  non-alphabetic characters, every pair MUST be unique and have a
  Damerau-Levenshtein edit distance of at least two. Unseen words MUST NOT be used
  as distractors.
- **FR-008**: Each new activity MUST record correct and incorrect responses through
  the same learning outcome used by existing mission activities.
- **FR-009**: Correct responses MUST preserve the existing per-answer reward.
  Incorrect responses MUST show the full correct word and preserve the existing
  retry timing and limit; the retry MUST use a different eligible activity, or a
  suitable existing-activity fallback when no different activity is eligible.
- **FR-010**: A completed mission MUST retain the existing single completion bonus,
  rescue, session increment, and Adventure Map step behavior regardless of its
  activity mix.
- **FR-011**: The system MUST prevent duplicate input from recording more than one
  outcome for the current card.
- **FR-012**: When eligible alternatives exist, the system MUST prevent any one
  activity type from appearing more than twice consecutively.
- **FR-013**: A mission with at least four cards MUST use at least two activity
  types and MUST include at least one Missing Letter or Word Hunt card when at
  least one selected word is eligible for a new activity.
- **FR-014**: New activity instructions and feedback MUST remain understandable
  with sound disabled and without animation.
- **FR-015**: All required controls MUST support keyboard and touch operation,
  visible focus, and a minimum touch target consistent with the existing game.
- **FR-016**: Leaving an incomplete mission MUST add no completion reward, rescue,
  session, or map progress.
- **FR-017**: Existing saves MUST load without losing or reinterpreting learning,
  placement, rescue, sound, star, session, or Adventure Map data.
- **FR-018**: The feature MUST function during the same offline conditions
  supported by existing missions and MUST fail safely when local saving is
  unavailable.

### Key Entities

- **Activity Type**: A named way to present and answer one selected sight word,
  including its eligibility rules, visible instructions, response form, and
  accessibility fallback.
- **Activity Card**: One mission opportunity pairing a selected sight word with an
  eligible activity type, answer choices or missing position, retry status, and a
  single recorded outcome.
- **Mission Composition**: The ordered set of selected words and assigned activity
  types, constrained by variety, eligibility, and the existing mission-size limit.
- **Practice Outcome**: The correct or incorrect result applied once to the
  learner's existing local word progress and reward flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a representative set of at least 100 generated missions containing
  four or more cards, every mission with at least one word eligible for a new
  activity includes a Missing Letter or Word Hunt card, and 95% or more include
  at least two activity types.
- **SC-002**: In those missions, no activity appears more than twice consecutively
  when another eligible activity is available.
- **SC-003**: Across boundary and duplicate-input tests, every displayed card
  records exactly one learning outcome and every completed mission records exactly
  one completion reward.
- **SC-004**: For identical learner states, the words selected and their review
  priority are identical with Mission Variety enabled or unavailable.
- **SC-005**: At least four of five children can begin each new activity after
  reading or hearing its first instruction without adult explanation.
- **SC-006**: At least four of five children report that the varied mission feels
  more interesting or equally comfortable than the current mission, with no child
  reporting pressure from time or loss mechanics.
- **SC-007**: Learners can complete both new activities using touch and
  keyboard-only input at supported tablet and desktop sizes without horizontal
  page overflow.
- **SC-008**: Existing saves covering fresh, active-learning, placed, migrated-map,
  and completed-map states reopen with all prior learning and rewards unchanged.

## Assumptions

- The first release includes exactly two additional activities: Missing Letter and
  Word Hunt.
- Existing Read, Choice, and Spell activities remain available and participate in
  mission rotation.
- Mission size, retry limit, answer rewards, completion rewards, placement logic,
  Adventure Map progression, and spaced-review behavior remain unchanged.
- Activity assignment may vary between missions; reproducible assignment is
  required in automated acceptance fixtures, not as a child-facing promise.
- All data remains local to the device under the existing save and privacy model.
- The existing Dolch first-, second-, and third-grade word catalog supplies target
  words and suitable distractors.

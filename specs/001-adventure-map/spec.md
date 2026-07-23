# Feature Specification: Adventure Map

**Feature Branch**: `001-adventure-map`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Create an interactive Adventure Map that makes each learner's placement trail meaningful through visible progress, unlockable locations, rescued Wordlings, short story moments, and ADHD-friendly ethical gamification without punitive streaks, pressure, or overstimulation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See My Trail and Next Destination (Priority: P1)

As a child returning to Wordling Rescue, I can open my Adventure Map and immediately
see my current world, the places I have already reached, and the next reachable
destination so I understand what my practice is building toward.

**Why this priority**: The map has no motivational value unless the child can quickly
understand their progress and next step.

**Independent Test**: Complete placement, open the map, and verify that the assigned
world, current position, completed locations, and one next destination are visually
distinct without requiring grade labels or a grown-up explanation.

**Acceptance Scenarios**:

1. **Given** a learner has completed Placement Quest, **When** they open Adventure Map,
   **Then** their placement world is shown as the active trail with a clearly marked
   current position and next destination.
2. **Given** a learner has completed earlier missions, **When** they open Adventure Map,
   **Then** completed locations remain visibly unlocked and progress is never reduced.
3. **Given** a learner has not completed Placement Quest, **When** they try to open the
   map, **Then** they see a friendly map preview and a primary action to find their
   starting trail.
4. **Given** a learner returns after any length of absence, **When** the map opens,
   **Then** it welcomes them back without mentioning missed days, lost streaks, or
   penalties.

---

### User Story 2 - Advance Through Mission Completion (Priority: P2)

As a child who completes a practice mission, I see my map position advance, unlock a
location at defined milestones, and receive a short story moment that connects my
practice to the Wordling Rescue world.

**Why this priority**: A predictable connection between practice and progress creates
a short, understandable feedback loop without making accuracy or speed the reward.

**Independent Test**: Complete a mission, return to the map, and verify that exactly one
progress step is awarded, any reached location unlocks once, and an eligible story
moment can be read or dismissed.

**Acceptance Scenarios**:

1. **Given** a mission is unfinished, **When** the learner exits it, **Then** map progress
   and location unlocks do not change.
2. **Given** a mission is completed, **When** the finale ends, **Then** the learner gains
   exactly one map step regardless of accuracy or completion speed.
3. **Given** the new step reaches a location, **When** the map appears, **Then** that
   location unlocks once and presents a story moment no longer than three short
   sentences.
4. **Given** a story moment is displayed, **When** the learner dismisses it, **Then**
   they can continue immediately and revisit it later.
5. **Given** reduced motion is preferred, **When** map progress changes, **Then** the
   same information appears without travel or reveal animation.

---

### User Story 3 - Revisit Worlds and Rescued Wordlings (Priority: P3)

As a child, I can revisit unlocked locations and see rescued Wordlings living along my
trail, giving my collection and previous missions a lasting purpose.

**Why this priority**: Revisiting creates meaningful continuity and novelty after the
core progress loop works, without adding competitive or compulsive mechanics.

**Independent Test**: Rescue Wordlings across multiple missions, open unlocked
locations, and verify that saved Wordlings and story moments remain available without
changing learning progress or awarding duplicate rewards.

**Acceptance Scenarios**:

1. **Given** the learner has rescued Wordlings, **When** they revisit an unlocked
   location, **Then** the location shows rescued Wordlings associated with that world.
2. **Given** a location's story has already appeared, **When** it is selected again,
   **Then** the learner can reread it without earning another unlock or reward.
3. **Given** Placement Quest is rechecked and selects a different starting world,
   **When** Adventure Map opens, **Then** the new world becomes active while progress
   and unlocks in previously visited worlds remain intact.
4. **Given** an existing learner upgrades to this feature, **When** the map first opens,
   **Then** prior completed missions and rescues produce an equivalent starting map
   state rather than resetting their accomplishments.

---

### Edge Cases

- The learner has no completed missions or rescued Wordlings.
- Existing save data has sessions but no placement result.
- Existing save data contains more completed missions than the current trail requires.
- The learner completes a mission while already at the final location in a world.
- Placement is rechecked multiple times between worlds.
- Storage is unavailable, full, or contains a partially valid Adventure Map record.
- A location is unlocked while sound, animation, network access, or installed-app support is absent.
- Rapid repeated taps occur during a map unlock or story reveal.

### Learning and Engagement Safety *(mandatory for child-facing changes)*

- **Learning rationale**: Map advancement follows completed retrieval-practice
  missions, making consistent practice visible without changing the spaced-review
  scheduler or treating cosmetic progress as mastery evidence.
- **ADHD-friendly engagement**: Each mission produces one predictable map step. The
  map shows the current position and one next destination, uses short story moments,
  provides optional revisiting, and welcomes the learner back without penalty.
- **Safety boundaries**: Progress is not based on speed, perfect accuracy, consecutive
  days, randomized scarcity, rankings, purchases, or expiring rewards. Celebrations
  are brief and cannot block the next action.
- **Accessibility and fallback**: Map meaning is conveyed through labels and states,
  not sound, color, or motion alone. Touch and keyboard navigation, reduced motion,
  readable text, and offline use are supported.
- **Privacy and save compatibility**: Adventure progress remains device-local.
  Existing placement, mission, word, star, and rescue data remain valid, and prior
  accomplishments seed the initial map state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an Adventure Map entry point after Placement
  Quest has assigned a starting world.
- **FR-002**: The system MUST show an active world, unlocked locations, the learner's
  current position, and exactly one next reachable destination.
- **FR-003**: The system MUST provide a friendly Placement Quest action instead of an
  active trail when placement is incomplete.
- **FR-004**: Each completed mission MUST award exactly one map progress step,
  independent of accuracy, speed, stars, or consecutive-day activity.
- **FR-005**: Abandoned or incomplete missions MUST NOT award map progress.
- **FR-006**: Each world MUST contain five ordered locations with distinct names,
  visual identities, and short story moments.
- **FR-007**: Reaching a location MUST unlock it once and MUST NOT create duplicate
  rewards when the map is reopened or rapidly activated.
- **FR-008**: Story moments MUST be optional, dismissible, no longer than three short
  sentences, and available for later rereading.
- **FR-009**: Rescued Wordlings MUST appear in revisitable locations associated with
  their rescue world.
- **FR-010**: Rechecking placement MUST change the active world when appropriate
  without removing progress from any previously visited world.
- **FR-011**: Existing completed missions and rescued Wordlings MUST seed an
  equivalent initial map state without reducing existing stars, sessions, learning
  progress, placement, or rescues.
- **FR-012**: The system MUST preserve map state on the current device and recover
  safely when new map data is missing or invalid.
- **FR-013**: Map information and controls MUST remain understandable without sound,
  animation, color perception, network access, or installed-app support.
- **FR-014**: The system MUST respect reduced-motion preferences and provide keyboard
  and touch access to every map action.
- **FR-015**: Returning learners MUST NOT encounter lost streaks, missed-day warnings,
  expiring rewards, countdown pressure, rankings, or accuracy-gated map progress.
- **FR-016**: A learner at the final location MUST continue receiving mission finales
  and rescued Wordlings without duplicate location unlocks or blocked practice.

### Key Entities

- **Adventure Progress**: The learner's device-local progress for each world,
  including current step, unlocked locations, and viewed story moments.
- **World Trail**: One of the named Wordling Rescue worlds and its ordered locations.
- **Map Location**: A named milestone with locked, next, or unlocked state and one
  short story moment.
- **Resident Wordling**: A previously rescued Wordling associated with its rescue
  world and displayed at an unlocked location.

### Out of Scope

- Competitive leaderboards, social comparison, sharing, trading, or multiplayer.
- Purchases, paid currency, randomized loot, rarity pressure, or expiring rewards.
- Daily streaks, streak repair, countdown challenges, or accuracy-gated locations.
- New accounts, cloud synchronization, server-side learner records, or analytics.
- Changing sight-word mastery, placement, or spaced-review algorithms.
- Free-roaming character control or a large explorable game world.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In an observed usability check, at least 4 of 5 children can identify
  their current location and next destination within 10 seconds without assistance.
- **SC-002**: Every completed mission produces exactly one visible map step, and every
  abandoned mission produces zero steps across all tested activity modes.
- **SC-003**: Existing learner saves retain 100% of stars, sessions, word progress,
  placement results, and rescued Wordlings when Adventure Map is first opened.
- **SC-004**: All locations and story moments are operable using touch and keyboard,
  and all essential state remains understandable with sound and animation disabled.
- **SC-005**: A returning learner can resume from the map to a practice mission in no
  more than two actions, regardless of time away.
- **SC-006**: Map unlocks, story moments, and resident Wordlings remain available after
  closing and reopening the application on the same device.
- **SC-007**: Repeated activation during an unlock produces zero duplicate map steps,
  locations, stories, stars, or rescued Wordlings.

## Assumptions

- Each of the three existing worlds contains five locations in the first release.
- One completed mission equals one map step; accuracy and stars do not alter that step.
- The placement result selects the active world, while progress in all visited worlds
  is retained.
- Previously completed sessions seed map steps in the current placement world, capped
  at that world's final location; excess sessions are retained as accomplishments but
  do not create invented locations.
- Rescued Wordlings are distributed deterministically among unlocked locations in
  their rescue world.
- Location and story content ships with the application and remains available offline.
- The existing anonymous, device-local save remains the only persistence mechanism.

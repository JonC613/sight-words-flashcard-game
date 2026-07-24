# Feature Specification: Gentle Daily Goals and Streaks

**Feature Branch**: `003-daily-goals-streaks`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Institute daily goals and streaks without punishment."

## Clarifications

### Session 2026-07-23

- Q: What happens to the current streak after missed days? → A: Restart the
  current streak quietly at 1 while preserving best streak, lifetime practice
  days, and all earned progress.
- Q: Which streak information should the child see? → A: Show the child today's
  goal and current practice trail; keep best streak and lifetime totals in the
  grown-up area.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Today's Gentle Goal (Priority: P1)

A child sees one small daily goal: complete one mission. Finishing any mission
that day completes the goal, triggers a brief celebration, and clearly says that
the child is done for today while still allowing optional practice.

**Why this priority**: A single achievable target creates a short, visible finish
line without encouraging long sessions or perfect performance.

**Independent Test**: Start a day with an incomplete goal, complete one mission,
and verify that the daily goal becomes complete exactly once without changing
the existing mission reward.

**Acceptance Scenarios**:

1. **Given** no mission has been completed today, **When** the child views the
   home or map screen, **Then** the daily goal shows one mission remaining.
2. **Given** the daily goal is incomplete, **When** the child completes a
   mission, **Then** the goal becomes complete and a brief supportive
   celebration appears.
3. **Given** today's goal is already complete, **When** the child completes
   another mission, **Then** progress remains complete and no duplicate daily
   completion or bonus is recorded.
4. **Given** today's goal is complete, **When** the child chooses to continue,
   **Then** optional practice remains available without language suggesting it
   is required.

---

### User Story 2 - Build a Kind Practice Streak (Priority: P2)

A child can see how many consecutive local calendar days included a completed
mission. Missing a day never removes stars, rescues, map progress, the best
streak, or the total number of practice days. On return, the experience welcomes
the child and starts a new current streak without saying that anything was lost
or broken.

**Why this priority**: Consistency can be motivating, but preserved achievements
and forgiving re-entry prevent the counter from becoming punishment.

**Independent Test**: Simulate practice across consecutive days, skip a day,
and return; verify the current count restarts while all earned and historical
progress remains intact and the copy is welcoming.

**Acceptance Scenarios**:

1. **Given** a mission was completed yesterday, **When** the child completes one
   today, **Then** the current practice streak increases by one.
2. **Given** the last practice day was earlier than yesterday, **When** the child
   returns before completing a mission, **Then** the interface welcomes the
   child without displaying failure, loss, or a broken-streak warning.
3. **Given** the child returns after one or more missed days, **When** a mission
   is completed, **Then** the current streak becomes one while best streak,
   lifetime practice days, rewards, rescues, and map progress remain unchanged.
4. **Given** multiple missions are completed on one local day, **When** streak
   progress is calculated, **Then** that calendar day counts once.

---

### User Story 3 - Understand Progress Without Pressure (Priority: P3)

A child can understand today's status and current practice trail using calm
language. A grown-up can also see the best streak and total practice days. The
interface does not use countdowns, urgent reminders, loss warnings, or rewards
that depend on never missing a day.

**Why this priority**: Transparent history supports encouragement and planning
while keeping the child's primary experience focused on reading.

**Independent Test**: Inspect child and grown-up views for new, active, completed,
and returning states and verify that every state presents accurate progress
without pressure-oriented language.

**Acceptance Scenarios**:

1. **Given** a new learner, **When** progress is viewed, **Then** counters start
   at zero and the interface invites the first mission without urgency.
2. **Given** prior practice history, **When** the grown-up area is opened,
   **Then** current streak, best streak, total practice days, and today's goal
   status are shown with clear labels.
3. **Given** the child has missed days, **When** either view is opened, **Then**
   no earned item is visually removed and no countdown or repair purchase is
   offered.

### Edge Cases

- A mission is started before midnight and completed after midnight; completion
  counts for the local calendar day on which it finishes.
- The device clock or time zone changes; recorded historical dates and earned
  totals are never deleted or decremented, and the same date cannot count twice.
- The app opens offline, storage is unavailable, or a save contains malformed
  goal fields; reading practice remains available and invalid optional fields
  fall back safely.
- An old save has no goal data; existing stars, words, missions, rescues, map
  progress, and settings remain unchanged.
- A completion event is submitted twice; the day, streak, and lifetime practice
  totals update at most once.
- A child abandons a mission; the daily goal and streak do not advance.
- Reduced motion is enabled; celebration remains understandable without motion.

### Learning and Engagement Safety *(mandatory for child-facing changes)*

- **Learning rationale**: The daily target rewards completing a bounded active
  recall session. It does not change word selection, spaced review, mastery, or
  retry scheduling.
- **ADHD-friendly engagement**: One mission creates a short finish line, visible
  progress, immediate feedback, and an explicit permission to stop. Returning
  after interruption is calm and forgiving.
- **Safety boundaries**: Missed days never remove earned progress or rewards.
  The experience uses no broken-streak language, countdowns, streak repair,
  purchases, scarcity, rankings, notifications, or escalating daily targets.
- **Accessibility and fallback**: Status is conveyed with text and not color
  alone. Controls retain tablet-sized touch targets and keyboard access.
  Celebrations respect reduced motion, and audio is never required.
- **Privacy and save compatibility**: Daily data remains anonymous and
  device-local. New fields are optional, old saves load unchanged, and no
  analytics, account, or external service is introduced.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST define the daily goal as completing one mission
  during the device's local calendar day.
- **FR-002**: The system MUST show daily-goal status and the current practice
  trail on the child's primary home or play journey before a mission begins.
- **FR-003**: The system MUST mark the daily goal complete only after a mission
  completion; placement, abandoned missions, story views, and collection views
  MUST NOT count.
- **FR-004**: Each local calendar date MUST count at most once toward streak and
  lifetime practice totals, including after duplicate completion events.
- **FR-005**: Consecutive practiced local calendar dates MUST increase the
  current streak by one.
- **FR-006**: After one or more unpracticed calendar days, the next practiced day
  MUST begin a new current streak of one.
- **FR-007**: Missing days MUST NOT decrease best streak, lifetime practice days,
  stars, mastered words, rescues, mission count, map progress, or any other
  earned state.
- **FR-008**: The system MUST preserve the greatest completed current streak as
  the best streak.
- **FR-009**: Multiple mission completions on the same date MUST NOT increase the
  current streak, best streak, or lifetime practice days more than once.
- **FR-010**: Completing the daily goal MUST NOT alter existing mission star,
  rescue, mastery, review, retry, or Adventure Map formulas.
- **FR-011**: The first daily completion MUST produce one brief supportive
  acknowledgement; subsequent missions that day MUST NOT repeat it as a new
  daily achievement.
- **FR-012**: After goal completion, the interface MUST state that today's goal
  is complete and that additional practice is optional.
- **FR-013**: Returning after missed days MUST use welcoming language and MUST
  NOT use "lost," "failed," "broken," "repair," or equivalent punitive wording.
- **FR-014**: The child-facing experience MUST NOT display countdowns to streak
  loss, push-notification prompts, rankings, or escalating daily requirements.
- **FR-015**: The grown-up area MUST show today's status, current streak, best
  streak, and lifetime practice days with plain-language labels.
- **FR-016**: New daily-goal state MUST be optional and safely derived for saves
  created before this feature without changing existing earned state.
- **FR-017**: Malformed or unavailable daily-goal state MUST fail safely without
  blocking reading practice.
- **FR-018**: Daily-goal and streak behavior MUST work offline using only
  device-local information.
- **FR-019**: Goal and streak status MUST remain understandable without color,
  sound, or animation and MUST respect reduced-motion preferences.
- **FR-020**: The system MUST use the local date at successful mission completion
  as the practiced date and MUST never delete prior history solely because the
  clock or time zone changes.

### Key Entities

- **Practice Day**: A unique local calendar date on which at least one mission
  was successfully completed.
- **Daily Goal Status**: Whether the one-mission target for the current local
  calendar date is incomplete or complete.
- **Practice Streak**: The number of consecutive practiced local calendar dates
  ending on the most recent practice day.
- **Practice History Summary**: The most recent practice date, current streak,
  best streak, and total unique practice days needed to explain progress.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child can identify whether today's goal is complete within five
  seconds on the home or play journey.
- **SC-002**: One completed mission changes an incomplete daily goal to complete
  exactly once in 100% of tested normal and duplicate-submission scenarios.
- **SC-003**: Across consecutive-day, same-day, missed-day, clock-change, and
  legacy-save scenarios, streak and lifetime totals match the specified results
  in 100% of acceptance tests.
- **SC-004**: Missing any number of days causes zero loss of previously earned
  stars, rescues, mastery, mission, map, best-streak, or lifetime-practice state.
- **SC-005**: All daily-goal states remain usable at representative tablet
  portrait and landscape sizes with no clipped primary control or unintended
  horizontal page scrolling.
- **SC-006**: Child-facing copy review finds zero punitive streak terms,
  countdowns, rankings, streak-repair offers, or escalating daily targets.
- **SC-007**: Existing saves load with all prior progress unchanged, and a child
  can begin or complete a mission even when new goal data is missing or invalid.
- **SC-008**: Goal status and completion acknowledgement remain understandable
  with sound off, reduced motion enabled, and color cues removed.

## Assumptions

- One completed mission is the smallest useful and age-appropriate daily goal;
  children and grown-ups cannot raise it in this version.
- A "streak" means consecutive local calendar dates with at least one completed
  mission. After missed days, only the current sequence restarts; all historical
  and earned progress is preserved.
- Daily completion is recognition only and adds no separate stars, currency, or
  unlocks.
- The feature does not send reminders or notifications and does not require an
  account, server clock, or network connection.
- The grown-up area is informational; it does not compare children or expose
  grades, percentages, or performance rankings.

# Tasks: Mission Variety

**Input**: Design documents from `specs/002-mission-variety/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: Tests are required for prompt generation, word-scheduler isolation,
balanced composition, retries, learning outcomes, rewards, save compatibility,
and duplicate-submission protection. Manual evidence covers tablet interaction,
keyboard use, sound-off, reduced motion, offline behavior, and child usability.

**Organization**: Tasks are grouped by user story so each increment has an
independent goal and verification checkpoint.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it uses a different file and has no
  dependency on another incomplete task in the same phase.
- **[Story]**: Maps the task to its specification user story.
- Every task names an exact file path.

## Phase 1: Setup (Shared Test Infrastructure)

**Purpose**: Add the new test entry without changing production behavior.

- [ ] T001 Create the shared Mission Variety test fixtures in `tests/mission-variety.test.mjs` and add that file to the `npm test` command in `package.json`

**Checkpoint**: The existing test command discovers the new test file and all
pre-feature tests still pass.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared activity vocabulary and module boundaries used by
all three stories.

**⚠️ CRITICAL**: Complete this phase before user-story implementation.

- [ ] T002 Define the five activity constants, prompt/card JSDoc types, injected-random interface, and non-mutating helper boundaries in `app/mission-variety.js`
- [ ] T003 Extend the `Mode`, `Progress`, and `Card` TypeScript types for `missing-letter`, `word-hunt`, and transient prompt data without changing save keys or mastery thresholds in `app/page.tsx`

**Checkpoint**: The application type-checks with old three-mode saves, and the
pure module has no DOM, storage, speech, network, reward, or clock access.

---

## Phase 3: User Story 1 - Practice Through Varied Activities (Priority: P1) 🎯 MVP

**Goal**: A child can complete valid Missing Letter and Word Hunt cards, receive
the existing supportive feedback and rewards, and retry a missed new activity
later through a different eligible mode.

**Independent Test**: Complete a mission fixture containing both new activities;
verify each accepts one answer, shows the full word, updates the existing learning
outcome once, and appends a different-mode retry after a miss.

### Tests for User Story 1

> Write these tests first and confirm they fail before implementation.

- [ ] T004 [US1] Add failing Missing Letter tests for two-letter words, apostrophes, repeated letters, one omitted position, three-to-four distinct choices, one answer, deterministic randomness, and one-letter fallback in `tests/mission-variety.test.mjs`
- [ ] T005 [US1] Add failing Word Hunt tests for two-to-four distinct choices, one target, same-grade preference, introduced-only distractors, deterministic randomness, and insufficient-distractor fallback in `tests/mission-variety.test.mjs`
- [ ] T006 [US1] Add failing tests for base activity-card composition, immutable selected words/order, different-mode appended retry, retry-only-once behavior, and the 12-card cap in `tests/mission-variety.test.mjs`

### Implementation for User Story 1

- [ ] T007 [US1] Implement `createMissingLetterPrompt` and `createWordHuntPrompt` to satisfy the pure-state contract in `app/mission-variety.js`
- [ ] T008 [US1] Implement initial eligible-activity assignment and `createRetryCard` with existing-mode fallback in `app/mission-variety.js`
- [ ] T009 [US1] Integrate post-selection activity composition, both new card renderers, the guarded `answer(ok)` path, mode-history recording, and different-mode retry appending in `app/page.tsx`
- [ ] T010 [P] [US1] Add Missing Letter and Word Hunt layout, 44px choice controls, disabled states, and shared feedback-compatible styling in `app/globals.css`
- [ ] T011 [US1] Add production-render smoke assertions for both activity instructions and semantic native controls in `tests/rendered-html.test.mjs`

**Checkpoint**: User Story 1 works end-to-end as an MVP; existing star, stage,
interval, mastery-threshold, finale, rescue, session, and Adventure Map behavior
remains unchanged.

---

## Phase 4: User Story 2 - Receive Balanced Mission Rotation (Priority: P2)

**Goal**: Missions retain exactly the scheduler-selected word sequence while
guaranteeing bounded activity variety and safe prompt fallbacks.

**Independent Test**: Generate representative missions from fixed learner states
and verify identical selected words/order, at least one new activity when eligible,
at least two modes in eligible four-card missions, no avoidable run of three, and
no unseen Word Hunt distractors.

### Tests for User Story 2

> Write these tests first and confirm they fail before implementation.

- [ ] T012 [US2] Add failing scheduler-isolation tests comparing selected word identity, order, due priority, and new-word limits before and after activity assignment in `tests/mission-variety.test.mjs`
- [ ] T013 [US2] Add failing composition tests for guaranteed new-activity exposure, two-mode minimums, no avoidable third consecutive mode, eligibility fallback, and reproducible fixtures in `tests/mission-variety.test.mjs`
- [ ] T014 [US2] Add the 100-mission SC-001/SC-002 acceptance fixture and activity-composition p95 timing helper in `tests/mission-variety.test.mjs`

### Implementation for User Story 2

- [ ] T015 [US2] Implement constrained least-used activity composition with new-activity reservation, consecutive-run prevention, and valid-prompt fallback in `app/mission-variety.js`
- [ ] T016 [US2] Refactor `makeMission` into an unchanged scheduler-selection stage followed by activity composition while preserving repeated-new-word sequencing in `app/page.tsx`
- [ ] T017 [US2] Add regression assertions that activity mix cannot alter completion rewards or Adventure Map transitions in `tests/mission-finale.test.mjs` and `tests/adventure-map.test.mjs`

**Checkpoint**: User Stories 1 and 2 pass independently, and SC-001 through SC-004
are automated.

---

## Phase 5: User Story 3 - Resume Calmly After Interruption (Priority: P3)

**Goal**: Both activities remain usable with touch, keyboard, sound off, reduced
motion, offline/storage failure, old saves, and mission abandonment.

**Independent Test**: Exercise both activities at supported tablet sizes with
sound disabled, keyboard-only input, reduced motion, an old save, storage failure,
and early exit; verify understandable prompts, one outcome per card, and no
completion reward or map progress after abandonment.

### Tests for User Story 3

> Write these tests first and confirm they fail before implementation.

- [ ] T018 [US3] Add failing compatibility tests for old three-mode progress, JSON round trips with new modes, malformed optional prompt data, and introduced-word detection in `tests/mission-variety.test.mjs`
- [ ] T019 [US3] Add failing rapid-submission, abandoned-mission, single-finale, and save-failure regression coverage using the existing testable boundaries in `tests/mission-variety.test.mjs`, `tests/mission-finale.test.mjs`, and `tests/adventure-map.test.mjs`

### Implementation for User Story 3

- [ ] T020 [US3] Harden new activity controls against repeated activation, preserve visible sound-off instructions, and keep abandonment free of finale side effects in `app/page.tsx`
- [ ] T021 [P] [US3] Add visible focus, narrow/tablet reflow, non-color states, and reduced-motion overrides for both activities in `app/globals.css`
- [ ] T022 [US3] Extend production-render checks for labels, status semantics, keyboard-native controls, and horizontal-overflow regression selectors in `tests/rendered-html.test.mjs`
- [ ] T023 [US3] Execute the 768×1024, 1024×768, and 320px touch/keyboard/sound-off/reduced-motion/offline/storage-failure matrix and record results in `specs/002-mission-variety/validation.md`

**Checkpoint**: All three user stories are independently functional, old saves
remain valid, and SC-007/SC-008 have automated plus recorded manual evidence.

---

## Phase 6: Polish & Cross-Cutting Release Gates

**Purpose**: Validate the combined feature against learning, engagement, quality,
performance, and release requirements.

- [ ] T024 [P] Review all child-facing instructions, feedback, rewards, and retry behavior against Constitution Principles II/III and record the result in `specs/002-mission-variety/validation.md`
- [ ] T025 Run `npm run lint` and `npm test`, resolve any failures in the affected `app/` or `tests/` files, and record final command results in `specs/002-mission-variety/validation.md`
- [ ] T026 Measure 1,000 eight-card compositions and 20 warm-browser feedback interactions against the plan’s p95/100ms targets and record method/results in `specs/002-mission-variety/validation.md`
- [ ] T027 Conduct the consented five-child anonymous aggregate comprehension/comfort check for SC-005/SC-006, collecting no names or media, and record only aggregate results in `specs/002-mission-variety/validation.md`
- [ ] T028 Verify every FR-001–FR-018 and SC-001–SC-008 has implementation or validation evidence and complete the traceability table in `specs/002-mission-variety/validation.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on T001 and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on T002–T003 and delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on the working activity module from US1;
  its scheduler-isolation and balancing tests remain independently runnable.
- **User Story 3 (Phase 5)**: Depends on the rendered activities from US1; its
  compatibility and interruption tests remain independently runnable.
- **Polish (Phase 6)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 (P1)**: Foundation only; no dependency on US2 or US3.
- **US2 (P2)**: Builds on US1 prompt generation and initial composition, then
  independently validates scheduling and rotation.
- **US3 (P3)**: Builds on US1 UI controls, then independently validates access,
  interruption, persistence compatibility, and fallbacks.

### Within Each User Story

- Add each story's failing tests before its implementation tasks.
- Implement pure rules before React integration.
- Complete integration before rendered/manual verification.
- Stop at each checkpoint and run the relevant story tests.

### Parallel Opportunities

- T010 can run alongside T007–T009 once class names are agreed.
- After US1, US2 pure-rule work and US3 accessibility planning can proceed in
  parallel, though edits to shared files must be serialized.
- T021 can run alongside T018–T020 because it touches only CSS.
- T024 can run alongside final automated verification preparation.

---

## Parallel Example: User Story 1

```text
Task T007: Implement prompt generators in app/mission-variety.js
Task T010: Add activity styling in app/globals.css
```

## Parallel Example: User Story 3

```text
Task T020: Harden interaction and abandonment behavior in app/page.tsx
Task T021: Add focus, responsive, and reduced-motion styles in app/globals.css
```

---

## Implementation Strategy

### MVP First

1. Complete T001–T003.
2. Complete T004–T011 for User Story 1.
3. Run the new unit tests, existing regression tests, lint, and production build.
4. Stop and demonstrate both activities plus a different-mode retry.

### Incremental Delivery

1. **US1**: Two playable activities and safe retry → test independently.
2. **US2**: Scheduler isolation and bounded rotation → test independently.
3. **US3**: Access, interruption, old-save, and fallback hardening → test
   independently.
4. **Polish**: Complete performance, safety, usability, traceability, and release
   evidence.

## Notes

- `[P]` tasks operate on different files and can proceed concurrently.
- `[US1]`, `[US2]`, and `[US3]` map directly to the prioritized specification.
- Tests must fail for the intended missing behavior before implementation.
- Commit after each task or cohesive task group.
- Do not stage or modify unrelated legacy spec folders.

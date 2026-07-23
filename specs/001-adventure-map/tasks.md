# Tasks: Adventure Map

**Input**: Design documents from `specs/001-adventure-map/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Tests are required by the project constitution for rewards, persistence, migration, and duplicate-submission protection. Story test tasks are written before their implementation tasks.

**Organization**: Tasks are grouped by user story so each increment has an explicit independent test.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes a different file and has no dependency on an incomplete task.
- **[Story]**: Maps the task to User Story 1, 2, or 3.
- Every checklist item includes an exact repository-relative file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the new pure-module tests without changing dependencies or deployment infrastructure.

- [ ] T001 Add `tests/adventure-map.test.mjs` to the explicit `npm test` Node test list in `package.json`

---

## Phase 2: Foundational Map State (Blocking Prerequisites)

**Purpose**: Establish the catalog, backward-compatible save normalization, and derived selectors required by every story.

**⚠️ CRITICAL**: Complete this phase before implementing any user-story UI.

- [ ] T002 Add failing contract tests for the three-world/five-location catalog, legacy save migration, malformed V1 repair, legacy-field preservation, normalization idempotency, and preview/active selectors in `tests/adventure-map.test.mjs`
- [ ] T003 Implement the stable world/location/story catalog and catalog validation helpers in `app/adventure-map.js`
- [ ] T004 Implement optional V1 map initialization, legacy session seeding, viewed-story seeding, clamping, filtering, and idempotent repair in `app/adventure-map.js`
- [ ] T005 Implement pure selectors for unlocked/current/next locations, halfway state, pending story, world completion, full-map completion, and exactly one next destination in `app/adventure-map.js`

**Checkpoint**: The pure module can safely normalize old/corrupt saves and describe a map without React, storage, network, or clock access.

---

## Phase 3: User Story 1 — See My Trail and Next Destination (Priority: P1) 🎯 MVP

**Goal**: A placed learner can open a semantic Adventure Map and immediately identify the active world, prior locations, current position, and exactly one next destination; an unplaced learner sees the placement preview.

**Independent Test**: Load placed and unplaced save fixtures, open Map, and verify the active/preview state, five labeled locations, visible current and next labels, retained migrated progress, and a map-to-mission path requiring no more than two actions.

### Tests for User Story 1

- [ ] T006 [US1] Add failing selector cases for steps 0, 1, 2, 9, and 10 plus production-render assertions for the Map entry and placement-preview copy in `tests/adventure-map.test.mjs` and `tests/rendered-html.test.mjs`

### Implementation for User Story 1

- [ ] T007 [US1] Create the placement preview and semantic five-location `AdventureMapView` with ordered-list locations, visible state labels, progress text, and one next destination in `app/adventure-map.tsx`
- [ ] T008 [P] [US1] Add tablet split/stacked map layouts, >=44 px controls, readable location labels, safe-area navigation spacing, and scroll-safe `.app.map` behavior in `app/globals.css`
- [ ] T009 [P] [US1] Remove the maximum zoom restriction while preserving device-width metadata in `app/layout.tsx`
- [ ] T010 [US1] Extend the `Save`/`View` types and guarded hydration flow to normalize `wordling-rescue-v1` without losing legacy fields or blocking on storage errors in `app/page.tsx`
- [ ] T011 [US1] Wire Home cards, placement result, finale return, and the four-item bottom navigation to the Map while preserving Collection access in `app/page.tsx`
- [ ] T012 [US1] Add the Map start/resume action and active-world focus behavior so a learner reaches practice in at most two actions in `app/page.tsx`

**Checkpoint**: User Story 1 is an independently usable MVP with migration-safe display and navigation.

---

## Phase 4: User Story 2 — Advance Through Mission Completion (Priority: P2)

**Goal**: A completed mission atomically awards one visible map step, every second step unlocks one location and short story, and a completed world leads to a safe next-world choice.

**Independent Test**: Complete and abandon missions from boundary fixtures, then verify 0/1 step behavior, even-step location unlocks, one-time story eligibility, duplicate-event idempotency, persistent world completion, and unchanged results across accuracy/speed variants.

### Tests for User Story 2

- [ ] T013 [US2] Add failing transition tests for abandonment, accuracy-independent completion, bonus-only star accounting, steps 1/2 and 9/10, duplicate completion IDs, story close/revisit, world selection, and thirty-step full-map behavior in `tests/adventure-map.test.mjs`

### Implementation for User Story 2

- [ ] T014 [US2] Implement idempotent `completeMission`, `markStoryViewed`, and `chooseWorld` transitions with a stable completion ID and atomic session/rescue/map updates that add only the existing 5-star completion bonus in `app/adventure-map.js`
- [ ] T015 [US2] Generate one stable mission ID at mission start, preserve existing per-answer star updates, and replace separate finale mutations with one completion transition that cannot add the displayed mission total twice in `app/page.tsx`
- [ ] T016 [P] [US2] Implement sequential accessible story and world-completion choice surfaces with focus return, Escape handling, rereading, and no reward side effects in `app/adventure-map.tsx`
- [ ] T017 [US2] Return the finale to the committed Map state, announce one step/unlock, and gate a new mission behind an incomplete-world choice when the active world is complete in `app/page.tsx`
- [ ] T018 [US2] Add brief progress/reveal/dialog styles and explicit reduced-motion fallbacks that do not control persistence or sequencing in `app/globals.css`

**Checkpoint**: User Stories 1 and 2 work together, while progression remains independently testable through the pure transition module.

---

## Phase 5: User Story 3 — Revisit Worlds and Rescued Wordlings (Priority: P3)

**Goal**: Unlocked locations remain revisitable with deterministic resident Wordlings and stories, placement rechecks provide exactly Stay/Switch choices, and full-map missions continue adding residents without resetting locations.

**Independent Test**: Seed rescues and multi-world progress, revisit every unlocked location, run both placement-recheck choices, and complete a mission after all fifteen locations are unlocked; verify stable residents/stories, preserved learning data, and zero duplicate map rewards.

### Tests for User Story 3

- [ ] T019 [US3] Add failing tests for deterministic resident assignment, legacy rescue preservation, placement suggestion persistence, Stay/Switch resolution, repeated rechecks, post-full-completion resident rewards, and JSON round trips preserving active world, viewed stories, pending choice, and resident inputs in `tests/adventure-map.test.mjs`

### Implementation for User Story 3

- [ ] T020 [US3] Implement deterministic resident selectors plus `recordPlacementSuggestion` and `resolvePlacementSuggestion` transitions in `app/adventure-map.js`
- [ ] T021 [P] [US3] Render resident Wordlings, unlocked-location detail/reread actions, completed-world switching, and the all-worlds-complete state in `app/adventure-map.tsx`
- [ ] T022 [P] [US3] Update placement completion to save the learning placement immediately while persisting a map-world suggestion without changing existing world progress in `app/page.tsx`
- [ ] T023 [US3] Add the exact two-action Stay/Switch placement-recheck panel and clear it only through a valid choice in `app/adventure-map.tsx`
- [ ] T024 [US3] Route new rescues to the cosmetic active world, retain every legacy rescue, and keep Collection reachable and complete after map navigation changes in `app/page.tsx`

**Checkpoint**: All three user stories are independently testable and the complete Adventure Map lifecycle is functional.

---

## Phase 6: Polish & Cross-Cutting Verification

**Purpose**: Validate safety, accessibility, offline resilience, performance, and production release behavior across all stories.

- [ ] T025 [P] Create the manual fixture/evidence checklist for fresh, migrated, corrupt, boundary, recheck, and full-map saves in `specs/001-adventure-map/checklists/adventure-map-acceptance.md`
- [ ] T026 Audit child-facing map, story, choice, storage-error, and return copy against the constitution's safety and ADHD-friendly rules in `app/adventure-map.tsx` and `app/page.tsx`
- [ ] T027 Verify accessible names for icon-only controls, keyboard/focus behavior, visible non-color states, zoom, reduced motion, sound-off fallback, and touch target sizes in `app/adventure-map.tsx`, `app/page.tsx`, `app/layout.tsx`, and `app/globals.css`
- [ ] T028 Run `npm run lint` and `npm test`, resolve failures without weakening assertions, and record automated results in `specs/001-adventure-map/checklists/adventure-map-acceptance.md`
- [ ] T029 Execute the 768×1024, 1024×768, 320 px, offline, storage-failure, close/reopen persistence, keyboard, and reduced-motion checks from `quickstart.md` and record evidence in `specs/001-adventure-map/checklists/adventure-map-acceptance.md`
- [ ] T030 With grown-up consent, conduct the anonymous aggregate usability check with at least five children and record whether at least four identify current and next locations within 10 seconds in `specs/001-adventure-map/checklists/adventure-map-acceptance.md`
- [ ] T031 Measure 20 warm-cache Map navigations and control updates under the documented Chromium 768×1024 4× CPU profile and record whether the 1-second/100-ms targets pass in `specs/001-adventure-map/checklists/adventure-map-acceptance.md`

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: Starts immediately.
2. **Foundational (Phase 2)**: Depends on T001 and blocks all user-story phases.
3. **User Story 1 (Phase 3)**: Depends on foundational selectors/normalization and produces the MVP map surface.
4. **User Story 2 (Phase 4)**: Depends on the User Story 1 map surface for integrated story/world-choice presentation; its transition tests remain independently runnable.
5. **User Story 3 (Phase 5)**: Depends on the base map and completion transitions; resident and recheck tests remain independently runnable from fixtures.
6. **Polish (Phase 6)**: Depends on all selected user stories.

### User Story Dependency Graph

```text
Setup → Foundation → US1 (MVP) → US2 → US3 → Polish/Release
```

- **US1** owns map visibility, migration-safe hydration, entry points, and next-destination clarity.
- **US2** consumes the US1 map surface but owns mission advancement, stories, and world completion.
- **US3** consumes the map/completion foundation but owns residents, revisiting, placement choices, and the enduring full-map state.

### Within Each Story

- Write the story's failing tests first.
- Implement pure state transitions/selectors before React integration.
- Implement semantic UI before visual polish.
- Run the story's independent test before moving to the next priority.
- Do not make map state an input to word selection, mastery, placement scoring, or review scheduling.

## Parallel Opportunities

- **US1**: T008 (`app/globals.css`) and T009 (`app/layout.tsx`) can run in parallel after the UI contract is understood; T007/T010/T011/T012 remain ordered because they establish shared component/page behavior.
- **US2**: T016 (`app/adventure-map.tsx`) can proceed after T014 while T015 works in `app/page.tsx`; T017 integrates them afterward.
- **US3**: T021 (`app/adventure-map.tsx`) and T022 (`app/page.tsx`) can run in parallel after T020; T023/T024 complete their respective integrations.
- **Polish**: T025 can begin while code audits proceed because it changes only the acceptance checklist.

## Parallel Example: User Story 2

```text
After T013 and T014:
- Task T015: Integrate atomic completion in app/page.tsx
- Task T016: Build story/world-choice surfaces in app/adventure-map.tsx
Then T017 joins both paths through finale-to-map navigation.
```

## Parallel Example: User Story 3

```text
After T019 and T020:
- Task T021: Render residents and completed-world states in app/adventure-map.tsx
- Task T022: Persist placement suggestions in app/page.tsx
Then T023 and T024 finish the two UI integration paths.
```

## Implementation Strategy

### MVP First

1. Complete T001–T005.
2. Complete T006–T012 for User Story 1.
3. Stop and validate the P1 independent test.
4. Demo or deploy the migration-safe read-only Adventure Map before adding reward transitions if a smaller review slice is desired.

### Incremental Delivery

1. **Foundation**: deterministic catalog, migration, and selectors.
2. **US1**: visible map and next destination.
3. **US2**: mission steps, location stories, and world completion.
4. **US3**: residents, revisiting, rechecks, and completed-map continuity.
5. **Polish**: safety/accessibility evidence and production gates.

### Commit Discipline

Commit after each task or cohesive group. Keep the pure state module, UI integration, and verification evidence reviewable; do not include unrelated `specs/README.md` or `specs/wordling-rescue/` files.

## Notes

- `[P]` tasks touch different files and can proceed concurrently only after their stated prerequisites.
- `[US1]`, `[US2]`, and `[US3]` map directly to the prioritized specification stories.
- Tests must fail for the intended missing behavior before implementation and pass without weakened assertions afterward.
- `npm test` includes a production build; GitHub Actions uses the same command before Cloudflare deployment.

# Tasks: Gentle Daily Goals and Streaks

**Input**: Design documents from `specs/003-daily-goals-streaks/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by the specification and constitution for persistence,
duplicate completion, reward neutrality, and child-facing behavior.

## Phase 1: Setup

**Purpose**: Connect the new domain tests to the existing project workflow.

- [x] T001 Add `tests/daily-practice.test.mjs` to the committed `npm test` command in `package.json`
- [x] T002 [P] Add validation evidence headings for automated, desktop, tablet, accessibility, and open gates in `specs/003-daily-goals-streaks/validation.md`

---

## Phase 2: Foundational

**Purpose**: Implement the pure, reusable practice-date contract required by all user stories.

**⚠️ CRITICAL**: Complete this phase before user-story UI work.

- [x] T003 Write failing tests for local date keys, invalid dates, normalization, immutability, and derived summaries in `tests/daily-practice.test.mjs`
- [x] T004 Implement local date-key generation, calendar ordinals, and practice-day normalization in `app/daily-practice.js`
- [x] T005 Implement pure daily status selection and one-date recording results in `app/daily-practice.js`
- [x] T006 Run `node --test tests/daily-practice.test.mjs` and record foundational evidence in `specs/003-daily-goals-streaks/validation.md`

**Checkpoint**: Pure daily practice behavior is independently testable.

---

## Phase 3: User Story 1 — Complete Today's Gentle Goal (Priority: P1) 🎯 MVP

**Goal**: One accepted mission completes today's one-mission goal exactly once and the child sees a brief, optional-practice-safe acknowledgement.

**Independent Test**: Begin with no practice date for today, complete one mission,
and verify today's goal completes exactly once without changing existing mission
reward, rescue, learning, or map formulas.

### Tests for User Story 1

- [x] T007 [P] [US1] Add accepted, abandoned, duplicate, same-day, and formula-neutral mission completion tests in `tests/adventure-map.test.mjs`
- [x] T008 [P] [US1] Add daily-goal finale and source-accessibility contract tests in `tests/mission-finale.test.mjs` and `tests/rendered-html.test.mjs`

### Implementation for User Story 1

- [x] T009 [US1] Record the local practice day only after accepted duplicate-safe mission completion in `app/adventure-map.js`
- [x] T010 [US1] Extend save and mission-result typing and derive daily practice status in `app/page.tsx`
- [x] T011 [US1] Add incomplete, complete, and optional-practice daily goal presentation to the child home/play journey in `app/page.tsx`
- [x] T012 [US1] Add first-completion-only daily acknowledgement to the mission finale in `app/page.tsx`
- [x] T013 [US1] Style goal states and reduced-motion-safe acknowledgement for desktop and tablet layouts in `app/globals.css`
- [x] T014 [US1] Run User Story 1 automated tests and document results in `specs/003-daily-goals-streaks/validation.md`

**Checkpoint**: The one-mission daily goal is usable and does not alter learning or rewards.

---

## Phase 4: User Story 2 — Build a Kind Practice Streak (Priority: P2)

**Goal**: Consecutive practiced dates build a current trail; returning after missed days quietly starts at one while all earned and historical progress remains.

**Independent Test**: Practice on consecutive dates, miss one or more dates, and
complete a return mission; verify current, best, lifetime, rewards, and welcoming
copy against the specification.

### Tests for User Story 2

- [x] T015 [P] [US2] Add consecutive-day, missed-day restart, best preservation, future-date, time-zone/clock-change, and legacy-save tests in `tests/daily-practice.test.mjs`
- [x] T016 [P] [US2] Add source contract tests that forbid punitive terms, countdowns, repair offers, and child-facing best/lifetime metrics in `tests/rendered-html.test.mjs`

### Implementation for User Story 2

- [x] T017 [US2] Add current practice-trail and welcoming re-entry child states in `app/page.tsx`
- [x] T018 [US2] Add responsive current-trail and returning-state styles in `app/globals.css`
- [x] T019 [US2] Run User Story 2 automated tests and document results in `specs/003-daily-goals-streaks/validation.md`

**Checkpoint**: Missed days create no loss, shame, or repair mechanic.

---

## Phase 5: User Story 3 — Understand Progress Without Pressure (Priority: P3)

**Goal**: Grown-ups can see today's status, current streak, best streak, and lifetime practice days while child-facing detail remains bounded.

**Independent Test**: Open the grown-up area with new, active, same-day-complete,
and returning fixtures and verify accurate plain-language values without ranking
or punitive language.

### Tests for User Story 3

- [x] T020 [P] [US3] Add grown-up summary and child/grown-up visibility-boundary source tests in `tests/rendered-html.test.mjs`

### Implementation for User Story 3

- [x] T021 [US3] Add today's status, current, best, and lifetime practice cards to the grown-up area in `app/page.tsx`
- [x] T022 [US3] Add accessible responsive grown-up practice-summary styles in `app/globals.css`
- [x] T023 [US3] Run User Story 3 automated tests and document results in `specs/003-daily-goals-streaks/validation.md`

**Checkpoint**: Full history is informative for grown-ups without pressuring the child.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate compatibility, accessibility, performance, and release readiness.

- [x] T024 [P] Run the complete lint, production build, and automated test suite and record exact totals in `specs/003-daily-goals-streaks/validation.md`
- [x] T025 [P] Measure daily status selection and recording with ten years of dates against the 5 ms goal and record results in `specs/003-daily-goals-streaks/validation.md`
- [ ] T026 Validate desktop 1280×720 home → mission → finale → grown-up journey with sound off and reduced motion and record evidence in `specs/003-daily-goals-streaks/validation.md`
- [ ] T027 Validate representative tablet portrait and landscape journeys, rotation persistence, keyboard focus, 44×44 targets, and overflow in `specs/003-daily-goals-streaks/validation.md`
- [x] T028 Review all child-facing copy for forbidden pressure terms and record the review in `specs/003-daily-goals-streaks/validation.md`
- [x] T029 Run `$wordling-release-check` and classify the feature Ready, Conditionally ready, or Not ready in `specs/003-daily-goals-streaks/validation.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational and delivers the MVP.
- **US2 (Phase 4)**: Depends on the daily status exposed by US1.
- **US3 (Phase 5)**: Depends on derived streak behavior from US2.
- **Polish (Phase 6)**: Depends on all selected user stories.

### User Story Dependency Graph

```text
Setup → Foundational → US1 (daily goal) → US2 (kind streak) → US3 (grown-up detail) → Polish
```

### Parallel Opportunities

- T002 can run alongside T001.
- T007 and T008 can run in parallel before US1 integration.
- T015 and T016 can run in parallel before US2 UI.
- T020 can be prepared independently while US2 styling is finalized.
- T024 and T025 can run in parallel after implementation.

## Parallel Example: User Story 1

```text
Task T007: Mission-completion idempotency and formula-neutral tests
Task T008: Finale and accessibility source-contract tests
```

## Parallel Example: User Story 2

```text
Task T015: Date and streak domain tests
Task T016: Child-safety source-contract tests
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Deliver US1: one mission completes today's goal once.
3. Verify no learning, reward, rescue, or map regression.
4. Add kind streaks and grown-up detail incrementally.

### Safety Rules

- Never stage or modify unrelated `specs/README.md` or `specs/wordling-rescue/`.
- Keep `practiceDays` optional and device-local.
- Do not add stars, currency, unlocks, reminders, rankings, repairs, or
  countdowns.
- Do not mark T027 complete without real viewport/device evidence.

## Format Validation

All 29 tasks use the required checkbox, sequential ID, optional parallel marker,
story label where required, actionable description, and explicit file path.

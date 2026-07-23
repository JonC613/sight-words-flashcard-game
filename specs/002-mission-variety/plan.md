# Implementation Plan: Mission Variety

**Branch**: `002-mission-variety` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-mission-variety/spec.md`

## Summary

Add Missing Letter and Word Hunt to the existing Read, Choice, and Spell mission
rotation without changing which words are selected or when they are reviewed.
Keep due/new-word scheduling in `page.tsx`, then use a dependency-free pure
JavaScript module to generate valid prompts, balance activity assignment, and
choose different-mode retries. Render both activities through the existing guarded
answer, feedback, reward, finale, save, and Adventure Map paths.

## Technical Context

**Language/Version**: TypeScript 5.9.3, JavaScript ES modules, Node.js >=22.13.0

**Primary Dependencies**: React 19.2.6, vinext 0.0.50, Next.js 16.2.6 compatibility APIs, Vite 8.0.13, Cloudflare Vite plugin 1.37.1

**Storage**: Existing browser `localStorage` key `wordling-rescue-v1`; compatible new string values in `Progress.modes`; transient mission prompts; no database, remote records, or analytics

**Testing**: Node built-in `node:test` and `assert`, production vinext build, rendered-worker smoke test, ESLint, deterministic composition fixtures, and documented tablet/accessibility/usability checks

**Target Platform**: Modern tablet browsers in portrait and landscape, responsive mobile/desktop browsers, Cloudflare Workers-hosted PWA with offline fallback

**Project Type**: Single client-heavy web application with a Cloudflare worker build

**Performance Goals**: Compose 1,000 eight-card missions with p95 below 10 ms on the supported Node runtime; show visible answer feedback within 100 ms of activation in at least 19 of 20 warm Chromium runs, excluding optional speech

**Constraints**: Preserve due/new-word selection, order, stage bounds, review intervals, mastery threshold, rewards, placement, finale, rescue, and map behavior; use introduced words only as Word Hunt distractors; support offline, storage failure, touch, keyboard, sound-off, and reduced motion; no horizontal overflow at supported tablet sizes

**Scale/Scope**: One learner save per browser profile, 128 Dolch words across three grades, missions currently bounded at 12 cards including retries, five activity types, and two new prompt presentations

## Constitution Check

*GATE: Passed before Phase 0 research and passed again after Phase 1 design.*

- **Evidence-based learning — PASS**: Missing Letter practices orthographic recall
  and Word Hunt practices visual recognition; composition runs only after the
  established scheduler, while stages, intervals, and mastery thresholds remain
  unchanged. Deterministic tests compare the selected word sequence before and
  after assignment.
- **Child safety — PASS**: Both activities reuse supportive correction, later
  retry, and existing rewards. No penalty, ranking, failure state, speed score,
  countdown, or shaming copy is introduced.
- **ADHD-friendly gamification — PASS**: The design adds two short one-goal
  interactions, guarantees bounded novelty when eligible, prevents three repeated
  modes when alternatives exist, and changes a missed new activity on retry.
- **Privacy and compatibility — PASS**: No remote data or new storage key is
  added. Old saves remain valid; only forward-compatible mode strings may be added
  to the existing progress record.
- **Inclusive tablet access — PASS**: Native buttons, visible instructions,
  >=44 px targets, keyboard focus, text feedback, sound-off operation, reduced
  motion, responsive layouts, and safe offline/storage failure behavior are
  specified.
- **Traceability and testing — PASS**: Pure prompt/composition/retry contracts map
  to FR-001–013; UI and manual matrices cover FR-014–018; existing finale and map
  tests guard reward and progression boundaries.
- **Simplicity and release safety — PASS**: The plan adds one pure rules module,
  one unit-test file, focused React/CSS integration, and no dependency, service,
  database, account, secret, or pipeline change.

## Project Structure

### Documentation (this feature)

```text
specs/002-mission-variety/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── mission-variety-state.md
│   └── mission-variety-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── mission-variety.js       # pure eligibility, prompt, composition, retry rules
├── page.tsx                 # scheduler boundary, state integration, activity UI
├── words.ts                 # existing Dolch catalog and learning order
├── globals.css              # new prompt, choice, focus, and responsive styles
├── mission-finale.js        # unchanged mission summary/reward behavior
├── adventure-map.js         # unchanged completion/map transitions
└── adventure-map-view.tsx   # unchanged map UI

tests/
├── mission-variety.test.mjs # prompt, composition, fallback, retry invariants
├── adventure-map.test.mjs   # existing progression and completion regression
├── mission-finale.test.mjs  # existing reward/summary regression
└── rendered-html.test.mjs   # production response and activity-copy smoke checks

package.json                 # include the new Node test in npm test
public/sw.js                 # existing offline shell; no planned behavior change
.github/workflows/
└── cloudflare.yml           # existing test/deploy pipeline; no planned change
```

**Structure Decision**: Keep the current single-project architecture. Isolate
deterministic activity rules in an importable JavaScript module, matching the
existing Adventure Map and mission-finale test pattern. Keep word scheduling and
all learning/reward state transitions in their current integration boundary, with
only presentation and retry-card selection delegated to the new module.

## Phase 0: Research Decisions

See [research.md](./research.md). The research resolves the scheduler boundary,
mode-history compatibility, prompt eligibility, introduced-word distractors,
balanced assignment, different-mode retries, accessibility approach, and release
pipeline. All technical unknowns are resolved.

## Phase 1: Design

- Preserve the existing ordered selected-card sequence and compose activities in a
  second pure pass.
- Extend the activity mode union while retaining the existing progress shape and
  mastery threshold.
- Generate one-position Missing Letter prompts and introduced-word-only Word Hunt
  prompts with injected randomness.
- Use constrained greedy assignment to guarantee one new activity when eligible,
  retain at least two modes, and avoid a third consecutive identical mode.
- Append a missed new word once using a different eligible activity within the
  existing retry timing and 12-card cap.
- Route all five activities through the same duplicate-guarded answer and feedback
  transition.
- Add semantic tablet controls and responsive styles without depending on audio,
  animation, network, or successful persistence.
- Extend unit and production-render tests; retain the existing build, GitHub
  Actions, and Cloudflare deployment path.

Detailed entities and transitions are in [data-model.md](./data-model.md).
Pure-state and UI contracts are in
[contracts/mission-variety-state.md](./contracts/mission-variety-state.md) and
[contracts/mission-variety-ui.md](./contracts/mission-variety-ui.md).

## Post-Design Constitution Re-check

**PASS**. The design remains scheduler-first, device-local, dependency-free,
backward compatible, accessible without sound/motion/network, and testable at the
learning, reward, retry, persistence, and mission-completion boundaries. No
complexity exception is required.

## Complexity Tracking

No constitution violations or exceptions.

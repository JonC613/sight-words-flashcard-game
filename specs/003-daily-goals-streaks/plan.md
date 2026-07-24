# Implementation Plan: Gentle Daily Goals and Streaks

**Branch**: `003-daily-goals-streaks` | **Date**: 2026-07-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-daily-goals-streaks/spec.md`

## Summary

Add one-mission daily goals and a forgiving practice streak using unique local
calendar practice dates stored in the existing device-local save. Pure domain
functions derive today's status, current streak, best streak, and lifetime days;
the existing duplicate-safe mission completion boundary records dates. Child UI
shows today's goal and current practice trail, the finale acknowledges the first
daily completion, and the grown-up area shows full history without changing any
learning, reward, rescue, or map formula.

## Technical Context

**Language/Version**: TypeScript/TSX application code with Cloudflare-compatible ESM JavaScript domain modules; Node.js 22 build target

**Primary Dependencies**: React 19, vinext, Next 16 compatibility layer; no new dependencies

**Storage**: Existing `wordling-rescue-v1` browser-local JSON save with one optional `practiceDays` array

**Testing**: Node built-in test runner, ESLint, vinext production build, documented browser/tablet checks

**Target Platform**: Modern desktop and tablet browsers, Cloudflare Workers PWA, offline-capable after load

**Project Type**: Single tablet-first web application

**Performance Goals**: Daily-practice selection and recording complete synchronously within 5 ms for ten years of practice dates on a representative development machine; no perceptible mission-finale delay

**Constraints**: Anonymous and device-local; no server clock, accounts, analytics, notifications, new reward economy, punitive copy, or changes to spaced repetition

**Scale/Scope**: One learner save per browser profile; at most one date entry per practiced calendar day; three child-facing surfaces and focused grown-up summary

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1.*

- **Evidence-based learning — PASS**: The feature rewards completion of one bounded active-recall mission and leaves scheduling, mastery, retries, and word selection unchanged. Regression tests protect those formulas.
- **Child safety — PASS**: Missed days remove nothing; copy forbids failure, broken-streak, repair, urgency, ranking, and countdown language.
- **ADHD-friendly gamification — PASS**: One mission is a short visible finish line, daily recognition is bounded, stopping is explicitly allowed, and re-entry is welcoming.
- **Privacy and compatibility — PASS**: One optional local date list extends the existing save; normalization safely handles legacy and malformed values.
- **Inclusive tablet access — PASS**: Text carries status without color or sound, reduced motion is respected, and portrait/landscape journeys have release checks.
- **Traceability and testing — PASS**: Pure date and streak behavior, duplicate completion, formula neutrality, persistence, source contracts, and manual tablet states map to requirements.
- **Simplicity and release safety — PASS**: One small domain module, existing mission boundary, existing UI surfaces, zero dependencies, standard CI/PR/Cloudflare release.

## Project Structure

### Documentation (this feature)

```text
specs/003-daily-goals-streaks/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── spec.md
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── daily-practice-state.md
│   └── daily-practice-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── daily-practice.js       # Pure date normalization, selection, and recording
├── adventure-map.js        # Duplicate-safe accepted mission completion boundary
├── page.tsx                # Child goal, finale acknowledgment, grown-up summary
└── globals.css             # Responsive, accessible goal and streak presentation

tests/
├── daily-practice.test.mjs # Domain and compatibility cases
├── adventure-map.test.mjs  # Completion idempotency and reward/map neutrality
├── mission-finale.test.mjs # Finale reward neutrality
└── rendered-html.test.mjs  # UI and accessibility source contracts
```

**Structure Decision**: Preserve the existing single web application and its
plain ESM domain-module pattern. Daily-practice rules remain independently
testable outside React, while `page.tsx` composes derived status into existing
views.

## Phase 0 Research Result

All technical questions are resolved in [research.md](research.md): local date
keys, calendar-ordinal comparisons, accepted-completion integration, recognition
without a reward economy, split child/grown-up detail, and optional-field repair.
No `NEEDS CLARIFICATION` items remain.

## Phase 1 Design Result

- [data-model.md](data-model.md) defines persisted practice dates, derived status,
  accepted-completion inputs, state transitions, and repair rules.
- [daily-practice-state.md](contracts/daily-practice-state.md) defines pure domain,
  completion, and compatibility contracts.
- [daily-practice-ui.md](contracts/daily-practice-ui.md) defines child, finale,
  grown-up, responsive, and accessibility contracts.
- [quickstart.md](quickstart.md) defines implementation order and release gates.

## Post-Design Constitution Re-check

**PASS**. Design introduced no service, database, dependency, account, analytics,
notification, second reward economy, or learning-rule change. Full-date history
is justified as the simplest repairable source of truth and remains bounded to
one short value per practiced day.

## Complexity Tracking

No constitution violations or exceptions.
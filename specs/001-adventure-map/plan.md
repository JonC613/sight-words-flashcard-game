# Implementation Plan: Adventure Map

**Branch**: `001-adventure-map` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-adventure-map/spec.md`

## Summary

Add a tablet-first Adventure Map view to the existing Wordling Rescue client application. One completed mission advances one visible step; two steps unlock one of five locations in the active story world. Map choice remains independent of the learning scheduler. An optional, versioned `adventureMap` record extends the existing `wordling-rescue-v1` device-local save, with deterministic migration and normalization. Pure JavaScript transition functions keep migration, progression, world choice, story state, and duplicate-completion protection independently testable.

## Technical Context

**Language/Version**: TypeScript 5.9.3, JavaScript ES modules, Node.js >=22.13.0

**Primary Dependencies**: React 19.2.6, vinext 0.0.50, Next.js 16.2.6 compatibility APIs, Vite 8.0.13, Cloudflare Vite plugin 1.37.1

**Storage**: Browser `localStorage` under the existing `wordling-rescue-v1` key; compiled static map/story content; no D1, R2, server records, or analytics

**Testing**: Node built-in `node:test` and `assert`, production vinext build, rendered Cloudflare worker smoke test, ESLint, documented tablet/accessibility and performance checks, and an anonymous aggregate child-usability check

**Target Platform**: Modern tablet browsers in portrait and landscape, responsive mobile/desktop browsers, Cloudflare Workers-hosted PWA with offline fallback

**Project Type**: Single client-heavy web application with a Cloudflare worker build

**Performance Goals**: In Chromium tablet emulation at 768×1024 with 4× CPU slowdown and a warm local production build, show the saved map within 1 second of navigation and update visible control status within 100 ms, excluding optional animation, in at least 19 of 20 measured runs

**Constraints**: Preserve learning and placement algorithms; retain anonymous device-local storage; tolerate missing, invalid, unavailable, or full storage; support touch and keyboard; respect reduced motion; keep map-to-mission flow within two actions

**Scale/Scope**: One learner save per browser profile, three worlds, five locations and ten steps per world, static story content, and an existing rescue history that may grow over time

## Constitution Check

*GATE: Passed before Phase 0 research and passed again after Phase 1 design.*

- **Evidence-based learning — PASS**: Map transitions consume completed-mission events but never feed word selection, stages, mastery, placement, or review timing.
- **Child safety — PASS**: Progress rewards completion rather than speed or accuracy; copy and return flows contain no loss, ranking, scarcity, or missed-day pressure.
- **ADHD-friendly gamification — PASS**: Every mission has one visible step, every two missions have one bounded location reveal, only one next destination is emphasized, and story/world choices are brief and dismissible or deferrable where safe.
- **Privacy and compatibility — PASS**: The existing storage key remains; the new record is optional, versioned, normalized, and seeded without changing legacy learning, placement, statistics, stars, or rescue records.
- **Inclusive tablet access — PASS**: The design uses semantic HTML controls, >=44 px touch targets, keyboard operation, text labels in addition to color, zoom support, reduced-motion fallbacks, and static offline content.
- **Traceability and testing — PASS**: Pure map transitions map directly to FR-004 through FR-018, with unit tests for migration, boundaries, idempotency, and world choices plus production-render and manual accessibility evidence.
- **Simplicity and release safety — PASS**: The design adds no service, database, account, analytics, or runtime dependency and uses the existing build/test/deploy pipeline.

## Project Structure

### Documentation (this feature)

```text
specs/001-adventure-map/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── adventure-map-state.md
│   └── adventure-map-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── adventure-map.js       # catalog, normalization, selectors, pure transitions
├── adventure-map.tsx      # map, story, and world-choice UI
├── globals.css            # responsive trail, dialog, focus, and motion styles
├── layout.tsx             # zoom-capable viewport metadata
├── mission-finale.js      # existing mission summary logic
└── page.tsx               # save integration, navigation, mission/placement events

tests/
├── adventure-map.test.mjs # migration, progression, selectors, and idempotency
├── mission-finale.test.mjs
└── rendered-html.test.mjs

public/
└── sw.js                  # existing offline shell behavior

.github/workflows/
└── cloudflare.yml         # existing npm test and deployment gate
```

**Structure Decision**: Keep the current single-project layout. Isolate deterministic map rules in an importable JavaScript module so the existing Node test runner can test them without adding a browser test framework. Keep rendering in a focused React component and limit integration changes to `page.tsx`, global styles, and viewport metadata.

## Phase 0: Research Decisions

See [research.md](./research.md). All technical unknowns are resolved and the design has no open planning questions.

## Phase 1: Design

- Add a static catalog with stable world, location, and story identifiers.
- Add an optional versioned map record to the existing save and normalize it once during hydration.
- Derive unlocked/current/next location state from bounded step counts.
- Apply mission completion, rescue creation, session increment, the existing completion
  bonus only, and map advancement in one pure, idempotent transition keyed by a stable
  mission completion ID; preserve the existing per-answer star updates unchanged.
- Persist a placement-world suggestion until the child chooses Stay or Switch.
- Present unviewed unlocked stories sequentially and mark them viewed only on close.
- Keep residents derived from existing rescue records and stable ordering.
- Render the trail as semantic HTML; artwork remains decorative.

Detailed entities and transitions are in [data-model.md](./data-model.md). State and interaction contracts are in [contracts/adventure-map-state.md](./contracts/adventure-map-state.md) and [contracts/adventure-map-ui.md](./contracts/adventure-map-ui.md).

## Post-Design Constitution Re-check

**PASS**. The design remains device-local, dependency-free, scheduler-independent, accessible without sound/color/motion/network, backward compatible, and testable at all reward and persistence boundaries. No complexity exception is required.

## Complexity Tracking

No constitution violations or exceptions.

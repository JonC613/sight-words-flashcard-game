# Research: Adventure Map

## Decision 1: Extend the existing client-only architecture

**Decision**: Add a `map` view to the existing client-side `View` state, a focused React map component, and a pure JavaScript rules module. Keep deployment on the current vinext/Cloudflare pipeline.

**Rationale**: The application already uses one client component, local view state, and device-local persistence. This is the smallest reviewable change and introduces no new privacy or operational surface.

**Alternatives considered**:

- A separate route and state store: rejected because it adds coordination without a multi-page requirement.
- D1 or another server store: rejected because cloud records, identity, and synchronization are out of scope.
- An SVG- or canvas-only map: rejected because semantic HTML controls provide better keyboard access, reflow, labeling, and testability. Decorative SVG may still sit behind the HTML trail.

## Decision 2: Add one optional, versioned map record

**Decision**: Extend `wordling-rescue-v1` with optional `adventureMap: { version: 1, activeWorld, worlds, pendingPlacementWorld?, lastCompletionId? }`. Keep location/story definitions in compiled static content.

**Rationale**: Optional fields preserve old saves. A version and normalizer allow partial or corrupt map state to recover without changing legacy learning data.

**Alternatives considered**:

- A new storage key: rejected because two independently written records can drift.
- Persisting complete location objects: rejected because catalog content is static and would create migration burden.
- Reusing `placement.startingGrade` as the active map world: rejected because the child may stay or switch after rechecks and map choice must not alter learning.

## Decision 3: Use deterministic migration and repair

**Decision**: When placement is complete and the map record is absent, seed `min(valid sessions, 10)` steps only into the placement world, set other worlds to zero, mark seeded unlocked stories as already viewed, and preserve every existing legacy field. If placement is absent, keep the map uninitialized and show the preview. Normalize later records by validating world IDs, clamping steps to 0–10, filtering/deduplicating story IDs, and defaulting missing world entries.

**Rationale**: `sessions` is the existing reliable completed-mission count. The rule matches the clarified import behavior and prevents a cascade of old story dialogs after upgrade.

**Alternatives considered**:

- Distributing sessions across all worlds: rejected by clarification.
- Starting every existing learner from zero: rejected because it fails to recognize prior missions.
- Inferring placement from progress or rescues: rejected because the specification requires Placement Quest to choose the starting trail.

## Decision 4: Derive map state instead of duplicating it

**Decision**: Store only each world's `steps` and `viewedStoryIds`. Derive unlocked locations as `floor(steps / 2)`, the halfway state as `steps % 2`, the next location from the unlocked count, world completion at 10 steps, and full completion when all three worlds equal 10.

**Rationale**: Derived state makes one-step advancement and two-step unlock boundaries deterministic and prevents conflicting persisted flags.

**Alternatives considered**:

- Persisting `unlockedLocations`, `currentPosition`, and `nextLocation`: rejected because all are functions of the same bounded counter.
- Variable pacing: rejected by the two-missions-per-location clarification.

## Decision 5: Make mission completion one idempotent transition

**Decision**: Generate a stable mission ID when a mission starts. A pure `completeMission(save, event)` transition checks `lastCompletionId` and, only once, applies the session increment, rescue, completion bonus, and eligible map step in one functional save update. Retain the existing `finalizing` ref and disable completion controls for immediate tap protection.

**Rationale**: One atomic transition prevents duplicate steps, locations, rescues, or statistics and is directly testable. The stable ID protects more durably than a render-local ref alone.

**Alternatives considered**:

- A separate map update after the mission save: rejected because interruption could produce partial state.
- An unbounded processed-ID ledger: rejected because only one mission can be active and the most recent completion ID is sufficient.
- Relying only on animation completion or UI disabling: rejected because persistence must not depend on presentation timing.

## Decision 6: Preserve rescue records and derive residency

**Decision**: Keep the existing `{ id, world, rescuedAt }` rescue shape. New rescues use the cosmetic `activeWorld`. Within a world, stable-sort by `(rescuedAt, id)` and assign residents deterministically among unlocked locations; once all locations are unlocked, distribute additional residents round-robin. Do not mutate legacy rescues.

**Rationale**: Existing rescue records already contain stable identity and world association. Derived placement satisfies revisiting without another migration field.

**Alternatives considered**:

- Adding `locationId` to every rescue: rejected until a future feature requires moving or customizing residents.
- Reassigning old rescues to the active world: rejected because it would rewrite prior accomplishments.

## Decision 7: Use semantic, tablet-first interaction states

**Decision**: Render each trail as a labeled ordered list of native location buttons. Use visible states (`Reached`, `You are here`, `Next`, `Locked`), `aria-current="step"`, a text progress summary, and a polite live region for newly awarded progress. At wide tablet sizes use a trail/detail split; below 900 px stack the trail vertically. Use at least 44 px targets and remove the viewport's maximum zoom restriction.

**Rationale**: The map remains understandable without color, sound, animation, or precision pointing and works in portrait and landscape.

**Alternatives considered**:

- Color/icon-only state: rejected by accessibility requirements.
- A fixed landscape map scaled down on phones: rejected because it would create small targets and horizontal clipping.

## Decision 8: Sequence story and world-choice surfaces

**Decision**: After returning from the finale, show the committed map state first. If a location was newly unlocked, show one accessible story dialog; after it closes, show any world-completion choice. Never stack dialogs. Revisited stories do not mutate progress. Persist `pendingPlacementWorld` so the exact Stay/Switch choice survives reload; placement updates immediately regardless of the map choice.

**Rationale**: A single short decision at a time supports focus, avoids duplicate rewards, and preserves the clarified placement behavior.

**Alternatives considered**:

- Showing story and world choice together: rejected as unnecessarily dense.
- Clearing a placement prompt on reload: rejected because the required choice could disappear.
- Making story dismissal award progress: rejected because completion already owns the reward.

## Decision 9: Keep the existing test stack

**Decision**: Test map catalog, migration, normalization, selectors, mission completion, idempotency, story viewing, and world choices using `node:test` against the pure JavaScript module. Extend the rendered-worker smoke test and keep `npm run lint` plus `npm test` as automated gates. Use a focused manual browser matrix for keyboard, screen-reader semantics, reduced motion, storage failure, offline use, and tablet layouts.

**Rationale**: The repository has no DOM test framework. Pure rules cover the highest-risk behavior without adding dependencies or browser binaries.

**Alternatives considered**:

- Playwright and axe in this feature: deferred because their setup cost is disproportionate to the current repository; reconsider if interactive browser regressions become frequent.
- Relying only on rendered HTML: rejected because it cannot verify localStorage hydration or interaction transitions.

## Decision 10: Reuse the existing release pipeline

**Decision**: Keep `.github/workflows/cloudflare.yml`: `npm ci`, `npm test` (which builds), and deploy on `master` when Cloudflare secrets are present. No infrastructure change is required.

**Rationale**: The feature is static/client-side and requires no new binding or secret.

**Alternatives considered**:

- A feature-specific deployment job: rejected because the established pipeline already verifies pull requests and deploys merged production changes.

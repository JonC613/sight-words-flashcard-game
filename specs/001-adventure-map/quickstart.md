# Quickstart: Adventure Map

## Prerequisites

- Node.js 22.13 or newer
- Existing repository dependencies installed with `npm ci`
- Feature branch `001-adventure-map`

No database, Cloudflare binding, account, analytics service, or new runtime dependency is required.

## Planned implementation sequence

1. Add the pure catalog, normalization, selector, and transition functions in `app/adventure-map.js`.
2. Add `tests/adventure-map.test.mjs` and include it explicitly in the `npm test` script.
3. Add the semantic map, story, and world-choice UI in `app/adventure-map.tsx`.
4. Extend `Save`, navigation, placement completion, and mission completion in `app/page.tsx`.
5. Add responsive/reduced-motion styles in `app/globals.css` and restore browser zoom in `app/layout.tsx`.
6. Extend the rendered-worker smoke test.
7. Run automated and manual acceptance checks before opening a pull request.

## Local development

```powershell
npm ci
npm run dev
```

Open the local URL printed by vinext in a tablet-sized browser viewport. Use browser developer tools to inspect and replace the `wordling-rescue-v1` localStorage record for migration fixtures.

## Automated verification

```powershell
npm run lint
npm test
```

`npm test` performs the production build before running Node tests. The Adventure Map test file must cover:

- Missing placement preview behavior.
- Legacy migration with session counts 0, 1, 9, 10, 11, and a large value.
- Preservation of stars, sessions, word progress, placement, and rescue records.
- Partial/corrupt map repair and normalization idempotency.
- One step for completion and zero for abandonment.
- First-step versus second-step location boundaries.
- Ten-step world and thirty-step full-map boundaries.
- Duplicate completion IDs producing no duplicate mutation.
- Exactly one next destination.
- Story close/revisit behavior without rewards.
- Placement recheck Stay and Switch behavior.
- Post-full-completion rescue residency with zero new steps.

The rendered-worker smoke test confirms the production response includes Adventure Map entry/preview semantics. It does not substitute for hydrated interaction testing.

## Manual fixture matrix

| Fixture | Expected result |
|---|---|
| Fresh save, no placement | Friendly map preview and one Placement Quest action |
| Placement complete, 0 sessions | Active starting world at step 0 with one next destination |
| Legacy save, 1 session | Current marker halfway to location 1; no location story unlock |
| Legacy save, 2 sessions | Location 1 unlocked; seeded story available for revisit without auto-popup |
| Legacy save, 10 sessions | Current placement world complete; excess statistics untouched |
| Legacy save, >10 sessions | Current world capped at 10; other worlds remain at 0 |
| Partial invalid map | Values clamp/filter safely; unrelated legacy data remains |
| Step 9 mission completion | Step 10 and fifth location unlock exactly once |
| Active world complete | World choice appears before another mission can start |
| All worlds complete | Later mission adds one resident and zero steps/locations |
| Placement recheck | Learning result saves first; exactly Stay/Switch choices appear |
| Repeated completion action | One session, rescue, map step, and story eligibility |
| Storage unavailable/full | Practice continues in memory with supportive status |

## Tablet and accessibility check

Test at minimum:

- 768×1024 portrait
- 1024×768 landscape
- 320 px narrow smoke viewport

Verify:

- No trail, story, choice, or navigation content clips or overlaps.
- Current position and one next destination can be identified without color.
- Map-to-mission requires no more than two actions.
- Touch targets are at least 44 px.
- Keyboard order is logical; all actions support Enter/Space; dialogs support Escape.
- Focus is visible and returns to the activating location after a story closes.
- Dialog name, location states, progress, and live updates are understandable in the accessibility tree.
- User zoom works.
- With reduced motion enabled, state appears immediately without travel/reveal effects.
- With sound disabled or speech synthesis unavailable, all instructions remain visible.
- After warming the service worker, an offline reload keeps map content and practice entry usable.
- Returning after time away shows no missed-day or streak-loss message.

## Requirement trace checkpoints

- **P1 / FR-001–003, FR-011–015**: entry, migration, persistence, preview, accessibility.
- **P2 / FR-004–008, FR-016–018**: progression, two-step unlocks, stories, world completion.
- **P3 / FR-009–010**: residents, revisiting, and placement recheck choices.

## Release gate

The existing GitHub Actions workflow runs `npm ci` and `npm test` for pull requests. After review and merge to `master`, the same workflow deploys through the configured Cloudflare credentials. Confirm the production map, save migration, and offline shell after deployment.

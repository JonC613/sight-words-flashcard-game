# Data Model: Adventure Map

## Overview

Adventure Map extends the existing anonymous device-local save. The existing storage key and legacy fields remain authoritative for learning, placement, statistics, stars, and rescue history. Map state is optional and versioned.

## Stable identifiers

### WorldId

Uses the existing `Grade` values:

- `First` → Whispering Woods
- `Second` → Crystal Caves
- `Third` → Skyward Peaks

`WorldId` is a story/map identifier inside Adventure Map. It MUST NOT be read by the word scheduler or mastery logic.

### LocationId and StoryId

Each world catalog contains five stable location IDs and one stable story ID per location. IDs are code constants, not display names. Renaming visible content therefore does not invalidate saved viewed-story references.

## Persisted entities

### Existing Save (extended)

```ts
type Save = {
  name: string;
  stars: number;
  sessions: number;
  sound: boolean;
  progress: Record<string, Progress>;
  placement?: Placement;
  rescues?: Rescue[];
  adventureMap?: AdventureMapV1;
};
```

All existing fields retain their current meaning. `adventureMap` is optional so an old save remains valid.

### AdventureMapV1

```ts
type AdventureMapV1 = {
  version: 1;
  activeWorld: Grade;
  worlds: Record<Grade, WorldProgress>;
  pendingPlacementWorld?: Grade;
  lastCompletionId?: string;
};
```

| Field | Rule |
|---|---|
| `version` | Exactly `1` for this design |
| `activeWorld` | Valid `Grade`; controls story/map setting only |
| `worlds` | Exactly one normalized entry for each world |
| `pendingPlacementWorld` | Optional valid world suggested by the latest placement recheck |
| `lastCompletionId` | Optional ID of the most recently applied mission completion event |

### WorldProgress

```ts
type WorldProgress = {
  steps: number;
  viewedStoryIds: string[];
};
```

| Field | Rule |
|---|---|
| `steps` | Integer from 0 through 10 |
| `viewedStoryIds` | Unique IDs belonging to unlocked locations in this world |

Do not persist unlocked location count, current location, next location, completion flags, percentages, or resident assignments; these are derived.

### Rescue (unchanged)

```ts
type Rescue = {
  id: string;
  world: Grade;
  rescuedAt: number;
};
```

Legacy rescue objects MUST remain byte-for-byte semantically compatible. New rescue `world` values use the map's cosmetic `activeWorld`, not placement difficulty.

### MissionCompletionEvent

This is an in-memory command, not an independently stored collection.

```ts
type MissionCompletionEvent = {
  id: string;
  completedAt: number;
  rescue: Rescue;
  completionStars: number;
};
```

The ID is created once when the mission starts and reused through completion. Applying an event whose ID equals `lastCompletionId` returns the save unchanged.

## Static catalog entity

```ts
type MapLocation = {
  id: string;
  world: Grade;
  order: 1 | 2 | 3 | 4 | 5;
  name: string;
  storyId: string;
  storySentences: string[];
};
```

Validation rules:

- Each world has exactly five locations with orders 1–5.
- IDs and story IDs are unique.
- Each story contains one to three short sentences.
- Content ships in the application and requires no network request.

## Derived state

For a normalized world's `steps`:

```text
unlockedCount = floor(steps / 2)
halfwayToNext = steps < 10 and steps % 2 == 1
nextLocationIndex = steps < 10 ? floor(steps / 2) : none
worldComplete = steps == 10
fullMapComplete = every world has steps == 10
```

Location states:

- Orders `<= unlockedCount`: `unlocked`.
- The highest unlocked location may additionally be `current` when the world is active and complete at that milestone.
- Order `unlockedCount + 1`: exactly one `next` destination when the world is active and incomplete.
- Later orders: `locked`.
- With an odd step, the learner marker is visually between the last unlocked and next location; text still names exactly one next destination.

The next story is the first unlocked story ID absent from `viewedStoryIds`. Only one is presented at a time.

## Resident derivation

1. Group rescues by `rescue.world`.
2. Stable-sort each group by `rescuedAt`, then `id`.
3. Assign each rescue deterministically to a location ordinal in that world.
4. Before all five locations unlock, render only assignments whose location is unlocked; a newly rescued traveling Wordling may be represented with the learner marker until its first home unlocks.
5. With five unlocked locations, distribute later residents round-robin across all five.

Resident assignment never changes learning state and never awards another reward.

## Migration and normalization

### Legacy save with no completed placement

- Leave `adventureMap` absent.
- Preserve all legacy fields.
- Show the friendly map preview and Placement Quest action.

### Legacy save with completed placement

Create `AdventureMapV1`:

- `activeWorld = placement.startingGrade`.
- `worlds[activeWorld].steps = clamp(trunc(valid sessions), 0, 10)`.
- Other world steps equal `0`.
- Seeded unlocked story IDs are marked viewed so upgrading does not open several dialogs; stories remain revisitable.
- `lastCompletionId` and `pendingPlacementWorld` are absent.
- No legacy field or rescue is changed, and sessions above 10 remain preserved.

### Partial or invalid V1 map

- Validate object and version before reading nested fields.
- Clamp finite step values to integer 0–10; invalid values become 0.
- Supply all three world records.
- Filter/deduplicate story IDs against the correct world's catalog and unlocked locations.
- Validate `activeWorld`; fall back to completed placement world, otherwise `First` for in-memory safety.
- Drop invalid `pendingPlacementWorld` and invalid/empty `lastCompletionId`.
- Never reseed from sessions when any valid V1 map exists; preserve its normalized per-world progress.
- Never discard valid legacy save fields because the map record is malformed.

Storage read, parse, or write failure returns a usable normalized in-memory state and a non-shaming status; it MUST NOT block reading practice.

## State transitions

| Event | Preconditions | Transition | Invariants |
|---|---|---|---|
| Initial placement completes | No map exists | Initialize map from placement and existing sessions | Learning placement remains authoritative only for learning |
| Mission starts | Active world incomplete, or full map complete | Create one stable mission ID | No progress is awarded |
| Mission abandons | Mission not completed | Discard active mission ID | Zero map steps and zero rescues |
| Mission completes | New completion ID | Atomically add session/rescue/stars and either add one active-world step or, after full completion, add no step | Exactly-once behavior; accuracy/speed irrelevant |
| Duplicate completion | ID equals `lastCompletionId` | Return save unchanged | No duplicate session, rescue, step, story, or location |
| First step toward location | Active steps are even and below 10 | Increment to odd step | Location remains next |
| Second step toward location | Active steps are odd and below 10 | Increment to even step | Exactly one location becomes unlocked |
| Story closes | Story is unlocked and unviewed | Add story ID once | No reward or progress mutation |
| World completes | Active steps become 10 and another world is incomplete | Expose world-choice state after story | Existing progress remains unchanged |
| World selected | Selected world is valid | Set `activeWorld`; clear relevant choice state | Scheduler and placement unchanged |
| Placement recheck completes | Placement result is valid | Update placement immediately; set `pendingPlacementWorld`; retain active world | Map progress and scheduler remain separate |
| Stay after recheck | Suggestion pending | Clear suggestion only | Active world unchanged |
| Switch after recheck | Suggestion pending | Set active world to suggestion; clear suggestion | Learning placement already applied |
| All worlds complete | Total steps equal 30 | Later completion adds rescue to active world and no step | All 15 locations remain unlocked |

If corrupted state has an active completed world while another world is incomplete, the UI gates the next mission behind choosing an incomplete world. The defensive transition does not silently spill a step into another world.

## Global invariants

- Total map steps are integers from 0 through 30.
- No world exceeds 10 steps or five unlocked locations.
- Before full completion, every valid completed mission advances exactly one step.
- Every second step unlocks exactly one location.
- Map world selection never changes word progress, mastery, placement scoring, or review due dates.
- Existing stars, sessions, progress, placement, and rescues survive migration.
- Stories and revisits never create rewards.
- All persistence remains anonymous and device-local.

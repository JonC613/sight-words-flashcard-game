# Contract: Adventure Map State Module

The pure state module is imported by `app/page.tsx`, `app/adventure-map.tsx`, and Node tests. It performs no DOM, storage, speech, animation, network, or clock access. Callers provide time and IDs explicitly.

## Catalog export

```js
export const WORLD_CATALOG;
```

Guarantees:

- Contains `First`, `Second`, and `Third`.
- Each world contains exactly five ordered locations.
- Location and story IDs are globally stable and unique.
- Every story has at most three sentences.

## `normalizeAdventureMap`

```js
normalizeAdventureMap(save) => Save
```

Behavior:

- Returns a new normalized save without mutating input.
- Leaves map absent when placement is incomplete.
- Seeds a missing map only in the completed placement world with at most ten existing sessions.
- Repairs a partial V1 map by clamping steps and filtering story IDs.
- Preserves all legacy save fields and rescue objects.
- Is idempotent: normalizing an already normalized result produces a deep-equal result.
- Never throws for `null`, arrays, malformed nested map data, or non-finite numeric values accepted from parsed storage.

## `selectAdventureMap`

```js
selectAdventureMap(save) => {
  status: "preview" | "active" | "complete";
  activeWorld?: Grade;
  worlds: WorldView[];
  nextDestination?: LocationView;
  pendingStory?: StoryView;
  pendingPlacementWorld?: Grade;
  requiresWorldChoice: boolean;
}
```

Guarantees:

- Exactly one next destination exists when the active world is incomplete.
- `requiresWorldChoice` is true when the active world is complete and another world is incomplete.
- No selector mutates or persists state.
- All labels required to understand current, next, reached, and locked states are available without color.

## `completeMission`

```js
completeMission(save, {
  id,
  completedAt,
  rescue,
  completionBonusStars,
}) => Save
```

Preconditions:

- `id` is a non-empty stable ID created when the mission starts.
- The caller has completed every mission card.
- If the active world is complete and another world is not, the caller must obtain a world choice before starting the mission.

Behavior:

- If `id` equals `adventureMap.lastCompletionId`, returns the input save unchanged.
- Otherwise atomically increments `sessions`, adds `completionBonusStars` exactly once,
  appends exactly one rescue, records the ID, and:
  - increments the active world's steps once when the full map is incomplete; or
  - adds no step when all worlds are complete.
- Ignores answer accuracy, duration, and stars when deciding map progress.
- Requires `completionBonusStars` to equal the existing bonus of 5 and leaves all
  previously awarded per-answer stars unchanged.
- Never increments another world implicitly.

## `markStoryViewed`

```js
markStoryViewed(save, storyId) => Save
```

Behavior:

- Adds an unlocked story ID to its world's viewed list once.
- Returns unchanged state for unknown, locked, or already-viewed stories.
- Never changes steps, rewards, sessions, rescues, or learning data.

## `chooseWorld`

```js
chooseWorld(save, world) => Save
```

Behavior:

- Accepts a valid story world.
- When a completed active world blocks new progress, accepts only an incomplete world unless all worlds are complete.
- Changes only `adventureMap.activeWorld` and relevant pending choice state.
- Never changes placement or learning fields.

## `recordPlacementSuggestion`

```js
recordPlacementSuggestion(save, suggestedWorld) => Save
```

Behavior:

- Called in the same placement-result update that applies the new learning placement.
- Keeps `activeWorld` and all world progress unchanged.
- Persists `pendingPlacementWorld` when the suggestion differs from the current story world.

## `resolvePlacementSuggestion`

```js
resolvePlacementSuggestion(save, "stay" | "switch") => Save
```

Behavior:

- `stay`: clears the pending suggestion only.
- `switch`: sets `activeWorld` to the pending suggestion, then clears it.
- Both choices preserve every world step, story, resident, and learning field.
- With no pending suggestion, returns unchanged state.

## Storage boundary

Storage access stays outside this module:

```js
load -> parse safely -> normalizeAdventureMap -> render
state transition -> serialize safely -> continue even if write fails
```

The application continues in memory when `localStorage` is unavailable, parsing fails, or quota is exceeded. Storage errors use a non-shaming visible status and never reinterpret learning progress.

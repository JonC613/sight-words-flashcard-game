# Contract: Adventure Map UI

## Entry points

| Source | Action | Destination |
|---|---|---|
| Bottom navigation | Select `Map` | Adventure Map or placement preview |
| Home journey/world card | Select card | Adventure Map focused on that available world |
| Initial placement result | Enter named world | Adventure Map in the placed starting world |
| Mission finale | `Return to my trail` | Adventure Map with committed step/unlock state |
| Mission finale | `Visit my Wordlings` | Existing collection |
| Adventure Map | `My Wordlings` | Existing collection |

The bottom navigation remains four items by replacing the current Wordlings slot with Map. Collection remains reachable from Map, home/finale links, and does not lose existing data.

## Preview state

When placement is incomplete:

- Show decorative map artwork and concise explanation.
- Show one primary `Find your starting trail` action.
- Do not guess a world from word progress, sessions, or rescues.
- Keep the rest of the application usable.

## Active map state

The screen provides:

- One `<h1>` naming the active story world.
- Text progress such as `3 of 10 trail steps`.
- A semantic ordered list containing five location nodes.
- Visible text for `Reached`, `You are here`, `Next`, and `Locked` states.
- Exactly one next destination while the active world is incomplete.
- Native buttons for unlocked/revisitable and next locations; future locked locations are disabled or noninteractive.
- `aria-current="step"` on the learner's current position.
- One obvious action to begin/resume practice within two actions from opening Map.
- A `My Wordlings` action and a bounded world switcher for available story worlds.

Color, artwork, connecting rails, and character position supplement the labels; they never carry the only meaning.

## Responsive layout

- At 900 px and wider, use a trail/detail split within the existing maximum content width.
- Below 900 px, stack content and use a vertical trail.
- Verify 768×1024 portrait, 1024×768 landscape, and a 320 px narrow smoke case.
- Interactive targets are at least 44×44 CSS pixels.
- Story text is at least 16 px and location status labels are not rendered with the app's existing 9–11 px decorative-label sizes.
- `.app.map` permits vertical scrolling and includes bottom safe space for fixed navigation.
- The viewport allows user zoom; `maximumScale: 1` is removed.

## Progress announcement

After the finale returns to Map:

- Render the persisted state immediately.
- Announce one concise status in a polite live region, such as `One trail step added` or `[Location] reached`.
- Do not replay the announcement on ordinary reopen.
- Animation is optional presentation and never controls persistence or dialog timing.

## Story dialog

Trigger: the first unlocked story absent from `viewedStoryIds`.

Requirements:

- Show only one dialog at a time.
- Use an accessible modal dialog implementation with a named heading.
- Contain no more than three short sentences.
- Provide a clear `Keep exploring`/close action and Escape support.
- Mark the story viewed only when it closes.
- Return focus to the location that opened or unlocked it.
- Revisiting the unlocked location reopens its story without changing progress or rewards.
- If several unviewed stories exist after repair, queue them in trail order rather than stacking them.

## World-completion choice

After the fifth-location story closes:

- Show incomplete destination worlds by story name and setting, not grade or difficulty.
- Selecting a world changes only `activeWorld`.
- Preserve all progress in the completed world.
- Do not add a countdown, rarity, loss warning, or recommended/difficult label.
- The offer remains available on Map if the learner visits another non-practice view.
- Before another mission starts, an incomplete world must be selected so a valid completion never loses its required map step.
- When all worlds are complete, permit choosing any world and explain that future rescues will live there; no location resets.

## Placement recheck choice

The placement result applies learning placement immediately, then shows exactly two actions:

1. `Stay in [current story world]`
2. `Switch to [suggested story world]`

Both actions lead to Map, clear the persisted suggestion, preserve all world progress, and have no effect on word selection, mastery, or review timing. Do not add a third dismiss action. If the suggested and current worlds match, explain that the trail still fits and resolve without changing map progress.

## Full-map completion state

- All fifteen locations remain visibly reached and revisitable.
- No next-location claim is shown.
- The currently chosen world remains visible.
- Each later mission's new Wordling appears in that world.
- No step, duplicate location, reset, prestige loop, or completion pressure is introduced.

## Accessibility and fallback behavior

- All actions work with touch, Tab, Shift+Tab, Enter, Space, and Escape where applicable.
- Focus is visible and follows dialog open/close logically.
- Essential text does not depend on speech synthesis, sound, network, service worker, or animation.
- With `prefers-reduced-motion: reduce`, suppress travel, route drawing, popping, bobbing, and sparkle transforms; state and live text remain identical.
- Storage failure keeps the current in-memory journey usable and displays supportive status without blaming the learner.
- Rapid repeated activation disables the committing control and produces one state transition.

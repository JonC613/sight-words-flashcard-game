# Manual Release Matrix

Use the smallest matrix that covers the changed behavior. Record actual evidence in the active feature's `validation.md`.

## Required for UI or Interaction Changes

| Area | Checks |
|---|---|
| Desktop | 1280×720 or larger; no unintended horizontal overflow; primary path completes |
| Tablet landscape | Representative tablet landscape viewport; controls remain visible and reachable |
| Tablet portrait | Representative tablet portrait viewport; content reflows without clipping |
| Touch | Interactive targets are at least 44×44 CSS pixels and do not require hover |
| Keyboard | Logical tab order, visible focus, Enter/Space activation where applicable |
| Feedback | Correct/incorrect state is clear; controls lock when duplicate answers would corrupt state |
| Sound | On/off preference is respected; learning remains usable without audio |
| Persistence | Refresh/reopen behavior matches the feature specification |
| Abandon/retry | Leaving an incomplete mission does not award completion; retry rules match the spec |

## Performance Sampling

If a feature defines a timing threshold, use a warm browser or an equivalent environment explicitly allowed by the spec. Record:

- browser and device;
- sample count;
- measured interaction boundary;
- median or percentile required by the spec;
- maximum observed value;
- whether developer tooling affected the measurement.

Do not substitute module-only timing for browser interaction timing unless the acceptance criteria explicitly allow it.

## Accessibility Notes

Check text contrast, zoom/reflow, focus visibility, meaningful labels, reduced-motion behavior when animation changes, and whether color is the only signal. Turn stable regressions into automated source, component, or browser tests when practical.
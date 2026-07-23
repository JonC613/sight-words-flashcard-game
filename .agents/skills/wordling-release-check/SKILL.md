---
name: wordling-release-check
description: Validate Wordling Rescue changes before commit, pull request, merge, or deployment. Use when asked to test the game, check release readiness, verify a feature against its Spec Kit artifacts, perform tablet-browser QA, or document validation evidence.
---

# Wordling Release Check

## Overview

Run repeatable automated and manual release gates for Wordling Rescue. Record evidence in the active feature's validation document and distinguish verified results from checks that still require a real browser or device.

## Workflow

1. Inspect `git status --short`, the active feature's `spec.md`, `plan.md`, `tasks.md`, and `validation.md` when present.
2. Preserve unrelated work. Do not stage, rewrite, or remove files outside the requested feature.
3. Run `npm run lint`.
4. Run `npm test`. This includes the production build and committed Node test suite.
5. Run feature-specific checks named in `tasks.md` or `quickstart.md`.
6. For UI changes, follow [the manual release matrix](references/manual-release-matrix.md).
7. Update the feature's `validation.md` with commands, results, viewport/device evidence, and open gates.
8. Mark a task complete only when its acceptance condition was directly verified.
9. Report one of:
   - **Ready**: all required gates passed.
   - **Conditionally ready**: automated gates passed, with named manual gates outstanding.
   - **Not ready**: a required gate failed; include the failure and likely next action.

## Evidence Rules

- Prefer committed automated tests for deterministic behavior.
- Include the exact command and pass/fail totals.
- Record the actual viewport, browser, and device for visual checks.
- Do not infer touch sizing, overflow, focus visibility, timing, sound, or persistence from source inspection alone.
- Do not mark environment-dependent checks complete when tooling cannot reproduce their acceptance conditions.
- Capture regressions as tests when they can be made deterministic.

## Git and Deployment

- Never commit, push, merge, or deploy unless the user asks.
- Before staging, list the exact intended paths and exclude unrelated files.
- Treat deployment success and live-site verification as separate gates.
- After deployment, smoke-test the production URL and report the exact URL tested.
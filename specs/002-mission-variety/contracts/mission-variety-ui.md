# Contract: Mission Variety UI

## Shared mission behavior

- Keep the existing mission progress bar, card count, leave action, feedback
  surface, and finale.
- Show one concise goal at a time.
- Disable answer controls immediately after one accepted submission.
- Route every answer through the existing correct/incorrect outcome path.
- Show the complete correct word after an incorrect answer.
- Append eligible retries to the end of the mission; never interrupt with an
  immediate retry.
- Audio supplements visible instructions and target information.

## Missing Letter

The card provides:

- Visible instruction such as `Find the missing letter`.
- The target word with one clearly marked missing position.
- Exactly four native letter buttons.
- Exactly one button that reconstructs the target word.
- A visible focus indicator and at least 44×44 CSS-pixel targets.
- The full word in the shared feedback surface.

The interaction must not require typing, dragging, audio, color perception, or
animation.

## Word Hunt

The card provides:

- Visible instruction such as `Find this word`.
- A visible target clue so sound-off play remains possible.
- Two to four native word-choice buttons containing exactly one target.
- No unseen word as a distractor.
- A visible focus indicator and at least 44×44 CSS-pixel targets.
- The full word in the shared feedback surface.

Optional speech may pronounce the target but must not replace the visible clue.

## Retry behavior

After an incorrect new activity:

1. Show supportive correction in the current feedback surface.
2. Continue when the learner chooses `Next word`.
3. Append the target once within the current one-retry and 12-card limits.
4. Present it using a different eligible activity, falling back to `read`.
5. Award and record the retry through the normal answer path.

No penalty, loss message, countdown, or extra reward is introduced.

## Accessibility and responsive behavior

- All required actions work with touch, Tab, Shift+Tab, Enter, and Space.
- Focus remains visible and follows the existing document order.
- Feedback uses text and the existing status semantics, not color alone.
- At 768×1024, 1024×768, and 320 px wide, prompt and choice groups fit without
  horizontal page overflow.
- With reduced motion, feedback state changes immediately without required
  transforms or transitions.
- With sound, speech synthesis, service worker, storage, or network unavailable,
  the core activity remains understandable and usable.

## Abandonment and completion

- Leaving before the final resolved card discards transient prompts and creates no
  completion bonus, rescue, session increment, or Adventure Map step.
- Completing the mission invokes the existing finale exactly once.
- Activity mix never changes reward amounts or map progression.

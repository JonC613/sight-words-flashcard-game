<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Placeholder Principle 1 -> I. Evidence-Based Learning
  - Placeholder Principle 2 -> II. Child-Centered Safety and Encouragement
  - Placeholder Principle 3 -> III. ADHD-Friendly Ethical Gamification
  - Placeholder Principle 4 -> IV. Privacy and Save Compatibility
  - Placeholder Principle 5 -> V. Tablet-First Inclusive Access
  - Added VI. Spec-First Traceability and Risk-Based Testing
  - Added VII. Simplicity, Reviewability, and Release Safety
- Added sections:
  - Product and Technical Constraints
  - Development Workflow and Quality Gates
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ README.md
- Follow-up TODOs: none
-->

# Wordling Rescue Constitution

## Core Principles

### I. Evidence-Based Learning

Learning behavior MUST prioritize active recall, spaced repetition, interleaving,
and timely review over passive exposure. Difficulty and review timing MUST adapt
from learner responses. Placement or practice results MUST NOT mark a word
mastered without repeated evidence across time and activity modes. Changes to
learning rules MUST document their rationale and have automated coverage.

### II. Child-Centered Safety and Encouragement

The experience MUST use supportive, age-appropriate language and celebrate
effort, practice, and completion. It MUST NOT shame mistakes, rank children,
remove earned rewards, create fear of missed days, or present grades and
percentages as a child's worth. Incorrect responses MUST become useful practice
signals and return through the learning schedule.

### III. ADHD-Friendly Ethical Gamification

Game loops MUST support an ADHD learner through short achievable missions,
immediate understandable feedback, visible progress, meaningful novelty, and
limited choices. Re-entry after interruption or time away MUST be forgiving.
Rewards MUST reinforce learning actions rather than speed, compulsive use, or
perfect performance. Features MUST avoid punitive streaks, countdown pressure,
randomized scarcity, excessive sensory stimulation, dark patterns, and reward
systems that distract from reading practice. Motion and celebration MUST remain
brief, optional through reduced-motion settings, and easy to leave.

### IV. Privacy and Save Compatibility

Learner data MUST remain anonymous and device-local unless a later approved
specification explicitly changes the storage model. No advertising, behavioral
tracking, or child analytics may be introduced. Existing
`wordling-rescue-v1` saves MUST continue to load, or the change MUST include a
tested migration and safe fallback. New save fields SHOULD be optional when
that preserves backward compatibility.

### V. Tablet-First Inclusive Access

Every primary journey MUST work in a modern tablet browser using touch, keyboard,
and readable layouts. Controls MUST have clear labels and generous touch targets.
The application MUST remain usable when speech synthesis, sound, animation,
service workers, or network access are unavailable. Reduced-motion preferences
MUST be respected, and audio MUST supplement rather than replace visible
instructions.

### VI. Spec-First Traceability and Risk-Based Testing

Behavior changes MUST begin with prioritized user stories, measurable acceptance
criteria, assumptions, and edge cases. Plans and tasks MUST trace back to those
requirements. Tests MUST be written before or alongside implementation for
learning algorithms, rewards, scheduling, persistence, migrations, and duplicate
submission protection. Visual-only work MAY use documented manual evidence when
automation would add little confidence.

### VII. Simplicity, Reviewability, and Release Safety

Features MUST use the smallest design that delivers the approved learning value.
New services, databases, dependencies, accounts, or abstractions require explicit
justification in the implementation plan. Changes MUST preserve the existing
vinext, React, Cloudflare, PWA, and device-local architecture unless the approved
specification requires otherwise. Production changes MUST pass the build and
relevant tests, be reviewed through a focused change set, and deploy through the
established pipeline.

## Product and Technical Constraints

- Supported content is the first-, second-, and third-grade Dolch sight-word
  collection unless a feature specification explicitly expands it.
- The application remains a tablet-first web app built with React, vinext, and
  Cloudflare-compatible ESM.
- Browser storage is appropriate only for device-local learner state and
  preferences. D1, R2, authentication, or external analytics require a separate
  privacy and architecture specification.
- Speech, service-worker, storage, and network failures MUST degrade safely
  without blocking core reading practice.
- Child-facing copy and reward mechanics MUST receive an engagement-safety
  review against Principles II and III.

## Development Workflow and Quality Gates

1. Create or amend `spec.md` before changing behavior.
2. Resolve material ambiguity with clarification before technical planning.
3. Record the Constitution Check in `plan.md`; exceptions require a documented
   rationale and rejected simpler alternative.
4. Generate dependency-ordered tasks that map to independently testable user
   stories.
5. Run cross-artifact analysis before implementation for meaningful features.
6. Implement in small slices and validate each story independently.
7. Before release, run the production build and relevant automated tests.
   Document manual tablet, accessibility, audio, or reduced-motion evidence when
   those behaviors are affected.
8. Update specifications when implementation discoveries change agreed
   behavior; code MUST NOT silently become the only source of truth.

## Governance

This constitution governs all feature specifications, plans, tasks, reviews, and
implementation work. Amendments require a written rationale, a Sync Impact
Report, and updates to affected templates or guidance. Constitution versions use
semantic versioning: MAJOR for incompatible governance changes, MINOR for new or
materially expanded principles, and PATCH for clarifications.

Every feature plan and pull request MUST demonstrate constitution compliance.
Any temporary exception MUST be recorded in the plan's Complexity Tracking
section with an owner and removal condition. Reviewers MUST reject unexplained
violations or spec-code drift.

**Version**: 1.0.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-23

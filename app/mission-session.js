// @ts-check

import { createRetryCard, normalizeModes } from "./mission-variety.js";

export const DAY = 86400000;
export const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30, 60];

/**
 * @param {{
 * save:any,
 * card:any,
 * cards:any[],
 * ok:boolean,
 * now:number,
 * alreadyAnswered:boolean,
 * context:any
 * }} input
 */
export function applyMissionAnswer(input) {
  const { save, card, cards, ok, now, alreadyAnswered, context } = input;
  if (!card || alreadyAnswered) return { accepted: false, save, retryCard: null };
  const name = card.word.word;
  const old = save.progress?.[name] ?? {
    stage: 0,
    due: now,
    attempts: 0,
    correct: 0,
    modes: [],
    mastered: false,
  };
  const stage = ok ? Math.min(6, old.stage + 1) : Math.max(0, old.stage - 1);
  const modes = normalizeModes([...(Array.isArray(old.modes) ? old.modes : []), card.mode]);
  const progress = {
    stage,
    due: ok ? now + REVIEW_INTERVALS[stage] * DAY : now,
    attempts: old.attempts + 1,
    correct: old.correct + (ok ? 1 : 0),
    modes,
    mastered: stage >= 5 && modes.length >= 3,
  };
  const nextSave = {
    ...save,
    stars: save.stars + (ok ? 3 : 1),
    progress: { ...save.progress, [name]: progress },
  };
  return {
    accepted: true,
    save: nextSave,
    retryCard: !ok ? createRetryCard(card, cards, context) : null,
  };
}

/** @param {unknown} session */
export function abandonMission(session) {
  void session;
  return { cards: [], answers: [], feedback: null, completion: null };
}

// @ts-check

export const COMPLETION_BONUS = 5;

/**
 * @typedef {{ word: string, ok: boolean }} MissionAnswer
 */

/**
 * @param {MissionAnswer[]} answers
 */
export function summarizeMission(answers) {
  const missed = new Set(answers.filter(answer => !answer.ok).map(answer => answer.word));
  const strengthened = Array.from(
    new Set(answers.filter(answer => answer.ok && !missed.has(answer.word)).map(answer => answer.word)),
  ).slice(0, 4);
  const practiceSoon = Array.from(missed).slice(0, 2);
  const starsEarned = answers.reduce((sum, answer) => sum + (answer.ok ? 3 : 1), 0) + COMPLETION_BONUS;
  return { strengthened, practiceSoon, starsEarned };
}

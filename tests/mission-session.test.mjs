import assert from "node:assert/strict";
import test from "node:test";
import { abandonMission, applyMissionAnswer, DAY } from "../app/mission-session.js";

const word = { word: "after", grade: "First" };
const catalog = [word, { word: "because", grade: "Second" }, { word: "every", grade: "First" }];
const context = {
  progress: { because: { stage: 1 }, every: { stage: 1 } },
  allWords: catalog,
  random: () => 0,
};
const fresh = { stars: 0, sessions: 0, progress: {} };

test("an answer updates learning and rewards exactly once", () => {
  const card = { word, mode: "missing-letter" };
  const result = applyMissionAnswer({
    save: fresh,
    card,
    cards: [card],
    ok: true,
    now: 1000,
    alreadyAnswered: false,
    context,
  });
  assert.equal(result.accepted, true);
  assert.equal(result.save.stars, 3);
  assert.equal(result.save.progress.after.attempts, 1);
  assert.equal(result.save.progress.after.correct, 1);
  assert.equal(result.save.progress.after.due, 1000 + DAY);
  assert.deepEqual(result.save.progress.after.modes, ["missing-letter"]);

  const duplicate = applyMissionAnswer({
    save: result.save,
    card,
    cards: [card],
    ok: true,
    now: 1001,
    alreadyAnswered: true,
    context,
  });
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.save, result.save);
});

test("a miss schedules a different-mode retry and preserves formulas", () => {
  const save = {
    ...fresh,
    progress: { after: { stage: 2, due: 9999, attempts: 2, correct: 1, modes: ["read"], mastered: false } },
  };
  const card = { word, mode: "word-hunt" };
  const result = applyMissionAnswer({
    save,
    card,
    cards: [card],
    ok: false,
    now: 2000,
    alreadyAnswered: false,
    context,
  });
  assert.equal(result.save.stars, 1);
  assert.equal(result.save.progress.after.stage, 1);
  assert.equal(result.save.progress.after.due, 2000);
  assert.equal(result.save.progress.after.attempts, 3);
  assert.ok(result.retryCard);
  assert.notEqual(result.retryCard.mode, "word-hunt");
});

test("three distinct modes retain the existing mastery threshold", () => {
  const save = {
    ...fresh,
    progress: { after: { stage: 4, due: 0, attempts: 4, correct: 4, modes: ["read", "choice"], mastered: false } },
  };
  const result = applyMissionAnswer({
    save,
    card: { word, mode: "missing-letter" },
    cards: [],
    ok: true,
    now: 0,
    alreadyAnswered: false,
    context,
  });
  assert.equal(result.save.progress.after.stage, 5);
  assert.equal(result.save.progress.after.mastered, true);
});

test("abandonment clears transient state and never mutates a save", () => {
  const session = { save: fresh, cards: [{ word }], answers: [{ word: "after", ok: true }], feedback: {}, completion: {} };
  const result = abandonMission(session);
  assert.deepEqual(result, { cards: [], answers: [], feedback: null, completion: null });
  assert.equal(session.save, fresh);
  assert.equal(fresh.sessions, 0);
});

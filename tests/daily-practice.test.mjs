import test from "node:test";
import assert from "node:assert/strict";
import {
  localDateKey,
  normalizePracticeDays,
  recordPracticeDay,
  selectDailyPractice,
} from "../app/daily-practice.js";

function localTime(year, month, day, hour = 12) {
  return new Date(year, month - 1, day, hour).getTime();
}

test("creates a local calendar key and repairs malformed history", () => {
  assert.equal(localDateKey(localTime(2026, 7, 4)), "2026-07-04");
  assert.deepEqual(normalizePracticeDays([
    "2026-07-04", "bad", "2026-02-30", "2026-07-03", "2026-07-04", 3,
  ]), ["2026-07-03", "2026-07-04"]);
  assert.deepEqual(normalizePracticeDays(null), []);
});

test("records one immutable practice day and never duplicates it", () => {
  const original = { stars: 12, practiceDays: ["2026-07-01"] };
  const first = recordPracticeDay(original, localTime(2026, 7, 2));
  assert.equal(first.recorded, true);
  assert.deepEqual(first.save.practiceDays, ["2026-07-01", "2026-07-02"]);
  assert.deepEqual(original.practiceDays, ["2026-07-01"]);
  const second = recordPracticeDay(first.save, localTime(2026, 7, 2));
  assert.equal(second.recorded, false);
  assert.equal(second.save, first.save);
});

test("derives current, best, lifetime, goal, and returning states", () => {
  const active = selectDailyPractice({
    practiceDays: ["2026-07-01", "2026-07-02", "2026-07-04", "2026-07-05"],
  }, localTime(2026, 7, 6));
  assert.deepEqual(active, {
    practiceDays: ["2026-07-01", "2026-07-02", "2026-07-04", "2026-07-05"],
    todayKey: "2026-07-06",
    goalComplete: false,
    currentStreak: 2,
    bestStreak: 2,
    lifetimePracticeDays: 4,
    returning: false,
  });
  const returning = selectDailyPractice({ practiceDays: active.practiceDays }, localTime(2026, 7, 8));
  assert.equal(returning.currentStreak, 0);
  assert.equal(returning.bestStreak, 2);
  assert.equal(returning.lifetimePracticeDays, 4);
  assert.equal(returning.returning, true);
});

test("missed days quietly restart at one while preserving history", () => {
  const result = recordPracticeDay({
    stars: 30,
    practiceDays: ["2026-07-01", "2026-07-02"],
  }, localTime(2026, 7, 6));
  assert.equal(result.status.currentStreak, 1);
  assert.equal(result.status.bestStreak, 2);
  assert.equal(result.status.lifetimePracticeDays, 3);
  assert.equal(result.save.stars, 30);
});

test("future dates survive clock changes but do not complete today", () => {
  const status = selectDailyPractice({
    practiceDays: ["2026-07-10", "2026-07-11"],
  }, localTime(2026, 7, 9));
  assert.equal(status.goalComplete, false);
  assert.equal(status.currentStreak, 0);
  assert.equal(status.bestStreak, 2);
  assert.equal(status.lifetimePracticeDays, 2);
});

test("legacy and malformed saves remain usable", () => {
  assert.equal(selectDailyPractice({}, localTime(2026, 7, 1)).lifetimePracticeDays, 0);
  assert.equal(selectDailyPractice({ practiceDays: "oops" }, localTime(2026, 7, 1)).currentStreak, 0);
  assert.equal(recordPracticeDay({ sessions: 4 }, localTime(2026, 7, 1)).save.sessions, 4);
});

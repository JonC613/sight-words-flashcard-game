import assert from "node:assert/strict";
import test from "node:test";
import { COMPLETION_BONUS, summarizeMission } from "../app/mission-finale.js";

test("summarizes a mission without duplicate words", () => {
  const result = summarizeMission([
    { word: "after", ok: true },
    { word: "after", ok: true },
    { word: "because", ok: false },
    { word: "because", ok: true },
  ]);

  assert.deepEqual(result.strengthened, ["after"]);
  assert.deepEqual(result.practiceSoon, ["because"]);
  assert.equal(result.starsEarned, 10 + COMPLETION_BONUS);
});

test("limits the child-facing summary", () => {
  const result = summarizeMission([
    { word: "after", ok: true },
    { word: "could", ok: true },
    { word: "every", ok: true },
    { word: "think", ok: true },
    { word: "around", ok: true },
    { word: "their", ok: false },
    { word: "write", ok: false },
    { word: "carry", ok: false },
  ]);

  assert.equal(result.strengthened.length, 4);
  assert.deepEqual(result.practiceSoon, ["their", "write"]);
});

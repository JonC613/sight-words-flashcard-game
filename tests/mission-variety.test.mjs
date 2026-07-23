import assert from "node:assert/strict";
import test from "node:test";
import {
  composeMissionActivities,
  createMissingLetterPrompt,
  createRetryCard,
  createWordHuntPrompt,
  damerauLevenshtein,
  normalizeModes,
} from "../app/mission-variety.js";

const catalog = [
  { word: "after", grade: "First" },
  { word: "every", grade: "First" },
  { word: "could", grade: "First" },
  { word: "because", grade: "Second" },
  { word: "write", grade: "Second" },
  { word: "don't", grade: "Second" },
  { word: "an", grade: "First" },
];
const progress = Object.fromEntries(catalog.map(word => [word.word, { stage: 1, modes: ["read"] }]));
const random = () => 0.25;
const context = { progress, allWords: catalog, random };

test("Missing Letter creates one reconstructable position and four choices", () => {
  for (const word of ["an", "don't", "every"]) {
    const prompt = createMissingLetterPrompt(word, random);
    assert.ok(prompt);
    assert.equal(prompt.choices.length, 4);
    assert.equal(new Set(prompt.choices).size, 4);
    assert.equal(prompt.choices.filter(choice => choice === prompt.answer).length, 1);
    assert.equal(prompt.displayParts[0] + prompt.answer + prompt.displayParts[1], word);
  }
  assert.equal(createMissingLetterPrompt("I", random), null);
  assert.deepEqual(createMissingLetterPrompt("after", random), createMissingLetterPrompt("after", random));
});

test("Word Hunt uses introduced, pairwise distinct sight words", () => {
  const prompt = createWordHuntPrompt(catalog[0], progress, catalog, random);
  assert.ok(prompt);
  assert.ok(prompt.choices.length >= 2 && prompt.choices.length <= 4);
  assert.equal(prompt.choices.filter(choice => choice === "after").length, 1);
  for (const choice of prompt.choices.filter(choice => choice !== "after")) {
    assert.ok(Object.hasOwn(progress, choice));
  }
  for (let i = 0; i < prompt.choices.length; i++) {
    for (let j = i + 1; j < prompt.choices.length; j++) {
      assert.ok(damerauLevenshtein(prompt.choices[i], prompt.choices[j]) >= 2);
    }
  }
  assert.equal(createWordHuntPrompt(catalog[0], {}, catalog, random), null);
});

test("composition preserves words and creates bounded variety", () => {
  const selected = catalog.slice(0, 6).map(word => ({ word }));
  const composed = composeMissionActivities(selected, context);
  assert.deepEqual(composed.map(card => card.word.word), selected.map(card => card.word.word));
  assert.ok(composed.some(card => ["missing-letter", "word-hunt"].includes(card.mode)));
  assert.ok(new Set(composed.map(card => card.mode)).size >= 2);
  for (let i = 2; i < composed.length; i++) {
    assert.ok(!(composed[i].mode === composed[i - 1].mode && composed[i].mode === composed[i - 2].mode));
  }
  assert.deepEqual(selected, catalog.slice(0, 6).map(word => ({ word })));
});

test("one hundred composed missions meet variety requirements quickly", () => {
  const selected = catalog.slice(0, 6).map(word => ({ word }));
  const durations = [];
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    const cards = composeMissionActivities(selected, { ...context, random: () => (i % 10) / 10 });
    durations.push(performance.now() - start);
    assert.ok(cards.some(card => ["missing-letter", "word-hunt"].includes(card.mode)));
    assert.ok(new Set(cards.map(card => card.mode)).size >= 2);
  }
  durations.sort((a, b) => a - b);
  assert.ok(durations[Math.floor(durations.length * 0.95)] < 10);
});

test("retry uses another activity once and respects the cap", () => {
  const card = { word: catalog[0], mode: "missing-letter" };
  const retry = createRetryCard(card, [card], context);
  assert.ok(retry);
  assert.notEqual(retry.mode, card.mode);
  assert.equal(retry.retry, true);
  assert.equal(createRetryCard(retry, [card, retry], context), null);
  assert.equal(createRetryCard(card, Array(12).fill(card), context), null);
  assert.equal(createRetryCard({ word: catalog[0], mode: "spell" }, [], context).mode, "read");
});

test("mode history accepts old and new values and removes malformed entries", () => {
  assert.deepEqual(normalizeModes(["read", "choice", "missing-letter", "bogus", null, "read"]), [
    "read",
    "choice",
    "missing-letter",
  ]);
  const roundTrip = JSON.parse(JSON.stringify({ modes: ["read", "word-hunt"] }));
  assert.deepEqual(normalizeModes(roundTrip.modes), ["read", "word-hunt"]);
});

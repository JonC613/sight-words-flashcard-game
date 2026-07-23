import assert from "node:assert/strict";
import test from "node:test";
import {
  WORLD_CATALOG,
  WORLD_IDS,
  abandonMission,
  chooseWorld,
  completeMission,
  deriveResidents,
  markStoryViewed,
  normalizeAdventureMap,
  recordPlacementSuggestion,
  resolvePlacementSuggestion,
  selectAdventureMap,
  validateCatalog,
} from "../app/adventure-map.js";

const grades = ["First", "Second", "Third"];
const baseSave = (sessions = 0, grade = "Second") => ({
  name: "Explorer",
  stars: 12,
  sessions,
  sound: true,
  progress: { after: { stage: 2, due: 10, attempts: 1, correct: 1, modes: ["read"], mastered: false } },
  placement: { completed: true, completedAt: 1, startingGrade: grade, attempts: 8, correct: 5 },
  rescues: [],
});
const withSteps = (stepsByWorld, activeWorld = "Second", extra = {}) => normalizeAdventureMap({
  ...baseSave(),
  ...extra,
  adventureMap: {
    version: 1,
    activeWorld,
    worlds: Object.fromEntries(grades.map(grade => [grade, { steps: stepsByWorld[grade] ?? 0, viewedStoryIds: [] }])),
  },
});
const completion = (id = "mission-1", world = "Second") => ({
  id,
  completedAt: 100,
  completionBonusStars: 5,
  rescue: { id: `rescue-${id}`, world, rescuedAt: 100 },
});

test("catalog has three worlds and five stable, valid locations each", () => {
  assert.deepEqual(WORLD_IDS, grades);
  assert.equal(validateCatalog(), true);
  const locations = grades.flatMap(grade => WORLD_CATALOG[grade].locations);
  assert.equal(locations.length, 15);
  assert.equal(new Set(locations.map(location => location.id)).size, 15);
  assert.equal(new Set(locations.map(location => location.storyId)).size, 15);
  assert.ok(locations.every(location => location.storySentences.length >= 1 && location.storySentences.length <= 3));
});

test("an unplaced save remains a placement preview", () => {
  const save = normalizeAdventureMap({ name: "Explorer", sessions: 7, stars: 4, progress: {}, rescues: [] });
  assert.equal(save.adventureMap, undefined);
  assert.equal(selectAdventureMap(save).status, "preview");
});

test("legacy sessions seed only the placement world and preserve legacy data", () => {
  for (const [sessions, expected] of [[0, 0], [1, 1], [9, 9], [10, 10], [11, 10], [999, 10]]) {
    const original = baseSave(sessions, "Second");
    const normalized = normalizeAdventureMap(original);
    assert.equal(normalized.adventureMap.worlds.Second.steps, expected);
    assert.equal(normalized.adventureMap.worlds.First.steps, 0);
    assert.equal(normalized.adventureMap.worlds.Third.steps, 0);
    assert.equal(normalized.sessions, sessions);
    assert.deepEqual(normalized.progress, original.progress);
    assert.deepEqual(normalized.placement, original.placement);
    assert.deepEqual(normalized.rescues, original.rescues);
    assert.equal(normalized.adventureMap.worlds.Second.viewedStoryIds.length, Math.floor(expected / 2));
  }
});

test("partial map records repair safely and normalization is idempotent", () => {
  const save = baseSave(50, "Third");
  save.adventureMap = {
    version: 1,
    activeWorld: "NotAWorld",
    pendingPlacementWorld: "First",
    lastCompletionId: 42,
    worlds: {
      First: { steps: -4, viewedStoryIds: ["bad"] },
      Second: { steps: 99, viewedStoryIds: [WORLD_CATALOG.Second.locations[0].storyId, "bad"] },
    },
  };
  const repaired = normalizeAdventureMap(save);
  assert.equal(repaired.adventureMap.activeWorld, "Third");
  assert.equal(repaired.adventureMap.worlds.First.steps, 0);
  assert.equal(repaired.adventureMap.worlds.Second.steps, 10);
  assert.equal(repaired.adventureMap.worlds.Third.steps, 0);
  assert.deepEqual(repaired.adventureMap.worlds.Second.viewedStoryIds, [WORLD_CATALOG.Second.locations[0].storyId]);
  assert.equal(repaired.adventureMap.lastCompletionId, undefined);
  assert.deepEqual(normalizeAdventureMap(repaired), repaired);
});

test("selectors expose one next destination at step boundaries", () => {
  for (const [steps, unlocked, halfway, nextOrder] of [[0, 0, false, 1], [1, 0, true, 1], [2, 1, false, 2], [9, 4, true, 5]]) {
    const view = selectAdventureMap(withSteps({ Second: steps }));
    const world = view.worlds.find(item => item.id === "Second");
    assert.equal(world.unlockedCount, unlocked);
    assert.equal(world.halfwayToNext, halfway);
    assert.equal(view.nextDestination.order, nextOrder);
    assert.equal(world.locations.filter(location => location.status === "next").length, 1);
  }
  const complete = selectAdventureMap(withSteps({ Second: 10 }));
  assert.equal(complete.nextDestination, undefined);
  assert.equal(complete.requiresWorldChoice, true);
});

test("abandonment changes no mission, rescue, star, or map state", () => {
  const save = withSteps({ Second: 1 });
  assert.strictEqual(abandonMission(save), save);
});

test("completion adds one step, one rescue, one session, and only the five-star bonus", () => {
  const save = withSteps({ Second: 0 }, "Second", { stars: 23, sessions: 4 });
  const result = completeMission(save, completion());
  assert.equal(result.adventureMap.worlds.Second.steps, 1);
  assert.equal(result.sessions, 5);
  assert.equal(result.stars, 28);
  assert.equal(result.rescues.length, 1);
  assert.equal(result.rescues[0].world, "Second");
});

test("every second step unlocks one story and viewing it has no reward side effect", () => {
  const save = withSteps({ Second: 1 });
  const result = completeMission(save, completion());
  const view = selectAdventureMap(result);
  assert.equal(result.adventureMap.worlds.Second.steps, 2);
  assert.equal(view.worlds.find(world => world.id === "Second").unlockedCount, 1);
  assert.equal(view.pendingStory.id, WORLD_CATALOG.Second.locations[0].storyId);
  const viewed = markStoryViewed(result, view.pendingStory.id);
  assert.equal(selectAdventureMap(viewed).pendingStory, undefined);
  assert.equal(viewed.stars, result.stars);
  assert.equal(viewed.sessions, result.sessions);
  assert.strictEqual(markStoryViewed(viewed, view.pendingStory.id), viewed);
});

test("duplicate completion IDs are exactly idempotent", () => {
  const first = completeMission(withSteps({ Second: 4 }), completion("same"));
  const duplicate = completeMission(first, completion("same"));
  assert.strictEqual(duplicate, first);
  assert.equal(duplicate.sessions, first.sessions);
  assert.equal(duplicate.rescues.length, first.rescues.length);
  assert.equal(duplicate.adventureMap.worlds.Second.steps, 5);
});

test("world choice changes only map setting", () => {
  const save = withSteps({ First: 10, Second: 2, Third: 0 }, "First");
  const changed = chooseWorld(save, "Third");
  assert.equal(changed.adventureMap.activeWorld, "Third");
  assert.deepEqual(changed.progress, save.progress);
  assert.deepEqual(changed.placement, save.placement);
  assert.equal(changed.adventureMap.worlds.First.steps, 10);
});

test("placement suggestions persist and resolve through stay or switch", () => {
  const save = withSteps({ First: 2, Second: 4 }, "Second");
  const pending = recordPlacementSuggestion(save, "First");
  assert.equal(pending.adventureMap.pendingPlacementWorld, "First");
  const stayed = resolvePlacementSuggestion(pending, "stay");
  assert.equal(stayed.adventureMap.activeWorld, "Second");
  assert.equal(stayed.adventureMap.pendingPlacementWorld, undefined);
  const switched = resolvePlacementSuggestion(pending, "switch");
  assert.equal(switched.adventureMap.activeWorld, "First");
  assert.deepEqual(switched.adventureMap.worlds, save.adventureMap.worlds);
  assert.deepEqual(switched.progress, save.progress);
});

test("resident assignments are deterministic and preserve rescue records", () => {
  const rescues = Array.from({ length: 12 }, (_, index) => ({ id: `r-${index}`, world: "Second", rescuedAt: index }));
  const save = withSteps({ Second: 10 }, "Second", { rescues });
  const first = deriveResidents(save);
  const second = deriveResidents(save);
  assert.deepEqual(second, first);
  assert.equal(Object.values(first.Second).flat().length, 12);
  assert.deepEqual(save.rescues, rescues);
});

test("full-map completions add a resident but no map step", () => {
  const save = withSteps({ First: 10, Second: 10, Third: 10 }, "Third", { sessions: 30 });
  const result = completeMission(save, completion("after-map", "First"));
  assert.equal(result.adventureMap.worlds.Third.steps, 10);
  assert.equal(result.sessions, 31);
  assert.equal(result.rescues.length, 1);
  assert.equal(result.rescues[0].world, "Third");
  assert.equal(selectAdventureMap(result).status, "complete");
});

test("JSON round trips retain map, viewed stories, pending choice, and resident inputs", () => {
  let save = withSteps({ First: 2, Second: 4 }, "Second", {
    rescues: [{ id: "resident", world: "Second", rescuedAt: 1 }],
  });
  save = markStoryViewed(save, WORLD_CATALOG.Second.locations[0].storyId);
  save = recordPlacementSuggestion(save, "First");
  const reopened = normalizeAdventureMap(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(reopened, save);
  assert.deepEqual(deriveResidents(reopened), deriveResidents(save));
});
test("activity metadata cannot change Adventure Map completion",()=>{
  const save=normalizeAdventureMap({...baseSave(0,"First"),stars:0});
  const base={id:"activity-neutral",completedAt:900,rescue:{id:"rescue-neutral",world:"First",rescuedAt:900},completionBonusStars:5};
  const plain=completeMission(save,base);
  const varied=completeMission(save,{...base,activityMix:["missing-letter","word-hunt"]});
  assert.deepEqual(varied,plain);
});
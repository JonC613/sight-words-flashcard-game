// @ts-check

import { COMPLETION_BONUS } from "./mission-finale.js";

export const WORLD_IDS = ["First", "Second", "Third"];

export const WORLD_CATALOG = {
  First: {
    name: "Whispering Woods",
    locations: [
      ["mossy-gate", "Mossy Gate", "The mossy gate opens with a friendly creak. A tiny Wordling waves from the path."],
      ["firefly-brook", "Firefly Brook", "Fireflies sparkle above the brook. Their lights make every word easier to find."],
      ["acorn-hollow", "Acorn Hollow", "Acorns tumble into a cozy hollow. A rescued Wordling makes a soft nest there."],
      ["echo-tree", "Echo Tree", "The old tree echoes each brave new word. The forest answers with a cheer."],
      ["moonlit-nest", "Moonlit Nest", "Moonlight glows over a peaceful nest. The Wordlings celebrate the trail you made."],
    ],
  },
  Second: {
    name: "Crystal Caves",
    locations: [
      ["glimmer-entrance", "Glimmer Entrance", "The cave entrance glimmers like a lantern. A curious Wordling peeks around the corner."],
      ["singing-stones", "Singing Stones", "Bright stones hum a gentle tune. Each strong word adds a new note."],
      ["rainbow-bridge", "Rainbow Bridge", "A rainbow bridge stretches across the cavern. The Wordlings bounce across together."],
      ["star-chamber", "Star Chamber", "Tiny stars shine inside the chamber. They glow brighter with every practiced word."],
      ["crystal-heart", "Crystal Heart", "The crystal heart fills the cave with color. All the rescued Wordlings gather to celebrate."],
    ],
  },
  Third: {
    name: "Skyward Peaks",
    locations: [
      ["cloudstep-camp", "Cloudstep Camp", "Soft clouds make a camp high in the sky. A Wordling saves you a fluffy seat."],
      ["windmill-ridge", "Windmill Ridge", "The windmill turns in the mountain breeze. Each turn carries a word across the ridge."],
      ["sunbeam-pass", "Sunbeam Pass", "Warm sunbeams mark the way forward. The Wordlings skip through the golden light."],
      ["thunder-library", "Thunder Library", "Books rumble softly in the thunder library. A new word makes the shelves sparkle."],
      ["aurora-lookout", "Aurora Lookout", "Colorful lights dance above the lookout. Your whole Wordling team watches the sky."],
    ],
  },
};

for (const worldId of WORLD_IDS) {
  WORLD_CATALOG[worldId].id = worldId;
  WORLD_CATALOG[worldId].locations = WORLD_CATALOG[worldId].locations.map(
    ([id, name, story], index) => ({
      id: `${worldId.toLowerCase()}-${id}`,
      name,
      order: index + 1,
      storyId: `${worldId.toLowerCase()}-${id}-story`,
      storySentences: String(story).split(/(?<=\.)\s+/),
    }),
  );
}

const isWorldId = value => WORLD_IDS.includes(value);
const boundedSteps = value => Math.max(0, Math.min(10, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 0));
const worldRecord = () => ({ steps: 0, viewedStoryIds: [] });

export function validateCatalog() {
  const locations = WORLD_IDS.flatMap(id => WORLD_CATALOG[id]?.locations ?? []);
  return locations.length === 15
    && new Set(locations.map(location => location.id)).size === 15
    && new Set(locations.map(location => location.storyId)).size === 15
    && locations.every(location =>
      location.storySentences.length >= 1
      && location.storySentences.length <= 3
      && location.name
      && location.order >= 1
      && location.order <= 5);
}

/**
 * Repair or initialize optional Adventure Map state without changing legacy data.
 * @param {any} save
 */
export function normalizeAdventureMap(save) {
  const source = save && typeof save === "object" ? save : {};
  const placementWorld = source.placement?.completed && isWorldId(source.placement?.startingGrade)
    ? source.placement.startingGrade
    : undefined;
  if (!placementWorld) {
    if (!("adventureMap" in source)) return source;
    const clean = { ...source };
    delete clean.adventureMap;
    return clean;
  }

  const existing = source.adventureMap?.version === 1 ? source.adventureMap : undefined;
  if (!existing) {
    const steps = boundedSteps(source.sessions);
    const worlds = Object.fromEntries(WORLD_IDS.map(id => {
      const seededSteps = id === placementWorld ? steps : 0;
      return [id, {
        steps: seededSteps,
        viewedStoryIds: WORLD_CATALOG[id].locations
          .slice(0, Math.floor(seededSteps / 2))
          .map(location => location.storyId),
      }];
    }));
    return { ...source, adventureMap: { version: 1, activeWorld: placementWorld, worlds } };
  }

  const worlds = Object.fromEntries(WORLD_IDS.map(id => {
    const raw = existing.worlds?.[id];
    const steps = boundedSteps(raw?.steps);
    const allowed = new Set(
      WORLD_CATALOG[id].locations.slice(0, Math.floor(steps / 2)).map(location => location.storyId),
    );
    const viewedStoryIds = Array.from(new Set(Array.isArray(raw?.viewedStoryIds) ? raw.viewedStoryIds : []))
      .filter(storyId => allowed.has(storyId));
    return [id, { steps, viewedStoryIds }];
  }));
  const adventureMap = {
    version: 1,
    activeWorld: isWorldId(existing.activeWorld) ? existing.activeWorld : placementWorld,
    worlds,
  };
  if (isWorldId(existing.pendingPlacementWorld)
      && existing.pendingPlacementWorld !== adventureMap.activeWorld) {
    adventureMap.pendingPlacementWorld = existing.pendingPlacementWorld;
  }
  if (typeof existing.lastCompletionId === "string" && existing.lastCompletionId) {
    adventureMap.lastCompletionId = existing.lastCompletionId;
  }
  const normalized = { ...source, adventureMap };
  return JSON.stringify(normalized) === JSON.stringify(source) ? source : normalized;
}

/**
 * @param {any} save
 */
export function selectAdventureMap(save) {
  const normalized = normalizeAdventureMap(save);
  if (!normalized.adventureMap) {
    return {
      status: "preview",
      message: "Finish the Placement Quest to reveal your Adventure Map.",
      worlds: [],
    };
  }
  const map = normalized.adventureMap;
  const worlds = WORLD_IDS.map(id => {
    const state = map.worlds[id] ?? worldRecord();
    const unlockedCount = Math.floor(state.steps / 2);
    const locations = WORLD_CATALOG[id].locations.map(location => {
      let status = "locked";
      if (location.order <= unlockedCount) status = "unlocked";
      else if (id === map.activeWorld && state.steps < 10 && location.order === unlockedCount + 1) status = "next";
      return { ...location, status };
    });
    return {
      ...WORLD_CATALOG[id],
      steps: state.steps,
      unlockedCount,
      halfwayToNext: state.steps % 2 === 1,
      complete: state.steps === 10,
      currentPosition: state.steps === 0
        ? "Trailhead"
        : state.steps % 2 === 1
          ? `On the path to ${locations[unlockedCount].name}`
          : locations[Math.max(0, unlockedCount - 1)].name,
      locations,
    };
  });
  const active = worlds.find(world => world.id === map.activeWorld);
  const allComplete = worlds.every(world => world.complete);
  const nextDestination = active && !active.complete
    ? active.locations.find(location => location.status === "next")
    : undefined;
  const pendingStory = WORLD_CATALOG[map.activeWorld].locations
    .slice(0, active?.unlockedCount ?? 0)
    .find(location => !map.worlds[map.activeWorld].viewedStoryIds.includes(location.storyId));
  return {
    status: allComplete ? "complete" : "active",
    activeWorld: map.activeWorld,
    pendingPlacementWorld: map.pendingPlacementWorld,
    worlds,
    nextDestination,
    pendingStory: pendingStory && {
      id: pendingStory.storyId,
      locationId: pendingStory.id,
      title: pendingStory.name,
      sentences: pendingStory.storySentences,
    },
    requiresWorldChoice: !allComplete && Boolean(active?.complete),
  };
}

export function abandonMission(save) {
  return save;
}

/**
 * @param {any} save
 * @param {any} event
 */
export function completeMission(save, event) {
  if (typeof event?.id !== "string" || !event.id) return save;
  if (save?.adventureMap?.lastCompletionId === event.id) return save;
  const normalized = normalizeAdventureMap(save);
  if (!normalized.adventureMap) return save;
  const activeWorld = normalized.adventureMap.activeWorld;
  const current = normalized.adventureMap.worlds[activeWorld];
  const worlds = {
    ...normalized.adventureMap.worlds,
    [activeWorld]: { ...current, steps: Math.min(10, current.steps + 1) },
  };
  const rescue = event.rescue && typeof event.rescue === "object"
    ? { ...event.rescue, world: activeWorld }
    : undefined;
  return {
    ...normalized,
    stars: (Number(normalized.stars) || 0) + COMPLETION_BONUS,
    sessions: (Number(normalized.sessions) || 0) + 1,
    rescues: [...(Array.isArray(normalized.rescues) ? normalized.rescues : []), ...(rescue ? [rescue] : [])],
    adventureMap: {
      ...normalized.adventureMap,
      worlds,
      lastCompletionId: event.id,
    },
  };
}

export function markStoryViewed(save, storyId) {
  const normalized = normalizeAdventureMap(save);
  const map = normalized.adventureMap;
  if (!map) return save;
  const worldId = WORLD_IDS.find(id =>
    WORLD_CATALOG[id].locations.some(location => location.storyId === storyId));
  if (!worldId) return save;
  const world = map.worlds[worldId];
  const locationIndex = WORLD_CATALOG[worldId].locations.findIndex(location => location.storyId === storyId);
  if (locationIndex >= Math.floor(world.steps / 2) || world.viewedStoryIds.includes(storyId)) return save;
  return {
    ...normalized,
    adventureMap: {
      ...map,
      worlds: {
        ...map.worlds,
        [worldId]: { ...world, viewedStoryIds: [...world.viewedStoryIds, storyId] },
      },
    },
  };
}

export function chooseWorld(save, worldId) {
  const normalized = normalizeAdventureMap(save);
  if (!normalized.adventureMap || !isWorldId(worldId) || normalized.adventureMap.activeWorld === worldId) return save;
  return { ...normalized, adventureMap: { ...normalized.adventureMap, activeWorld: worldId } };
}

export function recordPlacementSuggestion(save, worldId) {
  const normalized = normalizeAdventureMap(save);
  if (!normalized.adventureMap || !isWorldId(worldId)) return save;
  const map = { ...normalized.adventureMap };
  if (worldId === map.activeWorld) delete map.pendingPlacementWorld;
  else map.pendingPlacementWorld = worldId;
  return { ...normalized, adventureMap: map };
}

export function resolvePlacementSuggestion(save, choice) {
  const normalized = normalizeAdventureMap(save);
  const map = normalized.adventureMap;
  if (!map?.pendingPlacementWorld || !["stay", "switch"].includes(choice)) return save;
  const next = { ...map };
  if (choice === "switch") next.activeWorld = map.pendingPlacementWorld;
  delete next.pendingPlacementWorld;
  return { ...normalized, adventureMap: next };
}

export function deriveResidents(save) {
  const normalized = normalizeAdventureMap(save);
  const output = Object.fromEntries(WORLD_IDS.map(id => [id, {}]));
  if (!normalized.adventureMap) return output;
  const rescues = Array.isArray(normalized.rescues) ? [...normalized.rescues] : [];
  for (const worldId of WORLD_IDS) {
    const unlockedCount = Math.floor(normalized.adventureMap.worlds[worldId].steps / 2);
    const residents = rescues
      .filter(rescue => rescue?.world === worldId)
      .sort((a, b) => (Number(a.rescuedAt) || 0) - (Number(b.rescuedAt) || 0)
        || String(a.id).localeCompare(String(b.id)));
    residents.forEach((rescue, index) => {
      const locationIndex = index < 10 ? Math.floor(index / 2) : index % 5;
      if (locationIndex >= unlockedCount) return;
      const locationId = WORLD_CATALOG[worldId].locations[locationIndex].id;
      (output[worldId][locationId] ??= []).push(rescue);
    });
  }
  return output;
}

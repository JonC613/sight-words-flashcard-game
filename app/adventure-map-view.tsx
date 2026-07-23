"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deriveResidents, selectAdventureMap, WORLD_CATALOG, WORLD_IDS } from "./adventure-map.js";
import type { Grade } from "./words";

type Rescue = { id: string; world: Grade; rescuedAt: number };
type MapProps = {
  save: unknown;
  onPlacement: () => void;
  onStart: () => void;
  onChooseWorld: (world: Grade) => void;
  onStoryViewed: (storyId: string) => void;
  onResolvePlacement: (choice: "stay" | "switch") => void;
  onCollection: () => void;
};

const labels = { locked: "Locked", next: "Next destination", unlocked: "Reached" };

export default function AdventureMapView({
  save,
  onPlacement,
  onStart,
  onChooseWorld,
  onStoryViewed,
  onResolvePlacement,
  onCollection,
}: MapProps) {
  const map = selectAdventureMap(save);
  const residents = useMemo(() => deriveResidents(save), [save]);
  const [selectedStory, setSelectedStory] = useState<string | false | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastStoryTrigger = useRef<HTMLButtonElement>(null);
  const activeWorld = map.worlds.find((world: { id: Grade }) => world.id === map.activeWorld);

  const openStory = selectedStory === null ? map.pendingStory?.id ?? null : selectedStory || null;
  useEffect(() => {
    if (openStory) requestAnimationFrame(() => closeRef.current?.focus());
  }, [openStory]);

  function closeStory(storyId: string) {
    onStoryViewed(storyId);
    setSelectedStory(false);
    requestAnimationFrame(() => lastStoryTrigger.current?.focus());
  }

  if (map.status === "preview") {
    return <section className="mapPreview" aria-labelledby="map-title">
      <div className="mapCompass" aria-hidden="true">✦</div>
      <small className="eyebrow">ADVENTURE MAP</small>
      <h1 id="map-title">Your trail is waiting.</h1>
      <p>Finish the Placement Quest to reveal the word world that fits you best.</p>
      <button className="primary" onClick={onPlacement}>Find my starting trail →</button>
    </section>;
  }

  const storyLocation = openStory && WORLD_IDS
    .flatMap(world => WORLD_CATALOG[world].locations)
    .find(location => location.storyId === openStory);

  return <section className="adventureMap" aria-labelledby="map-title">
    <div className="mapHeading">
      <div>
        <small className="eyebrow">YOUR ADVENTURE MAP</small>
        <h1 id="map-title">{map.status === "complete" ? "Every trail is glowing!" : activeWorld?.name}</h1>
        <p>{map.status === "complete"
          ? "Keep practicing to welcome more Wordlings home."
          : `${activeWorld?.steps ?? 0} of 10 trail steps · ${activeWorld?.unlockedCount ?? 0} of 5 places reached`}</p>
      </div>
      <button className="collectionLink" onClick={onCollection}>My Wordlings →</button>
    </div>

    {map.pendingPlacementWorld && <section className="mapChoice" aria-labelledby="placement-choice-title">
      <small>PLACEMENT QUEST UPDATE</small>
      <h2 id="placement-choice-title">Which trail feels right?</h2>
      <p>Your learning level is updated. You can keep exploring {activeWorld?.name}, or switch the story map to {WORLD_CATALOG[map.pendingPlacementWorld].name}. Nothing you earned will be lost.</p>
      <div><button onClick={() => onResolvePlacement("stay")}>Stay here</button><button className="primary" onClick={() => onResolvePlacement("switch")}>Switch trails</button></div>
    </section>}

    <div className="mapWorldTabs" aria-label="Word worlds">
      {map.worlds.map((world: { id: Grade; name: string; steps: number; complete: boolean }) =>
        <button key={world.id} className={world.id === map.activeWorld ? "on" : ""}
          aria-pressed={world.id === map.activeWorld}
          onClick={() => onChooseWorld(world.id)}>
          <span>{world.id} grade</span><b>{world.name}</b><small>{world.complete ? "Complete" : `${world.steps}/10 steps`}</small>
        </button>)}
    </div>

    <div className="mapPanel">
      <aside className="mapStatus">
        <span className={"worldEmblem trail" + map.activeWorld} aria-hidden="true">◇</span>
        <small>CURRENT POSITION</small>
        <b>{activeWorld?.currentPosition}</b>
        {map.nextDestination && <p><strong>Next:</strong> {map.nextDestination.name}</p>}
        {map.status === "complete"
          ? <button className="primary" onClick={onStart}>Practice and rescue →</button>
          : map.requiresWorldChoice
            ? <p className="gentleNotice">Choose an unfinished world above to begin the next mission.</p>
            : <button className="primary" onClick={onStart}>Start next mission →</button>}
      </aside>

      <ol className="mapTrail" aria-label={`${activeWorld?.name} locations`}>
        {activeWorld?.locations.map((location: {
          id: string; storyId: string; name: string; order: number; status: keyof typeof labels;
        }) => {
          const locationResidents: Rescue[] = residents[map.activeWorld][location.id] ?? [];
          return <li key={location.id} className={location.status}>
            <span className="trailNode" aria-hidden="true">{location.status === "locked" ? "·" : location.order}</span>
            <div>
              <small>{labels[location.status]}</small>
              <h2>{location.name}</h2>
              {locationResidents.length > 0 && <div className="mapResidents" aria-label={`${locationResidents.length} resident Wordlings`}>
                {locationResidents.map(rescue => <span key={rescue.id} title="Rescued Wordling" aria-label="Rescued Wordling">●</span>)}
              </div>}
              {location.status === "unlocked" && <button onClick={event => { lastStoryTrigger.current = event.currentTarget; setSelectedStory(location.storyId); }}>Read this place’s story</button>}
            </div>
          </li>;
        })}
      </ol>
    </div>

    {storyLocation && <div className="storyBackdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) closeStory(storyLocation.storyId)
    }}>
      <section className="storyDialog" role="dialog" aria-modal="true" aria-labelledby="story-title"
        onKeyDown={event => { if (event.key === "Escape") closeStory(storyLocation.storyId) }}>
        <small className="eyebrow">LOCATION STORY</small>
        <h2 id="story-title">{storyLocation.name}</h2>
        {storyLocation.storySentences.map(sentence => <p key={sentence}>{sentence}</p>)}
        <button ref={closeRef} className="primary" onClick={() => {
          closeStory(storyLocation.storyId);
        }}>Back to my map</button>
      </section>
    </div>}
  </section>;
}

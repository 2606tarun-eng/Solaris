import type { MissionChapter, MissionProfile } from "./missionStories";
import { nasaMissionById } from "./nasaCatalog";

/**
 * Page-4 stories for catalog missions.
 *
 * The chapter data is ~400 KB, and only page 4 needs it, so it is loaded on
 * demand: the atlas bundle never pays for it, and a story page shows its
 * hand-written profile instantly while this resolves.
 */

type GeneratedStory = {
  bodyId: string;
  bodyName: string;
  chapters: MissionChapter[];
};

type ChaptersFile = {
  generatedAt: string;
  stories: Record<string, GeneratedStory>;
};

let pending: Promise<Record<string, GeneratedStory>> | null = null;

function loadStories(): Promise<Record<string, GeneratedStory>> {
  pending ??= import("./generated/nasaChapters.json").then(
    (module) => (module.default as unknown as ChaptersFile).stories ?? {},
  );
  return pending;
}

/** Resolves a generated five-chapter story, or null when the id is unknown. */
export async function nasaStoryFor(id: string): Promise<MissionProfile | null> {
  const key = id.trim().toLowerCase();
  if (!key) return null;

  const stories = await loadStories();
  const story = stories[key];
  const mission = nasaMissionById(key);
  if (!story || !mission) return null;

  return {
    id: mission.id,
    name: mission.name,
    fullName: `${mission.agency} mission to ${mission.bodyName}`,
    agency: mission.agency,
    status: mission.status,
    planetId: mission.bodyId,
    planetName: mission.bodyName,
    launch: String(mission.launched ?? ""),
    orbit: mission.target,
    orbitLabel: "Where",
    goal: mission.summary,
    image: mission.heroImage,
    imageAlt: mission.heroAlt,
    imageCaption: `${mission.name} — NASA imagery.`,
    nasaUrl: mission.href,
    facts: mission.stats,
    chapters: story.chapters,
  };
}

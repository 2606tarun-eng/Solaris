import catalogJson from "./generated/nasaMissions.json";
import type { MissionControlEntry } from "./missionControl";
import type { TimelineEvent } from "./timelineEvents";

/**
 * NASA catalog adapter.
 *
 * `generated/nasaMissions.json` is produced by `backend/scripts/scrape-missions.ts`
 * from science.nasa.gov's mission catalog and images-api.nasa.gov. Nothing here
 * is hand-written: the file is regenerated, and the app keeps working offline
 * because the JSON ships in the bundle.
 *
 * If NASA ever exposes a different shape, this module is the only place that
 * needs to change.
 */

export type NasaMission = {
  id: string;
  name: string;
  agency: string;
  status: "active" | "retired";
  bodyId: string;
  bodyName: string;
  years: string;
  target: string;
  summary: string;
  heroImage: string;
  heroAlt: string;
  stats: Array<{ value: string; label: string }>;
  href: string;
  launched: number | null;
  ended: number | null;
};

type GeneratedCatalog = {
  generatedAt: string;
  source: string;
  counts: Record<string, { active: number; retired: number }>;
  missions: NasaMission[];
  timeline: Array<{
    year: number;
    title: string;
    kind: string;
    planetId?: string;
    detail: string;
  }>;
};

const catalog = catalogJson as GeneratedCatalog;

export const nasaCatalogGeneratedAt = catalog.generatedAt;
export const nasaMissions: NasaMission[] = catalog.missions ?? [];

const byBody = new Map<string, NasaMission[]>();
for (const mission of nasaMissions) {
  const list = byBody.get(mission.bodyId);
  if (list) list.push(mission);
  else byBody.set(mission.bodyId, [mission]);
}

export function nasaMissionsFor(bodyId: string): NasaMission[] {
  return byBody.get(bodyId) ?? [];
}

const byId = new Map(nasaMissions.map((mission) => [mission.id, mission]));

export function nasaMissionById(id: string): NasaMission | null {
  return byId.get(id.trim().toLowerCase()) ?? null;
}

/** Panel row for the mission control drawer. */
export function toControlEntry(mission: NasaMission): MissionControlEntry {
  return {
    id: mission.id,
    name: mission.name,
    agency: mission.agency,
    status: mission.status,
    years: mission.years,
    target: mission.target,
    summary: mission.summary,
    heroImage: mission.heroImage,
    heroAlt: mission.heroAlt,
    stats: mission.stats,
    // The chapter images live in the lazy-loaded nasaChapters.json.
    // For the control drawer we only need a hero + a couple of frames.
    media: [
      { id: `${mission.id}-hero`, kind: "photo" as const, src: mission.heroImage, caption: mission.heroAlt },
    ],
    href: mission.href,
  };
}

const entryCache = new Map<string, MissionControlEntry[]>();

export function generatedEntriesFor(bodyId: string): MissionControlEntry[] {
  const cached = entryCache.get(bodyId);
  if (cached) return cached;
  const entries = nasaMissionsFor(bodyId)
    .slice()
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return (b.launched ?? 0) - (a.launched ?? 0);
    })
    .map(toControlEntry);
  entryCache.set(bodyId, entries);
  return entries;
}

export function generatedCountsFor(bodyId: string): { active: number; retired: number } {
  const missions = nasaMissionsFor(bodyId);
  return {
    active: missions.filter((mission) => mission.status === "active").length,
    retired: missions.filter((mission) => mission.status === "retired").length,
  };
}

/**
 * Launch events for the timeline. The hand-written timeline keeps the story
 * beats; these add the real launch record. Capped per year so a busy decade
 * does not turn the strip into a solid line.
 */
export function generatedTimelineEvents(perYear = 2): TimelineEvent[] {
  const seenPerYear = new Map<number, number>();
  const events: TimelineEvent[] = [];
  for (const event of catalog.timeline ?? []) {
    const used = seenPerYear.get(event.year) ?? 0;
    if (used >= perYear) continue;
    seenPerYear.set(event.year, used + 1);
    events.push({
      year: event.year,
      title: event.title,
      kind: "launch",
      planetId: event.planetId,
      detail: event.detail,
    });
  }
  return events;
}

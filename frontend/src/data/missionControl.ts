import { img } from "../assets";
import { missionByPlanet, planetStories, type ProjectStatus } from "./missions";
import { planetById } from "./planets";
import { projectCounts, projectsByPlanet, projectYears } from "./projects";

/**
 * Mission Control HUD data.
 *
 * Saturn is hand-authored because it is the reference screen: the Cassini /
 * Huygens story is the one worth telling in full. Every other planet is
 * *derived* from the real mission data in `missions.ts` / `projects.ts`, so a
 * tap on any world opens a truthful panel instead of an empty drawer.
 *
 * Imagery note: every `src` points at a file that already ships in
 * `public/assets`. Captions describe what each frame actually shows — we have
 * Cassini-era Saturn portraits and archive mosaics, not per-spacecraft hardware
 * photos, so the captions say "Saturn", never "a photo of the probe". Drop real
 * hardware stills into `public/assets/missions/` and swap the paths here.
 */

export type MediaKind = "photo" | "video";

export type MissionMedia = {
  id: string;
  kind: MediaKind;
  /** Thumbnail, also used as the hero when selected. */
  src: string;
  /** Shown under the hero and under the thumbnail. */
  caption: string;
  /** Video frames link to the NASA archive instead of playing inline. */
  href?: string;
};

export type MissionStat = {
  label: string;
  value: string;
};

export type MissionControlEntry = {
  id: string;
  name: string;
  agency: string;
  status: ProjectStatus;
  /** Display string, e.g. "1997–2017". */
  years: string;
  /** Short mission line shown as the accordion subtitle. */
  target: string;
  summary: string;
  /** Frame shown before the reader picks anything from the gallery. */
  heroImage: string;
  heroAlt: string;
  stats: MissionStat[];
  media: MissionMedia[];
  /** Outbound NASA page, if one is known. */
  href?: string;
};

export type PlanetMissionControl = {
  planetId: string;
  planetName: string;
  headline: string;
  brief: string;
  /** Palette used to build the focused 3D sphere. */
  sphere: {
    bands: string[];
    highlight: string;
    shadow: string;
  };
  /** Saturn-style ring system, optional. */
  rings?: {
    /** Degrees of tilt on the X axis. */
    tilt: number;
    band: string;
    bandSoft: string;
    gap: string;
  };
  counts: { active: number; retired: number };
  entries: MissionControlEntry[];
};

/* ------------------------------------------------------------ Saturn frames */

const saturnHero = img.planetSaturn;
const saturnRings = `${import.meta.env.BASE_URL}assets/saturn-hero.jpg`;
const saturnMosaic = img.missionSaturn;

const saturnGallery: MissionMedia[] = [
  {
    id: "rings",
    kind: "photo",
    src: saturnRings,
    caption: "Saturn and its rings, imaged by Cassini.",
  },
  {
    id: "portrait",
    kind: "photo",
    src: saturnHero,
    caption: "The ringed planet in full sunlight.",
  },
  {
    id: "mosaic",
    kind: "photo",
    src: saturnMosaic,
    caption: "A narrow-angle camera mosaic strip from the Cassini archive.",
  },
];

/* ------------------------------------------------------------------- Saturn */

const saturn: PlanetMissionControl = {
  planetId: "saturn",
  planetName: "Saturn",
  headline: "The ringed beauty",
  brief:
    "Four spacecraft have crossed Saturn's orbit. One stayed for thirteen years and then flew into the planet on purpose.",
  sphere: {
    bands: [
      "#b6a07a",
      "#f0e5c8",
      "#cdb992",
      "#f7efd9",
      "#c6ae86",
      "#e9dcba",
      "#bda87f",
      "#e2d2ae",
      "#b8a077",
      "#ded0ae",
      "#ab9570",
    ],
    highlight: "rgba(255, 248, 226, 0.55)",
    shadow: "rgba(24, 16, 8, 0.82)",
  },
  rings: {
    tilt: 70,
    band: "rgba(232, 214, 178, 0.62)",
    bandSoft: "rgba(214, 190, 150, 0.24)",
    gap: "rgba(10, 8, 6, 0.34)",
  },
  counts: { active: 1, retired: 4 },
  entries: [
    {
      id: "dragonfly",
      name: "Dragonfly",
      agency: "NASA / APL",
      status: "active",
      years: "2028–",
      target: "Titan · in development",
      summary:
        "A nuclear-powered rotorcraft that will fly between landing sites on Titan, Saturn's biggest moon. Titan has rivers and seas of liquid methane, and the ingredients for life may be waiting in them.",
      heroImage: saturnHero,
      heroAlt: "Saturn, the system Dragonfly is travelling to",
      stats: [
        { value: "2028", label: "Planned launch" },
        { value: "8", label: "Rotors" },
        { value: "Titan", label: "Destination" },
      ],
      media: saturnGallery,
      href: "https://science.nasa.gov/mission/dragonfly/",
    },
    {
      id: "cassini",
      name: "Cassini",
      agency: "NASA / ESA / ASI",
      status: "retired",
      years: "1997–2017",
      target: "Orbiter · 294 orbits",
      summary:
        "Cassini spent thirteen years weaving between Saturn's rings and its moons. It found a warm salty ocean under Enceladus, watched storms churn across the planet, and then dove into Saturn itself so it could never disturb a moon that might hold life.",
      heroImage: saturnRings,
      heroAlt: "Saturn and its rings, imaged by Cassini",
      stats: [
        { value: "294", label: "Orbits of Saturn" },
        { value: "13 yrs", label: "At Saturn" },
        { value: "7.9B km", label: "Distance travelled" },
        { value: "2004", label: "Arrival" },
      ],
      media: saturnGallery,
      href: "https://science.nasa.gov/mission/cassini/",
    },
    {
      id: "huygens",
      name: "Huygens probe",
      agency: "ESA",
      status: "retired",
      years: "1997–2005",
      target: "Lander · Titan",
      summary:
        "Huygens rode to Saturn bolted to Cassini, then dropped away and fell through Titan's orange haze. It sent back the first pictures from the surface of a moon in the outer solar system, showing rounded ice pebbles and a soggy plain.",
      heroImage: saturnHero,
      heroAlt: "Saturn, seen during the Cassini–Huygens mission",
      stats: [
        { value: "2005", label: "Landed on Titan" },
        { value: "72 min", label: "Sent data from the ground" },
        { value: "1", label: "First landing on a moon" },
        { value: "1,200 km", label: "Descent" },
      ],
      media: saturnGallery,
      href: "https://science.nasa.gov/mission/cassini/",
    },
    {
      id: "voyager-1",
      name: "Voyager 1",
      agency: "NASA / JPL",
      status: "retired",
      years: "1977–1980",
      target: "Flyby · 1980",
      summary:
        "Voyager 1 swept past Saturn in November 1980 and sent back the first really sharp pictures of the rings. It found a twisted braid inside the F ring and a strange hexagonal storm sitting over the north pole. Then it turned and headed for interstellar space.",
      heroImage: saturnHero,
      heroAlt: "Saturn, from the NASA planetary archive",
      stats: [
        { value: "1980", label: "Saturn flyby" },
        { value: "124,000 km", label: "Closest approach" },
        { value: "1", label: "Six-sided polar storm found" },
      ],
      media: saturnGallery,
      href: "https://science.nasa.gov/mission/voyager/",
    },
    {
      id: "pioneer-11",
      name: "Pioneer 11",
      agency: "NASA / Ames",
      status: "retired",
      years: "1973–1979",
      target: "Flyby · 1979",
      summary:
        "Pioneer 11 was the first spacecraft ever to reach Saturn. It threaded a risky path through the ring plane, survived, and discovered a brand new ring the astronomers had not known about.",
      heroImage: saturnHero,
      heroAlt: "Saturn, from the NASA planetary archive",
      stats: [
        { value: "1979", label: "First to reach Saturn" },
        { value: "1", label: "New ring discovered" },
        { value: "20,000 km", label: "Closest approach" },
      ],
      media: saturnGallery,
      href: "https://science.nasa.gov/mission/pioneer-11/",
    },
  ],
};

/* --------------------------------------------------- derived for everyone else */

const spherePalettes: Record<string, PlanetMissionControl["sphere"]> = {
  mercury: {
    bands: ["#6d6963", "#a5a099", "#7b766f", "#b3ada4", "#69655f", "#948f88", "#5c5852"],
    highlight: "rgba(255, 250, 240, 0.34)",
    shadow: "rgba(10, 9, 8, 0.86)",
  },
  venus: {
    bands: ["#c9a96e", "#f4e6c2", "#dfcaa0", "#efdfb8", "#cdb387", "#e8d7b0", "#bfa073"],
    highlight: "rgba(255, 250, 226, 0.5)",
    shadow: "rgba(48, 32, 12, 0.82)",
  },
  earth: {
    bands: ["#dbe8f0", "#2f7a4f", "#1f5f92", "#2f7a4f", "#1f5f92", "#2f7a9e", "#dbe8f0"],
    highlight: "rgba(240, 250, 255, 0.55)",
    shadow: "rgba(4, 12, 22, 0.84)",
  },
  mars: {
    bands: ["#8e4630", "#c9704c", "#a8523a", "#c16845", "#9c4b34", "#bd6242", "#8e4630"],
    highlight: "rgba(255, 240, 224, 0.42)",
    shadow: "rgba(28, 10, 6, 0.84)",
  },
  jupiter: {
    bands: [
      "#8f6444",
      "#e8dcc8",
      "#c49a72",
      "#f0e6d4",
      "#b98b63",
      "#dcc7a8",
      "#a1734f",
      "#efe1c6",
      "#b0825c",
      "#d8c3a5",
      "#8c6242",
    ],
    highlight: "rgba(255, 250, 238, 0.48)",
    shadow: "rgba(26, 16, 8, 0.82)",
  },
  uranus: {
    bands: ["#6fb0bd", "#c3eaee", "#93ccd4", "#b2dfe4", "#7dbcc7", "#a8dbe0", "#6fb0bd"],
    highlight: "rgba(240, 255, 255, 0.5)",
    shadow: "rgba(8, 26, 32, 0.8)",
  },
  neptune: {
    bands: ["#23479a", "#5c8ce6", "#3b6fd4", "#4f80dd", "#2d5ab8", "#5583de", "#23479a"],
    highlight: "rgba(226, 236, 255, 0.45)",
    shadow: "rgba(4, 10, 30, 0.84)",
  },
};

function derivedMedia(planetId: string): MissionMedia[] {
  const featured = missionByPlanet[planetId];
  const planet = planetById[planetId];
  const list: MissionMedia[] = [];
  if (featured) {
    list.push({
      id: "feature",
      kind: "photo",
      src: featured.image,
      caption: `${featured.name} archive frame.`,
    });
  }
  list.push({
    id: "world",
    kind: "photo",
    src: planet?.hero ?? planet?.src ?? featured?.image ?? "",
    caption: `${planet?.name ?? "This world"}, from the NASA planetary archive.`,
  });
  return list;
}

function derivedEntries(planetId: string): MissionControlEntry[] {
  const planet = planetById[planetId];
  const featured = missionByPlanet[planetId];
  const list = projectsByPlanet[planetId] ?? [];
  const media = derivedMedia(planetId);
  const hero = media[0]?.src ?? "";

  return list.map((project) => {
    const isFeatured = Boolean(project.featured && featured);
    const finished = project.status === "retired";
    return {
      id: project.id,
      name: project.name,
      agency: project.agency,
      status: project.status,
      years: projectYears(project),
      target: isFeatured && featured ? featured.headline : finished ? "Retired explorer" : "Still exploring",
      summary:
        isFeatured && featured
          ? featured.summary
          : `${project.name} (${project.agency}) ${
              finished ? "has finished its mission" : "is still exploring"
            } at ${planet?.name ?? "this world"}.`,
      heroImage: isFeatured && featured ? featured.image : hero,
      heroAlt: `${project.name} mission archive image`,
      stats:
        isFeatured && featured
          ? featured.stats
          : [
              { label: "Launched", value: String(project.launched) },
              { label: "Agency", value: project.agency },
              { label: finished ? "Ended" : "Status", value: finished ? String(project.ended ?? "—") : "Active" },
            ],
      media,
      href: isFeatured && featured ? featured.nasaUrl : undefined,
    };
  });
}

const derived: Record<string, PlanetMissionControl> = Object.fromEntries(
  Object.keys(planetById).map((planetId) => {
    const planet = planetById[planetId];
    const story = planetStories[planetId];
    const entries = derivedEntries(planetId);
    return [
      planetId,
      {
        planetId,
        planetName: planet.name,
        headline: story?.headline ?? planet.tagline,
        brief: story?.intro ?? `${planet.name}, from the atlas.`,
        sphere:
          spherePalettes[planetId] ?? {
            bands: ["#9ca3af", "#6b7280", "#d1d5db", "#4b5563"],
            highlight: "rgba(255, 255, 255, 0.4)",
            shadow: "rgba(8, 8, 10, 0.84)",
          },
        counts: projectCounts(planetId),
        entries,
      } satisfies PlanetMissionControl,
    ];
  }),
);

/** Full Mission Control data for one planet. Saturn is hand-authored. */
export function missionControlFor(planetId: string): PlanetMissionControl | null {
  if (planetId === "saturn") return saturn;
  return derived[planetId] ?? null;
}

export const missionControl = { ...derived, saturn } as Record<string, PlanetMissionControl>;

import { img } from "../assets";
import { missionByPlanet, planetStories, type ProjectStatus } from "./missions";
import { generatedCountsFor, generatedEntriesFor } from "./nasaCatalog";
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
  counts: { active: 0, retired: 4 },
  entries: [
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

/* --------------------------------------------------------------------- Moon */

const moonPhoto = (id: string, size: "orig" | "large" = "large") =>
  `https://images-assets.nasa.gov/image/${id}/${id}~${size}.jpg`;

const moonNearside = moonPhoto("PIA00405");
const moonFarside = moonPhoto("GSFC_20171208_Archive_e001939", "orig");
const moonApollo11 = moonPhoto("as11-40-5875");
const moonApollo17 = moonPhoto("jsc2004e52775");
const moonClementine = moonPhoto("PIA00434", "orig");
const moonCrater = moonPhoto("PIA13008", "orig");
const moonSurveyor = moonPhoto("LRC-1967-B701_P-04028");

const moonGallery: MissionMedia[] = [
  {
    id: "nearside",
    kind: "photo",
    src: moonNearside,
    caption: "The Moon's near side, from NASA's planetary archive.",
  },
  {
    id: "farside",
    kind: "photo",
    src: moonFarside,
    caption: "The far side of the Moon, assembled from orbital images.",
  },
  {
    id: "apollo-11",
    kind: "photo",
    src: moonApollo11,
    caption: "Apollo 11 astronaut Buzz Aldrin beside the U.S. flag in 1969.",
  },
  {
    id: "apollo-17",
    kind: "photo",
    src: moonApollo17,
    caption: "A panorama of the lunar surface from Apollo 17 in 1972.",
  },
];

const moon: PlanetMissionControl = {
  planetId: "moon",
  planetName: "Moon",
  headline: "Our constant companion",
  brief:
    "Earth's only natural satellite — and the only other world humans have walked on. These are the robots still working there, and the pioneers who came before.",
  sphere: {
    bands: ["#4c4a46", "#9a958c", "#6b6760", "#b7b1a6", "#5d5a55", "#a39d93", "#43413e"],
    highlight: "rgba(255, 252, 244, 0.34)",
    shadow: "rgba(8, 8, 10, 0.9)",
  },
  counts: { active: 4, retired: 5 },
  entries: [
    {
      id: "lro",
      name: "Lunar Reconnaissance Orbiter",
      agency: "NASA",
      status: "active",
      years: "2009–now",
      target: "Orbiter · mapping the Moon",
      summary:
        "LRO has been circling the Moon since 2009. Its cameras map the surface in sharp detail and help mission planners pick safe landing spots.",
      heroImage: moonNearside,
      heroAlt: "The Moon, the world LRO has mapped since 2009",
      stats: [
        { value: "2009", label: "Launched" },
        { value: "17 yrs", label: "Mapping the Moon" },
        { value: "3D", label: "Surface map" },
      ],
      media: moonGallery,
      href: "https://science.nasa.gov/mission/lro/",
    },
    {
      id: "capstone",
      name: "CAPSTONE",
      agency: "NASA / Advanced Space",
      status: "active",
      years: "2022–now",
      target: "Orbiter · testing the Gateway orbit",
      summary:
        "A small CubeSat that tested the stretched orbit planned for the Gateway station. It proved the path works, paving the way for future lunar infrastructure.",
      heroImage: moonNearside,
      heroAlt: "The Moon, where CAPSTONE tested a new orbit",
      stats: [
        { value: "2022", label: "Launched" },
        { value: "1", label: "CubeSat" },
        { value: "NRHO", label: "Test orbit" },
      ],
      media: moonGallery,
      href: "https://science.nasa.gov/mission/capstone/",
    },
    {
      id: "danuri",
      name: "Danuri (KPLO)",
      agency: "KARI / NASA",
      status: "active",
      years: "2022–now",
      target: "Orbiter · Korea's lunar explorer",
      summary:
        "South Korea's first Moon mission is mapping the surface, measuring magnetic fields and hunting for signs of water ice in shadowed craters.",
      heroImage: moonFarside,
      heroAlt: "The Moon, mapped by the Danuri orbiter",
      stats: [
        { value: "2022", label: "Launched" },
        { value: "1", label: "Orbiter" },
        { value: "ShadowCam", label: "Instrument" },
      ],
      media: moonGallery,
      href: "https://www.kari.re.kr/eng/sub03_04_01.do",
    },
    {
      id: "change-4",
      name: "Chang'e 4",
      agency: "CNSA",
      status: "active",
      years: "2018–now",
      target: "Lander · far side",
      summary:
        "The first mission to land on the Moon's far side. Its Yutu-2 rover is still exploring an ancient, battered landscape.",
      heroImage: moonFarside,
      heroAlt: "The far side of the Moon, explored by Chang'e 4",
      stats: [
        { value: "2019", label: "Landed" },
        { value: "1", label: "Rover" },
        { value: "Far side", label: "First" },
      ],
      media: moonGallery,
      href: "https://www.cnsa.gov.cn/",
    },
    {
      id: "apollo-11",
      name: "Apollo 11",
      agency: "NASA",
      status: "retired",
      years: "1969",
      target: "Lander · first crewed landing",
      summary:
        "Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon while Michael Collins orbited above.",
      heroImage: moonApollo11,
      heroAlt: "Apollo 11 astronaut Buzz Aldrin on the Moon",
      stats: [
        { value: "1969", label: "Landed" },
        { value: "2", label: "Moonwalkers" },
        { value: "21.5 h", label: "On the surface" },
      ],
      media: moonGallery,
      href: "https://science.nasa.gov/mission/apollo-11/",
    },
    {
      id: "apollo-17",
      name: "Apollo 17",
      agency: "NASA",
      status: "retired",
      years: "1972",
      target: "Lander · last crewed landing",
      summary:
        "The last Apollo landing. Geologist Harrison Schmitt and Gene Cernan spent three days on the surface and brought home 111 kg of Moon rock.",
      heroImage: moonApollo17,
      heroAlt: "Apollo 17 panorama of the lunar surface",
      stats: [
        { value: "1972", label: "Landed" },
        { value: "3", label: "Crew" },
        { value: "75 h", label: "On the surface" },
      ],
      media: moonGallery,
      href: "https://science.nasa.gov/mission/apollo-17/",
    },
    {
      id: "luna-2",
      name: "Luna 2",
      agency: "USSR",
      status: "retired",
      years: "1959",
      target: "Impactor · first Moon impact",
      summary:
        "The first human-made object to reach the Moon. It struck the surface in 1959 and proved that the journey was possible.",
      heroImage: moonCrater,
      heroAlt: "A lunar crater, the kind of terrain Luna 2 impacted",
      stats: [
        { value: "1959", label: "Impacted" },
        { value: "1st", label: "To reach the Moon" },
        { value: "Moon", label: "Target" },
      ],
      media: moonGallery,
      href: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1959-014A",
    },
    {
      id: "surveyor-1",
      name: "Surveyor 1",
      agency: "NASA",
      status: "retired",
      years: "1966",
      target: "Lander · first soft landing",
      summary:
        "Surveyor 1 made the first gentle landing on the Moon, showing that future astronauts could touch down safely.",
      heroImage: moonSurveyor,
      heroAlt: "Surveyor 1 on the Moon",
      stats: [
        { value: "1966", label: "Landed" },
        { value: "1st", label: "Soft landing" },
        { value: "11k", label: "Images returned" },
      ],
      media: moonGallery,
      href: "https://science.nasa.gov/mission/surveyor-1/",
    },
    {
      id: "clementine",
      name: "Clementine",
      agency: "NASA / BMDO",
      status: "retired",
      years: "1994",
      target: "Orbiter · mapping the Moon",
      summary:
        "A small joint NASA/BMDO spacecraft mapped the Moon in many wavelengths and found hints of ice in permanently shadowed craters.",
      heroImage: moonClementine,
      heroAlt: "The Moon observed by Clementine",
      stats: [
        { value: "1994", label: "Launched" },
        { value: "1.8M", label: "Images" },
        { value: "2", label: "Months mapping" },
      ],
      media: moonGallery,
      href: "https://science.nasa.gov/mission/clementine/",
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
      target:
        isFeatured && featured
          ? featured.headline
          : finished
            ? "Retired explorer"
            : "Still exploring",
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
              {
                label: finished ? "Ended" : "Status",
                value: finished ? String(project.ended ?? "—") : "Active",
              },
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
        sphere: spherePalettes[planetId] ?? {
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

/** Full Mission Control data for one planet, curated entries first. */
const controlCache = new Map<string, PlanetMissionControl | null>();

export function missionControlFor(planetId: string): PlanetMissionControl | null {
  const cached = controlCache.get(planetId);
  if (cached !== undefined) return cached;
  const built = buildMissionControl(planetId);
  controlCache.set(planetId, built);
  return built;
}

function buildMissionControl(planetId: string): PlanetMissionControl | null {
  const base =
    planetId === "saturn" ? saturn : planetId === "moon" ? moon : derived[planetId] ?? null;
  const generated = generatedEntriesFor(planetId);

  if (!base) {
    if (generated.length === 0) return null;
    const planet = planetById[planetId];
    return {
      planetId,
      planetName: planet?.name ?? planetId,
      headline: planet?.tagline ?? "",
      brief:
        planetStories[planetId]?.intro ??
        `${planet?.name ?? planetId} missions, from the NASA mission catalog.`,
      sphere: spherePalettes[planetId] ?? {
        bands: ["#9ca3af", "#6b7280", "#d1d5db", "#4b5563"],
        highlight: "rgba(255, 255, 255, 0.4)",
        shadow: "rgba(8, 8, 10, 0.84)",
      },
      counts: generatedCountsFor(planetId),
      entries: generated,
    };
  }

  // Saturn uses a fixed curated set/counts for the atlas display.
  if (planetId === "saturn") return base;

  if (generated.length === 0) return base;

  // Curated copy wins the top of each tab; the NASA catalog fills the rest.
  // A mission that exists in both (Cassini, Apollo 11…) is listed once.
  const seen = new Set<string>();
  const entries: MissionControlEntry[] = [];
  for (const entry of [...base.entries, ...generated]) {
    const keys = [entry.id.toLowerCase(), entry.name.toLowerCase()];
    if (keys.some((key) => seen.has(key))) continue;
    for (const key of keys) seen.add(key);
    entries.push(entry);
  }

  return {
    ...base,
    counts: {
      active: entries.filter((entry) => entry.status === "active").length,
      retired: entries.filter((entry) => entry.status === "retired").length,
    },
    entries,
  };
}

/* ------------------------------------------------------------ 3-D orbits */

export type MissionOrbit = {
  id: string;
  name: string;
  /** Distance from the planet centre, in world units. */
  orbitRadius: number;
  /** Radians per second. */
  speed: number;
  color: string;
  status: ProjectStatus;
};

const orbitColor: Record<ProjectStatus, string> = {
  active: "#34d399",
  retired: "#f97316",
};

/**
 * Lays the planet's missions out as orbit shells: still-active hardware runs
 * the inner tracks, retired explorers take the longer, slower outer ones.
 *
 * Pass `status` to show only one kind — the focus view uses the drawer's
 * tab to pick which set revolves around the planet (capped at 9 shells).
 */
export function orbitMissionsFor(
  data: PlanetMissionControl,
  startRadius = 2.6,
  step = 0.4,
  limit = 9,
  status?: ProjectStatus,
): MissionOrbit[] {
  const ordered = [...data.entries]
    .filter((entry) => !status || entry.status === status)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return 0;
    });

  // Only the first few get a visible orbit: a planet page can list a hundred
  // real missions, but a hundred rings would be unreadable noise.
  return ordered.slice(0, limit).map((entry, index) => ({
    id: entry.id,
    name: entry.name,
    orbitRadius: Number((startRadius + index * step).toFixed(2)),
    speed: Number((0.32 / (1 + index * 0.24)).toFixed(3)),
    color: orbitColor[entry.status],
    status: entry.status,
  }));
}

export const missionControl = { ...derived, saturn, moon } as Record<
  string,
  PlanetMissionControl
>;

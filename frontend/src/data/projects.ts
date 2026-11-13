import { missions, type ProjectStatus } from "./missions";

export type Project = {
  id: string;
  planetId: string;
  name: string;
  agency: string;
  status: ProjectStatus;
  launched: number;
  ended?: number;
  /** The featured mission for this planet gets a bigger dot. */
  featured?: boolean;
};

type ProjectSeed = Omit<Project, "featured">;

/**
 * Extra projects that orbit each planet. Real spacecraft are used so the neon
 * dots describe something true: green means still exploring, orange means retired.
 */
const extraProjects: ProjectSeed[] = [
  {
    id: "bepicolombo",
    planetId: "mercury",
    name: "BepiColombo",
    agency: "ESA / JAXA",
    status: "active",
    launched: 2018,
  },
  {
    id: "messenger",
    planetId: "mercury",
    name: "MESSENGER",
    agency: "NASA",
    status: "retired",
    launched: 2004,
    ended: 2015,
  },
  {
    id: "akatsuki",
    planetId: "venus",
    name: "Akatsuki",
    agency: "JAXA",
    status: "active",
    launched: 2010,
  },
  {
    id: "venus-express",
    planetId: "venus",
    name: "Venus Express",
    agency: "ESA",
    status: "retired",
    launched: 2005,
    ended: 2014,
  },
  {
    id: "landsat-9",
    planetId: "earth",
    name: "Landsat 9",
    agency: "NASA / USGS",
    status: "active",
    launched: 2021,
  },
  {
    id: "iss",
    planetId: "earth",
    name: "Space Station",
    agency: "NASA + partners",
    status: "active",
    launched: 1998,
  },
  {
    id: "perseverance",
    planetId: "mars",
    name: "Perseverance",
    agency: "NASA / JPL",
    status: "active",
    launched: 2020,
  },
  {
    id: "curiosity",
    planetId: "mars",
    name: "Curiosity",
    agency: "NASA / JPL",
    status: "active",
    launched: 2011,
  },
  {
    id: "maven",
    planetId: "mars",
    name: "MAVEN",
    agency: "NASA",
    status: "active",
    launched: 2013,
  },
  {
    id: "insight",
    planetId: "mars",
    name: "InSight",
    agency: "NASA / JPL",
    status: "retired",
    launched: 2018,
    ended: 2022,
  },
  {
    id: "juno",
    planetId: "jupiter",
    name: "Juno",
    agency: "NASA / JPL",
    status: "active",
    launched: 2011,
  },
  {
    id: "europa-clipper",
    planetId: "jupiter",
    name: "Europa Clipper",
    agency: "NASA / JPL",
    status: "active",
    launched: 2024,
  },
  {
    id: "juice",
    planetId: "jupiter",
    name: "JUICE",
    agency: "ESA",
    status: "active",
    launched: 2023,
  },
  {
    id: "pioneer-10-jupiter",
    planetId: "jupiter",
    name: "Pioneer 10",
    agency: "NASA / Ames",
    status: "retired",
    launched: 1972,
    ended: 1973,
  },
  {
    id: "pioneer-11-jupiter",
    planetId: "jupiter",
    name: "Pioneer 11",
    agency: "NASA / Ames",
    status: "retired",
    launched: 1973,
    ended: 1974,
  },
  {
    id: "voyager-1-jupiter",
    planetId: "jupiter",
    name: "Voyager 1 at Jupiter",
    agency: "NASA / JPL",
    status: "retired",
    launched: 1977,
    ended: 1979,
  },
  {
    id: "voyager-2-jupiter",
    planetId: "jupiter",
    name: "Voyager 2 at Jupiter",
    agency: "NASA / JPL",
    status: "retired",
    launched: 1977,
    ended: 1979,
  },
  {
    id: "ulysses-jupiter",
    planetId: "jupiter",
    name: "Ulysses",
    agency: "ESA / NASA",
    status: "retired",
    launched: 1990,
    ended: 1992,
  },
  {
    id: "cassini-jupiter",
    planetId: "jupiter",
    name: "Cassini at Jupiter",
    agency: "NASA / ESA / ASI",
    status: "retired",
    launched: 1997,
    ended: 2000,
  },
  {
    id: "new-horizons-jupiter",
    planetId: "jupiter",
    name: "New Horizons at Jupiter",
    agency: "NASA / APL",
    status: "retired",
    launched: 2006,
    ended: 2007,
  },
  {
    id: "huygens",
    planetId: "saturn",
    name: "Huygens probe",
    agency: "ESA",
    status: "retired",
    launched: 1997,
    ended: 2005,
  },
  {
    id: "voyager-1",
    planetId: "saturn",
    name: "Voyager 1",
    agency: "NASA / JPL",
    status: "retired",
    launched: 1977,
    ended: 1980,
  },
  {
    id: "pioneer-11",
    planetId: "saturn",
    name: "Pioneer 11",
    agency: "NASA / Ames",
    status: "retired",
    launched: 1973,
    ended: 1979,
  },
];

const featuredProjects: Project[] = missions.map((mission) => ({
  id: mission.id,
  planetId: mission.planetId,
  name: mission.name,
  agency: mission.agency,
  status: mission.status,
  launched: mission.launched,
  ended: mission.ended,
  featured: true,
}));

export const projects: Project[] = [...featuredProjects, ...extraProjects];

export const projectsByPlanet: Record<string, Project[]> = {};

for (const project of projects) {
  projectsByPlanet[project.planetId] ??= [];
  projectsByPlanet[project.planetId].push(project);
}

for (const list of Object.values(projectsByPlanet)) {
  list.sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return b.launched - a.launched;
  });
}

const currentYear = new Date().getFullYear();

/** "1997–2017", "2011–now", or "2028–" for something still on the ground. */
export function projectYears(project: Project) {
  if (project.ended) return `${project.launched}–${project.ended}`;
  if (project.launched > currentYear) return `${project.launched}–`;
  return `${project.launched}–now`;
}

export function projectCounts(planetId: string) {
  const list = projectsByPlanet[planetId] ?? [];
  return {
    active: list.filter((project) => project.status === "active").length,
    retired: list.filter((project) => project.status === "retired").length,
  };
}

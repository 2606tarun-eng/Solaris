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
 * dots describe something true: cyan means still exploring, orange means retired.
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
    id: "huygens",
    planetId: "saturn",
    name: "Huygens probe",
    agency: "ESA",
    status: "retired",
    launched: 1997,
    ended: 2005,
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

export function projectYears(project: Project) {
  return project.ended ? `${project.launched}–${project.ended}` : `${project.launched}–now`;
}

export function projectCounts(planetId: string) {
  const list = projectsByPlanet[planetId] ?? [];
  return {
    active: list.filter((project) => project.status === "active").length,
    retired: list.filter((project) => project.status === "retired").length,
  };
}

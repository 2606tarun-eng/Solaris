import { projectsByPlanet, type Project } from "../data/projects";

/**
 * Data adapter for planet projects.
 *
 * Today it returns the bundled, hand-checked project list so the demo always
 * works offline. When the official NASA dataset arrives, replace the body of
 * `fetchPlanetProjects` with the real request — the UI only depends on the
 * `Project` shape, so nothing else needs to change.
 */
export async function fetchPlanetProjects(planetId: string): Promise<Project[]> {
  return getPlanetProjects(planetId);
}

export function getPlanetProjects(planetId: string): Project[] {
  return projectsByPlanet[planetId] ?? [];
}

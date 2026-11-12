import {
  projectsByPlanet,
  type Project,
} from "../data/projects";

/**
 * Data adapter for planet projects.
 *
 * When the Solaris backend is reachable, it serves up-to-date data from its
 * SQLite cache (which in turn caches NASA). When it is not, this module falls
 * back to the bundled, hand-checked project list so the atlas always works
 * offline.
 *
 * The UI only depends on the `Project` shape, so nothing else changes.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

/** Short timeout so a sleeping backend never blocks the first paint. */
const TIMEOUT_MS = 2500;

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPlanetProjects(planetId: string): Promise<Project[]> {
  const remote = await apiFetch<Project[]>(`/api/projects?planet=${encodeURIComponent(planetId)}`);
  if (remote && remote.length) return remote;
  return getPlanetProjects(planetId);
}

export function getPlanetProjects(planetId: string): Project[] {
  return projectsByPlanet[planetId] ?? [];
}

/** URL of the backend, exposed for other data helpers that want to opt in. */
export const apiBaseUrl = API_BASE;

import type { MouseEvent } from "react";

/**
 * Route helpers for the mission story page.
 *
 * The atlas routes by hand in `Root.tsx` with the History API, so page 4 uses
 * exactly the same mechanism instead of pulling in a router. Links stay real
 * `<a href>` elements, so middle-click, ctrl-click and "copy link" all work.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

/** `/mission/maven` (respects the Vite base path). */
export function missionPath(id: string) {
  return `${BASE}/mission/${encodeURIComponent(id)}`;
}

/** The atlas, which hosts pages 2 and 3. */
export function atlasPath() {
  return `${BASE}/app`;
}

/** Reads the mission id out of a pathname, or null when it is not a mission route. */
export function missionIdFromPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  const relative = BASE && path.startsWith(BASE) ? path.slice(BASE.length) || "/" : path;
  const match = /^\/mission\/([^/]+)$/.exec(relative);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** Pushes a new URL and tells `Root` to re-render, mirroring a browser back/forward. */
export function go(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

/**
 * Intercepts a plain left click so it can be handled with `go()`, while leaving
 * modified clicks (new tab / new window) to the browser.
 */
export function handlePlainClick(event: MouseEvent<HTMLAnchorElement>, path: string) {
  if (event.defaultPrevented) return;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;

  event.preventDefault();
  go(path);
}

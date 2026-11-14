import { useCallback, useEffect, useState } from "react";
import App from "./App";
import LandingIntro from "./components/LandingIntro";
import MissionStoryPage from "./components/mission-story/MissionStoryPage";
import SolarisFlash from "./components/SolarisFlash";
import { missionIdFromPath } from "./lib/missionRoute";

/**
 * Minimal two-route entry point.
 *
 *   "/"              -> Solaris splash landing page
 *   "/app"           -> the Solaris mission atlas
 *   "/system"        -> alias for "/app"
 *   "/mission/:id"   -> page 4, the mission story (opens from page 3)
 *
 * <SolarisFlash /> is rendered above both routes so the warp flash can expand
 * while the landing is mounted and breathe out after the atlas mounts.
 */

const APP_SEGMENTS = ["app", "system"];

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

function currentSegment() {
  if (typeof window === "undefined") return "/";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const relative = BASE && path.startsWith(BASE) ? path.slice(BASE.length) || "/" : path;
  return relative;
}

function isAppRoute() {
  return APP_SEGMENTS.includes(currentSegment().replace(/^\/+/, ""));
}

function currentMissionId() {
  if (typeof window === "undefined") return null;
  return missionIdFromPath(window.location.pathname);
}

export default function Root() {
  const [inApp, setInApp] = useState(isAppRoute);
  const [missionId, setMissionId] = useState(currentMissionId);

  useEffect(() => {
    const sync = () => {
      setInApp(isAppRoute());
      setMissionId(currentMissionId());
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    // The mission page sets its own title from the mission data.
    if (missionId) return;
    document.title = inApp ? "Solaris — Mission Atlas" : "Solaris — NASA Space Apps 2026";
  }, [inApp, missionId]);

  const enterApp = useCallback(() => {
    window.history.pushState({}, "", `${BASE}/app`);
    setInApp(true);
    setMissionId(null);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SolarisFlash />
      {missionId ? (
        <MissionStoryPage missionId={missionId} />
      ) : inApp ? (
        <App />
      ) : (
        <LandingIntro onEnter={enterApp} enterHref={`${BASE}/app`} />
      )}
    </>
  );
}

import { useCallback, useEffect, useState } from "react";
import App from "./App";
import LandingIntro from "./components/LandingIntro";
import SolarisFlashSimplified from "./components/SolarisFlashSimplified";

/**
 * Minimal two-route entry point.
 *
 *   "/"              -> Solaris splash landing page
 *   "/app"           -> the existing AstroRelics atlas (untouched)
 *   "/system"        -> alias for "/app"
 *
 * <SolarisFlashSimplified /> is rendered above both routes so the warp flash can expand
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

export default function Root() {
  const [inApp, setInApp] = useState(isAppRoute);

  const enterApp = useCallback(() => {
    window.history.pushState({}, "", `${BASE}/app`);
    setInApp(true);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const sync = () => setInApp(isAppRoute());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    document.title = inApp ? "AstroRelics — Mission Atlas" : "Solaris — NASA Space Apps 2026";
  }, [inApp]);

  return (
    <>
      <SolarisFlashSimplified />
      {inApp ? <App /> : <LandingIntro onEnter={enterApp} enterHref={`${BASE}/app`} />}
    </>
  );
}

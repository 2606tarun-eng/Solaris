import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AboutPanel from "./components/AboutPanel";
import MissionMap from "./components/MissionMap";
import NavBar from "./components/NavBar";
import StatusBar from "./components/StatusBar";
import StarfieldCanvas from "./components/StarfieldCanvas";
import Timeline from "./components/Timeline";
import type { MissionFilter } from "./components/OrbitSystem";
import { flashBus, forecastSunPoint } from "./lib/flashBus";
import useCamera, { type PlanetPosition } from "./hooks/useCamera";
import usePerformanceTier from "./hooks/usePerformanceTier";
import useReducedMotion from "./hooks/useReducedMotion";
import { TIMELINE_END, planetsForYear } from "./data/timelineEvents";

export default function AstroRelicsMissionAtlas() {
  const reducedMotion = useReducedMotion();
  const tier = usePerformanceTier();

  // One source of truth for the cinematic focus: null = macro map, an id =
  // micro view (3-D planet left, mission control right).
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const selectedPlanetId = focusedPlanet;
  const drawerOpen = focusedPlanet !== null;
  const [tourActive, setTourActive] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [filter, setFilter] = useState<MissionFilter>("all");
  const [speed, setSpeed] = useState(1);
  const [year, setYear] = useState(TIMELINE_END);
  // Data-sonification master switch (Tone.js will read this next step).
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Record<string, PlanetPosition>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  const camera = useCamera({
    viewportRef,
    cameraRef,
    positionsRef,
    drawerOpen,
    tourActive,
    reducedMotion,
    onExitFocus: () => {
      setFocusedPlanet(null);
    },
  });

  const highlighted = planetsForYear(year);

  // Stage 3 of the flash transition: report the sun's exact screen point so
  // the persisted flash overlay can breathe out into it. The camera centres
  // world (0, 0) — the sun — in the viewport, so its rect centre is the sun.
  // Measure in a layout effect so the breathe-out starts before first paint.
  useLayoutEffect(() => {
    const viewport = camera.viewportRef.current;
    if (viewport) {
      const rect = viewport.getBoundingClientRect();
      flashBus.deliver({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    } else {
      flashBus.deliver(forecastSunPoint());
    }
  }, [camera.viewportRef]);

  const selectPlanet = (id: string) => {
    setTourActive(false);
    setAboutOpen(false);
    setFocusedPlanet(id);
    camera.focusPlanet(id);
  };

  const closeDrawer = () => {
    setFocusedPlanet(null);
    camera.focusPlanet(null);
  };

  const openMap = () => {
    setAboutOpen(false);
    setTourActive(false);
    setFocusedPlanet(null);
    camera.resetView();
  };

  const startTour = () => {
    setAboutOpen(false);
    setFocusedPlanet(null);
    setTourActive(true);
  };

  const exitTour = () => {
    setTourActive(false);
    camera.focusPlanet(null);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      if (event.key !== "Escape") return;
      if (aboutOpen) {
        setAboutOpen(false);
      } else if (tourActive) {
        setTourActive(false);
        camera.focusPlanet(null);
      } else if (drawerOpen) {
        setFocusedPlanet(null);
        camera.focusPlanet(null);
      } else if (!typing) {
        camera.resetView();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen, tourActive, drawerOpen, camera]);

  return (
    <div className="app-shell">
      <StarfieldCanvas tier={tier} reducedMotion={reducedMotion} />

      <NavBar
        activeView={aboutOpen ? "about" : tourActive ? "tour" : "map"}
        onOpenMap={openMap}
        onStartTour={startTour}
        onOpenAbout={() => setAboutOpen(true)}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled((value) => !value)}
      />

      <main className="app-main">
        <MissionMap
          camera={camera}
          cameraRef={cameraRef}
          positionsRef={positionsRef}
          speed={speed}
          onSpeedChange={setSpeed}
          filter={filter}
          onFilterChange={setFilter}
          highlighted={highlighted}
          selectedPlanetId={selectedPlanetId}
          onSelectPlanet={selectPlanet}
          onCloseDrawer={closeDrawer}
          drawerOpen={drawerOpen}
          tourActive={tourActive}
          onExitTour={exitTour}
          reducedMotion={reducedMotion}
          searchRef={searchRef}
          year={year}
        />
      </main>

      <Timeline year={year} onChange={setYear} highlighted={highlighted} speed={speed} />
      <StatusBar />

      {aboutOpen ? (
        <AboutPanel
          onClose={() => setAboutOpen(false)}
          onStartTour={() => {
            setAboutOpen(false);
            startTour();
          }}
        />
      ) : null}

      <p className="sr-only" aria-live="polite">
        {selectedPlanetId ? `Showing the story of ${selectedPlanetId}.` : ""}
      </p>
    </div>
  );
}

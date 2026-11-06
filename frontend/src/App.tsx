import { useEffect, useRef, useState } from "react";
import AboutPanel from "./components/AboutPanel";
import MissionMap from "./components/MissionMap";
import NavBar from "./components/NavBar";
import StatusBar from "./components/StatusBar";
import StarfieldCanvas from "./components/StarfieldCanvas";
import Timeline from "./components/Timeline";
import type { MissionFilter } from "./components/OrbitSystem";
import useCamera, { type PlanetPosition } from "./hooks/useCamera";
import usePerformanceTier from "./hooks/usePerformanceTier";
import useReducedMotion from "./hooks/useReducedMotion";
import { TIMELINE_END, planetsForYear } from "./data/timelineEvents";

export default function AstroRelicsMissionAtlas() {
  const reducedMotion = useReducedMotion();
  const tier = usePerformanceTier();

  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [filter, setFilter] = useState<MissionFilter>("all");
  const [speed, setSpeed] = useState(1);
  const [year, setYear] = useState(TIMELINE_END);

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
      setSelectedPlanetId(null);
      setDrawerOpen(false);
    },
  });

  const highlighted = planetsForYear(year);

  const selectPlanet = (id: string) => {
    setTourActive(false);
    setAboutOpen(false);
    setSelectedPlanetId(id);
    setDrawerOpen(true);
    camera.focusPlanet(id);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedPlanetId(null);
    camera.focusPlanet(null);
  };

  const openMap = () => {
    setAboutOpen(false);
    setTourActive(false);
    setDrawerOpen(false);
    setSelectedPlanetId(null);
    camera.resetView();
  };

  const startTour = () => {
    setAboutOpen(false);
    setDrawerOpen(false);
    setSelectedPlanetId(null);
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

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (event.key !== "Escape") return;
      if (aboutOpen) {
        setAboutOpen(false);
      } else if (tourActive) {
        setTourActive(false);
        camera.focusPlanet(null);
      } else if (drawerOpen) {
        setDrawerOpen(false);
        setSelectedPlanetId(null);
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
          onStartTour={startTour}
          onExitTour={exitTour}
          reducedMotion={reducedMotion}
          searchRef={searchRef}
          year={year}
        />
      </main>

      <Timeline year={year} onChange={setYear} highlighted={highlighted} />
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

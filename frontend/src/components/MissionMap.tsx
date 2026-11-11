import type { RefObject } from "react";
import { AnimatePresence } from "framer-motion";
import type { CameraApi, PlanetPosition } from "../hooks/useCamera";
import { missionControlFor } from "../data/missionControl";
import GuidedTour from "./GuidedTour";
import MissionControlDrawer from "./MissionControlDrawer";
import PlanetFocusStage from "./PlanetFocusStage";
import MissionSearch from "./MissionSearch";
import OrbitSystem, { type MissionFilter } from "./OrbitSystem";
import CameraControls from "./CameraControls";
import Icon from "./Icon";

type MissionMapProps = {
  camera: CameraApi;
  cameraRef: RefObject<HTMLDivElement | null>;
  positionsRef: RefObject<Record<string, PlanetPosition>>;
  speed: number;
  onSpeedChange: (speed: number) => void;
  filter: MissionFilter;
  onFilterChange: (filter: MissionFilter) => void;
  highlighted: Set<string>;
  selectedPlanetId: string | null;
  onSelectPlanet: (id: string) => void;
  onCloseDrawer: () => void;
  drawerOpen: boolean;
  tourActive: boolean;
  onExitTour: () => void;
  reducedMotion: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  year: number;
};

const filters: { value: MissionFilter; label: string }[] = [
  { value: "all", label: "All planets" },
  { value: "active", label: "Still exploring" },
  { value: "retired", label: "Retired explorers" },
];

export default function MissionMap({
  camera,
  cameraRef,
  positionsRef,
  speed,
  onSpeedChange,
  filter,
  onFilterChange,
  highlighted,
  selectedPlanetId,
  onSelectPlanet,
  onCloseDrawer,
  drawerOpen,
  tourActive,
  onExitTour,
  reducedMotion,
  searchRef,
  year,
}: MissionMapProps) {
  const focusData = selectedPlanetId ? missionControlFor(selectedPlanetId) : null;

  return (
    <section
      className={`map-area${drawerOpen ? " has-drawer" : ""}${tourActive ? " is-touring" : ""}`}
      aria-label="Interactive solar system map"
    >
      <div className="map-vignette" aria-hidden="true" />

      <OrbitSystem
        camera={camera}
        cameraRef={cameraRef}
        positionsRef={positionsRef}
        speed={speed}
        focusedId={camera.focusedId}
        reducedMotion={reducedMotion}
        filter={filter}
        highlighted={highlighted}
        onSelectPlanet={onSelectPlanet}
      />

      <div className="map-overlay">
        <div className={`intro-card${drawerOpen || tourActive ? " is-muted" : ""}`}>
          <p className="intro-kicker">NASA SPACE APPS · SOLARIS</p>
          <h1>Wander the solar system.</h1>
          <p>Tap a planet to meet the robots we sent there. Every glowing dot is a real mission.</p>
        </div>

        <div className="top-tools">
          <MissionSearch inputRef={searchRef} onSelectPlanet={onSelectPlanet} />
          <div className="filter-bar" role="group" aria-label="Filter planets by mission status">
            {filters.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filter === option.value ? "is-active" : ""}
                onClick={() => onFilterChange(option.value)}
                aria-pressed={filter === option.value}
              >
                {option.value === "active" ? (
                  <span className="mini-dot is-active" aria-hidden="true" />
                ) : null}
                {option.value === "retired" ? (
                  <span className="mini-dot is-retired" aria-hidden="true" />
                ) : null}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="map-legend" aria-label="Dot legend">
          <span className="legend-title">What the dots mean</span>
          <span className="legend-item">
            <span className="mini-dot is-active" aria-hidden="true" />
            Still exploring
          </span>
          <span className="legend-item">
            <span className="mini-dot is-retired" aria-hidden="true" />
            Retired explorer
          </span>
          <span className="legend-item">
            <span className="legend-moon" aria-hidden="true" />
            Has moons
          </span>
        </div>

        <CameraControls
          speed={speed}
          onSpeedChange={onSpeedChange}
          onZoomIn={camera.zoomIn}
          onZoomOut={camera.zoomOut}
          onReset={camera.resetView}
        />

        <p className="map-hint">
          <Icon name="sparkle" size={14} className="icon" /> Drag to look · Scroll to zoom · Tap a
          planet
        </p>

        <p className="map-year-badge">
          Year {year}
          {highlighted.size > 0
            ? ` · ${highlighted.size} active signal${highlighted.size === 1 ? "" : "s"}`
            : ""}
        </p>
      </div>

      {focusData && drawerOpen ? (
        <AnimatePresence mode="wait">
          <PlanetFocusStage
            key={`stage-${focusData.planetId}`}
            data={focusData}
            reducedMotion={reducedMotion}
            onDismiss={onCloseDrawer}
          />
        </AnimatePresence>
      ) : null}

      <AnimatePresence>
        {drawerOpen && selectedPlanetId ? (
          <MissionControlDrawer
            key={`mc-${selectedPlanetId}`}
            planetId={selectedPlanetId}
            reducedMotion={reducedMotion}
            onClose={onCloseDrawer}
          />
        ) : null}
      </AnimatePresence>

      <GuidedTour
        active={tourActive}
        reducedMotion={reducedMotion}
        onStepFocus={(id) => camera.focusPlanet(id)}
        onExit={onExitTour}
      />
    </section>
  );
}

import type { CSSProperties } from "react";
import { missionControlFor } from "../data/missionControl";
import type { Planet } from "../data/planets";
import ProjectDots from "./ProjectDots";

type PlanetMarkerProps = {
  planet: Planet;
  focused: boolean;
  dimmed: boolean;
  highlighted: boolean;
  counts: { active: number; retired: number };
  /** "all" shows both statuses; "active"/"retired" filters rings by status. */
  filter: "all" | "active" | "retired";
  onSelect: () => void;
  registerNode: (element: HTMLDivElement | null) => void;
  registerVisual: (element: HTMLSpanElement | null) => void;
};

export default function PlanetMarker({
  planet,
  focused,
  dimmed,
  highlighted,
  counts,
  filter,
  onSelect,
  registerNode,
  registerVisual,
}: PlanetMarkerProps) {
  const hit = Math.max(46, Math.min(116, planet.size + 28));
  const moonNote = planet.moons
    ? ` It has ${planet.moons} ${planet.moons === 1 ? "moon" : "moons"}.`
    : "";
  const label = `${planet.name}. ${counts.active} ${
    counts.active === 1 ? "project" : "projects"
  } still exploring, ${counts.retired} retired. Open the story.${moonNote}`;

  /** Real NASA catalog entries for this planet, filtered by status, capped at 9 rings. */
  const control = missionControlFor(planet.id);
  const orbitMissions = (control?.entries ?? [])
    .filter((entry) => filter === "all" || entry.status === filter)
    .slice(0, 9);

  return (
    <div
      ref={registerNode}
      className={`planet-node${focused ? " is-focused" : ""}${dimmed ? " is-dimmed" : ""}${
        highlighted ? " is-highlighted" : ""
      }`}
      data-planet={planet.id}
    >
      <button
        type="button"
        className="planet-hit"
        style={
          {
            width: hit,
            height: hit,
            left: -hit / 2,
            top: -hit / 2,
            "--planet-color": planet.color,
            "--planet-size": `${planet.size}px`,
            "--planet-radius": `${planet.size / 2}px`,
          } as CSSProperties
        }
        onClick={onSelect}
        aria-label={label}
        aria-pressed={focused}
      >
        <span
          className="planet-visual"
          ref={registerVisual}
          style={{ width: planet.size, height: planet.size }}
        >
          <span className="planet-atmosphere" />
          <img className="planet-img" src={planet.src} alt="" draggable={false} />
          <span className="planet-ring" />
        </span>
        <span className="planet-label">{planet.name}</span>
        <span className="planet-counts">
          {counts.active} exploring · {counts.retired} retired
        </span>
        {planet.moons ? <span className="moon-ring" aria-hidden="true" /> : null}
        {planet.moons ? (
          <span className="moon-hud" aria-hidden="true">
            {planet.moons === 1 ? "MOONS: 1" : `TOTAL MOONS: ${planet.moons}`}
          </span>
        ) : null}
        {/* Mission orbit rings — one ring per mission, rotating slowly around the planet. */}
        {orbitMissions.map((entry, index) => {
          const radius = 14 + (index + 1) * 5;
          const duration = 6 + index * 1.2;
          return (
            <span
              key={entry.id}
              className={`mission-orbit-ring is-${entry.status}`}
              style={
                {
                  "--ring-radius": `${radius}px`,
                  "--ring-duration": `${duration}s`,
                } as CSSProperties
              }
              title={`${entry.name} · ${
                entry.status === "active" ? "still exploring" : "retired"
              }`}
            />
          );
        })}
        <ProjectDots planetId={planet.id} radius={planet.size / 2 + (planet.size < 46 ? 16 : 22)} />
      </button>
    </div>
  );
}

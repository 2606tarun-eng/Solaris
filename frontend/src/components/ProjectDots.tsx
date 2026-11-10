import type { CSSProperties } from "react";
import { projectsByPlanet, projectYears } from "../data/projects";

type ProjectDotsProps = {
  planetId: string;
  radius: number;
};

/**
 * Keep the orbit map calm: show at most three mission dots per planet.
 * Extra missions stay hidden and are summarised in the planet's hover counts.
 */
const MAX_ACTIVE_DOTS = 2;
const MAX_RETIRED_DOTS = 1;

export default function ProjectDots({ planetId, radius }: ProjectDotsProps) {
  const list = projectsByPlanet[planetId] ?? [];
  const active = list
    .filter((project) => project.status === "active")
    .slice(0, MAX_ACTIVE_DOTS);
  const retired = list
    .filter((project) => project.status === "retired")
    .slice(0, MAX_RETIRED_DOTS);
  const visible = [...active, ...retired];
  if (visible.length === 0) return null;

  return (
    <span
      className="project-dots"
      style={{ "--dot-radius": `${radius}px` } as CSSProperties}
      aria-hidden="true"
    >
      {visible.map((project, index) => (
        <span
          key={project.id}
          className={`project-dot is-${project.status}${project.featured ? " is-featured" : ""}`}
          style={
            {
              "--dot-angle": `${(360 / visible.length) * index}deg`,
              "--dot-delay": `${index * 0.42}s`,
            } as CSSProperties
          }
          title={`${project.name} · ${
            project.status === "active" ? "still exploring" : "retired"
          } · ${projectYears(project)}`}
        />
      ))}
    </span>
  );
}

import type { CSSProperties } from "react";
import { projectsByPlanet, projectYears } from "../data/projects";

type ProjectDotsProps = {
  planetId: string;
  radius: number;
};

const MAX_DOTS = 5;

export default function ProjectDots({ planetId, radius }: ProjectDotsProps) {
  const list = projectsByPlanet[planetId] ?? [];
  const visible = list.slice(0, MAX_DOTS);
  const extra = Math.max(0, list.length - visible.length);
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
      {extra > 0 ? (
        <span className="project-dot-more" style={{ "--dot-radius": `${radius}px` } as CSSProperties}>
          +{extra}
        </span>
      ) : null}
    </span>
  );
}

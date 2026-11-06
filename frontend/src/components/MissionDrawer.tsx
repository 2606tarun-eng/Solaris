import { img } from "../assets";
import { planets, planetById } from "../data/planets";
import { missionByPlanet, missionYears, planetStories } from "../data/missions";
import { projectsByPlanet, projectYears } from "../data/projects";
import Icon from "./Icon";

type MissionDrawerProps = {
  planetId: string;
  onClose: () => void;
  onSelectPlanet: (id: string) => void;
};

export default function MissionDrawer({ planetId, onClose, onSelectPlanet }: MissionDrawerProps) {
  const planet = planetById[planetId];
  const mission = missionByPlanet[planetId];
  const story = planetStories[planetId];
  const projects = projectsByPlanet[planetId] ?? [];

  if (!planet || !mission || !story) return null;

  const index = planets.findIndex((item) => item.id === planetId);
  const previous = planets[(index - 1 + planets.length) % planets.length];
  const next = planets[(index + 1) % planets.length];

  return (
    <aside className="mission-drawer" aria-label={`${planet.name} planet file`}>
      <div className="drawer-bar">
        <span className="drawer-kicker">PLANET FILE · {planet.name.toUpperCase()}</span>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close planet file">
          <img src={img.close} alt="" />
        </button>
      </div>

      <div className="drawer-hero">
        <img className="drawer-hero-image" src={mission.image} alt={`${mission.name} — NASA image`} />
        <div className="drawer-hero-shade" />
        <div className="drawer-hero-text">
          <span className="planet-chip">
            <img src={planet.src} alt="" />
            {story.nickname}
          </span>
          <h2>{mission.name}</h2>
          <p>
            {mission.agency} · {missionYears(mission)}
          </p>
        </div>
      </div>

      <div className="drawer-body">
        <span className={`status-pill is-${mission.status}`}>
          <span className="status-dot" />
          {mission.status === "active" ? "Still exploring" : "Retired explorer"}
        </span>

        <h3>{mission.headline}</h3>
        <p className="drawer-summary">{mission.summary}</p>

        <div className="stat-grid">
          {mission.stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="fun-fact">
          <Icon name="bulb" size={15} className="icon" aria-hidden="true" />
          <p>{mission.funFact}</p>
        </div>

        <div className="project-section">
          <div className="project-heading">
            <h4>Around {planet.name}</h4>
            <span>{projects.length} projects tracked</span>
          </div>
          <ul className="project-list">
            {projects.map((project) => (
              <li key={project.id}>
                <span className={`mini-dot is-${project.status}`} aria-hidden="true" />
                <span className="project-name">{project.name}</span>
                <span className="project-years">{projectYears(project)}</span>
              </li>
            ))}
          </ul>
          <p className="project-note">
            <span className="mini-dot is-active" aria-hidden="true" /> still exploring ·{" "}
            <span className="mini-dot is-retired" aria-hidden="true" /> retired
          </p>
        </div>

        <a className="nasa-link" href={mission.nasaUrl} target="_blank" rel="noreferrer">
          Open the NASA mission page <span aria-hidden="true">↗</span>
        </a>

        <p className="drawer-planet-fact">{story.funFact}</p>
      </div>

      <div className="drawer-footer">
        <button type="button" onClick={() => onSelectPlanet(previous.id)}>
          ← {previous.name}
        </button>
        <button type="button" className="back-button" onClick={onClose}>
          All planets
        </button>
        <button type="button" onClick={() => onSelectPlanet(next.id)}>
          {next.name} →
        </button>
      </div>
    </aside>
  );
}

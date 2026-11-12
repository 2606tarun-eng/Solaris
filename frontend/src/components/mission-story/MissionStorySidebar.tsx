import Icon from "../Icon";
import { atlasPath, handlePlainClick } from "../../lib/missionRoute";
import type { MissionProfile } from "../../data/missionStories";
import AgencyMark from "./AgencyMark";

/**
 * Left-hand mission card: who flew it, what state it is in, one picture, and the
 * three facts a reader wants before the story starts.
 */
export default function MissionStorySidebar({ profile }: { profile: MissionProfile }) {
  const backHref = atlasPath();
  const active = profile.status === "active";

  return (
    <aside className="ms-side" aria-label={`${profile.name} mission facts`}>
      <a
        className="ms-back"
        href={backHref}
        onClick={(event) => handlePlainClick(event, backHref)}
        aria-label={`Back to missions at ${profile.planetName}`}
      >
        <Icon name="arrow-left" size={15} />
        <span>Back to Missions</span>
      </a>

      <div className="ms-side-card">
        <div className="ms-side-head">
          <div className="ms-agency-row">
            <AgencyMark agency={profile.agency} />
            <span className={`ms-status is-${profile.status}`}>
              <span className="ms-dot" aria-hidden="true" />
              {active ? "Still exploring" : "Retired explorer"}
            </span>
          </div>

          <h1 className="ms-mission-name">{profile.name}</h1>
          <p className="ms-mission-full">{profile.fullName}</p>
        </div>

        <figure className="ms-craft">
          <img src={profile.image} alt={profile.imageAlt} loading="eager" draggable={false} />
          <figcaption>{profile.imageCaption}</figcaption>
        </figure>

        <dl className="ms-facts">
          <div className="ms-fact">
            <dt>
              <Icon name="rocket" size={14} />
              <span>Launch</span>
            </dt>
            <dd>{profile.launch}</dd>
          </div>
          <div className="ms-fact">
            <dt>
              <Icon name={profile.orbitLabel ? "planet" : "clock"} size={14} />
              <span>{profile.orbitLabel ?? "Orbit"}</span>
            </dt>
            <dd>{profile.orbit}</dd>
          </div>
          <div className="ms-fact">
            <dt>
              <Icon name="bulb" size={14} />
              <span>Mission goal</span>
            </dt>
            <dd>{profile.goal}</dd>
          </div>
        </dl>

        {profile.nasaUrl ? (
          <a className="ms-file" href={profile.nasaUrl} target="_blank" rel="noreferrer">
            <span>{profile.name} on nasa.gov</span>
            <Icon name="external" size={13} />
          </a>
        ) : null}
      </div>
    </aside>
  );
}

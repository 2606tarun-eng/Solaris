import { useState } from "react";
import { motion } from "framer-motion";
import { missionControlFor, type MissionControlEntry } from "../data/missionControl";
import { handlePlainClick, missionPath } from "../lib/missionRoute";
import Icon from "./Icon";
import "./mission-story/missionStoryLink.css";

/**
 * MissionControlDrawer — the glass HUD that slides in from the right once a
 * planet is focused.
 *
 * Every row is a link: tapping a mission opens its full story page, so the
 * drawer stays a short, scannable index instead of unfolding media inline.
 */

type MissionControlDrawerProps = {
  planetId: string;
  reducedMotion: boolean;
  onClose: () => void;
};

type TabKey = "active" | "retired";

const EASE_SOFT: [number, number, number, number] = [0.22, 0.9, 0.3, 1];

const TABS: { key: TabKey; label: string }[] = [
  { key: "active", label: "STILL ACTIVE" },
  { key: "retired", label: "RETIRED PIONEERS" },
];

function statusLabel(status: MissionControlEntry["status"]) {
  return status === "active" ? "Still exploring" : "Retired explorer";
}

function MissionRow({ entry }: { entry: MissionControlEntry }) {
  const storyHref = missionPath(entry.id);

  return (
    <li className={`mc-row is-${entry.status}`}>
      <a
        className="mc-row-head mc-story-row"
        href={storyHref}
        onClick={(event) => handlePlainClick(event, storyHref)}
        aria-label={`${entry.name}. ${entry.years}. ${statusLabel(entry.status)}. Read the mission story.`}
      >
        <span className={`mc-dot is-${entry.status}`} aria-hidden="true" />
        <span className="mc-row-text">
          <span className="mc-row-name">{entry.name}</span>
          <span className="mc-row-sub">
            {entry.years} · {entry.target}
          </span>
        </span>
        <span className="mc-chevron mc-story-go" aria-hidden="true">
          <Icon name="arrow-right" size={13} />
        </span>
      </a>
    </li>
  );
}

export default function MissionControlDrawer({
  planetId,
  reducedMotion,
  onClose,
}: MissionControlDrawerProps) {
  const data = missionControlFor(planetId);
  const defaultTab: TabKey =
    data && data.entries.some((entry) => entry.status === "active") ? "active" : "retired";
  const [tab, setTab] = useState<TabKey>(defaultTab);
  // Reset the panel when the reader hops to another planet without closing.
  const [seenPlanet, setSeenPlanet] = useState(planetId);
  if (seenPlanet !== planetId) {
    setSeenPlanet(planetId);
    setTab(defaultTab);
  }

  if (!data) return null;

  const visible = data.entries
    .filter((entry) => entry.status === tab)
    .sort((a, b) => Number(b.status === "active") - Number(a.status === "active"));

  return (
    <motion.aside
      className="mc-drawer"
      aria-label={`Mission control for ${data.planetName}`}
      initial={{ x: "104%", opacity: 0.6 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "104%", opacity: 0.4 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.46, ease: EASE_SOFT }}
    >
      <header className="mc-head">
        <div className="mc-head-text">
          <p className="mc-kicker">MISSION CONTROL</p>
          <h2>
            <span aria-hidden="true">//</span> {data.planetName}
          </h2>
        </div>
        <button
          type="button"
          className="mc-close"
          onClick={onClose}
          aria-label="Close mission control"
        >
          <Icon name="close" size={16} />
        </button>
      </header>

      <p className="mc-brief">{data.brief}</p>

      <div className="mc-tabs" role="tablist" aria-label="Mission status">
        {TABS.map((option) => {
          const count = data.entries.filter((entry) => entry.status === option.key).length;
          const selected = tab === option.key;
          return (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={selected}
              className={selected ? "is-active" : ""}
              onClick={() => setTab(option.key)}
            >
              <span className="mc-tab-label">[ {option.label} ]</span>
              <span className="mc-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mc-list-scroll">
        {visible.length === 0 ? (
          <p className="mc-empty">
            Nothing {tab === "active" ? "still flying" : "retired"} around {data.planetName} yet.
          </p>
        ) : (
          <motion.ul className="mc-list" layout={!reducedMotion} role="tabpanel">
            {visible.map((entry) => (
              <MissionRow key={entry.id} entry={entry} />
            ))}
          </motion.ul>
        )}
      </div>

      <p className="mc-story-hint">Tap a mission to open its story</p>
    </motion.aside>
  );
}

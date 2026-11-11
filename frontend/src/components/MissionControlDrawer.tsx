import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  missionControlFor,
  type MissionControlEntry,
  type MissionMedia,
} from "../data/missionControl";
import Icon from "./Icon";

/**
 * MissionControlDrawer — the glass HUD that slides in from the right once a
 * planet is focused.
 *
 * Everything is inline: a mission expands in place (height animation + the
 * parent list item re-flowing with `layout`), so the reader never leaves the
 * panel. The gallery is not decorative — tapping a frame promotes it to the
 * hero slot above.
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

function MediaFrame({
  item,
  active,
  onSelect,
}: {
  item: MissionMedia;
  active: boolean;
  onSelect: () => void;
}) {
  const content = (
    <>
      <img src={item.src} alt="" loading="lazy" draggable={false} />
      {item.kind === "video" ? (
        <span className="mc-media-play" aria-hidden="true">
          <Icon name="play" size={11} />
        </span>
      ) : null}
      <span className="mc-media-caption">{item.caption}</span>
    </>
  );

  if (item.href) {
    return (
      <a
        className={`mc-media-item${active ? " is-active" : ""}`}
        href={item.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${item.caption} — open the NASA archive`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`mc-media-item${active ? " is-active" : ""}`}
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Show: ${item.caption}`}
    >
      {content}
    </button>
  );
}

function MissionRow({
  entry,
  open,
  reducedMotion,
  onToggle,
}: {
  entry: MissionControlEntry;
  open: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const hero = useMemo(() => {
    const found = entry.media.find((item) => item.id === picked);
    return found ?? { src: entry.heroImage, caption: entry.heroAlt, kind: "photo" as const };
  }, [entry, picked]);

  return (
    <motion.li
      layout={!reducedMotion}
      className={`mc-row is-${entry.status}${open ? " is-open" : ""}`}
      transition={{ layout: { duration: 0.34, ease: EASE_SOFT } }}
    >
      <button
        type="button"
        className="mc-row-head"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`mc-body-${entry.id}`}
      >
        <span className={`mc-dot is-${entry.status}`} aria-hidden="true" />
        <span className="mc-row-text">
          <span className="mc-row-name">{entry.name}</span>
          <span className="mc-row-sub">
            {entry.years} · {entry.target}
          </span>
        </span>
        <span className={`mc-chevron${open ? " is-open" : ""}`} aria-hidden="true">
          <Icon name="plus" size={12} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            id={`mc-body-${entry.id}`}
            className="mc-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.34, ease: EASE_SOFT }}
          >
            <div className="mc-body-inner">
              <span className={`mc-status is-${entry.status}`}>
                <span className={`mc-dot is-${entry.status}`} aria-hidden="true" />
                {statusLabel(entry.status)}
              </span>

              <div className="mc-hero-row">
                <figure className="mc-hero">
                  <img src={hero.src} alt={hero.caption} loading="lazy" draggable={false} />
                </figure>
                <div className="mc-stats">
                  {entry.stats.map((stat) => (
                    <div className="mc-stat" key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mc-hero-caption">{hero.caption}</p>
              <p className="mc-summary">{entry.summary}</p>

              <div className="mc-media-strip" role="group" aria-label={`${entry.name} media`}>
                {entry.media.map((item) => (
                  <MediaFrame
                    key={item.id}
                    item={item}
                    active={picked === item.id}
                    onSelect={() => setPicked(item.id)}
                  />
                ))}
              </div>

              {entry.href ? (
                <a className="mc-source" href={entry.href} target="_blank" rel="noreferrer">
                  Mission file on nasa.gov
                  <Icon name="external" size={12} className="icon" />
                </a>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

export default function MissionControlDrawer({
  planetId,
  reducedMotion,
  onClose,
}: MissionControlDrawerProps) {
  const data = missionControlFor(planetId);
  const [openId, setOpenId] = useState<string | null>(null);

  const defaultTab: TabKey =
    data && data.entries.some((entry) => entry.status === "active") ? "active" : "retired";
  const [tab, setTab] = useState<TabKey>(defaultTab);
  // Reset the panel when the reader hops to another planet without closing.
  const [seenPlanet, setSeenPlanet] = useState(planetId);
  if (seenPlanet !== planetId) {
    setSeenPlanet(planetId);
    setTab(defaultTab);
    setOpenId(null);
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
              onClick={() => {
                setTab(option.key);
                setOpenId(null);
              }}
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
              <MissionRow
                key={entry.id}
                entry={entry}
                open={openId === entry.id}
                reducedMotion={reducedMotion}
                onToggle={() => setOpenId(openId === entry.id ? null : entry.id)}
              />
            ))}
          </motion.ul>
        )}
      </div>
    </motion.aside>
  );
}

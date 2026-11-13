import { useEffect, useState } from "react";
import Icon from "./Icon";
import {
  TIMELINE_END,
  TIMELINE_START,
  eventsForYear,
  timelineEvents,
} from "../data/timelineEvents";

type TimelineProps = {
  year: number;
  onChange: (year: number) => void;
  highlighted: Set<string>;
};

const DECADES = [1960, 1970, 1980, 1990, 2000, 2010, 2020];

function position(year: number) {
  return ((year - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
}

/** Assigns each marker a lane inside its year so same-year launches stay clickable. */
const timelineMarkers = (() => {
  const lanes = new Map<number, number>();
  return timelineEvents.map((event) => {
    const lane = lanes.get(event.year) ?? 0;
    lanes.set(event.year, lane + 1);
    return { event, lane };
  });
})();

export default function Timeline({ year, onChange, highlighted }: TimelineProps) {
  const [playing, setPlaying] = useState(false);
  const events = eventsForYear(year);
  const railPercent = position(year);
  const handleAlign =
    railPercent > 96 ? "translateX(-100%)" : railPercent < 4 ? "translateX(0)" : "translateX(-50%)";

  // Placeholder for Tone.js data sonification ("Jukebox" element).
  // Next step will plug a synth chord in here and gate on isAudioEnabled.
  const handleTimelineSonification = (year: number) => {
    const activeMissionsCount = eventsForYear(year).length;
    console.log("Play synth chord for year:", year, "Missions active:", activeMissionsCount);
  };

  useEffect(() => {
    if (!playing) return;
    if (year >= TIMELINE_END) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      const nextYear = Math.min(TIMELINE_END, year + 1);
      handleTimelineSonification(nextYear);
      onChange(nextYear);
    }, 460);
    return () => window.clearTimeout(timer);
  }, [playing, year, onChange]);

  return (
    <section className="timeline-panel" aria-label="Mission time machine">
      <div className="timeline-head">
        <div className="timeline-title">
          <Icon name="clock" size={18} className="icon" />
          <span>
            <strong>Time machine</strong>
            <small>Every mission, from 1957 to today</small>
          </span>
        </div>

        <div className="timeline-year">{year}</div>

        <p className="timeline-events">
          {events.length > 0 ? (
            <>
              {events.slice(0, 2).map((event) => (
                <span key={`${event.year}-${event.title}`}>
                  <strong>{event.title}</strong> — {event.detail}
                </span>
              ))}
              {events.length > 2 ? <em>+{events.length - 2} more</em> : null}
            </>
          ) : (
            "No big milestone this year — keep sliding."
          )}
        </p>

        <button
          type="button"
          className="timeline-play"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? "Pause the timeline" : "Play through the years"}
        >
          {playing ? (
            <>
              <Icon name="pause" size={14} className="icon" /> Pause
            </>
          ) : (
            <>
              <Icon name="play" size={14} className="icon" /> Play years
            </>
          )}
        </button>
      </div>

      <div className="timeline-rail">
        <div className="rail-line" />
        <div className="rail-fill" style={{ width: `${position(year)}%` }} />

        {DECADES.map((decade) => (
          <span className="rail-tick" key={decade} style={{ left: `${position(decade)}%` }}>
            <i />
            <em>{decade}</em>
          </span>
        ))}

        {timelineMarkers.map(({ event, lane }) => (
          <button
            key={`${event.year}-${event.title}`}
            type="button"
            className={`rail-marker is-${event.kind}${event.year === year ? " is-current" : ""}`}
            style={{
              left: `${position(event.year)}%`,
              // Several missions can launch in one year; a tiny spread keeps
              // each marker clickable instead of stacking them exactly.
              marginLeft: `${-4.5 + lane * 5}px`,
            }}
            title={`${event.year} · ${event.title}: ${event.detail}`}
            aria-label={`${event.year}: ${event.title}`}
            onClick={() => {
              setPlaying(false);
              handleTimelineSonification(event.year);
              onChange(event.year);
            }}
          />
        ))}

        <span
          className="rail-handle"
          style={{ left: `${railPercent}%`, transform: handleAlign }}
          aria-hidden="true"
        >
          {year}
        </span>

        <input
          className="timeline-range"
          type="range"
          min={TIMELINE_START}
          max={TIMELINE_END}
          value={year}
          onChange={(event) => {
            setPlaying(false);
            const nextYear = Number(event.target.value);
            handleTimelineSonification(nextYear);
            onChange(nextYear);
          }}
          aria-label="Select a year in space history"
        />
      </div>

      <div className="timeline-foot">
        <span>1957 · The Space Age begins</span>
        <span>
          {highlighted.size > 0
            ? `${highlighted.size} planet${highlighted.size === 1 ? "" : "s"} highlighted this year`
            : "Drag the handle, or tap a glowing mission marker"}
        </span>
        <span>Today · {TIMELINE_END}</span>
      </div>
    </section>
  );
}

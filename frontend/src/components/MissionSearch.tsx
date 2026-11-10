import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { planets } from "../data/planets";
import { missionByPlanet, missionYears } from "../data/missions";
import { projects } from "../data/projects";
import Icon from "./Icon";

type SearchResult = {
  key: string;
  label: string;
  meta: string;
  planetId: string;
  color: string;
  kind: "planet" | "mission" | "project";
};

type MissionSearchProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onSelectPlanet: (id: string) => void;
};

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  for (const planet of planets) {
    results.push({
      key: `planet-${planet.id}`,
      label: planet.name,
      meta: planet.tagline,
      planetId: planet.id,
      color: planet.color,
      kind: "planet",
    });
  }

  for (const planet of planets) {
    const mission = missionByPlanet[planet.id];
    if (!mission) continue;
    results.push({
      key: `mission-${mission.id}`,
      label: mission.name,
      meta: `${planet.name} · mission · ${missionYears(mission)}`,
      planetId: planet.id,
      color: planet.color,
      kind: "mission",
    });
  }

  for (const project of projects) {
    if (project.featured) continue;
    const planet = planets.find((item) => item.id === project.planetId);
    if (!planet) continue;
    results.push({
      key: `project-${project.id}`,
      label: project.name,
      meta: `${planet.name} · project · ${project.ended ? `${project.launched}–${project.ended}` : `${project.launched}–now`}`,
      planetId: project.planetId,
      color: planet.color,
      kind: "project",
    });
  }

  return results;
}

export default function MissionSearch({ inputRef, onSelectPlanet }: MissionSearchProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const index = useMemo(buildIndex, []);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const term = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!term) return [];
    return index
      .filter(
        (result) =>
          result.label.toLowerCase().includes(term) ||
          result.meta.toLowerCase().includes(term),
      )
      .slice(0, 7);
  }, [index, term]);

  useEffect(() => {
    setActive(0);
  }, [term]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setQuery("");
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const choose = (result: SearchResult) => {
    onSelectPlanet(result.planetId);
    setQuery("");
  };

  return (
    <div className="mission-search" ref={wrapperRef}>
      <div className="search-field">
        <span className="search-icon" aria-hidden="true">
          <Icon name="search" size={19} />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((value) => Math.min(results.length - 1, value + 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => Math.max(0, value - 1));
            } else if (event.key === "Enter") {
              const result = results[active] ?? results[0];
              if (result) {
                event.preventDefault();
                choose(result);
              }
            } else if (event.key === "Escape") {
              if (query) {
                event.stopPropagation();
                setQuery("");
              }
            }
          }}
          placeholder="Search a planet or mission…"
          aria-label="Search planets and missions"
          aria-expanded={results.length > 0}
          role="combobox"
          aria-controls="search-results"
          aria-autocomplete="list"
        />
        {query ? (
          <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">
            <Icon name="close" size={16} className="icon" />
          </button>
        ) : null}
      </div>

      {term && results.length > 0 ? (
        <ul className="search-results" id="search-results" role="listbox">
          {results.map((result, position) => (
            <li key={result.key} role="option" aria-selected={position === active}>
              <button
                type="button"
                className={position === active ? "is-active" : ""}
                onPointerEnter={() => setActive(position)}
                onClick={() => choose(result)}
              >
                <span className="result-dot" style={{ background: result.color }} aria-hidden="true" />
                <span className="result-text">
                  <strong>{result.label}</strong>
                  <span>{result.meta}</span>
                </span>
                <span className="result-kind">{result.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {term && results.length === 0 ? (
        <div className="search-empty">
          Nothing found for “{query.trim()}”. Try “Mars” or “Cassini”.
        </div>
      ) : null}
    </div>
  );
}

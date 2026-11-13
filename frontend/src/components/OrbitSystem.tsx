import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { planets } from "../data/planets";
import { orbits } from "../data/solarSystem";
import { projectCounts } from "../data/projects";
import type { CameraApi, PlanetPosition } from "../hooks/useCamera";
import Icon from "./Icon";
import PlanetMarker from "./PlanetMarker";
import Sun from "./Sun";

export type MissionFilter = "all" | "active" | "retired";

type OrbitSystemProps = {
  camera: CameraApi;
  cameraRef: RefObject<HTMLDivElement | null>;
  positionsRef: RefObject<Record<string, PlanetPosition>>;
  speed: number;
  focusedId: string | null;
  reducedMotion: boolean;
  filter: MissionFilter;
  highlighted: Set<string>;
  onSelectPlanet: (id: string) => void;
};

const TILT_WIDE = 1.45;
const TILT_NARROW = 1.9;
// Extra X/Y spread for the inner planets so MERCURY / VENUS / EARTH / SUN
// labels have breathing room. Applied to both orbit radius and ring image.
const INNER_BOOSTS = [1.18, 1.14, 1.1];

export default function OrbitSystem({
  camera,
  cameraRef,
  positionsRef,
  speed,
  focusedId,
  reducedMotion,
  filter,
  highlighted,
  onSelectPlanet,
}: OrbitSystemProps) {
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const visualRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const anglesRef = useRef<number[]>(planets.map((planet) => planet.startAngle));
  const focusRef = useRef<string | null>(focusedId);
  // Entrance: planets zoom outward from the sun as the flash breathe-out
  // clears. Kept in refs so it never re-triggers React.
  const mountAtRef = useRef<number | null>(null);
  const entranceDoneRef = useRef(reducedMotion);
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches,
  );
  const { frame: cameraFrame, consumeClickBlock } = camera;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Narrow screens have more vertical than horizontal room, so open the
  // ellipses further to keep the inner planets and their labels apart.
  const orbitGeometry = useMemo(() => {
    const tilt = narrow ? TILT_NARROW : TILT_WIDE;
    return orbits.map((orbit, index) => {
      const boost = INNER_BOOSTS[index] ?? 1;
      return {
        rx: (orbit.width / 2) * boost,
        ry: (orbit.height / 2) * tilt * boost,
        src: orbit.src,
        name: orbit.name,
      };
    });
  }, [narrow]);

  useEffect(() => {
    focusRef.current = focusedId;
  }, [focusedId]);

  useLayoutEffect(() => {
    let animation = 0;
    let last = performance.now();

    // Entrance choreography: hold them parked on the sun for a beat while the
    // flash breathes out, then unfold ring by ring, inner planets first.
    // Times are tight so the system merges quickly out of the flash.
    const ENTRANCE_HOLD = 140;
    const ENTRANCE_DURATION = 620;
    const RING_STAGGER = 70;
    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

    const update = (now: number) => {
      const delta = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      if (mountAtRef.current === null) mountAtRef.current = performance.now();
      const sinceMount = now - mountAtRef.current;

      const focus = focusRef.current;
      const multiplier = reducedMotion ? 0 : speed * (focus ? 0.12 : 1);

      planets.forEach((planet, index) => {
        const geometry = orbitGeometry[planet.orbitIndex];
        if (multiplier > 0) {
          anglesRef.current[index] += ((Math.PI * 2) / planet.period) * delta * multiplier;
        }
        const angle = anglesRef.current[index];

        // planets ride out from the sun: radius scale 0.04 -> 1 per ring
        let progress = 1;
        if (!entranceDoneRef.current) {
          const local =
            (sinceMount - ENTRANCE_HOLD - planet.orbitIndex * RING_STAGGER) / ENTRANCE_DURATION;
          progress = local <= 0 ? 0 : local >= 1 ? 1 : easeOutCubic(local);
          if (index === planets.length - 1 && progress >= 1) {
            entranceDoneRef.current = true;
          }
        }
        const spread = 0.04 + 0.96 * progress;
        const x = geometry.rx * Math.cos(angle) * spread;
        const y = geometry.ry * Math.sin(angle) * spread;
        const depth = Math.sin(angle);

        positionsRef.current[planet.id] = { x, y, size: planet.size };

        const node = nodeRefs.current[planet.id];
        if (node) {
          node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
          node.style.zIndex = String(
            depth > 0 ? Math.round(54 + depth * 8) : Math.round(20 + (depth + 1) * 8),
          );
          node.style.opacity = String((0.78 + (depth + 1) * 0.11) * (0.08 + 0.92 * progress));
        }

        const visual = visualRefs.current[planet.id];
        if (visual) {
          const scale = 0.84 + (depth + 1) * 0.13;
          visual.style.transform = `scale(${scale.toFixed(3)})`;
        }
      });

      cameraFrame(delta);
      animation = requestAnimationFrame(update);
    };

    animation = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animation);
  }, [cameraFrame, orbitGeometry, positionsRef, reducedMotion, speed]);

  return (
    <div
      className={`orbit-viewport${camera.focusedId ? " is-focused" : ""}`}
      ref={camera.viewportRef}
      {...camera.viewportProps}
    >
      <div className="camera-layer" ref={cameraRef}>
        <div className="orbit-rings">
          {orbitGeometry.map((orbit) => (
            <img
              key={orbit.name}
              className="orbit-ring"
              src={orbit.src}
              alt=""
              draggable={false}
              style={{
                left: -orbit.rx,
                top: -orbit.ry,
                width: orbit.rx * 2,
                height: orbit.ry * 2,
              }}
            />
          ))}
        </div>

        <Sun />

        <div className="deep-space">
          <span className="deep-space-line" aria-hidden="true" />
          <span className="deep-space-label">Deep space boundary</span>
          <span className="deep-space-probe" style={{ top: "-190px" }}>
            <Icon name="probe" size={16} className="icon" aria-hidden="true" />
            <span className="deep-space-probe-text">
              Voyager I<em>1977</em>
            </span>
          </span>
          <span className="deep-space-probe" style={{ top: "-20px" }}>
            <Icon name="probe" size={16} className="icon" aria-hidden="true" />
            <span className="deep-space-probe-text">
              Voyager 2<em>1977</em>
            </span>
          </span>
          <span className="deep-space-probe" style={{ top: "110px" }}>
            <Icon name="probe" size={16} className="icon" aria-hidden="true" />
            <span className="deep-space-probe-text">
              New Horizons
              <em>2006</em>
            </span>
          </span>
        </div>

        {planets.map((planet) => {
          const counts = projectCounts(planet.id);
          const dimmed =
            (filter === "active" && counts.active === 0) ||
            (filter === "retired" && counts.retired === 0);

          return (
            <PlanetMarker
              key={planet.id}
              planet={planet}
              focused={focusedId === planet.id}
              dimmed={dimmed}
              highlighted={highlighted.has(planet.id)}
              counts={counts}
              onSelect={() => {
                if (consumeClickBlock()) return;
                onSelectPlanet(planet.id);
              }}
              registerNode={(element) => {
                nodeRefs.current[planet.id] = element;
              }}
              registerVisual={(element) => {
                visualRefs.current[planet.id] = element;
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

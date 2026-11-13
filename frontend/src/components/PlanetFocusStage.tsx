import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { img } from "../assets";
import { orbitMissionsFor, type PlanetMissionControl } from "../data/missionControl";
import type { PlanetRings } from "./CinematicPlanet3D";
import Icon from "./Icon";

/**
 * PlanetFocusStage — the "micro" view.
 *
 * The macro map keeps its own camera; this layer is what a focused planet
 * grows into. The globe itself is a real WebGL scene (`CinematicPlanet3D`,
 * loaded lazily so the atlas never pays for three.js) with the planet's
 * missions orbiting it. Everything else here — the scrim, the offset, the
 * caption — stays CSS so the entrance animation is pure compositor work.
 *
 * If WebGL is unavailable (locked-down school laptops, software rendering
 * blocked), the previous CSS sphere takes over: same layout, no GPU needed.
 */

const CinematicPlanet3D = lazy(() => import("./CinematicPlanet3D"));

type PlanetFocusStageProps = {
  data: PlanetMissionControl;
  reducedMotion: boolean;
  onDismiss: () => void;
  /** Earth only: true while the Moon's Mission Control panel is open. */
  moonActive?: boolean;
  onSelectMoon?: () => void;
  onSelectEarth?: () => void;
};

const EASE_OUT: [number, number, number, number] = [0.22, 0.9, 0.3, 1];

/** Only Earth ships a true equirectangular map; everything else is generated. */
const realMaps: Record<string, string> = { earth: img.earthMap };

let webglSupport: boolean | null = null;

function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

function useNarrow(query = "(max-width: 900px)") {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return narrow;
}

/** Horizontal bands from the planet palette, top to bottom. */
function bandGradient(bands: string[]) {
  const stops = bands.map((color, index) => {
    const at = ((index + 0.5) / bands.length) * 100;
    return `${color} ${at.toFixed(1)}%`;
  });
  return `linear-gradient(180deg, ${stops.join(", ")})`;
}

/** No-WebGL fallback: the hand-built CSS sphere. */
function CssGlobe({ data }: { data: PlanetMissionControl }) {
  const rings = data.rings;
  const ringStyle = rings
    ? {
        ["--mc-ring-tilt" as string]: `${rings.tilt}deg`,
        ["--mc-ring-band" as string]: rings.band,
        ["--mc-ring-soft" as string]: rings.bandSoft,
        ["--mc-ring-gap" as string]: rings.gap,
      }
    : undefined;

  return (
    <div className="mc-sphere" aria-hidden="true">
      {rings ? <span className="mc-ring mc-ring-back" style={ringStyle} /> : null}

      <div className="mc-globe">
        <span className="mc-bands" />
        <span className="mc-spots" />
        <span className="mc-shade" />
        <span className="mc-spec" />
        <span className="mc-limb" />
      </div>

      {rings ? <span className="mc-ring mc-ring-front" style={ringStyle} /> : null}
    </div>
  );
}

export default function PlanetFocusStage({
  data,
  reducedMotion,
  onDismiss,
  moonActive = false,
  onSelectMoon,
  onSelectEarth,
}: PlanetFocusStageProps) {
  const narrow = useNarrow();
  const { sphere, rings } = data;
  // The 3-D canvas measures its box once, at mount. Waiting for the entrance
  // to finish means it measures the finished box, not a mid-scale one.
  const [settled, setSettled] = useState(false);

  // For the 3rd page (planet focus view), start minimized to make the planet
  // and orbit system more compact and easier to see without overwhelming the screen
  const [minimized, setMinimized] = useState(true);

  // Missions orbit outside the ring system, so a ringed world needs a wider
  // first orbit than a bare one. Phones get a tighter shell layout — the
  // canvas is narrow, so a wide orbit spread would shrink the planet to a
  // pea and leave the labels no room. Orbit radii are scaled down with the
  // smaller planet so the whole system fits comfortably.
  const orbits = useMemo(() => {
    const start = rings ? (narrow ? 1.0 : 1.2) : narrow ? 0.8 : 1.0;
    const step = rings ? (narrow ? 0.06 : 0.1) : narrow ? 0.06 : 0.1;
    return orbitMissionsFor(data, start, step);
  }, [data, rings, narrow]);

  const ringProps: PlanetRings | null = rings
    ? { band: rings.band, soft: rings.bandSoft, gap: rings.gap, tilt: 0.38 }
    : null;

  const gl = useMemo(() => hasWebGL(), []);

  // Phones stack the drawer under the planet, so no sideways travel there.
  const shiftX = narrow ? 0 : "-20vw";

  return (
    <motion.div
      className="mc-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.4, ease: EASE_OUT }}
    >
      <button
        type="button"
        className="mc-stage-scrim"
        onClick={onDismiss}
        aria-label={`Back to the solar system map from ${data.planetName}`}
        tabIndex={-1}
      />

      <motion.div
        className="mc-stage-planet"
        // Start already at the final x offset so the globe grows in place
        // instead of sweeping across the stage.
        initial={{ x: shiftX, y: 0, scale: 0.42, opacity: 0 }}
        animate={{ x: shiftX, y: 0, scale: 1, opacity: 1 }}
        exit={{ x: shiftX, y: 0, scale: 0.4, opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.72, ease: EASE_OUT }}
        onAnimationComplete={() => setSettled(true)}
        style={{
          ["--mc-band" as string]: bandGradient(sphere.bands),
          ["--mc-highlight" as string]: sphere.highlight,
          ["--mc-shadow" as string]: sphere.shadow,
        }}
      >
        <div className="mc-stage-aura" aria-hidden="true" />

        {gl ? (
          <Suspense fallback={<CssGlobe data={data} />}>
            <CinematicPlanet3D
              planetId={data.planetId}
              missions={orbits}
              palette={sphere}
              textureUrl={realMaps[data.planetId]}
              rings={ringProps}
              reducedMotion={reducedMotion}
              settled={settled}
              showMoon={data.planetId === "earth"}
              moonSelected={moonActive}
              onSelectMoon={onSelectMoon}
            />
          </Suspense>
        ) : (
          <CssGlobe data={data} />
        )}

        <div className="mc-stage-caption">
          <span className="mc-stage-tag">FOCUS LOCK</span>
          <strong>{data.planetName}</strong>
          <em>{moonActive ? "Moon mission control open" : data.headline}</em>
          {data.planetId === "earth" ? (
            <div className="mc-stage-bodies" role="group" aria-label="Choose a body">
              <button
                type="button"
                className={!moonActive ? "is-active" : ""}
                onClick={() => onSelectEarth?.()}
                aria-pressed={!moonActive}
              >
                Earth
              </button>
              <button
                type="button"
                className={moonActive ? "is-active" : ""}
                onClick={() => onSelectMoon?.()}
                aria-pressed={moonActive}
              >
                Moon
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

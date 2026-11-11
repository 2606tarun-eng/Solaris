import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { PlanetMissionControl } from "../data/missionControl";

/**
 * PlanetFocusStage — the "micro" view.
 *
 * The macro map keeps its own camera; this layer is what a focused planet
 * grows into. The globe is a CSS sphere rather than a WebGL mesh: the texture
 * is a banded gradient with a seamless scrolling surface layer, so the world
 * genuinely rotates (gas giants read best, and the outer planets are gas
 * giants). Rings are drawn twice — the far half behind the globe and the near
 * half in front — which is what makes them look like they wrap around it.
 *
 * No 3-D library and no per-frame React state: one compositor-friendly
 * transform on a single element.
 */

type PlanetFocusStageProps = {
  data: PlanetMissionControl;
  reducedMotion: boolean;
  onDismiss: () => void;
};

const EASE_OUT: [number, number, number, number] = [0.22, 0.9, 0.3, 1];

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

export default function PlanetFocusStage({
  data,
  reducedMotion,
  onDismiss,
}: PlanetFocusStageProps) {
  const narrow = useNarrow();
  const { sphere, rings } = data;

  // Phones stack the drawer under the planet, so no sideways travel there.
  const shift = { x: narrow ? 0 : "-20vw" };

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
        initial={{ x: 0, y: 0, scale: 0.42, opacity: 0 }}
        animate={{ ...shift, scale: 1, opacity: 1 }}
        exit={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.72, ease: EASE_OUT }}
        style={{
          ["--mc-band" as string]: bandGradient(sphere.bands),
          ["--mc-highlight" as string]: sphere.highlight,
          ["--mc-shadow" as string]: sphere.shadow,
        }}
      >
        <div className="mc-stage-aura" aria-hidden="true" />

        <div className="mc-sphere" aria-hidden="true">
          {rings ? (
            <span
              className="mc-ring mc-ring-back"
              style={{
                ["--mc-ring-tilt" as string]: `${rings.tilt}deg`,
                ["--mc-ring-band" as string]: rings.band,
                ["--mc-ring-soft" as string]: rings.bandSoft,
                ["--mc-ring-gap" as string]: rings.gap,
              }}
            />
          ) : null}

          <div className="mc-globe">
            <span className="mc-bands" />
            <span className="mc-spots" />
            <span className="mc-shade" />
            <span className="mc-spec" />
            <span className="mc-limb" />
          </div>

          {rings ? (
            <span
              className="mc-ring mc-ring-front"
              style={{
                ["--mc-ring-tilt" as string]: `${rings.tilt}deg`,
                ["--mc-ring-band" as string]: rings.band,
                ["--mc-ring-soft" as string]: rings.bandSoft,
                ["--mc-ring-gap" as string]: rings.gap,
              }}
            />
          ) : null}
        </div>

        <div className="mc-stage-caption">
          <span className="mc-stage-tag">FOCUS LOCK</span>
          <strong>{data.planetName}</strong>
          <em>{data.headline}</em>
        </div>
      </motion.div>
    </motion.div>
  );
}

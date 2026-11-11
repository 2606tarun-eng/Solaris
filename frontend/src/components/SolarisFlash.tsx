import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FLASH_TIMING, flashBus, type FlashState } from "../lib/flashBus";

/**
 * SolarisFlash — the overlay that carries the splash -> atlas transition.
 *
 * Rendered once by <Root />, above both routes, so the DOM node survives the
 * route swap: the glow that fills the frame on "/" is literally the same
 * element that shrinks into the Sun on "/app". Nothing is re-created, so the
 * hand-off has no seam.
 *
 * Everything here is soft light: a radial-gradient disc with no borders, no
 * outline, no rings and no clipped edges. The gradient reaches full
 * transparency exactly at the disc's own edge, so there is never a visible
 * boundary — only glow.
 *
 *   Stage 1  "expand"   — the orb grows out of the Sun's screen point to
 *                         COVER_SCALE while fading in, until the frame is
 *                         completely wrapped in warm light.
 *   Stage 2  (route)    — Root swaps the routes at full cover; nothing to see.
 *   Stage 3  "breathe"  — the same orb shrinks back to nothing and fades, so
 *                         the last thing left is the glow resting on the Sun.
 */

/** Final scale of the cover state. The atlas reports in precisely here. */
const COVER_SCALE = 1.5;

/* framer-motion takes seconds; FLASH_TIMING is authored in ms. Convert once. */
const COVER_S = FLASH_TIMING.coverMs / 1000;
const BREATHE_S = FLASH_TIMING.breatheMs / 1000;
const BREATHE_DELAY_S = FLASH_TIMING.breatheDelayMs / 1000;

const EASE_COVER: [number, number, number, number] = [0.22, 0.9, 0.3, 1];
/** Ease-in on the way home reads as "absorbed into the Sun". */
const EASE_BREATHE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const CSS_FLASH = `
.solaris-flash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
}

/*
 * The flare: a borderless disc of soft light centred on the Sun.
 *
 * Sized so that at COVER_SCALE the opaque core reaches past every viewport
 * corner, which means the frame whites out with the falloff entirely
 * off-screen — you never see where the disc ends.
 */
.solaris-flash-orb {
  position: absolute;
  left: var(--flash-x, 50%);
  top: var(--flash-y, 50%);
  width: var(--flash-d, 320vmax);
  height: var(--flash-d, 320vmax);
  margin-left: calc(var(--flash-d, 320vmax) / -2);
  margin-top: calc(var(--flash-d, 320vmax) / -2);
  border: none;
  outline: none;
  border-radius: 50%;
  will-change: transform, opacity;
  /* \`closest-side\` makes the 100% stop coincide with the clipped edge, so the
   * fade finishes exactly where the element does: no rim, no hard circle.
   * Alpha holds at 1 out to 62% so that, once scaled to COVER_SCALE, the whole
   * frame sits inside the solid core and whites out with no see-through. */
  background: radial-gradient(
    circle closest-side,
    rgba(255, 248, 234, 1) 0%,
    rgba(255, 237, 208, 1) 28%,
    rgba(255, 226, 190, 1) 46%,
    rgba(255, 216, 174, 1) 62%,
    rgba(255, 206, 160, 0.66) 76%,
    rgba(255, 198, 148, 0.26) 89%,
    rgba(255, 178, 116, 0) 100%
  );
}

/* A second, tighter gradient inside the orb: the flare hotspot. It reaches
 * zero alpha long before its own edge, so it never reads as a drawn circle. */
.solaris-flash-core {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: 50%;
  background: radial-gradient(
    circle closest-side,
    rgba(255, 255, 250, 0.9) 0%,
    rgba(255, 246, 226, 0.55) 20%,
    rgba(255, 231, 194, 0.24) 36%,
    rgba(255, 214, 168, 0) 52%
  );
}

@media (prefers-reduced-motion: reduce) {
  .solaris-flash-orb {
    transition: none;
  }
}
`;

export default function SolarisFlash() {
  const reducedMotion = useReducedMotion();
  const [flash, setFlash] = useState<FlashState>(() => flashBus.get());

  useEffect(() => flashBus.subscribe(setFlash), []);

  // Safety net: if the atlas never reports in (navigation was cancelled or the
  // route threw), lift the cover so the landing is never left blank.
  useEffect(() => {
    if (flash.phase !== "expand") return;
    const timer = window.setTimeout(
      () => flashBus.reset(),
      FLASH_TIMING.beginDelayMs + FLASH_TIMING.coverMs + 2000,
    );
    return () => window.clearTimeout(timer);
  }, [flash.phase]);

  // Breathe-out finished (or was skipped) -> drop the overlay entirely.
  useEffect(() => {
    if (flash.phase !== "breathe") return;
    const clearAt = reducedMotion ? 90 : FLASH_TIMING.breatheDelayMs + FLASH_TIMING.breatheMs + 120;
    const timer = window.setTimeout(() => flashBus.reset(), clearAt);
    return () => window.clearTimeout(timer);
  }, [flash.phase, reducedMotion]);

  if (flash.phase === "idle") {
    return <style>{CSS_FLASH}</style>;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Distance from the Sun's screen point to the furthest corner of the frame.
  const corner = Math.hypot(
    Math.max(flash.point.x, width - flash.point.x),
    Math.max(flash.point.y, height - flash.point.y),
  );

  // Base diameter: radius 1.6x the corner distance, so at COVER_SCALE (1.5)
  // the solid core sits at 2.4x and swallows the whole frame with margin.
  const vars = {
    "--flash-x": `${Math.round(flash.point.x)}px`,
    "--flash-y": `${Math.round(flash.point.y)}px`,
    "--flash-d": `${Math.ceil(corner * 3.2)}px`,
  } as CSSProperties;

  const breathing = flash.phase === "breathe";

  // The orb animates from wherever it currently is, so expand -> breathe is a
  // single continuous motion with no restart and no jump.
  const transition = reducedMotion
    ? { duration: 0.06 }
    : breathing
      ? {
          scale: { duration: BREATHE_S, delay: BREATHE_DELAY_S, ease: EASE_BREATHE },
          opacity: { duration: BREATHE_S, delay: BREATHE_DELAY_S, ease: EASE_BREATHE },
        }
      : { duration: COVER_S, ease: EASE_COVER };

  return (
    <>
      <style>{CSS_FLASH}</style>
      <div className="solaris-flash" style={vars} aria-hidden="true">
        <motion.div
          className="solaris-flash-orb"
          initial={{ scale: 0, opacity: 0 }}
          animate={breathing ? { scale: 0, opacity: 0 } : { scale: COVER_SCALE, opacity: 1 }}
          transition={transition}
        >
          <span className="solaris-flash-core" />
        </motion.div>
      </div>
    </>
  );
}

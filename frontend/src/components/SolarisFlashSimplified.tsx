import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { flashBus, type FlashState } from "../lib/flashBus";

/**
 * Simplified SolarisFlash overlay:
 *
 *   Stage 1  "expand"   — a bright circular orb scales up from the sun point to full
 *                         cover in ~0.3s, no sheet, no gaps.
 *   Stage 2  (route)    — navigate happens at max coverage.
 *   Stage 3  "breathe"  — the orb fades and shrinks back into the sun while the
 *                         atlas mounts. The Sun appears first, then planets
 *                         (instant, no entrance).
 */

const COVER_DURATION = 0.3;
const CORE_OUT = 0.2;
const BODY_OUT = 0.4;
const BREATHE_DELAY = 0.1;

const EASE_COVER: [number, number, number, number] = [0.22, 0.9, 0.3, 1];
const EASE_BREATHE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const CSS_FLASH = `
.solaris-flash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

/* The flare is a pure borderless orb with a smooth radial gradient.
 * No gaps, no sheet, just a bright circle that expands to cover the screen. */
.solaris-flash-orb {
  position: absolute;
  left: var(--flash-x, 50%);
  top: var(--flash-y, 50%);
  width: var(--flash-d, 2400px);
  height: var(--flash-d, 2400px);
  margin-left: calc(var(--flash-d, 2400px) / -2);
  margin-top: calc(var(--flash-d, 2400px) / -2);
  border: none;
  outline: none;
  border-radius: 50%;
  will-change: transform, opacity;
  background: radial-gradient(
    circle closest-side,
    rgba(255, 246, 230, 0) 0%,
    rgba(255, 220, 165, 0.9) 5%,
    rgba(255, 190, 130, 0.98) 12%,
    #f6a263 24%,
    rgba(190, 92, 44, 0.99) 44%,
    rgba(96, 40, 18, 0.97) 64%,
    rgba(10, 5, 3, 0.95) 80%,
    rgba(5, 4, 4, 0) 100%
  );
}

/* The hot core: borderless glowing orb for the final Sun reveal. */
.solaris-flash-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--flash-core, 300px);
  height: var(--flash-core, 300px);
  margin-left: calc(var(--flash-core, 300px) / -2);
  margin-top: calc(var(--flash-core, 300px) / -2);
  border: none;
  outline: none;
  box-shadow: 0 0 52px 10px rgba(255, 210, 150, 0.5);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    #fffaf2 0%,
    #ffe9c8 30%,
    rgba(255, 208, 156, 0.66) 62%,
    rgba(255, 180, 120, 0) 100%
  );
}

@media (prefers-reduced-motion: reduce) {
  .solaris-flash-orb,
  .solaris-flash-core {
    transition: none;
  }
}
`;

/** How wide the sun renders on screen: SUN_SIZE * base zoom (see useCamera). */
function sunScreenRadius(width: number, height: number) {
  const base = Math.min(1.12, Math.max(0.42, Math.min(width / 1280, height / 720)));
  return (150 * base) / 2;
}

export default function SolarisFlashSimplified() {
  const reducedMotion = useReducedMotion();
  const [flash, setFlash] = useState<FlashState>(() => flashBus.get());

  useEffect(() => flashBus.subscribe(setFlash), []);

  // Safety net: if the atlas never reports in (navigation was cancelled),
  // lift the cover so the landing is never left blank.
  useEffect(() => {
    if (flash.phase !== "expand") return;
    const timer = window.setTimeout(() => flashBus.reset(), 2200);
    return () => window.clearTimeout(timer);
  }, [flash.phase]);

  // Breathe-out finished (or was skipped) -> drop the overlay entirely.
  useEffect(() => {
    if (flash.phase !== "breathe") return;
    const clearAt = reducedMotion ? 90 : (BREATHE_DELAY + BODY_OUT) * 1000 + 120;
    const timer = window.setTimeout(() => flashBus.reset(), clearAt);
    return () => window.clearTimeout(timer);
  }, [flash.phase, reducedMotion]);

  if (flash.phase === "idle") {
    return <style>{CSS_FLASH}</style>;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const sunRadius = sunScreenRadius(width, height);

  // Farthest corner from the sun point, padded so the orb's transparent
  // vignette edge sits comfortably past the viewport.
  const corner = Math.hypot(
    Math.max(flash.point.x, width - flash.point.x),
    Math.max(flash.point.y, height - flash.point.y),
  );
  const orbDiameter = Math.ceil(corner * 2.6);

  const vars = {
    "--flash-x": `${Math.round(flash.point.x)}px`,
    "--flash-y": `${Math.round(flash.point.y)}px`,
    "--flash-d": `${orbDiameter}px`,
    "--flash-core": `${Math.ceil(sunRadius * 3.4)}px`,
  } as CSSProperties;

  const breathing = flash.phase === "breathe";
  const quick = reducedMotion ? 0.06 : undefined;

  const orbTransition = breathing
    ? quick
      ? { duration: 0.06 }
      : {
          opacity: { duration: BODY_OUT, ease: EASE_BREATHE, delay: BREATHE_DELAY },
          scale: { duration: BODY_OUT, ease: EASE_BREATHE, delay: BREATHE_DELAY },
        }
    : { duration: quick ?? COVER_DURATION, ease: EASE_COVER };

  return (
    <>
      <style>{CSS_FLASH}</style>
      <div className="solaris-flash" style={vars} aria-hidden="true">
        <motion.div
          className="solaris-flash-orb"
          initial={{ opacity: 0, scale: 0.04 }}
          animate={breathing ? { opacity: 0, scale: 0.14 } : { opacity: 1, scale: 1 }}
          transition={orbTransition}
        >
          <motion.div
            className="solaris-flash-core"
            initial={{ opacity: 0 }}
            animate={{ opacity: breathing ? 0 : 1 }}
            transition={
              quick
                ? { duration: 0.06 }
                : breathing
                  ? { duration: CORE_OUT, ease: "easeOut" }
                  : { duration: 0.22, ease: "easeOut", delay: 0.05 }
            }
          />
        </motion.div>
      </div>
    </>
  );
}

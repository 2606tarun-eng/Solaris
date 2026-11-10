import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { flashBus, type FlashState } from "../lib/flashBus";

/**
 * SolarisFlash — the overlay that carries the splash -> atlas transition.
 *
 * Rendered once by Root, above both routes, so it never unmounts when the
 * route flips while the screen is fully covered. The flare is a *light
 * sheet*, not a circle: it starts as a thin hot filament on the waves'
 * horizontal line, then expands vertically until it covers the whole frame
 * with soft, straight-edged light. No circular shape ever appears.
 *
 *   Stage 1  "expand"   — light sheet rises out of the waves (thin line ->
 *                         full-screen soft sheet) in ~0.42s.
 *   Stage 2  (route)    — change happens at full cover; nothing to see.
 *   Stage 3  "breathe"  — the hot filament fades first (the Sun shows
 *                         through the sheet's centre slot), then the sheet
 *                         collapses back into the sun's line while the
 *                         planets ride outward beneath it.
 */

const COVER_DURATION = 0.42;
const FILAMENT_IN = 0.2;
const CORE_OUT = 0.26;
const BODY_OUT = 0.55;
/** The sheet holds full cover for this long before breathing out. */
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

/* The light sheet: a full-width slab whose vertical gradient is centred on
 * the sun's y. The gradient carries a thin, nearly-transparent slot exactly
 * at the sun line, so the Sun peeks through as the sheet breathes out. */
.solaris-flash-body {
  position: absolute;
  inset: 0;
  will-change: transform, opacity;
}

/* The hot filament: a borderless horizontal capsule of light lying on the
 * waves' line. Pure glow — soft shadow blur, no borders, no rings. */
.solaris-flash-filament {
  position: absolute;
  left: var(--flash-x, 50%);
  top: var(--flash-y, 50%);
  width: var(--flash-fil-w, 320px);
  height: var(--flash-fil-h, 90px);
  margin-left: calc(var(--flash-fil-w, 320px) / -2);
  margin-top: calc(var(--flash-fil-h, 90px) / -2);
  border: none;
  outline: none;
  border-radius: 999px;
  box-shadow: 0 0 52px 10px rgba(255, 210, 150, 0.5);
  background: radial-gradient(
    ellipse closest-side,
    #fff6e4 0%,
    #ffe6c2 32%,
    rgba(255, 206, 152, 0.55) 64%,
    rgba(255, 182, 122, 0) 100%
  );
}

@media (prefers-reduced-motion: reduce) {
  .solaris-flash-body,
  .solaris-flash-filament {
    transition: none;
  }
}
`;

/** How wide the sun renders on screen: SUN_SIZE * base zoom (see useCamera). */
function sunScreenRadius(width: number, height: number) {
  const base = Math.min(1.12, Math.max(0.42, Math.min(width / 1280, height / 720)));
  return (150 * base) / 2;
}

/** Vertical gradient for the sheet, centred (with a Sun slot) at `sunPct`. */
function sheetGradient(sunPct: number) {
  const c = Math.min(92, Math.max(8, sunPct));
  const rampTop = Math.max(0, c - 30);
  const slotA = Math.max(0, Number((c - 1.8).toFixed(2)));
  const slotStart = Math.max(0, Number((c - 1.1).toFixed(2)));
  const slotEnd = Math.min(100, Number((c + 1.1).toFixed(2)));
  const slotB = Math.min(100, Number((c + 1.8).toFixed(2)));
  const rampBottom = Math.min(100, c + 30);
  return (
    "linear-gradient(180deg, " +
    [
      `rgba(214, 122, 66, 0.85) 0%`,
      `rgba(255, 206, 150, 0.94) ${rampTop.toFixed(1)}%`,
      `rgba(255, 216, 164, 0.99) ${slotA}%`,
      `rgba(255, 244, 222, 0.26) ${slotStart}%`,
      `rgba(255, 244, 222, 0.26) ${slotEnd}%`,
      `rgba(255, 228, 178, 0.99) ${slotB}%`,
      `rgba(255, 213, 158, 0.96) ${rampBottom.toFixed(1)}%`,
      `rgba(214, 122, 66, 0.85) 100%`,
    ].join(", ") +
    ")"
  );
}

export default function SolarisFlash() {
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
  const sunPct = (flash.point.y / height) * 100;

  const vars = {
    "--flash-x": `${Math.round(flash.point.x)}px`,
    "--flash-y": `${Math.round(flash.point.y)}px`,
    "--flash-fil-w": `${Math.ceil(sunRadius * 3.6)}px`,
    "--flash-fil-h": `${Math.ceil(sunRadius * 1.1)}px`,
  } as CSSProperties;

  const breathing = flash.phase === "breathe";
  const quick = reducedMotion ? 0.06 : undefined;

  const bodyTransition = breathing
    ? quick
      ? { duration: 0.06 }
      : {
          opacity: { duration: BODY_OUT, delay: BREATHE_DELAY },
          scale: { duration: BODY_OUT, delay: BREATHE_DELAY },
        }
    : { duration: quick ?? COVER_DURATION };

  const filamentTransition = quick
    ? { duration: 0.06 }
    : breathing
      ? { duration: CORE_OUT }
      : { duration: FILAMENT_IN, delay: 0.05 };

  return (
    <>
      <style>{CSS_FLASH}</style>
      <div className="solaris-flash" style={vars} aria-hidden="true">
        <motion.div
          className="solaris-flash-body"
          style={{
            transformOrigin: `50% ${sunPct.toFixed(2)}%`,
            background: sheetGradient(sunPct),
          }}
          initial={{ opacity: 0, scaleY: 0.05 }}
          animate={breathing ? { opacity: 0, scaleY: 0.1 } : { opacity: 1, scaleY: 1 }}
          transition={bodyTransition}
        >
          <motion.div
            className="solaris-flash-filament"
            initial={{ opacity: 0 }}
            animate={{ opacity: breathing ? 0 : 1 }}
            transition={filamentTransition}
          />
        </motion.div>
      </div>
    </>
  );
}

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MotionConfig, motion, useReducedMotion, type Variants } from "framer-motion";
import { flashBus, forecastSunPoint, FLASH_TIMING, WARP_TOTAL_MS } from "../lib/flashBus";

/**
 * Solaris — splash landing page.
 *
 * Standalone: render it at "/" and hand it an `onEnter` callback (React Router,
 * TanStack Router, or the tiny history router in `src/Root.tsx`). It owns its
 * own styles and art, so the atlas app is never touched.
 */

export const LANDING_APP_PATH = "/app";

const WARP_DURATION_MS = WARP_TOTAL_MS;
/**
 * Stage 1 (0 –~0.16s): the UI text fades out while the canvas waves keep
 * running. Stage 2 (~0.16 – 0.76s): the persisted SolarisFlash orb grows out of
 * the Sun point until it floods the frame. Stage 3: the instant it reaches full
 * cover, navigate — the same orb then shrinks into the Sun on "/app".
 *
 * Timing comes from FLASH_TIMING in `lib/flashBus` so the splash and the
 * overlay can never drift apart.
 */
/** How long the wave light-build runs before the orb fully takes over. */
const WAVE_RAMP_MS = 480;
const EASE_OUT: [number, number, number, number] = [0.22, 0.9, 0.3, 1];
/** Slow shrink of the world as the light floods in (depth cue only). */
const WARP_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const FONT_URL = `${import.meta.env.BASE_URL}fonts/Inter.ttf`;

export type LandingIntroProps = {
  /** Called once the warp-in finishes. Usually `() => navigate("/app")`. */
  onEnter?: () => void;
  /** Fallback target used when `onEnter` is omitted. */
  enterHref?: string;
  className?: string;
};

/* ------------------------------------------------------------------ motion */

const shellVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.085, delayChildren: 0.15 } },
  // Step 1 — copy clears in ≈300ms so the flash takes over the stage.
  warp: { transition: { staggerChildren: 0.012, staggerDirection: -1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE_OUT } },
  warp: { opacity: 0, transition: { duration: 0.28, ease: "easeIn" } },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.35, ease: EASE_OUT } },
  warp: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

/* --------------------------------------------------------------------- css */

const CSS_SCENE = `
@font-face {
  font-family: "Inter Variable";
  src: url("${FONT_URL}") format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

.landing-root {
  --copper: #e6ae83;
  --copper-bright: #f7d3b0;
  --copper-mid: rgba(230, 174, 131, 0.62);
  --copper-dim: rgba(230, 174, 131, 0.38);
  --copper-faint: rgba(230, 174, 131, 0.16);
  position: fixed;
  inset: 0;
  height: 100dvh;
  overflow: hidden;
  background: #060505;
  color: var(--copper);
  font-family: "Inter Variable", "Inter:Regular", ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  isolation: isolate;
}

.landing-root ::selection {
  background: rgba(249, 128, 64, 0.3);
}

.landing-mono {
  font-family: "IBM Plex Mono:Regular", ui-monospace, monospace;
}

.landing-stage {
  position: absolute;
  inset: 0;
  transform-origin: 70% 46%;
  will-change: transform;
}

.landing-sky {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(90% 74% at 66% 50%, rgba(120, 62, 30, 0.13) 0%, rgba(48, 26, 15, 0.06) 42%, rgba(8, 6, 5, 0) 72%),
    radial-gradient(70% 60% at 10% 6%, rgba(52, 44, 40, 0.16) 0%, rgba(6, 5, 5, 0) 62%),
    radial-gradient(60% 50% at 92% 96%, rgba(70, 34, 18, 0.1) 0%, rgba(6, 5, 5, 0) 66%),
    linear-gradient(180deg, #070606 0%, #080606 46%, #0a0705 72%, #050404 100%);
}

.landing-sky::after {
  content: "";
  position: absolute;
  inset: -24%;
  background: linear-gradient(
    104deg,
    transparent 38%,
    rgba(214, 180, 150, 0.022) 46%,
    rgba(255, 212, 172, 0.04) 51%,
    rgba(214, 180, 150, 0.018) 57%,
    transparent 68%
  );
  transform: rotate(-9deg);
}

.landing-cursor-glow {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: min(50vw, 560px);
  aspect-ratio: 1;
  margin: 0;
  opacity: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 168, 106, 0.12) 0%,
    rgba(249, 124, 64, 0.06) 30%,
    rgba(214, 104, 56, 0.025) 54%,
    rgba(0, 0, 0, 0) 70%
  );
  mix-blend-mode: screen;
  pointer-events: none;
  transition: opacity 700ms ease;
  will-change: transform;
}

.landing-stage.is-warping .landing-cursor-glow {
  opacity: 0 !important;
}

.landing-dust {
  position: absolute;
  inset: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transition: opacity 500ms ease;
}

.landing-stage.is-warping .landing-dust {
  opacity: 0;
}
`;

const CSS_WAVE = `
.landing-wave {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.landing-sparkle {
  position: absolute;
  z-index: 3;
  width: 30px;
  opacity: 0.45;
  pointer-events: none;
}

/* keeps the hero type legible where the wave passes behind it */
.landing-scrim {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  background: radial-gradient(
    54% 60% at 15% 45%,
    rgba(5, 4, 4, 0.5) 0%,
    rgba(5, 4, 4, 0.34) 40%,
    rgba(5, 4, 4, 0.14) 64%,
    rgba(5, 4, 4, 0) 80%
  );
}

@media (max-width: 700px) {
  .landing-scrim {
    display: none;
  }
}

.landing-sparkle-b {
  right: 21%;
  top: 11%;
  width: 14px;
  opacity: 0.28;
}

@media (max-width: 700px) {
  .landing-sparkle {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-sparkle {
    opacity: 0.3;
  }
}
`;

const CSS_TEXT = `
.landing-vignette {
  position: absolute;
  inset: 0;
  z-index: 6;
  background:
    radial-gradient(120% 100% at 64% 46%, rgba(0, 0, 0, 0) 42%, rgba(0, 0, 0, 0.5) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 26%, rgba(0, 0, 0, 0) 72%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}

.landing-grain {
  position: absolute;
  inset: 0;
  z-index: 9;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.55'/></svg>");
  background-size: 160px 160px;
  mix-blend-mode: overlay;
  opacity: 0.05;
  pointer-events: none;
}

.landing-shell {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: clamp(20px, 3.2vw, 46px) clamp(22px, 4.6vw, 74px) clamp(16px, 2.6vh, 30px);
  pointer-events: none;
}

.landing-meta {
  justify-self: start;
  margin: 0;
  font-family: "IBM Plex Mono:Regular", ui-monospace, monospace;
  font-size: clamp(9.5px, 0.78vw, 11px);
  line-height: 1.7;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(230, 174, 131, 0.62);
}

.landing-meta span {
  display: block;
  white-space: nowrap;
}

.landing-main {
  align-self: center;
  justify-self: start;
  max-width: min(580px, 48vw);
  margin-top: -5vh;
  pointer-events: none;
}

.landing-title {
  margin: 0;
  font-family: "Inter Variable", "Inter:Regular", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(64px, 10.2vw, 140px);
  font-weight: 200;
  line-height: 0.88;
  letter-spacing: -0.028em;
  background: linear-gradient(103deg, #f9d9b6 0%, #eab189 34%, #cf875d 68%, #a95c37 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 26px rgba(240, 140, 80, 0.16));
  user-select: none;
}

.landing-subtitle {
  margin: clamp(10px, 1.6vh, 18px) 0 0;
  font-family: "Inter Variable", "Inter:Regular", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(12px, 1.1vw, 14px);
  font-weight: 300;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(233, 190, 158, 0.8);
}

.landing-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-top: clamp(26px, 5vh, 54px);
  padding: 0 2px 13px;
  border: 0;
  border-radius: 2px;
  background: none;
  color: #eec3a0;
  font-family: "Inter Variable", "Inter:Regular", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(12px, 1.02vw, 14px);
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  pointer-events: auto;
  transition: color 400ms ease;
}

.landing-cta:hover {
  color: #ffdcbc;
}

.landing-cta:disabled {
  cursor: default;
}

.landing-cta:disabled:hover .landing-cta-arrow {
  transform: none;
}

.landing-cta-rule {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(247, 196, 152, 0.95) 0%,
    rgba(240, 175, 128, 0.4) 64%,
    rgba(240, 175, 128, 0.1) 100%
  );
  transform-origin: left center;
  transition:
    transform 550ms cubic-bezier(0.16, 0.84, 0.3, 1),
    box-shadow 450ms ease,
    opacity 350ms ease;
}

.landing-cta:hover .landing-cta-rule,
.landing-cta:focus-visible .landing-cta-rule {
  transform: scaleX(1.06);
  box-shadow: 0 0 12px rgba(250, 140, 70, 0.8);
}

.landing-cta-arrow {
  display: inline-block;
  font-size: 1.05em;
  line-height: 1;
  transition:
    transform 450ms cubic-bezier(0.16, 0.84, 0.3, 1),
    filter 450ms ease;
}

.landing-cta:hover .landing-cta-arrow {
  transform: translateX(7px);
  filter: drop-shadow(0 0 8px rgba(255, 150, 80, 0.75));
}

.landing-cta:focus-visible {
  outline: 1px solid rgba(230, 174, 131, 0.85);
  outline-offset: 8px;
}

.landing-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  margin: 0;
  text-align: center;
}

.landing-team {
  margin: 0;
  padding-left: 0.34em;
  font-family: "Inter Variable", "Inter:Regular", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(12px, 0.98vw, 14px);
  font-weight: 400;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(236, 198, 168, 0.8);
}

.landing-status {
  margin: 9px 0 0;
  font-family: "IBM Plex Mono:Regular", ui-monospace, monospace;
  font-size: clamp(9px, 0.74vw, 10.5px);
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(230, 174, 131, 0.52);
}

.landing-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1024px) {
  .landing-main {
    max-width: 54vw;
  }
}

@media (max-width: 860px) {
  .landing-main {
    max-width: 62vw;
  }
}

@media (max-width: 700px) {
  .landing-shell {
    padding: 20px 22px 16px;
  }

  .landing-main {
    align-self: end;
    max-width: 100%;
    margin: 0 0 2.5vh;
  }

  .landing-title {
    font-size: clamp(56px, 17vw, 88px);
  }

  .landing-subtitle {
    letter-spacing: 0.16em;
  }

  .landing-footer {
    margin-top: 3vh;
  }
}

@media (max-height: 640px) and (min-width: 701px) {
  .landing-title {
    font-size: clamp(54px, 8.4vw, 104px);
  }

  .landing-main {
    margin-top: 0;
  }

  .landing-cta {
    margin-top: 20px;
  }

  .landing-footer {
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-cursor-glow {
    display: none;
  }

  .landing-cta-rule,
  .landing-cta-arrow,
  .landing-cta {
    transition: none;
  }
}
`;

/* ------------------------------------------------------------------ waves */

type WaveSpec = {
  /** amplitude as a fraction of the viewport height. */
  amp: number;
  /** wavelength divisor — larger means tighter ripples. */
  freq: number;
  /** phase drift in radians per second (negative runs the other way). */
  speed: number;
  phase: number;
  alpha: number;
  width: number;
  tint: string;
};

/** Five stacked transmissions: warm copper, bronze and dark gold. */
const WAVES: WaveSpec[] = [
  {
    amp: 0.062,
    freq: 1.9,
    speed: 0.3,
    phase: 0.4,
    alpha: 0.58,
    width: 1.15,
    tint: "232, 185, 165",
  },
  {
    amp: 0.1,
    freq: 1.15,
    speed: -0.22,
    phase: 1.9,
    alpha: 0.38,
    width: 1.05,
    tint: "196, 139, 113",
  },
  { amp: 0.042, freq: 2.8, speed: 0.46, phase: 3.6, alpha: 0.5, width: 0.9, tint: "244, 205, 176" },
  {
    amp: 0.145,
    freq: 0.82,
    speed: 0.14,
    phase: 5.2,
    alpha: 0.3,
    width: 1.35,
    tint: "196, 139, 113",
  },
  {
    amp: 0.074,
    freq: 2.3,
    speed: -0.36,
    phase: 2.4,
    alpha: 0.36,
    width: 0.95,
    tint: "232, 185, 165",
  },
];

type NodeSpec = {
  /** horizontal position as a fraction of the canvas width. */
  x: number;
  /** vertical offset from the wave centre, as a fraction of the height. */
  y: number;
  wave: number;
  label: string;
  /** place the caption to the left of the dot. */
  flip: boolean;
};

const WAVE_NODES: NodeSpec[] = [
  { x: 0.5, y: -0.175, wave: 0, label: "VGR-1 / SENSOR PING", flip: false },
  { x: 0.64, y: 0.2, wave: 1, label: "P-10 / LOSS OF SIGNAL", flip: false },
  { x: 0.735, y: -0.235, wave: 3, label: "TLM-07 / CARRIER LOCK", flip: false },
  { x: 0.88, y: -0.115, wave: 2, label: "DEEP SPACE BEACON // 4081HZ", flip: true },
  { x: 0.955, y: 0.12, wave: 4, label: "RELAY // 1.2 AU", flip: true },
];

const MONO_STACK = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

const smoothstep = (value: number) => {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
};

function WaveField({ warping, reducedMotion }: { warping: boolean; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warpAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (warping && warpAtRef.current === null) {
      warpAtRef.current = performance.now();
    }
  }, [warping]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    const start = performance.now();
    const gradients = new Map<string, CanvasGradient>();

    /** Horizontal alpha ramp: transparent edges, solid in the middle. */
    const gradientFor = (tint: string) => {
      const cached = gradients.get(tint);
      if (cached) return cached;
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, `rgba(${tint}, 0)`);
      gradient.addColorStop(0.15, `rgba(${tint}, 1)`);
      gradient.addColorStop(0.85, `rgba(${tint}, 1)`);
      gradient.addColorStop(1, `rgba(${tint}, 0)`);
      gradients.set(tint, gradient);
      return gradient;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      gradients.clear();
    };

    const paint = (now: number) => {
      const t = (now - start) / 1000;

      // Warp: the waves never stop flowing — the transition pours light out
      // of them while the sun-point glow builds toward the flash.
      const warpRaw =
        warpAtRef.current === null
          ? 0
          : Math.min(1, Math.max(0, (now - warpAtRef.current) / WAVE_RAMP_MS));
      const warp = warpRaw * warpRaw;
      // only a gentle dim of the structure, so the growing glow reads as hero
      const flatten = 1 - 0.35 * warp;

      const compact = width < 700;
      const cy = height * (compact ? 0.34 : 0.48);
      const step = width > 1100 ? 11 : 15;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.lineJoin = "round";

      // faint oscilloscope baseline that anchors the carrier
      if (warp < 0.98) {
        context.strokeStyle = gradientFor("230, 174, 131");
        context.globalAlpha = 0.075 * (1 - warp * 0.6);
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(0, Math.round(cy) + 0.5);
        context.lineTo(width, Math.round(cy) + 0.5);
        context.stroke();
        context.beginPath();
        for (let x = width * 0.3; x < width * 0.97; x += 92) {
          context.moveTo(Math.round(x) + 0.5, cy - 2.5);
          context.lineTo(Math.round(x) + 0.5, cy + 2.5);
        }
        context.globalAlpha = 0.14 * (1 - warp * 0.6);
        context.stroke();
        context.globalAlpha = 1;
      }

      const yAt = (spec: WaveSpec, x: number, gain: number) => {
        const wavelength = Math.max(width * 0.92, 640) / spec.freq;
        const k = (Math.PI * 2) / wavelength;
        const norm = x / width;
        // taper the amplitude into a flat line at both edges
        const taper = smoothstep(norm / 0.15) * smoothstep((1 - norm) / 0.15);
        const amp = spec.amp * height * gain * (compact ? 0.78 : 1) * (0.3 + 0.7 * taper);
        const primary = Math.sin(k * x + t * spec.speed + spec.phase);
        const harmonic = Math.sin(k * 0.47 * x - t * spec.speed * 0.7 + spec.phase * 1.7);
        return {
          y: cy + (primary + harmonic * 0.34) * amp,
          taper,
        };
      };

      WAVES.forEach((spec) => {
        const gain = flatten * (1 + 0.05 * Math.sin(t * 0.5 + spec.phase));
        // the waves themselves radiate light as the warp builds
        const boost = (1 + 2.4 * warp) * (1 + 0.35 * warpRaw);

        const trace = (lineWidth: number, alpha: number) => {
          context.beginPath();
          for (let x = 0; x <= width; x += step) {
            const point = yAt(spec, x, gain);
            if (x === 0) context.moveTo(x, point.y);
            else context.lineTo(x, point.y);
          }
          context.lineWidth = lineWidth;
          context.strokeStyle = gradientFor(spec.tint);
          context.globalAlpha = alpha;
          context.stroke();
        };

        const alpha = Math.min(1, spec.alpha * boost);
        trace(spec.width * 16, alpha * 0.022);
        trace(spec.width * 8, alpha * 0.05);
        trace(spec.width * 3.4, alpha * 0.16);
        if (!compact) {
          context.shadowColor = `rgba(${spec.tint}, ${alpha * 0.85})`;
          context.shadowBlur = 9;
        }
        trace(spec.width, alpha);
        context.shadowBlur = 0;
        context.globalAlpha = 1;
      });

      // telemetry nodes + their faint leaders up/down to the wave
      const nodes = compact ? WAVE_NODES.filter((node) => node.x >= 0.55).slice(0, 2) : WAVE_NODES;
      const captionSize = compact ? 8.5 : 9.5;
      const fade = 1 - warp;

      nodes.forEach((node, index) => {
        const spec = WAVES[node.wave % WAVES.length];
        const nx = width * node.x;
        const ny = cy + node.y * height + Math.sin(t * 0.4 + index * 1.4) * 5;

        // nearest crest (above) or trough (below) within +/- 70px of the node
        let tx = nx;
        let ty = yAt(spec, nx, flatten).y;
        for (let probe = -70; probe <= 70; probe += 7) {
          const px = nx + probe;
          if (px < 0 || px > width) continue;
          const { y } = yAt(spec, px, flatten);
          if (node.y < 0 ? y < ty : y > ty) {
            tx = px;
            ty = y;
          }
        }

        context.strokeStyle = `rgba(230, 174, 131, ${0.11 * fade})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(nx, ny);
        context.lineTo(tx, ty);
        context.stroke();

        const pulse = 0.72 + 0.28 * Math.sin(t * 1.7 + index);
        const halo = context.createRadialGradient(nx, ny, 0, nx, ny, 11);
        halo.addColorStop(0, `rgba(255, 205, 168, ${0.26 * pulse * fade})`);
        halo.addColorStop(1, "rgba(255, 170, 110, 0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(nx, ny, 11, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = `rgba(230, 174, 131, ${0.22 * pulse * fade})`;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(nx, ny, 4, 0, Math.PI * 2);
        context.stroke();

        context.fillStyle = `rgba(250, 219, 194, ${0.85 * fade})`;
        context.beginPath();
        context.arc(nx, ny, 1.6, 0, Math.PI * 2);
        context.fill();

        context.font = `500 ${captionSize}px ${MONO_STACK}`;
        context.textBaseline = "middle";
        // keep captions inside the frame: long labels always sit left of the dot
        const flip = compact ? nx > width * 0.42 : node.flip;
        context.textAlign = flip ? "right" : "left";
        context.fillStyle = `rgba(230, 174, 131, ${0.44 * fade})`;
        const letterSpacing = (context as CanvasRenderingContext2D & { letterSpacing?: string })
          .letterSpacing;
        if (letterSpacing !== undefined) {
          (context as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
            "1.15px";
        }
        context.fillText(node.label, nx + (flip ? -11 : 11), ny);
        if (letterSpacing !== undefined) {
          (context as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
            letterSpacing;
        }
      });

      if (warp > 0) {
        // the light rises out of the waves themselves: one smooth elliptical
        // glow — stretched edge to edge along the carrier — hugs the whole
        // waveform, so the beam reads as coming from all the waves, not one
        // central lamp. No circular core: the DOM sheet finishes the cover.
        const peak = 0.72 + 0.28 * Math.sin(warp * Math.PI * 3);
        const band = context.createRadialGradient(0, 0, 0, 0, 0, 1);
        const bandA = (0.34 + 0.4 * warpRaw) * peak;
        band.addColorStop(0, `rgba(255, 214, 168, ${bandA})`);
        band.addColorStop(0.5, `rgba(255, 204, 152, ${bandA * 0.78})`);
        band.addColorStop(0.72, `rgba(255, 190, 134, ${bandA * 0.34})`);
        // die out just before the corners so the beam fades where the
        // waves themselves taper to nothing
        band.addColorStop(0.9, "rgba(255, 178, 116, 0)");
        band.addColorStop(1, "rgba(255, 178, 116, 0)");
        context.save();
        context.translate(width * 0.5, cy);
        context.scale(width * 0.62, height * (0.12 + 0.11 * warp));
        context.fillStyle = band;
        context.fillRect(-1, -1, 2, 2);
        context.restore();
      }

      context.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      if (visible) paint(now);
      frame = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };

    let resizeFrame = 0;
    const onResize = () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        resize();
        if (reducedMotion) paint(start + 6400);
      });
    };

    resize();
    if (reducedMotion) {
      paint(start + 6400);
    } else {
      frame = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="landing-wave" aria-hidden="true" />;
}

/* ------------------------------------------------------------------- dust */

type Mote = {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
  driftX: number;
  driftY: number;
  offX: number;
  offY: number;
};

const DUST_COOL = "255, 238, 226";
const DUST_WARM = "255, 178, 120";

function dustSprite(rgb: string) {
  const size = 32;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, `rgba(${rgb}, 0.95)`);
    gradient.addColorStop(0.3, `rgba(${rgb}, 0.5)`);
    gradient.addColorStop(0.65, `rgba(${rgb}, 0.12)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return sprite;
}

type DustFieldProps = {
  glowRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  paused: boolean;
};

function DustField({ glowRef, reducedMotion, paused }: DustFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cool = dustSprite(DUST_COOL);
    const warm = dustSprite(DUST_WARM);
    const motes: Mote[] = [];
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0, seen: false };

    let width = 1;
    let height = 1;
    let frame = 0;
    let lastFrame = 0;
    let resizeFrame = 0;
    let spawned = false;

    const spawn = (count: number) => {
      motes.length = 0;
      for (let index = 0; index < count; index += 1) {
        const depth = 0.3 + Math.random() * 0.7;
        motes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: (0.5 + Math.random() * 1.5) * (0.62 + depth * 0.72),
          base: 0.2 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.9,
          driftX: (Math.random() - 0.5) * 0.14,
          driftY: -0.02 - Math.random() * 0.1,
          offX: 0,
          offY: 0,
        });
      }
    };

    const resize = () => {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 760 ? 120 : 190;
      if (!spawned) {
        spawn(count);
        spawned = true;
      }
    };

    const draw = (time: number) => {
      const pausedNow = pausedRef.current;
      if (pausedNow) {
        lastFrame = 0;
        return;
      }

      const interval = reducedMotion ? 1000 / 24 : 1000 / 58;
      if (time - lastFrame < interval) return;
      const delta = Math.min(2.4, (time - lastFrame) / 16.667) || 1;
      lastFrame = time;

      if (pointer.seen && !reducedMotion) {
        const previousX = pointer.x;
        const previousY = pointer.y;
        pointer.x += (pointer.targetX - pointer.x) * 0.14;
        pointer.y += (pointer.targetY - pointer.y) * 0.14;
        pointer.vx = pointer.vx * 0.82 + (pointer.x - previousX) * 0.9;
        pointer.vy = pointer.vy * 0.82 + (pointer.y - previousY) * 0.9;
      }

      const glow = glowRef.current;
      if (glow && pointer.seen && !reducedMotion) {
        glow.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      }

      ctx.clearRect(0, 0, width, height);

      const radius = 240;
      const radiusSq = radius * radius;

      for (const mote of motes) {
        if (!reducedMotion) {
          mote.x += mote.driftX * delta;
          mote.y += mote.driftY * delta;
          if (mote.x < -14) mote.x = width + 14;
          else if (mote.x > width + 14) mote.x = -14;
          if (mote.y < -14) mote.y = height + 14;
          else if (mote.y > height + 14) mote.y = -14;
        }

        let light = 0;
        if (pointer.seen) {
          const dx = mote.x + mote.offX - pointer.x;
          const dy = mote.y + mote.offY - pointer.y;
          const distance = dx * dx + dy * dy;
          if (distance < radiusSq) light = 1 - distance / radiusSq;
          light *= light;
        }

        if (!reducedMotion && pointer.seen && light > 0.02) {
          mote.offX += (pointer.vx * 0.7 * light - mote.offX) * 0.09;
          mote.offY += (pointer.vy * 0.7 * light - mote.offY) * 0.09;
        } else {
          mote.offX *= 0.94;
          mote.offY *= 0.94;
        }

        const twinkle = reducedMotion
          ? 1
          : 0.72 + 0.28 * Math.sin(time * 0.001 * mote.speed + mote.phase);
        const alpha = Math.min(0.95, mote.base * twinkle * (1 + light * 3.6));
        const size = mote.r * (3 + light * 2.6);
        if (size <= 0.2 || alpha <= 0.01) continue;

        ctx.globalAlpha = alpha;
        const sprite = light > 0.06 ? warm : cool;
        ctx.drawImage(
          sprite,
          mote.x + mote.offX - size / 2,
          mote.y + mote.offY - size / 2,
          size,
          size,
        );
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      draw(time);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      if (!pointer.seen) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
        pointer.seen = true;
        const glow = glowRef.current;
        if (glow) {
          glow.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
          glow.style.opacity = reducedMotion ? "0" : "1";
        }
      }
    };

    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(resize);
    };

    const onVisibility = () => {
      lastFrame = 0;
    };

    resize();
    frame = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [glowRef, reducedMotion]);

  return <canvas ref={canvasRef} className="landing-dust" aria-hidden="true" />;
}

export default function LandingIntro({
  onEnter,
  enterHref = `${import.meta.env.BASE_URL}app`,
  className,
}: LandingIntroProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [warping, setWarping] = useState(false);
  const startedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const flashTimerRef = useRef<number | undefined>(undefined);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    },
    [],
  );

  const finish = useCallback(() => {
    if (onEnter) onEnter();
    else window.location.assign(enterHref);
  }, [enterHref, onEnter]);

  const startWarp = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Reduced motion: no cinematic zoom, just go straight to the atlas
    // (no overlay phase is started, so nothing can strand mid-flash).
    if (reducedMotion) {
      finish();
      return;
    }

    setWarping(true);
    // Stage 1 — the persisted overlay blooms out of the sun point.
    flashTimerRef.current = window.setTimeout(
      () => flashBus.begin(forecastSunPoint()),
      FLASH_TIMING.beginDelayMs,
    );
    // Stage 3 — navigate at the exact moment of full cover.
    timerRef.current = window.setTimeout(finish, WARP_DURATION_MS);
  }, [finish, reducedMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <div className={className ? `landing-root ${className}` : "landing-root"}>
        <style>{CSS_SCENE + CSS_WAVE + CSS_TEXT}</style>

        <motion.div
          className={warping ? "landing-stage is-warping" : "landing-stage"}
          animate={{ scale: warping ? 1.06 : 1 }}
          transition={{ duration: WARP_DURATION_MS / 1000, ease: WARP_EASE }}
          style={{ transformOrigin: "50% 50%" }}
        >
          <div className="landing-sky" />
          <div ref={glowRef} className="landing-cursor-glow" aria-hidden="true" />
          <WaveField warping={warping} reducedMotion={reducedMotion} />
          <div className="landing-scrim" aria-hidden="true" />

          <svg className="landing-sparkle landing-sparkle-b" viewBox="0 0 40 40" aria-hidden="true">
            <path
              d="M20 0 L23.2 16.8 L40 20 L23.2 23.2 L20 40 L16.8 23.2 L0 20 L16.8 16.8 Z"
              fill="rgba(246, 208, 180, 0.6)"
            />
          </svg>

          <DustField glowRef={glowRef} reducedMotion={reducedMotion} paused={warping} />
        </motion.div>

        <div className="landing-vignette" aria-hidden="true" />
        <div className="landing-grain" aria-hidden="true" />

        <motion.div
          className="landing-shell"
          initial="hidden"
          animate={warping ? "warp" : "visible"}
          variants={shellVariants}
        >
          <motion.p className="landing-meta" variants={fadeUp}>
            <span>NASA Space Apps Challenge 2026 //</span>
            <span>A Digital Space Jukebox</span>
          </motion.p>

          <main className="landing-main">
            <motion.h1 className="landing-title" variants={titleVariants}>
              Solaris
            </motion.h1>
            <motion.p className="landing-subtitle" variants={fadeUp}>
              Abandoned but not forgotten.
            </motion.p>
            <motion.button
              type="button"
              className="landing-cta"
              variants={fadeUp}
              onClick={startWarp}
              disabled={warping}
              aria-label="Explore the void — enter the mission atlas"
            >
              <span>Explore the void</span>
              <span className="landing-cta-arrow" aria-hidden="true">
                ➔
              </span>
              <span className="landing-cta-rule" aria-hidden="true" />
            </motion.button>
          </main>

          <motion.footer className="landing-footer" variants={fadeUp}>
            <p className="landing-team">Team Asynchronous</p>
            <p className="landing-status">[ System v1.02 // Sensor: Active ]</p>
          </motion.footer>
        </motion.div>

        <p className="landing-sr" aria-live="polite">
          {warping ? "Entering the mission atlas." : ""}
        </p>
      </div>
    </MotionConfig>
  );
}

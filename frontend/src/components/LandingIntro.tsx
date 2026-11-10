import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MotionConfig, motion, useReducedMotion, type Variants } from "framer-motion";
import { flashBus, forecastSunPoint } from "../lib/flashBus";

/**
 * Solaris — splash landing page.
 *
 * Simplified version: only a centered Sun graphic, a CTA, and a soft background.
 * When the CTA is clicked, the UI fades and the persisted flash overlay begins.
 */

const WARP_DURATION_MS = 600;
const FLASH_BEGIN_MS = 200;
const FLASH_EXPAND_MS = 400;
const EASE_OUT: [number, number, number, number] = [0.22, 0.9, 0.3, 1];

export type LandingIntroProps = {
  onEnter?: () => void;
  enterHref?: string;
  className?: string;
};

/* ------------------------------------------------------------------ motion */

const shellVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  warp: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

const fadeOut = {
  opacity: 0,
  y: -20,
  transition: { duration: 0.5, ease: "easeIn" },
};

export default function LandingIntroSimplified({
  onEnter,
  enterHref,
  className,
}: LandingIntroProps) {
  const [warping, setWarping] = useState(false);
  const startedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const flashTimerRef = useRef<number | undefined>(undefined);

  const reducedMotion = useReducedMotion();

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
  }, []);

  const finish = useCallback(() => {
    if (onEnter) onEnter();
    else if (enterHref) window.location.assign(enterHref);
  }, [enterHref, onEnter]);

  const startWarp = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (reducedMotion) {
      finish();
      return;
    }

    setWarping(true);
    flashTimerRef.current = window.setTimeout(
      () => flashBus.begin(forecastSunPoint()),
      FLASH_BEGIN_MS,
    );
    timerRef.current = window.setTimeout(finish, WARP_DURATION_MS);
  }, [finish, reducedMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.main
        className="landing-container"
        variants={shellVariants}
        initial="hidden"
        animate={warping ? "warp" : "visible"}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 240, 210, 0.9), rgba(255, 200, 150, 0.7), rgba(240, 150, 100, 0.5), #fefae0)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <motion.h1
          className="landing-title"
          variants={fadeUp}
          style={{
            fontSize: "clamp(2rem, 8vw, 5rem)",
            fontWeight: 700,
            color: "#4a3f35",
            marginBottom: "0.5rem",
          }}
        >
          Solaris
        </motion.h1>

        <motion.p
          className="landing-subtitle"
          variants={fadeUp}
          style={{
            fontSize: "1.2rem",
            color: "#7a6f62",
            marginBottom: "2rem",
          }}
        >
          ABANDONED BUT NOT FORGOTTEN.
        </motion.p>

        <motion.button
          className="landing-cta"
          variants={fadeUp}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startWarp}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            background:
              "linear-gradient(135deg, rgba(255, 180, 80, 0.9), rgba(240, 120, 40, 0.9))",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          EXPLORE THE VOID ➔
        </motion.button>

        <motion.footer
          className="landing-footer"
          variants={fadeUp}
          style={{
            marginTop: "3rem",
            fontSize: "0.9rem",
            color: "#8a7c6e",
          }}
        >
          <p className="landing-team">TEAM ASYNCHRONOUS</p>
          <p className="landing-status">
            [ System v1.02 // Sensor: Active ]
          </p>
        </motion.footer>

        {/* Optional Sun graphic placeholder */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "120px",
            height: "120px",
            background:
              "radial-gradient(circle, rgba(255, 200, 80, 0.6), rgba(255, 150, 40, 0), transparent)",
            borderRadius: "50%",
            pointerEvents: "none",
            animation: warping ? "sunPulse 1.5s ease-out infinite" : "none",
          }}
        />

        <style>
          {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 0.95; }
          }
          @keyframes sunPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
          }
          .landing-container.warp > .landing-title,
          .landing-container.warp > .landing-subtitle,
          .landing-container.warp > .landing-cta,
          .landing-container.warp > .landing-footer {
            animation: fadeOut 0.5s ease-in forwards;
          }
          @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-10px); }
          }
          `}
        </style>
      </motion.main>
    </MotionConfig>
  );
}
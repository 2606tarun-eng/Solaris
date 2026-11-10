/**
 * Cross-route flash transition bus.
 *
 * The splash landing and the atlas never render at the same time, but the
 * flash overlay has to persist across the route change. This module keeps the
 * shared "flash intent" outside React:
 *
 *   landing  -> flashBus.begin(point)     Stage 1: bloom from the sun point
 *   atlas    -> flashBus.deliver(point)   Stage 3: breathe out into the sun
 *
 * The atlas always reports the *measured* sun screen point, so the reveal is
 * locked to the sun element by construction. The landing can only forecast
 * it (nav 68px + status 44px + a content-sized timeline below the map), so
 * `forecastSunPoint` reuses the point cached by the last visit when the
 * viewport matches, and falls back to a geometry estimate for first visits.
 */

export type FlashPoint = { x: number; y: number };

export type FlashPhase = "idle" | "expand" | "breathe";

export type FlashState = {
  phase: FlashPhase;
  point: FlashPoint;
};

/* Atlas chrome in px: .nav-bar height + .status-bar height + timeline block
 * (panel 119px + bottom margin 8px, measured at 1512x900). The estimate only
 * needs to be close — the atlas re-locks the point the moment it mounts. */
const NAV_HEIGHT = 68;
const BOTTOM_BLOCK = 171;

const SUN_CACHE_KEY = "solaris-sun-point";

let state: FlashState = { phase: "idle", point: { x: 0, y: 0 } };
const listeners = new Set<(state: FlashState) => void>();

function emit() {
  listeners.forEach((listener) => listener(state));
}

export const flashBus = {
  get: () => state,

  subscribe(listener: (state: FlashState) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** Stage 1 — splash asks the overlay to bloom out of the sun point. */
  begin(point: FlashPoint) {
    if (state.phase !== "idle") return;
    state = { phase: "expand", point };
    emit();
  },

  /**
   * Stage 3 — atlas reports the live sun screen point and the overlay
   * breathes out into it. Ignored unless a flash is mid-flight, so simply
   * visiting "/app" never flashes.
   */
  deliver(point: FlashPoint) {
    cacheSunPoint(point);
    if (state.phase !== "expand") return;
    state = { phase: "breathe", point };
    emit();
  },

  /** Drop the overlay once the breathe-out has fully cleared. */
  reset() {
    if (state.phase === "idle") return;
    state = { phase: "idle", point: { x: 0, y: 0 } };
    emit();
  },
};

function cacheSunPoint(point: FlashPoint) {
  try {
    window.sessionStorage.setItem(
      SUN_CACHE_KEY,
      JSON.stringify({ x: point.x, y: point.y, w: window.innerWidth, h: window.innerHeight }),
    );
  } catch {
    /* storage disabled — the estimate still works */
  }
}

/** Where the atlas sun will land on screen for the current viewport. */
export function forecastSunPoint(width = window.innerWidth, height = window.innerHeight): FlashPoint {
  try {
    const cached = JSON.parse(window.sessionStorage.getItem(SUN_CACHE_KEY) ?? "null") as
      | (FlashPoint & { w: number; h: number })
      | null;
    if (cached && cached.w === width && cached.h === height) {
      return { x: cached.x, y: cached.y };
    }
  } catch {
    /* fall through to the estimate */
  }
  return {
    x: width / 2,
    y: NAV_HEIGHT + Math.max(120, (height - NAV_HEIGHT - BOTTOM_BLOCK) / 2),
  };
}

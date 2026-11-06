import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { planetById } from "../data/planets";

export type PlanetPosition = {
  x: number;
  y: number;
  size: number;
};

type CameraOptions = {
  viewportRef: RefObject<HTMLDivElement | null>;
  cameraRef: RefObject<HTMLDivElement | null>;
  positionsRef: RefObject<Record<string, PlanetPosition>>;
  drawerOpen: boolean;
  tourActive: boolean;
  reducedMotion: boolean;
  onExitFocus: () => void;
};

const MIN_ZOOM = 0.72;
const MAX_ZOOM = 4.4;
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const SUN_SIZE = 150;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function baseScaleFor(width: number, height: number) {
  return clamp(Math.min(width / BASE_WIDTH, height / BASE_HEIGHT), 0.42, 1.12);
}

export type CameraApi = {
  focusedId: string | null;
  viewportRef: RefObject<HTMLDivElement | null>;
  focusPlanet: (id: string | null) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  consumeClickBlock: () => boolean;
  frame: (delta: number) => void;
  viewportProps: {
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onDoubleClick: () => void;
  };
};

export default function useCamera({
  viewportRef,
  cameraRef,
  positionsRef,
  drawerOpen,
  tourActive,
  reducedMotion,
  onExitFocus,
}: CameraOptions): CameraApi {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const camRef = useRef({ x: 0, y: 0, zoom: 1 });
  const panRef = useRef({ x: 0, y: 0 });
  const userZoomRef = useRef(1);
  const focusRef = useRef<string | null>(null);
  const focusZoomRef = useRef(1);
  const baseScaleRef = useRef(1);
  const viewportSizeRef = useRef({ width: 1280, height: 720 });
  const drawerOpenRef = useRef(drawerOpen);
  const tourActiveRef = useRef(tourActive);
  const onExitFocusRef = useRef(onExitFocus);
  const reducedMotionRef = useRef(reducedMotion);
  const draggingRef = useRef(false);
  const clickBlockRef = useRef(false);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{ x: number; y: number; camX: number; camY: number } | null>(null);
  const pinchRef = useRef<number | null>(null);
  const lastScaleRef = useRef(0);

  useEffect(() => {
    drawerOpenRef.current = drawerOpen;
  }, [drawerOpen]);

  useEffect(() => {
    tourActiveRef.current = tourActive;
  }, [tourActive]);

  useEffect(() => {
    onExitFocusRef.current = onExitFocus;
  }, [onExitFocus]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  const applyTransform = useCallback(() => {
    const element = cameraRef.current;
    if (!element) return;
    const { width, height } = viewportSizeRef.current;
    const { x, y, zoom } = camRef.current;
    const scale = baseScaleRef.current * zoom;
    element.style.transform = `translate3d(${width / 2}px, ${height / 2}px, 0) scale(${scale}) translate3d(${-x}px, ${-y}px, 0)`;
    // Keep map labels, dots and tap targets at a readable screen size.
    if (Math.abs(lastScaleRef.current - scale) > 0.0005) {
      lastScaleRef.current = scale;
      const inverse = 1 / scale;
      element.style.setProperty("--ui-scale", String(inverse));
      element.style.setProperty("--ui-gap", `${12 * inverse}px`);
      element.style.setProperty("--ui-gap-lg", `${37 * inverse}px`);
      element.style.setProperty("--ui-tap", `${44 * inverse}px`);
    }
  }, [cameraRef]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const width = viewport.clientWidth || 1280;
      const height = viewport.clientHeight || 720;
      viewportSizeRef.current = { width, height };
      baseScaleRef.current = baseScaleFor(width, height);
      applyTransform();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [applyTransform, viewportRef]);

  const focusZoomFor = useCallback((id: string) => {
    const base = baseScaleRef.current;
    if (id === "sun") return clamp(240 / (SUN_SIZE * base), 1.1, 2);
    const planet = planetById[id];
    const size = planet?.size ?? 40;
    return clamp(170 / (size * base), 1.6, MAX_ZOOM);
  }, []);

  const focusPlanet = useCallback(
    (id: string | null) => {
      focusRef.current = id;
      setFocusedId(id);
      if (id) {
        focusZoomRef.current = focusZoomFor(id);
      } else {
        panRef.current = { x: 0, y: 0 };
        userZoomRef.current = 1;
        focusZoomRef.current = 1;
        onExitFocusRef.current();
      }
    },
    [focusZoomFor],
  );

  const zoomByFactor = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const viewport = viewportRef.current;
      const base = baseScaleRef.current;
      const { width, height } = viewportSizeRef.current;

      if (focusRef.current) {
        focusZoomRef.current = clamp(focusZoomRef.current * factor, 1.1, MAX_ZOOM);
        return;
      }

      const currentZoom = userZoomRef.current;
      const nextZoom = clamp(currentZoom * factor, MIN_ZOOM, MAX_ZOOM);
      if (nextZoom === currentZoom) return;

      const anchorX = viewport && clientX !== undefined ? clientX - viewport.getBoundingClientRect().left : width / 2;
      const anchorY = viewport && clientY !== undefined ? clientY - viewport.getBoundingClientRect().top : height / 2;
      const screenX = anchorX - width / 2;
      const screenY = anchorY - height / 2;

      const worldX = panRef.current.x + screenX / (base * currentZoom);
      const worldY = panRef.current.y + screenY / (base * currentZoom);
      panRef.current = {
        x: worldX - screenX / (base * nextZoom),
        y: worldY - screenY / (base * nextZoom),
      };
      userZoomRef.current = nextZoom;
    },
    [viewportRef],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomByFactor(Math.exp(-event.deltaY * 0.0014), event.clientX, event.clientY);
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [viewportRef, zoomByFactor]);

  const zoomIn = useCallback(() => zoomByFactor(1.28), [zoomByFactor]);
  const zoomOut = useCallback(() => zoomByFactor(1 / 1.28), [zoomByFactor]);
  const resetView = useCallback(() => focusPlanet(null), [focusPlanet]);
  const consumeClickBlock = useCallback(() => {
    const blocked = clickBlockRef.current;
    clickBlockRef.current = false;
    return blocked;
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Do not capture yet: pointer capture retargets the follow-up click event to
    // the viewport, which would swallow taps on planets. Capture on first move.
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    clickBlockRef.current = false;

    if (pointersRef.current.size === 1) {
      draggingRef.current = true;
      const cam = camRef.current;
      dragRef.current = { x: event.clientX, y: event.clientY, camX: cam.x, camY: cam.y };
      pinchRef.current = null;
    } else if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      pinchRef.current = Math.hypot(first.x - second.x, first.y - second.y);
      dragRef.current = null;
      clickBlockRef.current = true;
    }
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.has(event.pointerId)) return;
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      const element = event.currentTarget;
      if (!element.hasPointerCapture?.(event.pointerId)) {
        const drag = dragRef.current;
        const moved = drag
          ? Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y) > 4
          : pointersRef.current.size >= 2;
        if (moved) element.setPointerCapture?.(event.pointerId);
      }

      if (pointersRef.current.size >= 2) {
        const [first, second] = [...pointersRef.current.values()];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        const previous = pinchRef.current;
        pinchRef.current = distance;
        if (previous && previous > 0) {
          zoomByFactor(
            distance / previous,
            (first.x + second.x) / 2,
            (first.y + second.y) / 2,
          );
        }
        return;
      }

      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;

      if (Math.abs(dx) + Math.abs(dy) > 5) {
        if (!clickBlockRef.current) {
          clickBlockRef.current = true;
          if (focusRef.current) {
            focusRef.current = null;
            setFocusedId(null);
            userZoomRef.current = camRef.current.zoom;
            onExitFocusRef.current();
            dragRef.current = {
              x: event.clientX,
              y: event.clientY,
              camX: camRef.current.x,
              camY: camRef.current.y,
            };
            return;
          }
        }
      }

      const base = baseScaleRef.current * userZoomRef.current;
      panRef.current = {
        x: drag.camX - dx / base,
        y: drag.camY - dy / base,
      };
    },
    [zoomByFactor],
  );

  const finishPointer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size === 0) {
      draggingRef.current = false;
      dragRef.current = null;
      pinchRef.current = null;
    } else if (pointersRef.current.size === 1) {
      const [remaining] = [...pointersRef.current.values()];
      const cam = camRef.current;
      dragRef.current = { x: remaining.x, y: remaining.y, camX: cam.x, camY: cam.y };
      pinchRef.current = null;
    }
  }, []);

  const frame = useCallback(
    (delta: number) => {
      const { width, height } = viewportSizeRef.current;
      const base = baseScaleRef.current;
      const cam = camRef.current;
      const focus = focusRef.current;

      let targetX = panRef.current.x;
      let targetY = panRef.current.y;
      let targetZoom = userZoomRef.current;

      if (focus) {
        const position =
          focus === "sun"
            ? { x: 0, y: 0, size: SUN_SIZE }
            : positionsRef.current[focus] ?? null;

        if (position) {
          targetZoom = focusZoomRef.current;
          const scale = base * targetZoom;
          const wide = width > 900;
          const drawer = drawerOpenRef.current;
          const tour = tourActiveRef.current;
          let biasX = 0;
          let biasY = 0;
          if (drawer && wide) biasX = 210 / scale;
          if (drawer && !wide) biasY = (height * 0.3) / scale;
          if (!drawer && tour) biasY = (wide ? height * 0.08 : height * 0.3) / scale;
          targetX = position.x + biasX;
          targetY = position.y + biasY;
        }
      }

      const smoothing =
        draggingRef.current || reducedMotionRef.current
          ? 1
          : 1 - Math.pow(0.0016, Math.min(delta, 0.1));
      cam.x += (targetX - cam.x) * smoothing;
      cam.y += (targetY - cam.y) * smoothing;
      cam.zoom += (targetZoom - cam.zoom) * smoothing;

      if (Math.abs(targetX - cam.x) < 0.05) cam.x = targetX;
      if (Math.abs(targetY - cam.y) < 0.05) cam.y = targetY;
      if (Math.abs(targetZoom - cam.zoom) < 0.0004) cam.zoom = targetZoom;

      applyTransform();
    },
    [applyTransform, positionsRef],
  );

  return {
    focusedId,
    viewportRef,
    focusPlanet,
    zoomIn,
    zoomOut,
    resetView,
    consumeClickBlock,
    frame,
    viewportProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishPointer,
      onPointerCancel: finishPointer,
      onDoubleClick: zoomIn,
    },
  };
}

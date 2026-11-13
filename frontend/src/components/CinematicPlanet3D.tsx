import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  FrontSide,
  SRGBColorSpace,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  type Group,
  type Mesh,
  type PerspectiveCamera,
  type Texture,
} from "three";
import { glowSurface, moonSurface, planetSurface, ringSurface } from "../lib/planetTexture";

/**
 * CinematicPlanet3D — the live micro view.
 *
 * A real WebGL globe with the mission hardware revolving around it. Kept
 * deliberately small and modular so the drawer stays the only thing that owns
 * mission copy: this component only knows how to draw a planet, a set of
 * orbit rings, and one glowing node per mission.
 *
 * Scale is fixed in world units (planet radius 1.45) and the camera sits far
 * enough back that everything from the globe to the outermost orbit fits the
 * canvas at every breakpoint.
 */

export type OrbitingMission = {
  id: string;
  name: string;
  /** Distance from the planet centre, in world units. */
  orbitRadius: number;
  /** Radians per second. */
  speed: number;
  color: string;
  status?: "active" | "retired";
};

export type PlanetRings = {
  band: string;
  soft: string;
  gap: string;
  tilt: number;
};

type CinematicPlanet3DProps = {
  planetId: string;
  missions: OrbitingMission[];
  palette: { bands: string[]; highlight: string; shadow: string };
  /** Optional real equirectangular map; falls back to a generated surface. */
  textureUrl?: string;
  rings?: PlanetRings | null;
  reducedMotion?: boolean;
  /** Flips true once the stage entrance has finished. */
  settled?: boolean;
  /** Toggles when the planet is minimized/maximized. */
  minimized?: boolean;
  /** Earth only: draw its Moon on a slow, clickable orbit. */
  showMoon?: boolean;
  /** True while the Moon's Mission Control panel is open. */
  moonSelected?: boolean;
  /** Opens Mission Control for the Moon. */
  onSelectMoon?: () => void;
  className?: string;
};

const PLANET_RADIUS = 0.4; // Reduced further for even more compact view // Reduced from 0.8 to make the planet more compact
/** The rings hug the planet at this proportion (inner edge). */
const RING_INNER_RATIO = 0.671;
/** Rings stop just short of the innermost mission orbit. */
const RING_OUTER_RATIO = 0.9;

/** How far apart neighbouring orbit planes are tilted, in radians. */
const INCLINATION_STEP = 0.14;

/**
 * How far the viewer may tilt the camera. The framing below is computed for
 * the whole range, so the system never leaves the screen while you drag.
 */
const ELEVATION_MIN = 0.105;
const ELEVATION_MAX = 0.35;

const scratch = new Vector3();
const projected = new Vector3();

function hashId(text: string) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Swaps in a real map once it has decoded, so the globe is never empty. */
function useRemoteMap(url?: string): Texture | null {
  const [map, setMap] = useState<Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setMap(null);
      return;
    }
    let alive = true;
    const loader = new TextureLoader();
    loader.load(url, (texture) => {
      if (!alive) {
        texture.dispose();
        return;
      }
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 8;
      setMap((previous) => {
        previous?.dispose();
        return texture;
      });
    });
    return () => {
      alive = false;
    };
  }, [url]);

  return map;
}

function Globe({
  map,
  segments,
  reducedMotion,
  scale,
}: {
  map: Texture;
  segments: number;
  reducedMotion: boolean;
  scale: number;
}) {
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !mesh.current) return;
    // One slow turn every ~2 minutes: motion you notice, never motion you watch.
    mesh.current.rotation.y += delta * 0.052;
  });

  return (
    <mesh ref={mesh} scale={scale}>
      <sphereGeometry args={[PLANET_RADIUS, segments, Math.max(16, segments / 2)]} />
      <meshStandardMaterial map={map} roughness={0.94} metalness={0.02} />
    </mesh>
  );
}

/**
 * Strips alpha out of a CSS colour. `new Color("rgba(…, 0.5)")` throws the
 * alpha away with a console warning, and the rim owns its own opacity anyway.
 */
function solidColor(color: string) {
  const match = color.match(/^rgba?\(([^)]+)\)$/i);
  if (!match) return color;
  const [r, g, b] = match[1].split(",").map((part) => part.trim());
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Limb glow, via Fresnel: the shell is brightest exactly where the surface
 * turns away from the camera, so the glow hugs the silhouette instead of
 * fogging the whole disc the way a plain additive sphere does.
 */
function Atmosphere({ color, scale = 1 }: { color: string; scale?: number }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(solidColor(color)) },
          uStrength: { value: 0.95 },
          uPower: { value: 3.4 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-viewPosition.xyz);
            gl_Position = projectionMatrix * viewPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uStrength;
          uniform float uPower;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = pow(1.0 - clamp(dot(normalize(vNormal), vView), 0.0, 1.0), uPower);
            gl_FragColor = vec4(uColor, rim * uStrength);
          }
        `,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        side: FrontSide,
      }),
    [color],
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh scale={1.045 * scale}>
      <sphereGeometry args={[PLANET_RADIUS, 48, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function PlanetRings({
  map,
  tilt,
  inner,
  outer,
}: {
  map: Texture;
  tilt: number;
  inner: number;
  outer: number;
}) {
  return (
    <mesh rotation={[Math.PI / 2 - tilt, 0, 0.16]} renderOrder={2}>
      <ringGeometry args={[inner, outer, 168, 4]} />
      <meshBasicMaterial
        map={map}
        transparent
        opacity={0.86}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Keeps the whole system (planet, rings, outermost orbit) inside the canvas at
 * any aspect ratio.
 *
 * The orbits are shallow ellipses, so only a fraction of a sphere's vertical
 * extent is ever used — fitting a full sphere would shrink the planet for no
 * reason. The vertical figure is worked out for the *steepest* camera angle
 * the viewer can drag to, so nothing is ever clipped mid-drag.
 *
 * The camera distance is only re-derived when the layout actually changes
 * (resize, missions/rings change). OrbitControls owns the camera afterwards,
 * so a user zoom is never overwritten.
 */
function FrameSystem({ horizontal, vertical }: { horizontal: number; vertical: number }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const appliedRef = useRef<{
    horizontal: number;
    vertical: number;
    width: number;
    height: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!width || !height) return;
    // Skip unless the layout actually changed — never fight OrbitControls.
    const prev = appliedRef.current;
    if (
      prev &&
      prev.horizontal === horizontal &&
      prev.vertical === vertical &&
      prev.width === width &&
      prev.height === height
    ) {
      return;
    }
    appliedRef.current = { horizontal, vertical, width, height };

    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (width / height));
    const distance = Math.max(
      (horizontal * 1.12) / Math.tan(hFov / 2),
      (vertical * 1.06) / Math.tan(vFov / 2),
    );
    // Clamp to the OrbitControls zoom range so the two never disagree.
    camera.position.setLength(Math.min(Math.max(distance, 3), 20));
    camera.updateProjectionMatrix();
  }, [camera, width, height, horizontal, vertical]);

  return null;
}

/** One mission: its orbit path, its node, and its tracking label. */
function MissionOrbit({
  mission,
  index,
  total,
  reducedMotion,
}: {
  mission: OrbitingMission;
  index: number;
  total: number;
  reducedMotion: boolean;
}) {
  const node = useRef<Group>(null);
  const label = useRef<HTMLDivElement>(null);
  const halo = useMemo(() => glowSurface(), []);
  const canvasSize = useThree((state) => state.size);
  const labelWidth = useRef(0);

  // The label is a fixed run of text, so one measurement is enough; it is
  // re-taken after the webfont swaps in and on resize.
  useEffect(() => {
    const measure = () => {
      if (label.current) labelWidth.current = label.current.offsetWidth;
    };
    measure();
    const timer = window.setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const phase = useMemo(() => ((hashId(mission.id) % 1000) / 1000) * Math.PI * 2, [mission.id]);
  // Fan the orbit planes apart a little so they read as separate shells.
  const inclination = useMemo(() => (index - (total - 1) / 2) * INCLINATION_STEP, [index, total]);
  const yaw = useMemo(() => ((hashId(mission.id) % 90) / 90) * Math.PI, [mission.id]);

  const points = useMemo(() => {
    const list: [number, number, number][] = [];
    const steps = 148;
    for (let i = 0; i <= steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2;
      list.push([Math.cos(angle) * mission.orbitRadius, 0, Math.sin(angle) * mission.orbitRadius]);
    }
    return list;
  }, [mission.orbitRadius]);

  useFrame((state) => {
    const group = node.current;
    if (!group) return;

    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;
    const angle = phase + elapsed * mission.speed;
    group.position.set(
      Math.cos(angle) * mission.orbitRadius,
      0,
      Math.sin(angle) * mission.orbitRadius,
    );

    if (!label.current) return;

    // Fade with distance from the camera, and dim sharply when the globe is
    // between the node and the viewer.
    group.getWorldPosition(scratch);
    const camera = state.camera as PerspectiveCamera;
    const toCamera = camera.position.distanceTo(scratch);
    const toCentre = camera.position.length();
    const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * toCamera;
    const globeNdc = PLANET_RADIUS / halfHeight;
    projected.copy(scratch).project(camera);
    const onDisc = Math.hypot(projected.x, projected.y) < globeNdc;
    const hidden = toCamera > toCentre && onDisc;

    const near = Math.min(1, Math.max(0, 0.5 - (toCamera - toCentre) / 6));
    label.current.style.opacity = hidden ? "0" : (0.5 + near * 0.5).toFixed(2);

    // Labels on the left half run leftwards, so they never sprawl across the
    // globe — and the callout is nudged back inside the canvas when the node
    // gets close to the edge.
    const side = projected.x < 0 ? "left" : "right";
    label.current.dataset.side = side;
    const screenX = (projected.x * 0.5 + 0.5) * canvasSize.width;
    const width = labelWidth.current;
    // Left labels may only be nudged right, right labels only left — each side
    // clamps against its own canvas edge.
    const shift =
      side === "left"
        ? Math.max(0, 6 - (screenX - 9 - width))
        : Math.min(0, canvasSize.width - 6 - (screenX + 9 + width));
    label.current.style.setProperty("--cp3d-shift", `${shift.toFixed(1)}px`);
  });

  return (
    <group rotation={[inclination, yaw, 0]}>
      <Line
        points={points}
        color={mission.color}
        lineWidth={1}
        transparent
        opacity={0.24}
        depthWrite={false}
      />

      <group ref={node}>
        <mesh>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshBasicMaterial color={mission.color} toneMapped={false} />
        </mesh>

        <sprite scale={[0.2, 0.2, 1]}>
          <spriteMaterial
            map={halo}
            color={mission.color}
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </sprite>

        <Html zIndexRange={[6, 0]} style={{ pointerEvents: "none" }}>
          <div className="cp3d-tag" ref={label} style={{ color: mission.color }}>
            <span className="cp3d-tag-line" />
            <span className="cp3d-tag-name">{mission.name}</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- Earth's Moon */

const MOON_RADIUS = 0.095;
/** Deliberately much slower than the Earth satellites (~0.32 rad/s). */
const MOON_SPEED = 0.035;
const MOON_TILT = 0.07;
const MOON_PHASE = 0.7;

/**
 * Earth's Moon: one slow, clickable sphere just outside the satellite shells.
 * Clicking it opens the Moon's Mission Control panel; the planet stays Earth.
 */
function MoonOrbit({
  radius,
  reducedMotion,
  selected,
  onSelect,
}: {
  radius: number;
  reducedMotion: boolean;
  selected: boolean;
  onSelect?: () => void;
}) {
  const node = useRef<Group>(null);
  const label = useRef<HTMLDivElement>(null);
  const map = useMemo(() => moonSurface(), []);
  const halo = useMemo(() => glowSurface(), []);

  const points = useMemo(() => {
    const list: [number, number, number][] = [];
    const steps = 148;
    for (let i = 0; i <= steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2;
      list.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return list;
  }, [radius]);

  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  useFrame((state) => {
    const group = node.current;
    if (!group) return;

    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;
    const angle = MOON_PHASE + elapsed * MOON_SPEED;
    group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    if (!label.current) return;
    group.getWorldPosition(scratch);
    projected.copy(scratch).project(state.camera);
    label.current.dataset.side = projected.x < 0 ? "left" : "right";
    label.current.style.opacity = selected ? "1" : "0.84";
  });

  const select = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect?.();
  };

  const hoverOn = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    document.body.style.cursor = "pointer";
  };

  const hoverOff = () => {
    document.body.style.cursor = "";
  };

  return (
    <group rotation={[MOON_TILT, 0.62, 0]}>
      <Line
        points={points}
        color="#d8d3c8"
        lineWidth={1}
        transparent
        opacity={0.2}
        depthWrite={false}
      />

      <group ref={node}>
        <mesh onClick={select} onPointerOver={hoverOn} onPointerOut={hoverOff}>
          <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
          <meshStandardMaterial map={map} roughness={1} metalness={0} />
        </mesh>

        {/* A larger invisible target makes the little Moon easy to tap. */}
        <mesh onClick={select} onPointerOver={hoverOn} onPointerOut={hoverOff}>
          <sphereGeometry args={[MOON_RADIUS * 2, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <sprite scale={[0.44, 0.44, 1]}>
          <spriteMaterial
            map={halo}
            color={selected ? "#fde68a" : "#cfd8e3"}
            transparent
            opacity={selected ? 0.72 : 0.35}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </sprite>

        <Html zIndexRange={[7, 0]} style={{ pointerEvents: "none" }}>
          <div className={`cp3d-tag is-moon${selected ? " is-selected" : ""}`} ref={label}>
            <span className="cp3d-tag-line" />
            <span className="cp3d-tag-name">Moon</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

/**
 * R3F sizes the canvas once, from the container's bounding box at mount time.
 * The stage grows in with a scale transform, so that first measurement can
 * land mid-animation and leave the canvas permanently undersized. Once the
 * entrance settles we re-measure against the real box and push it to R3F.
 */
function FitCanvas({ settled }: { settled: boolean }) {
  const gl = useThree((state) => state.gl);
  const setSize = useThree((state) => state.setSize);

  useEffect(() => {
    if (!settled) return;
    const parent = gl.domElement.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setSize(rect.width, rect.height, rect.top, rect.left);
    }
  }, [settled, gl, setSize]);

  return null;
}

export default function CinematicPlanet3D({
  planetId,
  missions,
  palette,
  textureUrl,
  rings = null,
  reducedMotion = false,
  settled = false,
  minimized = false,
  showMoon = false,
  moonSelected = false,
  onSelectMoon,
  className,
}: CinematicPlanet3DProps) {
  const scale = minimized ? 0.5 : 1;
  const remote = useRemoteMap(textureUrl);
  const map = remote ?? planetSurface(planetId, palette.bands);

  const segments = 64;

  /** The Moon sits just beyond the outermost satellite shell. */
  const moonOrbitRadius = useMemo(() => {
    if (!showMoon) return null;
    const outermost = missions.reduce(
      (max, mission) => Math.max(max, mission.orbitRadius),
      PLANET_RADIUS * 2.2,
    );
    return outermost + 0.24;
  }, [showMoon, missions]);

  /**
   * The ring system is sized against the missions rather than fixed: it stops
   * just short of the innermost orbit, so tightening the orbits on a phone
   * tightens the rings with them and the planet keeps its proportion.
   */
  const ringOuter = useMemo(() => {
    if (!rings) return null;
    const innermost = missions.reduce(
      (min, mission) => Math.min(min, mission.orbitRadius),
      Number.POSITIVE_INFINITY,
    );
    return innermost === Number.POSITIVE_INFINITY
      ? PLANET_RADIUS * 2.16
      : innermost * RING_OUTER_RATIO;
  }, [rings, missions]);

  const ringMap = useMemo(() => {
    if (!rings || ringOuter === null) return null;
    return ringSurface(`${planetId}-rings`, RING_INNER_RATIO, rings.band, rings.soft, rings.gap);
  }, [planetId, rings, ringOuter]);

  /**
   * How much room the system needs. The vertical figure is the worst case
   * across every camera angle the viewer can drag to, so an orbit never
   * slides off the bottom of the canvas.
   */
  const layout = useMemo(() => {
    const count = missions.length;
    let horizontal = PLANET_RADIUS;
    let vertical = PLANET_RADIUS;

    missions.forEach((mission, index) => {
      const inclination = (index - (count - 1) / 2) * INCLINATION_STEP;
      const squash = Math.max(
        Math.abs(Math.sin(inclination - ELEVATION_MIN)),
        Math.abs(Math.sin(inclination - ELEVATION_MAX)),
      );
      vertical = Math.max(vertical, mission.orbitRadius * squash);
      horizontal = Math.max(horizontal, mission.orbitRadius);
    });

    if (rings && ringOuter !== null) {
      horizontal = Math.max(horizontal, ringOuter);
      vertical = Math.max(vertical, ringOuter * Math.sin(rings.tilt + ELEVATION_MAX));
    }

    if (moonOrbitRadius !== null) {
      horizontal = Math.max(horizontal, moonOrbitRadius);
      // The Moon's lane is nearly flat, so it adds almost no vertical room —
      // but it is the widest ring, so the camera must pull back for it.
      vertical = Math.max(vertical, moonOrbitRadius * Math.sin(MOON_TILT + ELEVATION_MAX));
    }

    return { horizontal, vertical };
  }, [missions, rings, ringOuter, moonOrbitRadius]);

  return (
    <div className={`cp3d${className ? ` ${className}` : ""}`}>
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 1.8, 14], fov: 42, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearAlpha(0)}
      >
        <FrameSystem horizontal={layout.horizontal} vertical={layout.vertical} />
        <FitCanvas settled={settled} />
        <ambientLight intensity={0.16} />
        {/* Key light: the sun, off to the upper left. */}
        <directionalLight position={[-5.2, 3.0, 4.4]} intensity={2.4} color="#fff3e2" />
        {/* Cool bounce from the night side so the limb never goes fully black. */}
        <directionalLight position={[5.5, -1.8, -3.4]} intensity={0.4} color="#4c6ea8" />

        <group>
          <Globe map={map} segments={segments} reducedMotion={reducedMotion} scale={scale} />
          <Atmosphere color={palette.highlight} />
          {ringMap && ringOuter !== null ? (
            <PlanetRings
              map={ringMap}
              tilt={rings?.tilt ?? 0.18}
              inner={ringOuter * RING_INNER_RATIO}
              outer={ringOuter}
            />
          ) : null}

          {missions.map((mission, index) => (
            <MissionOrbit
              key={mission.id}
              mission={mission}
              index={index}
              total={missions.length}
              reducedMotion={reducedMotion}
            />
          ))}

          {moonOrbitRadius !== null ? (
            <MoonOrbit
              radius={moonOrbitRadius}
              reducedMotion={reducedMotion}
              selected={moonSelected}
              onSelect={onSelectMoon}
            />
          ) : null}
        </group>

        <OrbitControls
          makeDefault
          enableZoom={true}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.35}
          autoRotate={false}
          minPolarAngle={Math.PI / 2 - ELEVATION_MAX}
          maxPolarAngle={Math.PI / 2 - ELEVATION_MIN}
          minAzimuthAngle={-0.32}
          maxAzimuthAngle={0.32}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}

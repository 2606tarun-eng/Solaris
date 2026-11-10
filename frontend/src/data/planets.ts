import { img } from "../assets";
import { orbits } from "./solarSystem";

export type Planet = {
  id: string;
  name: string;
  /** Figma node id kept for reference. */
  nodeId: string;
  /** Index into the `orbits` array (inner → outer). */
  orbitIndex: number;
  /** Base display size in stage pixels. */
  size: number;
  /** Seconds per orbit at 1× speed. */
  period: number;
  /** Starting angle in radians, seeded from the original artwork position. */
  startAngle: number;
  /** Label colour on the map. */
  color: string;
  /** Number of known moons, for the tiny companion dot and HUD readout. */
  moons?: number;
  /** Short, kid-friendly nickname. */
  tagline: string;
  /** Transparent cutout used for the orbit marker. */
  src: string;
  /** Full-disk planet photo used for the tour frame (falls back to `src`). */
  hero?: string;
};

type PlanetSeed = Omit<Planet, "startAngle" | "id" | "nodeId"> & {
  id: string;
  nodeId: string;
  left: number;
  top: number;
};

function seedAngle(left: number, top: number, size: number, orbitIndex: number) {
  const orbit = orbits[orbitIndex];
  const centerX = orbit.left + orbit.width / 2;
  const centerY = orbit.top + orbit.height / 2;
  const radiusX = orbit.width / 2;
  const radiusY = orbit.height / 2;
  const planetX = left + size / 2;
  const planetY = top + size / 2;
  return Math.atan2((planetY - centerY) / radiusY, (planetX - centerX) / radiusX);
}

const seeds: PlanetSeed[] = [
  {
    id: "mercury",
    name: "Mercury",
    nodeId: "9:29",
    orbitIndex: 0,
    size: 18,
    period: 18,
    color: "#fde68a",
    tagline: "The swift messenger",
    src: img.mercury,
    hero: img.planetMercury,
    left: 652.3,
    top: 593.4,
  },
  {
    id: "venus",
    name: "Venus",
    nodeId: "9:30",
    orbitIndex: 1,
    size: 30,
    period: 24,
    color: "#fde68a",
    tagline: "The hidden world",
    src: img.venus,
    hero: img.planetVenus,
    left: 428.3,
    top: 524.2,
  },
  {
    id: "earth",
    name: "Earth",
    nodeId: "9:31",
    orbitIndex: 2,
    size: 40,
    period: 30,
    color: "#93c5fd",
    moons: 1,
    tagline: "Our home world",
    src: img.earth,
    hero: img.planetEarth,
    left: 715.5,
    top: 496.8,
  },
  {
    id: "mars",
    name: "Mars",
    nodeId: "9:32",
    orbitIndex: 3,
    size: 34,
    period: 38,
    color: "#fca5a5",
    moons: 2,
    tagline: "The rover playground",
    src: img.mars,
    hero: img.planetMars,
    left: 396.1,
    top: 639,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    nodeId: "9:33",
    orbitIndex: 4,
    size: 86,
    period: 52,
    color: "#fde68a",
    moons: 95,
    tagline: "The giant storm",
    src: img.jupiter,
    hero: img.planetJupiter,
    left: 827,
    top: 590.2,
  },
  {
    id: "saturn",
    name: "Saturn",
    nodeId: "9:34",
    orbitIndex: 5,
    size: 72,
    period: 66,
    color: "#fde68a",
    moons: 146,
    tagline: "The ringed beauty",
    src: img.saturn,
    hero: img.planetSaturn,
    left: 177.5,
    top: 481.6,
  },
  {
    id: "uranus",
    name: "Uranus",
    nodeId: "9:35",
    orbitIndex: 6,
    size: 52,
    period: 82,
    color: "#93c5fd",
    tagline: "The sideways planet",
    src: img.uranus,
    hero: img.planetUranus,
    left: 709.1,
    top: 364.6,
  },
  {
    id: "neptune",
    name: "Neptune",
    nodeId: "9:36",
    orbitIndex: 7,
    size: 52,
    period: 100,
    color: "#60a5fa",
    tagline: "The windy blue world",
    src: img.neptune,
    hero: img.planetNeptune,
    left: 102.7,
    top: 659.8,
  },
];

export const planets: Planet[] = seeds.map(({ left, top, ...planet }) => ({
  ...planet,
  startAngle: seedAngle(left, top, planet.size, planet.orbitIndex),
}));

export const planetById = Object.fromEntries(planets.map((planet) => [planet.id, planet]));

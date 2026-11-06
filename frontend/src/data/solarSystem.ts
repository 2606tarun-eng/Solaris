import { img } from "../assets";

export type SolarFlare = {
  left: number;
  top: number;
  size: number;
  src: string;
};

export type Orbit = {
  nodeId: string;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  src: string;
};

/** Concentric flare rings that make up the sun. */
export const solarFlares: SolarFlare[] = [
  { left: 405, top: 400, size: 340, src: img.solarFlare },
  { left: 415, top: 410, size: 320, src: img.solarFlare1 },
  { left: 425, top: 420, size: 300, src: img.solarFlare2 },
  { left: 435, top: 430, size: 280, src: img.solarFlare3 },
  { left: 445, top: 440, size: 260, src: img.solarFlare4 },
  { left: 455, top: 450, size: 240, src: img.solarFlare5 },
  { left: 465, top: 460, size: 220, src: img.solarFlare6 },
  { left: 475, top: 470, size: 200, src: img.solarFlare7 },
  { left: 485, top: 480, size: 180, src: img.solarFlare8 },
  { left: 495, top: 490, size: 160, src: img.solarFlare9 },
  { left: 505, top: 500, size: 140, src: img.solarFlare10 },
  { left: 515, top: 510, size: 120, src: img.solarFlare11 },
  { left: 525, top: 520, size: 100, src: img.solarFlare12 },
  { left: 535, top: 530, size: 80, src: img.solarFlare13 },
];

/** Orbit paths, ordered from the innermost planet outward. */
export const orbits: Orbit[] = [
  {
    nodeId: "9:21",
    name: "Mercury orbit",
    left: 465,
    top: 522.7,
    width: 220,
    height: 94.6,
    src: img.mercuryOrbit,
  },
  {
    nodeId: "9:22",
    name: "Venus orbit",
    left: 420,
    top: 503.4,
    width: 310,
    height: 133.3,
    src: img.venusOrbit,
  },
  {
    nodeId: "9:23",
    name: "Earth orbit",
    left: 370,
    top: 481.9,
    width: 410,
    height: 176.3,
    src: img.earthOrbit,
  },
  {
    nodeId: "9:24",
    name: "Mars orbit",
    left: 320,
    top: 460.4,
    width: 510,
    height: 219.3,
    src: img.marsOrbit,
  },
  {
    nodeId: "9:25",
    name: "Jupiter orbit",
    left: 255,
    top: 432.4,
    width: 640,
    height: 275.2,
    src: img.jupiterOrbit,
  },
  {
    nodeId: "9:26",
    name: "Saturn orbit",
    left: 185,
    top: 402.3,
    width: 780,
    height: 335.4,
    src: img.saturnOrbit,
  },
  {
    nodeId: "9:27",
    name: "Uranus orbit",
    left: 120,
    top: 374.4,
    width: 910,
    height: 391.3,
    src: img.uranusOrbit,
  },
  {
    nodeId: "9:28",
    name: "Neptune orbit",
    left: 55,
    top: 346.4,
    width: 1040,
    height: 447.2,
    src: img.neptuneOrbit,
  },
];

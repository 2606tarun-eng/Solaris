import {
  CanvasTexture,
  ClampToEdgeWrapping,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

/**
 * Runtime planet surfaces.
 *
 * Every photo in `public/assets/planets` is a *full-disk* portrait, not an
 * equirectangular map — wrapping one around a sphere smears the limb into a
 * stripe. So each world gets a seamless equirectangular surface painted from
 * its own palette, and any real map we do have (Earth) is passed in as
 * `textureUrl` and swapped in over the top.
 *
 * Everything here is deterministic: the same planet looks the same on every
 * visit, and nothing is fetched from the network.
 */

const TAU = Math.PI * 2;

type CanvasPair = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D };

function makeCanvas(width: number, height: number): CanvasPair {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  return { canvas, ctx };
}

/** Small integer hash, used to seed the noise per planet. */
function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Linear congruential generator — deterministic, no dependencies. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const surfaceCache = new Map<string, Texture>();

/**
 * Equirectangular surface built from latitude bands plus weather.
 * Bands run east–west, so the left and right edges match by construction and
 * the texture wraps without a visible seam.
 */
export function planetSurface(planetId: string, bands: string[]): Texture {
  const cached = surfaceCache.get(planetId);
  if (cached) return cached;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = makeCanvas(width, height);
  const random = seeded(hash(planetId));

  // 1. Latitude bands.
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  bands.forEach((color, index) => {
    sky.addColorStop((index + 0.5) / bands.length, color);
  });
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // 2. Rills — wavy streaks that follow the bands. Whole numbers of waves keep
  //    the pattern continuous where the texture wraps, and the strokes run a
  //    little past both edges so the seam is never a half-drawn line.
  const rills = 52;
  for (let i = 0; i < rills; i += 1) {
    const y = random() * height;
    const waves = 1 + Math.floor(random() * 3);
    const phase = random() * TAU;
    const amplitude = 3 + random() * 11;
    const light = random() > 0.5;
    ctx.strokeStyle = light ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.075)";
    ctx.lineWidth = 1 + random() * 3.5;
    ctx.beginPath();
    for (let x = -24; x <= width + 24; x += 6) {
      const t = (x / width) * TAU * waves + phase;
      const yy = y + Math.sin(t) * amplitude + Math.sin(t * 2 + phase) * amplitude * 0.35;
      if (x === -24) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  // 3. Storms. Each blob is painted three times so it survives the seam.
  const storms = 14 + Math.floor(random() * 10);
  for (let i = 0; i < storms; i += 1) {
    const x = random() * width;
    const y = height * (0.14 + random() * 0.72);
    const rx = 16 + random() * 76;
    const ry = rx * (0.26 + random() * 0.34);
    const bright = random() > 0.42;
    const alpha = bright ? 0.05 + random() * 0.08 : 0.05 + random() * 0.1;
    const rgb = bright ? "255,255,255" : "18,12,6";
    for (const offset of [-width, 0, width]) {
      ctx.save();
      ctx.translate(x + offset, y);
      ctx.scale(1, ry / rx);
      const blob = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      blob.addColorStop(0, `rgba(${rgb},${alpha.toFixed(3)})`);
      blob.addColorStop(0.7, `rgba(${rgb},${(alpha * 0.45).toFixed(3)})`);
      blob.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  // 4. Poles fall away, which is what makes the spin read as a sphere.
  const caps = ctx.createLinearGradient(0, 0, 0, height);
  caps.addColorStop(0, "rgba(0,0,0,0.42)");
  caps.addColorStop(0.17, "rgba(0,0,0,0)");
  caps.addColorStop(0.83, "rgba(0,0,0,0)");
  caps.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = caps;
  ctx.fillRect(0, 0, width, height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  surfaceCache.set(planetId, texture);
  return texture;
}

/**
 * A dedicated cratered surface for the Moon. The planet generator paints
 * latitude bands, which reads as a gas giant rather than a rocky world, so the
 * Moon gets its own pass: a soft grey base plus craters with bright rims.
 * Deterministic and network-free, like every other surface here.
 */
export function moonSurface(): Texture {
  const cached = surfaceCache.get("moon-surface");
  if (cached) return cached;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = makeCanvas(width, height);
  const random = seeded(hash("moon-surface"));

  const base = ctx.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, "#6f6c66");
  base.addColorStop(0.22, "#a6a198");
  base.addColorStop(0.5, "#b8b2a7");
  base.addColorStop(0.78, "#9a958b");
  base.addColorStop(1, "#66635e");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  // Broad dark maria, then craters on top of them.
  const maria = 9;
  for (let i = 0; i < maria; i += 1) {
    const x = random() * width;
    const y = height * (0.24 + random() * 0.52);
    const rx = 70 + random() * 130;
    const ry = rx * (0.3 + random() * 0.26);
    for (const offset of [-width, 0, width]) {
      ctx.save();
      ctx.translate(x + offset, y);
      ctx.scale(1, ry / rx);
      const blob = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      blob.addColorStop(0, "rgba(58,56,53,0.28)");
      blob.addColorStop(0.65, "rgba(58,56,53,0.16)");
      blob.addColorStop(1, "rgba(58,56,53,0)");
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  const craters = 160;
  for (let i = 0; i < craters; i += 1) {
    const x = random() * width;
    const y = 24 + random() * (height - 48);
    const radius = 2.5 + random() * 19;
    const depth = 0.18 + random() * 0.24;
    for (const offset of [-width, 0, width]) {
      const cx = x + offset;
      const crater = ctx.createRadialGradient(
        cx - radius * 0.28,
        y - radius * 0.28,
        radius * 0.08,
        cx,
        y,
        radius,
      );
      crater.addColorStop(0, `rgba(48,46,43,${depth.toFixed(3)})`);
      crater.addColorStop(0.62, `rgba(78,75,71,${(depth * 0.5).toFixed(3)})`);
      crater.addColorStop(0.82, `rgba(226,221,210,${(depth * 0.7).toFixed(3)})`);
      crater.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = crater;
      ctx.beginPath();
      ctx.arc(cx, y, radius, 0, TAU);
      ctx.fill();
    }
  }

  const poles = ctx.createLinearGradient(0, 0, 0, height);
  poles.addColorStop(0, "rgba(20,19,18,0.5)");
  poles.addColorStop(0.18, "rgba(20,19,18,0)");
  poles.addColorStop(0.82, "rgba(20,19,18,0)");
  poles.addColorStop(1, "rgba(20,19,18,0.5)");
  ctx.fillStyle = poles;
  ctx.fillRect(0, 0, width, height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  surfaceCache.set("moon-surface", texture);
  return texture;
}

const ringCache = new Map<string, Texture>();

/**
 * Ring bands for a planetary ring system. `RingGeometry` maps its UVs across
 * the whole bounding square, so a planar radial gradient lands the bands
 * exactly on the annulus.
 */
export function ringSurface(
  key: string,
  innerRatio: number,
  band: string,
  soft: string,
  gap: string,
): Texture {
  const cached = ringCache.get(key);
  if (cached) return cached;

  const size = 512;
  const { canvas, ctx } = makeCanvas(size, size);
  const centre = size / 2;

  // Profiles are expressed across the ring (0 = inner edge, 1 = outer edge).
  const profile: Array<[number, string]> = [
    [0, soft],
    [0.08, band],
    [0.3, band],
    [0.42, gap],
    [0.48, band],
    [0.7, band],
    [0.76, soft],
    [0.8, band],
    [0.95, soft],
    [1, "rgba(0,0,0,0)"],
  ];
  // RingGeometry writes UVs as (x / outer + 1) / 2, so a ring point at radius
  // fraction f sits at UV radius 0.5 * f, i.e. gradient stop f against a
  // half-canvas gradient — and stop 1.0 lands exactly on the canvas edge.
  const toStop = (t: number) => innerRatio + t * (1 - innerRatio);

  const gradient = ctx.createRadialGradient(centre, centre, 0, centre, centre, centre);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(toStop(0) - 0.002, "rgba(0,0,0,0)");
  for (const [t, color] of profile) gradient.addColorStop(toStop(t), color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  ringCache.set(key, texture);
  return texture;
}

let glow: Texture | null = null;

/** Soft radial dot used for the mission node halos. */
export function glowSurface(): Texture {
  if (glow) return glow;
  const size = 128;
  const { canvas, ctx } = makeCanvas(size, size);
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,255,255,0.75)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.16)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  glow = new CanvasTexture(canvas);
  glow.colorSpace = SRGBColorSpace;
  glow.needsUpdate = true;
  return glow;
}

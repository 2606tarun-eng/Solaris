import { useEffect, useRef } from "react";
import type { PerformanceTier } from "../hooks/usePerformanceTier";

type StarfieldCanvasProps = {
  tier: PerformanceTier;
  reducedMotion: boolean;
};

type Star = {
  x: number;
  y: number;
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  depth: number;
  color: string;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

const STAR_COLORS = ["#ffffff", "#f5f5f4", "#fde68a", "#facc15", "#fed7aa"];

function makeStars(width: number, height: number, count: number): Star[] {
  return Array.from({ length: count }, () => {
    const bright = Math.random() < 0.12;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: bright ? 0.9 + Math.random() * 1.1 : 0.3 + Math.random() * 0.7,
      alpha: bright ? 0.7 + Math.random() * 0.3 : 0.22 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.6,
      depth: 0.35 + Math.random() * 0.65,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    };
  });
}

function paintSky(width: number, height: number, tier: PerformanceTier) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const base = ctx.createRadialGradient(
    width * 0.35,
    height * 0.2,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.95,
  );
  base.addColorStop(0, "#18181b");
  base.addColorStop(0.45, "#0c0c0e");
  base.addColorStop(1, "#09090b");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-0.42);

  const bandHeight = Math.max(height * 0.62, 420);
  const band = ctx.createLinearGradient(0, -bandHeight / 2, 0, bandHeight / 2);
  band.addColorStop(0, "rgba(120, 113, 108, 0)");
  band.addColorStop(0.3, "rgba(120, 113, 108, 0.06)");
  band.addColorStop(0.48, "rgba(214, 211, 209, 0.14)");
  band.addColorStop(0.52, "rgba(255, 226, 196, 0.1)");
  band.addColorStop(0.7, "rgba(120, 113, 108, 0.06)");
  band.addColorStop(1, "rgba(120, 113, 108, 0)");
  ctx.fillStyle = band;
  ctx.fillRect(-width, -bandHeight / 2, width * 2, bandHeight);

  const clouds = tier === "high" ? 7 : 4;
  for (let index = 0; index < clouds; index += 1) {
    const x = (Math.random() - 0.5) * width * 1.4;
    const y = (Math.random() - 0.5) * bandHeight * 0.55;
    const radius = 120 + Math.random() * 260;
    const hue = index % 2 === 0 ? "249, 115, 22" : "250, 204, 21";
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, radius);
    cloud.addColorStop(0, `rgba(${hue}, 0.11)`);
    cloud.addColorStop(0.55, `rgba(${hue}, 0.05)`);
    cloud.addColorStop(1, `rgba(${hue}, 0)`);
    ctx.fillStyle = cloud;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const bandStars = tier === "high" ? 900 : 380;
  for (let index = 0; index < bandStars; index += 1) {
    const x = (Math.random() - 0.5) * width * 1.8;
    const spread = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    const y = spread * bandHeight * 0.42;
    const size = Math.random() < 0.9 ? 0.5 : 0.9;
    ctx.fillStyle = `rgba(245, 245, 244, ${0.08 + Math.random() * 0.32})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  return canvas;
}

export default function StarfieldCanvas({ tier, reducedMotion }: StarfieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let stars: Star[] = [];
    let sky: HTMLCanvasElement | null = null;
    let animation = 0;
    let lastFrame = 0;
    let nextShoot = 4000 + Math.random() * 6000;
    let shooting: ShootingStar | null = null;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, tier === "low" ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = makeStars(width, height, tier === "low" ? 220 : 520);
      sky = paintSky(width, height, tier);
    };

    const drawSky = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      if (sky) ctx.drawImage(sky, 0, 0, width, height);

      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;
      const parallax = reducedMotion ? 0 : 1;

      for (const star of stars) {
        const twinkle = reducedMotion
          ? star.alpha
          : star.alpha * (0.62 + 0.38 * Math.sin(time * 0.001 * star.speed + star.phase));
        ctx.globalAlpha = Math.max(0.05, twinkle);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(
          star.x + pointer.x * star.depth * 14 * parallax,
          star.y + pointer.y * star.depth * 14 * parallax,
          star.r,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (shooting) {
        shooting.life -= 1;
        shooting.x += shooting.vx;
        shooting.y += shooting.vy;
        const fade = Math.max(0, shooting.life / shooting.maxLife);
        const tailX = shooting.x - shooting.vx * 12;
        const tailY = shooting.y - shooting.vy * 12;
        const gradient = ctx.createLinearGradient(tailX, tailY, shooting.x, shooting.y);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(1, `rgba(253, 186, 116, ${0.85 * fade})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shooting.x, shooting.y);
        ctx.stroke();
        if (shooting.life <= 0) shooting = null;
      }
    };

    const onResize = () => {
      resize();
      if (reducedMotion) drawSky(0);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.targetX = (event.clientX / width - 0.5) * 2;
      pointer.targetY = (event.clientY / height - 0.5) * 2;
    };

    resize();
    drawSky(0);
    window.addEventListener("resize", onResize);

    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove);
      const interval = 1000 / (tier === "low" ? 24 : 32);

      const loop = (time: number) => {
        animation = requestAnimationFrame(loop);
        if (time - lastFrame < interval) return;
        lastFrame = time;

        if (!shooting && time > nextShoot) {
          const startX = width * (0.15 + Math.random() * 0.7);
          const startY = height * (0.08 + Math.random() * 0.3);
          const speed = 7 + Math.random() * 5;
          const angle = Math.PI * (0.22 + Math.random() * 0.08);
          shooting = {
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 46 + Math.random() * 26,
            maxLife: 72,
          };
          nextShoot = time + 9000 + Math.random() * 11000;
        }

        drawSky(time);
      };

      animation = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reducedMotion, tier]);

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />;
}

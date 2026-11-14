import { useEffect, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  shape: "circle" | "star" | "rect";
};

const COLORS = ["#ff5722", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

export default function Confetti({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const items: Particle[] = [];
    const count = 55;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 9 + 4;
      items.push({
        id: i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 6,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        shape: i % 3 === 0 ? "star" : i % 3 === 1 ? "circle" : "rect",
      });
    }

    setParticles(items);

    let animationFrame: number;
    let startTime = Date.now();

    const update = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 2400) {
        setParticles([]);
        if (onComplete) onComplete();
        return;
      }

      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.35, // Gravity
          vx: p.vx * 0.98, // Air resistance
          rotation: p.rotation + p.rotSpeed,
        }))
      );

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrame);
  }, [active, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.shape !== "star" ? p.color : undefined,
            color: p.shape === "star" ? p.color : undefined,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            fontSize: p.shape === "star" ? `${p.size * 1.4}px` : undefined,
            lineHeight: 1,
            display: "inline-block",
            boxShadow: `0 0 6px ${p.color}88`,
          }}
        >
          {p.shape === "star" ? "★" : ""}
        </span>
      ))}
    </div>
  );
}

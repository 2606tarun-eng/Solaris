import { useEffect, useState } from "react";

export type PerformanceTier = "low" | "high";

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function detectTier(): PerformanceTier {
  if (typeof window === "undefined") return "high";
  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const narrow = window.innerWidth < 760;
  return cores <= 4 || memory <= 4 || narrow ? "low" : "high";
}

/** Picks a lighter effect budget for phones and older school laptops. */
export default function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>(detectTier);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTier(detectTier()));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return tier;
}

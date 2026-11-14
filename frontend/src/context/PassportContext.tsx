import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { playBadgeFanfare } from "../lib/kidAudio";

export type Badge = {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
};

export const ALL_BADGES: Badge[] = [
  {
    id: "first_planet",
    title: "Space Cadet",
    icon: "🚀",
    description: "Launched your journey by visiting your first planet!",
    color: "#3b82f6",
  },
  {
    id: "mars_rover",
    title: "Mars Detective",
    icon: "🤖",
    description: "Inspected the red world of Mars and its robotic explorers!",
    color: "#ef4444",
  },
  {
    id: "saturn_rings",
    title: "Lord of the Rings",
    icon: "🪐",
    description: "Discovered the glittering icy ring systems of Saturn!",
    color: "#f59e0b",
  },
  {
    id: "earth_guardian",
    title: "Earth Guardian",
    icon: "🌍",
    description: "Surveyed Earth and its fleet of weather & science relics!",
    color: "#10b981",
  },
  {
    id: "jupiter_storm",
    title: "Giant Storm Chaser",
    icon: "👑",
    description: "Braved Jupiter's Great Red Spot and its 95 moons!",
    color: "#ec4899",
  },
  {
    id: "deep_freeze",
    title: "Deep Freeze Scout",
    icon: "❄️",
    description: "Ventured out to the ice giants Uranus & Neptune!",
    color: "#06b6d4",
  },
  {
    id: "speedy_mercury",
    title: "Solar Sprinter",
    icon: "🏎️",
    description: "Raced around the Sun alongside blazing Mercury!",
    color: "#f97316",
  },
  {
    id: "solar_master",
    title: "Grand Cosmic Master",
    icon: "🏆",
    description: "Visited all 8 planets and mapped the entire solar system!",
    color: "#8b5cf6",
  },
];

type PassportContextType = {
  visitedPlanets: string[];
  unlockedBadgeIds: string[];
  recentBadge: Badge | null;
  clearRecentBadge: () => void;
  recordPlanetVisit: (planetId: string, audioEnabled?: boolean) => void;
  recordRelicInspect: (relicId: string, audioEnabled?: boolean) => void;
  resetPassport: () => void;
};

const PassportContext = createContext<PassportContextType | null>(null);

const STORAGE_KEY = "solaris_passport";

export function PassportProvider({ children }: { children: ReactNode }) {
  const [visitedPlanets, setVisitedPlanets] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed.visitedPlanets) ? parsed.visitedPlanets : [];
      }
    } catch {}
    return [];
  });

  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed.badges) ? parsed.badges : [];
      }
    } catch {}
    return [];
  });

  const [recentBadge, setRecentBadge] = useState<Badge | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          visitedPlanets,
          badges: unlockedBadgeIds,
        })
      );
    } catch {}
  }, [visitedPlanets, unlockedBadgeIds]);

  const awardBadge = (badgeId: string, audioEnabled = true) => {
    if (unlockedBadgeIds.includes(badgeId)) return;
    const badge = ALL_BADGES.find((b) => b.id === badgeId);
    if (!badge) return;

    setUnlockedBadgeIds((prev) => [...prev, badgeId]);
    setRecentBadge(badge);
    if (audioEnabled) {
      playBadgeFanfare();
    }
  };

  const recordPlanetVisit = (planetId: string, audioEnabled = true) => {
    const updatedPlanets = visitedPlanets.includes(planetId)
      ? visitedPlanets
      : [...visitedPlanets, planetId];

    if (!visitedPlanets.includes(planetId)) {
      setVisitedPlanets(updatedPlanets);
    }

    // Check badges
    if (updatedPlanets.length >= 1) awardBadge("first_planet", audioEnabled);
    if (planetId === "mars") awardBadge("mars_rover", audioEnabled);
    if (planetId === "saturn") awardBadge("saturn_rings", audioEnabled);
    if (planetId === "earth") awardBadge("earth_guardian", audioEnabled);
    if (planetId === "jupiter") awardBadge("jupiter_storm", audioEnabled);
    if (planetId === "uranus" || planetId === "neptune") awardBadge("deep_freeze", audioEnabled);
    if (planetId === "mercury") awardBadge("speedy_mercury", audioEnabled);

    const allPlanets = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
    if (allPlanets.every((p) => updatedPlanets.includes(p))) {
      awardBadge("solar_master", audioEnabled);
    }
  };

  const recordRelicInspect = (relicId: string, audioEnabled = true) => {
    if (relicId.includes("curiosity") || relicId.includes("perseverance") || relicId.includes("opportunity")) {
      awardBadge("mars_rover", audioEnabled);
    }
  };

  const clearRecentBadge = () => setRecentBadge(null);

  const resetPassport = () => {
    setVisitedPlanets([]);
    setUnlockedBadgeIds([]);
    setRecentBadge(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <PassportContext.Provider
      value={{
        visitedPlanets,
        unlockedBadgeIds,
        recentBadge,
        clearRecentBadge,
        recordPlanetVisit,
        recordRelicInspect,
        resetPassport,
      }}
    >
      {children}
    </PassportContext.Provider>
  );
}

export function usePassport() {
  const ctx = useContext(PassportContext);
  if (!ctx) {
    throw new Error("usePassport must be used within a PassportProvider");
  }
  return ctx;
}

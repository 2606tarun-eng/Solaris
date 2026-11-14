import { useState } from "react";
import { ALL_BADGES, usePassport } from "../context/PassportContext";
import { useTheme } from "../context/ThemeContext";
import Confetti from "./Confetti";
import Icon from "./Icon";
import { playPop } from "../lib/kidAudio";

export default function CosmicPassport({ audioEnabled }: { audioEnabled: boolean }) {
  const { theme } = useTheme();
  const { visitedPlanets, unlockedBadgeIds, recentBadge, clearRecentBadge } = usePassport();
  const [isOpen, setIsOpen] = useState(false);

  // Strictly active in Light Theme — Dark Theme remains 100% untouched
  if (theme !== "light") {
    return null;
  }

  const totalBadges = ALL_BADGES.length;
  const earnedCount = unlockedBadgeIds.length;
  const progressPercent = Math.round((earnedCount / totalBadges) * 100);

  const getRank = () => {
    if (earnedCount >= 8) return "🌟 Grand Solar Master";
    if (earnedCount >= 6) return "🚀 Master Planetary Scout";
    if (earnedCount >= 4) return "🛸 Senior Space Explorer";
    if (earnedCount >= 2) return "🛰️ Cosmic Adventurer";
    return "🌱 Rookie Space Cadet";
  };

  const openPassport = () => {
    if (audioEnabled) playPop();
    setIsOpen(true);
  };

  const closePassport = () => {
    if (audioEnabled) playPop();
    setIsOpen(false);
  };

  return (
    <>
      {/* Confetti whenever a new badge is awarded */}
      <Confetti active={recentBadge !== null} />

      {/* Floating Celebration Toast */}
      {recentBadge ? (
        <div className="kid-badge-toast" role="alert">
          <div className="kid-toast-icon">{recentBadge.icon}</div>
          <div className="kid-toast-body">
            <span className="kid-toast-kicker">🎉 NEW BADGE UNLOCKED!</span>
            <strong>{recentBadge.title}</strong>
            <p>{recentBadge.description}</p>
          </div>
          <button
            type="button"
            className="kid-toast-dismiss"
            onClick={clearRecentBadge}
            aria-label="Dismiss badge notification"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}

      {/* Floating Passport Launch Pill (bottom left) */}
      <button
        type="button"
        className="kid-passport-pill"
        onClick={openPassport}
        aria-label="Open Cosmic Explorer Passport"
        title="View your collected space badges and passport!"
      >
        <span className="kid-passport-icon" aria-hidden="true">
          🏅
        </span>
        <span className="kid-passport-label">
          <strong>Passport</strong>
          <small>
            {earnedCount}/{totalBadges} Badges
          </small>
        </span>
      </button>

      {/* Passport Modal & Sticker Album */}
      {isOpen ? (
        <div className="kid-modal-backdrop" onClick={closePassport}>
          <div
            className="kid-passport-book"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Cosmic Explorer Passport"
          >
            <header className="kid-passport-header">
              <div className="kid-passport-title">
                <span className="kid-passport-crown">🚀</span>
                <div>
                  <h2>Cosmic Explorer Passport</h2>
                  <p>{getRank()}</p>
                </div>
              </div>
              <button
                type="button"
                className="kid-passport-close"
                onClick={closePassport}
                aria-label="Close passport"
              >
                <Icon name="close" size={16} />
              </button>
            </header>

            {/* Progress Card */}
            <div className="kid-progress-box">
              <div className="kid-progress-stats">
                <div className="kid-stat-bubble">
                  <span>Planets Visited</span>
                  <strong>{visitedPlanets.length} / 8</strong>
                </div>
                <div className="kid-stat-bubble">
                  <span>Badges Collected</span>
                  <strong>{earnedCount} / {totalBadges}</strong>
                </div>
                <div className="kid-stat-bubble">
                  <span>Completion</span>
                  <strong>{progressPercent}%</strong>
                </div>
              </div>
              <div className="kid-progress-bar-track">
                <div
                  className="kid-progress-bar-fill"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Planet Stamp Line */}
            <div className="kid-planet-checklist">
              <span className="kid-checklist-title">Planetary Stamp Radar:</span>
              <div className="kid-planet-dots">
                {["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"].map((p) => {
                  const visited = visitedPlanets.includes(p);
                  return (
                    <span
                      key={p}
                      className={`kid-planet-stamp${visited ? " is-visited" : ""}`}
                      title={`${p.toUpperCase()}: ${visited ? "Explored!" : "Not visited yet"}`}
                    >
                      {visited ? "✓" : "○"} {p}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Badges Grid */}
            <h3 className="kid-badges-heading">Collected Holographic Badges</h3>
            <div className="kid-badges-grid">
              {ALL_BADGES.map((badge) => {
                const unlocked = unlockedBadgeIds.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`kid-badge-card${unlocked ? " is-unlocked" : " is-locked"}`}
                  >
                    <div
                      className="kid-badge-stamp"
                      style={{ backgroundColor: unlocked ? `${badge.color}18` : undefined }}
                    >
                      <span className="kid-badge-emoji">{unlocked ? badge.icon : "🔒"}</span>
                    </div>
                    <strong>{badge.title}</strong>
                    <p>{badge.description}</p>
                    <span className="kid-badge-tag">
                      {unlocked ? "★ UNLOCKED" : "LOCKED"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

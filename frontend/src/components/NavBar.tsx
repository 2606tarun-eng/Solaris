import { useEffect, useRef, useState } from "react";
import { img } from "../assets";
import Icon from "./Icon";

type NavBarProps = {
  activeView: "map" | "tour" | "about";
  onOpenMap: () => void;
  onStartTour: () => void;
  onOpenAbout: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
};

export default function NavBar({
  activeView,
  onOpenMap,
  onStartTour,
  onOpenAbout,
  isAudioEnabled,
  onToggleAudio,
}: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen && !notice) return;

    const onPointerDown = (event: PointerEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setNotice(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setNotice(null);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, notice]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const flash = (message: string) => {
    setMenuOpen(false);
    setNotice(message);
  };

  const openFromMenu = () => {
    setMenuOpen(false);
    setNotice(null);
    onOpenAbout();
  };

  return (
    <header className="nav-bar">
      <button type="button" className="brand" onClick={onOpenMap} aria-label="Solaris map">
        <span className="brand-logo">
          <img src={img.glowingPlanetLogo} alt="" />
        </span>
        <span className="brand-text">
          <strong>Solaris</strong>
          <small>Mission Atlas</small>
        </span>
      </button>

      <nav className="nav-links" aria-label="Main">
        <button
          type="button"
          className={activeView === "tour" ? "is-active" : ""}
          onClick={onStartTour}
        >
          <Icon name="rocket" size={16} className="icon" /> <span>Tour</span>
        </button>
        <button
          type="button"
          className={activeView === "about" ? "is-active" : ""}
          onClick={onOpenAbout}
        >
          <Icon name="sparkle" size={16} className="icon" /> <span>About</span>
        </button>
      </nav>

      <div className="nav-actions" ref={actionsRef}>
        <button
          type="button"
          className="login-button"
          onClick={() => flash("Explorer accounts are coming soon.")}
        >
          Login
        </button>

        <button
          type="button"
          className={`audio-toggle ${isAudioEnabled ? "is-on" : "is-off"}`}
          onClick={onToggleAudio}
          aria-pressed={isAudioEnabled}
          aria-label={isAudioEnabled ? "Turn audio off" : "Turn audio on"}
          title={isAudioEnabled ? "Audio: on" : "Audio: off"}
        >
          <Icon name={isAudioEnabled ? "volume-on" : "volume-off"} size={16} />
          <span className="audio-label">Audio: {isAudioEnabled ? "On" : "Off"}</span>
        </button>

        <div className="nav-menu-wrap">
          <button
            type="button"
            className={`icon-action${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => {
              setNotice(null);
              setMenuOpen((value) => !value);
            }}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={18} />
          </button>

          {menuOpen ? (
            <div className="nav-dropdown" role="menu" aria-label="More options">
              <button type="button" role="menuitem" onClick={openFromMenu}>
                FAQ
              </button>
              <button type="button" role="menuitem" onClick={openFromMenu}>
                Mission Briefing
              </button>
              <button type="button" role="menuitem" onClick={openFromMenu}>
                Help
              </button>
            </div>
          ) : null}
        </div>

        {notice ? (
          <p className="nav-notice" role="status">
            {notice}
          </p>
        ) : null}
      </div>
    </header>
  );
}

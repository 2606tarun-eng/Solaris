import { img } from "../assets";
import Icon from "./Icon";

type NavBarProps = {
  activeView: "map" | "tour" | "about";
  onOpenMap: () => void;
  onStartTour: () => void;
  onOpenAbout: () => void;
};

export default function NavBar({ activeView, onOpenMap, onStartTour, onOpenAbout }: NavBarProps) {
  return (
    <header className="nav-bar">
      <button type="button" className="brand" onClick={onOpenMap} aria-label="AstroRelics map">
        <span className="brand-logo">
          <img src={img.glowingPlanetLogo} alt="" />
        </span>
        <span className="brand-text">
          <strong>AstroRelics</strong>
          <small>Mission Atlas</small>
        </span>
      </button>

      <nav className="nav-links" aria-label="Main">
        <button
          type="button"
          className={activeView === "map" ? "is-active" : ""}
          onClick={onOpenMap}
        >
          <Icon name="planet" size={16} className="icon" /> Map
        </button>
        <button
          type="button"
          className={activeView === "tour" ? "is-active" : ""}
          onClick={onStartTour}
        >
          <Icon name="rocket" size={16} className="icon" /> Tour
        </button>
        <button type="button" onClick={onOpenAbout}>
          <Icon name="sparkle" size={16} className="icon" /> About
        </button>
      </nav>

      <button type="button" className="nav-cta" onClick={onStartTour}>
        Start the tour
        <span aria-hidden="true">→</span>
      </button>
    </header>
  );
}

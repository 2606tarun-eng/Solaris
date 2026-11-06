import { img } from "../assets";

export default function StatusBar() {
  return (
    <footer className="status-bar">
      <div className="status-credit">
        <img src={img.orbit} alt="" />
        <span>
          <strong>NASA SPACE APPS CHALLENGE</strong>
          <small>Built for curious explorers, ages 8–14</small>
        </span>
      </div>
      <p className="status-note">Distances are not to scale · Made for exploring, not measuring</p>
      <p className="status-live">
        <span className="live-dot" aria-hidden="true" />
        Data: NASA public archive
      </p>
    </footer>
  );
}

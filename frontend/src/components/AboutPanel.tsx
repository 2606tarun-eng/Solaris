import Icon from "./Icon";

type AboutPanelProps = {
  onClose: () => void;
  onStartTour: () => void;
};

export default function AboutPanel({ onClose, onStartTour }: AboutPanelProps) {
  return (
    <div className="about-backdrop" role="presentation" onPointerDown={onClose}>
      <div
        className="about-panel"
        role="dialog"
        aria-modal="true"
        aria-label="About Solaris"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="about-close"
          onClick={onClose}
          aria-label="Close about panel"
        >
          <Icon name="close" size={18} className="icon" />
        </button>

        <p className="about-kicker">NASA SPACE APPS CHALLENGE</p>
        <h2>Abandoned but not forgotten.</h2>
        <p className="about-lead">
          Solaris is a playful map of the solar system. Every glowing dot is a real spacecraft, and
          every planet hides a story about the machines we sent there.
        </p>

        <div className="about-grid">
          <section>
            <h3>How to explore</h3>
            <ul>
              <li>
                <strong>Tap a planet</strong> to fly to it and open its story.
              </li>
              <li>
                <strong>Drag and scroll</strong> to move around the map.
              </li>
              <li>
                <strong>Slide the time machine</strong> to see missions arrive year by year.
              </li>
            </ul>
          </section>
          <section>
            <h3>What the dots mean</h3>
            <ul>
              <li>
                <span className="mini-dot is-active" aria-hidden="true" />
                <strong>Green</strong> — still exploring.
              </li>
              <li>
                <span className="mini-dot is-retired" aria-hidden="true" />
                <strong>Orange</strong> — retired explorer.
              </li>
              <li>Retired dots also pulse more slowly, so the dots still differ without colour.</li>
            </ul>
          </section>
          <section>
            <h3>Made for curious kids</h3>
            <p>
              Solaris is built for explorers aged 8–14. Text is short on purpose, and every planet
              is one picture and one story at a time.
            </p>
          </section>
          <section>
            <h3>Where the data comes from</h3>
            <p>
              Mission stories and photos come from NASA&apos;s public-domain image library. Planet
              distances and sizes are not to scale — the map is made for exploring, not measuring.
            </p>
          </section>
        </div>

        <div className="about-actions">
          <button type="button" className="about-primary" onClick={onStartTour}>
            <Icon name="rocket" size={16} className="icon--glow" /> Start the 1-minute tour
          </button>
          <button type="button" onClick={onClose}>
            Keep exploring
          </button>
        </div>
      </div>
    </div>
  );
}

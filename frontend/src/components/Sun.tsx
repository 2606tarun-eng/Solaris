import { img } from "../assets";
import { solarFlares } from "../data/solarSystem";

const CENTER_X = 575;
const CENTER_Y = 570;

export default function Sun() {
  return (
    <div className="sun" aria-hidden="true">
      <div className="sun-glow">
        <img className="sun-halo" src={img.solarCore} alt="" />
        {solarFlares.map((flare, index) => (
          <img
            key={`flare-${index}`}
            className="sun-flare"
            src={flare.src}
            alt=""
            style={{
              left: flare.left - CENTER_X,
              top: flare.top - CENTER_Y,
              width: flare.size,
              height: flare.size,
              animationDelay: `${index * 0.35}s`,
            }}
          />
        ))}
      </div>
      <div className="sun-core">
        <img className="sun-heart" src={img.solarCore1} alt="" />
      </div>
      <span className="sun-label">SUN</span>
    </div>
  );
}

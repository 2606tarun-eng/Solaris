import Icon from "./Icon";

type CameraControlsProps = {
  speed: number;
  onSpeedChange: (speed: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

const speeds = [
  { value: 0.5, label: "Slow" },
  { value: 1, label: "Normal" },
  { value: 2, label: "Fast" },
];

export default function CameraControls({
  speed,
  onSpeedChange,
  onZoomIn,
  onZoomOut,
  onReset,
}: CameraControlsProps) {
  return (
    <div className="view-controls">
      <div className="speed-toggle" role="group" aria-label="Orbit speed">
        <span className="control-label">Orbit speed</span>
        <div className="segmented">
          {speeds.map((option) => (
            <button
              key={option.value}
              type="button"
              className={speed === option.value ? "is-active" : ""}
              onClick={() => onSpeedChange(option.value)}
              aria-pressed={speed === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="zoom-controls" role="group" aria-label="Map zoom">
        <button type="button" onClick={onZoomIn} aria-label="Zoom in">
          <Icon name="plus" size={16} />
        </button>
        <button type="button" onClick={onZoomOut} aria-label="Zoom out">
          <Icon name="minus" size={16} />
        </button>
        <button type="button" onClick={onReset} aria-label="Show the whole solar system">
          <Icon name="reset" size={16} />
        </button>
      </div>
    </div>
  );
}

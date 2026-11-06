import { useEffect, useRef, useState } from "react";
import { planets } from "../data/planets";
import { planetStories } from "../data/missions";
import { img } from "../assets";
import Icon from "./Icon";

type GuidedTourProps = {
  active: boolean;
  reducedMotion: boolean;
  onStepFocus: (id: string) => void;
  onExit: () => void;
};

type TourStep = {
  id: string;
  name: string;
  kicker: string;
  title: string;
  text: string;
  fact: string;
  image?: string;
};

const STEP_MS = 7200;

const sunStep: TourStep = {
  id: "sun",
  name: "The Sun",
  kicker: "Our star",
  title: "The Sun is the engine of everything.",
  text: "The Sun holds almost all of the mass in our solar system. Its light takes about 8 minutes to reach Earth.",
  fact: "The Sun is about 4.6 billion years old — a calm, middle-aged star.",
  image: img.planetSun,
};

function buildSteps(): TourStep[] {
  const planetSteps = planets.map((planet) => {
    const story = planetStories[planet.id];
    return {
      id: planet.id,
      name: planet.name,
      kicker: story?.nickname ?? planet.tagline,
      title: story?.headline ?? planet.tagline,
      text: story?.intro ?? "",
      fact: story?.funFact ?? "",
      image: planet.hero ?? planet.src,
    };
  });
  return [sunStep, ...planetSteps];
}

export default function GuidedTour({ active, reducedMotion, onStepFocus, onExit }: GuidedTourProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const steps = useRef(buildSteps()).current;
  const focusRef = useRef(onStepFocus);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  useEffect(() => {
    focusRef.current = onStepFocus;
  }, [onStepFocus]);

  useEffect(() => {
    if (!active) return;
    setIndex(0);
    setPaused(false);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    focusRef.current(steps[index].id);
  }, [active, index, steps]);

  useEffect(() => {
    if (!active || paused || reducedMotion || isLast) return;
    const timer = window.setTimeout(() => {
      setIndex((value) => Math.min(steps.length - 1, value + 1));
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [active, index, isLast, paused, reducedMotion, steps.length]);

  if (!active) return null;

  return (
    <div className="tour-card" role="dialog" aria-label="Guided tour">
      <div className="tour-media">
        {step.image ? (
          <img src={step.image} alt="" />
        ) : (
          <div className="tour-sun-visual">
            <span />
          </div>
        )}
        <span className="tour-step-chip">
          Step {index + 1} of {steps.length}
        </span>
      </div>

      <div className="tour-copy">
        <p className="tour-kicker">{step.kicker}</p>
        <h3>{step.title}</h3>
        <p>{step.text}</p>
        <p className="tour-fact">
          <Icon name="sparkle" size={13} className="icon" aria-hidden="true" /> {step.fact}
        </p>
      </div>

      <div className="tour-controls">
        <div className="tour-progress" aria-hidden="true">
          {steps.map((item, position) => (
            <span key={item.id} className={position <= index ? "is-done" : ""} />
          ))}
        </div>
        <div className="tour-buttons">
          <button
            type="button"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
          >
            ← Back
          </button>
          <button type="button" onClick={() => setPaused((value) => !value)}>
            {paused || reducedMotion ? "▶ Play" : "⏸ Pause"}
          </button>
          {isLast ? (
            <button type="button" className="tour-primary" onClick={onExit}>
              Finish tour
            </button>
          ) : (
            <button
              type="button"
              className="tour-primary"
              onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))}
            >
              Next →
            </button>
          )}
          <button type="button" className="tour-exit" onClick={onExit} aria-label="Exit tour">
            <Icon name="close" size={16} className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

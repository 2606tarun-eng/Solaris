import { useState } from "react";
import { KID_PLANET_FACTS } from "../lib/kidFacts";
import { playPop } from "../lib/kidAudio";

export default function KidPlanetLab({
  planetId,
  audioEnabled,
}: {
  planetId: string;
  audioEnabled: boolean;
}) {
  const fact = KID_PLANET_FACTS[planetId] ?? KID_PLANET_FACTS.mars;
  const [earthAge, setEarthAge] = useState<number>(10);
  const [earthWeight, setEarthWeight] = useState<number>(70);

  const planetAge = ((earthAge * 365.25) / fact.yearInEarthDays).toFixed(1);
  const planetWeight = Math.round(earthWeight * fact.gravityMultiplier);

  const handleAgeChange = (val: number) => {
    if (audioEnabled) playPop();
    setEarthAge(Math.max(1, Math.min(100, val)));
  };

  const handleWeightChange = (val: number) => {
    if (audioEnabled) playPop();
    setEarthWeight(Math.max(20, Math.min(300, val)));
  };

  return (
    <div className="kid-planet-lab">
      <div className="kid-lab-banner">
        <span className="kid-lab-emoji">{fact.emoji}</span>
        <div>
          <h4>{fact.funNickname}</h4>
          <p>{fact.superpower}</p>
        </div>
      </div>

      {/* Mind-blowing analogy box */}
      <div className="kid-analogy-box">
        <span className="kid-analogy-tag">🍕 MIND-BLOWING FACT</span>
        <p>{fact.kidAnalogy}</p>
      </div>

      {/* Interactive Space Calculators */}
      <div className="kid-calculators-grid">
        {/* Space Age */}
        <div className="kid-calc-card">
          <div className="kid-calc-head">
            <span>🎂 Your Space Age</span>
            <div className="kid-stepper">
              <button
                type="button"
                onClick={() => handleAgeChange(earthAge - 1)}
                aria-label="Decrease age"
              >
                -
              </button>
              <strong>{earthAge} yrs</strong>
              <button
                type="button"
                onClick={() => handleAgeChange(earthAge + 1)}
                aria-label="Increase age"
              >
                +
              </button>
            </div>
          </div>
          <div className="kid-calc-result">
            <span className="kid-calc-number">{planetAge}</span>
            <span className="kid-calc-unit">years old here!</span>
          </div>
          <p className="kid-calc-note">
            {Number(planetAge) > earthAge
              ? `🏃 You've celebrated ${planetAge} birthdays on this fast world!`
              : `⏳ One year here takes forever—you're just ${planetAge} years old!`}
          </p>
        </div>

        {/* Space Weight */}
        <div className="kid-calc-card">
          <div className="kid-calc-head">
            <span>⚖️ Superhero Weight</span>
            <div className="kid-stepper">
              <button
                type="button"
                onClick={() => handleWeightChange(earthWeight - 5)}
                aria-label="Decrease weight"
              >
                -
              </button>
              <strong>{earthWeight} lbs</strong>
              <button
                type="button"
                onClick={() => handleWeightChange(earthWeight + 5)}
                aria-label="Increase weight"
              >
                +
              </button>
            </div>
          </div>
          <div className="kid-calc-result">
            <span className="kid-calc-number">{planetWeight}</span>
            <span className="kid-calc-unit">lbs on this world!</span>
          </div>
          <p className="kid-calc-note">
            {fact.gravityMultiplier < 0.6
              ? "🦘 Low gravity! You can leap high into the sky!"
              : fact.gravityMultiplier > 1.5
              ? "🏋️ Heavy gravity! You feel super heavy like an elephant!"
              : "✨ Feels pretty close to home on Earth!"}
          </p>
        </div>
      </div>

      {/* Did You Know Cards */}
      <div className="kid-trivia-section">
        <span className="kid-trivia-title">⚡ Amazing Secrets of {fact.funNickname}:</span>
        <ul className="kid-trivia-list">
          {fact.didYouKnow.map((item, idx) => (
            <li key={idx}>
              <span className="kid-bullet">⭐</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

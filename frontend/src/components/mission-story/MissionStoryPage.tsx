import { useEffect, useMemo, useState } from "react";
import AboutPanel from "../AboutPanel";
import NavBar from "../NavBar";
import StarfieldCanvas from "../StarfieldCanvas";
import usePerformanceTier from "../../hooks/usePerformanceTier";
import useReducedMotion from "../../hooks/useReducedMotion";
import { atlasPath, go, handlePlainClick, missionPath } from "../../lib/missionRoute";
import { getMissionStory } from "../../data/missionStories";
import MissionStorySidebar from "./MissionStorySidebar";
import MissionStoryTabs from "./MissionStoryTabs";
import "./missionStory.css";

/**
 * Page 4 — Mission Story.
 *
 * Opens from a mission on page 3 (`/mission/:id`). The whole page is driven by
 * one `MissionProfile`, so adding a mission is a data change, never a layout
 * change. Shared chrome (NavBar, starfield, About panel) is reused as-is.
 */

const SUGGESTIONS = [
  { id: "maven", label: "MAVEN", where: "Mars" },
  { id: "cassini", label: "Cassini", where: "Saturn" },
];

export default function MissionStoryPage({ missionId }: { missionId: string }) {
  const reducedMotion = useReducedMotion();
  const tier = usePerformanceTier();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const profile = useMemo(() => getMissionStory(missionId), [missionId]);

  useEffect(() => {
    document.title = profile
      ? `${profile.name} — Mission Story | Solaris`
      : "Mission not found | Solaris";
  }, [profile]);

  // Escape closes About, matching pages 2–3.
  useEffect(() => {
    if (!aboutOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAboutOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen]);

  const backToAtlas = () => go(atlasPath());

  return (
    <div className="ms-page">
      <StarfieldCanvas tier={tier} reducedMotion={reducedMotion} />

      <NavBar
        activeView="map"
        onOpenMap={backToAtlas}
        onStartTour={backToAtlas}
        onOpenAbout={() => setAboutOpen(true)}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled((value) => !value)}
      />

      <main className="ms-main">
        {profile ? (
          <div className="ms-shell">
            <MissionStorySidebar profile={profile} />
            <MissionStoryTabs key={profile.id} profile={profile} reducedMotion={reducedMotion} />
          </div>
        ) : (
          <div className="ms-empty">
            <p className="ms-empty-kicker">Mission not found</p>
            <h1>That mission is not in the atlas yet.</h1>
            <p className="ms-empty-lead">
              The link may be mistyped, or this spacecraft has not been written up. Every mission
              listed on a planet page has a story here.
            </p>

            <a
              className="ms-empty-cta"
              href={atlasPath()}
              onClick={(event) => handlePlainClick(event, atlasPath())}
            >
              Back to Missions
            </a>

            <div className="ms-empty-suggest">
              <p>Start with one of these:</p>
              <ul>
                {SUGGESTIONS.map((item) => {
                  const href = missionPath(item.id);
                  return (
                    <li key={item.id}>
                      <a href={href} onClick={(event) => handlePlainClick(event, href)}>
                        <strong>{item.label}</strong>
                        <span>{item.where}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </main>

      {aboutOpen ? (
        <AboutPanel onClose={() => setAboutOpen(false)} onStartTour={backToAtlas} />
      ) : null}
    </div>
  );
}

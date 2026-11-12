import { useRef, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import Highlight from "./Highlight";
import type { MissionProfile } from "../../data/missionStories";

const EASE_SOFT: [number, number, number, number] = [0.22, 0.9, 0.3, 1];

/** Small inline book glyph — the icon set is closed, so page 4 brings its own. */
function BookIcon() {
  return (
    <svg
      className="ms-book"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
      <path d="M4 18.5V5.5" />
      <path d="M8 7h7M8 11h5" />
    </svg>
  );
}

/**
 * The story card: chapter title, its question, the five tabs, and the chapter
 * body. Tabs follow the WAI-ARIA tabs pattern with roving tabindex and
 * arrow-key navigation; the body cross-fades on change without collapsing the
 * card's height.
 */
export default function MissionStoryTabs({
  profile,
  reducedMotion,
}: {
  profile: MissionProfile;
  reducedMotion: boolean;
}) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const chapters = profile.chapters;
  const chapter = chapters[active];
  const duration = reducedMotion ? 0 : 0.26;

  const select = (index: number, moveFocus = false) => {
    const next = (index + chapters.length) % chapters.length;
    setActive(next);

    const button = tabRefs.current[next];
    if (moveFocus) button?.focus();
    // Keep the selected tab visible inside the horizontally scrollable strip.
    button?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        select(index + 1, true);
        break;
      case "ArrowLeft":
        event.preventDefault();
        select(index - 1, true);
        break;
      case "Home":
        event.preventDefault();
        select(0, true);
        break;
      case "End":
        event.preventDefault();
        select(chapters.length - 1, true);
        break;
      default:
        break;
    }
  };

  return (
    <section className="ms-card" aria-label={`${profile.name} mission story`}>
      <header className="ms-card-head">
        <p className="ms-eyebrow">
          <BookIcon />
          <span>Mission Story</span>
        </p>

        <motion.div
          key={`${profile.id}-${chapter.id}-head`}
          className="ms-headline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: EASE_SOFT }}
        >
          <h2 className="ms-title">{chapter.title}</h2>
          <p className="ms-question">{chapter.question}</p>
        </motion.div>
      </header>

      <div className="ms-tabs" role="tablist" aria-label="Mission story chapters">
        {chapters.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`ms-tab-${item.id}`}
              aria-selected={selected}
              aria-controls="ms-panel"
              tabIndex={selected ? 0 : -1}
              className={`ms-tab${selected ? " is-active" : ""}`}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              onClick={() => select(index)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              <span className="ms-tab-num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}.
              </span>
              <span className="ms-tab-label">{item.tab}</span>
            </button>
          );
        })}
      </div>

      <div
        className="ms-panel"
        role="tabpanel"
        id="ms-panel"
        aria-labelledby={`ms-tab-${chapter.id}`}
        tabIndex={0}
      >
        <motion.div
          key={`${profile.id}-${chapter.id}`}
          className="ms-chapter"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease: EASE_SOFT }}
        >
          <div className="ms-story-grid">
            <figure className="ms-figure">
              <img src={chapter.image} alt={chapter.imageAlt} loading="lazy" draggable={false} />
              <figcaption>{chapter.caption}</figcaption>
            </figure>

            <div className="ms-prose">
              {chapter.paragraphs.map((paragraph, index) => (
                <p key={index}>
                  <Highlight text={paragraph} keywords={chapter.keywords} />
                </p>
              ))}
            </div>
          </div>

          <div className="ms-rule" aria-hidden="true" />

          <p className="ms-chapter-meta">
            <span>
              Chapter {String(active + 1).padStart(2, "0")} /{" "}
              {String(chapters.length).padStart(2, "0")}
            </span>
            <span className="ms-chapter-where">
              {profile.name} · {profile.planetName}
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

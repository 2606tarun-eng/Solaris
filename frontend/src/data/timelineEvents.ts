export type TimelineEventKind = "launch" | "arrival" | "milestone" | "end";

export type TimelineEvent = {
  year: number;
  title: string;
  kind: TimelineEventKind;
  planetId?: string;
  detail: string;
};

export const TIMELINE_START = 1957;
export const TIMELINE_END = new Date().getFullYear();

/** A short, true history of exploring the solar system. */
export const timelineEvents: TimelineEvent[] = [
  {
    year: 1957,
    title: "Sputnik 1",
    kind: "launch",
    detail: "A small beeping sphere starts the Space Age.",
  },
  {
    year: 1958,
    title: "Explorer 1",
    kind: "launch",
    planetId: "earth",
    detail: "The first US satellite discovers Earth's radiation belts.",
  },
  {
    year: 1959,
    title: "Luna 2",
    kind: "arrival",
    detail: "The first human-made object reaches the Moon.",
  },
  {
    year: 1962,
    title: "Mariner 2",
    kind: "arrival",
    planetId: "venus",
    detail: "The first spacecraft to fly past another planet.",
  },
  {
    year: 1965,
    title: "Mariner 4",
    kind: "arrival",
    planetId: "mars",
    detail: "The first close-up photos of Mars show a cratered world.",
  },
  {
    year: 1969,
    title: "Apollo 11",
    kind: "milestone",
    detail: "Humans walk on the Moon for the first time.",
  },
  {
    year: 1973,
    title: "Mariner 10",
    kind: "launch",
    planetId: "mercury",
    detail: "A spacecraft sets off to visit Mercury for the first time.",
  },
  {
    year: 1975,
    title: "Viking 1",
    kind: "arrival",
    planetId: "mars",
    detail: "The first lander sends pictures from the surface of Mars.",
  },
  {
    year: 1977,
    title: "Voyager 1 & 2",
    kind: "launch",
    planetId: "jupiter",
    detail: "Twin explorers begin the Grand Tour of the outer planets.",
  },
  {
    year: 1979,
    title: "Voyager 1 at Jupiter",
    kind: "arrival",
    planetId: "jupiter",
    detail: "Io's volcanoes are caught erupting for the first time.",
  },
  {
    year: 1980,
    title: "Voyager 1 at Saturn",
    kind: "arrival",
    planetId: "saturn",
    detail: "The rings are revealed as thousands of icy lanes.",
  },
  {
    year: 1984,
    title: "Landsat 5",
    kind: "launch",
    planetId: "earth",
    detail: "A satellite begins 29 years of watching our home world.",
  },
  {
    year: 1986,
    title: "Voyager 2 at Uranus",
    kind: "arrival",
    planetId: "uranus",
    detail: "The only visit ever made to Uranus finds new moons and rings.",
  },
  {
    year: 1989,
    title: "Magellan at Venus",
    kind: "arrival",
    planetId: "venus",
    detail: "Radar starts mapping Venus through its thick clouds.",
  },
  {
    year: 1989,
    title: "Voyager 2 at Neptune",
    kind: "arrival",
    planetId: "neptune",
    detail: "The last planet is visited, and Triton shows icy geysers.",
  },
  {
    year: 1990,
    title: "Hubble Space Telescope",
    kind: "launch",
    planetId: "earth",
    detail: "A giant eye in orbit begins sending home deep-space pictures.",
  },
  {
    year: 1995,
    title: "Galileo at Jupiter",
    kind: "arrival",
    planetId: "jupiter",
    detail: "The first spacecraft to orbit Jupiter drops a probe into its clouds.",
  },
  {
    year: 1997,
    title: "Cassini launches",
    kind: "launch",
    planetId: "saturn",
    detail: "A spacecraft begins a seven-year journey to Saturn.",
  },
  {
    year: 2003,
    title: "Opportunity launches",
    kind: "launch",
    planetId: "mars",
    detail: "A rover built for 90 days heads for the red planet.",
  },
  {
    year: 2004,
    title: "Opportunity lands",
    kind: "arrival",
    planetId: "mars",
    detail: "The rover bounces to a stop and starts exploring Mars.",
  },
  {
    year: 2004,
    title: "Cassini arrives at Saturn",
    kind: "arrival",
    planetId: "saturn",
    detail: "Cassini begins 13 years of weaving between the rings.",
  },
  {
    year: 2011,
    title: "Juno launches",
    kind: "launch",
    planetId: "jupiter",
    detail: "A solar-powered spacecraft heads out to study Jupiter's heart.",
  },
  {
    year: 2012,
    title: "Curiosity lands",
    kind: "arrival",
    planetId: "mars",
    detail: "A car-sized rover lands in a giant Martian crater.",
  },
  {
    year: 2015,
    title: "MESSENGER says goodbye",
    kind: "end",
    planetId: "mercury",
    detail: "After 4 years at Mercury, the orbiter runs out of fuel.",
  },
  {
    year: 2017,
    title: "Cassini's Grand Finale",
    kind: "end",
    planetId: "saturn",
    detail: "Cassini dives into Saturn, sending data until the very end.",
  },
  {
    year: 2018,
    title: "BepiColombo launches",
    kind: "launch",
    planetId: "mercury",
    detail: "Europe and Japan send a new pair of spacecraft to Mercury.",
  },
  {
    year: 2021,
    title: "Perseverance lands",
    kind: "arrival",
    planetId: "mars",
    detail: "A new rover begins collecting rock samples for a future return.",
  },
  {
    year: 2024,
    title: "Europa Clipper launches",
    kind: "launch",
    planetId: "jupiter",
    detail: "A new mission sets off to study the ocean moon Europa.",
  },
];

export function eventsForYear(year: number) {
  return timelineEvents.filter((event) => event.year === year);
}

export function planetsForYear(year: number) {
  const ids = new Set<string>();
  for (const event of eventsForYear(year)) {
    if (event.planetId) ids.add(event.planetId);
  }
  return ids;
}

export function nearestEvents(year: number, limit = 3) {
  return [...timelineEvents]
    .sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year))
    .slice(0, limit);
}

import { generatedTimelineEvents } from "./nasaCatalog";

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

/**
 * A real, sourced history of exploring the solar system (1957 â†’ now).
 * Covers missions and worlds tracked by this atlas (NASA/JPL/ESA/JAXA and
 * partners). Sources: NASA mission pages (science.nasa.gov), NASA History, and
 * NASA/JPL press releases.
 */
export const curatedTimeline: TimelineEvent[] = [
  {
    year: 1957,
    title: "Sputnik 1",
    kind: "launch",
    planetId: "earth",
    detail:
      "The first artificial satellite orbits Earth and begins the Space Age (USSR, 4 Oct 1957).",
  },
  {
    year: 1958,
    title: "Explorer 1",
    kind: "launch",
    planetId: "earth",
    detail:
      "America's first satellite discovers Earth's radiation belts, later named the Van Allen belts.",
  },
  {
    year: 1959,
    title: "Luna 2",
    kind: "arrival",
    detail:
      "The first human-made object reaches another world, impacting the Moon on 13 September 1959.",
  },
  {
    year: 1962,
    title: "Mariner 2 flies by Venus",
    kind: "arrival",
    planetId: "venus",
    detail:
      "The first successful planetary encounter confirms Venus is extremely hot under its clouds.",
  },
  {
    year: 1965,
    title: "Mariner 4 flies by Mars",
    kind: "arrival",
    planetId: "mars",
    detail:
      "The first close-up photos of another planet show a cratered, Moon-like Mars.",
  },
  {
    year: 1969,
    title: "Apollo 11",
    kind: "milestone",
    detail:
      "Humans walk on the Moon for the first time as Neil Armstrong and Buzz Aldrin land in Mare Tranquillitatis.",
  },
  {
    year: 1973,
    title: "Mariner 10 launches",
    kind: "launch",
    planetId: "mercury",
    detail:
      "NASA launches the first mission to use a gravity assist, aiming for Venus and Mercury.",
  },
  {
    year: 1973,
    title: "Pioneer 11 launches",
    kind: "launch",
    planetId: "jupiter",
    detail:
      "Pioneer 11 begins a journey that will take it past Jupiter and on to the first Saturn encounter.",
  },
  {
    year: 1974,
    title: "Mariner 10 at Mercury",
    kind: "arrival",
    planetId: "mercury",
    detail:
      "Mariner 10 makes the first flyby of Mercury, revealing a heavily cratered world (29 Mar 1974).",
  },
  {
    year: 1975,
    title: "Viking 1 lands on Mars",
    kind: "arrival",
    planetId: "mars",
    detail:
      "Viking 1 returns the first clear images from the surface of Mars and begins long-lived experiments.",
  },
  {
    year: 1977,
    title: "Voyager 2 launches",
    kind: "launch",
    planetId: "jupiter",
    detail:
      "Voyager 2 lifts off on 20 August 1977 to begin the Grand Tour of the outer planets.",
  },
  {
    year: 1977,
    title: "Voyager 1 launches",
    kind: "launch",
    planetId: "jupiter",
    detail:
      "Voyager 1 launches on 5 September 1977 on a faster path to Jupiter and Saturn.",
  },
  {
    year: 1979,
    title: "Pioneer 11 at Saturn",
    kind: "arrival",
    planetId: "saturn",
    detail:
      "Pioneer 11 becomes the first spacecraft to reach Saturn, threading the ring plane and discovering the F ring.",
  },
  {
    year: 1979,
    title: "Voyager 1 at Jupiter",
    kind: "arrival",
    planetId: "jupiter",
    detail:
      "Voyager 1 reveals active volcanoes on Io and captures the first detailed views of Jupiter's moons.",
  },
  {
    year: 1979,
    title: "Voyager 2 at Jupiter",
    kind: "arrival",
    planetId: "jupiter",
    detail:
      "Voyager 2 studies Jupiter's Great Red Spot and gathers close-up data on Europa and Ganymede.",
  },
  {
    year: 1980,
    title: "Voyager 1 at Saturn",
    kind: "arrival",
    planetId: "saturn",
    detail:
      "Voyager 1 images Saturn's complex rings and studies Titan's thick atmosphere during its November flyby.",
  },
  {
    year: 1981,
    title: "Voyager 2 at Saturn",
    kind: "arrival",
    planetId: "saturn",
    detail:
      "Voyager 2 completes a close Saturn flyby, refining measurements of the rings and moons.",
  },
  {
    year: 1984,
    title: "Landsat 5 launches",
    kind: "launch",
    planetId: "earth",
    detail:
      "NASA and USGS launch Landsat 5 to monitor Earth's land surface; it operates for a record 29 years.",
  },
  {
    year: 1986,
    title: "Voyager 2 at Uranus",
    kind: "arrival",
    planetId: "uranus",
    detail:
      "Voyager 2 makes humanity's only visit to Uranus, discovering 10 moons and two new rings.",
  },
  {
    year: 1989,
    title: "Magellan launches to Venus",
    kind: "launch",
    planetId: "venus",
    detail:
      "Deployed from Space Shuttle Atlantis (STS-30), Magellan heads to map Venus with radar.",
  },
  {
    year: 1989,
    title: "Galileo launches to Jupiter",
    kind: "launch",
    planetId: "jupiter",
    detail:
      "Deployed from Space Shuttle Atlantis (STS-34), Galileo begins a six-year journey to orbit Jupiter.",
  },
  {
    year: 1989,
    title: "Voyager 2 at Neptune",
    kind: "arrival",
    planetId: "neptune",
    detail:
      "Voyager 2 completes the Grand Tour with the only Neptune flyby, revealing the Great Dark Spot and geysers on Triton.",
  },
  {
    year: 1990,
    title: "Magellan arrives at Venus",
    kind: "arrival",
    planetId: "venus",
    detail:
      "Magellan enters orbit and begins radar mapping nearly the entire surface through Venus's clouds.",
  },
  {
    year: 1990,
    title: "Hubble Space Telescope launches",
    kind: "launch",
    planetId: "earth",
    detail:
      "Deployed from Space Shuttle Discovery (STS-31), Hubble opens a new era of space-based astronomy.",
  },
  {
    year: 1994,
    title: "Magellan mission ends",
    kind: "end",
    planetId: "venus",
    detail:
      "After mapping 98% of Venus, Magellan is commanded into the atmosphere to gather final data.",
  },
  {
    year: 1995,
    title: "Galileo arrives at Jupiter",
    kind: "arrival",
    planetId: "jupiter",
    detail:
      "Galileo becomes the first spacecraft to orbit Jupiter and releases a probe into its atmosphere.",
  },
  {
    year: 1997,
    title: "Cassiniâ€“Huygens launches",
    kind: "launch",
    planetId: "saturn",
    detail:
      "NASA, ESA, and ASI launch Cassiniâ€“Huygens on a seven-year journey to Saturn and Titan.",
  },
  {
    year: 1998,
    title: "International Space Station assembly begins",
    kind: "launch",
    planetId: "earth",
    detail:
      "The first ISS modules are launched, starting continuous human presence in low Earth orbit.",
  },
  {
    year: 2003,
    title: "Opportunity launches to Mars",
    kind: "launch",
    planetId: "mars",
    detail:
      "NASA launches the MER-B rover Opportunity on a Delta II toward Meridiani Planum.",
  },
  {
    year: 2003,
    title: "Galileo mission ends at Jupiter",
    kind: "end",
    planetId: "jupiter",
    detail:
      "Galileo is intentionally plunged into Jupiter to protect Europa's subsurface ocean from contamination.",
  },
  {
    year: 2004,
    title: "Opportunity lands on Mars",
    kind: "arrival",
    planetId: "mars",
    detail:
      "Opportunity lands in Meridiani Planum and soon finds strong evidence of ancient liquid water.",
  },
  {
    year: 2004,
    title: "Cassini arrives at Saturn",
    kind: "arrival",
    planetId: "saturn",
    detail:
      "Cassini enters orbit around Saturn on 1 July 2004, beginning a 13-year exploration of the system.",
  },
  {
    year: 2004,
    title: "MESSENGER launches to Mercury",
    kind: "launch",
    planetId: "mercury",
    detail:
      "NASA launches MESSENGER, the first mission designed to orbit Mercury.",
  },
  {
    year: 2005,
    title: "Huygens lands on Titan",
    kind: "arrival",
    planetId: "saturn",
    detail:
      "ESA's Huygens probe descends through Titan's haze and touches down, returning the first surface images from the outer solar system.",
  },
  {
    year: 2005,
    title: "Venus Express launches",
    kind: "launch",
    planetId: "venus",
    detail:
      "ESA launches Venus Express to study the planet's atmosphere, climate, and surface interactions.",
  },
  {
    year: 2006,
    title: "Venus Express arrives at Venus",
    kind: "arrival",
    planetId: "venus",
    detail:
      "Venus Express enters orbit and begins long-term observations of Venus's dynamic atmosphere.",
  },
  {
    year: 2010,
    title: "Akatsuki launches to Venus",
    kind: "launch",
    planetId: "venus",
    detail:
      "JAXA launches Akatsuki (Venus Climate Orbiter) to study Venusian weather and atmospheric super-rotation.",
  },
  {
    year: 2011,
    title: "MESSENGER enters Mercury orbit",
    kind: "arrival",
    planetId: "mercury",
    detail:
      "MESSENGER becomes the first spacecraft to orbit Mercury, beginning a four-year mapping mission.",
  },
  {
    year: 2011,
    title: "Juno launches to Jupiter",
    kind: "launch",
    planetId: "jupiter",
    detail:
      "NASA launches the solar-powered Juno spacecraft to study Jupiter's origin, interior, and magnetosphere.",
  },
  {
    year: 2011,
    title: "Curiosity launches to Mars",
    kind: "launch",
    planetId: "mars",
    detail:
      "NASA launches the Mars Science Laboratory rover Curiosity to investigate habitability in Gale Crater.",
  },
  {
    year: 2012,
    title: "Curiosity lands on Mars",
    kind: "arrival",
    planetId: "mars",
    detail:
      "Curiosity touches down in Gale Crater on 5 August 2012 using the sky-crane landing system.",
  },
  {
    year: 2013,
    title: "MAVEN launches to Mars",
    kind: "launch",
    planetId: "mars",
    detail:
      "NASA launches MAVEN to study the upper atmosphere and how Mars lost much of its air and water.",
  },
  {
    year: 2013,
    title: "Landsat 5 mission ends",
    kind: "end",
    planetId: "earth",
    detail:
      "After 29 years and over 2.5 million images, USGS decommissions Landsat 5, a record-setting Earth observer.",
  },
  {
    year: 2014,
    title: "MAVEN arrives at Mars",
    kind: "arrival",
    planetId: "mars",
    detail:
      "MAVEN enters Mars orbit on 21 September 2014 to begin studying atmospheric escape.",
  },
  {
    year: 2014,
    title: "Venus Express mission ends",
    kind: "end",
    planetId: "venus",
    detail:
      "After eight years in orbit, ESA's Venus Express exhausts fuel and concludes its mission.",
  },
  {
    year: 2015,
    title: "Akatsuki enters Venus orbit",
    kind: "arrival",
    planetId: "venus",
    detail:
      "After a 2010 insertion failure, JAXA's Akatsuki successfully enters orbit and begins climate studies.",
  },
  {
    year: 2015,
    title: "MESSENGER impacts Mercury",
    kind: "end",
    planetId: "mercury",
    detail:
      "Out of fuel after more than four years in orbit, MESSENGER impacts Mercury's surface on 30 April 2015.",
  },
  {
    year: 2015,
    title: "New Horizons flies by Pluto",
    kind: "milestone",
    detail:
      "NASA's New Horizons completes the first reconnaissance of Pluto and its moons in the Kuiper Belt.",
  },
  {
    year: 2016,
    title: "Juno arrives at Jupiter",
    kind: "arrival",
    planetId: "jupiter",
    detail:
      "Juno enters polar orbit around Jupiter on 4 July 2016 to probe beneath the cloud tops.",
  },
  {
    year: 2017,
    title: "Cassini Grand Finale",
    kind: "end",
    planetId: "saturn",
    detail:
      "Cassini performs 22 dives between Saturn and its rings, then plunges into the planet on 15 September 2017.",
  },
  {
    year: 2018,
    title: "Opportunity mission ends",
    kind: "end",
    planetId: "mars",
    detail:
      "After a global dust storm and 5,111 sols on Mars, NASA declares the Opportunity rover's mission complete.",
  },
  {
    year: 2018,
    title: "InSight launches to Mars",
    kind: "launch",
    planetId: "mars",
    detail:
      "NASA launches InSight to study Marsquakes and the deep interior of the Red Planet.",
  },
  {
    year: 2018,
    title: "BepiColombo launches to Mercury",
    kind: "launch",
    planetId: "mercury",
    detail:
      "ESA and JAXA launch BepiColombo, a dual-orbiter mission that will study Mercury's surface and magnetosphere.",
  },
  {
    year: 2018,
    title: "InSight lands on Mars",
    kind: "arrival",
    planetId: "mars",
    detail:
      "InSight lands in Elysium Planitia on 26 November 2018 and later places the first seismometer on Mars.",
  },
  {
    year: 2020,
    title: "Perseverance launches to Mars",
    kind: "launch",
    planetId: "mars",
    detail:
      "NASA launches the Perseverance rover and Ingenuity helicopter to seek signs of ancient life in Jezero Crater.",
  },
  {
    year: 2021,
    title: "Perseverance lands on Mars",
    kind: "arrival",
    planetId: "mars",
    detail:
      "Perseverance lands in Jezero Crater on 18 February 2021 and deploys Ingenuity, the first aircraft on another world.",
  },
  {
    year: 2021,
    title: "Landsat 9 launches",
    kind: "launch",
    planetId: "earth",
    detail:
      "NASA and USGS launch Landsat 9 to continue the 50-year record of observing Earth's changing surface.",
  },
  {
    year: 2021,
    title: "James Webb Space Telescope launches",
    kind: "launch",
    planetId: "earth",
    detail:
      "NASA, ESA, and CSA launch JWST on 25 December 2021 to observe the universe in infrared light.",
  },
  {
    year: 2022,
    title: "InSight mission ends",
    kind: "end",
    planetId: "mars",
    detail:
      "After detecting more than 1,300 marsquakes, InSight loses power as dust covers its solar panels.",
  },
  {
    year: 2023,
    title: "OSIRIS-REx returns asteroid samples",
    kind: "milestone",
    detail:
      "NASA's OSIRIS-REx delivers samples from asteroid Bennu to Earth on 24 September 2023.",
  },
  {
    year: 2024,
    title: "Europa Clipper launches",
    kind: "launch",
    planetId: "jupiter",
    detail:
      "NASA launches Europa Clipper on 14 October 2024 to investigate whether Jupiter's moon Europa can support life.",
  },
  {
    year: 2025,
    title: "BepiColombo Mercury flybys continue",
    kind: "milestone",
    planetId: "mercury",
    detail:
      "BepiColombo completes a series of gravity-assist flybys on its way to enter Mercury orbit in late 2026.",
  },
  {
    year: 2026,
    title: "BepiColombo arrives at Mercury",
    kind: "arrival",
    planetId: "mercury",
    detail:
      "ESA and JAXA's BepiColombo is scheduled to enter orbit around Mercury in late 2026 for its science mission.",
  },
  {
    year: 2026,
    title: "Artemis II lunar flyby",
    kind: "milestone",
    detail:
      "NASA's Artemis II mission sends astronauts around the Moon, the first crewed deep-space flight since Apollo 17.",
  },
];

/**
 * The timeline the app renders: curated story beats first, then real launch
 * records from the NASA mission catalog. Generated launches never replace a
 * hand-written entry for the same year, so the narrative keeps its voice.
 */
export const timelineEvents: TimelineEvent[] = [
  ...curatedTimeline,
  ...generatedTimelineEvents(2),
].sort((a, b) => a.year - b.year);

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

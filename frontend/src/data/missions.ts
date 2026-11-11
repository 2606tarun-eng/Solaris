import { img } from "../assets";

export type ProjectStatus = "active" | "retired";

export type MissionStat = {
  label: string;
  value: string;
};

export type Mission = {
  id: string;
  planetId: string;
  name: string;
  agency: string;
  status: ProjectStatus;
  launched: number;
  ended?: number;
  headline: string;
  summary: string;
  funFact: string;
  stats: MissionStat[];
  image: string;
  nasaUrl: string;
};

export type PlanetStory = {
  planetId: string;
  nickname: string;
  headline: string;
  intro: string;
  funFact: string;
};

/** Short, picture-first stories for every world in the atlas. */
export const planetStories: Record<string, PlanetStory> = {
  mercury: {
    planetId: "mercury",
    nickname: "The swift messenger",
    headline: "The first world we visited — then left alone.",
    intro:
      "Mercury is the closest planet to the Sun. It races all the way around in just 88 Earth days.",
    funFact: "One Mercury day is longer than one Mercury year. A single sunrise takes 176 Earth days!",
  },
  venus: {
    planetId: "venus",
    nickname: "The hidden world",
    headline: "A golden world under thick clouds.",
    intro:
      "Venus is almost the same size as Earth, but its air is hot enough to melt lead. Its clouds hide the ground beneath.",
    funFact: "Venus spins backwards. On Venus, the Sun rises in the west.",
  },
  earth: {
    planetId: "earth",
    nickname: "Our home world",
    headline: "The only planet we know with life.",
    intro:
      "Earth is our blue and green home. Oceans cover most of it, and a blanket of air keeps us warm.",
    funFact: "About 71 out of every 100 parts of Earth are covered in water.",
  },
  mars: {
    planetId: "mars",
    nickname: "The rover playground",
    headline: "The red desert full of robot explorers.",
    intro:
      "Mars is a cold desert world with rusty dust. It has the tallest volcano and the deepest canyon in the solar system.",
    funFact: "Sunsets on Mars are blue, not red.",
  },
  jupiter: {
    planetId: "jupiter",
    nickname: "The giant storm",
    headline: "So big, every other planet could fit inside.",
    intro:
      "Jupiter is a giant ball of gas with swirling stripes. Its Great Red Spot is a storm wider than Earth.",
    funFact: "The Great Red Spot has been spinning for nearly 200 years.",
  },
  saturn: {
    planetId: "saturn",
    nickname: "The ringed beauty",
    headline: "The jewel of the solar system.",
    intro:
      "Saturn is famous for its bright rings. They are made of billions of pieces of ice and rock, some as small as grains of sand.",
    funFact: "Saturn is lighter than water. It would float in a giant bathtub!",
  },
  uranus: {
    planetId: "uranus",
    nickname: "The sideways planet",
    headline: "The planet that rolls on its side.",
    intro:
      "Uranus is an icy blue world that spins almost sideways. Its seasons last about 21 Earth years each.",
    funFact: "Uranus is the coldest planet, dipping to about -224°C.",
  },
  neptune: {
    planetId: "neptune",
    nickname: "The windy blue world",
    headline: "The windy edge of our solar system.",
    intro:
      "Neptune is a deep blue giant about 30 times farther from the Sun than Earth. It is the windiest planet we know.",
    funFact: "Winds on Neptune can blast at 2,100 km per hour.",
  },
};

/** One featured story per planet. Status drives the neon dot colours. */
export const missions: Mission[] = [
  {
    id: "mariner-10",
    planetId: "mercury",
    name: "Mariner 10",
    agency: "NASA / JPL",
    status: "retired",
    launched: 1973,
    ended: 1975,
    headline: "The first visitor to Mercury.",
    summary:
      "Mariner 10 used Venus like a slingshot to reach Mercury. It flew past three times and showed us a cratered, Moon-like world.",
    funFact: "It only mapped about 45% of Mercury. The rest stayed a mystery for decades.",
    stats: [
      { value: "3", label: "Mercury flybys" },
      { value: "1974", label: "First visit" },
      { value: "45%", label: "Surface mapped" },
    ],
    image: img.missionMercury,
    nasaUrl: "https://science.nasa.gov/mission/mariner-10/",
  },
  {
    id: "magellan",
    planetId: "venus",
    name: "Magellan",
    agency: "NASA / JPL",
    status: "retired",
    launched: 1989,
    ended: 1994,
    headline: "It mapped a world it could never see.",
    summary:
      "Magellan used radar to look through Venus' thick clouds. It drew the first detailed map of the whole surface.",
    funFact: "Magellan found volcanoes and long lava rivers hidden under the clouds.",
    stats: [
      { value: "98%", label: "Surface mapped" },
      { value: "4,033", label: "Orbits of Venus" },
      { value: "4 yrs", label: "Mapping mission" },
    ],
    image: img.missionVenus,
    nasaUrl: "https://science.nasa.gov/mission/magellan/",
  },
  {
    id: "landsat-5",
    planetId: "earth",
    name: "Landsat 5",
    agency: "NASA / USGS",
    status: "retired",
    launched: 1984,
    ended: 2013,
    headline: "It watched our home for 29 years.",
    summary:
      "Landsat 5 circled Earth and photographed the land below, again and again. Its pictures helped us see forests, farms, and cities change over time.",
    funFact: "Landsat 5 was built to last 3 years. It kept working for 29.",
    stats: [
      { value: "29 yrs", label: "Watching Earth" },
      { value: "2.5M", label: "Images captured" },
      { value: "705 km", label: "Above Earth" },
    ],
    image: img.missionEarth,
    nasaUrl: "https://science.nasa.gov/mission/landsat/",
  },
  {
    id: "opportunity",
    planetId: "mars",
    name: "Opportunity",
    agency: "NASA / JPL",
    status: "retired",
    launched: 2003,
    ended: 2018,
    headline: "Built for 90 days. Stayed for 15 years.",
    summary:
      "Opportunity drove across Mars looking for signs of ancient water. It found them — and kept exploring far longer than anyone expected.",
    funFact: "A giant dust storm covered its solar panels, and the little rover finally went quiet.",
    stats: [
      { value: "5,111", label: "Sols on Mars" },
      { value: "45.16 km", label: "Distance driven" },
      { value: "15 yrs", label: "Outlived its plan" },
    ],
    image: img.missionMars,
    nasaUrl: "https://science.nasa.gov/mission/mer-opportunity/",
  },
  {
    id: "galileo",
    planetId: "jupiter",
    name: "Galileo",
    agency: "NASA / JPL",
    status: "retired",
    launched: 1989,
    ended: 2003,
    headline: "The first spacecraft to orbit Jupiter.",
    summary:
      "Galileo dropped a probe into Jupiter's clouds and studied its moons. It found strong clues that an ocean hides under Europa's icy shell.",
    funFact: "Engineers crashed Galileo into Jupiter on purpose, so it could never accidentally pollute Europa.",
    stats: [
      { value: "35", label: "Orbits of Jupiter" },
      { value: "8 yrs", label: "Exploring Jupiter" },
      { value: "1", label: "Probe dropped" },
    ],
    image: img.missionJupiter,
    nasaUrl: "https://science.nasa.gov/mission/galileo/",
  },
  {
    id: "cassini",
    planetId: "saturn",
    name: "Cassini",
    agency: "NASA / ESA / ASI",
    status: "retired",
    launched: 1997,
    ended: 2017,
    headline: "The Grand Finale at Saturn.",
    summary:
      "Cassini spent 13 years weaving between Saturn's rings and moons. It found a warm ocean under Enceladus and then dove into Saturn itself.",
    funFact: "Its last dive sent data until the moment it touched Saturn's atmosphere.",
    stats: [
      { value: "294", label: "Orbits of Saturn" },
      { value: "13 yrs", label: "At Saturn" },
      { value: "7.9B km", label: "Distance traveled" },
    ],
    image: img.missionSaturn,
    nasaUrl: "https://science.nasa.gov/mission/cassini/",
  },
  {
    id: "voyager-2-uranus",
    planetId: "uranus",
    name: "Voyager 2 at Uranus",
    agency: "NASA / JPL",
    status: "retired",
    launched: 1977,
    ended: 1986,
    headline: "The only spacecraft ever to visit Uranus.",
    summary:
      "Voyager 2 flew past Uranus in 1986 and sent back the first close-up pictures. It found new moons, new rings, and a strange tilted magnetic field.",
    funFact: "No other spacecraft has been back to Uranus since that one visit.",
    stats: [
      { value: "1986", label: "Flyby year" },
      { value: "81,500 km", label: "Closest approach" },
      { value: "10", label: "New moons found" },
    ],
    image: img.missionUranus,
    nasaUrl: "https://science.nasa.gov/mission/voyager/",
  },
  {
    id: "voyager-2-neptune",
    planetId: "neptune",
    name: "Voyager 2 at Neptune",
    agency: "NASA / JPL",
    status: "retired",
    launched: 1977,
    ended: 1989,
    headline: "The last portrait before deep space.",
    summary:
      "Voyager 2 swept past Neptune in 1989. It spotted the Great Dark Spot and icy geysers erupting from Triton.",
    funFact: "Voyager 2 is still flying today, far beyond the planets, and still talking to Earth.",
    stats: [
      { value: "1989", label: "Flyby year" },
      { value: "4,950 km", label: "Closest approach" },
      { value: "6", label: "New moons found" },
    ],
    image: img.missionNeptune,
    nasaUrl: "https://science.nasa.gov/mission/voyager/",
  },
];

export const missionByPlanet: Record<string, Mission> = Object.fromEntries(
  missions.map((mission) => [mission.planetId, mission]),
);

export function missionYears(mission: Mission) {
  return mission.ended ? `${mission.launched}–${mission.ended}` : `${mission.launched}–now`;
}

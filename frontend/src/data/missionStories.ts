import { img } from "../assets";
import { missionControl, type MissionControlEntry, type MissionStat, type MissionMedia } from "./missionControl";
import { planetById } from "./planets";
import { planetStories, type ProjectStatus } from "./missions";

/**
 * Mission story data for page 4.
 *
 * Two layers:
 *   1. `curatedStories` — hand-written, five-chapter narratives (MAVEN and
 *      Cassini) with distinct, real NASA imagery per chapter.
 *   2. A generator that turns any mission already listed on page 3 into a
 *      working five-chapter page, so every mission link resolves. When a
 *      mission has known NASA chapter imagery, the generator uses it; otherwise
 *      it picks distinct frames from available mission/planet media.
 *
 * Imagery: chapter images prefer NASA Image and Video Library assets
 * (images-assets.nasa.gov, public domain) so each stage (launch, spacecraft,
 * journey, discoveries, today) can show an appropriate, different view.
 */

const asset = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;
const nasaImg = (id: string, size: "orig" | "large" | "medium" = "large") =>
  `https://images-assets.nasa.gov/image/${id}/${id}~${size}.jpg`;

type ChapterImage = { src: string; alt: string; caption: string };
type ChapterImageSet = {
  beginning: ChapterImage;
  spacecraft: ChapterImage;
  journey: ChapterImage;
  discoveries: ChapterImage;
  today: ChapterImage;
};

/** Real NASA imagery per mission chapter (launch/spacecraft/journey/discoveries/today). */
const nasaChapterImages: Record<string, ChapterImageSet> = {
  maven: {
    beginning: {
      src: nasaImg("KSC-2013-3912"),
      alt: "Atlas V rocket carrying MAVEN lifts off from Cape Canaveral",
      caption: "MAVEN launches aboard an Atlas V from Cape Canaveral, 18 Nov 2013. (NASA)",
    },
    spacecraft: {
      src: nasaImg("KSC-2013-3371"),
      alt: "MAVEN spacecraft prepared for launch processing",
      caption: "The MAVEN orbiter during launch preparations at Kennedy Space Center. (NASA)",
    },
    journey: {
      src: nasaImg("PIA19011", "orig"),
      alt: "Artist concept of MAVEN in orbit around Mars",
      caption: "MAVEN in orbit around Mars, studying the upper atmosphere. (NASA/GSFC)",
    },
    discoveries: {
      src: nasaImg("PIA18613", "orig"),
      alt: "MAVEN observation of Mars atmospheric escape",
      caption: "MAVEN data revealing how Mars loses atmosphere to the solar wind. (NASA/GSFC)",
    },
    today: {
      src: img.planetMars,
      alt: "Mars seen from orbit",
      caption: "MAVEN continues to orbit Mars today, relaying data and watching the planet's sky.",
    },
  },
  cassini: {
    beginning: {
      src: nasaImg("PIA03883", "orig"),
      alt: "Cassini spacecraft approaching Saturn, artist concept",
      caption: "Cassini–Huygens set out in 1997 on a seven-year journey to Saturn. (NASA/JPL)",
    },
    spacecraft: {
      src: nasaImg("KSC-97PC870"),
      alt: "Cassini spacecraft during assembly and checkout",
      caption: "The Cassini orbiter during assembly at Kennedy Space Center. (NASA)",
    },
    journey: {
      src: nasaImg("PIA03883", "orig"),
      alt: "Cassini arrival at Saturn artist concept",
      caption: "Cassini approaches Saturn after a seven-year interplanetary journey. (NASA/JPL)",
    },
    discoveries: {
      src: nasaImg("PIA12567", "orig"),
      alt: "Saturn's rings and moons imaged by Cassini",
      caption: "Cassini's close-up view of Saturn's rings, revealing intricate structure. (NASA/JPL/SSI)",
    },
    today: {
      src: nasaImg("PIA21439", "orig"),
      alt: "Cassini Grand Finale dive illustration",
      caption: "Cassini's Grand Finale: 22 daring dives before plunging into Saturn in 2017. (NASA/JPL-Caltech)",
    },
  },
  opportunity: {
    beginning: {
      src: nasaImg("PIA04829", "orig"),
      alt: "Mars Exploration Rover mission concept",
      caption: "The Mars Exploration Rover mission heads for Meridiani Planum. (NASA/JPL)",
    },
    spacecraft: {
      src: nasaImg("PIA04413", "orig"),
      alt: "Opportunity rover being prepared for Mars",
      caption: "Opportunity during testing before its journey to Mars. (NASA/JPL)",
    },
    journey: {
      src: nasaImg("PIA04832", "orig"),
      alt: "Opportunity rover cruise and approach to Mars",
      caption: "Opportunity's cruise to Mars and its bouncing landing in 2004. (NASA/JPL)",
    },
    discoveries: {
      src: nasaImg("PIA03240", "orig"),
      alt: "Opportunity inside Endurance Crater on Mars",
      caption: "Opportunity explored Endurance Crater, finding evidence of ancient water. (NASA/JPL)",
    },
    today: {
      src: nasaImg("PIA17759", "orig"),
      alt: "Opportunity rover at Endeavour Crater",
      caption: "Opportunity's long trek ended in 2018 after a planet-wide dust storm. (NASA/JPL-Caltech)",
    },
  },
  perseverance: {
    beginning: {
      src: nasaImg("KSC-20200730-PH-FMX01_0042"),
      alt: "Mars 2020 Perseverance rover launches on an Atlas V",
      caption: "Perseverance launches from Cape Canaveral on 30 July 2020. (NASA)",
    },
    spacecraft: {
      src: nasaImg("PIA23767", "orig"),
      alt: "Perseverance rover being shown during assembly",
      caption: "The Perseverance rover and its sampling system during preparation at JPL. (NASA/JPL-Caltech)",
    },
    journey: {
      src: nasaImg("PIA24333", "orig"),
      alt: "Perseverance and Mars 2020 spacecraft components on Mars",
      caption: "Perseverance's sky-crane landing delivered it to Jezero Crater in 2021. (NASA/JPL-Caltech)",
    },
    discoveries: {
      src: nasaImg("PIA25735", "orig"),
      alt: "Perseverance selfie with sample tubes on Mars",
      caption: "Perseverance collects and caches rock samples that may hold signs of ancient life. (NASA/JPL-Caltech/MSSS)",
    },
    today: {
      src: nasaImg("PIA25681", "orig"),
      alt: "Perseverance rover at the Three Forks sample depot",
      caption: "Perseverance continues exploring Jezero Crater and building a sample depot. (NASA/JPL-Caltech/MSSS)",
    },
  },
  curiosity: {
    beginning: {
      src: nasaImg("PIA14402", "orig"),
      alt: "Mars Science Laboratory Curiosity launch",
      caption: "Curiosity launches on 26 Nov 2011 aboard an Atlas V rocket. (NASA)",
    },
    spacecraft: {
      src: nasaImg("PIA14164", "orig"),
      alt: "Artist concept of the Curiosity rover on Mars",
      caption: "Curiosity is a car-sized rover built to study Mars's past habitability. (NASA/JPL-Caltech)",
    },
    journey: {
      src: nasaImg("PIA14839", "orig"),
      alt: "Curiosity's entry, descent and landing on Mars",
      caption: "The sky-crane landing placed Curiosity safely in Gale Crater in 2012. (NASA/JPL-Caltech)",
    },
    discoveries: {
      src: nasaImg("PIA19808", "orig"),
      alt: "Curiosity rover self-portrait at Buckskin on Mars",
      caption: "Curiosity found evidence that Gale Crater once hosted lakes and streams. (NASA/JPL-Caltech/MSSS)",
    },
    today: {
      src: nasaImg("PIA22486", "orig"),
      alt: "Curiosity's dusty selfie on Mount Sharp",
      caption: "Curiosity keeps climbing Mount Sharp, reading layers of Martian history. (NASA/JPL-Caltech/MSSS)",
    },
  },
  juno: {
    beginning: {
      src: nasaImg("PIA14407", "orig"),
      alt: "Juno spacecraft launches aboard an Atlas V",
      caption: "Juno launches on 5 Aug 2011 to begin its journey to Jupiter. (NASA)",
    },
    spacecraft: {
      src: nasaImg("PIA13934", "orig"),
      alt: "Juno spacecraft prepared for environmental testing",
      caption: "Juno's solar arrays and instruments prepared for the harsh Jovian environment. (NASA/JPL-Caltech/LMSS)",
    },
    journey: {
      src: nasaImg("PIA19639", "orig"),
      alt: "Artist concept of Juno arriving at Jupiter",
      caption: "After a five-year cruise, Juno arrived at Jupiter on 4 July 2016. (NASA/JPL-Caltech)",
    },
    discoveries: {
      src: nasaImg("PIA22946", "orig"),
      alt: "Jupiter's south pole cyclones imaged by JunoCam",
      caption: "Juno revealed giant cyclones at Jupiter's poles and a complex deep interior. (NASA/JPL-Caltech/SwRI/MSSS)",
    },
    today: {
      src: nasaImg("PIA25015", "orig"),
      alt: "Jupiter imaged by Juno during an extended mission flyby",
      caption: "Juno continues its extended mission, making close flybys of Jupiter and its moons. (NASA/JPL-Caltech/SwRI/MSSS)",
    },
  },
  "europa-clipper": {
    beginning: {
      src: nasaImg("KSC-20241013-PH-SPX03_0004"),
      alt: "Europa Clipper at Launch Complex 39A ahead of launch",
      caption: "Europa Clipper prepared for launch at Kennedy Space Center, October 2024. (NASA/KSC)",
    },
    spacecraft: {
      src: nasaImg("PIA20025", "orig"),
      alt: "Artist concept of the Europa Clipper spacecraft",
      caption: "Europa Clipper carries instruments to study Europa's ice shell and hidden ocean. (NASA/JPL-Caltech)",
    },
    journey: {
      src: nasaImg("PIA26157", "orig"),
      alt: "Europa Clipper trajectory illustration",
      caption: "Europa Clipper will use gravity assists to reach the Jupiter system in 2030. (NASA/JPL-Caltech)",
    },
    discoveries: {
      src: img.planetJupiter,
      alt: "Jupiter, the giant planet Europa Clipper will study from orbit",
      caption: "Europa Clipper will investigate whether Jupiter's moon Europa could support life.",
    },
    today: {
      src: nasaImg("PIA25692", "orig"),
      alt: "Europa and Jupiter system as a target for exploration",
      caption: "Launched in 2024, Europa Clipper is cruising toward dozens of close flybys of Europa. (NASA/JPL-Caltech)",
    },
  },
  galileo: {
    beginning: {
      src: nasaImg("89PC-0698"),
      alt: "Galileo spacecraft deployment from Space Shuttle Atlantis",
      caption: "Galileo was deployed from Space Shuttle Atlantis on STS-34 in 1989. (NASA)",
    },
    spacecraft: {
      src: nasaImg("S89-44175"),
      alt: "Diagram of the Galileo spacecraft and atmospheric probe",
      caption: "Galileo carried an orbiter and a probe built to descend into Jupiter's clouds. (NASA)",
    },
    journey: {
      src: nasaImg("PIA01067", "orig"),
      alt: "Galileo approach to Jupiter",
      caption: "Galileo reached Jupiter in 1995 after gravity assists from Venus and Earth. (NASA/JPL)",
    },
    discoveries: {
      src: nasaImg("PIA00730", "orig"),
      alt: "Jupiter temperatures and atmosphere studied by Galileo",
      caption: "Galileo found strong evidence of a subsurface ocean on Europa. (NASA/JPL)",
    },
    today: {
      src: img.planetJupiter,
      alt: "Jupiter, where Galileo ended its mission in 2003",
      caption: "Galileo's mission ended with a plunge into Jupiter in 2003 to protect Europa. (NASA)",
    },
  },
  messenger: {
    beginning: {
      src: nasaImg("PIA18148", "orig"),
      alt: "Artist concept of MESSENGER departing Earth",
      caption: "MESSENGER launched in 2004 on a complex path to reach Mercury orbit. (NASA/JHUAPL)",
    },
    spacecraft: {
      src: nasaImg("PIA18145", "orig"),
      alt: "Artist concept of MESSENGER at Mercury",
      caption: "MESSENGER carried instruments and a sunshade to survive at Mercury. (NASA/JHUAPL/CIW)",
    },
    journey: {
      src: nasaImg("PIA15257", "orig"),
      alt: "MESSENGER's path and flybys on the way to Mercury",
      caption: "Six years of flybys of Earth, Venus, and Mercury set up orbit insertion in 2011. (NASA/JHUAPL)",
    },
    discoveries: {
      src: nasaImg("PIA19445", "orig"),
      alt: "One of MESSENGER's last views of Mercury",
      caption: "MESSENGER mapped Mercury globally and found evidence of water ice in shadowed craters. (NASA/JHUAPL/CIW)",
    },
    today: {
      src: img.planetMercury,
      alt: "Mercury, the world MESSENGER orbited and mapped",
      caption: "MESSENGER impacted Mercury in 2015 after more than four years in orbit. (NASA)",
    },
  },
  "mariner-10": {
    beginning: {
      src: nasaImg("PIA03101", "orig"),
      alt: "Mariner 10 mission imagery of Mercury",
      caption: "Mariner 10 launched in 1973 to perform the first reconnaissance of Mercury. (NASA/JPL)",
    },
    spacecraft: {
      src: nasaImg("KSC-07pd1524"),
      alt: "Mariner 10 spacecraft during preparation",
      caption: "Mariner 10 was the first spacecraft to use a gravity assist at another planet. (NASA)",
    },
    journey: {
      src: img.planetVenus,
      alt: "Venus, used by Mariner 10 for a gravity assist",
      caption: "Mariner 10 flew by Venus in 1974, using its gravity to reach Mercury. (NASA)",
    },
    discoveries: {
      src: img.planetMercury,
      alt: "Mercury's cratered surface",
      caption: "Mariner 10 mapped about 45% of Mercury during three flybys in 1974–75. (NASA)",
    },
    today: {
      src: img.planetMercury,
      alt: "Mercury remains a target for future exploration",
      caption: "Mariner 10's mission ended in 1975, leaving Mercury unexplored again for decades. (NASA)",
    },
  },
  bepicolombo: {
    beginning: {
      src: img.planetMercury,
      alt: "Mercury, destination of BepiColombo",
      caption: "BepiColombo launched in 2018 on a long journey to orbit Mercury. (ESA/JAXA/NASA)",
    },
    spacecraft: {
      src: img.planetMercury,
      alt: "BepiColombo mission to Mercury",
      caption: "BepiColombo carries two orbiters to study Mercury's surface, interior, and magnetosphere. (ESA/JAXA)",
    },
    journey: {
      src: img.planetMercury,
      alt: "BepiColombo cruise to Mercury",
      caption: "A series of flybys of Earth, Venus, and Mercury guide BepiColombo to orbit insertion. (ESA/JAXA)",
    },
    discoveries: {
      src: img.planetMercury,
      alt: "Mercury as seen during BepiColombo flybys",
      caption: "Flyby images have already returned new views of Mercury's surface. (ESA/BepiColombo/MTM)",
    },
    today: {
      src: img.planetMercury,
      alt: "Mercury awaiting BepiColombo's arrival",
      caption: "BepiColombo is scheduled to enter Mercury orbit in late 2026. (ESA/JAXA)",
    },
  },
  magellan: {
    beginning: {
      src: nasaImg("s89-30720"),
      alt: "Magellan spacecraft in Space Shuttle Atlantis payload bay",
      caption: "Magellan launched aboard Space Shuttle Atlantis on mission STS-30 in 1989. (NASA)",
    },
    spacecraft: {
      src: img.planetVenus,
      alt: "Venus, the world Magellan mapped with radar",
      caption: "Magellan used radar to see through Venus's thick clouds and map its surface. (NASA/JPL)",
    },
    journey: {
      src: img.planetVenus,
      alt: "Magellan's journey to Venus",
      caption: "Magellan arrived at Venus in 1990 and began systematic radar mapping. (NASA/JPL)",
    },
    discoveries: {
      src: nasaImg("PIA00254", "orig"),
      alt: "Magellan radar image of Venus surface",
      caption: "Magellan mapped 98% of Venus, revealing volcanoes, lava plains, and impact craters. (NASA/JPL)",
    },
    today: {
      src: img.planetVenus,
      alt: "Venus after the Magellan mission",
      caption: "Magellan's mission ended in 1994, leaving a detailed global map of Venus. (NASA/JPL)",
    },
  },
  "huygens": {
    beginning: {
      src: nasaImg("PIA03883", "orig"),
      alt: "Cassini-Huygens on its way to Saturn and Titan",
      caption: "Huygens rode to Saturn aboard Cassini, beginning its journey in 1997. (NASA/JPL)",
    },
    spacecraft: {
      src: nasaImg("PIA07232", "orig"),
      alt: "First color view from Titan's surface returned by Huygens",
      caption: "Huygens was a European probe built to survive descent through Titan's atmosphere. (ESA/NASA/JPL/University of Arizona)",
    },
    journey: {
      src: nasaImg("PIA07234", "orig"),
      alt: "Huygens descent through Titan's clouds",
      caption: "On 14 Jan 2005, Huygens parachuted through Titan's haze for over two hours. (ESA/NASA/JPL/University of Arizona)",
    },
    discoveries: {
      src: img.planetSaturn,
      alt: "Saturn's moon Titan, explored by Huygens",
      caption: "Huygens revealed river channels and rounded ice pebbles on Titan's surface. (NASA/ESA)",
    },
    today: {
      src: asset("saturn-hero.jpg"),
      alt: "Saturn and Titan, the world Huygens explored",
      caption: "Huygens operated on Titan's surface for 72 minutes, a first in the outer solar system. (NASA/ESA)",
    },
  },
  "voyager-1": {
    beginning: {
      src: nasaImg("PIA21741", "orig"),
      alt: "Voyager Golden Record preparation",
      caption: "Voyager 1 launched on 5 Sep 1977 carrying the Golden Record for distant civilizations. (NASA/JPL)",
    },
    spacecraft: {
      src: img.planetSaturn,
      alt: "Voyager 1 spacecraft at the outer planets",
      caption: "Voyager 1 was built to study Jupiter and Saturn during the Grand Tour era. (NASA/JPL)",
    },
    journey: {
      src: img.planetJupiter,
      alt: "Jupiter, visited by Voyager 1 in 1979",
      caption: "Voyager 1 flew past Jupiter in 1979 before heading to Saturn. (NASA/JPL)",
    },
    discoveries: {
      src: asset("saturn-hero.jpg"),
      alt: "Saturn's rings seen during Voyager encounters",
      caption: "Voyager 1's 1980 Saturn flyby revealed new details of the rings and Titan. (NASA/JPL)",
    },
    today: {
      src: nasaImg("PIA17046", "orig"),
      alt: "Voyager 1 in interstellar space",
      caption: "After its planetary mission, Voyager 1 continued on into interstellar space. (NASA/JPL-Caltech)",
    },
  },
  "pioneer-11": {
    beginning: {
      src: img.planetJupiter,
      alt: "Jupiter, visited by Pioneer 11 on its way to Saturn",
      caption: "Pioneer 11 launched in 1973 and used a Jupiter flyby to reach Saturn. (NASA)",
    },
    spacecraft: {
      src: nasaImg("ARC-2000-80-HC-251"),
      alt: "Pioneer spacecraft concept artwork",
      caption: "Pioneer 11 was a hardy explorer designed for the first close look at Saturn. (NASA)",
    },
    journey: {
      src: asset("saturn-hero.jpg"),
      alt: "Saturn, first reached by Pioneer 11",
      caption: "Pioneer 11 became the first spacecraft to encounter Saturn in 1979. (NASA)",
    },
    discoveries: {
      src: img.planetSaturn,
      alt: "Saturn and its rings",
      caption: "Pioneer 11 discovered the F ring and studied Saturn's magnetic environment. (NASA)",
    },
    today: {
      src: img.planetSaturn,
      alt: "Saturn after Pioneer 11's historic flyby",
      caption: "Pioneer 11's mission ended in 1995, but its pathfinding data still matters. (NASA)",
    },
  },
  "voyager-2-uranus": {
    beginning: {
      src: nasaImg("PIA21741", "orig"),
      alt: "Voyager spacecraft and Golden Record",
      caption: "Voyager 2 launched in 1977 on the only trajectory to visit all four giant planets. (NASA/JPL)",
    },
    spacecraft: {
      src: img.planetUranus,
      alt: "Uranus, visited only by Voyager 2",
      caption: "Voyager 2 carried cameras and instruments to study distant, icy worlds. (NASA/JPL)",
    },
    journey: {
      src: nasaImg("ARC-1986-AC86-7042"),
      alt: "Voyager 2 encounter with Uranus imagery",
      caption: "Voyager 2 reached Uranus in January 1986 after flybys of Jupiter and Saturn. (NASA)",
    },
    discoveries: {
      src: img.planetUranus,
      alt: "Uranus from Voyager 2",
      caption: "Voyager 2 discovered 10 moons, two rings, and Uranus's unusual magnetic field. (NASA/JPL)",
    },
    today: {
      src: img.planetUranus,
      alt: "Uranus, still awaiting a return mission",
      caption: "Voyager 2 remains the only spacecraft ever to visit Uranus. (NASA/JPL)",
    },
  },
  "voyager-2-neptune": {
    beginning: {
      src: nasaImg("PIA21741", "orig"),
      alt: "Voyager spacecraft prepared for the Grand Tour",
      caption: "Voyager 2's Grand Tour continued onward from Uranus to Neptune. (NASA/JPL)",
    },
    spacecraft: {
      src: img.planetNeptune,
      alt: "Neptune, Voyager 2's final planetary encounter",
      caption: "Voyager 2's instruments were still healthy after 12 years in space. (NASA/JPL)",
    },
    journey: {
      src: nasaImg("PIA01493", "orig"),
      alt: "Neptune's rings imaged by Voyager 2",
      caption: "Voyager 2 flew past Neptune on 25 Aug 1989, its last planetary encounter. (NASA/JPL)",
    },
    discoveries: {
      src: nasaImg("PIA00046", "orig"),
      alt: "Neptune's Great Dark Spot imaged by Voyager 2",
      caption: "Voyager 2 discovered Neptune's Great Dark Spot and geysers on Triton. (NASA/JPL)",
    },
    today: {
      src: img.planetNeptune,
      alt: "Neptune at the edge of the classical planets",
      caption: "Voyager 2 is still operating in interstellar space, sending data back to Earth. (NASA/JPL)",
    },
  },
  "landsat-5": {
    beginning: {
      src: img.planetEarth,
      alt: "Earth as seen from orbit",
      caption: "Landsat 5 launched on 1 March 1984 to continue monitoring Earth's land. (NASA/USGS)",
    },
    spacecraft: {
      src: img.planetEarth,
      alt: "Earth observation from space",
      caption: "Landsat 5 carried instruments to image Earth's surface in visible and infrared light. (NASA/USGS)",
    },
    journey: {
      src: img.planetEarth,
      alt: "Landsat 5 in orbit around Earth",
      caption: "From a 705 km orbit, Landsat 5 repeatedly imaged the same places over decades. (NASA/USGS)",
    },
    discoveries: {
      src: img.missionEarth,
      alt: "Earth surface changes observed from orbit",
      caption: "Landsat 5 recorded deforestation, urban growth, glaciers, and disasters over 29 years. (NASA/USGS)",
    },
    today: {
      src: img.planetEarth,
      alt: "Earth, continuously monitored by the Landsat program",
      caption: "Decommissioned in 2013, Landsat 5's archive still supports science and mapping. (USGS/NASA)",
    },
  },
  "landsat-9": {
    beginning: {
      src: nasaImg("KSC-20210914-PH-RNB01_0018"),
      alt: "Landsat 9 prepared for launch operations",
      caption: "Landsat 9 was prepared and launched in 2021 to extend the Landsat record. (NASA/KSC)",
    },
    spacecraft: {
      src: img.planetEarth,
      alt: "Earth observation satellite over our home planet",
      caption: "Landsat 9 carries improved imagers to measure Earth's land and coastal regions. (NASA/USGS)",
    },
    journey: {
      src: img.planetEarth,
      alt: "Landsat 9 in Earth orbit",
      caption: "Landsat 9 orbits Earth in tandem with Landsat 8 for frequent global coverage. (NASA/USGS)",
    },
    discoveries: {
      src: img.missionEarth,
      alt: "Earth's changing surface seen from space",
      caption: "Landsat 9 helps track water use, crop health, wildfires, and urban change. (NASA/USGS)",
    },
    today: {
      src: img.planetEarth,
      alt: "Earth observed today by Landsat 9",
      caption: "Landsat 9 is actively imaging Earth, continuing a program that began in 1972. (NASA/USGS)",
    },
  },
  insight: {
    beginning: {
      src: nasaImg("PIA22228", "orig"),
      alt: "InSight lander on the surface of Mars",
      caption: "InSight launched in 2018 to study the deep interior of Mars. (NASA/JPL-Caltech)",
    },
    spacecraft: {
      src: nasaImg("PIA19664", "orig"),
      alt: "InSight lander in its Mars surface configuration",
      caption: "InSight carried a seismometer and heat probe to listen inside Mars. (NASA/JPL-Caltech)",
    },
    journey: {
      src: nasaImg("PIA22829", "orig"),
      alt: "InSight landing on Mars",
      caption: "InSight landed in Elysium Planitia on 26 Nov 2018. (NASA/JPL-Caltech)",
    },
    discoveries: {
      src: asset("mars-hero.jpg"),
      alt: "Martian surface studied by InSight",
      caption: "InSight detected more than 1,300 marsquakes and measured Mars's interior layers. (NASA/JPL-Caltech)",
    },
    today: {
      src: img.planetMars,
      alt: "Mars, where InSight completed its mission",
      caption: "InSight's mission ended in 2022 after dust reduced its solar power. (NASA/JPL-Caltech)",
    },
  },
  dragonfly: {
    beginning: {
      src: img.planetSaturn,
      alt: "Saturn's moon Titan, destination of Dragonfly",
      caption: "Dragonfly is planned to launch in 2028 to explore Titan's surface. (NASA/Johns Hopkins APL)",
    },
    spacecraft: {
      src: img.planetSaturn,
      alt: "Dragonfly rotorcraft mission concept for Titan",
      caption: "Dragonfly is a nuclear-powered rotorcraft designed to fly between sites on Titan. (NASA/Johns Hopkins APL)",
    },
    journey: {
      src: asset("saturn-hero.jpg"),
      alt: "Saturn system, target of the Dragonfly mission",
      caption: "Dragonfly will travel for years before reaching Titan's thick atmosphere. (NASA/Johns Hopkins APL)",
    },
    discoveries: {
      src: img.planetSaturn,
      alt: "Titan, a world with organic chemistry",
      caption: "Dragonfly will study prebiotic chemistry and habitability on Titan. (NASA/Johns Hopkins APL)",
    },
    today: {
      src: img.planetSaturn,
      alt: "Saturn's moon Titan awaits Dragonfly",
      caption: "Dragonfly is in development, preparing for a new way to explore another world. (NASA/Johns Hopkins APL)",
    },
  },
};

export type MissionChapterId = "beginning" | "spacecraft" | "journey" | "discoveries" | "today";

export type MissionChapter = {
  id: MissionChapterId;
  /** Short tab label, e.g. "The Beginning". */
  tab: string;
  title: string;
  /** The question the chapter answers, shown under the title. */
  question: string;
  image: string;
  imageAlt: string;
  caption: string;
  paragraphs: string[];
  /** Phrases to highlight in gold inside `paragraphs`. */
  keywords: string[];
};

export type MissionProfile = {
  id: string;
  /** Short name, e.g. "MAVEN". */
  name: string;
  /** Expanded name, e.g. "Mars Atmosphere and Volatile EvolutioN". */
  fullName: string;
  agency: string;
  status: ProjectStatus;
  planetId: string;
  planetName: string;
  launch: string;
  orbit: string;
  /** Overrides the "Orbit" label; generated pages say "Where" instead. */
  orbitLabel?: string;
  goal: string;
  /** Sidebar artwork. */
  image: string;
  imageAlt: string;
  imageCaption: string;
  nasaUrl?: string;
  /** Convenience stats, reused by the fallback generator. */
  facts: MissionStat[];
  chapters: MissionChapter[];
};

/* ------------------------------------------------------------------ MAVEN */

const maven: MissionProfile = {
  id: "maven",
  name: "MAVEN",
  fullName: "Mars Atmosphere and Volatile EvolutioN",
  agency: "NASA",
  status: "active",
  planetId: "mars",
  planetName: "Mars",
  launch: "18 Nov 2013 · Atlas V, Cape Canaveral",
  orbit: "150 × 6,200 km · one lap every 4.5 hours",
  goal: "Find out where Mars’ air and water went",
  image: img.planetMars,
  imageAlt: "Mars, the planet MAVEN has orbited since 2014",
  imageCaption: "Mars, the world MAVEN studies from orbit.",
  nasaUrl: "https://science.nasa.gov/mission/maven/",
  facts: [
    { value: "2013", label: "Launched" },
    { value: "2014", label: "Arrived at Mars" },
    { value: "4.5 h", label: "One orbit" },
  ],
  chapters: [
    {
      id: "beginning",
      tab: "The Beginning",
      title: "The Beginning",
      question: "Why was MAVEN launched?",
      image: nasaChapterImages.maven.beginning.src,
      imageAlt: nasaChapterImages.maven.beginning.alt,
      caption: nasaChapterImages.maven.beginning.caption,
      paragraphs: [
        "Long ago, Mars was a warmer, wetter world. Rivers cut valleys into its surface and thick air pressed down on the ground. Today the planet is a cold desert with an atmosphere about 100 times thinner than Earth’s.",
        "So where did all that air go? That is the question MAVEN was built to answer. Its name stands for Mars Atmosphere and Volatile EvolutioN.",
        "MAVEN does not land. It circles high above the planet, tasting the top of the atmosphere to measure how quickly gas escapes into space. Those numbers let scientists rewind the clock and work out billions of years of change.",
      ],
      keywords: [
        "warmer, wetter world",
        "100 times thinner",
        "where did all that air go",
        "gas escapes into space",
      ],
    },
    {
      id: "spacecraft",
      tab: "The Spacecraft",
      title: "The Spacecraft",
      question: "What is MAVEN made of?",
      image: nasaChapterImages.maven.spacecraft.src,
      imageAlt: nasaChapterImages.maven.spacecraft.alt,
      caption: nasaChapterImages.maven.spacecraft.caption,
      paragraphs: [
        "MAVEN is a boxy orbiter about the size of a small car. Two solar wings stretch 11.4 metres from tip to tip and turn sunlight into the power it needs.",
        "Its instruments are the reason it flew. A mass spectrometer tastes the gases high above Mars, an ultraviolet spectrograph watches the atmosphere glow, and particle detectors count the charged pieces the solar wind knocks away.",
        "Most of the spacecraft is wrapped in gold-coloured foil. That thin blanket keeps the electronics at a steady temperature, from the cold of the Martian night side to the heat of the Sun.",
      ],
      keywords: [
        "11.4 metres",
        "mass spectrometer",
        "ultraviolet spectrograph",
        "gold-coloured foil",
      ],
    },
    {
      id: "journey",
      tab: "The Journey",
      title: "The Journey",
      question: "How did MAVEN get to Mars?",
      image: nasaChapterImages.maven.journey.src,
      imageAlt: nasaChapterImages.maven.journey.alt,
      caption: nasaChapterImages.maven.journey.caption,
      paragraphs: [
        "MAVEN lifted off on 18 November 2013 aboard an Atlas V rocket from Cape Canaveral in Florida. It launched on the first attempt, on a clean, bright afternoon.",
        "The cruise to Mars took about ten months. Along the way the team switched on every instrument and checked it, so the spacecraft would be ready the moment it arrived.",
        "On 21 September 2014 MAVEN fired its main engine for about 33 minutes and slipped into a long, looping orbit. It has been circling Mars ever since.",
      ],
      keywords: ["18 November 2013", "ten months", "33 minutes", "looping orbit"],
    },
    {
      id: "discoveries",
      tab: "The Discoveries",
      title: "The Discoveries",
      question: "What did MAVEN find?",
      image: nasaChapterImages.maven.discoveries.src,
      imageAlt: nasaChapterImages.maven.discoveries.alt,
      caption: nasaChapterImages.maven.discoveries.caption,
      paragraphs: [
        "The air around Mars is leaking, and MAVEN measured how fast. Every second, gas drifts away into space, stripped off by the solar wind.",
        "The leak is not steady. When a solar storm hits, or when a giant dust storm wraps the whole planet, the escape rate can jump dramatically. MAVEN caught both kinds of event in the act.",
        "It also found auroras glowing across the whole night side of Mars, and traced water vapour rising high into the air during dust storms. Piece by piece, the mission shows where a planet’s water can go.",
      ],
      keywords: ["leaking", "solar wind", "solar storm", "auroras", "water vapour"],
    },
    {
      id: "today",
      tab: "Mission Today",
      title: "Mission Today",
      question: "What is MAVEN doing now?",
      image: nasaChapterImages.maven.today.src,
      imageAlt: nasaChapterImages.maven.today.alt,
      caption: nasaChapterImages.maven.today.caption,
      paragraphs: [
        "MAVEN is still in orbit and still taking data. Its original one-year mission has been extended again and again, and it is now one of the longest-running watches on another planet’s climate.",
        "It also works as a communications relay, passing messages from rovers on the surface back to Earth. When a rover has something to say, MAVEN is often the spacecraft that carries the news.",
        "Every extra year adds to a record no other mission has: a decade-long view of how a planet slowly loses its sky.",
      ],
      keywords: ["still in orbit", "communications relay", "loses its sky"],
    },
  ],
};

/* ---------------------------------------------------------------- Cassini */

const cassini: MissionProfile = {
  id: "cassini",
  name: "Cassini",
  fullName: "Cassini–Huygens Saturn Orbiter",
  agency: "NASA / ESA / ASI",
  status: "retired",
  planetId: "saturn",
  planetName: "Saturn",
  launch: "15 Oct 1997 · Titan IVB, Cape Canaveral",
  orbit: "Around Saturn · 294 orbits over 13 years",
  goal: "Study Saturn, its rings and its moons",
  image: asset("saturn-hero.jpg"),
  imageAlt: "Saturn and its rings, photographed by Cassini",
  imageCaption: "Saturn and its rings, photographed by Cassini.",
  nasaUrl: "https://science.nasa.gov/mission/cassini/",
  facts: [
    { value: "1997", label: "Launched" },
    { value: "2004", label: "Arrived at Saturn" },
    { value: "294", label: "Orbits" },
  ],
  chapters: [
    {
      id: "beginning",
      tab: "The Beginning",
      title: "The Beginning",
      question: "Why did we send Cassini to Saturn?",
      image: nasaChapterImages.cassini.beginning.src,
      imageAlt: nasaChapterImages.cassini.beginning.alt,
      caption: nasaChapterImages.cassini.beginning.caption,
      paragraphs: [
        "Before Cassini, Saturn was a beautiful blur. Astronomers had seen the rings, and a few spacecraft had flown past, but nobody had ever stayed to watch.",
        "Cassini was built to orbit Saturn for years, not hours. Travelling with it was Huygens, a small European probe designed to land on Titan, Saturn’s biggest moon.",
        "Together they set out to study the planet, the rings, the moons, and the strange orange world hiding under Titan’s clouds.",
      ],
      keywords: ["beautiful blur", "Titan", "orange world"],
    },
    {
      id: "spacecraft",
      tab: "The Spacecraft",
      title: "The Spacecraft",
      question: "What could Cassini do?",
      image: nasaChapterImages.cassini.spacecraft.src,
      imageAlt: nasaChapterImages.cassini.spacecraft.alt,
      caption: nasaChapterImages.cassini.spacecraft.caption,
      paragraphs: [
        "Cassini was a two-storey spacecraft with twelve instruments and a dish antenna wider than a person is tall.",
        "It could photograph in visible light, see in the infrared, map through the haze with radar, taste gas, and weigh tiny grains of ice. The Huygens probe rode on its side until the day it let go.",
        "Its nuclear power source kept it working far from the Sun, where sunlight is too weak for solar panels.",
      ],
      keywords: ["twelve instruments", "dish antenna", "nuclear power source"],
    },
    {
      id: "journey",
      tab: "The Journey",
      title: "The Journey",
      question: "How did Cassini reach Saturn?",
      image: nasaChapterImages.cassini.journey.src,
      imageAlt: nasaChapterImages.cassini.journey.alt,
      caption: nasaChapterImages.cassini.journey.caption,
      paragraphs: [
        "Cassini launched on 15 October 1997. It could not carry enough fuel to fly straight to Saturn, so it took the scenic route.",
        "It swung past Venus twice, then Earth, then Jupiter, stealing speed from each planet like a skateboarder rolling through a half-pipe.",
        "Seven years later, in July 2004, it slipped into orbit around Saturn. Huygens landed on Titan in January 2005.",
      ],
      keywords: ["scenic route", "stealing speed", "July 2004"],
    },
    {
      id: "discoveries",
      tab: "The Discoveries",
      title: "The Discoveries",
      question: "What did Cassini find?",
      image: nasaChapterImages.cassini.discoveries.src,
      imageAlt: nasaChapterImages.cassini.discoveries.alt,
      caption: nasaChapterImages.cassini.discoveries.caption,
      paragraphs: [
        "Cassini found geysers at the south pole of Enceladus, spraying water from a warm, salty ocean hidden under the ice.",
        "It watched a six-sided storm spin over Saturn’s north pole, and saw hurricanes churn in the gaps between the rings.",
        "Huygens sent back the first pictures from Titan’s surface: rounded ice pebbles resting on a damp plain.",
      ],
      keywords: ["geysers", "six-sided storm", "ice pebbles"],
    },
    {
      id: "today",
      tab: "Mission Today",
      title: "Mission Today",
      question: "What happened at the end?",
      image: nasaChapterImages.cassini.today.src,
      imageAlt: nasaChapterImages.cassini.today.alt,
      caption: nasaChapterImages.cassini.today.caption,
      paragraphs: [
        "After 294 orbits, Cassini was running low on fuel. Rather than risk hitting a moon that might hold life, the team aimed it at Saturn.",
        "In 2017 it made 22 daring dives between the planet and its rings — the Grand Finale — and sent data until the moment it touched the atmosphere.",
        "Cassini’s data is still in use today. Scientists are still finding new things in 13 years of pictures and measurements.",
      ],
      keywords: ["Grand Finale", "22 daring dives", "still in use"],
    },
  ],
};

const curatedStories: Record<string, MissionProfile> = {
  maven,
  cassini,
};

/* ------------------------------------------------------------- fallbacks */

function craftType(entry: MissionControlEntry) {
  const head = entry.target.split("·")[0]?.trim().toLowerCase() ?? "";
  const known = ["orbiter", "lander", "flyby", "rover", "probe", "relay", "helicopter"];
  return known.find((word) => head === word || head.startsWith(word)) ?? "spacecraft";
}

function article(word: string) {
  return /^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`;
}

/**
 * Page 3 stores three different things in `target`: a real descriptor
 * ("Orbiter · 294 orbits"), a mission headline ("The first spacecraft to orbit
 * Jupiter.") or a bare status word ("Still exploring"). Only the first two are
 * worth repeating on the story page, so they are untangled here.
 */
const PLACE_OR_YEAR = /^(?:[A-Z][a-z]+|(?:19|20)\d{2})$/;

function readTarget(entry: MissionControlEntry) {
  const raw = entry.target.trim();
  if (!raw || /^(still exploring|retired explorer)$/i.test(raw)) {
    return { headline: null, descriptor: null };
  }
  if (raw.endsWith(".")) return { headline: raw, descriptor: null };

  const parts = raw
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  // "Lander · Titan" and "Flyby · 1980" end at the destination; "Titan · in
  // development" starts with it.
  const descriptor = PLACE_OR_YEAR.test(last) ? last : PLACE_OR_YEAR.test(first) ? first : null;

  return { headline: null, descriptor };
}

function launchYear(entry: MissionControlEntry) {
  const fromYears = entry.years.split(/[–—-]/)[0]?.trim();
  if (fromYears && /^\d{4}$/.test(fromYears)) return fromYears;
  const stat = entry.stats.find((item) => /launch/i.test(item.label));
  return stat?.value ?? entry.years;
}

/** Page 3 writes open-ended ranges as "2024–"; say "2024–now" instead. */
function yearSpan(entry: MissionControlEntry) {
  const span = entry.years.trim();
  if (/[–—-]$/.test(span)) return `${span.replace(/\s*[–—-]\s*$/, "")}–now`;
  return span;
}

function lastImage(entry: MissionControlEntry, fallback: string) {
  return entry.media[1]?.src ?? entry.media[0]?.src ?? fallback;
}

/**
 * Builds a complete, honest five-chapter page from the page-3 mission data.
 * Curated missions get hand-written chapters; everything else lands here so no
 * mission link is ever a dead end. Uses real NASA chapter imagery when known,
 * and otherwise picks distinct images per chapter from available mission/planet media.
 */
function buildFallbackProfile(
  entry: MissionControlEntry,
  planetId: string,
  planetName: string,
): MissionProfile {
  const planet = planetById[planetId];
  const story = planetStories[planetId];
  const planetImage = planet?.hero ?? planet?.src ?? entry.heroImage;
  const kind = craftType(entry);
  const active = entry.status === "active";
  const year = launchYear(entry);
  const { headline, descriptor } = readTarget(entry);
  const where = descriptor ? `${planetName} · ${descriptor}` : `${planetName} · ${yearSpan(entry)}`;
  const keywords = [entry.name, planetName];

  const media0 = entry.media[0];
  const media1 = entry.media[1];
  const media2 = entry.media[2];
  const pick = (m: MissionMedia | undefined, fallback: string, fallbackAlt: string, fallbackCap: string): ChapterImage => {
    if (m?.src) return { src: m.src, alt: fallbackAlt, caption: m.caption || fallbackCap };
    return { src: fallback, alt: fallbackAlt, caption: fallbackCap };
  };

  const known = nasaChapterImages[entry.id];
  const defaults: ChapterImageSet = {
    beginning: known?.beginning ?? pick(media0, entry.heroImage, `${entry.name} mission image`, `${entry.name} — mission imagery from the NASA archive.`),
    spacecraft: known?.spacecraft ?? pick(media1, planetImage, `${entry.name} at ${planetName}`, `${planetName} and mission hardware imagery from the NASA archive.`),
    journey: known?.journey ?? {
      src: planetImage,
      alt: `${planetName}, the destination world`,
      caption: `${planetName}, the destination for ${entry.name}.`,
    },
    discoveries: known?.discoveries ?? pick(media2 ?? media1, planetImage, `${planetName} from the NASA planetary archive`, `Discoveries at ${planetName} captured by visiting missions.`),
    today: known?.today ?? {
      src: active ? (media0?.src ?? entry.heroImage) : (planetImage || entry.heroImage),
      alt: active ? `${entry.name} still exploring ${planetName}` : `${planetName} after the ${entry.name} mission`,
      caption: active
        ? `${entry.name} continues its mission (${yearSpan(entry)}).`
        : `${entry.name} completed its mission (${yearSpan(entry)}), and its data lives on.`,
    },
  };

  // Ensure chapters are visually distinct even without a known NASA set.
  const imgs = [defaults.beginning.src, defaults.spacecraft.src, defaults.journey.src, defaults.discoveries.src, defaults.today.src];
  const uniqFallbacks = [entry.heroImage, media0?.src, media1?.src, media2?.src, planetImage, img.planetEarth, img.planetMars, img.planetJupiter, img.planetSaturn]
    .filter((s): s is string => Boolean(s));
  for (let i = 0; i < imgs.length; i++) {
    if (imgs.filter((s) => s === imgs[i]).length > 1) {
      const replacement = uniqFallbacks.find((u) => !imgs.includes(u) || u === imgs[i]) ?? uniqFallbacks[i % uniqFallbacks.length];
      if (replacement && replacement !== imgs[i]) {
        imgs[i] = replacement;
        const key = (["beginning", "spacecraft", "journey", "discoveries", "today"] as const)[i];
        defaults[key] = { ...defaults[key], src: replacement };
      }
    }
  }

  return {
    id: entry.id,
    name: entry.name,
    fullName: `${entry.agency} mission to ${planetName}`,
    agency: entry.agency,
    status: entry.status,
    planetId,
    planetName,
    launch: year,
    orbit: where,
    orbitLabel: "Where",
    goal: headline ?? `Explore ${planetName} up close.`,
    image: entry.heroImage,
    imageAlt: `${planetName}, from the NASA planetary archive`,
    imageCaption: `${planetName}, from the NASA planetary archive.`,
    nasaUrl: entry.href,
    facts: entry.stats,
    chapters: [
      {
        id: "beginning",
        tab: "The Beginning",
        title: "The Beginning",
        question: `Why was ${entry.name} launched?`,
        image: defaults.beginning.src,
        imageAlt: defaults.beginning.alt,
        caption: defaults.beginning.caption,
        paragraphs: [
          entry.summary,
          `Every mission begins with a question, and ${entry.name} was sent to help answer one about ${planetName}. The team that built it is ${entry.agency}.`,
          story?.intro ??
            `The atlas tracks this ${kind} as one of the explorers that shaped what we know about ${planetName}.`,
        ],
        keywords,
      },
      {
        id: "spacecraft",
        tab: "The Spacecraft",
        title: "The Spacecraft",
        question: `What is ${entry.name}?`,
        image: defaults.spacecraft.src,
        imageAlt: defaults.spacecraft.alt,
        caption: defaults.spacecraft.caption,
        paragraphs: [
          `${entry.name} is a ${kind} built for ${planetName}. ${entry.agency} runs the mission.`,
          `Every part has to survive the launch, the long cruise and the cold of deep space before it can do any science at all.`,
          `The spacecraft’s job is simple to describe and hard to do: arrive safely, then turn ${planetName} into data.`,
        ],
        keywords,
      },
      {
        id: "journey",
        tab: "The Journey",
        title: "The Journey",
        question: `How did ${entry.name} get to ${planetName}?`,
        image: defaults.journey.src,
        imageAlt: defaults.journey.alt,
        caption: defaults.journey.caption,
        paragraphs: [
          `${entry.name} left Earth in ${year}. Missions like this spend years being designed and tested before the rocket ever lights.`,
          `At ${planetName} it works as ${article(kind)}, turning the planet into data one measurement at a time.`,
          `Everything the spacecraft sees travels back as radio signals, crossing millions of kilometres of empty space to reach the team on Earth.`,
        ],
        keywords,
      },
      {
        id: "discoveries",
        tab: "The Discoveries",
        title: "The Discoveries",
        question: `What has ${entry.name} taught us?`,
        image: defaults.discoveries.src,
        imageAlt: defaults.discoveries.alt,
        caption: defaults.discoveries.caption,
        paragraphs: [
          story?.intro ?? `${planetName} is still full of open questions.`,
          `${entry.name} is one of the explorers that keeps ${planetName} from being just a dot in a telescope.`,
          `Every measurement adds to a shared record. Astronomers who have never touched the spacecraft still use its data years later.`,
        ],
        keywords,
      },
      {
        id: "today",
        tab: "Mission Today",
        title: "Mission Today",
        question: active ? `Where is ${entry.name} now?` : `What is left of ${entry.name}?`,
        image: defaults.today.src,
        imageAlt: defaults.today.alt,
        caption: defaults.today.caption,
        paragraphs: [
          active
            ? `${entry.name} is still exploring today (${yearSpan(entry)}). Its data keeps arriving, and the team keeps finding new ways to use it.`
            : `${entry.name} has retired after ${yearSpan(entry)}. The spacecraft is quiet, but its archive is not.`,
          active
            ? `Missions like this one are marked green on the atlas: still exploring, still sending home news.`
            : `Retired explorers are marked orange on the atlas. Their pictures and measurements stay available to anyone who wants to ask a new question.`,
          `Open the mission control panel for ${planetName} to compare it with the other explorers at this world.`,
        ],
        keywords,
      },
    ],
  };
}

/* ---------------------------------------------------------------- lookup */

/** Every mission id that has a hand-written story. */
export const curatedMissionIds = Object.keys(curatedStories);

/**
 * Resolves a mission id to a full five-chapter profile.
 * Returns null when the id is unknown, which page 4 renders as a friendly
 * "mission not found" state.
 */
export function getMissionStory(id: string): MissionProfile | null {
  const key = id.trim().toLowerCase();
  if (!key) return null;

  const curated = curatedStories[key];
  if (curated) return curated;

  for (const [planetId, data] of Object.entries(missionControl)) {
    const entry = data.entries.find((item) => item.id === key);
    if (entry) return buildFallbackProfile(entry, planetId, data.planetName);
  }

  return null;
}

/**
 * Story lookup that also reaches the NASA catalog missions.
 *
 * The catalog's chapter data is loaded on demand, so page 4 awaits this once
 * and keeps showing whatever the sync lookup already resolved.
 */
export async function getMissionStoryAsync(id: string): Promise<MissionProfile | null> {
  const immediate = getMissionStory(id);
  if (immediate) return immediate;

  const { nasaStoryFor } = await import("./nasaStories");
  return nasaStoryFor(id);
}

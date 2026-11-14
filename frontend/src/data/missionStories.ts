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
  aliases?: string[];
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

/* --- VERIFIED_CURATED_MISSIONS_START --- */

/* ---------------------------------------------------- Apollo 11 (Moon) */
export const apollo_11: MissionProfile = {
  "id": "apollo-11",
  "name": "Apollo 11",
  "fullName": "Apollo 11 Lunar Landing Mission",
  "agency": "NASA",
  "status": "retired",
  "planetId": "moon",
  "planetName": "Moon",
  "launch": "16 Jul 1969 · Saturn V, Kennedy Space Center",
  "orbit": "Tranquility Base (0.67408° N, 23.47297° E)",
  "orbitLabel": "Landing Site",
  "goal": "First crewed landing on the Moon and safe return to Earth",
  "image": "https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~orig.jpg",
  "imageAlt": "Buzz Aldrin stands beside the solar wind experiment and Lunar Module at Tranquility Base",
  "imageCaption": "Buzz Aldrin on the lunar surface during Apollo 11. (NASA)",
  "nasaUrl": "https://science.nasa.gov/mission/apollo-11/",
  "facts": [
    {
      "value": "1969",
      "label": "Landed"
    },
    {
      "value": "2",
      "label": "Moonwalkers"
    },
    {
      "value": "21.5 h",
      "label": "Surface Stay"
    },
    {
      "value": "47.5 lb",
      "label": "Samples"
    }
  ],
  "aliases": [
    "apollo11"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Apollo 11 launched?",
      "image": "https://images-assets.nasa.gov/image/6900540/6900540~orig.jpg",
      "imageAlt": "Apollo 11 Saturn V rocket launches from Pad 39A",
      "caption": "Saturn V rocket lifts off carrying Apollo 11, 16 July 1969. (NASA)",
      "paragraphs": [
        "• NASA launched Apollo 11 to achieve humanity's bold dream of landing humans on the Moon.",
        "• A massive Saturn V rocket lifted off from Florida on July 16, 1969.",
        "• Three brave astronauts flew inside the spacecraft on an unprecedented journey across deep space."
      ],
      "keywords": [
        "Apollo 11",
        "Saturn V",
        "landing humans on the Moon",
        "July 16, 1969"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Apollo 11 made of?",
      "image": "https://images-assets.nasa.gov/image/as11-36-5389/as11-36-5389~orig.jpg",
      "imageAlt": "Interior view of the Apollo 11 Lunar Module flight deck controls",
      "caption": "Interior view of the Apollo 11 Lunar Module flight controls. (NASA)",
      "paragraphs": [
        "• The Apollo 11 spacecraft combined a command module, service module, and lunar landing module.",
        "• The lunar module Eagle carried two astronauts down to the dusty lunar surface safely.",
        "• Lightweight aluminum walls and sparkling gold foil protected fragile systems from severe space temperatures."
      ],
      "keywords": [
        "command module",
        "lunar module Eagle",
        "gold foil",
        "aluminum walls"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Apollo 11 get to the Moon?",
      "image": "https://images-assets.nasa.gov/image/as11-37-5445/as11-37-5445~orig.jpg",
      "imageAlt": "Apollo 11 Command and Service modules in lunar orbit photographed from Eagle",
      "caption": "Command module Columbia in lunar orbit, photographed from the descending Eagle. (NASA)",
      "paragraphs": [
        "• Apollo 11 traveled nearly a quarter million miles from Earth over three quiet days.",
        "• Neil Armstrong manually piloted the lander past dangerous boulders to a smooth touchdown spot.",
        "• Eagle touched down at Tranquility Base with less than one minute of fuel remaining."
      ],
      "keywords": [
        "quarter million miles",
        "Neil Armstrong",
        "Tranquility Base",
        "fuel remaining"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Apollo 11 find?",
      "image": "https://images-assets.nasa.gov/image/as11-40-5877/as11-40-5877~orig.jpg",
      "imageAlt": "Close-up photograph of an astronaut bootprint in the lunar soil",
      "caption": "Apollo 11 astronaut bootprint in the fine powdery lunar regolith. (NASA)",
      "paragraphs": [
        "• Neil Armstrong and Buzz Aldrin collected nearly 48 pounds of ancient lunar soil samples.",
        "• They set up scientific experiments to measure moonquakes and reflect precision lasers from Earth.",
        "• The samples proved that the Moon is completely dry without any signs of life."
      ],
      "keywords": [
        "48 pounds",
        "lunar soil samples",
        "moonquakes",
        "reflect precision lasers"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Apollo 11 today?",
      "image": "https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~orig.jpg",
      "imageAlt": "Apollo 11 Lunar Module descent stage resting silently at Tranquility Base",
      "caption": "The abandoned Apollo 11 descent stage resting at Tranquility Base. (NASA)",
      "paragraphs": [
        "• The abandoned descent stage of Eagle still rests quietly at Tranquility Base today.",
        "• Leftover scientific gear, the American flag, and memorial plaques remain preserved in vacuum.",
        "• NASA's Lunar Reconnaissance Orbiter still spots the landing site clearly from orbit today."
      ],
      "keywords": [
        "abandoned descent stage",
        "Tranquility Base",
        "memorial plaques",
        "Lunar Reconnaissance Orbiter"
      ]
    }
  ]
};


/* ---------------------------------------------------- Apollo 17 (Moon) */
export const apollo_17: MissionProfile = {
  "id": "apollo-17",
  "name": "Apollo 17",
  "fullName": "Apollo 17 Final Lunar Landing Expedition",
  "agency": "NASA",
  "status": "retired",
  "planetId": "moon",
  "planetName": "Moon",
  "launch": "7 Dec 1972 · Saturn V, Kennedy Space Center",
  "orbit": "Taurus-Littrow Valley (20.19080° N, 30.77168° E)",
  "orbitLabel": "Landing Site",
  "goal": "Final Apollo lunar expedition, deep field geology and rover exploration",
  "image": "https://images-assets.nasa.gov/image/as17-140-21496/as17-140-21496~orig.jpg",
  "imageAlt": "Scientist-astronaut Harrison Schmitt with Lunar Roving Vehicle and American flag at Taurus-Littrow",
  "imageCaption": "Geologist Harrison Schmitt beside the Lunar Rover at Taurus-Littrow. (NASA)",
  "nasaUrl": "https://science.nasa.gov/mission/apollo-17/",
  "facts": [
    {
      "value": "1972",
      "label": "Landed"
    },
    {
      "value": "3",
      "label": "Crew Members"
    },
    {
      "value": "75 h",
      "label": "Surface Stay"
    },
    {
      "value": "243 lb",
      "label": "Samples"
    }
  ],
  "aliases": [
    "apollo17"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Apollo 17 launched?",
      "image": "https://images-assets.nasa.gov/image/S72-55070/S72-55070~orig.jpg",
      "imageAlt": "Spectacular nighttime liftoff of Apollo 17 Saturn V rocket from Launch Complex 39A",
      "caption": "Apollo 17 nighttime Saturn V launch from Kennedy Space Center, 7 Dec 1972. (NASA)",
      "paragraphs": [
        "• Apollo 17 launched as the final crewed Apollo mission to explore the lunar surface.",
        "• The mighty Saturn V rocket blasted off at night on December 7, 1972.",
        "• Astronauts Gene Cernan, Harrison Schmitt, and Ronald Evans flew this ambitious scientific expedition."
      ],
      "keywords": [
        "Apollo 17",
        "Saturn V",
        "December 7, 1972",
        "scientific expedition"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Apollo 17 made of?",
      "image": "https://images-assets.nasa.gov/image/as17-147-22527/as17-147-22527~orig.jpg",
      "imageAlt": "Challenger Lunar Module and Lunar Roving Vehicle on the lunar surface",
      "caption": "Lunar Module Challenger and the Lunar Rover deployed at Taurus-Littrow. (NASA)",
      "paragraphs": [
        "• The lunar module Challenger served as the crew's scientific base camp on the Moon.",
        "• An electric Lunar Roving Vehicle allowed the astronauts to drive across rugged lunar valleys.",
        "• Advanced drill tools and cameras helped harvest geological treasures across three intensive days."
      ],
      "keywords": [
        "Challenger",
        "Lunar Roving Vehicle",
        "base camp",
        "geological treasures"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Apollo 17 get to the Moon?",
      "image": "https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~orig.jpg",
      "imageAlt": "Famous Blue Marble photograph of Earth taken from Apollo 17",
      "caption": "The Blue Marble photograph of Earth captured during Apollo 17's journey. (NASA)",
      "paragraphs": [
        "• During the voyage, the crew snapped the famous Blue Marble photograph of planet Earth.",
        "• Challenger descended precisely into the narrow Taurus-Littrow valley bordered by towering lunar mountains.",
        "• Astronauts spent seventy-five hours on the surface, setting records for human lunar exploration."
      ],
      "keywords": [
        "Blue Marble",
        "Taurus-Littrow valley",
        "seventy-five hours",
        "records"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Apollo 17 find?",
      "image": "https://images-assets.nasa.gov/image/as17-137-20990/as17-137-20990~orig.jpg",
      "imageAlt": "Astronaut Harrison Schmitt stands next to a gigantic split lunar boulder at Station 6",
      "caption": "Harrison Schmitt studying a massive split boulder at Station 6. (NASA)",
      "paragraphs": [
        "• Geologist Harrison Schmitt discovered distinctive orange volcanic glass beads created by ancient fiery eruptions.",
        "• The crew gathered over 240 pounds of rocks, the largest sample haul of Apollo.",
        "• Exploration showed that volcanic activity shaped the Moon long after its initial formation."
      ],
      "keywords": [
        "Harrison Schmitt",
        "orange volcanic glass",
        "240 pounds of rocks",
        "volcanic activity"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Apollo 17 today?",
      "image": "https://images-assets.nasa.gov/image/S72-55421/S72-55421~orig.jpg",
      "imageAlt": "Ascent stage of Challenger blasts off leaving the descent stage and rover behind",
      "caption": "Liftoff of Challenger ascent stage filmed by the abandoned rover camera. (NASA)",
      "paragraphs": [
        "• The Challenger descent stage remains permanently parked on the valley floor at Taurus-Littrow.",
        "• Lunar Roving Vehicle 3 sits quietly nearby, its television camera pointed toward the stars.",
        "• Eugene Cernan left the final human footprints on the Moon before departing for Earth."
      ],
      "keywords": [
        "permanently parked",
        "Lunar Roving Vehicle 3",
        "television camera",
        "final human footprints"
      ]
    }
  ]
};


/* ---------------------------------------------------- Surveyor 1 (Moon) */
export const surveyor_1: MissionProfile = {
  "id": "surveyor-1",
  "name": "Surveyor 1",
  "fullName": "Surveyor 1 Lunar Soft Lander",
  "agency": "NASA",
  "status": "retired",
  "planetId": "moon",
  "planetName": "Moon",
  "launch": "30 May 1966 · Atlas-Centaur, Cape Canaveral",
  "orbit": "Ocean of Storms (2.474° S, 43.339° W)",
  "orbitLabel": "Landing Site",
  "goal": "First American gentle landing on another celestial body",
  "image": "https://images-assets.nasa.gov/image/PIA12910/PIA12910~orig.jpg",
  "imageAlt": "Surveyor 1 spacecraft resting on the lunar surface in Oceanus Procellarum",
  "imageCaption": "Surveyor 1 on the lunar surface — America's first soft lunar landing. (NASA/JPL)",
  "nasaUrl": "https://science.nasa.gov/mission/surveyor-1/",
  "facts": [
    {
      "value": "1966",
      "label": "Landed"
    },
    {
      "value": "1st",
      "label": "U.S. Soft Landing"
    },
    {
      "value": "11,237",
      "label": "Images"
    },
    {
      "value": "65 days",
      "label": "Operational"
    }
  ],
  "aliases": [
    "surveyor1"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Surveyor 1 launched?",
      "image": "https://images-assets.nasa.gov/image/66PC-325/66PC-325~orig.jpg",
      "imageAlt": "Liftoff of Atlas-Centaur rocket carrying Surveyor spacecraft from Pad 36B",
      "caption": "Atlas-Centaur launch carrying the Surveyor lander from Cape Canaveral. (NASA)",
      "paragraphs": [
        "• NASA launched Surveyor 1 to prove that robotic spacecraft could gently touch down on the Moon.",
        "• An Atlas-Centaur rocket launched the mission from Cape Canaveral on May 30, 1966.",
        "• Scientists desperately needed to know if lunar dust would swallow heavy landing spacecraft."
      ],
      "keywords": [
        "Surveyor 1",
        "Atlas-Centaur rocket",
        "May 30, 1966",
        "lunar dust"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Surveyor 1 made of?",
      "image": "https://images-assets.nasa.gov/image/GRC-1964-C-71093/GRC-1964-C-71093~orig.jpg",
      "imageAlt": "Protective payload shroud for the Surveyor spacecraft in testing chamber",
      "caption": "Protective aerodynamic shroud for the Surveyor spacecraft during pre-flight checkout. (NASA)",
      "paragraphs": [
        "• Surveyor 1 was a triangular open-frame lander equipped with three shock-absorbing landing legs.",
        "• It carried a television camera, radar altimeter, and sensitive thermal sensors across its frame.",
        "• Large crushable footpads helped spread the spacecraft's weight evenly across the soft lunar regolith."
      ],
      "keywords": [
        "triangular open-frame",
        "landing legs",
        "television camera",
        "crushable footpads"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Surveyor 1 get to the Moon?",
      "image": "https://images-assets.nasa.gov/image/GRC-1963-C-67021/GRC-1963-C-67021~orig.jpg",
      "imageAlt": "Atlas-Centaur separation structural test simulating stage separation in deep space",
      "caption": "Atlas-Centaur separation test simulating high-altitude staging for Surveyor missions. (NASA)",
      "paragraphs": [
        "• The spacecraft cruised sixty-three hours across deep space directly toward the lunar target.",
        "• Retrorockets and tiny vernier thrusters slowed the descent from thousands of miles per hour.",
        "• Surveyor 1 touched down gently in the Ocean of Storms on June 2, 1966."
      ],
      "keywords": [
        "sixty-three hours",
        "retrorockets",
        "vernier thrusters",
        "Ocean of Storms"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Surveyor 1 find?",
      "image": "https://images-assets.nasa.gov/image/PIA02976/PIA02976~orig.jpg",
      "imageAlt": "Surveyor 1 casts its distinctive robotic shadow across the lunar ground",
      "caption": "Surveyor 1 casts its shadow across the lunar surface during its first afternoon. (NASA/JPL)",
      "paragraphs": [
        "• Surveyor 1 transmitted more than eleven thousand clear television pictures back to eager scientists.",
        "• Its footpads sank only two inches, proving lunar soil could easily support human astronauts.",
        "• The mission mapped local lunar rocks, craters, and temperature swings during lunar daylight."
      ],
      "keywords": [
        "eleven thousand",
        "television pictures",
        "two inches",
        "support human astronauts"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Surveyor 1 today?",
      "image": "https://images-assets.nasa.gov/image/LRC-1967-B701_P-04028/LRC-1967-B701_P-04028~large.jpg",
      "imageAlt": "Surveyor 1 on the lunar surface photographed from lunar orbit by Lunar Orbiter III",
      "caption": "Surveyor 1 resting on the Moon, photographed from orbit by Lunar Orbiter III. (NASA)",
      "paragraphs": [
        "• Surveyor 1 rests peacefully where it touched down sixty years ago in Oceanus Procellarum.",
        "• Decades later, Lunar Orbiter and LRO spacecraft photographed the abandoned lander from lunar orbit.",
        "• The historic robotic pioneer paved the safe pathway for every Apollo landing that followed."
      ],
      "keywords": [
        "Surveyor 1 rests",
        "Oceanus Procellarum",
        "photographed the abandoned lander",
        "Apollo landing"
      ]
    }
  ]
};


/* ---------------------------------------------------- Lunar Reconnaissance Orbiter (Moon) */
export const lro: MissionProfile = {
  "id": "lro",
  "name": "Lunar Reconnaissance Orbiter",
  "fullName": "Lunar Reconnaissance Orbiter (LRO)",
  "agency": "NASA",
  "status": "active",
  "planetId": "moon",
  "planetName": "Moon",
  "launch": "18 Jun 2009 · Atlas V, Cape Canaveral",
  "orbit": "Lunar Polar Orbit (50 km altitude)",
  "orbitLabel": "Orbit",
  "goal": "High-resolution 3D mapping and reconnaissance of the Moon",
  "image": "https://images-assets.nasa.gov/image/PIA18163/PIA18163~orig.jpg",
  "imageAlt": "Artist concept of Lunar Reconnaissance Orbiter mapping the lunar surface from orbit",
  "imageCaption": "Artist concept of LRO mapping the Moon from its polar orbit. (NASA/GSFC)",
  "nasaUrl": "https://science.nasa.gov/mission/lro/",
  "facts": [
    {
      "value": "2009",
      "label": "Launched"
    },
    {
      "value": "15+ yrs",
      "label": "In Lunar Orbit"
    },
    {
      "value": "Sub-meter",
      "label": "Map Resolution"
    },
    {
      "value": "Active",
      "label": "Status"
    }
  ],
  "aliases": [
    "lunar-reconnaissance-orbiter"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was LRO launched?",
      "image": "https://images-assets.nasa.gov/image/KSC-2009-3777/KSC-2009-3777~orig.jpg",
      "imageAlt": "Atlas V rocket carrying LRO and LCROSS blasts off from Launch Complex 41",
      "caption": "Liftoff of the Atlas V rocket carrying LRO and LCROSS toward the Moon, 18 June 2009. (NASA)",
      "paragraphs": [
        "• NASA launched the Lunar Reconnaissance Orbiter in 2009 to map the Moon in unprecedented detail.",
        "• An Atlas V rocket lifted the spacecraft into orbit on June 18, 2009.",
        "• The mission aimed to identify safe landing sites and potential water resources for future explorers."
      ],
      "keywords": [
        "Lunar Reconnaissance Orbiter",
        "Atlas V",
        "June 18, 2009",
        "water resources"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is LRO made of?",
      "image": "https://images-assets.nasa.gov/image/PIA12086/PIA12086~orig.jpg",
      "imageAlt": "LRO spacecraft being loaded into the Thermal Vacuum Chamber at Goddard Space Flight Center",
      "caption": "LRO undergoing thermal vacuum testing at NASA's Goddard Space Flight Center. (NASA/GSFC)",
      "paragraphs": [
        "• LRO carries seven powerful scientific instruments, including high-resolution cameras and precision laser altimeters.",
        "• A large solar array tracks the Sun to generate reliable electrical power in orbit.",
        "• Its Diviner radiometer continuously measures the extreme surface temperatures across lunar day and night."
      ],
      "keywords": [
        "seven powerful scientific instruments",
        "laser altimeters",
        "solar array",
        "Diviner radiometer"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did LRO get to the Moon?",
      "image": "https://images-assets.nasa.gov/image/KSC-2009-3753/KSC-2009-3753~orig.jpg",
      "imageAlt": "Atlas V rocket stands ready on Launch Complex 41 before the LRO/LCROSS launch",
      "caption": "The Atlas V rocket on the launch pad at Cape Canaveral before liftoff. (NASA)",
      "paragraphs": [
        "• LRO traveled four days from Earth before firing engines to enter lunar polar orbit.",
        "• Ground controllers lowered its path to a close mapping orbit just thirty miles above ground.",
        "• The spacecraft circles the Moon from pole to pole every two hours without stopping."
      ],
      "keywords": [
        "four days",
        "lunar polar orbit",
        "thirty miles",
        "pole to pole"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did LRO find?",
      "image": "https://images-assets.nasa.gov/image/PIA18138/PIA18138~orig.jpg",
      "imageAlt": "Gigantic interactive mosaic of the lunar north pole assembled from thousands of LRO frames",
      "caption": "Mosaic of the lunar north pole compiled from 10,581 LRO narrow-angle camera frames. (NASA/GSFC/ASU)",
      "paragraphs": [
        "• LRO constructed the most complete 3D elevation map of any world in our solar system.",
        "• It confirmed patches of water ice hiding inside permanently shadowed polar craters.",
        "• High-resolution cameras photographed historical Apollo relics, wheel tracks, and abandoned descent stages."
      ],
      "keywords": [
        "3D elevation map",
        "water ice",
        "Apollo relics",
        "wheel tracks"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is LRO doing now?",
      "image": "https://images-assets.nasa.gov/image/PIA23237/PIA23237~orig.jpg",
      "imageAlt": "LRO image showing fresh graben and tectonic faults on the lunar crust",
      "caption": "LRO imagery revealing young graben faults on the Moon, proving tectonic activity. (NASA/GSFC/ASU)",
      "paragraphs": [
        "• LRO remains fully active today, continuously relaying valuable scientific imagery back to Earth.",
        "• It monitors fresh meteorite impacts and scouts landing locations for NASA's upcoming Artemis missions.",
        "• Over fifteen years of constant orbital mapping have completely revolutionized our understanding of lunar history."
      ],
      "keywords": [
        "fully active today",
        "meteorite impacts",
        "Artemis missions",
        "fifteen years"
      ]
    }
  ]
};


/* ---------------------------------------------------- LCROSS (Moon) */
export const lcross: MissionProfile = {
  "id": "lcross",
  "name": "LCROSS",
  "fullName": "Lunar CRater Observation and Sensing Satellite",
  "agency": "NASA",
  "status": "retired",
  "planetId": "moon",
  "planetName": "Moon",
  "launch": "18 Jun 2009 · Atlas V, Cape Canaveral",
  "orbit": "Cabeus Crater impact site (84.9° S, 45.5° W)",
  "orbitLabel": "Impact Site",
  "goal": "Direct kinetic impact to detect and confirm lunar polar water ice",
  "image": "https://images-assets.nasa.gov/image/ARC-2009-ACD09-0086-7/ARC-2009-ACD09-0086-7~orig.jpg",
  "imageAlt": "Artist illustration of LCROSS shepherding spacecraft following the Centaur rocket toward lunar impact",
  "imageCaption": "LCROSS shepherding spacecraft following the Centaur stage into Cabeus crater. (NASA Ames)",
  "nasaUrl": "https://science.nasa.gov/mission/lcross/",
  "facts": [
    {
      "value": "2009",
      "label": "Impact Year"
    },
    {
      "value": "Cabeus",
      "label": "Target Crater"
    },
    {
      "value": "5,600 mph",
      "label": "Impact Speed"
    },
    {
      "value": "Confirmed",
      "label": "Water Ice"
    }
  ],
  "aliases": [
    "lunar-crater-observation-and-sensing-satellite"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was LCROSS launched?",
      "image": "https://images-assets.nasa.gov/image/KSC-2009-3298/KSC-2009-3298~orig.jpg",
      "imageAlt": "LCROSS spacecraft lifted inside mobile service tower at Cape Canaveral",
      "caption": "LCROSS being lifted inside the mobile service tower for mating to the Atlas V. (NASA/KSC)",
      "paragraphs": [
        "• NASA launched LCROSS to answer once and for all if ice exists on the Moon.",
        "• The satellite shared an Atlas V launch with LRO from Florida in June 2009.",
        "• Scientists devised an ingenious plan to slam spent hardware into a dark polar crater."
      ],
      "keywords": [
        "LCROSS",
        "Atlas V",
        "June 2009",
        "dark polar crater"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is LCROSS made of?",
      "image": "https://images-assets.nasa.gov/image/ARC-2008-ACD07-0073-451/ARC-2008-ACD07-0073-451~orig.jpg",
      "imageAlt": "LCROSS shepherding spacecraft flight hardware integration at NASA Ames",
      "caption": "The LCROSS shepherding spacecraft undergoing instrument integration at NASA Ames. (NASA Ames)",
      "paragraphs": [
        "• LCROSS consisted of a spent Centaur rocket stage and a trailing robotic shepherding spacecraft.",
        "• The shepherding spacecraft carried nine sensitive cameras, spectrometers, and radiometers to sample impact debris.",
        "• Its instruments were tuned specifically to detect water vapor and volatile ice compounds instantly."
      ],
      "keywords": [
        "Centaur rocket stage",
        "shepherding spacecraft",
        "nine sensitive cameras",
        "water vapor"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did LCROSS get to the Moon?",
      "image": "https://images-assets.nasa.gov/image/ARC-2009-ACD09-0086-1/ARC-2009-ACD09-0086-1~orig.jpg",
      "imageAlt": "Centaur upper stage separates from LCROSS spacecraft heading toward the Moon",
      "caption": "Artist concept of the Centaur rocket separating from the LCROSS shepherding spacecraft. (NASA Ames)",
      "paragraphs": [
        "• LCROSS entered a long looping polar orbit around Earth to position for its target.",
        "• On October 9, 2009, controllers guided the Centaur upper stage toward Cabeus crater.",
        "• The spent rocket struck the freezing shadows at over five thousand miles per hour."
      ],
      "keywords": [
        "looping polar orbit",
        "October 9, 2009",
        "Cabeus crater",
        "five thousand miles per hour"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did LCROSS find?",
      "image": "https://images-assets.nasa.gov/image/ARC-2009-ACD09-0220-126/ARC-2009-ACD09-0220-126~orig.jpg",
      "imageAlt": "Thermal camera capture of the kinetic impact flash inside Cabeus crater",
      "caption": "LCROSS infrared camera captures the warm impact flash inside Cabeus crater. (NASA Ames)",
      "paragraphs": [
        "• The violent kinetic impact threw up a towering plume of gas and pulverized dust.",
        "• Trailing instruments detected about two hundred fifty pounds of water vapor inside the debris plume.",
        "• The dramatic experiment proved that deep lunar craters hold significant deposits of water ice."
      ],
      "keywords": [
        "kinetic impact",
        "two hundred fifty pounds",
        "water vapor",
        "deposits of water ice"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of LCROSS today?",
      "image": "https://images-assets.nasa.gov/image/PIA18139/PIA18139~orig.jpg",
      "imageAlt": "Mosaic map of the lunar south pole showing Cabeus crater and permanently shadowed regions",
      "caption": "Cabeus crater at the lunar south pole, permanent resting place of LCROSS hardware. (NASA/GSFC)",
      "paragraphs": [
        "• Both the Centaur rocket and shepherding spacecraft rest forever at the bottom of Cabeus crater.",
        "• Their deliberate sacrifice provided foundational evidence for future lunar water extraction and polar outposts.",
        "• Today, LCROSS stands as a landmark example of converting discarded space equipment into breakthrough science."
      ],
      "keywords": [
        "Centaur rocket",
        "Cabeus crater",
        "water extraction",
        "discarded space equipment"
      ]
    }
  ]
};


/* ---------------------------------------------------- Clementine (Moon) */
export const clementine: MissionProfile = {
  "id": "clementine",
  "name": "Clementine",
  "fullName": "Deep Space Program Science Experiment (Clementine)",
  "agency": "NASA / BMDO",
  "status": "retired",
  "planetId": "moon",
  "planetName": "Moon",
  "launch": "25 Jan 1994 · Titan II, Vandenberg AFB",
  "orbit": "Lunar Polar Orbit (400 × 2,940 km)",
  "orbitLabel": "Orbit",
  "goal": "First global multispectral digital mapping of the Moon",
  "image": "https://images-assets.nasa.gov/image/PIA00302/PIA00302~orig.jpg",
  "imageAlt": "Nearside of Earth's Moon captured in multispectral detail by Clementine",
  "imageCaption": "Full lunar disc mosaic generated from Clementine's UV/Visible camera. (NASA/JPL)",
  "nasaUrl": "https://science.nasa.gov/mission/clementine/",
  "facts": [
    {
      "value": "1994",
      "label": "Launched"
    },
    {
      "value": "1.8M",
      "label": "Images Captured"
    },
    {
      "value": "71 days",
      "label": "Mapping"
    },
    {
      "value": "Global",
      "label": "Mineral Map"
    }
  ],
  "aliases": [
    "dspse-clementine"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Clementine launched?",
      "image": "https://images-assets.nasa.gov/image/PIA00432/PIA00432~orig.jpg",
      "imageAlt": "Clementine camera images Earth rising above the limb of the Moon",
      "caption": "Earth rising over the northern lunar limb, imaged by Clementine during testing. (NASA/JPL)",
      "paragraphs": [
        "• NASA and the defense department launched Clementine in 1994 to test lightweight space technologies.",
        "• A Titan II rocket boosted the compact robotic spacecraft into space on January 25, 1994.",
        "• Scientists seized the unique opportunity to perform the first complete global multispectral lunar map."
      ],
      "keywords": [
        "Clementine",
        "Titan II rocket",
        "January 25, 1994",
        "multispectral lunar map"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Clementine made of?",
      "image": "https://images-assets.nasa.gov/image/PIA00434/PIA00434~orig.jpg",
      "imageAlt": "Clementine star tracker image capturing the Moon, solar corona, and Venus",
      "caption": "Clementine star tracker navigation camera captures the Moon, solar corona, and Venus. (NASA/JPL)",
      "paragraphs": [
        "• Clementine carried advanced military sensors including ultraviolet, visible, and near-infrared cameras.",
        "• A precision laser ranging system accurately measured the depths of towering mountains and craters.",
        "• Innovative lightweight composite structures kept total spacecraft mass under five hundred pounds."
      ],
      "keywords": [
        "ultraviolet",
        "near-infrared cameras",
        "laser ranging system",
        "composite structures"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Clementine get to the Moon?",
      "image": "https://images-assets.nasa.gov/image/PIA00304/PIA00304~orig.jpg",
      "imageAlt": "Farside of the Moon mosaic assembled from Clementine's mapping orbit",
      "caption": "Farside of the Moon mapped by Clementine during its polar orbital survey. (NASA/JPL)",
      "paragraphs": [
        "• The probe used two lunar gravity assists to enter a stable five-hour polar lunar orbit.",
        "• Over seventy-one days, Clementine systematically swept over every latitude of the revolving Moon.",
        "• It captured nearly two million digital images covering the entire lunar globe seamlessly."
      ],
      "keywords": [
        "polar lunar orbit",
        "seventy-one days",
        "two million digital images",
        "entire lunar globe"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Clementine find?",
      "image": "https://images-assets.nasa.gov/image/PIA00001/PIA00001~orig.jpg",
      "imageAlt": "South Pole Region of the Moon as seen by Clementine where ice hints were found",
      "caption": "Clementine mosaic of the lunar south pole revealing permanently shadowed impact craters. (NASA/JPL)",
      "paragraphs": [
        "• Clementine revealed the enormous South Pole-Aitken Basin, one of the solar system's largest impact craters.",
        "• Bistatic radar reflections provided the first tantalizing scientific hints of water ice at lunar poles.",
        "• Its multispectral images allowed geologists to map lunar titanium, iron, and mineral concentrations globally."
      ],
      "keywords": [
        "South Pole-Aitken Basin",
        "Bistatic radar",
        "water ice at lunar poles",
        "mineral concentrations"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Clementine today?",
      "image": "https://images-assets.nasa.gov/image/PIA00002/PIA00002~orig.jpg",
      "imageAlt": "North Pole Region of the Moon mosaic created from Clementine mapping frames",
      "caption": "North polar mosaic of the Moon from the Clementine mission archive. (NASA/JPL)",
      "paragraphs": [
        "• After completing its lunar mapping campaign, Clementine departed Moon orbit into deep solar space.",
        "• Its groundbreaking data set remains an open treasure archive studied by planetary researchers today.",
        "• The humble mission reignited worldwide interest in returning to explore lunar polar ice deposits."
      ],
      "keywords": [
        "deep solar space",
        "open treasure archive",
        "reignited worldwide interest",
        "polar ice deposits"
      ]
    }
  ]
};


/* ---------------------------------------------------- Opportunity (Mars) */
export const opportunity: MissionProfile = {
  "id": "opportunity",
  "name": "Opportunity",
  "fullName": "Mars Exploration Rover B (Opportunity)",
  "agency": "NASA / JPL",
  "status": "retired",
  "planetId": "mars",
  "planetName": "Mars",
  "launch": "7 Jul 2003 · Delta II, Cape Canaveral",
  "orbit": "Endeavour Crater (1.9483° S, 354.47417° E)",
  "orbitLabel": "Landing Site",
  "goal": "Search for evidence of past water activity and past habitability on Mars",
  "image": "https://images-assets.nasa.gov/image/PIA04413/PIA04413~orig.jpg",
  "imageAlt": "Opportunity rover undergoing final mobility tests before launch to Mars",
  "imageCaption": "Opportunity undergoing testing before its journey to Mars. (NASA/JPL)",
  "nasaUrl": "https://science.nasa.gov/mission/opportunity/",
  "facts": [
    {
      "value": "2004",
      "label": "Landed"
    },
    {
      "value": "14.5 yrs",
      "label": "Active"
    },
    {
      "value": "28.06 mi",
      "label": "Distance Driven"
    },
    {
      "value": "217k",
      "label": "Images"
    }
  ],
  "aliases": [
    "mer-opportunity",
    "mars-retired-1"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Opportunity launched?",
      "image": "https://images-assets.nasa.gov/image/PIA04829/PIA04829~orig.jpg",
      "imageAlt": "Mars Exploration Rover mission concept and launch preparation",
      "caption": "The Mars Exploration Rover mission set out for Meridiani Planum. (NASA/JPL)",
      "paragraphs": [
        "• NASA launched Opportunity in 2003 on a daring mission to find signs of past water.",
        "• A Delta II rocket lifted the rover into the night sky on July 7, 2003.",
        "• Engineers designed Opportunity to survive ninety Martian days in a harsh, cold desert world."
      ],
      "keywords": [
        "Opportunity",
        "past water",
        "Delta II rocket",
        "ninety Martian days"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Opportunity made of?",
      "image": "https://images-assets.nasa.gov/image/PIA05157/PIA05157~orig.jpg",
      "imageAlt": "Opportunity robotic arm and instrument payload deployed on Mars",
      "caption": "Opportunity deploys its instrument arm to examine the Martian soil. (NASA/JPL)",
      "paragraphs": [
        "• Opportunity was a golf-cart-sized rover powered by a wide deck of dark solar panels.",
        "• A robotic arm held microscopes, rock abrasion grinders, and sensitive mineral-identifying spectrometers.",
        "• Six independent aluminum wheels allowed the rover to climb steep crater slopes and loose sands."
      ],
      "keywords": [
        "solar panels",
        "robotic arm",
        "rock abrasion grinders",
        "aluminum wheels"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Opportunity get to Mars?",
      "image": "https://images-assets.nasa.gov/image/PIA04832/PIA04832~orig.jpg",
      "imageAlt": "Illustration of Opportunity bouncing onto the Martian surface inside cushioning airbags",
      "caption": "Opportunity's bouncing airbag touchdown delivered it into Eagle Crater in 2004. (NASA/JPL)",
      "paragraphs": [
        "• Opportunity cruised six months through deep interplanetary space before diving into the Martian atmosphere.",
        "• Protected by parachutes and giant airbags, it bounced safely to rest inside tiny Eagle Crater.",
        "• The rover touched down on the smooth plains of Meridiani Planum on January 25, 2004."
      ],
      "keywords": [
        "cruised six months",
        "cushioning airbags",
        "Eagle Crater",
        "Meridiani Planum"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Opportunity find?",
      "image": "https://images-assets.nasa.gov/image/PIA05230/PIA05230~orig.jpg",
      "imageAlt": "Hematite blueberries discovered by Opportunity embedded in Martian sedimentary bedrock",
      "caption": "Opportunity's microscopic imager reveals hematite 'blueberries' formed in liquid groundwater. (NASA/JPL)",
      "paragraphs": [
        "• Opportunity immediately discovered tiny hematite spheres nicknamed blueberries formed in ancient liquid groundwater.",
        "• It explored giant impact basins including Endurance, Victoria, and Endeavour craters across many miles.",
        "• Its scientific measurements proved that liquid water once soaked the surface for extended periods."
      ],
      "keywords": [
        "hematite blueberries",
        "liquid groundwater",
        "Endeavour craters",
        "liquid water"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Opportunity today?",
      "image": "https://images-assets.nasa.gov/image/PIA17759/PIA17759~orig.jpg",
      "imageAlt": "Panorama from the rim of Endeavour Crater where Opportunity explored",
      "caption": "Opportunity's final trekking ground along the rim of Endeavour Crater. (NASA/JPL-Caltech)",
      "paragraphs": [
        "• Opportunity drove over twenty-eight miles before a ferocious global dust storm ended its journey in 2018.",
        "• The silent rover now rests forever on the rim of Endeavour Crater at Perseverance Valley.",
        "• It remains celebrated as one of NASA's most enduring and beloved planetary exploration relics."
      ],
      "keywords": [
        "twenty-eight miles",
        "global dust storm",
        "Perseverance Valley",
        "beloved planetary exploration relics"
      ]
    }
  ]
};


/* ---------------------------------------------------- Spirit (Mars) */
export const spirit: MissionProfile = {
  "id": "spirit",
  "name": "Spirit",
  "fullName": "Mars Exploration Rover A (Spirit)",
  "agency": "NASA / JPL",
  "status": "retired",
  "planetId": "mars",
  "planetName": "Mars",
  "launch": "10 Jun 2003 · Delta II, Cape Canaveral",
  "orbit": "Gusev Crater (14.5684° S, 175.47263° E)",
  "orbitLabel": "Landing Site",
  "goal": "Explore ancient lakebed sediments inside Gusev Crater",
  "image": "https://images-assets.nasa.gov/image/PIA05040/PIA05040~orig.jpg",
  "imageAlt": "Spirit rover fully unfolded during cleanroom checkout at Kennedy Space Center",
  "imageCaption": "Spirit undergoing deployment and checkout testing before launch. (NASA/JPL)",
  "nasaUrl": "https://science.nasa.gov/mission/mer-spirit/",
  "facts": [
    {
      "value": "2004",
      "label": "Landed"
    },
    {
      "value": "6.2 yrs",
      "label": "Active"
    },
    {
      "value": "4.8 mi",
      "label": "Driven"
    },
    {
      "value": "128k",
      "label": "Images"
    }
  ],
  "aliases": [
    "mer-spirit",
    "mars-retired-2"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Spirit launched?",
      "image": "https://images-assets.nasa.gov/image/PIA04509/PIA04509~orig.jpg",
      "imageAlt": "Delta II rocket carrying Spirit lifts off from Cape Canaveral Air Force Station",
      "caption": "Spirit lifts off aboard a Delta II rocket from Cape Canaveral on 10 June 2003. (NASA)",
      "paragraphs": [
        "• NASA launched the robotic explorer Spirit in 2003 to investigate ancient lake environments on Mars.",
        "• A Delta II rocket launched Spirit from Cape Canaveral on June 10, 2003.",
        "• It served as the fearless twin sister to the Opportunity rover exploring opposite Martian hemispheres."
      ],
      "keywords": [
        "Spirit",
        "ancient lake environments",
        "Delta II rocket",
        "Opportunity rover"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Spirit made of?",
      "image": "https://images-assets.nasa.gov/image/PIA05120/PIA05120~orig.jpg",
      "imageAlt": "Spirit rover standing on its landing platform petals inside Gusev Crater",
      "caption": "Spirit resting on its unfolded lander petals before rolling onto Martian soil. (NASA/JPL)",
      "paragraphs": [
        "• Spirit carried panoramic stereo cameras mounted high on a mast like a robot neck.",
        "• Its rocker-bogie suspension system distributed weight evenly to traverse rugged Martian rocks and craters.",
        "• A warm electronics box protected sensitive computers from the freezing sub-zero Martian nights."
      ],
      "keywords": [
        "panoramic stereo cameras",
        "rocker-bogie suspension",
        "electronics box",
        "sub-zero Martian nights"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Spirit get to Mars?",
      "image": "https://images-assets.nasa.gov/image/PIA05168/PIA05168~orig.jpg",
      "imageAlt": "First panoramic view of Columbia Memorial Station landing site from Spirit",
      "caption": "Columbia Memorial Station inside Gusev Crater seen from Spirit's navigation cameras. (NASA/JPL)",
      "paragraphs": [
        "• Spirit flew seven months through space, plunging through the thin atmosphere inside an aeroshell.",
        "• Cocooned in bouncy airbags, it touched down inside giant Gusev Crater on January 4, 2004.",
        "• NASA named the landing location Columbia Memorial Station to honor the fallen shuttle astronauts."
      ],
      "keywords": [
        "seven months",
        "Gusev Crater",
        "January 4, 2004",
        "Columbia Memorial Station"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Spirit find?",
      "image": "https://images-assets.nasa.gov/image/PIA11996/PIA11996~orig.jpg",
      "imageAlt": "Spirit image looking toward Von Braun mound and the Home Plate volcanic plateau",
      "caption": "Spirit views Von Braun mound and the silica-rich volcanic terrain of Home Plate. (NASA/JPL)",
      "paragraphs": [
        "• Spirit climbed the Columbia Hills, discovering rocks heavily altered by ancient hot volcanic springs.",
        "• When a wheel jammed, dragging it uncovered bright soil made of nearly pure silica.",
        "• The discovery proved that active hydrothermal vents once bubbled with warm water on Mars."
      ],
      "keywords": [
        "Columbia Hills",
        "volcanic springs",
        "pure silica",
        "hydrothermal vents"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Spirit today?",
      "image": "https://images-assets.nasa.gov/image/PIA05248/PIA05248~orig.jpg",
      "imageAlt": "Mars Global Surveyor orbital photo pinpointing Spirit and its lander on Mars",
      "caption": "Orbital view from Mars Global Surveyor showing Spirit's landing site in Gusev Crater. (NASA/JPL/MSSS)",
      "paragraphs": [
        "• Spirit became trapped in soft sand at a location named Troy in late 2009.",
        "• The valiant rover sent its final radio signal in March 2010 before falling silent.",
        "• Spirit rests preserved in Gusev Crater as an eternal monument to tireless robotic exploration."
      ],
      "keywords": [
        "soft sand",
        "final radio signal",
        "March 2010",
        "monument to tireless robotic exploration"
      ]
    }
  ]
};


/* ---------------------------------------------------- InSight (Mars) */
export const insight: MissionProfile = {
  "id": "insight",
  "name": "InSight",
  "fullName": "Interior Exploration using Seismic Investigations, Geodesy and Heat Transport",
  "agency": "NASA / JPL",
  "status": "retired",
  "planetId": "mars",
  "planetName": "Mars",
  "launch": "5 May 2018 · Atlas V, Vandenberg AFB",
  "orbit": "Elysium Planitia (4.5024° N, 135.6234° E)",
  "orbitLabel": "Landing Site",
  "goal": "First deep seismic and interior geological study of planet Mars",
  "image": "https://images-assets.nasa.gov/image/PIA19811/PIA19811~orig.jpg",
  "imageAlt": "Artist illustration of InSight lander deploying its dome-covered seismometer on Mars",
  "imageCaption": "Artist concept of InSight monitoring marsquakes on Elysium Planitia. (NASA/JPL-Caltech)",
  "nasaUrl": "https://science.nasa.gov/mission/insight/",
  "facts": [
    {
      "value": "2018",
      "label": "Landed"
    },
    {
      "value": "1,319",
      "label": "Marsquakes"
    },
    {
      "value": "4 yrs",
      "label": "Operating"
    },
    {
      "value": "Core & Crust",
      "label": "Mapped"
    }
  ],
  "aliases": [
    "insight-lander",
    "mars-retired-3"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was InSight launched?",
      "image": "https://images-assets.nasa.gov/image/PIA22228/PIA22228~large.jpg",
      "imageAlt": "Atlas V rocket carrying InSight lifts off into early morning fog from Vandenberg",
      "caption": "InSight launches aboard an Atlas V from Vandenberg, 5 May 2018. (NASA/JPL-Caltech)",
      "paragraphs": [
        "• NASA launched InSight in 2018 to study the mysterious deep interior of planet Mars.",
        "• An Atlas V rocket launched the probe from Vandenberg Space Force Base in California.",
        "• It marked the very first interplanetary space mission ever launched from America's west coast."
      ],
      "keywords": [
        "InSight",
        "deep interior",
        "Atlas V rocket",
        "west coast"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is InSight made of?",
      "image": "https://images-assets.nasa.gov/image/PIA22647/PIA22647~orig.jpg",
      "imageAlt": "InSight's ultra-sensitive seismometer hardware inside the cleanroom before launch",
      "caption": "InSight's SEIS instrument and Wind and Thermal Shield during assembly. (NASA/JPL-Caltech/CNES)",
      "paragraphs": [
        "• Unlike rovers, InSight was a stationary lander designed to stay in one single place.",
        "• It deployed an ultra-sensitive seismometer beneath a protective wind and thermal shield on ground.",
        "• A robotic arm carefully placed instruments onto the soil with remarkable millimeter precision."
      ],
      "keywords": [
        "stationary lander",
        "ultra-sensitive seismometer",
        "thermal shield",
        "robotic arm"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did InSight get to Mars?",
      "image": "https://images-assets.nasa.gov/image/PIA22872/PIA22872~orig.jpg",
      "imageAlt": "InSight's first clear view of Elysium Planitia taken with its instrument context camera",
      "caption": "InSight's first clear workspace view of the smooth Elysium Planitia plains. (NASA/JPL-Caltech)",
      "paragraphs": [
        "• InSight cruised six months before landing softly with pulsed retro-thrusters on November 26, 2018.",
        "• It touched down on the smooth, flat volcanic plain of Elysium Planitia on Mars.",
        "• Twin solar panels unfurled immediately to supply electrical power under the faint Martian Sun."
      ],
      "keywords": [
        "six months",
        "retro-thrusters",
        "Elysium Planitia",
        "solar panels unfurled"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did InSight find?",
      "image": "https://images-assets.nasa.gov/image/PIA23157/PIA23157~orig.jpg",
      "imageAlt": "Sunset on Mars captured by InSight's camera from Elysium Planitia",
      "caption": "A serene Martian sunset captured by InSight during its seismic campaign. (NASA/JPL-Caltech)",
      "paragraphs": [
        "• InSight detected more than thirteen hundred marsquakes, revealing that Mars is still geologically active.",
        "• Its seismic measurements accurately mapped the crust thickness, mantle composition, and molten liquid core.",
        "• The lander recorded acoustic shockwaves from giant meteorite impacts crashing into distant Martian ground."
      ],
      "keywords": [
        "thirteen hundred marsquakes",
        "geologically active",
        "molten liquid core",
        "meteorite impacts"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of InSight today?",
      "image": "https://images-assets.nasa.gov/image/PIA25287/PIA25287~orig.jpg",
      "imageAlt": "Dust-covered InSight lander selfie taken late in its mission on Mars",
      "caption": "InSight's final dusty self-portrait after four years of measuring marsquakes. (NASA/JPL-Caltech)",
      "paragraphs": [
        "• Red Martian dust slowly accumulated on the lander's solar panels over four busy years.",
        "• InSight transmitted its poignant final photograph of the dusty surface in December 2022.",
        "• The quiet robotic station remains resting at Elysium Planitia, having unlocked Mars' deep interior secrets."
      ],
      "keywords": [
        "Martian dust",
        "final photograph",
        "December 2022",
        "Elysium Planitia"
      ]
    }
  ]
};


/* ---------------------------------------------------- Phoenix (Mars) */
export const phoenix: MissionProfile = {
  "id": "phoenix",
  "name": "Phoenix",
  "fullName": "Phoenix Mars Lander",
  "agency": "NASA / University of Arizona",
  "status": "retired",
  "planetId": "mars",
  "planetName": "Mars",
  "launch": "4 Aug 2007 · Delta II, Cape Canaveral",
  "orbit": "Vastitas Borealis (68.218830° N, 234.250778° E)",
  "orbitLabel": "Landing Site",
  "goal": "First arctic touchdown to sample subterranean Martian water ice",
  "image": "https://images-assets.nasa.gov/image/KSC-07PD-1085/KSC-07PD-1085~orig.jpg",
  "imageAlt": "Phoenix Mars Lander undergoing cleanroom processing at Kennedy Space Center",
  "imageCaption": "Phoenix Mars Lander during payload integration at Kennedy Space Center. (NASA/KSC)",
  "nasaUrl": "https://science.nasa.gov/mission/phoenix/",
  "facts": [
    {
      "value": "2008",
      "label": "Landed"
    },
    {
      "value": "Arctic",
      "label": "Landing Zone"
    },
    {
      "value": "Water Ice",
      "label": "Confirmed"
    },
    {
      "value": "5 months",
      "label": "Operated"
    }
  ],
  "aliases": [
    "mars-phoenix",
    "mars-retired-4"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Phoenix launched?",
      "image": "https://images-assets.nasa.gov/image/KSC-07pd2112/KSC-07pd2112~orig.jpg",
      "imageAlt": "Phoenix Mars Lander on Launch Pad 17-A awaiting fairing installation",
      "caption": "Phoenix atop the Delta II rocket on Launch Pad 17-A at Cape Canaveral. (NASA/KSC)",
      "paragraphs": [
        "• NASA launched Phoenix in 2007 to search for habitable zones in the Martian arctic.",
        "• A Delta II rocket lifted the spacecraft into space on August 4, 2007.",
        "• Engineers recycled unused hardware from previous canceled missions, helping the lander rise like a phoenix."
      ],
      "keywords": [
        "Phoenix",
        "habitable zones",
        "Martian arctic",
        "August 4, 2007"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Phoenix made of?",
      "image": "https://images-assets.nasa.gov/image/PIA10738/PIA10738~orig.jpg",
      "imageAlt": "Martian soil and ice chunks near the footpad of the Phoenix Mars Lander",
      "caption": "Martian soil and ice uncovered near the footpad of Phoenix after landing. (NASA/JPL/UA/Max Planck)",
      "paragraphs": [
        "• Phoenix featured a lightweight three-legged landing platform equipped with a long backhoe-style robotic arm.",
        "• It carried miniature chemistry labs and ovens to bake soil and analyze vapors.",
        "• A weather station provided by Canada monitored polar atmospheric temperatures, clouds, and morning frosts."
      ],
      "keywords": [
        "three-legged landing platform",
        "robotic arm",
        "ovens to bake soil",
        "weather station"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Phoenix get to Mars?",
      "image": "https://images-assets.nasa.gov/image/PIA10729/PIA10729~orig.jpg",
      "imageAlt": "First 360-degree panorama of the northern arctic plain taken by Phoenix",
      "caption": "First color panorama of the arctic plains of Vastitas Borealis captured by Phoenix. (NASA/JPL/UA)",
      "paragraphs": [
        "• Phoenix flew nine months through space, targeting the far northern plains of Vastitas Borealis.",
        "• It entered the atmosphere safely and fired pulsed descent thrusters for a gentle landing.",
        "• On May 25, 2008, Phoenix touched down further north than any previous Mars spacecraft."
      ],
      "keywords": [
        "nine months",
        "Vastitas Borealis",
        "pulsed descent thrusters",
        "May 25, 2008"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Phoenix find?",
      "image": "https://images-assets.nasa.gov/image/PIA10740/PIA10740~orig.jpg",
      "imageAlt": "Sublimating chunks of water ice disappear from a trench dug by Phoenix over four days",
      "caption": "Sublimating water ice chunks inside the Dodo-Goldilocks trench dug by Phoenix. (NASA/JPL/UA)",
      "paragraphs": [
        "• Phoenix dug trenches in the dirt and exposed bright white patches of subterranean ice.",
        "• The ice patches vaporized into gas over days, conclusively proving they were water ice.",
        "• Chemical tests revealed perchlorate salts and alkaline soils capable of supporting microbial life forms."
      ],
      "keywords": [
        "dug trenches",
        "subterranean ice",
        "water ice",
        "supporting microbial life"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Phoenix today?",
      "image": "https://images-assets.nasa.gov/image/PIA13149/PIA13149~orig.jpg",
      "imageAlt": "MRO HiRISE orbital image showing the retired Phoenix lander on the arctic plain",
      "caption": "Phoenix resting in the arctic plain, imaged from orbit by the HiRISE camera on MRO. (NASA/JPL/UA)",
      "paragraphs": [
        "• As harsh winter approached, dwindling polar sunlight starved the solar arrays of electrical power.",
        "• Phoenix fell silent in November 2008 and was encased in thick carbon dioxide frost.",
        "• Orbital satellites regularly photograph the discarded polar lander resting peacefully in the arctic tundra."
      ],
      "keywords": [
        "dwindling polar sunlight",
        "November 2008",
        "carbon dioxide frost",
        "discarded polar lander"
      ]
    }
  ]
};


/* ---------------------------------------------------- Mars Pathfinder (Mars) */
export const mars_pathfinder: MissionProfile = {
  "id": "mars-pathfinder",
  "name": "Mars Pathfinder",
  "fullName": "Mars Pathfinder and Sojourner Rover",
  "agency": "NASA / JPL",
  "status": "retired",
  "planetId": "mars",
  "planetName": "Mars",
  "launch": "4 Dec 1996 · Delta II, Cape Canaveral",
  "orbit": "Ares Vallis (19.33° N, 335.55° E)",
  "orbitLabel": "Landing Site",
  "goal": "First wheeled robotic rover and innovative low-cost airbag landing on Mars",
  "image": "https://images-assets.nasa.gov/image/PIA00623/PIA00623~orig.jpg",
  "imageAlt": "Sojourner rover rolls down ramp onto Martian soil at Ares Vallis",
  "imageCaption": "Sojourner rover touches down on Martian soil at the Ares Vallis floodplain. (NASA/JPL)",
  "nasaUrl": "https://science.nasa.gov/mission/mars-pathfinder/",
  "facts": [
    {
      "value": "1997",
      "label": "Landed"
    },
    {
      "value": "1st",
      "label": "Wheeled Rover"
    },
    {
      "value": "23 lb",
      "label": "Rover Weight"
    },
    {
      "value": "16k",
      "label": "Images"
    }
  ],
  "aliases": [
    "pathfinder",
    "sojourner",
    "mars-retired-5"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Mars Pathfinder launched?",
      "image": "https://images-assets.nasa.gov/image/9614653/9614653~orig.jpg",
      "imageAlt": "Delta II rocket carrying Mars Pathfinder blasts off from Launch Complex 17B",
      "caption": "Mars Pathfinder lifts off aboard a Delta II rocket from Cape Canaveral, 4 Dec 1996. (NASA)",
      "paragraphs": [
        "• NASA launched Mars Pathfinder in 1996 to pioneer low-cost planetary exploration and rover mobility.",
        "• A Delta II rocket propelled the experimental mission outward on December 4, 1996.",
        "• The mission carried the very first wheeled robotic rover ever deployed on another planet."
      ],
      "keywords": [
        "Mars Pathfinder",
        "low-cost planetary exploration",
        "December 4, 1996",
        "wheeled robotic rover"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Mars Pathfinder made of?",
      "image": "https://images-assets.nasa.gov/image/PIA00627/PIA00627~orig.jpg",
      "imageAlt": "Pathfinder lander deck showing unfolded ramps and solar panels on Mars",
      "caption": "Pathfinder's lander deck and deployable ramps seen from the rover's perspective. (NASA/JPL)",
      "paragraphs": [
        "• The mission paired a pyramid-shaped lander station with a tiny microwave-oven-sized rover named Sojourner.",
        "• Sojourner weighed just twenty-three pounds and rolled on six miniature aluminum cleated wheels.",
        "• The base station featured solar panels, stereo cameras, and protective petal-shaped landing airbags."
      ],
      "keywords": [
        "Sojourner",
        "twenty-three pounds",
        "six miniature aluminum",
        "petal-shaped landing airbags"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Mars Pathfinder get to Mars?",
      "image": "https://images-assets.nasa.gov/image/PIA00621/PIA00621~orig.jpg",
      "imageAlt": "Color mosaic showing Sojourner rover on Martian terrain next to the deflated airbags",
      "caption": "Color mosaic of Sojourner on the Ares Vallis floodplain next to protective airbags. (NASA/JPL)",
      "paragraphs": [
        "• Pathfinder used an innovative direct entry trajectory, parachutes, and airbags without orbiting Mars first.",
        "• On July 4, 1997, it bounced safely to rest on the ancient Ares Vallis floodplain.",
        "• Petals opened and Sojourner rolled down a ramp onto the red Martian soil triumphantly."
      ],
      "keywords": [
        "direct entry trajectory",
        "July 4, 1997",
        "Ares Vallis floodplain",
        "rolled down a ramp"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Mars Pathfinder find?",
      "image": "https://images-assets.nasa.gov/image/PIA00921/PIA00921~orig.jpg",
      "imageAlt": "Sojourner analyzes the Martian rock named Shark with its APXS spectrometer",
      "caption": "Sojourner uses its alpha proton X-ray spectrometer to analyze the rock 'Shark'. (NASA/JPL)",
      "paragraphs": [
        "• Sojourner analyzed Martian rocks nicknamed Barnacle Bill and Yogi using its alpha proton spectrometer.",
        "• Rounded pebbles and sedimentary conglomerates confirmed that catastrophic floods once surged through Ares Vallis.",
        "• The team captured sixteen thousand breathtaking photographs that captivated millions of web users worldwide."
      ],
      "keywords": [
        "Barnacle Bill",
        "alpha proton spectrometer",
        "catastrophic floods",
        "sixteen thousand"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Mars Pathfinder today?",
      "image": "https://images-assets.nasa.gov/image/PIA01122/PIA01122~orig.jpg",
      "imageAlt": "Carl Sagan Memorial Station and Ares Vallis landscape seen in wide panorama",
      "caption": "The Carl Sagan Memorial Station resting quietly in the rocky Ares Vallis basin. (NASA/JPL)",
      "paragraphs": [
        "• Pathfinder and Sojourner completed their work after operating three times longer than planned.",
        "• NASA named the final resting base camp the Carl Sagan Memorial Station in honor.",
        "• Both historic pioneers remain resting side-by-side on the dusty gravel plains of Ares Vallis."
      ],
      "keywords": [
        "three times longer",
        "Carl Sagan Memorial Station",
        "resting side-by-side",
        "Ares Vallis"
      ]
    }
  ]
};


/* ---------------------------------------------------- Curiosity (Mars) */
export const curiosity: MissionProfile = {
  "id": "curiosity",
  "name": "Curiosity",
  "fullName": "Mars Science Laboratory (Curiosity Rover)",
  "agency": "NASA / JPL",
  "status": "active",
  "planetId": "mars",
  "planetName": "Mars",
  "launch": "26 Nov 2011 · Atlas V, Cape Canaveral",
  "orbit": "Mount Sharp, Gale Crater (4.5895° S, 137.4417° E)",
  "orbitLabel": "Current Location",
  "goal": "Investigate past habitability, liquid water history, and organic molecules on Mars",
  "image": "https://images-assets.nasa.gov/image/PIA14164/PIA14164~orig.jpg",
  "imageAlt": "Artist illustration of Curiosity rover exploring the floor of Gale Crater on Mars",
  "imageCaption": "Artist concept of the car-sized Curiosity rover exploring Gale Crater. (NASA/JPL-Caltech)",
  "nasaUrl": "https://science.nasa.gov/mission/msl-curiosity/",
  "facts": [
    {
      "value": "2012",
      "label": "Landed"
    },
    {
      "value": "12+ yrs",
      "label": "Exploring"
    },
    {
      "value": "Nuclear",
      "label": "Power Source"
    },
    {
      "value": "Habitable",
      "label": "Environment"
    }
  ],
  "aliases": [
    "msl",
    "mars-active-2"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Curiosity launched?",
      "image": "https://images-assets.nasa.gov/image/PIA14402/PIA14402~orig.jpg",
      "imageAlt": "Atlas V rocket carrying Curiosity launches from Cape Canaveral Space Launch Complex 41",
      "caption": "Curiosity lifts off on an Atlas V rocket from Cape Canaveral on 26 Nov 2011. (NASA)",
      "paragraphs": [
        "• NASA launched Curiosity in 2011 to determine if Mars ever supported microscopic living organisms.",
        "• An Atlas V rocket launched the heavy nuclear rover on November 26, 2011.",
        "• The car-sized vehicle represented the most technologically sophisticated planetary rover ever built by humans."
      ],
      "keywords": [
        "Curiosity",
        "microscopic living organisms",
        "Atlas V rocket",
        "nuclear rover"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Curiosity made of?",
      "image": "https://images-assets.nasa.gov/image/PIA14839/PIA14839~orig.jpg",
      "imageAlt": "Illustration of the rocket-powered sky crane lowering Curiosity onto Martian soil",
      "caption": "Artist concept of the sky crane maneuver lowering Curiosity to Gale Crater. (NASA/JPL-Caltech)",
      "paragraphs": [
        "• Curiosity weighs nearly a ton and carries seventeen cameras and ten scientific research instruments.",
        "• A radioisotope thermoelectric generator produces constant electrical power from the decay of plutonium fuel.",
        "• Its powerful robotic arm holds a percussive rock drill, camera, and sample processing mechanism."
      ],
      "keywords": [
        "nearly a ton",
        "seventeen cameras",
        "radioisotope thermoelectric generator",
        "percussive rock drill"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Curiosity get to Mars?",
      "image": "https://images-assets.nasa.gov/image/PIA16001/PIA16001~orig.jpg",
      "imageAlt": "Curiosity's heat shield drops away toward the floor of Gale Crater during descent",
      "caption": "MARDI camera captures Curiosity's heat shield dropping away during landing. (NASA/JPL-Caltech/MSSS)",
      "paragraphs": [
        "• Curiosity endured an eight-month cruise before executing its legendary seven minutes of terror landing.",
        "• A rocket-powered sky crane lowered the rover directly onto its wheels inside Gale Crater.",
        "• Curiosity achieved a triumphant touchdown near the base of Mount Sharp on August 6, 2012."
      ],
      "keywords": [
        "seven minutes of terror",
        "rocket-powered sky crane",
        "Gale Crater",
        "August 6, 2012"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Curiosity find?",
      "image": "https://images-assets.nasa.gov/image/PIA19808/PIA19808~orig.jpg",
      "imageAlt": "Curiosity rover self-portrait at the Buckskin drilling site in Gale Crater",
      "caption": "Curiosity self-portrait at Buckskin, where it drilled into ancient Martian mudstone. (NASA/JPL-Caltech/MSSS)",
      "paragraphs": [
        "• The rover discovered rounded stream gravels proving deep freshwater rivers once flowed on Mars.",
        "• Drilling into ancient mudstones revealed essential chemical building blocks of life, including sulfur and carbon.",
        "• Curiosity proved conclusively that Gale Crater once hosted long-lived, potentially habitable lake systems."
      ],
      "keywords": [
        "rounded stream gravels",
        "freshwater rivers",
        "chemical building blocks",
        "habitable lake systems"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is Curiosity doing now?",
      "image": "https://images-assets.nasa.gov/image/PIA22486/PIA22486~orig.jpg",
      "imageAlt": "Dusty self-portrait of Curiosity climbing the clay-bearing slopes of Mount Sharp",
      "caption": "Curiosity pauses for a selfie while climbing Mount Sharp's ancient sediment layers. (NASA/JPL-Caltech/MSSS)",
      "paragraphs": [
        "• Curiosity is still actively exploring Mars today, steadily climbing the steep slopes of Mount Sharp.",
        "• It reads rock layers like pages in a history book, documenting how Mars dried up.",
        "• The tireless explorer continues sending daily scientific data, paving the way for human explorers."
      ],
      "keywords": [
        "actively exploring Mars today",
        "Mount Sharp",
        "rock layers",
        "tireless explorer"
      ]
    }
  ]
};


/* ---------------------------------------------------- Perseverance (Mars) */
export const perseverance: MissionProfile = {
  "id": "perseverance",
  "name": "Perseverance",
  "fullName": "Mars 2020 Perseverance Rover and Ingenuity Helicopter",
  "agency": "NASA / JPL",
  "status": "active",
  "planetId": "mars",
  "planetName": "Mars",
  "launch": "30 Jul 2020 · Atlas V, Cape Canaveral",
  "orbit": "Jezero Crater (18.38° N, 77.58° E)",
  "orbitLabel": "Current Location",
  "goal": "Seek signs of ancient microbial life and collect sealed rock core samples",
  "image": "https://images-assets.nasa.gov/image/PIA23767/PIA23767~orig.jpg",
  "imageAlt": "Perseverance rover during testing and cleanroom checkout before launch",
  "imageCaption": "Perseverance during final preparation and testing at JPL. (NASA/JPL-Caltech)",
  "nasaUrl": "https://science.nasa.gov/mission/mars-2020-perseverance/",
  "facts": [
    {
      "value": "2021",
      "label": "Landed"
    },
    {
      "value": "Jezero",
      "label": "River Delta"
    },
    {
      "value": "24+",
      "label": "Rock Cores"
    },
    {
      "value": "72",
      "label": "Ingenuity Flights"
    }
  ],
  "aliases": [
    "mars-2020",
    "mars-active-1"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Perseverance launched?",
      "image": "https://images-assets.nasa.gov/image/KSC-20200730-PH-FMX01_0042/KSC-20200730-PH-FMX01_0042~orig.jpg",
      "imageAlt": "Atlas V rocket carrying the Mars 2020 Perseverance rover lifts off from Cape Canaveral",
      "caption": "Perseverance launches aboard an Atlas V rocket from Cape Canaveral on 30 July 2020. (NASA)",
      "paragraphs": [
        "• NASA launched Perseverance in 2020 to seek biosignatures of ancient life inside Jezero Crater.",
        "• An Atlas V rocket blasted off from Cape Canaveral on July 30, 2020.",
        "• The mission carried humanity's very first Martian helicopter, the groundbreaking aerial scout named Ingenuity."
      ],
      "keywords": [
        "Perseverance",
        "biosignatures",
        "Jezero Crater",
        "helicopter named Ingenuity"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Perseverance made of?",
      "image": "https://images-assets.nasa.gov/image/PIA24333/PIA24333~orig.jpg",
      "imageAlt": "Sky crane descent stage lowers Perseverance rover to the surface of Mars",
      "caption": "High-resolution camera on the descent stage captures Perseverance being lowered to Mars. (NASA/JPL-Caltech)",
      "paragraphs": [
        "• Perseverance features an advanced coring drill designed to seal rock cores in pristine titanium tubes.",
        "• Its SuperCam fires ultraviolet lasers to zap distant rocks and determine their chemical compositions.",
        "• The MOXIE experimental instrument successfully converted thin Martian carbon dioxide into breathable oxygen gas."
      ],
      "keywords": [
        "coring drill",
        "titanium tubes",
        "SuperCam",
        "breathable oxygen gas"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Perseverance get to Mars?",
      "image": "https://images-assets.nasa.gov/image/PIA24487/PIA24487~orig.jpg",
      "imageAlt": "First high-definition 360-degree panorama of Jezero Crater floor taken by Perseverance",
      "caption": "First high-definition panorama of the ancient Jezero Crater lakebed. (NASA/JPL-Caltech/ASU/MSSS)",
      "paragraphs": [
        "• Perseverance survived atmospheric entry and used terrain relative navigation to steer away from hazards.",
        "• The sky crane descent stage delivered the rover smoothly to Jezero Crater on February 18, 2021.",
        "• Touchdown occurred right beside an ancient river delta that once filled the crater with water."
      ],
      "keywords": [
        "terrain relative navigation",
        "sky crane",
        "February 18, 2021",
        "river delta"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Perseverance find?",
      "image": "https://images-assets.nasa.gov/image/PIA25735/PIA25735~orig.jpg",
      "imageAlt": "Perseverance selfie with sample tubes cached on the Martian surface at Three Forks",
      "caption": "Perseverance selfie showing sealed sample tubes deposited on the surface of Mars. (NASA/JPL-Caltech/MSSS)",
      "paragraphs": [
        "• Perseverance verified that Jezero was once an ancient lake fed by a raging river delta.",
        "• The rover collected dozens of diverse rock cores containing minerals formed in warm water.",
        "• Ingenuity completed seventy-two historic flights across the thin Martian air before retiring in 2024."
      ],
      "keywords": [
        "ancient lake",
        "rock cores",
        "warm water",
        "seventy-two historic flights"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is Perseverance doing now?",
      "image": "https://images-assets.nasa.gov/image/PIA25681/PIA25681~orig.jpg",
      "imageAlt": "Perseverance looks back at the Three Forks sample depot on Mars",
      "caption": "Perseverance at the Three Forks sample depot, preparing for Mars Sample Return. (NASA/JPL-Caltech/MSSS)",
      "paragraphs": [
        "• Perseverance is actively exploring the crater rim today, caching rock samples for return to Earth.",
        "• Ingenuity rests nearby as the pioneer relic of humanity's first powered flight on another planet.",
        "• These precious cached samples may answer whether life ever existed beyond our home planet."
      ],
      "keywords": [
        "crater rim today",
        "caching rock samples",
        "Ingenuity rests nearby",
        "whether life ever existed"
      ]
    }
  ]
};


/* ---------------------------------------------------- Viking 1 (Mars) */
export const viking_1: MissionProfile = {
  "id": "viking-1",
  "name": "Viking 1",
  "fullName": "Viking 1 Mars Orbiter and Lander",
  "agency": "NASA / Langley",
  "status": "retired",
  "planetId": "mars",
  "planetName": "Mars",
  "launch": "20 Aug 1975 · Titan IIIE-Centaur, Cape Canaveral",
  "orbit": "Chryse Planitia (22.27° N, 312.05° E)",
  "orbitLabel": "Landing Site",
  "goal": "First successful long-duration surface exploration and biological investigation of Mars",
  "image": "https://images-assets.nasa.gov/image/101-KSC-75P-12/101-KSC-75P-12~orig.jpg",
  "imageAlt": "Technicians prepare Viking Lander 1 aeroshell cover inside the Spacecraft Assembly Facility",
  "imageCaption": "Technicians prepare Viking 1 in the Spacecraft Assembly Facility at KSC. (NASA)",
  "nasaUrl": "https://science.nasa.gov/mission/viking-1/",
  "facts": [
    {
      "value": "1976",
      "label": "Landed"
    },
    {
      "value": "1st",
      "label": "Surface Photo"
    },
    {
      "value": "6.2 yrs",
      "label": "Operated"
    },
    {
      "value": "Chryse",
      "label": "Landing Plain"
    }
  ],
  "aliases": [
    "viking1",
    "mars-retired-7",
    "mars-retired-6"
  ],
  "chapters": [
    {
      "id": "beginning",
      "tab": "The Beginning",
      "title": "The Beginning",
      "question": "Why was Viking 1 launched?",
      "image": "https://images-assets.nasa.gov/image/7668956/7668956~orig.jpg",
      "imageAlt": "Titan IIIE-Centaur rocket carrying Viking 1 stands on Launch Complex 41",
      "caption": "Viking 1 stands on the launch pad aboard its Titan IIIE-Centaur booster on 20 Aug 1975. (NASA)",
      "paragraphs": [
        "• NASA launched Viking 1 in 1975 to perform the first successful soft landing on Mars.",
        "• A Titan IIIE-Centaur rocket launched the historic spacecraft outward on August 20, 1975.",
        "• The ambitious mission aimed to photograph the entire planet and test soil for microbial life."
      ],
      "keywords": [
        "Viking 1",
        "first successful soft landing",
        "August 20, 1975",
        "microbial life"
      ]
    },
    {
      "id": "spacecraft",
      "tab": "The Spacecraft",
      "title": "The Spacecraft",
      "question": "What is Viking 1 made of?",
      "image": "https://images-assets.nasa.gov/image/PIA00563/PIA00563~orig.jpg",
      "imageAlt": "First photograph ever taken on the surface of Mars showing Viking 1 Lander footpad",
      "caption": "First surface photo of Mars showing the footpad of Viking Lander 1 firmly on soil. (NASA/JPL)",
      "paragraphs": [
        "• The mission combined a massive planetary mapping orbiter with a heavily instrumented robotic surface lander.",
        "• The lander was powered by radioisotope thermoelectric generators and carried two high-resolution facsimile cameras.",
        "• A robotic trenching arm scooped Martian red soil directly into internal biological test chambers."
      ],
      "keywords": [
        "mapping orbiter",
        "robotic surface lander",
        "thermoelectric generators",
        "biological test chambers"
      ]
    },
    {
      "id": "journey",
      "tab": "The Journey",
      "title": "The Journey",
      "question": "How did Viking 1 get to Mars?",
      "image": "https://images-assets.nasa.gov/image/PIA00007/PIA00007~orig.jpg",
      "imageAlt": "Global view of planet Mars captured by Viking 1 Orbiter as it approached the planet",
      "caption": "Global crescent view of Mars captured by the Viking 1 Orbiter during orbital insertion. (NASA/JPL)",
      "paragraphs": [
        "• Viking 1 spent ten months cruising toward Mars, entering orbit around the planet in June 1976.",
        "• The orbiter mapped potential landing sites from space to find a smooth, hazard-free touchdown location.",
        "• On July 20, 1976, the lander separated and descended smoothly into Chryse Planitia."
      ],
      "keywords": [
        "ten months cruising",
        "June 1976",
        "July 20, 1976",
        "Chryse Planitia"
      ]
    },
    {
      "id": "discoveries",
      "tab": "The Discoveries",
      "title": "The Discoveries",
      "question": "What did Viking 1 find?",
      "image": "https://images-assets.nasa.gov/image/PIA00564/PIA00564~orig.jpg",
      "imageAlt": "Martian sunset over Chryse Planitia captured by Viking 1 Lander cameras",
      "caption": "Sunset over the rock-strewn plain of Chryse Planitia taken by Viking Lander 1. (NASA/JPL)",
      "paragraphs": [
        "• Viking 1 captured the very first clear photograph ever returned from the surface of Mars.",
        "• Its biological experiments tested the soil chemistry, returning intriguing but inconclusive signs of metabolism.",
        "• The companion orbiter mapped gigantic volcanoes, dry river valleys, and sweeping canyons from Martian orbit."
      ],
      "keywords": [
        "very first clear photograph",
        "biological experiments",
        "gigantic volcanoes",
        "dry river valleys"
      ]
    },
    {
      "id": "today",
      "tab": "Mission Today",
      "title": "Mission Today",
      "question": "What is left of Viking 1 today?",
      "image": "https://images-assets.nasa.gov/image/PIA01443/PIA01443~orig.jpg",
      "imageAlt": "Mars Orbiter Camera image pinpointing the Viking 1 landing site in Chryse Planitia",
      "caption": "Orbital view from Mars Global Surveyor showing the Viking 1 landing site in Chryse Planitia. (NASA/JPL/MSSS)",
      "paragraphs": [
        "• Viking 1 Lander operated for over six years before transmitting its final message in 1982.",
        "• Decades later, modern NASA orbital satellites photographed the abandoned lander resting silently in Chryse Planitia.",
        "• Viking 1 remains an immortal monument marking humanity's very first lasting foothold on Mars."
      ],
      "keywords": [
        "over six years",
        "final message in 1982",
        "photographed the abandoned lander",
        "lasting foothold on Mars"
      ]
    }
  ]
};

/* --- VERIFIED_CURATED_MISSIONS_END --- */

const curatedStories: Record<string, MissionProfile> = {
  maven,
  cassini,
  "apollo-11": apollo_11,
  "apollo11": apollo_11,
  "apollo-17": apollo_17,
  "apollo17": apollo_17,
  "surveyor-1": surveyor_1,
  "surveyor1": surveyor_1,
  "lro": lro,
  "lunar-reconnaissance-orbiter": lro,
  "lcross": lcross,
  "lunar-crater-observation-and-sensing-satellite": lcross,
  "clementine": clementine,
  "dspse-clementine": clementine,
  "opportunity": opportunity,
  "mer-opportunity": opportunity,
  "mars-retired-1": opportunity,
  "spirit": spirit,
  "mer-spirit": spirit,
  "mars-retired-2": spirit,
  "insight": insight,
  "insight-lander": insight,
  "mars-retired-3": insight,
  "phoenix": phoenix,
  "mars-phoenix": phoenix,
  "mars-retired-4": phoenix,
  "mars-pathfinder": mars_pathfinder,
  "pathfinder": mars_pathfinder,
  "sojourner": mars_pathfinder,
  "mars-retired-5": mars_pathfinder,
  "curiosity": curiosity,
  "msl": curiosity,
  "mars-active-2": curiosity,
  "perseverance": perseverance,
  "mars-2020": perseverance,
  "mars-active-1": perseverance,
  "viking-1": viking_1,
  "viking1": viking_1,
  "mars-retired-7": viking_1,
  "mars-retired-6": viking_1,
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

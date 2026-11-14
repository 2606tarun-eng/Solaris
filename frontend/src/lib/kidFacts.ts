/**
 * Kid-friendly data, analogies, and planetary physics calculators.
 */

export type KidPlanetFact = {
  planetId: string;
  emoji: string;
  funNickname: string;
  yearInEarthDays: number;
  gravityMultiplier: number; // Multiply Earth weight by this
  kidAnalogy: string;
  superpower: string;
  didYouKnow: string[];
};

export const KID_PLANET_FACTS: Record<string, KidPlanetFact> = {
  mercury: {
    planetId: "mercury",
    emoji: "🏎️",
    funNickname: "The Speedy Toaster",
    yearInEarthDays: 88,
    gravityMultiplier: 0.38,
    kidAnalogy: "Mercury zooms around the Sun faster than any other planet—four times faster than Earth!",
    superpower: "Super Speedster: One whole year lasts only 88 days!",
    didYouKnow: [
      "During the day, it is hot enough to melt tin (800°F), but at night it freezes down to -290°F!",
      "If you weigh 70 lbs on Earth, you would weigh just 27 lbs here!",
      "You could celebrate your birthday more than 4 times every single year here!"
    ],
  },
  venus: {
    planetId: "venus",
    emoji: "🌋",
    funNickname: "The Runaway Greenhouse",
    yearInEarthDays: 225,
    gravityMultiplier: 0.91,
    kidAnalogy: "Venus is the hottest planet in the solar system—hot enough to bake a pizza in 5 seconds flat!",
    superpower: "Lava Armor: Covered in thousands of volcanoes and glowing yellow sulfur clouds!",
    didYouKnow: [
      "Venus spins backward compared to Earth! The Sun rises in the west and sets in the east.",
      "A single day on Venus is actually longer than an entire Venusian year!",
      "Its thick atmosphere squishes you with 90 times the air pressure of Earth."
    ],
  },
  earth: {
    planetId: "earth",
    emoji: "🌍",
    funNickname: "The Blue Marble",
    yearInEarthDays: 365.25,
    gravityMultiplier: 1.0,
    kidAnalogy: "Our home sweet home! The only known world with oceans, pizza, trees, and cozy beds.",
    superpower: "Life Oasis: Millions of species swimming, walking, and flying!",
    didYouKnow: [
      "Over 70% of Earth is covered in water, which is why astronauts see a brilliant blue pearl from space.",
      "The International Space Station zooms around Earth every 90 minutes!",
      "Earth is protected by a giant magnetic shield that deflects dangerous solar rays."
    ],
  },
  mars: {
    planetId: "mars",
    emoji: "🤖",
    funNickname: "The Robot Kingdom",
    yearInEarthDays: 687,
    gravityMultiplier: 0.38,
    kidAnalogy: "A dusty red desert where real robot rovers drive around singing happy birthday and collecting rocks!",
    superpower: "Monster Mountain: Home to Olympus Mons, a volcano 3 times taller than Mount Everest!",
    didYouKnow: [
      "Mars has blue sunsets instead of orange ones because of its fine atmospheric dust!",
      "You could jump almost 3 times higher on Mars than you can in your backyard!",
      "NASA rovers Curiosity and Perseverance are currently rolling around looking for ancient riverbeds."
    ],
  },
  jupiter: {
    planetId: "jupiter",
    emoji: "👑",
    funNickname: "The Giant Storm King",
    yearInEarthDays: 4333,
    gravityMultiplier: 2.53,
    kidAnalogy: "Jupiter is so gigantic that 1,300 Earths could easily fit inside it like marbles in a jar!",
    superpower: "Mega Shield: Its huge gravity catches stray asteroids and protects the inner planets!",
    didYouKnow: [
      "The Great Red Spot is a hurricane so giant that an entire Earth could fit inside it!",
      "Jupiter has 95 known moons—including Europa, which has a hidden liquid ocean under its ice!",
      "If you weigh 70 lbs on Earth, you would feel like a 177 lb giant here!"
    ],
  },
  saturn: {
    planetId: "saturn",
    emoji: "🪐",
    funNickname: "The Lord of the Rings",
    yearInEarthDays: 10759,
    gravityMultiplier: 1.06,
    kidAnalogy: "Its rings look solid from far away, but they are made of billions of glittering ice cubes and dusty snowballs!",
    superpower: "Floating Bubble: Saturn is so light that if you found a bathtub big enough, it would float on water!",
    didYouKnow: [
      "Saturn's rings are over 175,000 miles wide, but only about as thick as a two-story house (30 feet)!",
      "Its moon Titan has rivers and lakes of liquid methane, and clouds that rain liquid gasoline!",
      "One year on Saturn takes almost 30 Earth years—your grandparents might only be 2 years old here!"
    ],
  },
  uranus: {
    planetId: "uranus",
    emoji: "🎳",
    funNickname: "The Tilted Ice Ball",
    yearInEarthDays: 30687,
    gravityMultiplier: 0.89,
    kidAnalogy: "Uranus rolls around the Sun on its side like a bowling ball rolling down the lane!",
    superpower: "Cosmic Somersault: Tilted at 98 degrees, so seasons last 21 Earth years each!",
    didYouKnow: [
      "It gets its pretty cyan-blue color from methane gas in its super chilly clouds.",
      "Uranus was the very first planet discovered using a telescope (by William Herschel in 1781)!",
      "It has 13 faint rings of its own and 28 moons named after characters in Shakespeare plays."
    ],
  },
  neptune: {
    planetId: "neptune",
    emoji: "🌪️",
    funNickname: "The Supersonic Whirlwind",
    yearInEarthDays: 60190,
    gravityMultiplier: 1.14,
    kidAnalogy: "Neptune is the windiest world in the solar system—gusts scream past faster than a jet fighter plane!",
    superpower: "Sonic Winds: Storm winds blow over 1,200 miles per hour!",
    didYouKnow: [
      "It takes Neptune 165 Earth years to complete just one single lap around the Sun!",
      "It was discovered by pure mathematics before anyone even saw it through a telescope.",
      "Its moon Triton spews giant geysers of frozen nitrogen ice high into its thin atmosphere!"
    ],
  },
};

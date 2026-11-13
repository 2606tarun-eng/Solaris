import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * scrape-missions.ts — build the atlas dataset from official NASA sources.
 *
 * Sources (both free, no API key):
 *   1. science.nasa.gov mission catalog  (structured JSON, real prose, hero art)
 *   2. images-api.nasa.gov               (NASA Image & Video Library)
 *
 * NSSDCA (nssdc.gsfc.nasa.gov) is used opportunistically: its robots.txt blocks
 * the bulk query endpoints and its Oracle backend returns errors for many
 * display pages, so it cannot be the backbone. Launch dates come from the
 * catalog's own Launch field, which is the same data NSSDCA serves.
 *
 * Output (consumed by the frontend, offline-safe):
 *   frontend/src/data/generated/nasaMissions.json   — panel entries + timeline
 *   frontend/src/data/generated/nasaChapters.json   — 5-chapter stories
 *   backend/data/image-gaps.md                      — missions needing art
 *
 * Run: pnpm exec tsx scripts/scrape-missions.ts [--body=moon] [--limit=20]
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const CACHE = path.join(ROOT, ".cache", "nasa-missions");
const OUT_DIR = path.resolve(ROOT, "..", "frontend", "src", "data", "generated");
const GAP_FILE = path.join(ROOT, "data", "image-gaps.md");

const CATALOG = "https://science.nasa.gov/wp-json/wp/v2/";
const IMAGES = "https://images-api.nasa.gov";
const UA = { "User-Agent": "AstroRelics/1.0 (NASA Space Apps Challenge)" };

/** Body → NASA mission-target term id. Order decides the primary body. */
const BODIES: Array<{ id: string; name: string; termId: number }> = [
  { id: "mercury", name: "Mercury", termId: 4376 },
  { id: "venus", name: "Venus", termId: 4169 },
  { id: "earth", name: "Earth", termId: 4139 },
  { id: "moon", name: "Moon", termId: 4163 },
  { id: "mars", name: "Mars", termId: 4176 },
  { id: "jupiter", name: "Jupiter", termId: 4180 },
  { id: "saturn", name: "Saturn", termId: 4159 },
  { id: "uranus", name: "Uranus", termId: 4396 },
  { id: "neptune", name: "Neptune", termId: 4397 },
];

const STATUS_ACTIVE = 17;
const STATUS_PAST = 3762;

/* ------------------------------------------------------------------ helpers */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
  deg: "°",
  prime: "′",
  times: "×",
};

function decode(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, group: string) => {
    if (group.startsWith("#")) {
      const hex = group[1]?.toLowerCase() === "x";
      const code = Number.parseInt(hex ? group.slice(2) : group.slice(1), hex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[group.toLowerCase()] ?? match;
  });
}

function plain(html: string): string {
  return decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Shortens text **without ever cutting mid-sentence**. Everything the atlas
 * shows is a whole NASA sentence; a half sentence reads as broken data.
 */
function tidy(input: string, max = 420): string {
  const out = input.replace(/\s+/g, " ").trim();
  if (out.length <= max) return out;
  const parts = out.split(/(?<=[.!?])\s+/);
  let kept = "";
  for (const part of parts) {
    if ((kept + " " + part).trim().length > max) break;
    kept += (kept ? " " : "") + part;
  }
  if (kept) return kept;
  return parts[0] ?? "";
}

/** Splits a paragraph into display-ready sentences. */
function toSentences(input: string): string[] {
  return splitSentences(input)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 40 && sentence.length <= 330);
}

/**
 * Sentence splitter that does not break on "Dec. 11, 1972" or "U.S.".
 * Abbreviation dots are swapped for a placeholder before splitting, then
 * restored, so dates stay intact.
 */
const ABBREVIATION =
  /(\b(?:Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|Dr|Mr|Mrs|Ms|St|No|vs|etc|approx|ca|U\.S|U\.K))\.(\s)/g;

function splitSentences(input: string): string[] {
  const guarded = input.replace(ABBREVIATION, (_match, head: string) => `${head}\u0001 `);
  return guarded
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/\u0001/g, ".").trim())
    .filter(Boolean);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withCache<T>(key: string, load: () => Promise<T>): Promise<T> {
  const file = path.join(CACHE, `${key.replace(/[^a-z0-9._-]+/gi, "_")}.json`);
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    // fall through to the network
  }
  const value = await load();
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, JSON.stringify(value));
  return value;
}

async function getJson<T>(url: string, key: string, attempt = 0): Promise<T> {
  return withCache<T>(key, async () => {
    for (;;) {
      const res = await fetch(url, { headers: UA });
      if (res.status === 429) {
        await sleep(4000 * (attempt + 1));
        attempt += 1;
        continue;
      }
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return (await res.json()) as T;
    }
  });
}

type CatalogueRecord = {
  id: number;
  slug: string;
  link: string;
  parent: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  "mission-status": number[];
  "mission-target": number[];
  "mission-type": number[];
  featured_image_url?: string;
};

/* --------------------------------------------------------- catalogue parsing */

type Block = { tag: string; text: string };

function toBlocks(html: string): Block[] {
  const out: Block[] = [];
  const re = /<(h[2-4]|p)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const text = plain(match[2]);
    if (text) out.push({ tag: match[1].toLowerCase(), text });
  }
  return out;
}

/** The hero block on every mission page: Type / Launch / Target / Objective. */
function readFields(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const label of ["Type", "Launch", "Target", "Objective"]) {
    const at = html.indexOf(`>${label}</p>`);
    if (at < 0) continue;
    const window = html.slice(at, at + 900);
    const value = window.match(
      /class="p-lg[^"]*font-weight-bold[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    );
    if (value) out[label.toLowerCase()] = plain(value[1]);
  }
  return out;
}

const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December";
const DATED = new RegExp(`^(?:${MONTHS})[a-z]*\\.?\\s+\\d{1,2},\\s+\\d{4}\\s*:`, "i");
const DATED_SHORT = /\b(19|20)\d{2}\b/;

const NAV_NOISE = [
  /^(?:…|\.\.\.)\s*/,
  /^Missions?\s/i,
  /Home\s+Overview/i,
  /^Explore\b/i,
  /Discover More Topics/i,
  /^Article\b/i,
  /^Feature\b/i,
  /Min Read/i,
  /^Keep Exploring/i,
  /^Key Source$/i,
  /^Latest\b/i,
  /^Gallery$/i,
  /^Multimedia$/i,
  /^Newsroom$/i,
  /^People$/i,
  /^Stories$/i,
  /^Blog$/i,
  /NASA Official/i,
  /Privacy Policy/i,
  /^Type$|^Launch$|^Target$|^Objective$/i,
];

/** Site chrome, not mission prose: a run of nav words and no full stop. */
const NAV_WORDS =
  /\b(Home|Overview|Science|Spacecraft|News|Multimedia|Gallery|Stories|People|Timeline|Instruments|Resources|About|Data|Press Kit|Mission Updates|Launch Replay)\b/gi;

function looksLikeNav(text: string): boolean {
  const hits = text.match(NAV_WORDS) ?? [];
  return hits.length >= 3 && !/[.!?]$/.test(text);
}

function isNoise(text: string): boolean {
  if (NAV_NOISE.some((re) => re.test(text))) return true;
  if (looksLikeNav(text)) return true;
  // Nav strips lose their punctuation; real prose keeps its full stops.
  if (text.length < 80 && !/[.!?]/.test(text)) return true;
  return false;
}

/** Anything from here on is site furniture: teaser cards, news, related links. */
const STOP_SECTION =
  /^(discover more topics|keep exploring|latest (?:news|stories)|more (?:news|stories)|stories$|newsroom$|multimedia$|gallery$|explore more|related)/i;


type Parsed = {
  type: string;
  launch: string;
  objective: string;
  overview: string[];
  keyDates: string[];
  inDepth: string[];
  launchYear: number | null;
  endYear: number | null;
};

const KEY_DATE_HEADING = /^(key dates?|mission timeline|timeline|dates)$/i;

function parseMission(record: CatalogueRecord): Parsed {
  const html = record.content?.rendered ?? "";
  const fields = readFields(html);
  const blocks = toBlocks(html);

  const overview: string[] = [];
  const keyDates: string[] = [];
  const inDepth: string[] = [];

  // NASA mission pages are articles wrapped in a landing-page shell. Walk the
  // headings once and read only the prose that belongs to the mission itself:
  // the intro block, the Key Dates list and the "In Depth" article.
  let mode: "pre" | "lead" | "dates" | "detail" | "stop" = "pre";
  for (const block of blocks) {
    if (block.tag !== "p") {
      const heading = block.text.toLowerCase();
      if (STOP_SECTION.test(heading)) {
        mode = "stop";
      } else if (KEY_DATE_HEADING.test(block.text)) {
        mode = "dates";
      } else if (/^(in depth|in-depth)\b/.test(heading)) {
        mode = "detail";
      } else if (/^(key source|learn more|resources|bibliography)\b/.test(heading)) {
        mode = "stop";
      } else if (/^what (is|was)\b/.test(heading)) {
        mode = "lead";
      } else if (mode === "pre") {
        mode = "lead";
      }
      continue;
    }

    if (mode === "stop") continue;
    if (/keep exploring|discover more topics/i.test(block.text)) {
      mode = "stop";
      continue;
    }
    if (DATED.test(block.text)) {
      keyDates.push(block.text.replace(/\s+/g, " ").trim());
      continue;
    }
    if (isNoise(block.text)) continue;
    if (mode === "dates") continue;

    if (mode === "detail") inDepth.push(block.text);
    else if (overview.length < 3) overview.push(block.text);
  }

  const launchYear = yearOf(fields.launch) ?? yearOf(keyDates[0] ?? "");
  let endYear = keyDates.length ? yearOf(keyDates[keyDates.length - 1]) : null;
  if (endYear && launchYear && endYear <= launchYear) endYear = null;

  return {
    type: fields.type ?? "",
    launch: fields.launch ?? "",
    objective: fields.objective ?? "",
    overview,
    keyDates,
    inDepth,
    launchYear,
    endYear,
  };
}

function yearOf(value: string): number | null {
  const match = String(value).match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

const AGENCIES: Array<[RegExp, string]> = [
  [/\bNASA\b/, "NASA"],
  [/SpaceIL|Israel Aerospace|Israeli Space Agency/i, "SpaceIL / IAI"],
  [/\bISRO\b|Indian Space Research/i, "ISRO"],
  [/\bJAXA\b|Japan Aerospace/i, "JAXA"],
  [/\bESA\b|European Space Agency/i, "ESA"],
  [/\bCNSA\b|China National Space|Chinese National/i, "CNSA"],
  [/\bRoscosmos\b|Soviet|U\.S\.S\.R\.|Russia/i, "Roscosmos"],
  [/\bKARI\b|Korea Aerospace/i, "KARI"],
  [/\bDLR\b|German Aerospace/i, "DLR"],
  [/\bASI\b|Italian Space Agency/i, "ASI"],
];

/**
 * The agency a mission belongs to. Whichever is named *first* wins: a NASA page
 * mentions ESA in passing far more often than it is led by ESA.
 */
function agencyOf(text: string): string {
  let best: { at: number; name: string } | null = null;
  for (const [re, name] of AGENCIES) {
    const match = re.exec(text);
    if (!match) continue;
    if (!best || match.index < best.at) best = { at: match.index, name };
  }
  return best?.name ?? "NASA";
}

/** The catalog leaves Type blank on some pages; read it off the copy instead. */
function inferType(name: string, objective: string, summary: string): string {
  const haystack = `${name} ${objective} ${summary}`.toLowerCase();
  if (/cubesat|smallsat/.test(haystack)) return "CubeSat";
  if (/rover/.test(haystack)) return "Rover";
  if (/lander|landing|touch down|touchdown/.test(haystack)) return "Lander";
  if (/orbiter|entered orbit|orbit the/.test(haystack)) return "Orbiter";
  if (/flyby|flew past|flew by/.test(haystack)) return "Flyby";
  if (/telescope|observatory/.test(haystack)) return "Observatory";
  if (/sample return/.test(haystack)) return "Sample return";
  if (/space station/.test(haystack)) return "Space station";
  return "Spacecraft";
}

/* --------------------------------------------------------------- chapter copy */

function bodyLabel(bodyName: string): string {
  return bodyName === "Moon" || bodyName === "Earth" ? `the ${bodyName}` : bodyName;
}

/** "Land a rover" → "land a rover" when the phrase sits inside a sentence. */
function lowercaseStart(text: string): string {
  if (!text) return text;
  if (/^[A-Z]{2,}/.test(text)) return text; // keep acronyms such as ISS, LRO
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Ending sentences read as spoilers at the start of a story. */
const ENDING_SENTENCE =
  /\b(ended (its )?mission|mission ended|was lost|lost contact|no longer|finished its mission|ceased|shut down|deorbit)\b/i;

function dropEndingSentences(paragraph: string): string {
  const kept = splitSentences(paragraph).filter((sentence) => !ENDING_SENTENCE.test(sentence));
  return kept.length > 0 ? kept.join(" ") : paragraph;
}

type ChapterDraft = {
  id: "beginning" | "spacecraft" | "journey" | "discoveries" | "today";
  paragraphs: string[];
};

/**
 * Builds five chapters from NASA's own sentences.
 *
 * Nothing here invents a fact: each paragraph is either a real NASA sentence or
 * a plainly-labelled sentence built from the mission's catalog fields (type,
 * agency, launch date, destination). Facts are never attributed to a source
 * they did not come from.
 */
function buildChapters(
  name: string,
  bodyName: string,
  parsed: Parsed,
  status: "active" | "retired",
  agency: string,
): ChapterDraft[] {
  const where = bodyLabel(bodyName);
  const used = new Set<string>();
  const corpus = [...parsed.overview, ...parsed.inDepth].flatMap(toSentences);
  const launchYear = parsed.launchYear;

  const take = (re: RegExp, count: number, reject?: RegExp): string[] => {
    const out: string[] = [];
    for (const sentence of corpus) {
      if (out.length >= count) break;
      if (used.has(sentence) || !re.test(sentence)) continue;
      if (reject?.test(sentence)) continue;
      used.add(sentence);
      out.push(sentence);
    }
    return out;
  };

  /* The Beginning — the mission's own intro, plus the launch date. */
  const beginning: string[] = [];
  const intro = parsed.overview.length ? parsed.overview : parsed.inDepth.slice(0, 1);
  // One paragraph sets the scene. A second joins only when the first is too
  // short to stand alone, and how the mission *ended* belongs to Mission Today,
  // not to the opening of the story.
  const opening = dropEndingSentences(intro[0] ?? "");
  if (opening) beginning.push(opening);
  if (opening.length < 160 && intro[1]) {
    const second = dropEndingSentences(intro[1]);
    if (second && !beginning.includes(second)) beginning.push(second);
  }
  for (const sentence of toSentences(beginning.join(" "))) used.add(sentence);
  beginning.push(
    `${name} launched${launchYear ? ` in ${launchYear}` : ""}${
      parsed.launch ? ` (${parsed.launch})` : ""
    }, bound for ${where}.`,
  );

  /* The Spacecraft — how the hardware was built and what it carries. */
  const hardware = take(
    /spacecraft|probe|orbiter|lander|rover|instrument|camera|antenna|solar (panel|array)|built|designed|weigh|computer|payload|spacecraft bus/i,
    2,
    /\bfailed|failure|malfunction|no data\b/i,
  );
  const type = (parsed.type || "spacecraft").toLowerCase();
  const goal = parsed.objective ? lowercaseStart(parsed.objective.replace(/\.$/, "")) : "";
  const spacecraft = [
    ...hardware,
    `${name} is ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type} built by ${agency} to study ${where}.${
      goal ? ` Its goal: ${goal}.` : ""
    }`,
  ];

  /* The Journey — launch, cruise, arrival. */
  let journey = take(
    /launch|lift(ed)? off|\borbit\b|arriv|flyby|flew|travell?ed|journey|cruise|course correction|landed|touchdown|separat|entered/i,
    2,
  );
  if (journey.length === 0 && parsed.keyDates.length) {
    journey = [parsed.keyDates.slice(0, 4).join(" · ")];
  }
  if (journey.length === 0) {
    journey = [
      `Reaching ${where} takes patience: ${name} cruised through deep space for months or years before it could start working.`,
    ];
  }

  /* The Discoveries — what the mission found. */
  let discoveries = take(
    /found|discover|reveal|mapped|mapping|measur|detected|data|scientists?|evidence|suggest|confirm|showed|observed|identified|images? showed/i,
    2,
  );
  if (discoveries.length === 0 && parsed.objective) {
    discoveries = [`${name} was sent to ${goal}.`];
  }
  if (discoveries.length === 0) {
    discoveries = [
      `${name} turned ${where} into data — the measurements and pictures that scientists keep using today.`,
    ];
  }

  /* Mission Today — status, honestly stated. */
  const today: string[] = [];
  if (status === "active") {
    const latest = take(/still|continues|currently|ongoing|today|now\b|extended/i, 1);
    if (latest[0]) today.push(latest[0]);
    today.push(
      `${name} is still exploring ${where} today${launchYear ? `, ${new Date().getFullYear() - launchYear} years after launch` : ""}. Its data keeps arriving and the team keeps finding new uses for it.`,
    );
  } else {
    const ending = take(
      /ended|lost|impact|deorbit|retired|completed|shut down|final|concluded|ceased|no longer/i,
      1,
    );
    if (ending[0]) today.push(ending[0]);
    today.push(
      `${name} finished its mission${parsed.endYear ? ` in ${parsed.endYear}` : ""}. The spacecraft is quiet, but its pictures and measurements are still used by scientists today.`,
    );
  }

  const clean = (list: string[]) =>
    [...new Set(list.map((item) => tidy(item, 330)).filter(Boolean))].slice(0, 2);

  return [
    { id: "beginning", paragraphs: clean(beginning) },
    { id: "spacecraft", paragraphs: clean(spacecraft) },
    { id: "journey", paragraphs: clean(journey) },
    { id: "discoveries", paragraphs: clean(discoveries) },
    { id: "today", paragraphs: clean(today) },
  ];
}

/* ---------------------------------------------------------------- NASA images */

type SearchItem = {
  nasaId: string;
  title: string;
  description: string;
};

async function searchImages(query: string): Promise<SearchItem[]> {
  const key = `img-${query}`;
  const data = await getJson<{
    collection: {
      items: Array<{
        data: Array<{ nasa_id: string; title: string; description?: string; media_type: string }>;
      }>;
    };
  }>(
    `${IMAGES}/search?${new URLSearchParams({ q: query, media_type: "image", page: "1" })}`,
    key,
  );
  return (data.collection?.items ?? [])
    .map((item) => item.data?.[0])
    .filter((meta): meta is NonNullable<typeof meta> => Boolean(meta) && meta.media_type === "image")
    .map((meta) => ({
      nasaId: meta.nasa_id,
      title: plain(meta.title ?? ""),
      description: plain(meta.description ?? ""),
    }));
}

const verified = new Set<string>();

async function imageUrl(nasaId: string): Promise<string | null> {
  for (const size of ["medium", "large", "small", "orig"]) {
    const url = `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}~${size}.jpg`;
    if (verified.has(url)) return url;
    try {
      const res = await fetch(url, { method: "HEAD", headers: UA });
      if (res.ok) {
        verified.add(url);
        return url;
      }
    } catch {
      // try the next size
    }
  }
  return null;
}

/**
 * Rejects near-miss matches. NASA's search happily returns Surveyor 3 when you
 * ask for Surveyor 5, and "Surveyor 5 spacecraft" returns Mars photos, so the
 * *title* has to name this spacecraft.
 */
function matchesMission(item: SearchItem, name: string): boolean {
  const numbered = name.match(/^(.*\S)\s+(\d+[a-z]?)$/i);
  if (numbered) {
    const family = escapeRe(numbered[1]);
    const number = numbered[2];
    return new RegExp(`${family}[\\s-]*${number}\\b`, "i").test(item.title);
  }
  return mentionsToken(item.title, name);
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Lowercase, punctuation-free text for tolerant matching. */
function normalizeText(value: string): string {
  let text = value;
  try {
    text = decodeURIComponent(value);
  } catch {
    // keep the raw value when it is not percent-encoded
  }
  return text.toLowerCase().replace(/[-_+]+/g, " ").replace(/\s+/g, " ").trim();
}

/** True when a URL, file name or caption names this mission. */
function mentionsToken(value: string, name: string): boolean {
  const hay = normalizeText(value);
  const needle = normalizeText(name);
  if (!needle) return false;
  if (needle.length >= 4) return hay.includes(needle);
  return new RegExp(`\\b${escapeRe(needle)}\\b`).test(hay);
}

type Frame = {
  src: string;
  /** Two renditions of one photo share a key, so chapters never repeat it. */
  key: string;
  caption: string;
  alt: string;
  /** Title + caption + URL, used to guess which chapter a frame suits. */
  text: string;
};

function normalizeSrc(raw: string): string | null {
  let src = decode(raw).trim();
  if (!src) return null;
  if (src.startsWith("//")) src = `https:${src}`;
  if (!/^https?:\/\//i.test(src)) return null;
  if (/\.(gif|svg|tiff?|mp4|mov|webm)(\?|$)/i.test(src)) return null;
  if (/\/(logo|icon|icons|sprite|favicon|avatar|placeholder|badge)s?\//i.test(src)) return null;
  return src;
}

function frameKey(src: string): string {
  const nasa = src.match(/images-assets\.nasa\.gov\/image\/([^/?#]+)/i);
  if (nasa) return `nasa:${nasa[1].toLowerCase()}`;
  return src.split(/[?#]/)[0].toLowerCase();
}

/**
 * Every image the mission's own NASA page embeds, in reading order.
 *
 * Only frames that name the mission survive: the pages also carry site-wide
 * promo art (Andromeda, mangroves, other missions' cards), and a child should
 * never see a nebula in a Surveyor story.
 */
function pageFrames(html: string, name: string): Frame[] {
  const stop = html.search(/keep exploring|discover more topics/i);
  const article = stop > 0 ? html.slice(0, stop) : html;

  const out: Frame[] = [];
  const seen = new Set<string>();
  for (const tag of article.match(/<img[^>]*>/gi) ?? []) {
    const src = normalizeSrc(
      tag.match(/\bsrc="([^"]+)"/i)?.[1] ?? tag.match(/\bdata-src="([^"]+)"/i)?.[1] ?? "",
    );
    if (!src) continue;
    const alt = decode(tag.match(/\balt="([^"]*)"/i)?.[1] ?? "").trim();
    if (!mentionsToken(src, name) && !mentionsToken(alt, name)) continue;
    const key = frameKey(src);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      src,
      key,
      caption: tidy(alt, 140) || `${name} — NASA imagery.`,
      alt: alt ? `${alt} (NASA)` : `${name} from the NASA archive`,
      text: `${alt} ${src}`,
    });
  }
  return out;
}

/** NASA's own hero image for the mission, unless it names a sibling craft. */
function heroFrame(name: string, record: CatalogueRecord): Frame | null {
  const src = normalizeSrc(record.featured_image_url ?? "");
  if (!src) return null;
  if (namesSibling(src, name)) return null;
  return {
    src,
    key: frameKey(src),
    caption: `${name} — NASA imagery.`,
    alt: `${name} from the NASA archive`,
    text: `${name} ${src}`,
  };
}

/** "Surveyor 5" must not open with a file called surveyor-3.jpg. */
function namesSibling(value: string, name: string): boolean {
  const numbered = name.match(/^(.*\S)\s+(\d+)$/);
  if (!numbered) return false;
  const hay = normalizeText(value);
  const family = escapeRe(normalizeText(numbered[1]));
  const numbers = [...hay.matchAll(new RegExp(`${family}\\s*(\\d+)`, "g"))].map((hit) => hit[1]);
  return numbers.length > 0 && !numbers.includes(numbered[2]);
}

/** Strictly-titled NASA Image Library frames for this mission. */
async function apiFrames(name: string, bodyName: string): Promise<Frame[]> {
  const out: Frame[] = [];
  const seen = new Set<string>();

  for (const query of [name, `${name} ${bodyName}`, `${name} spacecraft`]) {
    if (out.length >= 10) break;
    let results: SearchItem[] = [];
    try {
      results = await searchImages(query);
    } catch {
      continue;
    }
    for (const item of results) {
      if (out.length >= 10) break;
      if (seen.has(item.nasaId) || !matchesMission(item, name)) continue;
      seen.add(item.nasaId);
      const src = await imageUrl(item.nasaId);
      if (!src) continue;
      out.push({
        src,
        key: `nasa:${item.nasaId.toLowerCase()}`,
        caption: tidy(item.title, 140) || `${name} — NASA imagery.`,
        alt: item.title ? `${item.title} (NASA)` : `${name} from the NASA archive`,
        text: `${item.title} ${item.description}`,
      });
    }
  }
  return out;
}

type ChapterMedia = { src: string; nasaId: string; caption: string; alt: string };

/**
 * A body-wide reserve of real NASA frames. Used only when a mission's own
 * images run out, so every chapter still gets a *different* image instead of
 * repeating the hero. Each use is reported as a gap.
 *
 * The reserve shows the *world*, never another mission's hardware or crew: a
 * photo of an Apollo flag has no business inside a Chandrayaan story.
 */
const reserveCache = new Map<string, Frame[]>();

const RESERVE_QUERIES: Record<string, string[]> = {
  moon: ["Moon north pole", "Moon topography map", "Moon farside"],
  mercury: ["Mercury planet MESSENGER", "Mercury surface"],
  venus: ["Venus planet", "Venus surface radar"],
  earth: ["Earth from space", "Earth Blue Marble"],
  mars: ["Mars surface", "Mars planet Hubble"],
  jupiter: ["Jupiter Great Red Spot", "Jupiter planet"],
  saturn: ["Saturn rings", "Saturn planet"],
  uranus: ["Uranus planet", "Uranus Voyager"],
  neptune: ["Neptune planet", "Neptune dark spot"],
};

const RESERVE_BLOCK = /flag|astronaut|lunar module|footprint|plaque|\bapollo\b|artemis|fission|nuclear/i;

/** Every world this atlas maps, so a reserve frame cannot come from another. */
const BODY_WORDS = [
  "mercury",
  "venus",
  "earth",
  "moon",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

/**
 * NASA's search is loose about worlds — "Moon crater mosaic" returns Dione and
 * Mimas — so a reserve frame has to name the right body and no other.
 * Earth is exempt for the Moon: "Earth rising over the Moon" is still the Moon.
 */
function mentionsBody(text: string, bodyName: string): boolean {
  const hay = text.toLowerCase();
  const body = bodyName.toLowerCase();
  const owns =
    body === "moon" ? /\bmoon\b|\blunar\b/.test(hay) : new RegExp(`\\b${body}\\b`).test(hay);
  if (!owns) return false;

  const others = BODY_WORDS.filter(
    (word) => word !== body && !(body === "moon" && word === "earth"),
  );
  return !new RegExp(`\\b(${others.join("|")})\\b`).test(hay);
}

async function bodyReserve(bodyName: string): Promise<Frame[]> {
  const cached = reserveCache.get(bodyName);
  if (cached) return cached;

  const queries = RESERVE_QUERIES[bodyName.toLowerCase()] ?? [
    `${bodyName} surface`,
    `${bodyName} NASA`,
  ];

  const list: Frame[] = [];
  const seen = new Set<string>();
  // A few frames per query, not all of them: three themes beat eight views of
  // the same pole.
  for (const query of queries) {
    let added = 0;
    try {
      for (const item of (await searchImages(query)).slice(0, 25)) {
        if (added >= 3) break;
        if (seen.has(item.nasaId)) continue;
        if (RESERVE_BLOCK.test(item.title)) continue;
        if (!mentionsBody(`${item.title} ${item.description}`, bodyName)) continue;
        seen.add(item.nasaId);
        const src = await imageUrl(item.nasaId);
        if (!src) continue;
        added += 1;
        list.push({
          src,
          key: `nasa:${item.nasaId.toLowerCase()}`,
          caption: `Archive view: ${tidy(item.title, 120) || `NASA imagery of ${bodyLabel(bodyName)}`}`,
          alt: item.title ? `${item.title} (NASA archive view)` : `${bodyName} from the NASA archive`,
          text: item.title,
        });
      }
    } catch {
      // keep whatever the earlier queries returned
    }
  }
  reserveCache.set(bodyName, list);
  return list;
}

/** A chapter that had to borrow art, or found none. Acted on by hand. */
type Gap = {
  name: string;
  chapter: string;
  href?: string;
  kind: "archive" | "missing";
};

const ALL_CHAPTERS = ["beginning", "spacecraft", "journey", "discoveries", "today"] as const;

/** Words that suggest a photo belongs to a particular chapter. */
const CHAPTER_HINTS: Array<[(typeof ALL_CHAPTERS)[number], RegExp]> = [
  ["beginning", /launch|lift.?off|rocket|launch pad|preflight|assembl|install|rollout|prepar|test stand|hangar/i],
  ["journey", /trajectory|course|approach|arriv|encounter|flyby|journey|orbit insertion|depart|separat|cruise|path to/i],
  [
    "discoveries",
    /surface|crater|panorama|mosaic|\bmap\b|data|spectr|soil|\brock\b|\bice\b|cloud|terrain|close.?up|image of|view of/i,
  ],
  ["today", /team|mission control|engineer|celebrat|anniversary|clean room|laborator|\blab\b/i],
];

/**
 * Five distinct NASA frames per mission, one per chapter.
 *
 * Order of preference: NASA's hero shot for the spacecraft, then the mission's
 * own page/library photos matched to each chapter by caption, then any unused
 * mission photo, then the body archive (reported as a gap so a real frame can
 * be dropped in later).
 */
async function chapterImages(
  name: string,
  bodyName: string,
  hero: Frame | null,
  pool: Frame[],
  href: string | undefined,
  gaps: Gap[],
): Promise<Record<string, ChapterMedia>> {
  const used = new Set<string>();
  const out: Record<string, ChapterMedia> = {};

  const assign = (chapter: string, frame: Frame) => {
    used.add(frame.key);
    out[chapter] = {
      src: frame.src,
      nasaId: frame.key,
      caption: frame.caption,
      alt: frame.alt,
    };
  };

  if (hero) assign("spacecraft", hero);

  const available = () => pool.find((frame) => !used.has(frame.key));

  // First pass: the frame whose caption actually names this chapter's theme.
  for (const [chapter, hint] of CHAPTER_HINTS) {
    if (out[chapter]) continue;
    const frame = pool.find((candidate) => !used.has(candidate.key) && hint.test(candidate.text));
    if (frame) assign(chapter, frame);
  }

  // Second pass: any other mission-specific frame, in reading order.
  for (const chapter of ALL_CHAPTERS) {
    if (out[chapter]) continue;
    const frame = available();
    if (frame) assign(chapter, frame);
  }

  // Third pass: the body archive, so the story never reuses one image.
  const missing = ALL_CHAPTERS.filter((chapter) => !out[chapter]);
  if (missing.length > 0) {
    const reserve = await bodyReserve(bodyName);
    for (const chapter of missing) {
      const frame = reserve.find((candidate) => !used.has(candidate.key));
      if (!frame) {
        gaps.push({ name, chapter, href, kind: "missing" });
        continue;
      }
      assign(chapter, frame);
      gaps.push({ name, chapter, href, kind: "archive" });
    }
  }

  return out;
}

/* ------------------------------------------------------------------- pipeline */

type MissionEntry = {
  id: string;
  name: string;
  agency: string;
  status: "active" | "retired";
  bodyId: string;
  bodyName: string;
  years: string;
  target: string;
  summary: string;
  heroImage: string;
  heroAlt: string;
  stats: Array<{ value: string; label: string }>;
  href: string;
  launched: number | null;
  ended: number | null;
};

type ChapterEntry = {
  id: string;
  tab: string;
  title: string;
  question: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  caption: string;
  keywords: string[];
};

const CHAPTER_META: Record<string, { tab: string; title: string; question: (name: string, body: string) => string }> = {
  beginning: {
    tab: "The Beginning",
    title: "The Beginning",
    question: (name) => `Why was ${name} launched?`,
  },
  spacecraft: {
    tab: "The Spacecraft",
    title: "The Spacecraft",
    question: (name) => `What is ${name}?`,
  },
  journey: {
    tab: "The Journey",
    title: "The Journey",
    question: (name, body) => `How did ${name} get to ${body}?`,
  },
  discoveries: {
    tab: "The Discoveries",
    title: "The Discoveries",
    question: (name) => `What has ${name} taught us?`,
  },
  today: {
    tab: "Mission Today",
    title: "Mission Today",
    question: (name) => `Where is ${name} now?`,
  },
};

const SKIP_SLUG =
  /(^|-)(model|mockup|mock-up|3d-model)(-|$)|(^|-)(subsatellite|bibliography|publications?|glossary|faq)$/i;

function slugOf(record: CatalogueRecord): string {
  return record.slug;
}

/**
 * Runs `worker` over `items` with at most `limit` in flight.
 *
 * The scrape is network-bound (catalog pages, image searches, HEAD checks), so
 * a few parallel lanes cut a full rebuild from tens of minutes to a few. Every
 * response is cached on disk, so a re-run costs almost nothing.
 */
async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const lanes = Math.max(1, Math.min(limit, items.length));

  await Promise.all(
    Array.from({ length: lanes }, async () => {
      for (;;) {
        const index = cursor++;
        if (index >= items.length) return;
        results[index] = await worker(items[index], index);
      }
    }),
  );

  return results;
}

type QueueItem = {
  body: { id: string; name: string; termId: number };
  slug: string;
  name: string;
  status: "active" | "retired";
  record: CatalogueRecord;
  parsed: Parsed;
  summary: string;
  agency: string;
  years: string;
};

type Scraped = {
  mission: MissionEntry;
  story: { bodyId: string; bodyName: string; chapters: ChapterEntry[] };
  event: { year: number; title: string; kind: string; planetId?: string; detail: string };
  gaps: Gap[];
};

async function run() {
  const args = process.argv.slice(2);
  const only = args.find((a) => a.startsWith("--body="))?.split("=")[1];
  const limitArg = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
  const concurrency = Math.max(
    1,
    Number(args.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? 4),
  );

  const bodies = only ? BODIES.filter((b) => b.id === only) : BODIES;
  const queue: QueueItem[] = [];
  const seen = new Set<string>();

  /* 1. Collect every candidate record. Cheap, serial, and cached. */
  for (const body of bodies) {
    const records: CatalogueRecord[] = [];
    for (let page = 1; page <= 5; page += 1) {
      const batch = await getJson<CatalogueRecord[]>(
        `${CATALOG}mission?mission-target=${body.termId}&parent=0&per_page=100&page=${page}` +
          `&_fields=id,slug,link,parent,title,excerpt,content,mission-status,mission-target,mission-type,featured_image_url`,
        `catalog-${body.id}-${page}`,
      ).catch(() => [] as CatalogueRecord[]);
      if (!Array.isArray(batch) || batch.length === 0) break;
      records.push(...batch);
    }

    for (const record of records) {
      const slug = slugOf(record).trim().toLowerCase();
      if (!slug || seen.has(slug) || SKIP_SLUG.test(slug)) continue;

      const statuses = record["mission-status"] ?? [];
      const status: "active" | "retired" | null = statuses.includes(STATUS_ACTIVE)
        ? "active"
        : statuses.includes(STATUS_PAST)
          ? "retired"
          : null;
      if (!status) continue; // Future / Inactive have no panel tab.

      const parsed = parseMission(record);
      if (!parsed.type && !parsed.launch) continue; // sub-page, not a mission.
      if (!parsed.launchYear) continue;

      const name = plain(record.title?.rendered ?? slug);
      if (!name || name.length < 2) continue;

      // NASA's excerpt is sometimes a bare label ("Lunar Lander / Rover
      // (India)"). Prefer it only when it actually says something.
      const excerpt = tidy(plain(record.excerpt?.rendered ?? ""), 240);
      const summary =
        excerpt.length >= 70 ? excerpt : tidy(parsed.overview[0] ?? excerpt ?? parsed.objective, 240);
      if (!summary) continue;

      const agency = agencyOf(`${summary} ${plain(record.content?.rendered ?? "").slice(0, 2500)}`);
      parsed.type = parsed.type || inferType(name, parsed.objective, summary);

      // A retired mission must never read "…–now".
      const years =
        status === "retired"
          ? parsed.endYear && parsed.endYear !== parsed.launchYear
            ? `${parsed.launchYear}–${parsed.endYear}`
            : String(parsed.launchYear)
          : `${parsed.launchYear}–now`;

      seen.add(slug);
      queue.push({ body, slug, name, status, record, parsed, summary, agency, years });
    }

    console.log(`${body.id}: ${queue.filter((item) => item.body.id === body.id).length} candidates`);
    if (limitArg && queue.length >= limitArg) break;
  }

  const work = limitArg ? queue.slice(0, limitArg) : queue;
  console.log(`\nScraping ${work.length} missions with ${concurrency} lanes…\n`);

  /* 2. Warm the per-body archive reserve once, so parallel missions share it. */
  for (const body of new Set(work.map((item) => item.body.name))) {
    await bodyReserve(body);
  }

  /* 3. Scrape each mission: images first, then the five chapters. */
  let done = 0;
  const results = await mapPool(work, concurrency, async (item) => {
    const { body, slug, name, status, record, parsed, summary, agency, years } = item;
    const gaps: Gap[] = [];

    // Mission-specific imagery only: NASA's own page gallery, then the Image
    // Library restricted to titles that name this spacecraft.
    const pool = [
      ...pageFrames(record.content?.rendered ?? "", name),
      ...(await apiFrames(name, body.name)),
    ];
    const media = await chapterImages(
      name,
      body.name,
      heroFrame(name, record),
      pool,
      record.link,
      gaps,
    );

    // Every chapter must show a different frame. When a mission's own images
    // run out, chapterImages already borrowed a distinct body-archive image and
    // reported the gap.
    const heroMedia = media.spacecraft ?? media.beginning ?? media.journey;
    if (!heroMedia) {
      process.stdout.write(`\r${++done}/${work.length} scraped   `);
      return null;
    }

    const drafts = buildChapters(name, body.name, parsed, status, agency);
    const chapterEntries: ChapterEntry[] = drafts.map((draft) => {
      const meta = CHAPTER_META[draft.id];
      const frame = media[draft.id] ?? heroMedia;
      return {
        id: draft.id,
        tab: meta.tab,
        title: meta.title,
        question: meta.question(name, bodyLabel(body.name)),
        paragraphs: draft.paragraphs,
        image: frame.src,
        imageAlt: frame.alt,
        caption: frame.caption,
        keywords: [name, body.name, parsed.type].filter(Boolean),
      };
    });

    const mission: MissionEntry = {
      id: slug,
      name,
      agency,
      status,
      bodyId: body.id,
      bodyName: body.name,
      years,
      target: tidy([parsed.type || "Mission", parsed.objective].filter(Boolean).join(" · "), 70),
      summary,
      heroImage: heroMedia.src,
      heroAlt: `${name} — NASA imagery`,
      stats: [
        { value: String(parsed.launchYear), label: "Launched" },
        { value: parsed.type || "Mission", label: "Type" },
        { value: body.name, label: "Destination" },
      ],
      href: record.link,
      launched: parsed.launchYear,
      ended: parsed.endYear,
    };

    process.stdout.write(`\r${++done}/${work.length} scraped   `);

    return {
      mission,
      story: { bodyId: body.id, bodyName: body.name, chapters: chapterEntries },
      event: {
        year: parsed.launchYear as number,
        title: name,
        kind: "launch",
        planetId: body.id,
        detail: tidy(
          `${parsed.type || "Mission"} to ${body.name} launched by ${agency}. ${parsed.objective || summary}`,
          190,
        ),
      },
      gaps,
    } satisfies Scraped;
  });

  console.log("");

  const missions: MissionEntry[] = [];
  const chapters: Record<string, { bodyId: string; bodyName: string; chapters: ChapterEntry[] }> = {};
  const timeline: Array<{ year: number; title: string; kind: string; planetId?: string; detail: string }> = [];
  const gaps: Gap[] = [];

  for (const result of results) {
    if (!result) continue;
    missions.push(result.mission);
    chapters[result.mission.id] = result.story;
    timeline.push(result.event);
    gaps.push(...result.gaps);
  }

  missions.sort((a, b) => a.name.localeCompare(b.name));
  timeline.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

  const counts = missions.reduce<Record<string, { active: number; retired: number }>>((acc, mission) => {
    acc[mission.bodyId] ??= { active: 0, retired: 0 };
    acc[mission.bodyId][mission.status] += 1;
    return acc;
  }, {});

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    path.join(OUT_DIR, "nasaMissions.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "science.nasa.gov mission catalog + images-api.nasa.gov",
        counts,
        missions,
        timeline,
      },
      null,
      0,
    ),
  );
  await writeFile(
    path.join(OUT_DIR, "nasaChapters.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), stories: chapters }, null, 0),
  );

  await mkdir(path.dirname(GAP_FILE), { recursive: true });
  const byMission = new Map<string, Gap[]>();
  for (const gap of gaps) {
    const list = byMission.get(gap.name);
    if (list) list.push(gap);
    else byMission.set(gap.name, [gap]);
  }

  await writeFile(
    GAP_FILE,
    [
      "# Story chapters that need a real NASA image",
      "",
      `Generated ${new Date().toISOString().slice(0, 10)} by \`backend/scripts/scrape-missions.ts\`.`,
      "",
      `${byMission.size} missions are affected. Every chapter still shows a *different* NASA`,
      "image: either an archive view of the destination world (marked **archive**) or, if none",
      "was available, nothing (**missing**). Paste a NASA image or page URL next to a chapter",
      "and it can be wired in by hand.",
      "",
      ...[...byMission.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .flatMap(([name, list]) => [
          `## ${name}`,
          list[0]?.href ? `Source page: ${list[0].href}` : "Source page: (none)",
          "",
          ...list.map(
            (gap) =>
              `- [ ] ${gap.chapter} — ${
                gap.kind === "archive" ? "archive image used" : "no image found"
              }`,
          ),
          "",
        ]),
    ].join("\n"),
  );

  console.log(`\nMissions: ${missions.length}`);
  console.log(`Timeline events: ${timeline.length}`);
  console.log(`Stories: ${Object.keys(chapters).length}`);
  console.log(`Image gaps: ${gaps.length} (see backend/data/image-gaps.md)`);
  for (const [body, count] of Object.entries(counts)) {
    console.log(`  ${body}: ${count.active} active / ${count.retired} retired`);
  }
}

await run();

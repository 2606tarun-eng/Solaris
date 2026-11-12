import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import * as gemini from "../lib/gemini.js";
import * as deepgram from "../lib/deepgram.js";
import * as elevenlabs from "../lib/elevenlabs.js";

/**
 * Voice agent route.
 *
 * POST /api/voice
 *   - multipart/form-data with an `audio` file  → STT → LLM → TTS
 *   - application/json with { text }             → LLM → TTS (text-only testing)
 *
 * Every external service degrades gracefully: if a key is missing, that stage
 * is skipped and the response reports which capabilities were used. This keeps
 * the demo working before API keys are provisioned.
 */

const PLANET_NAMES = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

const SYSTEM_PROMPT = `You are Solaris, a friendly space guide for kids aged 8 to 14.
Answer in short, clear sentences (2-4 sentences). Be warm, curious, and accurate.
Use the provided mission data when it helps. Never invent facts; if unsure, say so.
Avoid jargon and keep every answer picture-first and easy to imagine.`;

async function buildContext(question: string) {
  const lower = question.toLowerCase();
  const planetId = PLANET_NAMES.find((name) => lower.includes(name));

  if (!planetId) {
    const planets = await db.select().from(schema.planets).all();
    return "Planets in this atlas:\n" + planets.map((p) => `- ${p.name}: ${p.nickname}`).join("\n");
  }

  const planet = await db
    .select()
    .from(schema.planets)
    .where(eq(schema.planets.id, planetId))
    .get();
  const story = await db
    .select()
    .from(schema.stories)
    .where(eq(schema.stories.planetId, planetId))
    .get();
  const missions = await db
    .select()
    .from(schema.missions)
    .where(eq(schema.missions.planetId, planetId))
    .all();

  const lines = [
    planet ? `${planet.name} (${planet.nickname})` : planetId,
    story ? `Story: ${story.intro}` : "",
    story ? `Fun fact: ${story.funFact}` : "",
    ...missions.map((m) => `Mission ${m.name} (${m.status}): ${m.headline}`),
  ].filter(Boolean);

  return lines.join("\n");
}

function fallbackReply(question: string, context: string) {
  const planet = PLANET_NAMES.find((name) => question.toLowerCase().includes(name));
  if (planet) {
    return `I know lots about ${planet}. Ask me what we sent there, or what we found out!`;
  }
  return "I'm your space guide. Ask me about a planet — like Mars, Saturn, or Neptune!";
}

const voiceRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/api/voice", async (request, reply) => {
    const caps = {
      stt: deepgram.isConfigured(),
      llm: gemini.isConfigured(),
      tts: elevenlabs.isConfigured(),
    };

    let question = "";
    let audio: Buffer | null = null;

    if (request.isMultipart()) {
      const file = await request.file();
      if (file) {
        audio = await file.toBuffer();
      }
    } else {
      const body = request.body as { text?: string } | undefined;
      question = body?.text ?? "";
    }

    // 1. Speech-to-text
    let transcript = question;
    if (audio && caps.stt) {
      try {
        transcript = await deepgram.transcribe(audio, "audio/webm");
      } catch (err) {
        request.log.warn({ err }, "Deepgram transcription failed");
      }
    }

    if (!transcript) {
      return reply.code(400).send({
        error: "No transcript. Send audio (multipart) or JSON { text }.",
        capabilities: caps,
      });
    }

    // 2. Context + LLM
    const context = await buildContext(transcript);
    let responseText: string;

    if (caps.llm) {
      try {
        responseText = await gemini.generateStoryReply(
          `${SYSTEM_PROMPT}\n\nContext:\n${context}`,
          [],
          transcript,
        );
      } catch (err) {
        request.log.warn({ err }, "Gemini failed, using fallback");
        responseText = fallbackReply(transcript, context);
      }
    } else {
      responseText = fallbackReply(transcript, context);
    }

    // 3. Text-to-speech
    let audioBase64: string | null = null;
    if (caps.tts) {
      try {
        const mp3 = await elevenlabs.speak(responseText);
        audioBase64 = mp3.toString("base64");
      } catch (err) {
        request.log.warn({ err }, "ElevenLabs failed, returning text only");
      }
    }

    return {
      transcript,
      response: responseText,
      audio: audioBase64, // base64 MP3, or null → frontend can use SpeechSynthesis
      capabilities: caps,
    };
  });
};

export default voiceRoutes;

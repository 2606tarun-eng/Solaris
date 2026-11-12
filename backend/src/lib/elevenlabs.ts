/**
 * ElevenLabs text-to-speech client (REST).
 *
 * Returns an MP3 buffer for the given text. Falls back cleanly when
 * `ELEVENLABS_API_KEY` is missing (the frontend can use SpeechSynthesis).
 */

export function isConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

// "Rachel" — a warm, friendly default voice. Override via ELEVENLABS_VOICE_ID.
const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM";

export async function speak(text: string): Promise<Buffer> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set");

  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs error: ${res.status} ${await res.text()}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

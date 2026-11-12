/**
 * Deepgram speech-to-text client (REST).
 *
 * Sends an audio buffer to Deepgram's pre-recorded endpoint and returns the
 * transcript. Falls back cleanly when `DEEPGRAM_API_KEY` is missing.
 */

export function isConfigured() {
  return Boolean(process.env.DEEPGRAM_API_KEY);
}

export async function transcribe(audio: Buffer, contentType = "audio/webm"): Promise<string> {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) throw new Error("DEEPGRAM_API_KEY is not set");

  const params = new URLSearchParams({
    model: "nova-2",
    smart_format: "true",
    punctuate: "true",
    language: "en",
  });

  const res = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": contentType,
    },
    body: new Uint8Array(audio),
  });

  if (!res.ok) {
    throw new Error(`Deepgram error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    results?: {
      channels?: Array<{ alternatives?: Array<{ transcript?: string }> }>;
    };
  };

  return data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";
}

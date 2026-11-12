/**
 * Gemini client (REST, no SDK).
 *
 * Uses the Gemini model via the Generative Language API. If `GEMINI_API_KEY`
 * is missing, `isConfigured()` returns false and the caller falls back
 * gracefully. Override the model with `GEMINI_MODEL` if needed.
 */

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export type ChatMessage = { role: "user" | "model"; text: string };

export async function generateStoryReply(
  system: string,
  history: ChatMessage[],
  userText: string,
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: userText }] },
  ];

  const res = await fetch(`${BASE}/${MODEL}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 400,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return text.trim();
}

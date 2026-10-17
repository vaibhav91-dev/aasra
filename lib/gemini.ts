import "server-only";
import { AiError, type AiRequest } from "./api-validation";
import { buildPrompt } from "./prompts";
export const DEFAULT_MODEL = "gemini-3.5-flash-lite";
export async function generate(
  request: AiRequest,
  options: {
    fetcher?: typeof fetch;
    key?: string;
    model?: string;
    timeoutMs?: number;
  } = {},
) {
  const key = options.key ?? process.env.GEMINI_API_KEY;
  const model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  if (!key?.trim()) throw new AiError("CONFIG", 503);
  if (!/^gemini-[a-zA-Z0-9.-]{1,80}$/.test(model))
    throw new AiError("MODEL", 503);
  const prompt = buildPrompt(request);
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 25000,
  );
  try {
    const response = await (options.fetcher ?? fetch)(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompt.system }] },
          contents: prompt.contents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 2200 },
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );
    if (!response.ok) {
      if (response.status === 429) throw new AiError("QUOTA", 429);
      if (response.status === 401 || response.status === 403)
        throw new AiError("CREDENTIALS", 503);
      if (response.status === 404) throw new AiError("MODEL", 503);
      if (response.status === 400) {
        const detail = await response.json().catch(() => null);
        const reason = JSON.stringify(detail);
        if (
          reason.includes("API_KEY_INVALID") ||
          reason.includes("API key not valid")
        )
          throw new AiError("CREDENTIALS", 503);
        if (/model|NOT_FOUND|not supported/i.test(reason))
          throw new AiError("MODEL", 503);
      }
      throw new AiError("UPSTREAM", 502);
    }
    const data: unknown = await response.json();
    if (
      !data ||
      typeof data !== "object" ||
      !("candidates" in data) ||
      !Array.isArray(data.candidates)
    )
      throw new AiError("EMPTY", 502);
    const candidate = data.candidates[0] as
      | {
          finishReason?: string;
          content?: { parts?: { text?: unknown; thought?: boolean }[] };
        }
      | undefined;
    if (
      !candidate ||
      candidate.finishReason !== "STOP" ||
      !Array.isArray(candidate.content?.parts)
    )
      throw new AiError("EMPTY", 502);
    const result = candidate.content.parts
      .filter((p) => !p.thought && typeof p.text === "string")
      .map((p) => p.text)
      .join("\n")
      .trim();
    if (!result || result.length > 12000) throw new AiError("EMPTY", 502);
    return result;
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (controller.signal.aborted) throw new AiError("TIMEOUT", 504);
    throw new AiError("UPSTREAM", 502);
  } finally {
    clearTimeout(timer);
  }
}

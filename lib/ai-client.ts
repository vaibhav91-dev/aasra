import { AiError, type AiRequest, type ErrorCode } from "./api-validation";
const codes: ErrorCode[] = [
  "INVALID",
  "TOO_LARGE",
  "ORIGIN",
  "CONFIG",
  "CREDENTIALS",
  "MODEL",
  "QUOTA",
  "TIMEOUT",
  "UPSTREAM",
  "EMPTY",
];
export async function askAi(request: AiRequest): Promise<string> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30000),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok)
      throw new AiError(
        codes.includes(data?.error?.code) ? data.error.code : "UPSTREAM",
        response.status,
      );
    if (typeof data.text !== "string" || !data.text.trim())
      throw new AiError("EMPTY", 502);
    return data.text;
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiError(
      error instanceof DOMException && error.name === "TimeoutError"
        ? "TIMEOUT"
        : "UPSTREAM",
      502,
    );
  }
}

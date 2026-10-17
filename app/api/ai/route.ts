import { AiError, validateRequest } from "@/lib/api-validation";
import { indiaToday } from "@/lib/earnings";
import { generate } from "@/lib/gemini";
export const runtime = "nodejs";
export const maxDuration = 30;
const MAX_BODY = 96_000;
function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (
      request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== new URL(request.url).origin)
    )
      throw new AiError("ORIGIN", 403);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      throw new AiError("INVALID", 400);
    const length = request.headers.get("content-length");
    if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY))
      throw new AiError("TOO_LARGE", 413);
    if (!request.body) throw new AiError("INVALID", 400);
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        await reader.cancel();
        throw new AiError("TOO_LARGE", 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let body: unknown;
    try {
      body = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      );
    } catch {
      throw new AiError("INVALID", 400);
    }
    const input = validateRequest(body, indiaToday());
    return json({ text: await generate(input) });
  } catch (error) {
    const failure =
      error instanceof AiError ? error : new AiError("UPSTREAM", 502);
    return json({ error: { code: failure.code } }, failure.status);
  }
}

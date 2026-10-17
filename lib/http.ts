export class HttpError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}
export function responseJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin && origin !== new URL(request.url).origin)
  )
    throw new HttpError("ORIGIN", 403);
}
export async function boundedBody(
  request: Request,
  maximum: number,
): Promise<string> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maximum))
    throw new HttpError("TOO_LARGE", 413);
  if (!request.body) throw new HttpError("INVALID", 400);
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let result = "",
    size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new HttpError("TOO_LARGE", 413);
      }
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError("INVALID", 400);
  }
}
export function safeFailure(error: unknown) {
  return error instanceof HttpError
    ? responseJson({ error: { code: error.code } }, error.status)
    : responseJson(
        {
          error: {
            code:
              error instanceof Error && error.message === "CLOUD_CONFIG"
                ? "CLOUD_CONFIG"
                : "CLOUD_UNAVAILABLE",
          },
        },
        503,
      );
}

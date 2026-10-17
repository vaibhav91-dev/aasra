import { getAuth } from "@/lib/auth";
import { boundedBody, responseJson, safeFailure, sameOrigin } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const response = await getAuth().handler(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return safeFailure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await boundedBody(request, 16000);
    const result = await getAuth().handler(
      new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body,
      }),
    );
    result.headers.set("Cache-Control", "no-store");
    return result;
  } catch (error) {
    return safeFailure(error);
  }
}
export async function OPTIONS() {
  return responseJson({ error: { code: "ORIGIN" } }, 403);
}

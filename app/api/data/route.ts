import { getAuth } from "@/lib/auth";
import { validSavedData } from "@/lib/cloud-data";
import { readWorkerData, writeWorkerData } from "@/lib/cloud-repository";
import {
  boundedBody,
  HttpError,
  responseJson,
  safeFailure,
  sameOrigin,
} from "@/lib/http";
export const runtime = "nodejs";
async function identity(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) throw new HttpError("SIGN_IN", 401);
  return session.user.id;
}
export async function GET(request: Request) {
  try {
    const id = await identity(request);
    return responseJson(await readWorkerData(id));
  } catch (error) {
    return safeFailure(error);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    const id = await identity(request);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      throw new HttpError("INVALID", 400);
    let body: unknown;
    try {
      body = JSON.parse(await boundedBody(request, 2500000));
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError("INVALID", 400);
    }
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).sort().join(",") !== "data,revision" ||
      !("data" in body) ||
      !validSavedData(body.data) ||
      !("revision" in body) ||
      !Number.isSafeInteger(body.revision) ||
      Number(body.revision) < 0
    )
      throw new HttpError("INVALID", 400);
    const revision = await writeWorkerData(
      id,
      body.data,
      Number(body.revision),
    );
    if (revision === null) throw new HttpError("CONFLICT", 409);
    return responseJson({ revision });
  } catch (error) {
    return safeFailure(error);
  }
}

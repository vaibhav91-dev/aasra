import { cloudConfigured, getAuth } from "@/lib/auth";
import { responseJson, safeFailure } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!cloudConfigured())
    return responseJson({ configured: false, user: null });
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    return responseJson({
      configured: true,
      user: session ? { id: session.user.id, name: session.user.name } : null,
    });
  } catch (error) {
    return safeFailure(error);
  }
}

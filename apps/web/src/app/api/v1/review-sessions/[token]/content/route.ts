import type { NextRequest } from "next/server";
import { reviewSessionCookieName } from "@/server/review-sessions/review-session-cookie";
import { reviewClientActionsService } from "@/server/review-sessions/review-client-actions.service";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ token: string }>(
  async (request: NextRequest, { token }) => {
    // The cookie is scoped per review-session id, but we only know that id
    // after hashing the token - resolve it once, then read the matching
    // cookie by name (requireVerifiedSession re-validates it regardless).
    const session = await reviewSessionsService.findValidSession(token);
    const cookieValue = request.cookies.get(
      reviewSessionCookieName(session.id)
    )?.value;

    const versionParam = request.nextUrl.searchParams.get("version");
    const requestedVersion = versionParam ? Number(versionParam) : undefined;

    return reviewClientActionsService.getContent(
      token,
      cookieValue,
      requestedVersion
    );
  }
);

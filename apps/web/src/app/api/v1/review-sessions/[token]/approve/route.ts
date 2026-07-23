import type { NextRequest } from "next/server";
import { reviewClientActionsService } from "@/server/review-sessions/review-client-actions.service";
import { reviewSessionCookieName } from "@/server/review-sessions/review-session-cookie";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ token: string }>(
  async (request: NextRequest, { token }) => {
    const session = await reviewSessionsService.findValidSession(token);
    const cookieValue = request.cookies.get(
      reviewSessionCookieName(session.id)
    )?.value;
    await reviewClientActionsService.approve(token, cookieValue);
    return { approved: true };
  }
);

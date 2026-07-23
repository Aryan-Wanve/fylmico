import type { NextRequest } from "next/server";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ token: string }>(
  async (request: NextRequest, { token }) => {
    await reviewSessionsService.requestOtp(token, request);
    return { sent: true };
  }
);

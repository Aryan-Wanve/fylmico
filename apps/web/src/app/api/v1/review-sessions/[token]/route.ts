import type { NextRequest } from "next/server";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ token: string }>(
  async (_request: NextRequest, { token }) => {
    return reviewSessionsService.getPublicPreview(token);
  }
);

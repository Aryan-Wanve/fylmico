import type { NextRequest } from "next/server";
import { analyticsService } from "@/server/analytics/analytics.service";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    return analyticsService.getProjectAnalytics(user.id, projectId);
  }
);

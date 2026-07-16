import type { NextRequest } from "next/server";
import { analyticsService } from "@/server/analytics/analytics.service";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return analyticsService.getMyStats(user.id, houseId);
  }
);

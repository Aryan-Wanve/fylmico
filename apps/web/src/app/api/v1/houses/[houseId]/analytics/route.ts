import type { NextRequest } from "next/server";
import { analyticsService } from "@/server/analytics/analytics.service";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";

const ALLOWED_RANGE_DAYS = new Set([7, 30, 90]);

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const requestedDays = Number(
      request.nextUrl.searchParams.get("days") ?? "7"
    );
    const rangeDays = ALLOWED_RANGE_DAYS.has(requestedDays) ? requestedDays : 7;
    return analyticsService.getAnalytics(user.id, houseId, rangeDays);
  }
);

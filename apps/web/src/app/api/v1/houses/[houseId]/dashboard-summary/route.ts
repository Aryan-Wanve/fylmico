import type { NextRequest } from "next/server";
import { dashboardService } from "@/server/dashboard/dashboard.service";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return dashboardService.getSummary(user.id, houseId);
  }
);

import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{ houseId: string; locationId: string }>(
  async (request: NextRequest, { houseId, locationId }) => {
    const user = requireUser(request);
    await storyboardService.deleteLocation(user.id, houseId, locationId);
    return { success: true };
  }
);

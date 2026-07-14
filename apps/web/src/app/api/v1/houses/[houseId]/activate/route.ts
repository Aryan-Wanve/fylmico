import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { organizationsService } from "@/server/organizations/organizations.service";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    await organizationsService.activateHouse(user.id, houseId);
    return { success: true };
  }
);

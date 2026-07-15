import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { organizationsService } from "@/server/organizations/organizations.service";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return organizationsService.toggleFavorite(houseId, user.id);
  }
);

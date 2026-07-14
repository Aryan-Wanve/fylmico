import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { organizationsService } from "@/server/organizations/organizations.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return organizationsService.listJoinRequests(houseId, user.id);
  }
);

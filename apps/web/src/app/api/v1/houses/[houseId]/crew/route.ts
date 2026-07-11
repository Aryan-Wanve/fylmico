import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { crewsService } from "@/server/crews/crews.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return crewsService.list(user.id, houseId);
  }
);

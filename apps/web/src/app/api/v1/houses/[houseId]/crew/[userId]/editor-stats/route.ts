import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string; userId: string }>(
  async (request: NextRequest, { houseId, userId }) => {
    const user = requireUser(request);
    return deliverablesService.getEditorStats(user.id, houseId, userId);
  }
);

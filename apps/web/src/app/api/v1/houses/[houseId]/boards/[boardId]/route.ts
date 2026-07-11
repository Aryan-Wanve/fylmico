import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{ houseId: string; boardId: string }>(
  async (request: NextRequest, { houseId, boardId }) => {
    const user = requireUser(request);
    await storyboardService.deleteBoard(user.id, houseId, boardId);
    return { success: true };
  }
);

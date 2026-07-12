import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{ houseId: string; characterId: string }>(
  async (request: NextRequest, { houseId, characterId }) => {
    const user = requireUser(request);
    await storyboardService.deleteCharacter(user.id, houseId, characterId);
    return { success: true };
  }
);

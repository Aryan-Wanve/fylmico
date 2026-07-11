import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { UpdateShotDto } from "@/server/storyboard/dto/update-shot.dto";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ houseId: string; shotId: string }>(
  async (request: NextRequest, { houseId, shotId }) => {
    const user = requireUser(request);
    const dto = await validateDto(UpdateShotDto, await readJsonBody(request));
    return storyboardService.updateShot(user.id, houseId, shotId, dto);
  }
);

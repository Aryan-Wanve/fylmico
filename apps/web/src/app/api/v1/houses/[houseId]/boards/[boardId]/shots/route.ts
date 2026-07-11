import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CreateShotDto } from "@/server/storyboard/dto/create-shot.dto";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string; boardId: string }>(
  async (request: NextRequest, { houseId, boardId }) => {
    const user = requireUser(request);
    const dto = await validateDto(CreateShotDto, await readJsonBody(request));
    return storyboardService.createShot(user.id, houseId, boardId, dto);
  }
);

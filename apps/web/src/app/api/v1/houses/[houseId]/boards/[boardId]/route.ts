import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { UpdateBoardDto } from "@/server/storyboard/dto/update-board.dto";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ houseId: string; boardId: string }>(
  async (request: NextRequest, { houseId, boardId }) => {
    const user = requireUser(request);
    const dto = await validateDto(UpdateBoardDto, await readJsonBody(request));
    return storyboardService.updateBoard(user.id, houseId, boardId, dto);
  }
);

export const DELETE = withParamsRoute<{ houseId: string; boardId: string }>(
  async (request: NextRequest, { houseId, boardId }) => {
    const user = requireUser(request);
    await storyboardService.deleteBoard(user.id, houseId, boardId);
    return { success: true };
  }
);

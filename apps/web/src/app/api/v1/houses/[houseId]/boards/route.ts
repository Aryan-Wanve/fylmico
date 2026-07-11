import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CreateBoardDto } from "@/server/storyboard/dto/create-board.dto";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return storyboardService.listBoards(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(CreateBoardDto, await readJsonBody(request));
    return storyboardService.createBoard(user.id, houseId, dto);
  }
);

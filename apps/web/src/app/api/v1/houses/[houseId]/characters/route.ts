import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CreateCharacterDto } from "@/server/storyboard/dto/create-character.dto";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return storyboardService.listCharacters(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateCharacterDto,
      await readJsonBody(request)
    );
    return storyboardService.createCharacter(user.id, houseId, dto);
  }
);

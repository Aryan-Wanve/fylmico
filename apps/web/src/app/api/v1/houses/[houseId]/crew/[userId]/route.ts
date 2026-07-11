import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { crewsService } from "@/server/crews/crews.service";
import { UpdateCrewProfileDto } from "@/server/crews/dto/update-crew-profile.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ houseId: string; userId: string }>(
  async (request: NextRequest, { houseId, userId: targetUserId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateCrewProfileDto,
      await readJsonBody(request)
    );
    return crewsService.update(user.id, houseId, targetUserId, dto);
  }
);

export const DELETE = withParamsRoute<{ houseId: string; userId: string }>(
  async (request: NextRequest, { houseId, userId: targetUserId }) => {
    const user = requireUser(request);
    await crewsService.remove(user.id, houseId, targetUserId);
    return { success: true };
  }
);

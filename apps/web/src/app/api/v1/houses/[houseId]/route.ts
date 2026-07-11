import type { NextRequest } from "next/server";
import { UpdateHouseDto } from "@/server/organizations/dto/update-house.dto";
import { organizationsService } from "@/server/organizations/organizations.service";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(UpdateHouseDto, await readJsonBody(request));
    return organizationsService.updateHouse(houseId, user.id, dto);
  }
);

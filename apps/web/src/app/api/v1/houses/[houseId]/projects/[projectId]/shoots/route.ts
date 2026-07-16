import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { CreateShootDto } from "@/server/shoots/dto/create-shoot.dto";
import { shootsService } from "@/server/shoots/shoots.service";

export const POST = withParamsRoute<{ houseId: string; projectId: string }>(
  async (request: NextRequest, { houseId, projectId }) => {
    const user = requireUser(request);
    const dto = await validateDto(CreateShootDto, await readJsonBody(request));
    return shootsService.create(user.id, houseId, projectId, dto);
  }
);

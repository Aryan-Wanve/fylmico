import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { UpdateScriptDto } from "@/server/scripts/dto/update-script.dto";
import { scriptsService } from "@/server/scripts/scripts.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string; scriptId: string }>(
  async (request: NextRequest, { houseId, scriptId }) => {
    const user = requireUser(request);
    return scriptsService.get(user.id, houseId, scriptId);
  }
);

export const PATCH = withParamsRoute<{ houseId: string; scriptId: string }>(
  async (request: NextRequest, { houseId, scriptId }) => {
    const user = requireUser(request);
    const dto = await validateDto(UpdateScriptDto, await readJsonBody(request));
    return scriptsService.update(user.id, houseId, scriptId, dto);
  }
);

export const DELETE = withParamsRoute<{ houseId: string; scriptId: string }>(
  async (request: NextRequest, { houseId, scriptId }) => {
    const user = requireUser(request);
    await scriptsService.delete(user.id, houseId, scriptId);
    return { success: true };
  }
);

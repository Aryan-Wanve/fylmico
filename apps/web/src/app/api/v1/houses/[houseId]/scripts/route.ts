import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CreateScriptDto } from "@/server/scripts/dto/create-script.dto";
import { scriptsService } from "@/server/scripts/scripts.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return scriptsService.list(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(CreateScriptDto, await readJsonBody(request));
    return scriptsService.create(user.id, houseId, dto);
  }
);

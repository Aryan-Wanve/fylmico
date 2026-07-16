import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { CancelShootDto } from "@/server/shoots/dto/cancel-shoot.dto";
import { shootsService } from "@/server/shoots/shoots.service";

export const POST = withParamsRoute<{ shootId: string }>(
  async (request: NextRequest, { shootId }) => {
    const user = requireUser(request);
    const dto = await validateDto(CancelShootDto, await readJsonBody(request));
    return shootsService.cancel(user.id, shootId, dto);
  }
);

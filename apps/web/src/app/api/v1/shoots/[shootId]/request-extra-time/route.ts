import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { RequestExtraTimeDto } from "@/server/shoots/dto/request-extra-time.dto";
import { shootsService } from "@/server/shoots/shoots.service";

export const POST = withParamsRoute<{ shootId: string }>(
  async (request: NextRequest, { shootId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      RequestExtraTimeDto,
      await readJsonBody(request)
    );
    await shootsService.requestExtraTime(user.id, shootId, dto);
    return { success: true };
  }
);

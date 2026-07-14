import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { organizationsService } from "@/server/organizations/organizations.service";
import { UpdateJoinRequestStatusDto } from "@/server/organizations/dto/update-join-request-status.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ houseId: string; requestId: string }>(
  async (request: NextRequest, { houseId, requestId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateJoinRequestStatusDto,
      await readJsonBody(request)
    );
    await organizationsService.respondToJoinRequest(
      houseId,
      user.id,
      requestId,
      dto.status
    );
    return { success: true };
  }
);

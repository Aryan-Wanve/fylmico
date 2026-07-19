import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { RejectDeliverableDto } from "@/server/deliverables/dto/reject-deliverable.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      RejectDeliverableDto,
      await readJsonBody(request)
    );
    return deliverablesService.reject(user.id, deliverableId, dto.reason);
  }
);

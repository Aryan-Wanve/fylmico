import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { ReassignDeliverableDto } from "@/server/deliverables/dto/reassign-deliverable.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      ReassignDeliverableDto,
      await readJsonBody(request)
    );
    return deliverablesService.reassign(
      user.id,
      deliverableId,
      dto.newEditorId
    );
  }
);

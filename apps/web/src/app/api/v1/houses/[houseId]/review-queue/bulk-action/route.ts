import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { BulkReviewActionDto } from "@/server/deliverables/dto/bulk-review-action.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      BulkReviewActionDto,
      await readJsonBody(request)
    );
    return deliverablesService.bulkAction(
      user.id,
      houseId,
      dto.action,
      dto.deliverableIds,
      {
        comment: dto.comment,
        newEditorId: dto.newEditorId,
        reason: dto.reason
      }
    );
  }
);

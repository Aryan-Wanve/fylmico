import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CreateDeliverableDto } from "@/server/deliverables/dto/create-deliverable.dto";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateDeliverableDto,
      await readJsonBody(request)
    );
    return deliverablesService.create(user.id, houseId, dto);
  }
);

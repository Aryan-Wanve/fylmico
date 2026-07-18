import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CreateDeliverableDto } from "@/server/deliverables/dto/create-deliverable.dto";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const dto = await validateDto(CreateDeliverableDto, {
      ...body,
      ownerType: "project",
      ownerId: projectId
    });
    return deliverablesService.createForProject(user.id, projectId, dto);
  }
);

export const GET = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    return deliverablesService.listForProject(user.id, projectId);
  }
);

import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { LinkClientDto } from "@/server/projects/dto/link-client.dto";
import { projectsService } from "@/server/projects/projects.service";

export const POST = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    const dto = await validateDto(LinkClientDto, await readJsonBody(request));
    return projectsService.linkClient(user.id, projectId, dto);
  }
);

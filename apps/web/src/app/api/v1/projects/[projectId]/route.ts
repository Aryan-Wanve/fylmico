import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { UpdateProjectDto } from "@/server/projects/dto/update-project.dto";
import { projectsService } from "@/server/projects/projects.service";

export const GET = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    return projectsService.get(user.id, projectId);
  }
);

export const PATCH = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateProjectDto,
      await readJsonBody(request)
    );
    return projectsService.update(user.id, projectId, dto);
  }
);

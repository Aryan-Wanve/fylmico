import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { projectsService } from "@/server/projects/projects.service";

export const GET = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    return projectsService.getProjectTimeline(user.id, projectId);
  }
);

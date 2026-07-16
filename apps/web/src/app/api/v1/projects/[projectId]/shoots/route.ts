import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { shootsService } from "@/server/shoots/shoots.service";

export const GET = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    return shootsService.listForProject(user.id, projectId);
  }
);

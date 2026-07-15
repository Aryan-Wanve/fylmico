import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { tasksService } from "@/server/tasks/tasks.service";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return tasksService.listTemplates(user.id, houseId);
  }
);

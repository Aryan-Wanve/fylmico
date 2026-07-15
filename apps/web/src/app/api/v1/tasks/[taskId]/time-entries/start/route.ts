import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { tasksService } from "@/server/tasks/tasks.service";

export const POST = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    return tasksService.startTimer(user.id, taskId);
  }
);

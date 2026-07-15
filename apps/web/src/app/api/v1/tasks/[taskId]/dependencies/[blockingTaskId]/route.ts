import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { tasksService } from "@/server/tasks/tasks.service";

export const DELETE = withParamsRoute<{
  taskId: string;
  blockingTaskId: string;
}>(async (request: NextRequest, { taskId, blockingTaskId }) => {
  const user = requireUser(request);
  return tasksService.removeDependency(user.id, taskId, blockingTaskId);
});

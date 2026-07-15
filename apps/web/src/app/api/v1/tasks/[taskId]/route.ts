import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { UpdateTaskDto } from "@/server/tasks/dto/update-task.dto";
import { tasksService } from "@/server/tasks/tasks.service";

export const GET = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    return tasksService.getTask(user.id, taskId);
  }
);

export const PATCH = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    const dto = await validateDto(UpdateTaskDto, await readJsonBody(request));
    return tasksService.update(user.id, taskId, dto);
  }
);

export const DELETE = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    await tasksService.remove(user.id, taskId);
    return { success: true };
  }
);

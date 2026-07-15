import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { AddWorkLogDto } from "@/server/tasks/dto/add-work-log.dto";
import { tasksService } from "@/server/tasks/tasks.service";

export const GET = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    return tasksService.listTimeEntries(user.id, taskId);
  }
);

export const POST = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    const dto = await validateDto(AddWorkLogDto, await readJsonBody(request));
    return tasksService.addWorkLogEntry(user.id, taskId, dto);
  }
);

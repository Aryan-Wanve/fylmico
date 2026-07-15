import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { StopTimerDto } from "@/server/tasks/dto/stop-timer.dto";
import { tasksService } from "@/server/tasks/tasks.service";

export const POST = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    const dto = await validateDto(StopTimerDto, await readJsonBody(request));
    return tasksService.stopTimer(user.id, taskId, dto);
  }
);

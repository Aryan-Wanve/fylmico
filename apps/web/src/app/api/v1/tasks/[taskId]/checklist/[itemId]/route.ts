import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { UpdateChecklistItemDto } from "@/server/tasks/dto/update-checklist-item.dto";
import { tasksService } from "@/server/tasks/tasks.service";

export const PATCH = withParamsRoute<{ taskId: string; itemId: string }>(
  async (request: NextRequest, { taskId, itemId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateChecklistItemDto,
      await readJsonBody(request)
    );
    return tasksService.updateChecklistItem(user.id, taskId, itemId, dto);
  }
);

export const DELETE = withParamsRoute<{ taskId: string; itemId: string }>(
  async (request: NextRequest, { taskId, itemId }) => {
    const user = requireUser(request);
    await tasksService.removeChecklistItem(user.id, taskId, itemId);
    return { success: true };
  }
);

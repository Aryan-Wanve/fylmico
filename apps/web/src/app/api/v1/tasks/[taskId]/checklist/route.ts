import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { AddChecklistItemDto } from "@/server/tasks/dto/add-checklist-item.dto";
import { tasksService } from "@/server/tasks/tasks.service";

export const POST = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      AddChecklistItemDto,
      await readJsonBody(request)
    );
    return tasksService.addChecklistItem(user.id, taskId, dto);
  }
);

import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { AddDependencyDto } from "@/server/tasks/dto/add-dependency.dto";
import { tasksService } from "@/server/tasks/tasks.service";

export const POST = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      AddDependencyDto,
      await readJsonBody(request)
    );
    return tasksService.addDependency(user.id, taskId, dto);
  }
);

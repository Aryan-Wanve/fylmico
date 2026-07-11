import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";
import { CreateTaskDto } from "@/server/tasks/dto/create-task.dto";
import { tasksService } from "@/server/tasks/tasks.service";

export const POST = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const dto = await validateDto(CreateTaskDto, await readJsonBody(request));
  return tasksService.createTask(user.id, dto);
});

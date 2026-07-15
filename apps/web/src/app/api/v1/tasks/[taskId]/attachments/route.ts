import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { filesService } from "@/server/files/files.service";
import { readJsonBody, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    return filesService.listForTask(user.id, taskId);
  }
);

export const POST = withParamsRoute<{ taskId: string }>(
  async (request: NextRequest, { taskId }) => {
    const user = requireUser(request);
    const body = (await readJsonBody(request)) as { entryId: string };
    return filesService.linkToTask(user.id, taskId, body.entryId);
  }
);

import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { filesService } from "@/server/files/files.service";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{ taskId: string; entryId: string }>(
  async (request: NextRequest, { taskId, entryId }) => {
    const user = requireUser(request);
    await filesService.unlinkFromTask(user.id, taskId, entryId);
    return { success: true };
  }
);

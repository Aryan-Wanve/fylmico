import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ projectId: string }>(
  async (request: NextRequest, { projectId }) => {
    const user = requireUser(request);
    return chatService.getRoomIdForProject(user.id, projectId);
  }
);

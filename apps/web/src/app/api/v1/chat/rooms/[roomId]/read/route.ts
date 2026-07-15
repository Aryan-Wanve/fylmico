import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ roomId: string }>(
  async (request: NextRequest, { roomId }) => {
    const user = requireUser(request);
    await chatService.markRead(user.id, roomId);
    return { success: true };
  }
);

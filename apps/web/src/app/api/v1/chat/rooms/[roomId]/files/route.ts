import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ roomId: string }>(
  async (request: NextRequest, { roomId }) => {
    const user = requireUser(request);
    return chatService.listRoomFiles(user.id, roomId);
  }
);

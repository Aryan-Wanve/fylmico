import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ messageId: string }>(
  async (request: NextRequest, { messageId }) => {
    const user = requireUser(request);
    return chatService.pinMessage(user.id, messageId);
  }
);

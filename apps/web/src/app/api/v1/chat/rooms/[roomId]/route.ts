import type { NextRequest } from "next/server";
import { chatService } from "@/server/chat/chat.service";
import { UpdateConversationDto } from "@/server/chat/dto/update-conversation.dto";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ roomId: string }>(
  async (request: NextRequest, { roomId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateConversationDto,
      await readJsonBody(request)
    );
    return chatService.updateConversation(user.id, roomId, dto);
  }
);

import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { SendMessageDto } from "@/server/chat/dto/send-message.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ roomId: string }>(
  async (request: NextRequest, { roomId }) => {
    const user = requireUser(request);
    const dto = await validateDto(SendMessageDto, await readJsonBody(request));
    return chatService.sendMessage(
      user.id,
      roomId,
      dto.body,
      dto.parentMessageId
    );
  }
);

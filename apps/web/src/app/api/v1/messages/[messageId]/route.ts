import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { EditMessageDto } from "@/server/chat/dto/edit-message.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ messageId: string }>(
  async (request: NextRequest, { messageId }) => {
    const user = requireUser(request);
    const dto = await validateDto(EditMessageDto, await readJsonBody(request));
    return chatService.editMessage(user.id, messageId, dto.body);
  }
);

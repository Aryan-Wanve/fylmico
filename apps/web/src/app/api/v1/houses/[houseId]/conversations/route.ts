import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { CreateConversationDto } from "@/server/chat/dto/create-conversation.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateConversationDto,
      await readJsonBody(request)
    );
    return chatService.createConversation(user.id, houseId, dto);
  }
);

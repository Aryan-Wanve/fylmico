import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { ToggleReactionDto } from "@/server/chat/dto/toggle-reaction.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ messageId: string }>(
  async (request: NextRequest, { messageId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      ToggleReactionDto,
      await readJsonBody(request)
    );
    return chatService.toggleReaction(user.id, messageId, dto.emoji);
  }
);

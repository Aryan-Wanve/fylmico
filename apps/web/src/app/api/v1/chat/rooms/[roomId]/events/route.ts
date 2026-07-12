import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { CreateRoomEventDto } from "@/server/chat/dto/create-room-event.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ roomId: string }>(
  async (request: NextRequest, { roomId }) => {
    const user = requireUser(request);
    return chatService.listRoomEvents(user.id, roomId);
  }
);

export const POST = withParamsRoute<{ roomId: string }>(
  async (request: NextRequest, { roomId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateRoomEventDto,
      await readJsonBody(request)
    );
    return chatService.createRoomEvent(user.id, roomId, dto);
  }
);

import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { chatService } from "@/server/chat/chat.service";
import { CreateRoomTaskDto } from "@/server/chat/dto/create-room-task.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ roomId: string }>(
  async (request: NextRequest, { roomId }) => {
    const user = requireUser(request);
    return chatService.listRoomTasks(user.id, roomId);
  }
);

export const POST = withParamsRoute<{ roomId: string }>(
  async (request: NextRequest, { roomId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateRoomTaskDto,
      await readJsonBody(request)
    );
    return chatService.createRoomTask(user.id, roomId, dto.title);
  }
);

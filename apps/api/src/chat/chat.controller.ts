import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/send-message.dto";

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("rooms/:roomId/messages")
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("roomId") roomId: string,
    @Body() dto: SendMessageDto
  ) {
    const data = await this.chatService.sendMessage(user.id, roomId, dto.body);
    return { data };
  }
}

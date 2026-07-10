import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Controller("houses/:houseId/conversations")
@UseGuards(JwtAuthGuard)
export class HouseChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Body() dto: CreateConversationDto
  ) {
    const data = await this.chatService.createConversation(
      user.id,
      houseId,
      dto
    );
    return { data };
  }
}

import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { HouseChatController } from "./house-chat.controller";

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [ChatController, HouseChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}

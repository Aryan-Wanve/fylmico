import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ChatModule } from "../chat/chat.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { TasksModule } from "../tasks/tasks.module";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceService } from "./workspace.service";

@Module({
  imports: [AuthModule, OrganizationsModule, TasksModule, ChatModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService]
})
export class WorkspaceModule {}

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@fylmico/database";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { HealthModule } from "./health/health.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { TasksModule } from "./tasks/tasks.module";
import { WorkspaceModule } from "./workspace/workspace.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    OrganizationsModule,
    TasksModule,
    ChatModule,
    WorkspaceModule
  ]
})
export class AppModule {}

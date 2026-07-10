import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@fylmico/database";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AuthModule } from "./auth/auth.module";
import { CalendarModule } from "./calendar/calendar.module";
import { ChatModule } from "./chat/chat.module";
import { ClientsModule } from "./clients/clients.module";
import { CommentsModule } from "./comments/comments.module";
import { CrewsModule } from "./crews/crews.module";
import { HealthModule } from "./health/health.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { TimeEntriesModule } from "./time-entries/time-entries.module";
import { WorkspaceModule } from "./workspace/workspace.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    NotificationsModule,
    OrganizationsModule,
    TasksModule,
    ChatModule,
    ProjectsModule,
    ClientsModule,
    CommentsModule,
    CrewsModule,
    CalendarModule,
    TimeEntriesModule,
    AnalyticsModule,
    WorkspaceModule
  ]
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { CommentsService } from "./comments.service";
import { ProjectCommentsController } from "./project-comments.controller";
import { TaskCommentsController } from "./task-comments.controller";

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [TaskCommentsController, ProjectCommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}

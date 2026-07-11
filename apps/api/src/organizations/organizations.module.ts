import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { HouseInvitationsController } from "./house-invitations.controller";
import { InvitationsController } from "./invitations.controller";
import { OrganizationsController } from "./organizations.controller";
import { OrganizationsService } from "./organizations.service";

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [
    OrganizationsController,
    HouseInvitationsController,
    InvitationsController
  ],
  providers: [OrganizationsService],
  exports: [OrganizationsService]
})
export class OrganizationsModule {}

import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { TimeEntriesController } from "./time-entries.controller";
import { TimeEntriesService } from "./time-entries.service";

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService]
})
export class TimeEntriesModule {}

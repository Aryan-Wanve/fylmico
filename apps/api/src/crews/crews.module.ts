import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { CrewsController } from "./crews.controller";
import { CrewsService } from "./crews.service";

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [CrewsController],
  providers: [CrewsService]
})
export class CrewsModule {}

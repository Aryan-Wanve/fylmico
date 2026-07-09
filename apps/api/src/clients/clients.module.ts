import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { HouseClientsController } from "./house-clients.controller";

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [HouseClientsController, ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule {}

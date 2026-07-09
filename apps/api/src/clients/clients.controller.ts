import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { ClientsService } from "./clients.service";
import { UpdateClientDto } from "./dto/update-client.dto";

@Controller("clients/:clientId")
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("clientId") clientId: string
  ) {
    const data = await this.clientsService.get(user.id, clientId);
    return { data };
  }

  @Patch()
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("clientId") clientId: string,
    @Body() dto: UpdateClientDto
  ) {
    const data = await this.clientsService.update(user.id, clientId, dto);
    return { data };
  }
}

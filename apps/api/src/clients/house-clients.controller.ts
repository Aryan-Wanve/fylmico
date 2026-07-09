import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { CursorPaginationDto } from "../common/pagination";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";

@Controller("houses/:houseId/clients")
@UseGuards(JwtAuthGuard)
export class HouseClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Body() dto: CreateClientDto
  ) {
    const data = await this.clientsService.create(user.id, houseId, dto);
    return { data };
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Query() pagination: CursorPaginationDto
  ) {
    return this.clientsService.list(user.id, houseId, pagination);
  }
}

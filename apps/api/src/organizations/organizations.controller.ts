import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { CreateHouseDto } from "./dto/create-house.dto";
import { JoinHouseDto } from "./dto/join-house.dto";
import { OrganizationsService } from "./organizations.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post("houses")
  async createHouse(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateHouseDto
  ) {
    const data = await this.organizationsService.createHouse(user.id, dto);
    return { data };
  }

  @Post("houses/join")
  @HttpCode(HttpStatus.OK)
  async joinHouse(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: JoinHouseDto
  ) {
    const data = await this.organizationsService.joinHouse(user.id, dto);
    return { data };
  }

  @Post("houses/:houseId/leave")
  @HttpCode(HttpStatus.OK)
  async leaveHouse(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string
  ) {
    await this.organizationsService.leaveHouse(user.id, houseId);
    return { data: { success: true } };
  }
}

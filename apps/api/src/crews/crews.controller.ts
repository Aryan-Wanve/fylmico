import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { UpdateCrewProfileDto } from "./dto/update-crew-profile.dto";
import { CrewsService } from "./crews.service";

@Controller("houses/:houseId/crew")
@UseGuards(JwtAuthGuard)
export class CrewsController {
  constructor(private readonly crewsService: CrewsService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string
  ) {
    const data = await this.crewsService.list(user.id, houseId);
    return { data };
  }

  @Patch(":userId")
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Param("userId") targetUserId: string,
    @Body() dto: UpdateCrewProfileDto
  ) {
    const data = await this.crewsService.update(
      user.id,
      houseId,
      targetUserId,
      dto
    );
    return { data };
  }

  @Delete(":userId")
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Param("userId") targetUserId: string
  ) {
    await this.crewsService.remove(user.id, houseId, targetUserId);
    return { data: { success: true } };
  }
}

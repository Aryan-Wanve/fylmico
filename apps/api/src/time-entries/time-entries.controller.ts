import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { CreateTimeEntryDto } from "./dto/create-time-entry.dto";
import { TimeEntriesService } from "./time-entries.service";

@Controller("houses/:houseId/time-entries")
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string
  ) {
    const data = await this.timeEntriesService.list(user.id, houseId);
    return { data };
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Body() dto: CreateTimeEntryDto
  ) {
    const data = await this.timeEntriesService.create(user.id, houseId, dto);
    return { data };
  }
}

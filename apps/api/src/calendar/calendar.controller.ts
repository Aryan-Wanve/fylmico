import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { CalendarService } from "./calendar.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";

@Controller("houses/:houseId/calendar-events")
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string
  ) {
    const data = await this.calendarService.list(user.id, houseId);
    return { data };
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Body() dto: CreateCalendarEventDto
  ) {
    const data = await this.calendarService.create(user.id, houseId, dto);
    return { data };
  }
}

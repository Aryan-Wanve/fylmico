import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { calendarService } from "@/server/calendar/calendar.service";
import { CreateCalendarEventDto } from "@/server/calendar/dto/create-calendar-event.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return calendarService.list(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateCalendarEventDto,
      await readJsonBody(request)
    );
    return calendarService.create(user.id, houseId, dto);
  }
);

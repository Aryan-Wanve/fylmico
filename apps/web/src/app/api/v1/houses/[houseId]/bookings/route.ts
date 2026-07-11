import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { bookingsService } from "@/server/bookings/bookings.service";
import { CreateBookingDto } from "@/server/bookings/dto/create-booking.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return bookingsService.list(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateBookingDto,
      await readJsonBody(request)
    );
    return bookingsService.create(user.id, houseId, dto);
  }
);

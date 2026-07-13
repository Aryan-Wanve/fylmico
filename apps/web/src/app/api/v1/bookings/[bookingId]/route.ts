import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { bookingsService } from "@/server/bookings/bookings.service";
import { UpdateBookingStatusDto } from "@/server/bookings/dto/update-booking-status.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ bookingId: string }>(
  async (request: NextRequest, { bookingId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateBookingStatusDto,
      await readJsonBody(request)
    );
    return bookingsService.updateStatus(user.id, bookingId, dto.status);
  }
);

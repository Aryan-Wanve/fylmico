import { IsIn } from "class-validator";

const BOOKING_STATUSES = ["confirmed", "pending", "cancelled"] as const;

export class UpdateBookingStatusDto {
  @IsIn(BOOKING_STATUSES)
  status!: (typeof BOOKING_STATUSES)[number];
}

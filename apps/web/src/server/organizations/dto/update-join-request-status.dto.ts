import { IsIn } from "class-validator";

const JOIN_REQUEST_STATUSES = ["approved", "rejected"] as const;

export class UpdateJoinRequestStatusDto {
  @IsIn(JOIN_REQUEST_STATUSES)
  status!: (typeof JOIN_REQUEST_STATUSES)[number];
}

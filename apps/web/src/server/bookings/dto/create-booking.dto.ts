import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

const RESOURCE_CATEGORIES = ["studio", "equipment", "venue"] as const;
const BOOKING_STATUSES = ["confirmed", "pending", "cancelled"] as const;

export class CreateBookingDto {
  @IsString()
  @MinLength(1)
  resourceName!: string;

  @IsOptional()
  @IsIn(RESOURCE_CATEGORIES)
  resourceCategory?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsIn(BOOKING_STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export const CALENDAR_EVENT_CATEGORIES = [
  "shoot",
  "post-production",
  "meeting",
  "pre-production",
  "delivery",
  "other"
] as const;

export class CreateCalendarEventDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  date!: string;

  @IsString()
  @MinLength(1)
  time!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsIn(CALENDAR_EVENT_CATEGORIES)
  category?: (typeof CALENDAR_EVENT_CATEGORIES)[number];

  @IsOptional()
  @IsIn(["project", "client"])
  ownerType?: "project" | "client";

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

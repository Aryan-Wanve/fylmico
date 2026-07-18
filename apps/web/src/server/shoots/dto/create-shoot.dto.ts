import {
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength
} from "class-validator";

export const SHOOT_STATUSES = [
  "scheduled",
  "crew-reached",
  "started",
  "finished",
  "uploading",
  "uploaded",
  "ready-for-editing",
  "archived",
  "cancelled"
] as const;

export class CreateShootDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsISO8601()
  scheduledDate!: string;

  @IsOptional()
  @IsString()
  callTime?: string;

  @IsOptional()
  @IsString()
  estFinishTime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  crewIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(["project", "client"])
  ownerType?: "project" | "client";

  @IsOptional()
  @IsString()
  ownerId?: string;
}

import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MinLength
} from "class-validator";

export const DELIVERABLE_STATUSES = [
  "draft",
  "review",
  "revision",
  "approved",
  "rejected"
] as const;

export class CreateDeliverableDto {
  @IsIn(["project", "client"])
  ownerType!: "project" | "client";

  @IsString()
  @MinLength(1)
  ownerId!: string;

  @IsString()
  @MinLength(1)
  fileEntryId!: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  exportSettings?: Record<string, string>;
}

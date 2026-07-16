import { IsOptional, IsString, MinLength } from "class-validator";

export const DELIVERABLE_STATUSES = [
  "draft",
  "review",
  "revision",
  "approved",
  "final"
] as const;

export class CreateDeliverableDto {
  @IsString()
  @MinLength(1)
  fileEntryId!: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

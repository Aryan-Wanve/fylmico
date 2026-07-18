import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested
} from "class-validator";

export const TASK_TYPES = [
  "shoot",
  "edit",
  "color-grade",
  "sound-design",
  "vfx",
  "motion-graphics",
  "storyboarding",
  "script-writing",
  "thumbnail",
  "photography",
  "reels",
  "social-media",
  "client-review",
  "delivery",
  "asset-collection",
  "equipment",
  "location-scouting",
  "casting",
  "meeting",
  "admin",
  "custom"
] as const;

export const TASK_STATUSES = [
  "todo",
  "in-progress",
  "review",
  "changes-requested",
  "completed",
  "archived"
] as const;

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const TASK_RECURRENCE_RULES = ["daily", "weekly", "monthly"] as const;

export class TaskAssigneeInputDto {
  @IsString()
  @MinLength(1)
  userId!: string;

  @IsOptional()
  @IsString()
  responsibility?: string;
}

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  houseId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(TASK_TYPES)
  type?: (typeof TASK_TYPES)[number];

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: (typeof TASK_STATUSES)[number];

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority?: (typeof TASK_PRIORITIES)[number];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskAssigneeInputDto)
  assignees?: TaskAssigneeInputDto[];

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedMinutes?: number;

  @IsOptional()
  @IsIn(TASK_RECURRENCE_RULES)
  recurrenceRule?: (typeof TASK_RECURRENCE_RULES)[number];

  @IsOptional()
  @IsISO8601()
  recurrenceEndDate?: string;

  @IsOptional()
  @IsIn(["project", "client"])
  ownerType?: "project" | "client";

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  boardId?: string;

  @IsOptional()
  @IsString()
  scriptId?: string;

  @IsOptional()
  @IsString()
  shootDayEventId?: string;

  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  callTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

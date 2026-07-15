import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested
} from "class-validator";
import {
  TASK_PRIORITIES,
  TASK_RECURRENCE_RULES,
  TASK_STATUSES,
  TASK_TYPES,
  TaskAssigneeInputDto
} from "./create-task.dto";

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

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
  @IsString()
  projectId?: string;

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

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}

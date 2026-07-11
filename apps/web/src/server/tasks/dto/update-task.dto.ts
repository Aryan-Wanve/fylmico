import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { TASK_PRIORITIES, TASK_STATUSES } from "./create-task.dto";

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  project?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  assigneeId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  dueDate?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority?: (typeof TASK_PRIORITIES)[number];

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: (typeof TASK_STATUSES)[number];
}

import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export const TASK_STATUSES = [
  "todo",
  "in-progress",
  "on-hold",
  "done"
] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  houseId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  project!: string;

  @IsString()
  @MinLength(1)
  assigneeId!: string;

  @IsString()
  @MinLength(1)
  dueDate!: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority?: (typeof TASK_PRIORITIES)[number];

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: (typeof TASK_STATUSES)[number];
}

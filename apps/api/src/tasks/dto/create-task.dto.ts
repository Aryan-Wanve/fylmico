import { IsString, MinLength } from "class-validator";

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
  role!: string;

  @IsString()
  @MinLength(1)
  dueDate!: string;
}
